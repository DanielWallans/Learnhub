import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, auth } from '../firebaseConfig';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  doc,
  onSnapshot,
  getDoc
} from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import './projetos.css';
import {
  FaRocket,
  FaBolt,
  FaStore,
  FaPlus,
  FaTrash,
  FaEdit,
  FaCheck,
  FaClock,
  FaTimes,
  FaArrowLeft,
  FaStar,
  FaTrophy,
  FaLightbulb,
  FaLink,
  FaLinkedin,
  FaGlobe,
  FaCalendar,

  FaDollarSign,
  FaUsers,
  FaChartLine,
  FaCloudUploadAlt,
  FaBookOpen,
  FaPalette,
  FaCode,
  FaCamera,
  FaMusic,
  FaVideo,
  FaNewspaper,
  FaHandshake,
  FaGraduationCap,
  FaClipboardList
} from 'react-icons/fa';

const ModuloProjetos = () => {
  const navigate = useNavigate();
  const [user, loading, error] = useAuthState(auth);
  const [activeTab, setActiveTab] = useState('portfolio');
  
  // Estados para cada seção
  const [portfolios, setPortfolios] = useState([]);
  const [desafios, setDesafios] = useState([]);
  const [miniNegocios, setMiniNegocios] = useState([]);

  // Memoização das abas
  const tabs = useMemo(() => [
    { 
      id: 'portfolio', 
      nome: 'Portfólio Digital', 
      icone: FaRocket,
      cor: '#3b82f6',
      descricao: 'Crie seu portfólio profissional'
    },
    { 
      id: 'desafio', 
      nome: 'Desafio de Habilidade', 
      icone: FaBolt,
      cor: '#10b981',
      descricao: 'Desenvolva uma nova habilidade'
    },
    { 
      id: 'negocio', 
      nome: 'Meu Mini-Negócio', 
      icone: FaStore,
      cor: '#f59e0b',
      descricao: 'Planeje seu projeto empreendedor'
    }
  ], []);

  // Handlers memoizados
  const handleTabChange = useCallback((tabId) => {
    setActiveTab(tabId);
  }, []);

  const handleBackToDashboard = useCallback(() => {
    navigate('/dashboard');
  }, [navigate]);

  // Componente Portfólio Digital
  const PortfolioDigital = () => {
    const [novoPortfolio, setNovoPortfolio] = useState({
      titulo: '',
      tipo: 'linktree',
      descricao: '',
      url: '',
      habilidades: [],
      projetos: [],
      status: 'planejando'
    });
    const [mostrarFormulario, setMostrarFormulario] = useState(false);

    const tiposPortfolio = [
      { id: 'linktree', nome: 'Linktree', icone: FaLink, descricao: 'Links organizados em uma página' },
      { id: 'blog', nome: 'Blog Pessoal', icone: FaBookOpen, descricao: 'Blog para compartilhar conhecimento' },
      { id: 'linkedin', nome: 'LinkedIn Otimizado', icone: FaLinkedin, descricao: 'Perfil profissional completo' },
      { id: 'website', nome: 'Website Próprio', icone: FaGlobe, descricao: 'Site pessoal personalizado' }
    ];

    const adicionarPortfolio = async () => {
      if (!novoPortfolio.titulo.trim()) return;

      const portfolio = {
        ...novoPortfolio,
        id: Date.now().toString(),
        dataCriacao: new Date().toISOString(),
        userId: user?.uid || 'local'
      };

      try {
        if (user) {
          await addDoc(collection(db, 'portfolios'), portfolio);
        } else {
          const novosPortfolios = [...portfolios, portfolio];
          setPortfolios(novosPortfolios);
          localStorage.setItem('projetos_portfolios', JSON.stringify(novosPortfolios));
        }
        
        setNovoPortfolio({
          titulo: '',
          tipo: 'linktree',
          descricao: '',
          url: '',
          habilidades: [],
          projetos: [],
          status: 'planejando'
        });
        setMostrarFormulario(false);
      } catch (error) {
        console.error('Erro ao adicionar portfólio:', error);
      }
    };

    const atualizarStatus = async (id, novoStatus) => {
      try {
        if (user) {
          const portfolioRef = doc(db, 'portfolios', id);
          await updateDoc(portfolioRef, { status: novoStatus });
        } else {
          const portfoliosAtualizados = portfolios.map(p => 
            p.id === id ? { ...p, status: novoStatus } : p
          );
          setPortfolios(portfoliosAtualizados);
          localStorage.setItem('projetos_portfolios', JSON.stringify(portfoliosAtualizados));
        }
      } catch (error) {
        console.error('Erro ao atualizar status:', error);
      }
    };

    const removerPortfolio = async (id) => {
      try {
        if (user) {
          await deleteDoc(doc(db, 'portfolios', id));
        } else {
          const portfoliosAtualizados = portfolios.filter(p => p.id !== id);
          setPortfolios(portfoliosAtualizados);
          localStorage.setItem('projetos_portfolios', JSON.stringify(portfoliosAtualizados));
        }
      } catch (error) {
        console.error('Erro ao remover portfólio:', error);
      }
    };

    return (
      <div className="portfolio-section">
        <div className="section-header">
          <h2><FaRocket /> Portfólio Digital</h2>
          <p>Crie uma presença digital profissional para mostrar suas habilidades e conquistas</p>
        </div>

        <div className="portfolio-actions">
          <button 
            className="btn-primary"
            onClick={() => setMostrarFormulario(!mostrarFormulario)}
          >
            <FaPlus /> Novo Portfólio
          </button>
        </div>

        {mostrarFormulario && (
          <div className="portfolio-form">
            <div className="form-group">
              <label>Título do Portfólio</label>
              <input
                type="text"
                value={novoPortfolio.titulo}
                onChange={(e) => setNovoPortfolio({...novoPortfolio, titulo: e.target.value})}
                placeholder="Ex: Meu Portfólio de Design"
              />
            </div>

            <div className="form-group">
              <label>Tipo de Portfólio</label>
              <div className="portfolio-tipos">
                {tiposPortfolio.map(tipo => {
                  const IconeTipo = tipo.icone;
                  return (
                    <div 
                      key={tipo.id}
                      className={`tipo-card ${novoPortfolio.tipo === tipo.id ? 'selected' : ''}`}
                      onClick={() => setNovoPortfolio({...novoPortfolio, tipo: tipo.id})}
                    >
                      <IconeTipo />
                      <h4>{tipo.nome}</h4>
                      <p>{tipo.descricao}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="form-group">
              <label>Descrição</label>
              <textarea
                value={novoPortfolio.descricao}
                onChange={(e) => setNovoPortfolio({...novoPortfolio, descricao: e.target.value})}
                placeholder="Descreva o objetivo do seu portfólio..."
                rows={3}
              />
            </div>

            <div className="form-actions">
              <button className="btn-secondary" onClick={() => setMostrarFormulario(false)}>
                Cancelar
              </button>
              <button className="btn-primary" onClick={adicionarPortfolio}>
                Criar Portfólio
              </button>
            </div>
          </div>
        )}

        <div className="portfolios-grid">
          {portfolios.map(portfolio => {
            const TipoIcon = tiposPortfolio.find(t => t.id === portfolio.tipo)?.icone || FaGlobe;
            return (
              <div key={portfolio.id} className="portfolio-card">
                <div className="portfolio-header">
                  <div className="portfolio-icon">
                    <TipoIcon />
                  </div>
                  <div className="portfolio-info">
                    <h3>{portfolio.titulo}</h3>
                    <span className={`status-badge ${portfolio.status}`}>
                      {portfolio.status === 'planejando' && <FaClock />}
                      {portfolio.status === 'desenvolvendo' && <FaEdit />}
                      {portfolio.status === 'concluido' && <FaCheck />}
                      {portfolio.status === 'planejando' ? 'Planejando' : 
                       portfolio.status === 'desenvolvendo' ? 'Desenvolvendo' : 'Concluído'}
                    </span>
                  </div>
                  <button 
                    className="btn-remove"
                    onClick={() => removerPortfolio(portfolio.id)}
                  >
                    <FaTrash />
                  </button>
                </div>
                
                <p className="portfolio-description">{portfolio.descricao}</p>
                
                {portfolio.url && (
                  <div className="portfolio-url">
                    <FaLink /> <a href={portfolio.url} target="_blank" rel="noopener noreferrer">{portfolio.url}</a>
                  </div>
                )}

                <div className="portfolio-actions-card">
                  <select 
                    value={portfolio.status}
                    onChange={(e) => atualizarStatus(portfolio.id, e.target.value)}
                  >
                    <option value="planejando">Planejando</option>
                    <option value="desenvolvendo">Desenvolvendo</option>
                    <option value="concluido">Concluído</option>
                  </select>
                </div>
              </div>
            );
          })}
        </div>

        {portfolios.length === 0 && (
          <div className="empty-state">
            <FaRocket className="empty-icon" />
            <h3>Nenhum portfólio criado ainda</h3>
            <p>Comece criando seu primeiro portfólio digital para mostrar suas habilidades ao mundo!</p>
          </div>
        )}

        <div className="portfolio-tips">
          <h3><FaLightbulb /> Dicas para um Portfólio Eficaz</h3>
          <div className="tips-grid">
            <div className="tip-card">
              <FaStar />
              <h4>Seja Autêntico</h4>
              <p>Mostre sua personalidade e paixões, não apenas habilidades técnicas</p>
            </div>
            <div className="tip-card">
              <FaBolt />
              <h4>Foque na Qualidade</h4>
              <p>Melhor ter poucos projetos bem apresentados do que muitos mal explicados</p>
            </div>
            <div className="tip-card">
              <FaChartLine />
              <h4>Conte uma História</h4>
              <p>Explique o processo, desafios enfrentados e lições aprendidas</p>
            </div>
            <div className="tip-card">
              <FaUsers />
              <h4>Facilite o Contato</h4>
              <p>Deixe claro como as pessoas podem entrar em contato com você</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Componente Desafio de Habilidade
  const DesafioHabilidade = () => {
    const [novoDesafio, setNovoDesafio] = useState({
      habilidade: '',
      categoria: 'tecnica',
      duracao: '30',
      descricao: '',
      metas: [],
      recursos: [],
      status: 'planejando'
    });
    const [mostrarFormulario, setMostrarFormulario] = useState(false);

    const categorias = [
      { id: 'tecnica', nome: 'Técnica', icone: FaCode, exemplos: ['Excel', 'Python', 'Photoshop'] },
      { id: 'criativa', nome: 'Criativa', icone: FaPalette, exemplos: ['Design Gráfico', 'Fotografia', 'Escrita'] },
      { id: 'comunicacao', nome: 'Comunicação', icone: FaUsers, exemplos: ['Apresentações', 'Inglês', 'Oratória'] },
      { id: 'negocio', nome: 'Negócios', icone: FaChartLine, exemplos: ['Marketing', 'Vendas', 'Gestão'] }
    ];

    const adicionarDesafio = async () => {
      if (!novoDesafio.habilidade.trim()) return;

      const desafio = {
        ...novoDesafio,
        id: Date.now().toString(),
        dataCriacao: new Date().toISOString(),
        dataInicio: null,
        dataFim: null,
        progresso: 0,
        userId: user?.uid || 'local'
      };

      try {
        if (user) {
          await addDoc(collection(db, 'desafios_habilidade'), desafio);
        } else {
          const novosDesafios = [...desafios, desafio];
          setDesafios(novosDesafios);
          localStorage.setItem('projetos_desafios', JSON.stringify(novosDesafios));
        }
        
        setNovoDesafio({
          habilidade: '',
          categoria: 'tecnica',
          duracao: '30',
          descricao: '',
          metas: [],
          recursos: [],
          status: 'planejando'
        });
        setMostrarFormulario(false);
      } catch (error) {
        console.error('Erro ao adicionar desafio:', error);
      }
    };

    const iniciarDesafio = async (id) => {
      const dataInicio = new Date().toISOString();
      const desafio = desafios.find(d => d.id === id);
      const dataFim = new Date(Date.now() + parseInt(desafio.duracao) * 24 * 60 * 60 * 1000).toISOString();

      try {
        if (user) {
          const desafioRef = doc(db, 'desafios_habilidade', id);
          await updateDoc(desafioRef, { 
            status: 'em_andamento', 
            dataInicio,
            dataFim
          });
        } else {
          const desafiosAtualizados = desafios.map(d => 
            d.id === id ? { ...d, status: 'em_andamento', dataInicio, dataFim } : d
          );
          setDesafios(desafiosAtualizados);
          localStorage.setItem('projetos_desafios', JSON.stringify(desafiosAtualizados));
        }
      } catch (error) {
        console.error('Erro ao iniciar desafio:', error);
      }
    };

    const atualizarProgresso = async (id, novoProgresso) => {
      try {
        if (user) {
          const desafioRef = doc(db, 'desafios_habilidade', id);
          await updateDoc(desafioRef, { progresso: novoProgresso });
        } else {
          const desafiosAtualizados = desafios.map(d => 
            d.id === id ? { ...d, progresso: novoProgresso } : d
          );
          setDesafios(desafiosAtualizados);
          localStorage.setItem('projetos_desafios', JSON.stringify(desafiosAtualizados));
        }
      } catch (error) {
        console.error('Erro ao atualizar progresso:', error);
      }
    };

    const removerDesafio = async (id) => {
      try {
        if (user) {
          await deleteDoc(doc(db, 'desafios_habilidade', id));
        } else {
          const desafiosAtualizados = desafios.filter(d => d.id !== id);
          setDesafios(desafiosAtualizados);
          localStorage.setItem('projetos_desafios', JSON.stringify(desafiosAtualizados));
        }
      } catch (error) {
        console.error('Erro ao remover desafio:', error);
      }
    };

    return (
      <div className="desafio-section">
        <div className="section-header">
          <h2><FaBolt /> Desafio de Habilidade</h2>
          <p>Escolha uma habilidade e desenvolva-a através de um projeto focado em 30 ou 60 dias</p>
        </div>

        <div className="desafio-actions">
          <button 
            className="btn-primary"
            onClick={() => setMostrarFormulario(!mostrarFormulario)}
          >
            <FaPlus /> Novo Desafio
          </button>
        </div>

        {mostrarFormulario && (
          <div className="desafio-form">
            <div className="form-group">
              <label>Qual habilidade você quer desenvolver?</label>
              <input
                type="text"
                value={novoDesafio.habilidade}
                onChange={(e) => setNovoDesafio({...novoDesafio, habilidade: e.target.value})}
                placeholder="Ex: Excel Avançado, Design Gráfico, Inglês..."
              />
            </div>

            <div className="form-group">
              <label>Categoria</label>
              <div className="categorias-grid">
                {categorias.map(categoria => {
                  const IconeCategoria = categoria.icone;
                  return (
                    <div 
                      key={categoria.id}
                      className={`categoria-card ${novoDesafio.categoria === categoria.id ? 'selected' : ''}`}
                      onClick={() => setNovoDesafio({...novoDesafio, categoria: categoria.id})}
                    >
                      <IconeCategoria />
                      <h4>{categoria.nome}</h4>
                      <p>Ex: {categoria.exemplos.join(', ')}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="form-group">
              <label>Duração do Desafio</label>
              <select
                value={novoDesafio.duracao}
                onChange={(e) => setNovoDesafio({...novoDesafio, duracao: e.target.value})}
              >
                <option value="30">30 dias</option>
                <option value="60">60 dias</option>
                <option value="90">90 dias</option>
              </select>
            </div>

            <div className="form-group">
              <label>Descrição do Projeto</label>
              <textarea
                value={novoDesafio.descricao}
                onChange={(e) => setNovoDesafio({...novoDesafio, descricao: e.target.value})}
                placeholder="Descreva como você pretende desenvolver essa habilidade..."
                rows={3}
              />
            </div>

            <div className="form-actions">
              <button className="btn-secondary" onClick={() => setMostrarFormulario(false)}>
                Cancelar
              </button>
              <button className="btn-primary" onClick={adicionarDesafio}>
                Criar Desafio
              </button>
            </div>
          </div>
        )}

        <div className="desafios-grid">
          {desafios.map(desafio => {
            const categoria = categorias.find(c => c.id === desafio.categoria);
            const IconeCategoria = categoria?.icone || FaBolt;
            const diasRestantes = desafio.dataFim ? 
              Math.max(0, Math.ceil((new Date(desafio.dataFim) - new Date()) / (1000 * 60 * 60 * 24))) : null;
            
            return (
              <div key={desafio.id} className="desafio-card">
                <div className="desafio-header">
                  <div className="desafio-icon">
                    <IconeCategoria />
                  </div>
                  <div className="desafio-info">
                    <h3>{desafio.habilidade}</h3>
                    <span className="categoria-badge">{categoria?.nome}</span>
                  </div>
                  <button 
                    className="btn-remove"
                    onClick={() => removerDesafio(desafio.id)}
                  >
                    <FaTrash />
                  </button>
                </div>
                
                <p className="desafio-description">{desafio.descricao}</p>
                
                <div className="desafio-meta">
                  <div className="meta-item">
                    <FaCalendar />
                    <span>{desafio.duracao} dias</span>
                  </div>
                  {diasRestantes !== null && (
                    <div className="meta-item">
                      <FaClock />
                      <span>{diasRestantes} dias restantes</span>
                    </div>
                  )}
                </div>

                {desafio.status === 'em_andamento' && (
                  <div className="progresso-section">
                    <label>Progresso: {desafio.progresso}%</label>
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{width: `${desafio.progresso}%`}}
                      ></div>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={desafio.progresso}
                      onChange={(e) => atualizarProgresso(desafio.id, parseInt(e.target.value))}
                    />
                  </div>
                )}

                <div className="desafio-actions-card">
                  {desafio.status === 'planejando' && (
                    <button 
                      className="btn-primary"
                      onClick={() => iniciarDesafio(desafio.id)}
                    >
                      <FaBolt /> Iniciar Desafio
                    </button>
                  )}
                  {desafio.status === 'em_andamento' && (
                    <span className="status-badge em-andamento">
                      <FaClock /> Em Andamento
                    </span>
                  )}
                  {desafio.progresso === 100 && (
                    <span className="status-badge concluido">
                      <FaTrophy /> Concluído!
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {desafios.length === 0 && (
          <div className="empty-state">
            <FaBolt className="empty-icon" />
            <h3>Nenhum desafio criado ainda</h3>
            <p>Escolha uma habilidade que você quer desenvolver e crie seu primeiro desafio!</p>
          </div>
        )}

        <div className="desafio-inspiracao">
          <h3><FaLightbulb /> Ideias de Habilidades para Desenvolver</h3>
          <div className="inspiracao-grid">
            <div className="inspiracao-categoria">
              <FaCode />
              <h4>Técnicas</h4>
              <ul>
                <li>Excel/Google Sheets Avançado</li>
                <li>Programação (Python, JavaScript)</li>
                <li>Photoshop/Canva</li>
                <li>WordPress</li>
              </ul>
            </div>
            <div className="inspiracao-categoria">
              <FaPalette />
              <h4>Criativas</h4>
              <ul>
                <li>Design Gráfico</li>
                <li>Fotografia</li>
                <li>Escrita Criativa</li>
                <li>Edição de Vídeo</li>
              </ul>
            </div>
            <div className="inspiracao-categoria">
              <FaUsers />
              <h4>Comunicação</h4>
              <ul>
                <li>Inglês/Espanhol</li>
                <li>Apresentações</li>
                <li>Oratória</li>
                <li>Networking</li>
              </ul>
            </div>
            <div className="inspiracao-categoria">
              <FaChartLine />
              <h4>Negócios</h4>
              <ul>
                <li>Marketing Digital</li>
                <li>Análise de Dados</li>
                <li>Gestão de Projetos</li>
                <li>Vendas</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Componente Mini-Negócio
  const MiniNegocio = () => {
    const [novoNegocio, setNovoNegocio] = useState({
      nome: '',
      tipo: 'produto',
      descricao: '',
      publicoAlvo: '',
      custos: '',
      receita: '',
      canaisVenda: [],
      status: 'idealizacao'
    });
    const [mostrarFormulario, setMostrarFormulario] = useState(false);

    const tiposNegocio = [
      { id: 'produto', nome: 'Produto Artesanal', icone: FaHandshake, exemplos: ['Bijuterias', 'Doces', 'Artesanato'] },
      { id: 'servico', nome: 'Serviço', icone: FaUsers, exemplos: ['Tutoria', 'Design', 'Consultoria'] },
      { id: 'digital', nome: 'Produto Digital', icone: FaGlobe, exemplos: ['E-book', 'Curso Online', 'App'] },
      { id: 'conteudo', nome: 'Criação de Conteúdo', icone: FaNewspaper, exemplos: ['Newsletter', 'Blog', 'YouTube'] }
    ];

    const adicionarNegocio = async () => {
      if (!novoNegocio.nome.trim()) return;

      const negocio = {
        ...novoNegocio,
        id: Date.now().toString(),
        dataCriacao: new Date().toISOString(),
        userId: user?.uid || 'local'
      };

      try {
        if (user) {
          await addDoc(collection(db, 'mini_negocios'), negocio);
        } else {
          const novosNegocios = [...miniNegocios, negocio];
          setMiniNegocios(novosNegocios);
          localStorage.setItem('projetos_negocios', JSON.stringify(novosNegocios));
        }
        
        setNovoNegocio({
          nome: '',
          tipo: 'produto',
          descricao: '',
          publicoAlvo: '',
          custos: '',
          receita: '',
          canaisVenda: [],
          status: 'idealizacao'
        });
        setMostrarFormulario(false);
      } catch (error) {
        console.error('Erro ao adicionar mini-negócio:', error);
      }
    };

    const atualizarStatus = async (id, novoStatus) => {
      try {
        if (user) {
          const negocioRef = doc(db, 'mini_negocios', id);
          await updateDoc(negocioRef, { status: novoStatus });
        } else {
          const negociosAtualizados = miniNegocios.map(n => 
            n.id === id ? { ...n, status: novoStatus } : n
          );
          setMiniNegocios(negociosAtualizados);
          localStorage.setItem('projetos_negocios', JSON.stringify(negociosAtualizados));
        }
      } catch (error) {
        console.error('Erro ao atualizar status:', error);
      }
    };

    const removerNegocio = async (id) => {
      try {
        if (user) {
          await deleteDoc(doc(db, 'mini_negocios', id));
        } else {
          const negociosAtualizados = miniNegocios.filter(n => n.id !== id);
          setMiniNegocios(negociosAtualizados);
          localStorage.setItem('projetos_negocios', JSON.stringify(negociosAtualizados));
        }
      } catch (error) {
        console.error('Erro ao remover mini-negócio:', error);
      }
    };

    return (
      <div className="negocio-section">
        <div className="section-header">
          <h2><FaStore /> Meu Mini-Negócio</h2>
          <p>Planeje e execute um pequeno projeto empreendedor para aprender sobre negócios na prática</p>
        </div>

        <div className="negocio-actions">
          <button 
            className="btn-primary"
            onClick={() => setMostrarFormulario(!mostrarFormulario)}
          >
            <FaPlus /> Nova Ideia de Negócio
          </button>
        </div>

        {mostrarFormulario && (
          <div className="negocio-form">
            <div className="form-group">
              <label>Nome do Mini-Negócio</label>
              <input
                type="text"
                value={novoNegocio.nome}
                onChange={(e) => setNovoNegocio({...novoNegocio, nome: e.target.value})}
                placeholder="Ex: Doces Artesanais da Maria"
              />
            </div>

            <div className="form-group">
              <label>Tipo de Negócio</label>
              <div className="tipos-negocio-grid">
                {tiposNegocio.map(tipo => {
                  const IconeTipo = tipo.icone;
                  return (
                    <div 
                      key={tipo.id}
                      className={`tipo-negocio-card ${novoNegocio.tipo === tipo.id ? 'selected' : ''}`}
                      onClick={() => setNovoNegocio({...novoNegocio, tipo: tipo.id})}
                    >
                      <IconeTipo />
                      <h4>{tipo.nome}</h4>
                      <p>Ex: {tipo.exemplos.join(', ')}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="form-group">
              <label>Descrição da Ideia</label>
              <textarea
                value={novoNegocio.descricao}
                onChange={(e) => setNovoNegocio({...novoNegocio, descricao: e.target.value})}
                placeholder="Descreva sua ideia de negócio..."
                rows={3}
              />
            </div>

            <div className="form-group">
              <label>Público-Alvo</label>
              <input
                type="text"
                value={novoNegocio.publicoAlvo}
                onChange={(e) => setNovoNegocio({...novoNegocio, publicoAlvo: e.target.value})}
                placeholder="Ex: Estudantes universitários, Mães de família..."
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Custos Estimados</label>
                <input
                  type="text"
                  value={novoNegocio.custos}
                  onChange={(e) => setNovoNegocio({...novoNegocio, custos: e.target.value})}
                  placeholder="Ex: R$ 200 (materiais)"
                />
              </div>
              <div className="form-group">
                <label>Receita Esperada</label>
                <input
                  type="text"
                  value={novoNegocio.receita}
                  onChange={(e) => setNovoNegocio({...novoNegocio, receita: e.target.value})}
                  placeholder="Ex: R$ 500/mês"
                />
              </div>
            </div>

            <div className="form-actions">
              <button className="btn-secondary" onClick={() => setMostrarFormulario(false)}>
                Cancelar
              </button>
              <button className="btn-primary" onClick={adicionarNegocio}>
                Criar Mini-Negócio
              </button>
            </div>
          </div>
        )}

        <div className="negocios-grid">
          {miniNegocios.map(negocio => {
            const tipo = tiposNegocio.find(t => t.id === negocio.tipo);
            const IconeTipo = tipo?.icone || FaStore;
            
            return (
              <div key={negocio.id} className="negocio-card">
                <div className="negocio-header">
                  <div className="negocio-icon">
                    <IconeTipo />
                  </div>
                  <div className="negocio-info">
                    <h3>{negocio.nome}</h3>
                    <span className="tipo-badge">{tipo?.nome}</span>
                  </div>
                  <button 
                    className="btn-remove"
                    onClick={() => removerNegocio(negocio.id)}
                  >
                    <FaTrash />
                  </button>
                </div>
                
                <p className="negocio-description">{negocio.descricao}</p>
                
                <div className="negocio-detalhes">
                  <div className="detalhe-item">
                    <FaUsers />
                    <div>
                      <strong>Público-Alvo:</strong>
                      <p>{negocio.publicoAlvo}</p>
                    </div>
                  </div>
                  
                  <div className="financeiro-row">
                    <div className="detalhe-item">
                      <FaDollarSign className="custo" />
                      <div>
                        <strong>Custos:</strong>
                        <p>{negocio.custos}</p>
                      </div>
                    </div>
                    <div className="detalhe-item">
                      <FaChartLine className="receita" />
                      <div>
                        <strong>Receita:</strong>
                        <p>{negocio.receita}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="negocio-status">
                  <label>Status do Projeto:</label>
                  <select 
                    value={negocio.status}
                    onChange={(e) => atualizarStatus(negocio.id, e.target.value)}
                  >
                    <option value="idealizacao">Idealização</option>
                    <option value="planejamento">Planejamento</option>
                    <option value="execucao">Execução</option>
                    <option value="lancamento">Lançamento</option>
                    <option value="operacao">Em Operação</option>
                    <option value="pausado">Pausado</option>
                  </select>
                </div>

                <div className="status-indicator">
                  <span className={`status-badge ${negocio.status}`}>
                    {negocio.status === 'idealizacao' && <FaLightbulb />}
                    {negocio.status === 'planejamento' && <FaClipboardList />}
                    {negocio.status === 'execucao' && <FaClock />}
                    {negocio.status === 'lancamento' && <FaRocket />}
                    {negocio.status === 'operacao' && <FaCheck />}
                    {negocio.status === 'pausado' && <FaTimes />}
                    {negocio.status === 'idealizacao' ? 'Idealização' :
                     negocio.status === 'planejamento' ? 'Planejamento' :
                     negocio.status === 'execucao' ? 'Execução' :
                     negocio.status === 'lancamento' ? 'Lançamento' :
                     negocio.status === 'operacao' ? 'Em Operação' : 'Pausado'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {miniNegocios.length === 0 && (
          <div className="empty-state">
            <FaStore className="empty-icon" />
            <h3>Nenhum mini-negócio criado ainda</h3>
            <p>Comece planejando sua primeira ideia empreendedora, mesmo que seja algo simples!</p>
          </div>
        )}

        <div className="negocio-metodologia">
          <h3><FaGraduationCap /> Metodologia do Mini-Negócio</h3>
          <div className="metodologia-steps">
            <div className="step-card">
              <div className="step-number">1</div>
              <FaLightbulb />
              <h4>Ideação</h4>
              <p>Identifique um problema ou necessidade que você pode resolver</p>
            </div>
            <div className="step-card">
              <div className="step-number">2</div>
              <FaUsers />
              <h4>Público-Alvo</h4>
              <p>Defina quem são seus clientes e o que eles realmente precisam</p>
            </div>
            <div className="step-card">
              <div className="step-number">3</div>
              <FaDollarSign />
              <h4>Viabilidade</h4>
              <p>Calcule custos, preços e se o negócio pode ser lucrativo</p>
            </div>
            <div className="step-card">
              <div className="step-number">4</div>
              <FaRocket />
              <h4>Execução</h4>
              <p>Comece pequeno, teste sua ideia e aprenda com o feedback</p>
            </div>
          </div>
        </div>

        <div className="negocio-inspiracao">
          <h3><FaLightbulb /> Ideias de Mini-Negócios</h3>
          <div className="inspiracao-negocios">
            <div className="inspiracao-categoria">
              <FaHandshake />
              <h4>Produtos Artesanais</h4>
              <ul>
                <li>Bijuterias personalizadas</li>
                <li>Doces e bolos caseiros</li>
                <li>Produtos de beleza naturais</li>
                <li>Decoração artesanal</li>
              </ul>
            </div>
            <div className="inspiracao-categoria">
              <FaUsers />
              <h4>Serviços</h4>
              <ul>
                <li>Tutoria/Aulas particulares</li>
                <li>Design gráfico freelancer</li>
                <li>Organização de eventos</li>
                <li>Consultoria em redes sociais</li>
              </ul>
            </div>
            <div className="inspiracao-categoria">
              <FaGlobe />
              <h4>Produtos Digitais</h4>
              <ul>
                <li>E-book sobre sua área</li>
                <li>Curso online</li>
                <li>Templates e planilhas</li>
                <li>App ou ferramenta web</li>
              </ul>
            </div>
            <div className="inspiracao-categoria">
              <FaNewspaper />
              <h4>Criação de Conteúdo</h4>
              <ul>
                <li>Newsletter especializada</li>
                <li>Canal no YouTube</li>
                <li>Blog monetizado</li>
                <li>Podcast sobre seu nicho</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Renderização do componente ativo
  const renderActiveTab = () => {
    switch (activeTab) {
      case 'portfolio':
        return <PortfolioDigital />;
      case 'desafio':
        return <DesafioHabilidade />;
      case 'negocio':
        return <MiniNegocio />;
      default:
        return <PortfolioDigital />;
    }
  };

  // Carregar dados do Firebase ou localStorage
  useEffect(() => {
    if (user) {
      loadFirebaseData();
      setupRealtimeListeners();
    } else {
      loadLocalStorageData();
    }

    return () => {
      // Cleanup listeners
    };
  }, [user]);

  const setupRealtimeListeners = () => {
    if (!user) return;

    // Listener para portfólios
    const portfoliosQuery = query(
      collection(db, 'portfolios'), 
      where('userId', '==', user.uid)
    );
    
    const unsubscribePortfolios = onSnapshot(portfoliosQuery, (snapshot) => {
      const portfoliosData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPortfolios(portfoliosData);
      localStorage.setItem('projetos_portfolios', JSON.stringify(portfoliosData));
    });

    // Listener para desafios
    const desafiosQuery = query(
      collection(db, 'desafios_habilidade'), 
      where('userId', '==', user.uid)
    );
    
    const unsubscribeDesafios = onSnapshot(desafiosQuery, (snapshot) => {
      const desafiosData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setDesafios(desafiosData);
      localStorage.setItem('projetos_desafios', JSON.stringify(desafiosData));
    });

    // Listener para mini-negócios
    const negociosQuery = query(
      collection(db, 'mini_negocios'), 
      where('userId', '==', user.uid)
    );
    
    const unsubscribeNegocios = onSnapshot(negociosQuery, (snapshot) => {
      const negociosData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMiniNegocios(negociosData);
      localStorage.setItem('projetos_negocios', JSON.stringify(negociosData));
    });

    return () => {
      unsubscribePortfolios();
      unsubscribeDesafios();
      unsubscribeNegocios();
    };
  };

  const loadFirebaseData = async () => {
    if (!user) return;

    try {
      // Carregar portfólios
      const portfoliosQuery = query(
        collection(db, 'portfolios'), 
        where('userId', '==', user.uid)
      );
      const portfoliosSnapshot = await getDocs(portfoliosQuery);
      const portfoliosData = portfoliosSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPortfolios(portfoliosData);

      // Carregar desafios
      const desafiosQuery = query(
        collection(db, 'desafios_habilidade'), 
        where('userId', '==', user.uid)
      );
      const desafiosSnapshot = await getDocs(desafiosQuery);
      const desafiosData = desafiosSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setDesafios(desafiosData);

      // Carregar mini-negócios
      const negociosQuery = query(
        collection(db, 'mini_negocios'), 
        where('userId', '==', user.uid)
      );
      const negociosSnapshot = await getDocs(negociosQuery);
      const negociosData = negociosSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMiniNegocios(negociosData);

    } catch (error) {
      console.error('Erro ao carregar dados do Firebase:', error);
      loadLocalStorageData();
    }
  };

  const loadLocalStorageData = () => {
    try {
      const portfoliosLocal = localStorage.getItem('projetos_portfolios');
      if (portfoliosLocal) {
        setPortfolios(JSON.parse(portfoliosLocal));
      }

      const desafiosLocal = localStorage.getItem('projetos_desafios');
      if (desafiosLocal) {
        setDesafios(JSON.parse(desafiosLocal));
      }

      const negociosLocal = localStorage.getItem('projetos_negocios');
      if (negociosLocal) {
        setMiniNegocios(JSON.parse(negociosLocal));
      }
    } catch (error) {
      console.error('Erro ao carregar dados do localStorage:', error);
    }
  };

  // Early return para loading
  if (loading) {
    return (
      <div className="modulo-projetos">
        <div className="projetos-container">
          <div className="loading-container" style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '60vh',
            flexDirection: 'column',
            gap: '1rem'
          }}>
            <div className="loading-spinner" style={{
              width: '40px',
              height: '40px',
              border: '3px solid #f3f4f6',
              borderTop: '3px solid #6366f1',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}></div>
            <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>Carregando módulo projetos...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modulo-projetos">
      <div className="projetos-container">
        {/* Botão de volta ao dashboard */}
        <div className="back-to-dashboard">
          <button 
            className="btn-back-dashboard" 
            onClick={handleBackToDashboard}
          >
            <FaArrowLeft />
            Voltar ao Dashboard
          </button>
        </div>

        {/* Header com título */}
        <div className="projetos-header">
          <div className="header-icon">
            <FaRocket />
          </div>
          <h1 className="projetos-title">
            <div className="title-decorative-icons">
              <div className="decorative-icon left-icon">
                <FaStar />
              </div>
              <div className="decorative-icon right-icon">
                <FaTrophy />
              </div>
            </div>
            Projetos Práticos
          </h1>
          <p className="projetos-subtitle">
            Desenvolva habilidades através de projetos reais e construa seu portfólio profissional
          </p>
        </div>

        {/* Navegação por abas */}
        <div className="projetos-navigation">
          {tabs.map(tab => {
            const IconeTab = tab.icone;
            return (
              <button
                key={tab.id}
                className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => handleTabChange(tab.id)}
              >
                <IconeTab />
                {tab.nome}
              </button>
            );
          })}
        </div>

        {/* Status Firebase */}
        <div className="firebase-status-message">
          {loading ? (
            <div className="status-loading">
              <FaClock className="status-icon spinning" />
              <span>Carregando dados...</span>
            </div>
          ) : user ? (
            <div className="status-connected">
              <FaCheck className="status-icon" />
              <FaCloudUploadAlt className="status-icon-secondary" />
              <span>Todos os dados estão salvos automaticamente no Firebase</span>
            </div>
          ) : (
            <div className="status-offline">
              <FaTimes className="status-icon" />
              <span>Dados salvos localmente - Faça login para sincronizar</span>
            </div>
          )}
        </div>

        {/* Conteúdo da aba ativa */}
        <div className="projetos-content">
          {renderActiveTab()}
        </div>
      </div>
    </div>
  );
};

export default ModuloProjetos;