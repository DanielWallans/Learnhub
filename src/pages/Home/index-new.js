import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../../firebaseConfig";
import "./home.css";

function Home() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [greeting, setGreeting] = useState("");
  const navigate = useNavigate();

  // Atualiza o relógio em tempo real
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Define saudação baseada no horário
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Bom dia");
    else if (hour < 18) setGreeting("Boa tarde");
    else setGreeting("Boa noite");
  }, []);

  // Monitora autenticação
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          const userDoc = await getDoc(doc(db, "usuarios", currentUser.uid));
          if (userDoc.exists()) {
            setUser({
              ...currentUser,
              ...userDoc.data()
            });
          } else {
            setUser(currentUser);
          }
        } catch (error) {
          console.error("Erro ao buscar dados do usuário:", error);
          setUser(currentUser);
        }
      } else {
        navigate("/login");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="home-loading">
        <div className="loading-content">
          <div className="loading-logo">
            <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
              <path d="M6 12v5c3 3 9 3 12 0v-5"/>
            </svg>
          </div>
          <div className="loading-spinner"></div>
          <p>Carregando seu espaço...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="home-ultra-modern">
      {/* Sidebar futurista */}
      <aside className="futuristic-sidebar">
        <div className="sidebar-header">
          <div className="logo-container">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
              <path d="M6 12v5c3 3 9 3 12 0v-5"/>
            </svg>
            <span className="logo-text">LearnHub</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section">
            <span className="nav-section-title">Principal</span>
            <ul className="nav-list">
              <li className="nav-item active">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                  <polyline points="9,22 9,12 15,12 15,22"/>
                </svg>
                <span>Dashboard</span>
              </li>
              <li className="nav-item">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                </svg>
                <span>Estudos</span>
              </li>
              <li className="nav-item">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12,6 12,12 16,14"/>
                </svg>
                <span>Agenda</span>
              </li>
              <li className="nav-item">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="20" x2="18" y2="10"/>
                  <line x1="12" y1="20" x2="12" y2="4"/>
                  <line x1="6" y1="20" x2="6" y2="14"/>
                </svg>
                <span>Progresso</span>
              </li>
            </ul>
          </div>

          <div className="nav-section">
            <span className="nav-section-title">Ferramentas</span>
            <ul className="nav-list">
              <li className="nav-item">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 19c-5 0-8-3-8-6 0-3 3-6 8-6s8 3 8 6c0 3-3 6-8 6z"/>
                  <path d="M17 11c1.5 0 3-1 3-3s-1.5-3-3-3"/>
                </svg>
                <span>Metas</span>
              </li>
              <li className="nav-item">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
                </svg>
                <span>Configurações</span>
              </li>
            </ul>
          </div>
        </nav>

        <div className="sidebar-footer">
          <div className="user-profile">
            <div className="user-avatar">
              <span>{user?.nome ? user.nome.charAt(0).toUpperCase() : user?.email?.charAt(0).toUpperCase() || "U"}</span>
            </div>
            <div className="user-info">
              <span className="user-name">{user?.nome || "Usuário"}</span>
              <span className="user-email">{user?.email}</span>
            </div>
          </div>
          <button onClick={handleLogout} className="logout-btn" title="Sair">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16,17 21,12 16,7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </button>
        </div>
      </aside>

      {/* Conteúdo principal */}
      <main className="main-content">
        {/* Header do conteúdo */}
        <header className="content-header">
          <div className="header-left">
            <h1 className="page-title">
              {greeting}, <span className="highlight">{user?.nome || "Usuário"}</span>
            </h1>
            <p className="page-subtitle">Bem-vindo de volta ao seu espaço de aprendizado</p>
          </div>
          <div className="header-right">
            <div className="time-display">
              <div className="current-time">{formatTime(currentTime)}</div>
              <div className="current-date">{formatDate(currentTime)}</div>
            </div>
          </div>
        </header>

        {/* Grid de cards principais */}
        <div className="dashboard-grid">
          {/* Card de estatísticas rápidas */}
          <div className="dashboard-card stats-card">
            <div className="card-header">
              <h3>Estatísticas Hoje</h3>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="20" x2="18" y2="10"/>
                <line x1="12" y1="20" x2="12" y2="4"/>
                <line x1="6" y1="20" x2="6" y2="14"/>
              </svg>
            </div>
            <div className="stats-grid">
              <div className="stat-item">
                <div className="stat-value">4h 30m</div>
                <div className="stat-label">Tempo de estudo</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">12</div>
                <div className="stat-label">Tarefas concluídas</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">85%</div>
                <div className="stat-label">Meta diária</div>
              </div>
            </div>
          </div>

          {/* Card de progresso semanal */}
          <div className="dashboard-card progress-card">
            <div className="card-header">
              <h3>Progresso Semanal</h3>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
              </svg>
            </div>
            <div className="progress-visual">
              <div className="progress-circle">
                <svg viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" className="progress-bg"/>
                  <circle cx="50" cy="50" r="45" className="progress-fill" style={{"--progress": "75%"}}/>
                </svg>
                <div className="progress-text">
                  <span className="progress-value">75%</span>
                  <span className="progress-label">Completo</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card de tarefas pendentes */}
          <div className="dashboard-card tasks-card">
            <div className="card-header">
              <h3>Próximas Tarefas</h3>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 11H6l.5-1.5"/>
                <path d="M15 11h3l-.5-1.5"/>
                <path d="M12 16v6"/>
                <circle cx="12" cy="12" r="9"/>
              </svg>
            </div>
            <div className="tasks-list">
              <div className="task-item">
                <div className="task-priority high"></div>
                <div className="task-content">
                  <span className="task-title">Revisar Matemática</span>
                  <span className="task-time">14:00 - 15:30</span>
                </div>
              </div>
              <div className="task-item">
                <div className="task-priority medium"></div>
                <div className="task-content">
                  <span className="task-title">Projeto de História</span>
                  <span className="task-time">16:00 - 17:00</span>
                </div>
              </div>
              <div className="task-item">
                <div className="task-priority low"></div>
                <div className="task-content">
                  <span className="task-title">Leitura - Capítulo 5</span>
                  <span className="task-time">19:00 - 20:00</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card de quick actions */}
          <div className="dashboard-card actions-card">
            <div className="card-header">
              <h3>Ações Rápidas</h3>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="13,2 3,14 12,14 11,22 21,10 12,10 13,2"/>
              </svg>
            </div>
            <div className="actions-grid">
              <button className="action-btn">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12,6 12,12 16,14"/>
                </svg>
                <span>Iniciar Timer</span>
              </button>
              <button className="action-btn">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14,2 14,8 20,8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                  <polyline points="10,9 9,9 8,9"/>
                </svg>
                <span>Nova Nota</span>
              </button>
              <button className="action-btn">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 19c-5 0-8-3-8-6 0-3 3-6 8-6s8 3 8 6c0 3-3 6-8 6z"/>
                  <path d="M17 11c1.5 0 3-1 3-3s-1.5-3-3-3"/>
                </svg>
                <span>Definir Meta</span>
              </button>
              <button className="action-btn">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                </svg>
                <span>Novo Curso</span>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Home;
