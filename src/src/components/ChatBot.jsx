import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './ChatBot.css';

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

const ChatBot = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Hi! How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [listening, setListening] = useState(false);
  const [loading, setLoading] = useState(false);
  const [minimized, setMinimized] = useState(true);
  const recognitionRef = useRef(null);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMessage = input;
    setMessages([...messages, { sender: 'user', text: userMessage }]);
    setInput('');
    setLoading(true);

    try {
      // Simple mock response for now - replace with actual API call when needed
      setTimeout(() => {
        const responses = [
          "I'm here to help you with your urban mobility needs!",
          "Would you like help with route planning or emergency services?",
          "I can assist you with finding the best routes and transportation options.",
          "Feel free to ask me about traffic conditions or emergency assistance!"
        ];
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        setMessages(msgs => [...msgs, { sender: 'bot', text: randomResponse }]);
        setLoading(false);
      }, 1000);
    } catch (err) {
      setMessages(msgs => [...msgs, { sender: 'bot', text: 'Sorry, there was an error. Please try again.' }]);
      setLoading(false);
    }
  };

  const handleVoice = () => {
    if (!SpeechRecognition) {
      alert('Voice recognition not supported in this browser.');
      return;
    }
    if (!recognitionRef.current) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';
      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setListening(false);
      };
      recognitionRef.current.onend = () => setListening(false);
    }
    setListening(true);
    recognitionRef.current.start();
  };

  if (minimized) {
    return (
      <div className="chatbot-minimized" onClick={() => setMinimized(false)} title="Open Chatbot">
        <span role="img" aria-label="chatbot" style={{fontSize: '2rem', cursor: 'pointer'}}>💬</span>
      </div>
    );
  }

  return (
    <div className="chatbot-container">
      <div className="chatbot-header">
        AI Road Buddy
        <button className="chatbot-minimize-btn" onClick={() => setMinimized(true)} title="Minimize Chatbot">-</button>
      </div>
      <div className="chatbot-messages">
        {messages.map((msg, idx) => (
          <div key={idx} className={msg.sender === 'bot' ? 'bot-msg' : 'user-msg'}>
            {msg.text}
          </div>
        ))}
        {loading && <div className="bot-msg">Thinking...</div>}
      </div>
      <div className="chatbot-input-area">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Type or use voice..."
        />
        <button onClick={handleSend} disabled={loading}>Send</button>
        <button onClick={handleVoice} className={listening ? 'listening' : ''}>
          {listening ? 'Listening...' : '🎤'}
        </button>
      </div>
    </div>
  );
};

export default ChatBot;
