import React, { useEffect, useState, useMemo, useCallback, lazy, Suspense } from 'react';
import { auth, db } from '../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { 
  FaBriefcase, 
  FaGraduationCap, 
  FaBook,
  FaLightbulb,
  FaTrophy,
  FaRocket,
  FaStar,
  FaHeart,
  FaWallet,
  FaCogs
} from 'react-icons/fa';
import './dashboard-ultra.css';

// Lazy loading dos componentes pesados
const Resumo = lazy(() => import('./Resumo'));
const Footer = lazy(() => import('./Footer'));
const ModalPerfil = lazy(() => import('./ModalPerfil'));

const Dashboard = () => {
  // Estados principais
  const [user, setUser] = useState(null);
  const [nome, setNome] = useState('');
  const [foto, setFoto] = useState('');
  const [dadosAluno, setDadosAluno] = useState(null);
  const [showPerfil, setShowPerfil] = useState(false);
  const [activeModule, setActiveModule] = useState('resumo');
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  // Memoização do avatar padrão
  const defaultAvatar = useMemo(() => {
    if (!nome) return '';
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(nome)}&background=667eea&color=ffffff`;
  }, [nome]);

  // Handlers memoizados
  const handleLogout = useCallback(async () => {
    try {
      await auth.signOut();
      navigate('/login-aluno');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  }, [navigate]);

  const handleOpenPerfil = useCallback(() => {
    setShowPerfil(true);
  }, []);

  const handleClosePerfil = useCallback(() => {
    setShowPerfil(false);
  }, []);

  const handleUpdateProfile = useCallback((newData) => {
    setDadosAluno(prev => ({ ...prev, ...newData }));
    setNome(newData.nome || newData.nomeCompleto || nome);
  }, [nome]);

  const navigateToCarreira = useCallback(() => {
    navigate('/carreira');
  }, [navigate]);

  const navigateToFinancas = useCallback(() => {
    navigate('/financas');
  }, [navigate]);

  const navigateToHabilidades = useCallback(() => {
    navigate('/habilidades');
  }, [navigate]);

  const navigateToLeitura = useCallback(() => {
    navigate('/leitura');
  }, [navigate]);

  // Monitora autenticação - otimizado
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      if (!user) {
        navigate('/login-aluno');
      } else {
        setLoading(false);
      }
    });
    return unsubscribe;
  }, [navigate]);

  // Carrega dados do usuário - otimizado
  useEffect(() => {
    if (!user) return;

    let isMounted = true;
    
    const loadUserData = async () => {
      try {
        const docRef = doc(db, 'alunos', user.uid);
        const docSnap = await getDoc(docRef);
        
        if (isMounted && docSnap.exists()) {
          const data = docSnap.data();
          const userName = data.nomeCompleto || data.nome || 'Estudante';
          setNome(userName);
          setFoto(data.foto || defaultAvatar);
          setDadosAluno(data);
        }
      } catch (error) {
        console.error('Erro ao carregar dados do usuário:', error);
      }
    };
    
    loadUserData();
    
    return () => {
      isMounted = false;
    };
  }, [user, defaultAvatar]);

  // Componente de loading memoizado
  const LoadingComponent = useMemo(() => (
    <div className="dashboard-container">
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <div className="loading-text">Carregando...</div>
      </div>
    </div>
  ), []);

  // Renderização do módulo ativo simplificada
  const renderActiveModule = useCallback(() => {
    if (activeModule !== 'resumo') return null;
    return (
      <Suspense fallback={<div className="loading-spinner"></div>}>
        <Resumo />
      </Suspense>
    );
  }, [activeModule]);

  if (loading) {
    return LoadingComponent;
  }

  return (
    <div className="dashboard-container">
      {/* Header simples */}
      {activeModule === 'resumo' && (
        <header className="ultra-header">
          <div className="header-container">
            <div className="ultra-logo">
              <h1>LearnHub</h1>
            </div>
            <div className="header-actions">
              <div className="user-controls">
                <div onClick={handleOpenPerfil}>
                  <img src={foto} alt="Perfil" className="avatar-img" />
                  <span>{nome}</span>
                </div>
                <button onClick={handleLogout}>Sair</button>
              </div>
            </div>
          </div>
        </header>
      )}

      {/* Conteúdo Principal */}
      <main className="dashboard-content">
        {activeModule === 'resumo' && (
          <div className="content-container">
            {/* Seção de Boas-vindas */}
            <div className="dashboard-section welcome-section">
              <div className="welcome-content">
                <div className="welcome-text">
                  <h2>Bem-vindo de volta, {nome}!</h2>
                  <p>Continue sua jornada de aprendizado e desenvolvimento profissional.</p>
                </div>
                <div className="floating-icons">
                  <FaRocket className="floating-icon icon-1" />
                  <FaLightbulb className="floating-icon icon-2" />
                  <FaTrophy className="floating-icon icon-3" />
                  <FaStar className="floating-icon icon-4" />
                  <FaHeart className="floating-icon icon-5" />
                  <FaBook className="floating-icon icon-6" />
                </div>
              </div>
            </div>

            {/* Cards dos Módulos */}
            <div className="dashboard-section">
              <h2 className="section-title">
                <FaGraduationCap />
                Módulos de Aprendizado
              </h2>
              <div className="modules-grid">
                <div 
                  className="module-card"
                  onClick={navigateToCarreira}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && navigateToCarreira()}
                >
                  <div className="module-icon">
                    <FaBriefcase />
                  </div>
                  <div className="module-content">
                    <h3>Desenvolvimento de Carreira</h3>
                    <p>Planeje e desenvolva sua carreira profissional com ferramentas especializadas.</p>
                  </div>
                  <div className="module-arrow">→</div>
                </div>
                
                <div 
                  className="module-card"
                  onClick={navigateToFinancas}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && navigateToFinancas()}
                >
                  <div className="module-icon">
                    <FaWallet />
                  </div>
                  <div className="module-content">
                    <h3>Gestão Financeira</h3>
                    <p>Organize suas finanças, estabeleça metas e desenvolva hábitos financeiros saudáveis.</p>
                  </div>
                  <div className="module-arrow">→</div>
                </div>
                
                <div 
                  className="module-card"
                  onClick={navigateToHabilidades}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && navigateToHabilidades()}
                >
                  <div className="module-icon">
                    <FaCogs />
                  </div>
                  <div className="module-content">
                    <h3>Gerenciamento de Habilidades</h3>
                    <p>Desenvolva e acompanhe seus hábitos de estudo e crescimento pessoal.</p>
                  </div>
                  <div className="module-arrow">→</div>
                </div>
                
                <div 
                  className="module-card"
                  onClick={navigateToLeitura}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && navigateToLeitura()}
                >
                  <div className="module-icon">
                    <FaBook />
                  </div>
                  <div className="module-content">
                    <h3>Biblioteca Pessoal</h3>
                    <p>Organize sua jornada de leitura, gerencie livros, resumos e apostilas com progresso detalhado.</p>
                  </div>
                  <div className="module-arrow">→</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeModule !== 'resumo' && (
          <div className="content-container">
            <button 
              className="btn-secondary"
              onClick={() => setActiveModule('resumo')}
            >
              ← Voltar ao Dashboard
            </button>
            <div>
              {renderActiveModule()}
            </div>
          </div>
        )}
      </main>

      {/* Footer apenas na página principal */}
      {activeModule === 'resumo' && (
        <Suspense fallback={null}>
          <Footer minimal={true} />
        </Suspense>
      )}

      {/* Modal de Perfil */}
      {showPerfil && (
        <Suspense fallback={null}>
          <ModalPerfil
            isOpen={showPerfil}
            onClose={handleClosePerfil}
            user={user}
            dadosAluno={dadosAluno}
            nome={nome}
            foto={foto}
            onUpdateProfile={handleUpdateProfile}
          />
        </Suspense>
      )}
    </div>
  );
};

export default Dashboard;
