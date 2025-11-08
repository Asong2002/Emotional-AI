'use client';

import { useState, useRef, useEffect } from 'react';

interface Message {
  sender: 'user' | 'bot';
  content: string;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([
    { sender: 'bot', content: 'Hello! I am Arin, nice to meet you' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [blushActive, setBlushActive] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const avatarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const checkBlush = (text: string) => {
    if (text.includes('～') || text.includes('~')) {
      triggerBlush();
    }
  };

  const triggerBlush = () => {
    setBlushActive(true);
    setTimeout(() => {
      setBlushActive(false);
    }, 2500);
  };

  const sendMessage = async () => {
    const msg = inputValue.trim();
    if (!msg || isLoading) return;

    // 添加用户消息
    setMessages(prev => [...prev, { sender: 'user', content: msg }]);
    setInputValue('');
    setIsLoading(true);

    // 显示typing指示器
    setMessages(prev => [...prev, { sender: 'bot', content: 'Typing...' }]);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: msg }),
      });

      const data = await response.json();

      // 移除typing指示器
      setMessages(prev => prev.filter((m, i) => !(m.sender === 'bot' && m.content === 'Typing...' && i === prev.length - 1)));

      if (data.success) {
        const reply = data.response || 'Sorry, I cannot respond at the moment.';
        setMessages(prev => [...prev, { sender: 'bot', content: reply }]);
        checkBlush(reply);
      } else {
        setMessages(prev => [...prev, { 
          sender: 'bot', 
          content: 'Connection error: Unable to reach the server. Please check your network connection and try again.' 
        }]);
      }
    } catch (error: any) {
      // 移除typing指示器
      setMessages(prev => prev.filter((m, i) => !(m.sender === 'bot' && m.content === 'Typing...' && i === prev.length - 1)));
      
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, { 
        sender: 'bot', 
        content: 'Connection error: Unable to reach the server. Please check your network connection and try again.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <main style={{ padding: '20px', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="chat-container">
        <div className="header">
          <div className="avatar-container">
            <div 
              ref={avatarRef}
              className={`avatar ${blushActive ? 'blush' : ''}`}
            >
              <svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
                <path d="M771.413 155.307c-17.067-27.307-18.773-63.147-1.707-92.16 23.893-40.96 78.507-56.32 119.467-32.427 27.307 15.36 44.373 44.373 44.373 76.8s-17.067 61.44-44.373 76.8c-15.36 8.533-30.72 11.947-47.787 11.947L785.067 293.547c105.813 85.333 174.08 215.04 174.08 361.813v174.08c0 98.987-78.507 177.493-177.493 177.493H211.627C114.347 1006.933 34.133 926.72 34.133 829.44V653.653c0-151.893 73.387-286.72 186.027-370.347l-51.2-88.747c-34.133 3.413-66.56-11.947-85.333-42.667-23.893-42.667-10.24-97.28 32.427-121.173 25.6-23.893 70.613-10.24 92.507 12.16 17.067 29.013 15.36 61.44 0 88.747l51.2 90.453c63.147-30.72 133.12-49.493 208.213-49.493 80.213 0 155.307 20.48 221.867 56.32l52.907-93.867zM646.827 604.16c-23.893 0-44.373-20.48-44.373-44.373v-44.374c0-23.893 20.48-44.373 44.373-44.373 23.893 0 44.373 20.48 44.373 44.373v44.374c0 23.893-20.48 44.373-44.373 44.373zM348.16 604.16c-23.893 0-44.373-20.48-44.373-44.373v-44.374c0-23.893 20.48-44.373 44.373-44.373 23.893 0 44.373 20.48 44.373 44.373v44.374c0 23.893-20.48 44.373-44.373 44.373zM496.64 273.067c-211.627 0-382.293 172.373-382.293 382.293v180.907c0 49.493 40.96 90.453 90.453 90.453h587.093c49.493 0 90.453-40.96 90.453-90.453v-180.907c0-35.84-5.12-71.68-15.36-105.813-80.213-142.507-227-260.267-402.827-260.267zM648.533 733.867c-27.307 59.733-85.333 98.987-151.893 98.986-66.56 0-124.587-40.96-151.893-100.693-1.707-3.413-3.413-8.533-3.413-13.653 0-17.067 11.947-29.013 29.013-29.014 10.24 0 20.48 6.827 25.6 17.067 17.067 40.96 56.32 68.267 100.693 68.267 44.373 0 83.627-27.307 100.693-68.267 5.12-10.24 13.653-17.067 25.6-17.067 15.36 0 29.013 13.653 29.013 29.014 0 5.12-1.707 10.24-3.413 15.36z" fill="#ffffff"></path>
              </svg>
            </div>
          </div>
          <div className="name">Arin</div>
        </div>
        <div className="messages">
          {messages.map((msg, index) => (
            <div key={index} className={`message ${msg.sender}-message`}>
              {msg.content}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        <div className="input-container">
          <input
            type="text"
            className="input-field"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            disabled={isLoading}
            autoComplete="off"
          />
          <button
            className="send-button"
            onClick={sendMessage}
            disabled={isLoading || !inputValue.trim()}
          >
            →
          </button>
        </div>
      </div>
    </main>
  );
}

