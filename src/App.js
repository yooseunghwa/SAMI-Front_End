import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import './App.css';
import Header from './components/Header';
import { FiSend } from 'react-icons/fi';

function App() {
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingDots, setLoadingDots] = useState('');
  const [error, setError] = useState('');
  const chatContainerRef = useRef(null);

  useEffect(() => {
    document.title = "상명대학교 챗봇 SAMI";
  }, []);

  const handleQuestionChange = (e) => setQuestion(e.target.value);

  const handleSubmit = async () => {
    if (!question.trim()) {
      alert("질문을 입력해주세요.");
      return;
    }
    if (loading) return;

    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMessage = { role: 'user', text: question, timestamp: now };
    const loadingMessage = { role: 'system', text: 'SAMI_LOADING', timestamp: '' };

    setMessages((prev) => [...prev, userMessage, loadingMessage]);
    setLoading(true);
    setError('');
    setQuestion('');

    try {
      const response = await axios.post('http://localhost:8000/ask', { question });
      const answer = response.data.answer;
      const botNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const botMessage = { role: 'system', text: answer, timestamp: botNow };

      setMessages((prev) => [...prev.slice(0, -1), botMessage]);
    } catch (err) {
      setError('서버와의 통신에 문제가 발생했습니다.');
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !loading) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const formatMessage = (text) => {
    const urlRegex = /(https?:\/\/[^\s)]+)/g;
    return text.split(urlRegex).map((part, index) => {
      if (part.match(/^https?:\/\//)) {
        return (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'blue', textDecoration: 'underline' }}
          >
            {part}
          </a>
        );
      }
      return part;
    });
  };

  useEffect(() => {
    if (!loading) {
      setLoadingDots('');
      return;
    }
    const interval = setInterval(() => {
      setLoadingDots((prev) => (prev.length >= 3 ? '' : prev + '.'));
    }, 500);
    return () => clearInterval(interval);
  }, [loading]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages]);

  return (
    <div className="App">
      <Header />
      <div className="chat-wrapper">
        <div className="chat-container" ref={chatContainerRef}>
          {messages.map((message, index) => (
            <div key={index} className={`message-wrapper ${message.role}`}>
              <div className={`message ${message.role}${message.text === 'SAMI_LOADING' ? ' loading' : ''}`}>
                {message.text === 'SAMI_LOADING'
                  ? `SAMI가 답변 생성 중입니다${loadingDots}`
                  : formatMessage(message.text)}
              </div>
              {message.timestamp && (
                <div className={`timestamp ${message.role}`}>{message.timestamp}</div>
              )}
            </div>
          ))}
          {error && <div className="error-wrapper">{error}</div>}
        </div>

        <div className="input-wrapper">
          <textarea
            value={question}
            onChange={handleQuestionChange}
            onKeyDown={handleKeyDown}
            placeholder="무엇이든 물어보세요"
            rows="2"
          />
          <button className="send-button" onClick={handleSubmit}>
            <FiSend />
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
