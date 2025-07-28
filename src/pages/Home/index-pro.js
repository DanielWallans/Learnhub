import { useNavigate } from "react-router-dom";
import "./home.css";

function Home() {
  const navigate = useNavigate();

  const handleLoginAluno = () => {
    navigate('/login-aluno');
  };

  const handleCadastroAluno = () => {
    navigate('/cadastro-aluno');
  };

  return (
    <div className="futuristic-home">
      {/* Cabeçalho Futurista */}
      <header className="futuristic-header">
        <div className="header-content">
          <div className="logo-container">
            <div className="logo-glow"></div>
            <h1 className="logo-text">
              <span className="logo-learn">Learn</span>
              <span className="logo-hub">Hub</span>
            </h1>
            <div className="logo-underline"></div>
          </div>
          <nav className="header-nav">
            <span className="nav-indicator">Sistema de Aprendizado</span>
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
                  <path d="M9 11H15M9 15H15M17 21L12 16L7 21V5C7 4.46957 7.21071 3.96086 7.58579 3.58579C7.96086 3.21071 8.46957 3 9 3H15C15.5304 3 16.0391 3.21071 16.4142 3.58579C16.7893 3.96086 17 4.46957 17 5V21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h4>Organização Inteligente</h4>
              <p>Sistema avançado de planejamento de estudos com IA</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22 12H18L15 21L9 3L6 12H2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h4>Análise de Performance</h4>
              <p>Métricas detalhadas do seu progresso acadêmico</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22 11.08V12C21.9988 14.1564 21.3005 16.2547 20.0093 17.9818C18.7182 19.7088 16.9033 20.9725 14.8354 21.5839C12.7674 22.1953 10.5573 22.1219 8.53447 21.3746C6.51168 20.6273 4.78465 19.2461 3.61096 17.4371C2.43727 15.628 1.87979 13.4905 2.02168 11.3363C2.16356 9.18203 2.99721 7.13214 4.39828 5.49883C5.79935 3.86553 7.69279 2.72636 9.79619 2.24223C11.8996 1.75809 14.1003 1.9548 16.07 2.81" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M22 4L12 14.01L9 11.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h4>Metas Personalizadas</h4>
              <p>Defina e conquiste objetivos sob medida para você</p>
            </div>
          </div>
        </div>
      </main>

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
