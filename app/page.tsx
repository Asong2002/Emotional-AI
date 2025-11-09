'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';

interface Message {
  sender: 'user' | 'bot';
  content: string;
  shouldBlush?: boolean;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([
    { sender: 'bot', content: 'Hello! I am Arin, nice to meet you' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const checkBlush = (text: string): boolean => {
    return text.includes('～') || text.includes('~');
  };

  const sendMessage = async () => {
    const msg = inputValue.trim();
    if (!msg || isLoading) return;

    // 添加用户消息
    setMessages((prev: Message[]) => [...prev, { sender: 'user', content: msg }]);
    setInputValue('');
    setIsLoading(true);

    // 显示typing指示器
    setMessages((prev: Message[]) => [...prev, { sender: 'bot', content: 'Typing...' }]);

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
      setMessages((prev: Message[]) => prev.filter((m: Message, i: number) => !(m.sender === 'bot' && m.content === 'Typing...' && i === prev.length - 1)));

      if (data.success) {
        const reply = data.response || 'Sorry, I cannot respond at the moment.';
        const shouldBlush = checkBlush(reply);
        setMessages((prev: Message[]) => [...prev, { sender: 'bot', content: reply, shouldBlush }]);
      } else {
        setMessages((prev: Message[]) => [...prev, { 
          sender: 'bot', 
          content: 'Connection error: Unable to reach the server. Please check your network connection and try again.' 
        }]);
      }
    } catch (error: unknown) {
      // 移除typing指示器
      setMessages((prev: Message[]) => prev.filter((m: Message, i: number) => !(m.sender === 'bot' && m.content === 'Typing...' && i === prev.length - 1)));
      
      console.error('Error sending message:', error);
      setMessages((prev: Message[]) => [...prev, { 
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

  // 找到最新的非"Typing..."的bot消息索引
  const latestBotMessageIndex = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      const msg = messages[i];
      if (msg.sender === 'bot' && msg.content !== 'Typing...') {
        return i;
      }
    }
    return -1;
  }, [messages]);

  return (
    <main style={{ padding: '20px', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="chat-container">
        <div className="header">
          <div className="name">Arin</div>
        </div>
        <div className="messages">
          {messages.map((msg: Message, index: number) => {
            // 只有最新的bot消息且包含～或~时才显示脸红
            const isLatestBotMessage = msg.sender === 'bot' && 
              index === latestBotMessageIndex && 
              msg.shouldBlush;
            
            return (
              <div key={index} className={`message-wrapper ${msg.sender}-message-wrapper`}>
                {msg.sender === 'bot' && (
                  <div className={`message-avatar ${isLatestBotMessage ? 'blush' : ''}`}>
                    <img src="/robot-avatar.svg" alt="Arin" className="avatar-img" />
                  </div>
                )}
                <div className={`message ${msg.sender}-message`}>
                  {msg.content}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
        <div className="input-container">
          <input
            type="text"
            className="input-field"
            value={inputValue}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInputValue(e.target.value)}
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

