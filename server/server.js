require('dotenv').config();
// Ensure this file starts your backend server and Socket.IO correctly.

const http = require('http');
const path = require('path');
const app = require('./app');
const initializeSocket = require('./socket');
const PORT = process.env.PORT || 5000;

// Create HTTP server from Express app
const server = http.createServer(app);

// Initialize Socket.IO and attach to HTTP server
const io = initializeSocket(server);
app.set('io', io);

// Serve frontend for all unknown GET routes (for React Router SPA support)
app.use((req, res, next) => {
  if (
    req.method === 'GET' &&
    !req.path.startsWith('/api') &&
    !req.path.startsWith('/uploads') &&
    !req.path.startsWith('/socket.io')
  ) {
    res.sendFile(path.join(__dirname, '../admin-dashboard/build/index.html'));
  } else {
    next();
  }
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});