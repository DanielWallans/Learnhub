import { useNavigate } from "react-router-dom";
import "./home.css";

function Home() {
  const navigate = useNavigate();

  const handleLoginAluno = () => {
    navigate('/loginAluno');
  };

  const handleCadastroAluno = () => {
    navigate('/cadastroAluno');
  };

  return (
    <div className="home-welcome">
      <div className="welcome-container">
        <div className="welcome-header">
          <h1 className="welcome-title">
            Bem-vindo ao <span className="brand-name">LearnHub</span>
          </h1>
          <p className="welcome-subtitle">
            Sua plataforma de aprendizado personalizada
          </p>
        </div>

        <div className="welcome-actions">
          <div className="action-card">
            <h3>Já tem uma conta?</h3>
            <p>Acesse sua conta de estudante</p>
            <button 
              className="welcome-btn login-btn"
              onClick={handleLoginAluno}
            >
              Fazer Login
            </button>
          </div>

          <div className="action-card">
            <h3>Novo por aqui?</h3>
            <p>Crie sua conta de estudante</p>
            <button 
              className="welcome-btn signup-btn"
              onClick={handleCadastroAluno}
            >
              Criar Conta
            </button>
          </div>
        </div>

        <div className="welcome-features">
          <div className="feature-item">
            <div className="feature-icon">📚</div>
            <h4>Organização</h4>
            <p>Mantenha seus estudos organizados</p>
          </div>
          <div className="feature-item">
            <div className="feature-icon">📊</div>
            <h4>Progresso</h4>
            <p>Acompanhe seu desenvolvimento</p>
          </div>
          <div className="feature-item">
            <div className="feature-icon">🎯</div>
            <h4>Metas</h4>
            <p>Defina e alcance seus objetivos</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
