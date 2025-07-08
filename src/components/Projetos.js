import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { addDocument, getDocuments, updateDocument, deleteDocument } from '../firebaseService';
import './Projetos.css';

function Projetos({ darkMode = false }) {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  
  // Estados principais
  const [projetos, setProjetos] = useState([]);
  const [tarefas, setTarefas] = useState([]);
  
  // Estados de modals
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  
  // Estados de formulários
  const [projectForm, setProjectForm] = useState({
    nome: '',
    descricao: '',
    categoria: 'pessoal',
    status: 'planejamento',
    prioridade: 'media',
    dataInicio: new Date().toISOString().split('T')[0],
    prazo: '',
    progresso: 0,
    tags: '',
    notas: ''
  });
  
  const [taskForm, setTaskForm] = useState({
    nome: '',
    descricao: '',
    status: 'pendente',
    prioridade: 'media',
    prazo: '',
    responsavel: '',
    progresso: 0
  });
  
  // Estados de filtros
  const [filtros, setFiltros] = useState({
    status: 'todos',
    categoria: 'todas',
    prioridade: 'todas',
    busca: ''
  });

  useEffect(() => {
    if (currentUser) {
      carregarDados();
    }
  }, [currentUser]);

  const carregarDados = async () => {
    setLoading(true);
    try {
      const [projetosData, tarefasData] = await Promise.all([
        getDocuments('projetos'),
        getDocuments('projetos-tarefas')
      ]);
      
      // Filtrar por usuário atual
      const meusProjetos = projetosData.filter(p => p.userId === currentUser.uid);
      const minhasTarefas = tarefasData.filter(t => t.userId === currentUser.uid);
      
      setProjetos(meusProjetos || []);
      setTarefas(minhasTarefas || []);
      
    } catch (error) {
      console.error('Erro ao carregar projetos:', error);
      setMessage('Erro ao carregar projetos');
    }
    setLoading(false);
  };

  const criarProjeto = async () => {
    if (!projectForm.nome.trim()) return;
    
    setLoading(true);
    try {
      const projeto = {
        ...projectForm,
        id: Date.now().toString(),
        userId: currentUser.uid,
        tags: projectForm.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        dataCriacao: new Date().toISOString(),
        timestamp: new Date().toISOString()
      };
      
      await addDocument('projetos', projeto);
      setProjetos([...projetos, projeto]);
      
      setShowProjectModal(false);
      resetProjectForm();
      setMessage('Projeto criado com sucesso!');
      
    } catch (error) {
      console.error('Erro ao criar projeto:', error);
      setMessage('Erro ao criar projeto');
    }
    setLoading(false);
  };

  const editarProjeto = async () => {
    if (!projectForm.nome.trim()) return;
    
    setLoading(true);
    try {
      const projetoAtualizado = {
        ...editingProject,
        ...projectForm,
        tags: projectForm.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        timestamp: new Date().toISOString()
      };
      
      await updateDocument('projetos', editingProject.id, projetoAtualizado);
      setProjetos(projetos.map(p => p.id === editingProject.id ? projetoAtualizado : p));
      
      setShowProjectModal(false);
      setEditingProject(null);
      resetProjectForm();
      setMessage('Projeto atualizado com sucesso!');
      
    } catch (error) {
      console.error('Erro ao atualizar projeto:', error);
      setMessage('Erro ao atualizar projeto');
    }
    setLoading(false);
  };

  const excluirProjeto = async (id) => {
    try {
      await deleteDocument('projetos', id);
      setProjetos(projetos.filter(p => p.id !== id));
      
      // Excluir tarefas do projeto
      const tarefasDoProjeto = tarefas.filter(t => t.projetoId === id);
      for (const tarefa of tarefasDoProjeto) {
        await deleteDocument('projetos-tarefas', tarefa.id);
      }
      setTarefas(tarefas.filter(t => t.projetoId !== id));
      
      setMessage('Projeto excluído com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir projeto:', error);
      setMessage('Erro ao excluir projeto');
    }
  };

  const abrirEdicaoProjeto = (projeto) => {
    setEditingProject(projeto);
    setProjectForm({
      ...projeto,
      tags: projeto.tags?.join(', ') || ''
    });
    setShowProjectModal(true);
  };

  const resetProjectForm = () => {
    setProjectForm({
      nome: '',
      descricao: '',
      categoria: 'pessoal',
      status: 'planejamento',
      prioridade: 'media',
      dataInicio: new Date().toISOString().split('T')[0],
      prazo: '',
      progresso: 0,
      tags: '',
      notas: ''
    });
  };

  const filtrarProjetos = () => {
    let projetosFiltrados = [...projetos];
    
    if (filtros.status !== 'todos') {
      projetosFiltrados = projetosFiltrados.filter(p => p.status === filtros.status);
    }
    
    if (filtros.categoria !== 'todas') {
      projetosFiltrados = projetosFiltrados.filter(p => p.categoria === filtros.categoria);
    }
    
    if (filtros.prioridade !== 'todas') {
      projetosFiltrados = projetosFiltrados.filter(p => p.prioridade === filtros.prioridade);
    }
    
    if (filtros.busca.trim()) {
      projetosFiltrados = projetosFiltrados.filter(p => 
        p.nome.toLowerCase().includes(filtros.busca.toLowerCase()) ||
        p.descricao.toLowerCase().includes(filtros.busca.toLowerCase())
      );
    }
    
    return projetosFiltrados.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  };

  const getStatusColor = (status) => {
    const colors = {
      'planejamento': '#ffd43b',
      'em-progresso': '#51cf66',
      'pausado': '#ff8c42',
      'concluido': '#339af0',
      'cancelado': '#ff6b6b'
    };
    return colors[status] || '#6c757d';
  };

  const getPriorityIcon = (prioridade) => {
    const icons = {
      'baixa': (
        <svg width="16" height="16" fill="#28a745" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10"/>
        </svg>
      ),
      'media': (
        <svg width="16" height="16" fill="#ffc107" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10"/>
        </svg>
      ),
      'alta': (
        <svg width="16" height="16" fill="#fd7e14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10"/>
        </svg>
      ),
      'urgente': (
        <svg width="16" height="16" fill="#dc3545" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10"/>
        </svg>
      )
    };
    return icons[prioridade] || (
      <svg width="16" height="16" fill="#6c757d" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10"/>
      </svg>
    );
  };

  // Estatísticas do dashboard
  const estatisticas = {
    total: projetos.length,
    emProgresso: projetos.filter(p => p.status === 'em-progresso').length,
    concluidos: projetos.filter(p => p.status === 'concluido').length,
    atrasados: projetos.filter(p => {
      if (!p.prazo) return false;
      return new Date(p.prazo) < new Date() && p.status !== 'concluido';
    }).length
  };

  const renderDashboard = () => (
    <div className="projetos-dashboard">
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <path d="M3 3v5h5V3zM16 3v5h5V3zM16 16v5h5v-5zM3 16v5h5v-5z"/>
            </svg>
          </div>
          <div className="stat-content">
            <h3>{estatisticas.total}</h3>
            <p>Total de Projetos</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
            </svg>
          </div>
          <div className="stat-content">
            <h3>{estatisticas.emProgresso}</h3>
            <p>Em Progresso</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <path d="M20 6L9 17l-5-5"/>
            </svg>
          </div>
          <div className="stat-content">
            <h3>{estatisticas.concluidos}</h3>
            <p>Concluídos</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          </div>
          <div className="stat-content">
            <h3>{estatisticas.atrasados}</h3>
            <p>Atrasados</p>
          </div>
        </div>
      </div>
      
      <div className="recent-projects">
        <h3>� Projetos Recentes</h3>
        <div className="projects-preview">
          {projetos.slice(0, 3).map(projeto => (
            <div key={projeto.id} className="project-preview-card">
              <div className="project-preview-header">
                <h4>{projeto.nome}</h4>
                <span 
                  className="status-badge" 
                  style={{backgroundColor: getStatusColor(projeto.status)}}
                >
                  {projeto.status.replace('-', ' ')}
                </span>
              </div>
              <div className="project-preview-progress">
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{width: `${projeto.progresso}%`}}
                  ></div>
                </div>
                <span>{projeto.progresso}%</span>
              </div>
            </div>
          ))}
          {projetos.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">📋</div>
              <h3>Nenhum projeto criado</h3>
              <p>Comece criando seu primeiro projeto!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderProjetos = () => (
    <div className="projetos-section">
      <div className="action-bar">
        <div className="filters-container">
          <input
            type="text"
            placeholder="Buscar projetos..."
            value={filtros.busca}
            onChange={e => setFiltros({...filtros, busca: e.target.value})}
            className="search-input"
          />
          
          <select 
            value={filtros.status} 
            onChange={e => setFiltros({...filtros, status: e.target.value})}
            className="filter-select"
          >
            <option value="todos">Todos os Status</option>
            <option value="planejamento">Planejamento</option>
            <option value="em-progresso">Em Progresso</option>
            <option value="pausado">Pausado</option>
            <option value="concluido">Concluído</option>
            <option value="cancelado">Cancelado</option>
          </select>
          
          <select 
            value={filtros.categoria} 
            onChange={e => setFiltros({...filtros, categoria: e.target.value})}
            className="filter-select"
          >
            <option value="todas">Todas as Categorias</option>
            <option value="pessoal">Pessoal</option>
            <option value="trabalho">Trabalho</option>
            <option value="estudos">Estudos</option>
            <option value="saude">Saúde</option>
            <option value="financeiro">Financeiro</option>
            <option value="casa">Casa</option>
          </select>
          
          <select 
            value={filtros.prioridade} 
            onChange={e => setFiltros({...filtros, prioridade: e.target.value})}
            className="filter-select"
          >
            <option value="todas">Todas as Prioridades</option>
            <option value="baixa">Baixa</option>
            <option value="media">Média</option>
            <option value="alta">Alta</option>
            <option value="urgente">Urgente</option>
          </select>
        </div>
        
        <button 
          className="add-btn" 
          onClick={() => setShowProjectModal(true)}
        >
          ➕ Novo Projeto
        </button>
      </div>
      
      <div className="projects-grid">
        {filtrarProjetos().length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <h3>Nenhum projeto encontrado</h3>
            <p>Tente ajustar os filtros ou criar um novo projeto</p>
          </div>
        ) : (
          filtrarProjetos().map(projeto => (
            <div key={projeto.id} className="project-card">
              <div className="project-header">
                <div className="project-title">
                  <h4>{projeto.nome}</h4>
                  <div className="project-meta">
                    <span className="priority">{getPriorityIcon(projeto.prioridade)}</span>
                    <span 
                      className="status" 
                      style={{color: getStatusColor(projeto.status)}}
                    >
                      {projeto.status.replace('-', ' ')}
                    </span>
                  </div>
                </div>
                
                <div className="project-actions">
                  <button 
                    className="edit-btn"
                    onClick={() => abrirEdicaoProjeto(projeto)}
                    title="Editar projeto"
                  >
                    ✏️
                  </button>
                  <button 
                    className="delete-btn"
                    onClick={() => excluirProjeto(projeto.id)}
                    title="Excluir projeto"
                  >
                    🗑️
                  </button>
                </div>
              </div>
              
              <div className="project-content">
                <p className="project-description">{projeto.descricao}</p>
                
                <div className="project-details">
                  <div className="detail-item">
                    <span className="detail-label">📅 Prazo:</span>
                    <span className="detail-value">
                      {projeto.prazo ? new Date(projeto.prazo).toLocaleDateString() : 'Não definido'}
                    </span>
                  </div>
                  
                  <div className="detail-item">
                    <span className="detail-label">📂 Categoria:</span>
                    <span className="detail-value">{projeto.categoria}</span>
                  </div>
                </div>
                
                <div className="project-progress">
                  <div className="progress-header">
                    <span>Progresso</span>
                    <span>{projeto.progresso}%</span>
                  </div>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{width: `${projeto.progresso}%`}}
                    ></div>
                  </div>
                </div>
                
                {projeto.tags && projeto.tags.length > 0 && (
                  <div className="project-tags">
                    {projeto.tags.map((tag, index) => (
                      <span key={index} className="tag">{tag}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="projetos-loading">
        <div className="spinner"></div>
        <p>Carregando projetos...</p>
      </div>
    );
  }

  return (
    <div className={`carreira-container ${darkMode ? 'dark-mode' : ''}`} data-theme={darkMode ? 'dark' : 'light'}>{/* Cabeçalho */}
      <div className="carreira-header">
        <h3>
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/>
          </svg>
          Gerenciamento de Projetos
        </h3>
        <button 
          className="btn-voltar" 
          onClick={() => navigate('/dashboard')}
          aria-label="Voltar ao Dashboard"
          title="Voltar ao Dashboard"
        >
        </button>
      </div>

      {/* Mensagem de Feedback */}
      {message && (
        <div className={`message ${message.includes('Erro') ? 'error' : 'success'}`}>
          {message}
          <button onClick={() => setMessage('')}>×</button>
        </div>
      )}

      {/* Navegação por Tabs */}
      <div className="carreira-tabs">
        <button 
          className={`tab ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <path d="M3 3v5h5V3zM16 3v5h5V3zM16 16v5h5v-5zM3 16v5h5v-5z"/>
          </svg>
          Dashboard
        </button>
        <button 
          className={`tab ${activeTab === 'projetos' ? 'active' : ''}`}
          onClick={() => setActiveTab('projetos')}
        >
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/>
          </svg>
          Projetos
        </button>
        <button 
          className={`tab ${activeTab === 'cronograma' ? 'active' : ''}`}
          onClick={() => setActiveTab('cronograma')}
        >
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          Cronograma
        </button>
      </div>

      {/* Conteúdo das tabs */}
      <div className="carreira-content">
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'projetos' && renderProjetos()}
        {activeTab === 'cronograma' && (
          <div className="cronograma-section">
            <h3>
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              Cronograma de Projetos
            </h3>
            <div className="timeline">
              {projetos
                .filter(p => p.prazo)
                .sort((a, b) => new Date(a.prazo) - new Date(b.prazo))
                .map(projeto => (
                  <div key={projeto.id} className="timeline-item">
                    <div className="timeline-date">
                      {new Date(projeto.prazo).toLocaleDateString()}
                    </div>
                    <div className="timeline-content">
                      <h4>{projeto.nome}</h4>
                      <p>{projeto.categoria} • {projeto.status}</p>
                    </div>
                  </div>
                ))}
              {projetos.filter(p => p.prazo).length === 0 && (
                <div className="empty-state">
                  <div className="empty-icon">📅</div>
                  <h3>Nenhum prazo definido</h3>
                  <p>Adicione prazos aos seus projetos para visualizar o cronograma</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modal de Projeto */}
      {showProjectModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{editingProject ? '✏️ Editar Projeto' : '➕ Novo Projeto'}</h3>
              <button 
                className="close-btn" 
                onClick={() => {
                  setShowProjectModal(false);
                  setEditingProject(null);
                  resetProjectForm();
                }}
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <div className="project-form">
                <div className="form-group">
                  <label>Nome do Projeto</label>
                  <input
                    type="text"
                    placeholder="Ex: Aplicativo de Tarefas"
                    value={projectForm.nome}
                    onChange={e => setProjectForm({...projectForm, nome: e.target.value})}
                  />
                </div>
                
                <div className="form-group">
                  <label>Descrição</label>
                  <textarea
                    placeholder="Descreva os objetivos e escopo do projeto..."
                    value={projectForm.descricao}
                    onChange={e => setProjectForm({...projectForm, descricao: e.target.value})}
                    rows={3}
                  />
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Categoria</label>
                    <select 
                      value={projectForm.categoria} 
                      onChange={e => setProjectForm({...projectForm, categoria: e.target.value})}
                    >
                      <option value="pessoal">Pessoal</option>
                      <option value="trabalho">Trabalho</option>
                      <option value="estudos">Estudos</option>
                      <option value="saude">Saúde</option>
                      <option value="financeiro">Financeiro</option>
                      <option value="casa">Casa</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label>Status</label>
                    <select 
                      value={projectForm.status} 
                      onChange={e => setProjectForm({...projectForm, status: e.target.value})}
                    >
                      <option value="planejamento">Planejamento</option>
                      <option value="em-progresso">Em Progresso</option>
                      <option value="pausado">Pausado</option>
                      <option value="concluido">Concluído</option>
                      <option value="cancelado">Cancelado</option>
                    </select>
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Prioridade</label>
                    <select 
                      value={projectForm.prioridade} 
                      onChange={e => setProjectForm({...projectForm, prioridade: e.target.value})}
                    >
                      <option value="baixa">🟢 Baixa</option>
                      <option value="media">🟡 Média</option>
                      <option value="alta">🟠 Alta</option>
                      <option value="urgente">Urgente</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label>Progresso (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={projectForm.progresso}
                      onChange={e => setProjectForm({...projectForm, progresso: parseInt(e.target.value) || 0})}
                    />
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Data de Início</label>
                    <input
                      type="date"
                      value={projectForm.dataInicio}
                      onChange={e => setProjectForm({...projectForm, dataInicio: e.target.value})}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Prazo</label>
                    <input
                      type="date"
                      value={projectForm.prazo}
                      onChange={e => setProjectForm({...projectForm, prazo: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label>Tags (separadas por vírgula)</label>
                  <input
                    type="text"
                    placeholder="Ex: frontend, react, mobile"
                    value={projectForm.tags}
                    onChange={e => setProjectForm({...projectForm, tags: e.target.value})}
                  />
                </div>
                
                <div className="form-group">
                  <label>Notas</label>
                  <textarea
                    placeholder="Anotações adicionais sobre o projeto..."
                    value={projectForm.notas}
                    onChange={e => setProjectForm({...projectForm, notas: e.target.value})}
                    rows={3}
                  />
                </div>
              </div>
            </div>
            
            <div className="modal-actions">
              <button 
                className="cancel-btn" 
                onClick={() => {
                  setShowProjectModal(false);
                  setEditingProject(null);
                  resetProjectForm();
                }}
              >
                Cancelar
              </button>
              <button 
                className="save-btn" 
                onClick={editingProject ? editarProjeto : criarProjeto}
                disabled={loading}
              >
                {loading ? 'Salvando...' : editingProject ? 'Atualizar' : 'Criar Projeto'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Projetos;