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
          <h1>LearnHub</h1>
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