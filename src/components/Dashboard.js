import React, { useEffect, useState } from 'react';
import { auth, db } from '../firebaseConfig';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useNavigate, Link } from 'react-router-dom';
import Resumo from './Resumo';
import Footer from './Footer';
import './dashboard-ultra.css';

const Dashboard = () => {
  // Estados principais
  const [user, setUser] = useState(null);
  const [nome, setNome] = useState('');
  const [foto, setFoto] = useState('');
  const [dadosAluno, setDadosAluno] = useState(null);
  const [showPerfil, setShowPerfil] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editedData, setEditedData] = useState({});
  const [saving, setSaving] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [activeModule, setActiveModule] = useState('resumo');
  const [loading, setLoading] = useState(true);
  
  // Estatísticas dinâmicas
  const [stats, setStats] = useState({
    habitosAtivos: 0,
    projetosEmAndamento: 0,
    metasAlcancadas: 0,
    livrosLidos: 0,
    horasEstudo: 0,
    sequenciaEstudo: 0
  });

  const navigate = useNavigate();

  // Monitora autenticação
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      if (!user) {
        navigate('/login-aluno');
      } else {
        setLoading(false);
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
            setNome(data.nomeCompleto || data.nome || 'Estudante');
            setFoto(data.foto || `https://ui-avatars.com/api/?name=${encodeURIComponent(data.nomeCompleto || data.nome || 'Estudante')}&background=667eea&color=ffffff`);
            setDadosAluno(data);
            
            // Simular estatísticas baseadas nos dados (você pode conectar com dados reais)
            setStats({
              habitosAtivos: Math.floor(Math.random() * 15) + 5,
              projetosEmAndamento: Math.floor(Math.random() * 8) + 2,
              metasAlcancadas: Math.floor(Math.random() * 12) + 3,
              livrosLidos: Math.floor(Math.random() * 25) + 10,
              horasEstudo: Math.floor(Math.random() * 50) + 20,
              sequenciaEstudo: Math.floor(Math.random() * 30) + 5
            });
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
      default:
        return <Resumo />;
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  if (loading) {
    return (
      <div className="ultra-loading">
        <div className="loading-animation">
          <div className="loading-cube">
            <div className="cube-face cube-front"></div>
            <div className="cube-face cube-back"></div>
            <div className="cube-face cube-right"></div>
            <div className="cube-face cube-left"></div>
            <div className="cube-face cube-top"></div>
            <div className="cube-face cube-bottom"></div>
          </div>
          <div className="loading-text">
            <span className="loading-learn">Learn</span>
            <span className="loading-hub">Hub</span>
          </div>
          <div className="loading-subtitle">Carregando seu universo de aprendizado...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="ultra-dashboard" data-active-module={activeModule}>
      {/* Background Particles */}
      <div className="particles-background">
        {[...Array(50)].map((_, i) => (
          <div 
            key={i} 
            className="particle"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 20}s`,
              animationDuration: `${15 + Math.random() * 10}s`
            }}
          ></div>
        ))}
      </div>

      {/* Ultra Header - Only show on dashboard main page */}
      {activeModule === 'resumo' && (
        <header className="ultra-header">
          <div className="header-container">
            {/* Logo Ultra */}
            <div className="ultra-logo">
              <div className="logo-orbit">
                <div className="logo-core">
                  <svg viewBox="0 0 24 24" fill="none" className="logo-icon">
                    <path
                      d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                      stroke="url(#ultraGradient)"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <defs>
                      <linearGradient id="ultraGradient">
                        <stop offset="0%" stopColor="#667eea" />
                        <stop offset="50%" stopColor="#764ba2" />
                        <stop offset="100%" stopColor="#f093fb" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
                <div className="orbit-ring ring-1"></div>
                <div className="orbit-ring ring-2"></div>
              </div>
              <div className="logo-text">
                <span className="logo-learn">Learn</span>
                <span className="logo-hub">Hub</span>
              </div>
            </div>

            {/* Header Actions */}
            <div className="header-actions">
              {/* Profile Ultra */}
              <div className="ultra-profile" onClick={handleOpenPerfil}>
                <div className="profile-glow"></div>
                <div className="profile-avatar">
                  <img src={foto} alt="Perfil" />
                  <div className="status-indicator"></div>
                </div>
                <div className="profile-info">
                  <span className="profile-greeting">{getGreeting()},</span>
                  <span className="profile-name">{nome}</span>
                </div>
                <div className="profile-arrow">
                  <svg viewBox="0 0 24 24" fill="none">
                    <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>

              {/* Logout Ultra */}
              <button className="ultra-logout" onClick={handleLogout}>
                <div className="logout-glow"></div>
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <polyline points="16,17 21,12 16,7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <line x1="21" y1="12" x2="9" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>Sair</span>
              </button>
            </div>
          </div>
        </header>
      )}

      {/* Conteúdo Principal */}
      <main className={`ultra-content ${activeModule !== 'resumo' ? 'module-page-active' : ''}`}>
        {/* Dashboard Content - Only show when resumo is active */}
        {activeModule === 'resumo' && (
          <>
            {/* Hero Section */}
            <section className="ultra-hero">
              <div className="hero-content">
                <div className="hero-welcome">
                  <h1 className="hero-title">
                    <span className="title-icon">⚡</span>
                    <span className="title-text">Bem-vindo de volta!</span>
                    <div className="title-glow"></div>
                  </h1>
                  <p className="hero-subtitle">
                    Transforme conhecimento em conquistas extraordinárias
                  </p>
                </div>
                <div className="hero-visual">
                  <div className="floating-elements">
                    <div className="element element-1">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M4 19.5A2.5 2.5 0 016.5 17H20"/>
                        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>
                      </svg>
                    </div>
                    <div className="element element-2">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="3"/>
                        <path d="M12 1v6m0 6v6"/>
                        <path d="m15.5 4.5-1.5 1.5"/>
                        <path d="m4.5 15.5 1.5-1.5"/>
                        <path d="m15.5 19.5-1.5-1.5"/>
                        <path d="m4.5 8.5 1.5 1.5"/>
                      </svg>
                    </div>
                    <div className="element element-3">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 00-2.91-.09z"/>
                        <path d="m12 15-3-3a22 22 0 012-3.95A12.88 12.88 0 0122 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 01-4 2z"/>
                        <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/>
                        <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>
                      </svg>
                    </div>
                    <div className="element element-4">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Ultra Stats */}
            <section className="ultra-stats">
              <div className="stats-container">
                <div className="stat-card stat-primary">
                  <div className="stat-glow"></div>
                  <div className="stat-icon">
                    <svg viewBox="0 0 24 24" fill="none">
                      <path d="M22 12h-4l-3 9L9 3l-3 9H2" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div className="stat-value">{stats.habitosAtivos}</div>
                  <div className="stat-label">Hábitos Ativos</div>
                </div>

                <div className="stat-card stat-secondary">
                  <div className="stat-glow"></div>
                  <div className="stat-icon">
                    <svg viewBox="0 0 24 24" fill="none">
                      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
                      <line x1="8" y1="21" x2="16" y2="21" stroke="currentColor" strokeWidth="2"/>
                      <line x1="12" y1="17" x2="12" y2="21" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                  </div>
                  <div className="stat-value">{stats.projetosEmAndamento}</div>
                  <div className="stat-label">Projetos Ativos</div>
                </div>

                <div className="stat-card stat-accent">
                  <div className="stat-glow"></div>
                  <div className="stat-icon">
                    <svg viewBox="0 0 24 24" fill="none">
                      <path d="M22 11.08V12a10 10 0 11-5.93-9.14" stroke="currentColor" strokeWidth="2"/>
                      <polyline points="22,4 12,14.01 9,11.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div className="stat-value">{stats.metasAlcancadas}</div>
                  <div className="stat-label">Metas Conquistadas</div>
                </div>

                <div className="stat-card stat-success">
                  <div className="stat-glow"></div>
                  <div className="stat-icon">
                    <svg viewBox="0 0 24 24" fill="none">
                      <path d="M4 19.5A2.5 2.5 0 016.5 17H20" stroke="currentColor" strokeWidth="2"/>
                      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                  </div>
                  <div className="stat-value">{stats.livrosLidos}</div>
                  <div className="stat-label">Livros Dominados</div>
                </div>

                <div className="stat-card stat-warning">
                  <div className="stat-glow"></div>
                  <div className="stat-icon">
                    <svg viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                      <polyline points="12,6 12,12 16,14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div className="stat-value">{stats.horasEstudo}</div>
                  <div className="stat-label">Horas de Foco</div>
                </div>

                <div className="stat-card stat-info">
                  <div className="stat-glow"></div>
                  <div className="stat-icon">
                    <svg viewBox="0 0 24 24" fill="none">
                      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div className="stat-value">{stats.sequenciaEstudo}</div>
                  <div className="stat-label">Dias Consecutivos</div>
                </div>
              </div>
            </section>

            {/* Módulos */}
            <section className="ultra-modules">
              <h2 className="section-title">
                <span className="title-icon">🎛️</span>
                Central de Comandos
              </h2>
              <div className="modules-grid">
                <div 
                  className={`ultra-module ${activeModule === 'resumo' ? 'active' : ''}`}
                  onClick={() => setActiveModule('resumo')}
                >
                  <div className="module-glow"></div>
                  <div className="module-header">
                    <div className="module-icon">
                      <svg viewBox="0 0 24 24" fill="none">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2.5"/>
                        <path d="M8 12h8M8 16h6" stroke="currentColor" strokeWidth="2.5"/>
                        <circle cx="8" cy="8" r="1" fill="white" />
                        <circle cx="12" cy="8" r="1" fill="white" />
                        <circle cx="16" cy="8" r="1" fill="white" />
                      </svg>
                    </div>
                    <div className="module-info">
                      <h3>Painel Geral</h3>
                      <p>Visão completa do progresso</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Ações Rápidas */}
            <section className="ultra-actions">
              <h2 className="section-title">
                <span className="title-icon">⚡</span>
                Ações Instantâneas
              </h2>
              <div className="actions-grid single-action">
                <p>Em breve novos módulos serão adicionados aqui!</p>
              </div>
            </section>
          </>
        )}

        {/* Module Content - For individual module pages */}
        {activeModule !== 'resumo' && (
          <section className="ultra-module-content active">
            <button className="module-back-float" onClick={() => setActiveModule('resumo')}>
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M19 12H6m-1 0l3-3m-3 3l3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Voltar ao Dashboard
            </button>
            <div className="content-wrapper">
              {renderActiveModule()}
            </div>
          </section>
        )}
      </main>

      {/* Footer - Only show on dashboard main page */}
      {activeModule === 'resumo' && <Footer minimal={true} />}
    </div>
  );
};

export default Dashboard;
