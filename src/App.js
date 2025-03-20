import React, { useState } from 'react';
import axios from 'axios';
import './index.css'; // 스타일 파일을 불러옵니다

function App() {
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleQuestionChange = (event) => {
    setQuestion(event.target.value);
  };

  const handleSubmit = async () => {
    if (!question.trim()) {
      alert("질문을 입력해주세요.");
      return;
    }

    if (loading) return;

    // 새로운 메시지를 추가 (사용자 질문)
    const newMessage = { role: 'user', text: question };
    setMessages((prevMessages) => [...prevMessages, newMessage]);

    setLoading(true);
    setError('');
    setQuestion('');

    setTimeout(() => setQuestion(''), 0);

    try {
      const response = await axios.post('http://localhost:8000/ask', {
        question: question
      });
      const answer = response.data.answer;

      // 서버 응답 추가
      const newAnswer = { role: 'system', text: answer };
      setMessages((prevMessages) => [...prevMessages, newAnswer]); // 사용자 메시지는 이미 추가했으므로 응답만 추가
    } catch (err) {
      setError('서버와의 통신에 문제가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey && !loading) {
      event.preventDefault(); // 기본 Enter 동작 방지 (줄 바꿈 방지)
      handleSubmit(); // Enter 키가 눌렸을 때 handleSubmit 호출
    }
  };

  const formatMessage = (text) => {
    // URL을 감지하는 정규식
    const urlRegex = /(https?:\/\/[^\s]+)/g;

    return text.split(urlRegex).map((part, index) => {
      // URL이면 <a> 태그로 변환
      if (part.match(urlRegex)) {
        return (
            <a key={index} href={part} target="_blank" rel="noopener noreferrer" style={{ color: "blue", textDecoration: "underline" }}>
              {part}
            </a>
        );
      }
      return part;
    });
  };

  return (
      <div className="App">
        <h1>SAMI</h1>
        <div className="chat-container">
          {/* 메시지 출력 */}
          {messages.map((message, index) => (
              <div key={index} className={`message ${message.role}`}>
                <strong>{message.role === 'user' ? '나' : 'SAMI'}:</strong> {formatMessage(message.text)}
              </div>
          ))}
        </div>
        <div className="container">
        <textarea
            value={question}
            onChange={handleQuestionChange}
            onKeyDown={handleKeyDown}  // Enter 키 입력 감지
            placeholder="여기에 질문을 입력하세요..."
            rows="3"
        />
        </div>

        {error && <p style={{ color: 'red' }}>{error}</p>}
      </div>
  );
}

export default App;

