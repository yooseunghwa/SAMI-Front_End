import React, { useState, useCallback, useEffect, useRef } from 'react';
import './Header.css';
import samiLogo from '../assets/img/greeting.png';
import { FaHome, FaBars, FaTimes } from 'react-icons/fa';

// 상수 정의
const FEEDBACK_EMAIL = 'feedback@sangmyung.ac.kr';
const FEEDBACK_SUBJECT = 'SAMI 챗봇 의견 및 건의사항';

// 피드백 이메일 템플릿 생성 함수
const createFeedbackTemplate = () => {
  const template = `
안녕하세요!

SAMI 챗봇에 대한 의견을 보내주셔서 감사합니다.

[의견 내용]
(여기에 의견을 작성해주세요)

[사용 환경]
- 브라우저: ${navigator.userAgent}
- 화면 크기: ${window.innerWidth}x${window.innerHeight}
- 접속 시간: ${new Date().toLocaleString()}

감사합니다.
  `;
  return template.trim();
};

const Header = ({ onShowWelcome }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const sidebarRef = useRef(null);

  // 메뉴 토글 핸들러
  const toggleMenu = useCallback(() => {
    setIsMenuOpen(prev => !prev);
  }, []);

  // 메뉴 닫기 핸들러
  const closeMenu = useCallback(() => {
    setIsMenuOpen(false);
  }, []);

  // 홈 버튼 클릭 핸들러 (페이지 새로고침)
  const handleHomeClick = useCallback(() => {
    if (window.confirm('대화 내용을 초기화하시겠습니까?')) {
      window.location.reload();
    }
  }, []);

  // 챗봇 설명 표시 핸들러
  const handleShowWelcome = useCallback(() => {
    onShowWelcome();
    closeMenu();
  }, [onShowWelcome, closeMenu]);

  // 의견 보내기 핸들러
  const handleFeedback = useCallback(() => {
    try {
      const subject = encodeURIComponent(FEEDBACK_SUBJECT);
      const body = encodeURIComponent(createFeedbackTemplate());
      const mailtoUrl = `mailto:${FEEDBACK_EMAIL}?subject=${subject}&body=${body}`;
      
      window.open(mailtoUrl, '_blank');
      closeMenu();
    } catch (error) {
      console.error('이메일 열기 실패:', error);
      alert('이메일 클라이언트를 열 수 없습니다. 직접 이메일을 보내주세요.');
    }
  }, [closeMenu]);

  // 키보드 이벤트 핸들러
  const handleKeyDown = useCallback((event) => {
    if (event.key === 'Escape' && isMenuOpen) {
      closeMenu();
    }
  }, [isMenuOpen, closeMenu]);

  // 외부 클릭 감지 핸들러
  const handleClickOutside = useCallback((event) => {
    if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
      closeMenu();
    }
  }, [closeMenu]);

  // 외부 클릭 및 터치 이벤트 리스너
  useEffect(() => {
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isMenuOpen, handleClickOutside]);

  // ESC 키 이벤트 리스너
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // 메뉴 열려있을 때 스크롤 방지
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = originalOverflow || 'auto';
    }

    return () => {
      document.body.style.overflow = originalOverflow || 'auto';
    };
  }, [isMenuOpen]);

  return (
    <>
      <header className="header" role="banner">
        <div className="header-left">
          <img 
            src={samiLogo} 
            alt="SAMI 로고" 
            className="sami-logo"
            loading="lazy"
          />
          <h1 className="sami-title">상명대학교 챗봇 사미(SAMI)</h1>
        </div>
        
        <nav className="header-right" role="navigation">
          <button
            className="icon-button home-button"
            onClick={handleHomeClick}
            aria-label="홈으로 돌아가기"
            title="대화 내용 초기화"
          >
            <FaHome />
          </button>
          
          <button
            className="icon-button menu-button"
            onClick={toggleMenu}
            aria-label={isMenuOpen ? '메뉴 닫기' : '메뉴 열기'}
            aria-expanded={isMenuOpen}
            title={isMenuOpen ? '메뉴 닫기' : '메뉴 열기'}
          >
            {isMenuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </nav>
      </header>

      {/* 사이드바 오버레이 */}
      {isMenuOpen && (
        <div 
          className="sidebar-overlay"
          onClick={closeMenu}
          aria-hidden="true"
        />
      )}

      {/* 사이드바 */}
      <aside 
        ref={sidebarRef}
        className={`sidebar ${isMenuOpen ? 'open' : ''}`}
        role="complementary"
        aria-hidden={!isMenuOpen}
      >
        <nav className="sidebar-nav" role="navigation">
          <button
            className="menu-item"
            onClick={handleShowWelcome}
            aria-label="챗봇 설명 보기"
          >
            <span className="menu-icon">📌</span>
            <span className="menu-text">챗봇 설명</span>
          </button>
          
          <button
            className="menu-item"
            onClick={handleFeedback}
            aria-label="의견 보내기"
          >
            <span className="menu-icon">📨</span>
            <span className="menu-text">의견 보내기</span>
          </button>
        </nav>
      </aside>
    </>
  );
};

export default Header;