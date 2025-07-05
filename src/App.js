import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import axios from 'axios';
import './App.css';
import Header from './components/Header';
import { FiSend } from 'react-icons/fi';

const WELCOME_MESSAGE_TEXT = `안녕하세요! 저는 상명대학교 AI 챗봇 사미(SAMI: Sangmyung University AI Chatbot)에요.😊

상명대(서울캠)에 대해 궁금한 점이 있다면 무엇이든 물어보세요!

사미(SAMI)는 다음과 같은 정보를 제공해 드려요.😘

- 상명대학교 정보(학교 소개, 위치, 연락처 등)
- 각 학과별 정보(학과 사무실, 연락처, 교육과정 등)
- 교수진 정보(연구실, 전화번호, 이메일 등)
- 병무 정보(예비군, 민방위 등)
- 학사일정(수강신청, 장바구니, 입학식, 졸업식 등)
- 학적 정보(다전공, 성적, 휴복학, 제적, 전과 등)
- 학교 행정 정보(샘물, 클라우드 메일, 장학금, 등록금, 학생증, 대중교통, FAQ 등)
- 학교 시설 정보(식당, 도서관, 위치, 운영시간, 연락처 등)

+) 🏠: 대화 내용 초기화 三: 챗봇 설명, 의견 보내기

[사미(SAMI) 이용 가이드]

1. 명확하고 구체적인 질문을 작성해주세요.  
   예) 컴퓨터과학전공 강상욱 교수님 연구실이 어디야?

2. 불명확한 표현, 은어, 줄임말 사용은 최대한 지양해 주세요.  
   예) '컴과 사무실 ㅇㄷ?' 대신 '컴퓨터 과학과 사무실 위치가 어디야?'

3. 다시 한번 질문해주세요.  
   사미(SAMI)도 가끔 실수를 할 수 있어요. 😂
   그럴 땐 너무 뭐라하지 말고 한 번 더 질문해주세요.`;

const LOADING_INDICATOR = 'SAMI_LOADING';
const API_URL = 'http://localhost:8000/ask';

const getCurrentTime = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

const createMessage = (role, text, timestamp = getCurrentTime()) => ({
  role,
  text,
  timestamp
});

function App() {
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingDots, setLoadingDots] = useState('');
  const [error, setError] = useState('');
  const chatContainerRef = useRef(null);

  // 초기 환영 메시지 생성
  const initialWelcomeMessage = useMemo(() => 
    createMessage('system', WELCOME_MESSAGE_TEXT), []
  );

  // 페이지 제목 설정
  useEffect(() => {
    document.title = "상명대학교 챗봇 SAMI";
  }, []);

  // 초기 환영 메시지 설정
  useEffect(() => {
    setMessages([initialWelcomeMessage]);
  }, [initialWelcomeMessage]);

  // 로딩 애니메이션 효과
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

  // 자동 스크롤 효과
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages]);

  // 입력 변경 핸들러
  const handleQuestionChange = useCallback((e) => {
    setQuestion(e.target.value);
  }, []);

  // 메시지 포맷팅 함수
  const formatMessage = useCallback((text) => {
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
  }, []);

  // 질문 제출 핸들러
  const handleSubmit = useCallback(async () => {
    if (!question.trim()) {
      alert("질문을 입력해주세요.");
      return;
    }
    if (loading) return;

    const userMessage = createMessage('user', question);
    const loadingMessage = createMessage('system', LOADING_INDICATOR, '');

    setMessages((prev) => [...prev, userMessage, loadingMessage]);
    setLoading(true);
    setError('');
    setQuestion('');

    try {
      const response = await axios.post(API_URL, { question });
      const botMessage = createMessage('system', response.data.answer);
      
      setMessages((prev) => [...prev.slice(0, -1), botMessage]);
    } catch (err) {
      console.error('API 요청 실패:', err);
      setError('서버와의 통신에 문제가 발생했습니다.');
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setLoading(false);
    }
  }, [question, loading]);

  // 키보드 이벤트 핸들러
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey && !loading) {
      e.preventDefault();
      handleSubmit();
    }
  }, [handleSubmit, loading]);

  // 환영 메시지 표시 핸들러
  const handleShowWelcome = useCallback(() => {
    const welcomeMessage = createMessage('system', WELCOME_MESSAGE_TEXT);
    setMessages(prev => [...prev, welcomeMessage]);
  }, []);

  return (
    <div className="App">
      <Header onShowWelcome={handleShowWelcome} />
      <div className="chat-wrapper">
        <div className="chat-container" ref={chatContainerRef}>
          {messages.map((message, index) => (
            <div key={index} className={`message-wrapper ${message.role}`}>
              <div className={`message ${message.role}${message.text === LOADING_INDICATOR ? ' loading' : ''}`}>
                {message.text === LOADING_INDICATOR
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
          <button className="send-button" onClick={handleSubmit} disabled={loading}>
            <FiSend />
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;