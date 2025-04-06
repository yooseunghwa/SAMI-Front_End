import React, { useState } from 'react';
import './Header.css';
import samiLogo from '../assets/img/greeting.png';
import { FaHome, FaBars } from 'react-icons/fa';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(prev => !prev);
  };

  return (
    <>
      <div className="header">
        <div className="header-left">
          <img src={samiLogo} alt="SAMI 로고" className="sami-logo" />
          <span className="sami-title">상명대학교 챗봇 사미(SAMI)</span>
        </div>
        <div className="header-right">
          <FaHome className="icon" onClick={() => window.location.reload()} />
          <FaBars className="icon" onClick={toggleMenu} />
        </div>
      </div>

      <div className={`sidebar ${isMenuOpen ? 'open' : ''}`}>
        <div className="menu-item">📌 챗봇 설명</div>
        <div className="menu-item">📨 의견 보내기</div>
      </div>
    </>
  );
};

export default Header;
