// componente simples para loading
// nada muito fancy, só pra não ter div vazia com "Loading..."

import React from 'react';
import './Loading.css';

const Loading = ({ message = 'Carregando...', size = 'medium' }) => {
  return (
    <div className={`loading-container ${size}`}>
      <div className="loading-spinner"></div>
      <span className="loading-message">{message}</span>
    </div>
  );
};

export default Loading;
