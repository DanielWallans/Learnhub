import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './header.css';

function Header({ perfil, setPerfil, onLogout, nomeUsuario, notificacoes }) {
  const [showMessage, setShowMessage] = useState(false);
  const [shutdown, setShutdown] = useState(false);
  const navigate = useNavigate();

  const handleHomeClick = () => {
    setPerfil("");
    navigate('/home');
  };

  const handleLogoutClick = () => {
    onLogout();
    setShowMessage(true);
    setShutdown(true); // Ativa o efeito de desligamento

    setTimeout(() => {
      navigate('/login');
    }, 2000); // Redireciona após 2 segundos
  };

  return (
    <>
      <header className={`header ${shutdown ? "fade-out" : ""}`}>
        <div className="header-left">
          <div className="header-brand">
            <div className="header-logo-icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h1 className="header-brand-name">
              <span className="header-gradient-text">Learn</span>
              <span className="header-accent-text">Hub</span>
            </h1>
          </div>
          {perfil && (
            <div className="perfil-info">
              <p>Bem-vindo, {perfil.nome}!</p>
              <p>Email: {perfil.email}</p>
            </div>
          )}
        </div>
        <div className="header-right">
          {notificacoes && (
            <div className="notificacoes">
              <button className="notificacoes-button">
                Notificações ({notificacoes.length})
              </button>
              <ul className="notificacoes-list">
                {notificacoes.map((notificacao, index) => (
                  <li key={index}>{notificacao}</li>
                ))}
              </ul>
            </div>
          )}
          <button onClick={handleHomeClick} className="home-button">Home</button>
          <nav>
            <button onClick={handleLogoutClick} className="logout-button">Logout</button>
          </nav>
        </div>
      </header>

      {showMessage && <div className="logout-message">Desligando...</div>}
      {shutdown && <div className="shutdown-effect"></div>}
    </>
  );
}

export default Header;