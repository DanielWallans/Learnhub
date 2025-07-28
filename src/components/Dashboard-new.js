import React, { useEffect, useState } from 'react';
import { auth, db } from '../firebaseConfig';
import { doc, getDoc, collection, query, where, onSnapshot, updateDoc } from 'firebase/firestore';
import { useNavigate, Link } from 'react-router-dom';
import Resumo from './Resumo';
import Organizacao from './Organizacao';
import Planejamento from './Planejamento';
import Agenda from './Agenda';
import Footer from './Footer';
import './dashboard-new.css';

const Dashboard = () => {
  // Estados principais
  const [user, setUser] = useState(null);
  const [nome, setNome] = useState('');
  const [foto, setFoto] = useState('');
  const [dadosAluno, setDadosAluno] = useState(null);
  const [showPerfil, setShowPerfil] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editedData, setEditedData] = useState({});
  const [saving, setSaving] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [activeModule, setActiveModule] = useState('resumo');
  
  // Estatísticas do dashboard
  const [stats, setStats] = useState({
    habitosAtivos: 12,
    projetosEmAndamento: 5,
    metasAlcancadas: 8,
    livrosLidos: 23
  });

  const navigate = useNavigate();

  // Monitora autenticação
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      if (!user) {
        navigate('/login-aluno');
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  // Carrega dados do usuário
  useEffect(() => {
    if (user) {
      const loadUserData = async () => {
        try {
          const docRef = doc(db, 'alunos', user.uid);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            const data = docSnap.data();
            setNome(data.nomeCompleto || data.nome || 'Usuário');
            setFoto(data.foto || `https://ui-avatars.com/api/?name=${encodeURIComponent(data.nomeCompleto || data.nome || 'Usuario')}&background=667eea&color=ffffff`);
            setDadosAluno(data);
          }
        } catch (error) {
          console.error('Erro ao carregar dados do usuário:', error);
        }
      };
      
      loadUserData();
    }
  }, [user]);

  // Handlers
  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate('/login-aluno');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const handleOpenPerfil = () => {
    setShowPerfil(true);
    setEditMode(false);
    setEditedData({
      nomeCompleto: dadosAluno?.nomeCompleto || '',
      emailContato: dadosAluno?.emailContato || '',
      curso: dadosAluno?.curso || '',
      semestrePeriodo: dadosAluno?.semestrePeriodo || '',
      modalidade: dadosAluno?.modalidade || '',
      nivelEnsino: dadosAluno?.nivelEnsino || ''
    });
  };

  const handleSavePerfil = async () => {
    if (!user) return;
    
    setSaving(true);
    try {
      const docRef = doc(db, 'alunos', user.uid);
      await updateDoc(docRef, editedData);
      
      setDadosAluno(prev => ({ ...prev, ...editedData }));
      setNome(editedData.nomeCompleto || editedData.nome || '');
      
      setEditMode(false);
      setEditedData({});
      
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);
      
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
      alert('Erro ao salvar perfil. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field, value) => {
    setEditedData(prev => ({ ...prev, [field]: value }));
  };

  const renderActiveModule = () => {
    switch (activeModule) {
      case 'organizacao':
        return <Organizacao />;
      case 'planejamento':
        return <Planejamento />;
      case 'agenda':
        return <Agenda />;
      default:
        return <Resumo />;
    }
  };

  if (!user) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Carregando...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Header Profissional */}
      <header className="dashboard-header">
        <div className="header-content">
          {/* Logo */}
          <Link to="/home" className="dashboard-logo">
            <div className="logo-icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                  stroke="url(#logoGradient)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="12" cy="12" r="1.5" fill="url(#logoGradient)" />
                <defs>
                  <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#667eea" />
                    <stop offset="100%" stopColor="#764ba2" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <div className="logo-text">
              <span className="logo-learn">Learn</span>
              <span className="logo-hub">Hub</span>
            </div>
          </Link>

          {/* Área direita */}
          <div className="header-right">
            {/* Perfil */}
            <div className="dashboard-profile" onClick={handleOpenPerfil}>
              <div className="profile-avatar">
                <img src={foto} alt="Perfil" className="profile-image" />
                <div className="profile-status"></div>
              </div>
              <div className="profile-info">
                <span className="profile-greeting">Olá,</span>
                <span className="profile-name">{nome}</span>
              </div>
              <div className="profile-dropdown">
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <polyline points="6,9 12,15 18,9" />
                </svg>
              </div>
            </div>

            {/* Botão Logout */}
            <button className="logout-button" onClick={handleLogout}>
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                <polyline points="16,17 21,12 16,7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Sair
            </button>
          </div>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="dashboard-content">
        {/* Seção de Boas-vindas */}
        <section className="welcome-section animate-slide-up">
          <div className="welcome-content">
            <div className="welcome-text">
              <h1 className="welcome-title">
                <div className="welcome-icon">
                  <svg width="24" height="24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                  </svg>
                </div>
                <span className="welcome-title-text">Bem-vindo de volta!</span>
              </h1>
              <p className="welcome-subtitle">
                Pronto para continuar sua jornada de aprendizado?
              </p>
              <p className="welcome-description">
                Gerencie seus estudos, acompanhe seu progresso e alcance seus objetivos acadêmicos com nossa plataforma completa.
              </p>
            </div>
          </div>
        </section>

        {/* Estatísticas */}
        <section className="stats-grid animate-slide-up">
          <div className="stat-card">
            <div className="stat-header">
              <div className="stat-icon primary">
                <svg width="28" height="28" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                </svg>
              </div>
            </div>
            <div className="stat-value">{stats.habitosAtivos}</div>
            <div className="stat-label">Hábitos Ativos</div>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <div className="stat-icon secondary">
                <svg width="28" height="28" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <rect x="3" y="4" width="18" height="14" rx="2" ry="2" />
                  <path d="M8 2v4M16 2v4M3 10h18" />
                  <rect x="6" y="12" width="3" height="3" rx="1" />
                  <rect x="10.5" y="12" width="3" height="3" rx="1" />
                  <rect x="15" y="12" width="3" height="3" rx="1" />
                </svg>
              </div>
            </div>
            <div className="stat-value">{stats.projetosEmAndamento}</div>
            <div className="stat-label">Projetos em Andamento</div>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <div className="stat-icon accent">
                <svg width="28" height="28" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d="M9 12l2 2 4-4" />
                  <circle cx="12" cy="12" r="9" />
                </svg>
              </div>
            </div>
            <div className="stat-value">{stats.metasAlcancadas}</div>
            <div className="stat-label">Metas Alcançadas</div>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <div className="stat-icon success">
                <svg width="28" height="28" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
                  <path d="M8 7h8M8 11h8M8 15h5" />
                </svg>
              </div>
            </div>
            <div className="stat-value">{stats.livrosLidos}</div>
            <div className="stat-label">Livros Lidos</div>
          </div>
        </section>

        {/* Módulos */}
        <section className="modules-section animate-slide-up">
          <h2 className="section-title">Seus Módulos</h2>
          <div className="modules-grid">
            <div 
              className={`module-card ${activeModule === 'resumo' ? 'active' : ''}`}
              onClick={() => setActiveModule('resumo')}
            >
              <div className="module-header">
                <div className="module-icon resumo">
                  <svg width="26" height="26" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <path d="M8 12h8M8 16h6" />
                    <circle cx="8" cy="8" r="1" fill="white" />
                    <circle cx="12" cy="8" r="1" fill="white" />
                    <circle cx="16" cy="8" r="1" fill="white" />
                  </svg>
                </div>
                <div className="module-info">
                  <h3>Resumo</h3>
                  <p>Visão geral do seu progresso acadêmico</p>
                </div>
              </div>
            </div>

            <div 
              className={`module-card ${activeModule === 'organizacao' ? 'active' : ''}`}
              onClick={() => setActiveModule('organizacao')}
            >
              <div className="module-header">
                <div className="module-icon organizacao">
                  <svg width="26" height="26" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <rect x="3" y="5" width="6" height="14" rx="1" />
                    <rect x="15" y="5" width="6" height="14" rx="1" />
                    <rect x="9" y="2" width="6" height="20" rx="1" />
                    <path d="M6 8v2M18 8v2M12 5v2M12 15v2" />
                  </svg>
                </div>
                <div className="module-info">
                  <h3>Organização</h3>
                  <p>Organize suas tarefas e prioridades</p>
                </div>
              </div>
            </div>

            <div 
              className={`module-card ${activeModule === 'planejamento' ? 'active' : ''}`}
              onClick={() => setActiveModule('planejamento')}
            >
              <div className="module-header">
                <div className="module-icon planejamento">
                  <svg width="26" height="26" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <path d="M9 11H7a4 4 0 010-8h2m0 8v2a4 4 0 008 0v-2m0 0h2a4 4 0 000-8h-2" />
                    <path d="M9 7h6" />
                    <circle cx="12" cy="17" r="2" />
                    <path d="M12 15v-4" />
                  </svg>
                </div>
                <div className="module-info">
                  <h3>Planejamento</h3>
                  <p>Planeje seus estudos e metas</p>
                </div>
              </div>
            </div>

            <div 
              className={`module-card ${activeModule === 'agenda' ? 'active' : ''}`}
              onClick={() => setActiveModule('agenda')}
            >
              <div className="module-header">
                <div className="module-icon agenda">
                  <svg width="26" height="26" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <path d="M8 2v4M16 2v4M3 10h18" />
                    <circle cx="8" cy="14" r="1" fill="white" />
                    <circle cx="12" cy="14" r="1" fill="white" />
                    <circle cx="16" cy="14" r="1" fill="white" />
                    <circle cx="8" cy="18" r="1" fill="white" />
                    <circle cx="12" cy="18" r="1" fill="white" />
                  </svg>
                </div>
                <div className="module-info">
                  <h3>Agenda</h3>
                  <p>Gerencie seus compromissos</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Ações Rápidas */}
        <section className="quick-actions animate-slide-up">
          <h2 className="section-title">Ações Rápidas</h2>
          <div className="actions-grid">
            <button className="action-button" onClick={() => setActiveModule('planejamento')}>
              <div className="action-icon primary">
                <svg width="22" height="22" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d="M9 11H7a4 4 0 010-8h2m0 8v2a4 4 0 008 0v-2m0 0h2a4 4 0 000-8h-2" />
                  <path d="M9 7h6" />
                </svg>
              </div>
              <span className="action-label">Nova Meta</span>
            </button>

            <button className="action-button" onClick={() => setActiveModule('organizacao')}>
              <div className="action-icon secondary">
                <svg width="22" height="22" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <path d="M9 9h6M9 13h6M9 17h4" />
                  <circle cx="7" cy="9" r="1" fill="white" />
                  <circle cx="7" cy="13" r="1" fill="white" />
                  <circle cx="7" cy="17" r="1" fill="white" />
                </svg>
              </div>
              <span className="action-label">Nova Tarefa</span>
            </button>

            <button className="action-button" onClick={() => setActiveModule('agenda')}>
              <div className="action-icon accent">
                <svg width="22" height="22" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <path d="M8 2v4M16 2v4M3 10h18" />
                  <circle cx="8" cy="14" r="1" fill="white" />
                  <circle cx="12" cy="14" r="1" fill="white" />
                  <circle cx="16" cy="14" r="1" fill="white" />
                </svg>
              </div>
              <span className="action-label">Novo Evento</span>
            </button>

            <button className="action-button" onClick={handleOpenPerfil}>
              <div className="action-icon success">
                <svg width="22" height="22" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <span className="action-label">Ver Perfil</span>
            </button>

            <Link to="/home" className="action-button">
              <div className="action-icon warning">
                <svg width="20" height="20" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                  <polyline points="9,22 9,12 15,12 15,22" />
                </svg>
              </div>
              <span className="action-label">Início</span>
            </Link>
          </div>
        </section>

        {/* Conteúdo do Módulo Ativo */}
        <section className="module-content animate-fade-in">
          {renderActiveModule()}
        </section>
      </main>

      {/* Modal de Perfil */}
      {showPerfil && (
        <div className="modal-overlay" onClick={() => setShowPerfil(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">
                {editMode ? 'Editar Perfil' : 'Meu Perfil'}
              </h2>
              <button 
                className="modal-close" 
                onClick={() => setShowPerfil(false)}
              >
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {editMode ? (
              <div className="profile-form">
                <div className="form-group">
                  <label className="form-label">Nome Completo</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editedData.nomeCompleto || ''}
                    onChange={(e) => handleInputChange('nomeCompleto', e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email de Contato</label>
                  <input
                    type="email"
                    className="form-input"
                    value={editedData.emailContato || ''}
                    onChange={(e) => handleInputChange('emailContato', e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Curso</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editedData.curso || ''}
                    onChange={(e) => handleInputChange('curso', e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Semestre/Período</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editedData.semestrePeriodo || ''}
                    onChange={(e) => handleInputChange('semestrePeriodo', e.target.value)}
                  />
                </div>

                <div className="form-actions">
                  <button 
                    className="btn btn-secondary" 
                    onClick={() => setEditMode(false)}
                  >
                    Cancelar
                  </button>
                  <button 
                    className="btn btn-primary" 
                    onClick={handleSavePerfil}
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <svg width="16" height="16" className="animate-spin" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                          <line x1="12" y1="2" x2="12" y2="6" />
                          <line x1="12" y1="18" x2="12" y2="22" />
                          <line x1="4.93" y1="4.93" x2="7.76" y2="7.76" />
                          <line x1="16.24" y1="16.24" x2="19.07" y2="19.07" />
                          <line x1="2" y1="12" x2="6" y2="12" />
                          <line x1="18" y1="12" x2="22" y2="12" />
                          <line x1="4.93" y1="19.07" x2="7.76" y2="16.24" />
                          <line x1="16.24" y1="7.76" x2="19.07" y2="4.93" />
                        </svg>
                        Salvando...
                      </>
                    ) : (
                      <>
                        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                          <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
                          <polyline points="17,21 17,13 7,13 7,21" />
                          <polyline points="7,3 7,8 15,8" />
                        </svg>
                        Salvar
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="profile-info-display">
                <div className="profile-avatar-large">
                  <img src={foto} alt="Perfil" />
                </div>
                <div className="profile-details">
                  <p><strong>Nome:</strong> {dadosAluno?.nomeCompleto || 'Não informado'}</p>
                  <p><strong>Email:</strong> {dadosAluno?.emailContato || 'Não informado'}</p>
                  <p><strong>Curso:</strong> {dadosAluno?.curso || 'Não informado'}</p>
                  <p><strong>Período:</strong> {dadosAluno?.semestrePeriodo || 'Não informado'}</p>
                </div>
                <div className="form-actions">
                  <button 
                    className="btn btn-primary" 
                    onClick={() => setEditMode(true)}
                  >
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                    Editar Perfil
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mensagem de Sucesso */}
      {showSuccessMessage && (
        <div className="success-message">
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
            <polyline points="22,4 12,14.01 9,11.01" />
          </svg>
          Perfil atualizado com sucesso!
        </div>
      )}

      <Footer />
    </div>
  );
};

export default Dashboard;
