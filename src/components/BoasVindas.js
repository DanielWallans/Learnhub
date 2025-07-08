import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import './BoasVindas.css';

function BoasVindas() {
  const [nome, setNome] = useState('');
  const [saudacao, setSaudacao] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Saudação dinâmica
    const hora = new Date().getHours();
    if (hora < 12) setSaudacao('Bom dia');
    else if (hora < 18) setSaudacao('Boa tarde');
    else setSaudacao('Boa noite');

    // Buscar nome do usuário logado no Firestore
    const user = auth.currentUser;
    if (user) {
      const docRef = doc(db, 'alunos', user.uid);
      getDoc(docRef).then((docSnap) => {
        if (docSnap.exists()) {
          setNome(docSnap.data().nomeCompleto || docSnap.data().nome || '');
        }
        setLoading(false);
      }).catch(() => {
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, []);

  const handleComecar = () => {
    navigate('/dashboard');
  };

  if (loading) {
    return (
      <div className="boas-vindas-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="boas-vindas-container">
      {/* Elementos decorativos de fundo */}
      <div className="background-elements">
        <div className="bg-element bg-element-1"></div>
        <div className="bg-element bg-element-2"></div>
        <div className="bg-element bg-element-3"></div>
      </div>

      <div className="boas-vindas-content">
        {/* Badge de boas-vindas */}
        <div className="welcome-badge">
          <span className="badge-icon">✨</span>
          <span>Tudo pronto para começar!</span>
        </div>

        {/* Título principal */}
        <h1 className="welcome-title">
          {saudacao}
          {nome && <span className="name-highlight">, {nome}</span>}!
          <span className="wave-emoji">👋</span>
        </h1>

        {/* Subtítulo */}
        <p className="welcome-subtitle">
          Sua jornada de <strong>organização</strong> e <strong>crescimento</strong> começa agora!
        </p>

        {/* Cards de features */}
        <div className="features-preview">
          <div className="feature-card">
            <div className="feature-icon">
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <path d="M9 11H1V3h8v8zm0 0l-2 2m7-6h2m-2 0v2m5-8v6h-6"/>
              </svg>
            </div>
            <div className="feature-text">
              <h3>Organize</h3>
              <p>Seus estudos e tarefas</p>
            </div>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12,6 12,12 16,14"/>
              </svg>
            </div>
            <div className="feature-text">
              <h3>Planeje</h3>
              <p>Suas metas e objetivos</p>
            </div>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <line x1="18" y1="20" x2="18" y2="10"/>
                <line x1="12" y1="20" x2="12" y2="4"/>
                <line x1="6" y1="20" x2="6" y2="14"/>
              </svg>
            </div>
            <div className="feature-text">
              <h3>Evolua</h3>
              <p>Com análises detalhadas</p>
            </div>
          </div>
        </div>

        {/* Botão principal */}
        <div className="cta-section">
          <button className="btn-comecar" onClick={handleComecar}>
            <span className="btn-text">Começar minha jornada</span>
            <div className="btn-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M7 17l10-10"/>
                <path d="M7 7h10v10"/>
              </svg>
            </div>
          </button>
          
          <p className="cta-description">
            Acesse seu dashboard personalizado e comece a transformar seus objetivos em realidade
          </p>
        </div>
      </div>
    </div>
  );
}

export default BoasVindas;