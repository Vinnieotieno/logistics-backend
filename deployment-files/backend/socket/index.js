// server/socket/index.js
const socketIO = require('socket.io');
const jwt = require('jsonwebtoken');
const { 
  ChatMessage, 
  ChatRoom, 
  ChatRoomMember, 
  User 
} = require('../models');

const initializeSocket = (server) => {
  const io = socketIO(server, {
    cors: {
      origin: [
        'http://localhost:5173',
        'http://localhost:3000',
        'https://globeflight.co.ke'
      ],
      credentials: true
    }
  });

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error'));
      }
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findByPk(decoded.id, {
        attributes: ['id', 'fullName', 'email', 'avatarUrl', 'role']
      });
      if (!user || !user.isActive) {
        return next(new Error('User not found or inactive'));
      }
      socket.userId = user.id;
      socket.user = user;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', async (socket) => {
    // Join all rooms the user is a member of
    const userRooms = await ChatRoomMember.findAll({
      where: { staffId: socket.userId },
      attributes: ['roomId']
    });
    userRooms.forEach(room => {
      socket.join(`room:${room.roomId}`);
    });

    // Join personal room for direct messages
    socket.join(`user:${socket.userId}`);

    // Typing indicator
    socket.on('typing:start', ({ roomId }) => {
      socket.to(`room:${roomId}`).emit('user:typing', {
        roomId,
        user: {
          id: socket.userId,
          name: socket.user.fullName
        }
      });
    });
    socket.on('typing:stop', ({ roomId }) => {
      socket.to(`room:${roomId}`).emit('user:stopped:typing', {
        roomId,
        userId: socket.userId
      });
    });

    // Join chat room
    socket.on('join:room', async (roomId) => {
      const isMember = await ChatRoomMember.findOne({
        where: { roomId, staffId: socket.userId }
      });
      if (isMember) {
        socket.join(`room:${roomId}`);
        socket.emit('joined:room', { roomId });
      } else {
        socket.emit('error', { message: 'Not a member of this room' });
      }
    });

    // Send message (text, file, image)
    socket.on('send:message', async (data) => {
      try {
        const { roomId, message, messageType = 'text', replyToId } = data;
        const isMember = await ChatRoomMember.findOne({
          where: { roomId, staffId: socket.userId }
        });
        if (!isMember) {
          return socket.emit('error', { message: 'Not a member of this room' });
        }
        const newMessage = await ChatMessage.create({
          roomId,
          senderId: socket.userId,
          message,
          messageType,
          replyToId
        });
        const fullMessage = await ChatMessage.findByPk(newMessage.id, {
          include: [
            {
              model: User,
              as: 'sender',
              attributes: ['id', 'fullName', 'email', 'avatarUrl']
            },
            {
              model: ChatMessage,
              as: 'replyTo',
              include: [{
                model: User,
                as: 'sender',
                attributes: ['id', 'fullName']
              }]
            }
          ]
        });
        io.to(`room:${roomId}`).emit('new:message', {
          roomId,
          message: fullMessage
        });
        // Update last message timestamp for the room
        await ChatRoom.update(
          { updatedAt: new Date() },
          { where: { id: roomId } }
        );
      } catch (error) {
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Mark all messages as read in a room
    socket.on('read:room', async (roomId) => {
      // Find all unread messages for this user in the room
      const messages = await ChatMessage.findAll({
        where: {
          roomId,
          isDeleted: false
        }
      });
      for (const msg of messages) {
        // Emit read event for each message (except own messages)
        if (msg.senderId !== socket.userId) {
          io.to(`room:${roomId}`).emit('message:read', {
            messageId: msg.id,
            userId: socket.userId
          });
        }
      }
      await ChatRoomMember.update(
        { lastReadAt: new Date() },
        { where: { roomId, staffId: socket.userId } }
      );
    });

    // Message deletion (sender only)
    socket.on('delete:message', async (messageId) => {
      const message = await ChatMessage.findByPk(messageId);
      if (!message) return socket.emit('error', { message: 'Message not found' });
      if (message.senderId !== socket.userId) return socket.emit('error', { message: 'Not authorized' });
      await message.update({ isDeleted: true });
      io.to(`room:${message.roomId}`).emit('message:deleted', {
        roomId: message.roomId,
        messageId
      });
    });

    // Message editing
    socket.on('edit:message', async (data) => {
      const { messageId, newMessage } = data;
      const message = await ChatMessage.findByPk(messageId);
      if (!message) return socket.emit('error', { message: 'Message not found' });
      if (message.senderId !== socket.userId) return socket.emit('error', { message: 'Not authorized' });
      await message.update({ 
        message: newMessage,
        isEdited: true 
      });
      io.to(`room:${message.roomId}`).emit('message:edited', {
        roomId: message.roomId,
        messageId,
        newMessage,
        editedAt: new Date()
      });
    });

    // Online status
    socket.on('update:status', async (status) => {
      socket.broadcast.emit('user:status:changed', {
        userId: socket.userId,
        status
      });
    });

    // Disconnect
    socket.on('disconnect', () => {
      socket.broadcast.emit('user:status:changed', {
        userId: socket.userId,
        status: 'offline'
      });
    });
  });

  return io;
};

module.exports = initializeSocket;