import React, { useEffect, useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import Resumo from './Resumo';
import Organizacao from './Organizacao';
import Planejamento from './Planejamento';
import Habitos from './Habitos';
import Carreira from './Carreira';
import Financas from './Financas';
import Leituras from './Leituras';
import Saude from './Saude';
import Projetos from './Projetos';
import Agenda from './Agenda';
import { auth, db } from '../firebaseConfig';
import { doc, getDoc, collection, query, where, onSnapshot, updateDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import './organizacao.css';
import './modalPerfil.css';
import './Cabecalho.css';
import './dashboard-nav.css';
import './dashboard-modern.css';
import './dashboard-mini-modules.css';

// Componente do cabeçalho do dashboard
function Cabecalho() {
  const { darkMode, toggleDarkMode } = useTheme();
  const [nome, setNome] = useState('');
  const [foto, setFoto] = useState('');
  const [showPerfil, setShowPerfil] = useState(false);
  const [dadosAluno, setDadosAluno] = useState(null);
  const [user, setUser] = useState(null);
  const [showSearch, setShowSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [editedData, setEditedData] = useState({});
  const [saving, setSaving] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const navigate = useNavigate();

  // Monitora mudanças na autenticação
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  // Carrega dados do usuário logado
  useEffect(() => {
    if (user) {
      const docRef = doc(db, 'alunos', user.uid);
      getDoc(docRef).then((docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setNome(data.nomeCompleto || data.nome || '');
          setFoto(data.foto || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(data.nomeCompleto || data.nome || 'Aluno'));
          setDadosAluno(data);
        }
      });
    }
  }, [user]);

  const handleLogout = async () => {
    await auth.signOut();
    navigate('/login-aluno');
  };

  const handleOpenPerfil = () => {
    setShowPerfil(true);
    setEditMode(false);
    setEditedData({});
  };

  const handleEditPerfil = () => {
    setEditMode(true);
    setEditedData({
      nomeCompleto: dadosAluno?.nomeCompleto || '',
      emailContato: dadosAluno?.emailContato || '',
      curso: dadosAluno?.curso || '',
      semestrePeriodo: dadosAluno?.semestrePeriodo || '',
      modalidade: dadosAluno?.modalidade || '',
      nivelEnsino: dadosAluno?.nivelEnsino || ''
    });
  };

  const handleSavePerfil = async () => {
    if (!user) return;
    
    setSaving(true);
    try {
      const docRef = doc(db, 'alunos', user.uid);
      await updateDoc(docRef, editedData);
      
      // Atualizar estado local
      setDadosAluno(prev => ({ ...prev, ...editedData }));
      setNome(editedData.nomeCompleto || editedData.nome || '');
      
      setEditMode(false);
      setEditedData({});
      
      // Mostrar mensagem de sucesso
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);
      
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
      alert('Erro ao salvar perfil. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditMode(false);
    setEditedData({});
  };

  const handleInputChange = (field, value) => {
    setEditedData(prev => ({ ...prev, [field]: value }));
  };

  const handleSearch = (e) => {
    if (e.key === 'Enter' && searchTerm.trim()) {
      // Aqui você pode implementar a lógica de busca
      console.log('Buscando por:', searchTerm);
      // Por exemplo, navegar para uma página de resultados
      setShowSearch(false);
      setSearchTerm('');
    }
  };

  return (
    <>
      <header className="dashboard-header">
        <div className="dashboard-header-left">
          <button 
            className="dashboard-icon-btn" 
            title="Buscar" 
            aria-label="Buscar"
            onClick={() => setShowSearch(!showSearch)}
          >
            <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
          </button>
          
          <button 
            className="dashboard-icon-btn" 
            title={darkMode ? "Modo Claro" : "Modo Escuro"}
            aria-label={darkMode ? "Ativar modo claro" : "Ativar modo escuro"}
            onClick={toggleDarkMode}
          >
            {darkMode ? (
              <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="5"/>
                <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
              </svg>
            ) : (
              <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
              </svg>
            )}
          </button>
          
          <button className="dashboard-icon-btn" title="Notificações" aria-label="Notificações">
            <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 01-3.46 0"/>
            </svg>
          </button>
        </div>
        
        {showSearch && (
          <div className="search-overlay">
            <input
              type="text"
              placeholder="Buscar em todos os módulos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={handleSearch}
              className="search-input-global"
              autoFocus
            />
          </div>
        )}
        
        <div className="dashboard-header-right">
          <div className="dashboard-profile" onClick={handleOpenPerfil}>
            <div className="profile-avatar">
              <img src={foto} alt="Perfil" className="dashboard-profile-img" />
              <div className="profile-status"></div>
            </div>
            <div className="profile-info">
              <span className="profile-greeting">Olá,</span>
              <span className="dashboard-profile-nome">{nome}</span>
            </div>
            <div className="profile-dropdown-arrow">
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <polyline points="6,9 12,15 18,9"/>
              </svg>
            </div>
          </div>
          <button className="dashboard-logout-btn" onClick={handleLogout}>
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
              <polyline points="16,17 21,12 16,7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Sair
          </button>
        </div>
      </header>
      
      {showPerfil && (
        <div className="modal-perfil-bg">
          <div className="modal-perfil">
            {showSuccessMessage && (
              <div className="success-message">
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
                  <polyline points="22,4 12,14.01 9,11.01"/>
                </svg>
                Perfil atualizado com sucesso!
              </div>
            )}
            
            <h3>Meu Cadastro</h3>
            
            <div><strong>Nome Completo:</strong> 
              {editMode ? (
                <input
                  type="text"
                  className="edit-input"
                  value={editedData.nomeCompleto || ''}
                  onChange={(e) => handleInputChange('nomeCompleto', e.target.value)}
                  placeholder="Digite seu nome completo"
                />
              ) : (
                dadosAluno?.nomeCompleto || "Não informado"
              )}
            </div>
            
            <div><strong>Email para Contato:</strong> 
              {editMode ? (
                <input
                  type="email"
                  className="edit-input"
                  value={editedData.emailContato || ''}
                  onChange={(e) => handleInputChange('emailContato', e.target.value)}
                  placeholder="Digite seu email de contato"
                />
              ) : (
                dadosAluno?.emailContato || "Não informado"
              )}
            </div>
            
            <div><strong>Email:</strong> {dadosAluno?.email || "Não informado"}</div>
            <div><strong>Matrícula:</strong> {dadosAluno?.matricula || "Não informado"}</div>
            
            <div><strong>Nível de Ensino:</strong> 
              {editMode ? (
                <select
                  className="edit-select"
                  value={editedData.nivelEnsino || ''}
                  onChange={(e) => handleInputChange('nivelEnsino', e.target.value)}
                >
                  <option value="">Selecione o nível</option>
                  <option value="Ensino Fundamental">Ensino Fundamental</option>
                  <option value="Ensino Médio">Ensino Médio</option>
                  <option value="Graduação">Graduação</option>
                  <option value="Pós-graduação">Pós-graduação</option>
                  <option value="Mestrado">Mestrado</option>
                  <option value="Doutorado">Doutorado</option>
                </select>
              ) : (
                dadosAluno?.nivelEnsino || "Não informado"
              )}
            </div>
            
            <div><strong>Curso:</strong> 
              {editMode ? (
                <input
                  type="text"
                  className="edit-input"
                  value={editedData.curso || ''}
                  onChange={(e) => handleInputChange('curso', e.target.value)}
                  placeholder="Digite seu curso"
                />
              ) : (
                dadosAluno?.curso || "Não informado"
              )}
            </div>
            
            <div><strong>Semestre/Período Atual:</strong> 
              {editMode ? (
                <input
                  type="text"
                  className="edit-input"
                  value={editedData.semestrePeriodo || ''}
                  onChange={(e) => handleInputChange('semestrePeriodo', e.target.value)}
                  placeholder="Ex: 5º Semestre"
                />
              ) : (
                dadosAluno?.semestrePeriodo || "Não informado"
              )}
            </div>
            
            <div><strong>Modalidade:</strong> 
              {editMode ? (
                <select
                  className="edit-select"
                  value={editedData.modalidade || ''}
                  onChange={(e) => handleInputChange('modalidade', e.target.value)}
                >
                  <option value="">Selecione a modalidade</option>
                  <option value="Presencial">Presencial</option>
                  <option value="EAD">EAD</option>
                  <option value="Semipresencial">Semipresencial</option>
                  <option value="Híbrido">Híbrido</option>
                </select>
              ) : (
                dadosAluno?.modalidade || "Não informado"
              )}
            </div>
            
            <div className="modal-perfil-avatar">
              <img src={dadosAluno?.foto || foto} alt="Avatar" />
            </div>
            
            <div style={{marginTop: 16}}>
              {editMode ? (
                <div className="edit-buttons">
                  <button className="btn-cancel" onClick={handleCancelEdit} disabled={saving}>
                    Cancelar
                  </button>
                  <button className="btn-save" onClick={handleSavePerfil} disabled={saving}>
                    {saving ? 'Salvando...' : 'Salvar'}
                  </button>
                </div>
              ) : (
                <div className="edit-buttons">
                  <button className="dashboard-logout-btn" onClick={() => setShowPerfil(false)}>
                    Fechar
                  </button>
                  <button className="btn-edit" onClick={handleEditPerfil}>
                    Editar Perfil
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Dashboard () {
  const { darkMode } = useTheme();
  const [stats, setStats] = useState({
    habitosAtivos: 0,
    projetosEmAndamento: 0,
    metasAlcancadas: 0,
    livrosLidos: 0
  });
  const [user, setUser] = useState(null);

  // Monitor user authentication
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  // Buscar estatísticas em tempo real do Firebase
  useEffect(() => {
    if (!user) {
      setStats({
        habitosAtivos: 0,
        projetosEmAndamento: 0,
        metasAlcancadas: 0,
        livrosLidos: 0
      });
      return;
    }

    // Listener para Hábitos
    const habitosQuery = query(
      collection(db, 'habitos'),
      where('uid', '==', user.uid)
    );
    const unsubscribeHabitos = onSnapshot(habitosQuery, (snapshot) => {
      const habitosAtivos = snapshot.docs.filter(doc => doc.data().ativo !== false).length;
      setStats(prev => ({ ...prev, habitosAtivos }));
    });

    // Listener para Projetos
    const projetosQuery = query(
      collection(db, 'projetos'),
      where('uid', '==', user.uid)
    );
    const unsubscribeProjetos = onSnapshot(projetosQuery, (snapshot) => {
      const projetosEmAndamento = snapshot.docs.filter(doc => 
        doc.data().status === 'Em Andamento' || !doc.data().status
      ).length;
      setStats(prev => ({ ...prev, projetosEmAndamento }));
    });

    // Listener para Metas (Planejamento)
    const metasQuery = query(
      collection(db, 'metas'),
      where('uid', '==', user.uid)
    );
    const unsubscribeMetas = onSnapshot(metasQuery, (snapshot) => {
      const metasAlcancadas = snapshot.docs.filter(doc => doc.data().concluida === true).length;
      setStats(prev => ({ ...prev, metasAlcancadas }));
    });

    // Listener para Leituras
    const leiturasQuery = query(
      collection(db, 'leituras'),
      where('uid', '==', user.uid)
    );
    const unsubscribeLeituras = onSnapshot(leiturasQuery, (snapshot) => {
      const livrosLidos = snapshot.docs.filter(doc => doc.data().status === 'Lido').length;
      setStats(prev => ({ ...prev, livrosLidos }));
    });

    return () => {
      unsubscribeHabitos();
      unsubscribeProjetos();
      unsubscribeMetas();
      unsubscribeLeituras();
    };
  }, [user]);

  const modulosData = [
    {
      nome: 'Hábitos',
      icone: (
        <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12,6 12,12 16,14"/>
        </svg>
      ),
      rota: '/habitos',
      descricao: 'Gerencie seus hábitos diários',
      cor: '#4c6ef5'
    },
    {
      nome: 'Carreira',
      icone: (
        <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      ),
      rota: '/carreira',
      descricao: 'Desenvolva sua carreira profissional',
      cor: '#845ef7'
    },
    {
      nome: 'Finanças',
      icone: (
        <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
          <line x1="12" y1="1" x2="12" y2="23"/>
          <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
        </svg>
      ),
      rota: '/financas',
      descricao: 'Controle suas finanças pessoais',
      cor: '#51cf66'
    },
    {
      nome: 'Leituras',
      icone: (
        <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
          <path d="M4 19.5A2.5 2.5 0 016.5 17H20"/>
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>
        </svg>
      ),
      rota: '/leituras',
      descricao: 'Acompanhe suas leituras',
      cor: '#ff8c42'
    },
    {
      nome: 'Saúde',
      icone: (
        <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
          <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
        </svg>
      ),
      rota: '/saude',
      descricao: 'Cuide da sua saúde e bem-estar',
      cor: '#ff6b6b'
    },
    {
      nome: 'Projetos',
      icone: (
        <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
          <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/>
        </svg>
      ),
      rota: '/projetos',
      descricao: 'Organize seus projetos pessoais',
      cor: '#339af0'
    }
  ];

  return (
    <div className={`dashboard-bg ${darkMode ? 'dark-mode' : ''}`}>
      <div className="dashboard-container">
        <Cabecalho />
        
        {/* Dashboard Stats */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12,6 12,12 16,14"/>
              </svg>
            </div>
            <div className="stat-content">
              <div className="stat-number">{stats.habitosAtivos}</div>
              <div className="stat-label">Hábitos Ativos</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/>
              </svg>
            </div>
            <div className="stat-content">
              <div className="stat-number">{stats.projetosEmAndamento}</div>
              <div className="stat-label">Projetos em Andamento</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
                <polyline points="22,4 12,14.01 9,11.01"/>
              </svg>
            </div>
            <div className="stat-content">
              <div className="stat-number">{stats.metasAlcancadas}</div>
              <div className="stat-label">Metas Alcançadas</div>
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
              <div className="stat-number">{stats.livrosLidos}</div>
              <div className="stat-label">Livros Lidos</div>
            </div>
          </div>
        </div>

        {/* Módulos Grid */}
        <div className="modulos-grid">
          <h2 className="modulos-titulo">Seus Módulos</h2>
          <div className="modulos-cards">
            {modulosData.map((modulo, index) => (
              <Link 
                key={index} 
                to={modulo.rota} 
                className="modulo-card"
                style={{'--modulo-cor': modulo.cor}}
              >
                <div className="modulo-icon">{modulo.icone}</div>
                <div className="modulo-content">
                  <h3 className="modulo-nome">{modulo.nome}</h3>
                  <p className="modulo-descricao">{modulo.descricao}</p>
                </div>
                <div className="modulo-arrow">→</div>
              </Link>
            ))}
          </div>
        </div>

        {/* Seção de Resumo e Módulos Menores */}
        <div className="dashboard-bottom">
          <div className="dashboard-resumo-section">
            <Resumo />
          </div>
          
          <div className="dashboard-modulos-pequenos">
            <Organizacao />
            <Planejamento />
            <Agenda />
          </div>
        </div>
      </div>
    </div>
  );
}
export default Dashboard;