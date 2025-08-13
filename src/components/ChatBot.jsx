import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './ChatBot.css';
import { config } from '../config/config';
import { IoMdHeadset } from "react-icons/io";
 
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
      // Gemini API call
      const apiKey = config.GEMINI_API_KEY;
      const prompt = `${userMessage}\n\nPlease answer in a minimum of 2 lines and a maximum of 4 lines.`;
      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent?key=' + apiKey, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      });
      if (!response.ok) throw new Error('API error');
      const data = await response.json();
      let answer = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I could not find an answer.';
      // Ensure 2-4 lines
      let lines = answer.split(/\r?\n/).filter(Boolean);
      if (lines.length < 2) answer += '\n' + answer;
      if (lines.length > 4) answer = lines.slice(0, 4).join('\n');
      setMessages(msgs => [...msgs, { sender: 'bot', text: answer }]);
      setLoading(false);
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
          {listening ? <IoMdHeadset className='listening-icon'/> : '🎤'}
        </button>
      </div>
    </div>
  );
};
 
export default ChatBot;