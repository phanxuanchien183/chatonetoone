import { useState, useEffect } from 'react';
import io from 'socket.io-client';

const socket = io();

const rooms = ['Room1', 'Room2', 'Room3']; // Các phòng được tạo sẵn

export default function Home() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [room, setRoom] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    socket.on('message', (msg) => {
      setMessages((prevMessages) => [...prevMessages, msg]);
    });
  }, []);

  const login = () => {
    if (username && room) {
      socket.emit('joinRoom', room);
      setLoggedIn(true);
    }
  };

  const sendMessage = () => {
    const msg = { text: message, sender: username };
    socket.emit('message', { room, msg });
    setMessage('');
  };

  return (
    <div>
      {!loggedIn ? (
        <div>
          <h1>Login</h1>
          <input 
            value={username} 
            onChange={(e) => setUsername(e.target.value)} 
            placeholder="Enter your name"
          />
          <select value={room} onChange={(e) => setRoom(e.target.value)}>
            <option value="" disabled>Select a room</option>
            {rooms.map((room, index) => (
              <option key={index} value={room}>{room}</option>
            ))}
          </select>
          <button onClick={login}>Join Room</button>
        </div>
      ) : (
        <div>
          <h1>Chat Room: {room}</h1>
          <div>
            {messages.map((msg, index) => (
              <p key={index}>
               <small>({msg.timestamp})</small> <strong>{msg.sender}:</strong> {msg.text} 
              </p>
            ))}
          </div>
          <input 
            value={message} 
            onChange={(e) => setMessage(e.target.value)} 
            placeholder="Type a message"
          />
          <button onClick={sendMessage}>Send</button>
        </div>
      )}
    </div>
  );
}
