import React, { useEffect, useState } from 'react';
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
  FaHeart
} from 'react-icons/fa';
import Resumo from './Resumo';
import Footer from './Footer';
import ModalPerfil from './ModalPerfil';
import './dashboard-ultra.css';

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
  };

  const handleUpdateProfile = (newData) => {
    setDadosAluno(prev => ({ ...prev, ...newData }));
    setNome(newData.nome || newData.nomeCompleto || nome);
  };

  const renderActiveModule = () => {
    switch (activeModule) {
      default:
        return <Resumo />;
    }
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <div className="loading-text">Carregando...</div>
        </div>
      </div>
    );
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
                  onClick={() => navigate('/carreira')}
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
      {activeModule === 'resumo' && <Footer minimal={true} />}

      {/* Modal de Perfil */}
      <ModalPerfil
        isOpen={showPerfil}
        onClose={() => setShowPerfil(false)}
        user={user}
        dadosAluno={dadosAluno}
        nome={nome}
        foto={foto}
        onUpdateProfile={handleUpdateProfile}
      />
    </div>
  );
};

export default Dashboard;
