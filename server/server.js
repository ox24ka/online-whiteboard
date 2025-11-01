const express = require('express');
const { WebSocketServer } = require('ws');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ status: 'WebSocket server is running' });
});

const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// WebSocket server
const wss = new WebSocketServer({ server });

// Store connected clients
const clients = new Set();

// Store drawing history
let drawingHistory = [];
const MAX_HISTORY = 10000; // Limit history size

wss.on('connection', (ws) => {
  console.log('New client connected');
  clients.add(ws);

  // Send drawing history to new client
  ws.send(JSON.stringify({
    type: 'init',
    data: drawingHistory
  }));

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);

      // Handle different message types
      switch(data.type) {
        case 'draw':
          // Store in history
          drawingHistory.push(data);
          if (drawingHistory.length > MAX_HISTORY) {
            drawingHistory = drawingHistory.slice(-MAX_HISTORY);
          }

          // Broadcast to all other clients
          clients.forEach(client => {
            if (client !== ws && client.readyState === 1) {
              client.send(JSON.stringify(data));
            }
          });
          break;

        case 'clear':
          // Clear history
          drawingHistory = [];

          // Broadcast clear to all other clients
          clients.forEach(client => {
            if (client !== ws && client.readyState === 1) {
              client.send(JSON.stringify(data));
            }
          });
          break;
      }
    } catch (error) {
      console.error('Error parsing message:', error);
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
    clients.delete(ws);
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
    clients.delete(ws);
  });
});

console.log('WebSocket server initialized');
