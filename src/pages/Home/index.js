import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../../firebaseConfig";
import "./home.css";
import Header from "../../components/Header";
import Dashboard from "../../components/Dashboard";

function Home() {
  const [perfil, setPerfil] = useState("");
  const [apresentacao, setApresentacao] = useState(true);
  const [mensagemBoasVindas, setMensagemBoasVindas] = useState("");
  const [loading, setLoading] = useState(true);
  const [nomeUsuario, setNomeUsuario] = useState("");
  const navigate = useNavigate();

  // Define a saudação baseada no horário atual
  useEffect(() => {
    const horaAtual = new Date().getHours();
    if (horaAtual < 12) {
      setMensagemBoasVindas("Bom dia");
    } else if (horaAtual < 18) {
      setMensagemBoasVindas("Boa tarde");
    } else {
      setMensagemBoasVindas("Boa noite");
    }

    // Monitora mudanças no estado de autenticação
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, "usuarios", user.uid));
        if (userDoc.exists()) {
          setPerfil(userDoc.data().perfil);
          setNomeUsuario(userDoc.data().nome || "");
          setApresentacao(false);
        }
      }
      // Pequeno delay para melhor UX
      setTimeout(() => setLoading(false), 800);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setPerfil("");
      setApresentacao(true);
      navigate("/");
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  // Componente da apresentação inicial - VERSÃO MODERNIZADA
  function Apresentacao({ mensagemBoasVindas, nomeUsuario, setApresentacao }) {
    const [currentFeature, setCurrentFeature] = useState(0);

    const features = [
      {
        icon: (
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
          </svg>
        ),
        title: "Organize seus estudos",
        description: "Crie planos de estudo personalizados e acompanhe seu progresso de forma inteligente",
        color: "#3b82f6",
        accent: "#dbeafe"
      },
      {
        icon: (
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12,6 12,12 16,14"/>
          </svg>
        ),
        title: "Gerencie seu tempo",
        description: "Otimize sua rotina com cronogramas eficientes e lembretes inteligentes",
        color: "#10b981",
        accent: "#d1fae5"
      },
      {
        icon: (
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <line x1="18" y1="20" x2="18" y2="10"/>
            <line x1="12" y1="20" x2="12" y2="4"/>
            <line x1="6" y1="20" x2="6" y2="14"/>
          </svg>
        ),
        title: "Acompanhe resultados", 
        description: "Visualize estatísticas detalhadas e insights sobre sua evolução acadêmica",
        color: "#8b5cf6",
        accent: "#ede9fe"
      },
      {
        icon: (
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
        ),
        title: "Alcance seus objetivos",
        description: "Transforme sonhos em metas alcançáveis com planejamento estratégico",
        color: "#f59e0b",
        accent: "#fef3c7"
      }
    ];

    // Rotaciona automaticamente os recursos destacados
    useEffect(() => {
      const interval = setInterval(() => {
        setCurrentFeature((prev) => (prev + 1) % features.length);
      }, 4000);
      return () => clearInterval(interval);
    }, [features.length]);

    return (
      <div className="apresentacao-moderna">
        <div className="apresentacao-wrapper">
          {/* Seção Hero Modernizada */}
          <div className="hero-moderno">
            <div className="hero-badge">
              <span className="badge-icon">✨</span>
              <span className="badge-texto">Bem-vindo ao futuro dos estudos</span>
            </div>
            
            <h1 className="hero-titulo-moderno">
              {mensagemBoasVindas}
              {nomeUsuario && <span className="nome-destaque">, {nomeUsuario}</span>}!
            </h1>
            
            <p className="hero-subtitulo-moderno">
              Transforme sua jornada acadêmica com a plataforma mais <strong>completa</strong> e 
              <strong> inteligente</strong> de organização e produtividade para estudantes
            </p>

            {/* Destaques rápidos */}
            <div className="hero-destaques">
              <div className="destaque-item">
                <span className="destaque-icone">🎯</span>
                <span className="destaque-texto">Metas inteligentes</span>
              </div>
              <div className="destaque-item">
                <span className="destaque-icone">📊</span>
                <span className="destaque-texto">Análises detalhadas</span>
              </div>
              <div className="destaque-item">
                <span className="destaque-icone">⚡</span>
                <span className="destaque-texto">Resultados rápidos</span>
              </div>
            </div>
          </div>

          {/* Showcase interativo das funcionalidades */}
          <div className="funcionalidades-showcase">
            <div className="funcionalidade-destaque">
              <div 
                className="funcionalidade-card-principal"
                style={{ 
                  '--feature-color': features[currentFeature].color,
                  '--feature-accent': features[currentFeature].accent
                }}
              >
                <div className="feature-icon-principal">
                  {features[currentFeature].icon}
                </div>
                <div className="feature-conteudo-principal">
                  <h3 className="feature-titulo-principal">{features[currentFeature].title}</h3>
                  <p className="feature-descricao-principal">{features[currentFeature].description}</p>
                </div>
              </div>
            </div>

            {/* Mini cards das outras funcionalidades */}
            <div className="funcionalidades-mini">
              {features.map((feature, index) => (
                <div 
                  key={index}
                  className={`funcionalidade-mini ${index === currentFeature ? 'ativa' : ''}`}
                  onClick={() => setCurrentFeature(index)}
                  style={{ '--mini-color': feature.color }}
                >
                  <div className="mini-icon">{feature.icon}</div>
                  <span className="mini-titulo">{feature.title}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Call to Action modernizado */}
          <div className="cta-moderno">
            <button 
              className="btn-comecar-moderno"
              onClick={() => setApresentacao(false)}
            >
              <span className="btn-texto">Começar minha jornada</span>
              <div className="btn-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M7 17l10-10"/>
                  <path d="M7 7h10v10"/>
                </svg>
              </div>
            </button>
          </div>
        </div>
        
        {/* Elementos decorativos */}
        <div className="elementos-decorativos">
          <div className="elemento-flutuante elemento-1"></div>
          <div className="elemento-flutuante elemento-2"></div>
          <div className="elemento-flutuante elemento-3"></div>
        </div>
      </div>
    );
  }

  // Componente para seleção de perfil do usuário
  function EscolhaPerfil({ setPerfil, navigate }) {
    const [currentFeature, setCurrentFeature] = useState(0);

    const features = [
      {
        icon: (
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
            <path d="M6 12v5c3 3 9 3 12 0v-5"/>
          </svg>
        ),
        title: "Educação personalizada",
        description: "Adapte seus estudos ao seu ritmo e estilo de aprendizagem único"
      },
      {
        icon: (
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M9 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2h-4"/>
            <path d="M9 11V9a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/>
            <circle cx="12" cy="16" r="1"/>
          </svg>
        ),
        title: "Insights inteligentes", 
        description: "Receba recomendações baseadas em seu desempenho e progresso"
      },
      {
        icon: (
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/>
            <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
            <path d="M4 22h16"/>
            <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/>
            <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
            <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>
          </svg>
        ),
        title: "Conquiste objetivos",
        description: "Transforme sonhos em metas alcançáveis com planejamento estratégico"
      }
    ];

    const opcoes = [
      {
        tipo: "Login",
        titulo: "Fazer Login",
        icone: (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
            <polyline points="10,17 15,12 10,7"/>
            <line x1="15" y1="12" x2="3" y2="12"/>
          </svg>
        ),
        descricao: "Acesse sua conta e continue sua jornada de aprendizado personalizada.",
        acao: () => navigate("/login-aluno"),
        cor: "#667eea",
        gradiente: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
      },
      {
        tipo: "Cadastro",
        titulo: "Criar Conta",
        icone: (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
        ),
        descricao: "Comece sua transformação acadêmica com uma conta gratuita no LearnHub.",
        acao: () => navigate("/cadastro-aluno"),
        cor: "#34d399",
        gradiente: "linear-gradient(135deg, #34d399 0%, #10b981 100%)"
      }
    ];

    // Debug: Console para verificar se estamos na versão mais atual
    console.log("🚀 EscolhaPerfil renderizada - Versão ATUALIZADA sem botão convidado");

    useEffect(() => {
      const interval = setInterval(() => {
        setCurrentFeature((prev) => (prev + 1) % features.length);
      }, 3500);
      return () => clearInterval(interval);
    }, [features.length]);

    return (
      <div className="escolha-perfil-container">
        <div className="escolha-content">
          {/* Header melhorado */}
          <div className="escolha-header">
            <div className="welcome-badge">
              <span className="badge-text">Bem-vindo ao futuro dos estudos</span>
            </div>
            <h2 className="escolha-title">Pronto para revolucionar seus estudos?</h2>
            <p className="escolha-subtitle">
              O LearnHub combina tecnologia avançada com metodologias comprovadas 
              para potencializar seu aprendizado de forma única e eficiente.
            </p>
            
            {/* Feature dinâmica melhorada */}
            <div className="feature-showcase-mini">
              <div className="feature-item-showcase">
                <div className="feature-icon-mini">{features[currentFeature].icon}</div>
                <div className="feature-text-mini">
                  <h4 className="feature-title-mini">{features[currentFeature].title}</h4>
                  <p className="feature-description-mini">{features[currentFeature].description}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Opções de acesso */}
          <div className="opcoes-container">
            {opcoes.map((opcao, index) => (
              <div
                key={opcao.tipo}
                className={`perfil-card card-${index + 1}`}
                onClick={opcao.acao}
                style={{'--card-color': opcao.cor}}
              >
                <div className="card-icon">{opcao.icone}</div>
                <div className="card-content">
                  <div className="card-header">
                    <h4 className="card-titulo">{opcao.titulo}</h4>
                    <span className="card-subtitulo">{opcao.tipo}</span>
                  </div>
                  <p className="card-descricao">{opcao.descricao}</p>
                </div>
                <div className="card-arrow">→</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const renderPlanejamento = () => {
    if (apresentacao) {
      return (
        <Apresentacao 
          mensagemBoasVindas={mensagemBoasVindas} 
          nomeUsuario={nomeUsuario}
          setApresentacao={setApresentacao} 
        />
      );
    }

    switch (perfil) {
      case "Aluno":
        return <Dashboard />;
      default:
        return <EscolhaPerfil key="escolha-perfil-updated" setPerfil={setPerfil} navigate={navigate} />;
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-content">
          <div className="logo-loading">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
              <path d="M6 12v5c3 3 9 3 12 0v-5"/>
            </svg>
          </div>
          <div className="loading-spinner"></div>
          <p className="loading-text">Carregando LearnHub...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="home-container">
      <Header perfil={perfil} setPerfil={setPerfil} onLogout={handleLogout} />
      {renderPlanejamento()}
    </div>
  );
}

export default Home;