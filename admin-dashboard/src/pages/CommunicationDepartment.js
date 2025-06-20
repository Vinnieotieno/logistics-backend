// pages/CommunicationDepartment.js
import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  Button,
  IconButton,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  Tabs,
  Tab,
  Badge,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  CircularProgress,
  Divider,
  Card,
  CardContent,
  FormControlLabel,
  Checkbox,
  Radio,
  RadioGroup,
  Tooltip,
  InputAdornment,
  Menu
} from '@mui/material';
import {
  Send as SendIcon,
  Announcement,
  Chat,
  Poll,
  NotificationsActive,
  Email,
  AttachFile,
  EmojiEmotions,
  Edit,
  Delete,
  Reply,
  MoreVert,
  Check,
  Schedule,
  Group,
  Person,
  ThumbUp,
  Favorite,
  SentimentVerySatisfied,
  SentimentDissatisfied,
  Create,
  Feedback,
  Warning,
  Info
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import axios from 'axios';
import io from 'socket.io-client';
import { format, formatDistanceToNow, isValid, parseISO } from 'date-fns';
import { useLocation } from 'react-router-dom';

const StyledPaper = styled(Paper)(({ theme }) => ({
  borderRadius: '16px',
  background: 'linear-gradient(145deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(134, 197, 23, 0.1)',
  boxShadow: '0 8px 32px rgba(134, 197, 23, 0.08)',
  overflow: 'hidden'
}));

const MessageBubble = styled(Box)(({ theme, isOwn }) => ({
  maxWidth: '70%',
  padding: theme.spacing(1.5, 2),
  borderRadius: '16px',
  marginBottom: theme.spacing(1),
  background: isOwn
    ? 'linear-gradient(135deg, #86c517 0%, #68a80d 100%)'
    : '#f0f2f5',
  color: isOwn ? 'white' : 'inherit',
  alignSelf: isOwn ? 'flex-end' : 'flex-start',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  position: 'relative',
  wordBreak: 'break-word'
}));

const TabPanel = ({ children, value, index }) => (
  <Box hidden={value !== index} sx={{ height: '100%' }}>
    {value === index && children}
  </Box>
);

const CommunicationDepartment = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [socket, setSocket] = useState(null);
  const user = JSON.parse(localStorage.getItem('user'));
  const isAdmin = ['admin', 'superadmin', 'management'].includes(user?.role);

  // Team Messages State
  const [teamMessages, setTeamMessages] = useState([]);
  const [messageDialog, setMessageDialog] = useState(false);
  const [messageForm, setMessageForm] = useState({
    title: '',
    content: '',
    priority: 'normal',
    department: [],
    sendEmail: false,
    targetEmails: [],
    ccEmails: [],
    attachments: []
  });
  const [attachmentFiles, setAttachmentFiles] = useState([]);

  // Chat State
  const [chatRooms, setChatRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [typing, setTyping] = useState({});
  const [onlineUsers, setOnlineUsers] = useState({});
  const [roomDialog, setRoomDialog] = useState(false);
  const [roomForm, setRoomForm] = useState({
    name: '',
    description: '',
    type: 'group',
    memberIds: []
  });
  const [messageReads, setMessageReads] = useState({}); // { messageId: [userId, ...] }
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Survey State
  const [surveys, setSurveys] = useState([]);
  const [surveyDialog, setSurveyDialog] = useState(false);
  const [responseDialog, setResponseDialog] = useState(false);
  const [selectedSurvey, setSelectedSurvey] = useState(null);
  const [surveyForm, setSurveyForm] = useState({
    title: '',
    description: '',
    closesAt: '',
    anonymousOnly: true
  });
  const [surveyResponse, setSurveyResponse] = useState({
    responseText: '',
    sentiment: 'neutral',
    category: ''
  });

  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = parseInt(params.get('tab'), 10);
    if (!isNaN(tab)) setActiveTab(tab);
  }, [location.search]);

  useEffect(() => {
    initializeSocket();
    fetchInitialData();

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const initializeSocket = () => {
    const token = localStorage.getItem('token');
    const newSocket = io(process.env.REACT_APP_API_URL || 'http://localhost:5000', {
      auth: { token }
    });

    newSocket.on('connect', () => {
      console.log('Connected to chat server');
      newSocket.emit('update:status', 'online');
    });

    newSocket.on('new:message', ({ roomId, message }) => {
      if (roomId === selectedRoom?.id) {
        setChatMessages(prev => [...prev, message]);
      }
      // Update room's last message
      setChatRooms(prev => prev.map(room => 
        room.id === roomId 
          ? { ...room, lastMessage: message, unreadCount: room.id === selectedRoom?.id ? 0 : (room.unreadCount || 0) + 1 }
          : room
      ));
    });

    newSocket.on('user:typing', ({ roomId, user }) => {
      if (roomId === selectedRoom?.id) {
        setTyping(prev => ({ ...prev, [user.id]: user.name }));
      }
    });

    newSocket.on('user:stopped:typing', ({ roomId, userId }) => {
      setTyping(prev => {
        const newTyping = { ...prev };
        delete newTyping[userId];
        return newTyping;
      });
    });

    newSocket.on('user:status:changed', ({ userId, status }) => {
      setOnlineUsers(prev => ({ ...prev, [userId]: status }));
    });

    newSocket.on('message:deleted', ({ roomId, messageId }) => {
      if (roomId === selectedRoom?.id) {
        setChatMessages(prev => prev.map(msg => 
          msg.id === messageId ? { ...msg, isDeleted: true } : msg
        ));
      }
    });

    newSocket.on('message:edited', ({ roomId, messageId, newMessage, editedAt }) => {
      if (roomId === selectedRoom?.id) {
        setChatMessages(prev => prev.map(msg => 
          msg.id === messageId ? { ...msg, message: newMessage, isEdited: true, updatedAt: editedAt } : msg
        ));
      }
    });

    newSocket.on('message:read', ({ messageId, userId }) => {
      setMessageReads(prev => ({
        ...prev,
        [messageId]: [...(prev[messageId] || []), userId]
      }));
    });

    setSocket(newSocket);
  };

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchTeamMessages(),
        fetchChatRooms(),
        fetchSurveys()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Team Messages Functions
  const fetchTeamMessages = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/communication/messages', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTeamMessages(response.data.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleCreateMessage = async () => {
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      Object.entries(messageForm).forEach(([key, value]) => {
        if (
          (Array.isArray(value) && value.length > 0) ||
          (!Array.isArray(value) && value !== undefined && value !== null && value !== '')
        ) {
          if (Array.isArray(value)) {
            value.forEach(v => formData.append(key, v));
          } else {
            formData.append(key, value);
          }
        }
      });
      if (attachmentFiles.length > 0) {
        attachmentFiles.forEach(file => {
          formData.append('attachments', file);
        });
      }
      await axios.post('/api/communication/messages', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      setMessageDialog(false);
      setMessageForm({
        title: '',
        content: '',
        priority: 'normal',
        department: [],
        sendEmail: false,
        targetEmails: [],
        ccEmails: [],
        attachments: []
      });
      setAttachmentFiles([]);
      fetchTeamMessages();
    } catch (error) {
      console.error('Error creating message:', error);
    }
  };

  const markMessageAsRead = async (messageId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`/api/communication/messages/${messageId}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTeamMessages(prev => prev.map(msg => 
        msg.id === messageId ? { ...msg, isRead: true } : msg
      ));
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  // Chat Functions
  const fetchChatRooms = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/communication/chat/rooms', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setChatRooms(response.data.data);
      // Auto-select General room if not selected
      if (response.data.data.length > 0 && !selectedRoom) {
        selectChatRoom(response.data.data[0]);
      }
    } catch (error) {
      console.error('Error fetching chat rooms:', error);
    }
  };

  const fetchChatMessages = async (roomId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/communication/chat/rooms/${roomId}/messages`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Ensure messages are sorted oldest to newest
      const msgs = Array.isArray(response.data.data)
        ? response.data.data
        : [];
      setChatMessages(msgs);

      // Fetch read receipts for messages in this room
      const messageIds = msgs.map(m => m.id);
      if (messageIds.length > 0) {
        const readsRes = await axios.post('/api/communication/chat/rooms/read-receipts', { messageIds }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMessageReads(readsRes.data.data || {});
      } else {
        setMessageReads({});
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      setChatMessages([]);
      setMessageReads({});
    }
  };

  const selectChatRoom = async (room) => {
    await fetchChatMessages(room.id);
    setSelectedRoom(room);
    socket?.emit('join:room', room.id);
  };

  const sendChatMessage = () => {
    if (!newMessage.trim() || !selectedRoom) return;

    socket?.emit('send:message', {
      roomId: selectedRoom.id,
      message: newMessage,
      messageType: 'text'
    });

    setNewMessage('');
  };

  const handleTyping = () => {
    if (!selectedRoom) return;

    socket?.emit('typing:start', { roomId: selectedRoom.id });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      socket?.emit('typing:stop', { roomId: selectedRoom.id });
    }, 1000);
  };

  const createChatRoom = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/communication/chat/rooms', roomForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRoomDialog(false);
      setRoomForm({
        name: '',
        description: '',
        type: 'group',
        memberIds: []
      });
      fetchChatRooms();
    } catch (error) {
      console.error('Error creating room:', error);
    }
  };

  // Survey Functions
  const fetchSurveys = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/communication/surveys', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSurveys(response.data.data);
    } catch (error) {
      console.error('Error fetching surveys:', error);
    }
  };

  const createSurvey = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/communication/surveys', surveyForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSurveyDialog(false);
      setSurveyForm({
        title: '',
        description: '',
        closesAt: '',
        anonymousOnly: true
      });
      fetchSurveys();
    } catch (error) {
      console.error('Error creating survey:', error);
    }
  };

  const submitSurveyResponse = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `/api/communication/surveys/${selectedSurvey.id}/responses`,
        surveyResponse,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setResponseDialog(false);
      setSurveyResponse({
        responseText: '',
        sentiment: 'neutral',
        category: ''
      });
      setSelectedSurvey(null);
      fetchSurveys();
    } catch (error) {
      console.error('Error submitting response:', error);
    }
  };

  const priorityColors = {
    low: '#4caf50',
    normal: '#2196f3',
    high: '#ff9800',
    urgent: '#f44336'
  };

  const sentimentIcons = {
    positive: <SentimentVerySatisfied sx={{ color: '#4caf50' }} />,
    neutral: <EmojiEmotions sx={{ color: '#ff9800' }} />,
    negative: <SentimentDissatisfied sx={{ color: '#f44336' }} />,
    suggestion: <Create sx={{ color: '#2196f3' }} />,
    complaint: <Warning sx={{ color: '#f44336' }} />
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" sx={{ fontWeight: 800, mb: 2, color: '#2d3748' }}>
          Communication Hub
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Stay connected with your team through messages, chat, and feedback
        </Typography>
      </Box>

      <Paper sx={{ borderRadius: 2 }}>
        <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)}>
          <Tab icon={<Announcement />} label="Team Messages" iconPosition="start" />
          <Tab icon={<Chat />} label="Chat Room" iconPosition="start" />
          <Tab icon={<Poll />} label="Surveys & Feedback" iconPosition="start" />
        </Tabs>
      </Paper>

      {loading ? (
        <Box display="flex" justifyContent="center" py={8}>
          <CircularProgress />
        </Box>
      ) : (
        <Box sx={{ mt: 3 }}>
          {/* Team Messages Tab */}
          <TabPanel value={activeTab} index={0}>
            <Grid container spacing={3}>
              {isAdmin && (
                <Grid item xs={12}>
                  <Button
                    variant="contained"
                    startIcon={<Create />}
                    onClick={() => setMessageDialog(true)}
                    sx={{
                      background: 'linear-gradient(135deg, #86c517 0%, #68a80d 100%)',
                      borderRadius: '8px'
                    }}
                  >
                    Create New Message
                  </Button>
                </Grid>
              )}

              {teamMessages.map(message => (
                <Grid item xs={12} key={message.id}>
                  <StyledPaper
                    sx={{
                      p: 3,
                      cursor: 'pointer',
                      opacity: message.isRead ? 0.8 : 1,
                      '&:hover': { transform: 'translateY(-2px)' }
                    }}
                    onClick={() => !message.isRead && markMessageAsRead(message.id)}
                  >
                    <Box display="flex" justifyContent="space-between" alignItems="start">
                      <Box flex={1}>
                        <Box display="flex" alignItems="center" gap={2} mb={1}>
                          <Chip
                            label={message.priority}
                            size="small"
                            sx={{
                              backgroundColor: priorityColors[message.priority],
                              color: 'white',
                              fontWeight: 600
                            }}
                          />
                          {!message.isRead && (
                            <Chip
                              label="NEW"
                              size="small"
                              sx={{
                                backgroundColor: '#86c517',
                                color: 'white',
                                fontWeight: 600
                              }}
                            />
                          )}
                          {message.isEmailSent && (
                            <Tooltip title="Email sent">
                              <Email sx={{ color: '#86c517' }} />
                            </Tooltip>
                          )}
                        </Box>
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>
                          {message.title}
                        </Typography>
                        <Typography variant="body1" paragraph>
                          {message.content}
                        </Typography>
                        <Box display="flex" alignItems="center" gap={2}>
                          <Avatar sx={{ width: 24, height: 24 }}>
                            {message.sender?.fullName?.[0]}
                          </Avatar>
                          <Typography variant="caption" color="text.secondary">
                            {message.sender?.fullName} • {
                              message.createdAt && isValid(new Date(message.createdAt))
                                ? formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })
                                : '-'
                            }
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </StyledPaper>
                </Grid>
              ))}
            </Grid>
          </TabPanel>

          {/* Chat Room Tab */}
          <TabPanel value={activeTab} index={1}>
            <Grid container spacing={3} sx={{ height: 'calc(100vh - 300px)' }}>
              {/* Chat Rooms List */}
              <Grid item xs={12} md={3}>
                <StyledPaper sx={{ height: '100%', p: 2 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      Chat Rooms
                    </Typography>
                    <IconButton size="small" onClick={() => setRoomDialog(true)}>
                      <Create />
                    </IconButton>
                  </Box>
                  <List>
                    {chatRooms.map(room => (
                      <ListItem
                        key={room.id}
                        selected={selectedRoom?.id === room.id}
                        onClick={() => selectChatRoom(room)}
                        sx={{ borderRadius: '8px', mb: 1 }}
                        component="div"
                        style={{ cursor: 'pointer' }}
                      >
                        <ListItemAvatar>
                          <Badge badgeContent={room.unreadCount} color="error">
                            <Avatar>
                              {room.type === 'group' ? <Group /> : <Person />}
                            </Avatar>
                          </Badge>
                        </ListItemAvatar>
                        <ListItemText
                          primary={room.name}
                          secondary={room.lastMessage?.message || 'No messages yet'}
                          primaryTypographyProps={{ fontWeight: 600 }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </StyledPaper>
              </Grid>

              {/* Chat Messages */}
              <Grid item xs={12} md={9}>
                <StyledPaper sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  {selectedRoom ? (
                    <>
                      {/* Chat Header */}
                      <Box sx={{ p: 2, borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
                          {selectedRoom.name}
                        </Typography>
                        {Object.keys(typing).length > 0 && (
                          <Typography variant="caption" color="text.secondary">
                            {Object.values(typing).join(', ')} {Object.keys(typing).length === 1 ? 'is' : 'are'} typing...
                          </Typography>
                        )}
                      </Box>

                      {/* Messages Area */}
                      <Box sx={{ flex: 1, overflow: 'auto', p: 2, display: 'flex', flexDirection: 'column' }}>
                        {chatMessages.length === 0 ? (
                          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 4 }}>
                            No messages yet. Start the conversation!
                          </Typography>
                        ) : (
                          chatMessages.map((msg, index) => {
                            // Determine ticks
                            const isOwn = msg.senderId === user?.id;
                            const readers = messageReads[msg.id] || [];
                            const isReadByOthers = isOwn && readers.length > 1; // more than sender
                            return (
                              <MessageBubble
                                key={msg.id}
                                isOwn={isOwn}
                              >
                                {msg.isDeleted ? (
                                  <Typography variant="body2" sx={{ fontStyle: 'italic', opacity: 0.7 }}>
                                    This message was deleted
                                  </Typography>
                                ) : (
                                  <>
                                    {msg.replyTo && (
                                      <Box sx={{ 
                                        borderLeft: '3px solid rgba(255,255,255,0.5)', 
                                        pl: 1, 
                                        mb: 1,
                                        opacity: 0.8 
                                      }}>
                                        <Typography variant="caption">
                                          {msg.replyTo.sender.fullName}
                                        </Typography>
                                        <Typography variant="body2" noWrap>
                                          {msg.replyTo.message}
                                        </Typography>
                                      </Box>
                                    )}
                                    <Box display="flex" alignItems="center" justifyContent="space-between">
                                      <Typography variant="body2">
                                        {msg.message}
                                      </Typography>
                                      {isOwn && !msg.isDeleted && (
                                        <IconButton
                                          size="small"
                                          onClick={() => handleDeleteMessage(msg.id)}
                                          sx={{ ml: 1 }}
                                        >
                                          <Delete fontSize="small" />
                                        </IconButton>
                                      )}
                                    </Box>
                                    <Box display="flex" justifyContent="flex-end" alignItems="center" mt={1} gap={1}>
                                      <Typography variant="caption" sx={{ opacity: 0.7 }}>
                                        {format(new Date(msg.createdAt), 'HH:mm')}
                                        {msg.isEdited && ' (edited)'}
                                      </Typography>
                                      {isOwn && !msg.isDeleted && (
                                        isReadByOthers ? (
                                          // Double blue ticks
                                          <Check sx={{ color: '#2196f3', fontSize: 18, ml: 0.5 }} />
                                        ) : (
                                          // Single tick
                                          <Check sx={{ color: '#888', fontSize: 18, ml: 0.5 }} />
                                        )
                                      )}
                                    </Box>
                                  </>
                                )}
                              </MessageBubble>
                            );
                          })
                        )}
                        <div ref={messagesEndRef} />
                      </Box>

                      {/* Message Input */}
                      <Box sx={{ p: 2, borderTop: '1px solid rgba(0,0,0,0.1)' }}>
                        <TextField
                          fullWidth
                          variant="outlined"
                          placeholder="Type a message..."
                          value={newMessage}
                          onChange={(e) => {
                            setNewMessage(e.target.value);
                            handleTyping();
                          }}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              sendChatMessage();
                            }
                          }}
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton onClick={sendChatMessage}>
                                  <SendIcon />
                                </IconButton>
                              </InputAdornment>
                            )
                          }}
                          sx={{ 
                            '& .MuiOutlinedInput-root': { 
                              borderRadius: '24px' 
                            } 
                          }}
                        />
                      </Box>
                    </>
                  ) : (
                    <Box display="flex" alignItems="center" justifyContent="center" height="100%">
                      <Typography variant="h6" color="text.secondary">
                        Select a chat room to start messaging
                      </Typography>
                    </Box>
                  )}
                </StyledPaper>
              </Grid>
            </Grid>
          </TabPanel>

          {/* Surveys Tab */}
          <TabPanel value={activeTab} index={2}>
            <Grid container spacing={3}>
              {isAdmin && (
                <Grid item xs={12}>
                  <Button
                    variant="contained"
                    startIcon={<Create />}
                    onClick={() => setSurveyDialog(true)}
                    sx={{
                      background: 'linear-gradient(135deg, #86c517 0%, #68a80d 100%)',
                      borderRadius: '8px'
                    }}
                  >
                    Create New Survey
                  </Button>
                </Grid>
              )}

              {surveys.map(survey => (
                <Grid item xs={12} md={6} key={survey.id}>
                  <StyledPaper sx={{ p: 3 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                      <Box>
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>
                          {survey.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" paragraph>
                          {survey.description}
                        </Typography>
                      </Box>
                      {survey.anonymousOnly && (
                        <Chip 
                          label="Anonymous" 
                          size="small" 
                          icon={<Person />}
                          sx={{ backgroundColor: '#e3f2fd' }}
                        />
                      )}
                    </Box>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="caption" color="text.secondary">
                        {survey.responseCount} responses
                        {survey.closesAt && ` • Closes ${format(new Date(survey.closesAt), 'PPP')}`}
                      </Typography>
                      <Box>
                        {!survey.hasResponded && survey.isActive && (
                          <Button
                            size="small"
                            startIcon={<Feedback />}
                            onClick={() => {
                              setSelectedSurvey(survey);
                              setResponseDialog(true);
                            }}
                            sx={{ color: '#86c517' }}
                          >
                            Respond
                          </Button>
                        )}
                        {isAdmin && (
                          <Button
                            size="small"
                            onClick={() => window.open(`/surveys/${survey.id}/responses`, '_blank')}
                          >
                            View Responses
                          </Button>
                        )}
                      </Box>
                    </Box>
                  </StyledPaper>
                </Grid>
              ))}
            </Grid>
          </TabPanel>
        </Box>
      )}

      {/* Create Message Dialog */}
      <Dialog
        open={messageDialog}
        onClose={() => setMessageDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Create Team Message</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Title"
              value={messageForm.title}
              onChange={(e) => setMessageForm({ ...messageForm, title: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Content"
              multiline
              rows={4}
              value={messageForm.content}
              onChange={(e) => setMessageForm({ ...messageForm, content: e.target.value })}
              sx={{ mb: 2 }}
            />
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Priority</InputLabel>
              <Select
                value={messageForm.priority}
                onChange={(e) => setMessageForm({ ...messageForm, priority: e.target.value })}
                label="Priority"
              >
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="normal">Normal</MenuItem>
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="urgent">Urgent</MenuItem>
              </Select>
            </FormControl>
            <FormControlLabel
              control={
                <Checkbox
                  checked={messageForm.sendEmail}
                  onChange={(e) => setMessageForm({ ...messageForm, sendEmail: e.target.checked })}
                />
              }
              label="Send email notification (for high/urgent messages)"
            />
            <TextField
              fullWidth
              label="Target Employee Emails (comma separated)"
              value={messageForm.targetEmails.join(', ')}
              onChange={e =>
                setMessageForm({
                  ...messageForm,
                  targetEmails: e.target.value
                    .split(',')
                    .map(email => email.trim())
                    .filter(Boolean)
                })
              }
              sx={{ mb: 2 }}
              placeholder="e.g. john@example.com, jane@example.com"
            />
            <TextField
              fullWidth
              label="CC Emails (comma separated, optional)"
              value={messageForm.ccEmails.join(', ')}
              onChange={e =>
                setMessageForm({
                  ...messageForm,
                  ccEmails: e.target.value
                    .split(',')
                    .map(email => email.trim())
                    .filter(Boolean)
                })
              }
              sx={{ mb: 2 }}
              placeholder="e.g. manager@example.com"
            />
            <Button
              variant="outlined"
              component="label"
              sx={{ mb: 2 }}
            >
              Attach Files (images, documents)
              <input
                type="file"
                hidden
                multiple
                onChange={e => {
                  setAttachmentFiles(Array.from(e.target.files));
                }}
                accept="image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              />
            </Button>
            {attachmentFiles.length > 0 && (
              <Box sx={{ mb: 2 }}>
                {attachmentFiles.map((file, idx) => (
                  <Chip
                    key={idx}
                    label={file.name}
                    onDelete={() => setAttachmentFiles(attachmentFiles.filter((_, i) => i !== idx))}
                    sx={{ mr: 1, mb: 1 }}
                  />
                ))}
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMessageDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleCreateMessage} 
            variant="contained"
            sx={{ background: 'linear-gradient(135deg, #86c517 0%, #68a80d 100%)' }}
          >
            Create Message
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create Room Dialog */}
      <Dialog
        open={roomDialog}
        onClose={() => setRoomDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Create Chat Room</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Room Name"
              value={roomForm.name}
              onChange={(e) => setRoomForm({ ...roomForm, name: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Description"
              multiline
              rows={2}
              value={roomForm.description}
              onChange={(e) => setRoomForm({ ...roomForm, description: e.target.value })}
              sx={{ mb: 2 }}
            />
            <FormControl fullWidth>
              <InputLabel>Room Type</InputLabel>
              <Select
                value={roomForm.type}
                onChange={(e) => setRoomForm({ ...roomForm, type: e.target.value })}
                label="Room Type"
              >
                <MenuItem value="department">Department</MenuItem>
                <MenuItem value="group">Group</MenuItem>
                <MenuItem value="department">Department</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRoomDialog(false)}>Cancel</Button>
          <Button 
            onClick={createChatRoom} 
            variant="contained"
            sx={{ background: 'linear-gradient(135deg, #86c517 0%, #68a80d 100%)' }}
          >
            Create Room
          </Button>
        </DialogActions>
      </Dialog>

      {/* Survey Response Dialog */}
      <Dialog
        open={responseDialog}
        onClose={() => setResponseDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {selectedSurvey?.anonymousOnly && (
            <Alert severity="info" sx={{ mb: 2 }}>
              This is an anonymous survey. Your identity will not be recorded.
            </Alert>
          )}
          Submit Response: {selectedSurvey?.title}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Your Response"
              multiline
              rows={4}
              value={surveyResponse.responseText}
              onChange={(e) => setSurveyResponse({ ...surveyResponse, responseText: e.target.value })}
              sx={{ mb: 2 }}
            />
            <FormControl component="fieldset" sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                How do you feel about this?
              </Typography>
              <RadioGroup
                row
                value={surveyResponse.sentiment}
                onChange={(e) => setSurveyResponse({ ...surveyResponse, sentiment: e.target.value })}
              >
                {Object.entries(sentimentIcons).map(([value, icon]) => (
                  <FormControlLabel
                    key={value}
                    value={value}
                    control={<Radio />}
                    label={
                      <Box display="flex" alignItems="center" gap={1}>
                        {icon}
                        <Typography variant="caption">
                          {value.charAt(0).toUpperCase() + value.slice(1)}
                        </Typography>
                      </Box>
                    }
                  />
                ))}
              </RadioGroup>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResponseDialog(false)}>Cancel</Button>
          <Button 
            onClick={submitSurveyResponse} 
            variant="contained"
            sx={{ background: 'linear-gradient(135deg, #86c517 0%, #68a80d 100%)' }}
          >
            Submit Response
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create Survey Dialog */}
      <Dialog
        open={surveyDialog}
        onClose={() => setSurveyDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Create New Survey</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Survey Title"
              value={surveyForm.title}
              onChange={(e) => setSurveyForm({ ...surveyForm, title: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Description"
              multiline
              rows={3}
              value={surveyForm.description}
              onChange={(e) => setSurveyForm({ ...surveyForm, description: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Closing Date"
              type="datetime-local"
              value={surveyForm.closesAt}
              onChange={(e) => setSurveyForm({ ...surveyForm, closesAt: e.target.value })}
              sx={{ mb: 2 }}
              InputLabelProps={{ shrink: true }}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={surveyForm.anonymousOnly}
                  onChange={(e) => setSurveyForm({ ...surveyForm, anonymousOnly: e.target.checked })}
                />
              }
              label="Anonymous responses only"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSurveyDialog(false)}>Cancel</Button>
          <Button 
            onClick={createSurvey} 
            variant="contained"
            sx={{ background: 'linear-gradient(135deg, #86c517 0%, #68a80d 100%)' }}
          >
            Create Survey
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CommunicationDepartment;