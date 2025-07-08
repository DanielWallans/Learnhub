import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { addPlanejamento, getPlanejamentos, updatePlanejamento, deletePlanejamento } from '../firebaseService';
import './Leituras.css';

function Leituras({ darkMode = false }) {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  // Estados principais
  const [leituras, setLeituras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Estados do formulário
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    titulo: '',
    categoria: 'livro',
    status: 'nao-iniciado',
    avaliacao: 0,
    paginas: '',
    paginasLidas: 0,
    dataInicio: '',
    dataConclusao: '',
    notas: ''
  });
  
  // Estados de filtros
  const [filtros, setFiltros] = useState({
    categoria: 'todas',
    status: 'todos',
    avaliacao: 'todas'
  });
  
  // Estados de feedback
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [showBookAnimation, setShowBookAnimation] = useState(false);

  // Carregar leituras do Firebase
  useEffect(() => {
    if (currentUser) {
      carregarLeituras();
    }
  }, [currentUser]);

  const carregarLeituras = async () => {
    try {
      setLoading(true);
      const leiturasData = await getPlanejamentos(`leituras_${currentUser.uid}`);
      console.log('Leituras carregadas:', leiturasData); // Debug
      setLeituras(leiturasData);
    } catch (error) {
      console.error('Erro ao carregar leituras:', error); // Debug
      showMessage('Erro ao carregar leituras', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (msg, type) => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(''), 3000);
    
    // Mostrar animação de livro quando adicionar
    if (type === 'success' && msg.includes('adicionada')) {
      setShowBookAnimation(true);
      setTimeout(() => setShowBookAnimation(false), 2000);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.titulo.trim()) {
      showMessage('Título é obrigatório', 'error');
      return;
    }

    try {
      const leituraData = {
        ...formData,
        paginas: formData.paginas ? parseInt(formData.paginas) : null,
        paginasLidas: parseInt(formData.paginasLidas) || 0,
        createdAt: editingId ? undefined : new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      if (editingId) {
        await updatePlanejamento(`leituras_${currentUser.uid}`, editingId, leituraData);
        showMessage('Leitura atualizada com sucesso!', 'success');
      } else {
        await addPlanejamento(`leituras_${currentUser.uid}`, leituraData);
        showMessage('Leitura adicionada com sucesso!', 'success');
      }

      resetForm();
      carregarLeituras();
    } catch (error) {
      showMessage('Erro ao salvar leitura', 'error');
    }
  };

  const resetForm = () => {
    setFormData({
      titulo: '',
      categoria: 'livro',
      status: 'nao-iniciado',
      avaliacao: 0,
      paginas: '',
      paginasLidas: 0,
      dataInicio: '',
      dataConclusao: '',
      notas: ''
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (leitura) => {
    console.log('Editando leitura:', leitura); // Debug
    setFormData({
      titulo: leitura.titulo || '',
      categoria: leitura.categoria || 'livro',
      status: leitura.status || 'nao-iniciado',
      avaliacao: leitura.avaliacao || 0,
      paginas: leitura.paginas || '',
      paginasLidas: leitura.paginasLidas || 0,
      dataInicio: leitura.dataInicio || '',
      dataConclusao: leitura.dataConclusao || '',
      notas: leitura.notas || ''
    });
    setEditingId(leitura.id);
    setShowForm(true);
  };

  const handleDelete = async () => {
    try {
      console.log('Excluindo leitura:', deleteId); // Debug
      await deletePlanejamento(`leituras_${currentUser.uid}`, deleteId);
      showMessage('Leitura excluída com sucesso!', 'success');
      carregarLeituras();
    } catch (error) {
      console.error('Erro ao excluir:', error); // Debug
      showMessage('Erro ao excluir leitura', 'error');
    }
    setShowDeleteModal(false);
    setDeleteId(null);
  };

  const updateStatus = async (id, newStatus) => {
    try {
      console.log('Atualizando status:', id, newStatus); // Debug
      const leitura = leituras.find(l => l.id === id);
      if (!leitura) {
        console.error('Leitura não encontrada:', id);
        return;
      }
      
      const updateData = { 
        status: newStatus,
        updatedAt: new Date().toISOString()
      };
      
      if (newStatus === 'concluido' && !leitura.dataConclusao) {
        updateData.dataConclusao = new Date().toISOString().split('T')[0];
      }
      
      await updatePlanejamento(`leituras_${currentUser.uid}`, id, updateData);
      showMessage('Status atualizado!', 'success');
      carregarLeituras();
    } catch (error) {
      console.error('Erro ao atualizar status:', error); // Debug
      showMessage('Erro ao atualizar status', 'error');
    }
  };

  // Filtrar leituras
  const leiturasFiltradas = leituras.filter(leitura => {
    if (filtros.categoria !== 'todas' && leitura.categoria !== filtros.categoria) return false;
    if (filtros.status !== 'todos' && leitura.status !== filtros.status) return false;
    if (filtros.avaliacao !== 'todas' && leitura.avaliacao !== parseInt(filtros.avaliacao)) return false;
    return true;
  });

  // Estatísticas
  const stats = {
    total: leituras.length,
    concluidas: leituras.filter(l => l.status === 'concluido').length,
    lendo: leituras.filter(l => l.status === 'lendo').length,
    naoIniciadas: leituras.filter(l => l.status === 'nao-iniciado').length,
    avaliacaoMedia: leituras.length > 0 ? 
      (leituras.reduce((acc, l) => acc + (l.avaliacao || 0), 0) / leituras.length).toFixed(1) : 0
  };

  const getCategoriaIcon = (categoria) => {
    const icons = {
      livro: (
        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
          <path d="M4 19.5A2.5 2.5 0 016.5 17H20"/>
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>
        </svg>
      ),
      artigo: (
        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
          <polyline points="14,2 14,8 20,8"/>
          <line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/>
          <polyline points="10,9 9,9 8,9"/>
        </svg>
      ),
      curso: (
        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
          <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
          <path d="M6 12v5c3 3 9 3 12 0v-5"/>
        </svg>
      ),
      podcast: (
        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
          <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/>
          <path d="M19 10v2a7 7 0 01-14 0v-2"/>
          <line x1="12" y1="19" x2="12" y2="23"/>
          <line x1="8" y1="23" x2="16" y2="23"/>
        </svg>
      ),
      video: (
        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
          <polygon points="23 7 16 12 23 17 23 7"/>
          <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
        </svg>
      )
    };
    return icons[categoria] || icons.livro;
  };

  const getStatusColor = (status) => {
    const colors = {
      'nao-iniciado': '#6c757d',
      'lendo': '#007bff',
      'concluido': '#28a745'
    };
    return colors[status] || '#6c757d';
  };

  const renderStars = (rating, interactive = false, onChange = null) => {
    return (
      <div className="stars-container">
        {[1, 2, 3, 4, 5].map(star => (
          <span
            key={star}
            className={`star ${star <= rating ? 'active' : ''} ${interactive ? 'interactive' : ''}`}
            onClick={interactive ? () => onChange(star) : undefined}
          >
            <svg width="16" height="16" fill={star <= rating ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
            </svg>
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className={`leituras-container ${darkMode ? 'dark-mode' : ''}`} data-theme={darkMode ? 'dark' : 'light'}>
      {/* Cabeçalho */}
      <div className="carreira-header">
        <h3>
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <path d="M4 19.5A2.5 2.5 0 016.5 17H20"/>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>
          </svg>
          Leituras
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
        <div className={`message ${messageType}`}>
          {message}
        </div>
      )}

      {/* Animação de Livro na Prateleira */}
      {showBookAnimation && (
        <div className="book-animation-container">
          <div className="bookshelf">
            <div className="shelf"></div>
            <div className="book-falling">
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <path d="M4 19.5A2.5 2.5 0 016.5 17H20"/>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>
              </svg>
            </div>
            <div className="success-text">Livro adicionado à sua biblioteca!</div>
          </div>
        </div>
      )}

      {/* Navegação por Tabs */}
      <div className="tabs-container">
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
          className={`tab ${activeTab === 'leituras' ? 'active' : ''}`}
          onClick={() => setActiveTab('leituras')}
        >
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <path d="M4 19.5A2.5 2.5 0 016.5 17H20"/>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>
          </svg>
          Minhas Leituras
        </button>
      </div>

      {/* Dashboard */}
      {activeTab === 'dashboard' && (
        <div className="dashboard-section">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d="M4 19.5A2.5 2.5 0 016.5 17H20"/>
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>
                </svg>
              </div>
              <div className="stat-content">
                <h3>{stats.total}</h3>
                <p>Total de Leituras</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d="M20 6L9 17l-5-5"/>
                </svg>
              </div>
              <div className="stat-content">
                <h3>{stats.concluidas}</h3>
                <p>Concluídas</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d="M4 19.5A2.5 2.5 0 016.5 17H20"/>
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>
                </svg>
              </div>
              <div className="stat-content">
                <h3>{stats.lendo}</h3>
                <p>Lendo Agora</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
                </svg>
              </div>
              <div className="stat-content">
                <h3>{stats.avaliacaoMedia}</h3>
                <p>Avaliação Média</p>
              </div>
            </div>
          </div>

          <div className="progress-section">
            <h3>Progresso de Leitura</h3>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${stats.total > 0 ? (stats.concluidas / stats.total) * 100 : 0}%` }}
              ></div>
            </div>
            <p>{stats.total > 0 ? Math.round((stats.concluidas / stats.total) * 100) : 0}% das leituras concluídas</p>
          </div>
        </div>
      )}

      {/* Lista de Leituras */}
      {activeTab === 'leituras' && (
        <div className="leituras-section">
          {/* Botão Adicionar */}
          <div className="action-bar">
            <button 
              className="add-btn"
              onClick={() => setShowForm(true)}
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="16"/>
                <line x1="8" y1="12" x2="16" y2="12"/>
              </svg>
              Nova Leitura
            </button>
          </div>

          {/* Filtros */}
          <div className="filters-container">
            <select 
              value={filtros.categoria} 
              onChange={(e) => setFiltros({...filtros, categoria: e.target.value})}
              className="filter-select"
            >
              <option value="todas">Todas as Categorias</option>
              <option value="livro">
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d="M4 19.5A2.5 2.5 0 016.5 17H20"/>
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>
                </svg>
                Livros
              </option>
              <option value="artigo">
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                  <polyline points="14,2 14,8 20,8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                  <polyline points="10,9 9,9 8,9"/>
                </svg>
                Artigos
              </option>
              <option value="curso">
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                  <path d="M6 12v5c3 3 9 3 12 0v-5"/>
                </svg>
                Cursos
              </option>
              <option value="podcast">
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/>
                  <path d="M19 10v2a7 7 0 01-14 0v-2"/>
                  <line x1="12" y1="19" x2="12" y2="23"/>
                  <line x1="8" y1="23" x2="16" y2="23"/>
                </svg>
                Podcasts
              </option>
              <option value="video">
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <polygon points="23 7 16 12 23 17 23 7"/>
                  <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
                </svg>
                Vídeos
              </option>
            </select>

            <select 
              value={filtros.status} 
              onChange={(e) => setFiltros({...filtros, status: e.target.value})}
              className="filter-select"
            >
              <option value="todos">Todos os Status</option>
              <option value="nao-iniciado">Não Iniciado</option>
              <option value="lendo">Lendo</option>
              <option value="concluido">Concluído</option>
            </select>

            <select 
              value={filtros.avaliacao} 
              onChange={(e) => setFiltros({...filtros, avaliacao: e.target.value})}
              className="filter-select"
            >
              <option value="todas">Todas as Avaliações</option>
              <option value="5">
                <svg width="16" height="16" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
                </svg>
                <svg width="16" height="16" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
                </svg>
                <svg width="16" height="16" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
                </svg>
                <svg width="16" height="16" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
                </svg>
                <svg width="16" height="16" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
                </svg>
              </option>
              <option value="4">
                <svg width="16" height="16" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
                </svg>
                <svg width="16" height="16" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
                </svg>
                <svg width="16" height="16" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
                </svg>
                <svg width="16" height="16" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
                </svg>
              </option>
              <option value="3">
                <svg width="16" height="16" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
                </svg>
                <svg width="16" height="16" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
                </svg>
                <svg width="16" height="16" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
                </svg>
              </option>
              <option value="2">
                <svg width="16" height="16" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
                </svg>
                <svg width="16" height="16" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
                </svg>
              </option>
              <option value="1">
                <svg width="16" height="16" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
                </svg>
              </option>
            </select>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="loading-container">
              <div className="skeleton-list">
                {[1, 2, 3].map(i => (
                  <div key={i} className="skeleton-item">
                    <div className="skeleton-content"></div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Lista de Leituras */}
          {!loading && (
            <div className="leituras-list">
              {leiturasFiltradas.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">
                    <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                      <path d="M4 19.5A2.5 2.5 0 016.5 17H20"/>
                      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>
                    </svg>
                  </div>
                  <h3>Nenhuma leitura encontrada</h3>
                  <p>Comece adicionando sua primeira leitura!</p>
                  <button 
                    className="add-btn"
                    onClick={() => setShowForm(true)}
                  >
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10"/>
                      <line x1="12" y1="8" x2="12" y2="16"/>
                      <line x1="8" y1="12" x2="16" y2="12"/>
                    </svg>
                    Adicionar Leitura
                  </button>
                </div>
              ) : (
                leiturasFiltradas.map((leitura, index) => (
                  <div key={`${leitura.id}-${index}`} className="leitura-card">
                    <div className="leitura-header">
                      <div className="leitura-info">
                        <span className="categoria-icon">
                          {getCategoriaIcon(leitura.categoria)}
                        </span>
                        <div>
                          <h4>{leitura.titulo}</h4>
                          <div className="leitura-meta">
                            <span className="categoria">{leitura.categoria}</span>
                            <span 
                              className="status"
                              style={{ color: getStatusColor(leitura.status) }}
                            >
                              {leitura.status ? leitura.status.replace('-', ' ') : 'não iniciado'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="leitura-actions">
                        <button 
                          className="edit-btn"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleEdit(leitura);
                          }}
                          title="Editar"
                        >
                          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                            <path d="M12 20h9"/>
                            <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                          </svg>
                        </button>
                        <button 
                          className="delete-btn"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setDeleteId(leitura.id);
                            setShowDeleteModal(true);
                          }}
                          title="Excluir"
                        >
                          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                            <polyline points="3,6 5,6 21,6"/>
                            <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                            <line x1="10" y1="11" x2="10" y2="17"/>
                            <line x1="14" y1="11" x2="14" y2="17"/>
                          </svg>
                        </button>
                      </div>
                    </div>

                    <div className="leitura-details">
                      {leitura.avaliacao > 0 && (
                        <div className="rating">
                          {renderStars(leitura.avaliacao)}
                        </div>
                      )}

                      {leitura.paginas && (
                        <div className="progress-info">
                          <span>Páginas: {leitura.paginasLidas || 0} / {leitura.paginas}</span>
                          <div className="mini-progress">
                            <div 
                              className="mini-progress-fill"
                              style={{ 
                                width: `${(leitura.paginasLidas || 0) / leitura.paginas * 100}%` 
                              }}
                            ></div>
                          </div>
                        </div>
                      )}

                      {leitura.notas && (
                        <div className="notes">
                          <p><strong>Notas:</strong> {leitura.notas}</p>
                        </div>
                      )}

                      <div className="status-actions">
                        <button 
                          className={`status-btn ${leitura.status === 'nao-iniciado' ? 'active' : ''}`}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            updateStatus(leitura.id, 'nao-iniciado');
                          }}
                        >
                          Não Iniciado
                        </button>
                        <button 
                          className={`status-btn ${leitura.status === 'lendo' ? 'active' : ''}`}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            updateStatus(leitura.id, 'lendo');
                          }}
                        >
                          Lendo
                        </button>
                        <button 
                          className={`status-btn ${leitura.status === 'concluido' ? 'active' : ''}`}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            updateStatus(leitura.id, 'concluido');
                          }}
                        >
                          Concluído
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}

      {/* Modal de Formulário */}
      {showForm && (
        <div className="modal-overlay" onClick={() => resetForm()}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingId ? 'Editar Leitura' : 'Nova Leitura'}</h3>
              <button className="close-btn" onClick={resetForm}>
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="leitura-form">
              <div className="form-group">
                <label>Título *</label>
                <input
                  type="text"
                  value={formData.titulo}
                  onChange={(e) => setFormData({...formData, titulo: e.target.value})}
                  placeholder="Nome do livro, artigo, curso..."
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Categoria</label>
                  <select
                    value={formData.categoria}
                    onChange={(e) => setFormData({...formData, categoria: e.target.value})}
                  >
                    <option value="livro">Livro</option>
                    <option value="artigo">
                      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                        <polyline points="14,2 14,8 20,8"/>
                        <line x1="16" y1="13" x2="8" y2="13"/>
                        <line x1="16" y1="17" x2="8" y2="17"/>
                        <polyline points="10,9 9,9 8,9"/>
                      </svg>
                      Artigo
                    </option>
                    <option value="curso">
                      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                        <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                        <path d="M6 12v5c3 3 9 3 12 0v-5"/>
                      </svg>
                      Curso
                    </option>
                    <option value="podcast">
                      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                        <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/>
                        <path d="M19 10v2a7 7 0 01-14 0v-2"/>
                        <line x1="12" y1="19" x2="12" y2="23"/>
                        <line x1="8" y1="23" x2="16" y2="23"/>
                      </svg>
                      Podcast
                    </option>
                    <option value="video">
                      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                        <polygon points="23 7 16 12 23 17 23 7"/>
                        <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
                      </svg>
                      Vídeo
                    </option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                  >
                    <option value="nao-iniciado">Não Iniciado</option>
                    <option value="lendo">Lendo</option>
                    <option value="concluido">Concluído</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Avaliação</label>
                {renderStars(formData.avaliacao, true, (rating) => 
                  setFormData({...formData, avaliacao: rating})
                )}
              </div>

              {formData.categoria === 'livro' && (
                <div className="form-row">
                  <div className="form-group">
                    <label>Total de Páginas</label>
                    <input
                      type="number"
                      value={formData.paginas}
                      onChange={(e) => setFormData({...formData, paginas: e.target.value})}
                      placeholder="300"
                    />
                  </div>

                  <div className="form-group">
                    <label>Páginas Lidas</label>
                    <input
                      type="number"
                      value={formData.paginasLidas}
                      onChange={(e) => setFormData({...formData, paginasLidas: e.target.value})}
                      placeholder="150"
                    />
                  </div>
                </div>
              )}

              <div className="form-row">
                <div className="form-group">
                  <label>Data de Início</label>
                  <input
                    type="date"
                    value={formData.dataInicio}
                    onChange={(e) => setFormData({...formData, dataInicio: e.target.value})}
                  />
                </div>

                <div className="form-group">
                  <label>Data de Conclusão</label>
                  <input
                    type="date"
                    value={formData.dataConclusao}
                    onChange={(e) => setFormData({...formData, dataConclusao: e.target.value})}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Notas Pessoais</label>
                <textarea
                  value={formData.notas}
                  onChange={(e) => setFormData({...formData, notas: e.target.value})}
                  placeholder="Suas impressões, resumo, citações..."
                  rows="4"
                />
              </div>

              <div className="form-actions">
                <button type="button" onClick={resetForm} className="cancel-btn">
                  Cancelar
                </button>
                <button type="submit" className="save-btn">
                  {editingId ? 'Salvar Alterações' : 'Adicionar Leitura'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Exclusão */}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal-content small">
            <div className="modal-header">
              <h3>Confirmar Exclusão</h3>
            </div>
            <div className="modal-body">
              <p>Tem certeza de que deseja excluir esta leitura?</p>
              <p className="warning">Esta ação não pode ser desfeita.</p>
            </div>
            <div className="modal-actions">
              <button 
                className="cancel-btn"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancelar
              </button>
              <button 
                className="delete-btn"
                onClick={handleDelete}
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Leituras;