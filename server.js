import { createServer } from 'http';
import { Server } from 'socket.io';
import next from 'next';
import fs from 'fs';
import path from 'path';

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    handle(req, res);
  });

  const io = new Server(server);
  const roomCreationTimes = {};

  io.on('connection', (socket) => {
    console.log('a user connected');

    socket.on('joinRoom', (room) => {
      if (!roomCreationTimes[room]) {
        roomCreationTimes[room] = new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
      }
      socket.join(room);
      console.log(`User joined room: ${room}`);
    });

    socket.on('message', ({ room, msg }) => {
      const timestamp = new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
      const messageWithTime = { ...msg, timestamp };
      io.to(room).emit('message', messageWithTime);
      saveMessage(room, messageWithTime);
    });

    socket.on('disconnect', () => {
      console.log('user disconnected');
    });
  });

  server.listen(3000, (err) => {
    if (err) throw err;
    console.log('Server running on http://localhost:3000');
  });
});

function saveMessage(room, msg) {
  const date = new Date().toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }).split('/').reverse().join('-');
  const dir = path.join('./logs', date);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  const logFile = path.join(dir, `${room}.txt`);
  const logMsg = `${msg.timestamp} - ${msg.sender}: ${msg.text}\n`;
  fs.appendFileSync(logFile, logMsg, 'utf8');
}
