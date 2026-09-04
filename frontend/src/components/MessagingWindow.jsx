// Messaging Window Component
// Phase 3: Real-time messaging interface with WebSockets

import React, { useState, useEffect } from 'react';

function MessagingWindow({ conversation }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  const handleSendMessage = (e) => {
    e.preventDefault();
    // TODO: Send message via GraphQL mutation
    console.log('Send message:', input);
    setInput('');
  };

  return (
    <div className="messaging-window">
      <div className="messages">
        {messages.map((msg) => (
          <div key={msg.id} className="message">
            <p>{msg.content}</p>
          </div>
        ))}
      </div>
      <form onSubmit={handleSendMessage}>
        <input
          type="text"
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}

export default MessagingWindow;
