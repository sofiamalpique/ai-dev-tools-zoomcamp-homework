import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'node:http';
import express from 'express';
import cors from 'cors';
import { nanoid } from 'nanoid';
import { WebSocketServer, WebSocket } from 'ws';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 4000;
const CLIENT_DIST = process.env.CLIENT_DIST || path.resolve(__dirname, '../../client/dist');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.post('/api/session', (_req, res) => {
  const roomId = nanoid(10);
  res.json({ roomId });
});

const server = createServer(app);

server.on('upgrade', (req) => {
  console.log(`HTTP upgrade for ${req.url}`);
});

const rooms = new Map();

const getRoom = (roomId) => {
  if (!rooms.has(roomId)) {
    rooms.set(roomId, { code: '', clients: new Set() });
  }
  return rooms.get(roomId);
};

const broadcastToRoom = (roomId, payload, skipSocket) => {
  const room = rooms.get(roomId);
  if (!room) return;
  const message = JSON.stringify(payload);
  room.clients.forEach((client) => {
    if (client === skipSocket) return;
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
};

const wss = new WebSocketServer({ server });
wss.on('connection', (ws, req) => {
  console.log(`Incoming WS request: ${req.url}`);
  const url = new URL(req.url, `http://${req.headers.host}`);
  if (!url.pathname.startsWith('/yjs')) {
    ws.close(1008, 'Invalid websocket path');
    return;
  }
  const { searchParams } = url;
  let roomId = searchParams.get('room');

  if (!roomId) {
    const parts = url.pathname.split('/').filter(Boolean);
    roomId = parts.length > 1 ? parts[parts.length - 1] : null;
  }

  if (!roomId) {
    ws.close(1008, 'Missing room id');
    return;
  }

  const room = getRoom(roomId);
  room.clients.add(ws);
  console.log(`WS connected to room ${roomId} (clients: ${room.clients.size})`);

  ws.send(JSON.stringify({ type: 'init', code: room.code || '' }));

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message.toString());
      if (data.type === 'code' && typeof data.code === 'string') {
        room.code = data.code;
        broadcastToRoom(roomId, { type: 'code', code: data.code }, ws);
      }
    } catch (err) {
      console.error('WS message error', err);
    }
  });

  ws.on('close', () => {
    room.clients.delete(ws);
    if (room.clients.size === 0) {
      rooms.delete(roomId);
    }
    console.log(`WS disconnected from room ${roomId} (clients: ${room.clients.size})`);
  });
});

// Serve static client build in production
app.use(express.static(CLIENT_DIST));
app.use((req, res, next) => {
  if (req.method !== 'GET') return next();
  if (req.path.startsWith('/api') || req.path.startsWith('/yjs')) return next();
  const indexPath = path.join(CLIENT_DIST, 'index.html');
  if (!fs.existsSync(indexPath)) {
    return res.status(404).send('Client build not found. Run the client build first.');
  }
  res.sendFile(indexPath);
});

server.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
