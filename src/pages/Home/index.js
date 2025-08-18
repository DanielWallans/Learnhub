import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../../firebaseConfig";
import Footer from "../../components/Footer";
import "./home.css";

function Home() {
  const navigate = useNavigate();

  const handleLoginAluno = () => {
    navigate('/login-aluno');
  };

  const handleCadastroAluno = () => {
    navigate('/cadastro-aluno');
  };

  const handleLogout = async () => {
    try {
      console.log('Fazendo logout...');
      await signOut(auth);
      console.log('Logout realizado com sucesso');
      navigate('/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  return (
    <div className="futuristic-home">
      {/* Cabeçalho Futurista */}
      <header className="futuristic-header">
        <div className="header-content">
          <div className="logo-container">
            <h1 className="logo-text">
              <span className="logo-learn">Learn</span>
              <span className="logo-hub">Hub</span>
            </h1>
          </div>
          <nav className="header-nav">
            <span className="nav-indicator">Sistema de Aprendizado</span>
            <button 
              className="logout-btn"
              onClick={handleLogout}
            >
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M16 17L21 12L16 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Logout
            </button>
          </nav>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="main-content">
        <div className="hero-section">
          <div className="welcome-message">
            <h2 className="hero-title">
              Bem-vindo ao Futuro do
              <span className="gradient-text"> Aprendizado</span>
            </h2>
            <p className="hero-subtitle">
              Transforme sua jornada educacional com tecnologia de ponta
            </p>
          </div>

          <div className="project-description">
            <div className="description-card">
              <div className="card-icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L2 7V10C2 16 6 20.5 12 22C18 20.5 22 16 22 10V7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3>O que é o LearnHub?</h3>
              <p>
                Uma plataforma inteligente que revoluciona a forma como você organiza seus estudos, 
                acompanha seu progresso e alcança seus objetivos acadêmicos. Com ferramentas avançadas 
                de planejamento, análise de desempenho e gamificação, transformamos o aprendizado 
                em uma experiência envolvente e eficiente.
              </p>
            </div>
          </div>

          <div className="action-buttons">
            <button 
              className="futuristic-btn login-btn"
              onClick={handleLoginAluno}
            >
              <div className="btn-icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M10 17L15 12L10 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M15 12H3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="btn-content">
                <span className="btn-title">Acessar Conta</span>
                <span className="btn-subtitle">Login de Estudante</span>
              </div>
            </button>

            <button 
              className="futuristic-btn signup-btn"
              onClick={handleCadastroAluno}
            >
              <div className="btn-icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16 21V19C16 17.9391 15.5786 16.9217 14.8284 16.1716C14.0783 15.4214 13.0609 15 12 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="8.5" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <line x1="20" y1="8" x2="20" y2="14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <line x1="17" y1="11" x2="23" y2="11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="btn-content">
                <span className="btn-title">Criar Conta</span>
                <span className="btn-subtitle">Cadastro de Estudante</span>
              </div>
            </button>
          </div>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 7V3M16 7V3M7 11H17M5 21H19C19.5304 21 20.0391 20.7893 20.4142 20.4142C20.7893 20.0391 21 19.5304 21 19V7C21 6.46957 20.7893 5.96086 20.4142 5.58579C20.0391 5.21071 19.5304 5 19 5H5C4.46957 5 3.96086 5.21071 3.58579 5.58579C3.21071 5.96086 3 6.46957 3 7V19C3 19.5304 3.21071 20.0391 3.58579 20.4142C3.96086 20.7893 4.46957 21 5 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h4>Planejamento de Estudos</h4>
              <p>Organize sua agenda acadêmica e acompanhe suas tarefas</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 19.5C4 18.837 4.26339 18.2011 4.73223 17.7322C5.20107 17.2634 5.83696 17 6.5 17H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M6.5 2H20V22H6.5C5.83696 22 5.20107 21.7366 4.73223 21.2678C4.26339 20.7989 4 20.163 4 19.5V4.5C4 3.83696 4.26339 3.20107 4.73223 2.73223C5.20107 2.26339 5.83696 2 6.5 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M9 7H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M9 11H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h4>Biblioteca Pessoal</h4>
              <p>Organize seus recursos de estudo e materiais acadêmicos</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19 14C19 15.1046 18.1046 16 17 16H5C3.89543 16 3 15.1046 3 14M12 10L8 6M12 10L16 6M12 10V20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h4>Gestão de Projetos</h4>
              <p>Organize seus projetos acadêmicos e conquiste seus objetivos</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer Futurista */}
      <Footer />

      {/* Efeitos de fundo */}
      <div className="bg-effects">
        <div className="particle particle-1"></div>
        <div className="particle particle-2"></div>
        <div className="particle particle-3"></div>
        <div className="grid-overlay"></div>
      </div>
    </div>
  );
}

export default Home;
