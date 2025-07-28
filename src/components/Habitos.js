import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebaseConfig';
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
  query,
  where
} from "firebase/firestore";
import './Habitos-novo.css';

function Habitos({ darkMode = false }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');

  // Estados dos hábitos
  const [habitos, setHabitos] = useState([]);
  const [editandoHabito, setEditandoHabito] = useState(null);
  const [novoHabito, setNovoHabito] = useState({
    nome: '',
    categoria: 'Saúde',
    descricao: '',
    frequencia: 'diaria',
    meta: 1,
    dificuldade: 'facil'
  });

  // Categorias disponíveis para organizar hábitos
  const [categorias] = useState([
    'Saúde', 'Exercícios', 'Estudos', 'Trabalho', 
    'Leitura', 'Mindfulness', 'Alimentação', 'Sono', 'Outro'
  ]);

  // Sistema de filtros para visualização
  const [filtros, setFiltros] = useState({
    categoria: '',
    status: '', // ativo, pausado, concluido
    dificuldade: ''
  });

  // Sistema de metas e acompanhamento de progresso
  const [metas, setMetas] = useState([]);
  const [editandoMeta, setEditandoMeta] = useState(null);
  const [novaMeta, setNovaMeta] = useState({
    titulo: '',
    prazo: '',
    habitosRelacionados: [],
    progresso: 0
  });

  // Rotinas Diárias - INICIANDO VAZIO
  const [rotinas, setRotinas] = useState([]);
  const [editandoRotina, setEditandoRotina] = useState(null);
  const [novaRotina, setNovaRotina] = useState({
    nome: '',
    periodo: 'manha', // manha, tarde, noite
    habitos: [],
    duracaoEstimada: 0
  });

  // Journal de Hábitos - INICIANDO VAZIO
  const [journalEntries, setJournalEntries] = useState([]);
  const [editandoJournal, setEditandoJournal] = useState(null);
  const [novaEntradaJournal, setNovaEntradaJournal] = useState({
    data: new Date().toISOString().substr(0, 10),
    reflexao: '',
    dificuldades: '',
    sucessos: '',
    humor: 5
  });

  // Relatórios e Analytics
  const [relatorios, setRelatorios] = useState({
    streakAtual: 0,
    streakMaximo: 0,
    habitosMaisConsistentes: [],
    taxaSucesso: 0,
    diasAtivos: 0
  });

  // Dicas motivacionais
  const dicas = [
    "Comece pequeno: hábitos simples são mais fáceis de manter.",
    "Associe um novo hábito a uma rotina já existente.",
    "Registre seu progresso diariamente.",
    "Não desista se falhar um dia, recomece!",
    "Compartilhe seus objetivos com alguém.",
    "Visualize o benefício de manter o hábito.",
    "Use o poder dos micro-hábitos: 2 minutos por dia.",
    "Celebre pequenas vitórias no caminho.",
    "Crie um ambiente que favoreça o hábito.",
    "Tenha paciência: leva tempo formar um hábito."
  ];

  const [dicaAtual, setDicaAtual] = useState('');

  // Firebase Auth
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      if (user) {
        carregarDadosFirebase(user.uid);
      } else {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // Carregar todos os dados do Firebase
  const carregarDadosFirebase = async (userId) => {
    try {
      setLoading(true);
      
      // Carregar hábitos
      const habitosRef = collection(db, 'habitos');
      const qHabitos = query(habitosRef, where('userId', '==', userId));
      const habitosSnapshot = await getDocs(qHabitos);
      const habitosList = habitosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setHabitos(habitosList);

      // Carregar metas
      const metasRef = collection(db, 'metas_habitos');
      const qMetas = query(metasRef, where('userId', '==', userId));
      const metasSnapshot = await getDocs(qMetas);
      const metasList = metasSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMetas(metasList);

      // Carregar rotinas
      const rotinasRef = collection(db, 'rotinas');
      const qRotinas = query(rotinasRef, where('userId', '==', userId));
      const rotinasSnapshot = await getDocs(qRotinas);
      const rotinasList = rotinasSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRotinas(rotinasList);

      // Carregar journal
      const journalRef = collection(db, 'journal_habitos');
      const qJournal = query(journalRef, where('userId', '==', userId));
      const journalSnapshot = await getDocs(qJournal);
      const journalList = journalSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setJournalEntries(journalList);

      // Calcular relatórios
      calcularRelatorios(habitosList);
      
      setLoading(false);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setLoading(false);
    }
  };

  // Dica aleatória inicial
  useEffect(() => {
    setDicaAtual(dicas[Math.floor(Math.random() * dicas.length)]);
  }, []);

  // Calcular relatórios e métricas
  const calcularRelatorios = (habitosList) => {
    const habitosAtivos = habitosList.filter(h => h.status === 'ativo');
    const habitosConcluidos = habitosList.filter(h => h.status === 'concluido');
    
    setRelatorios({
      streakAtual: calcularStreak(habitosList),
      streakMaximo: calcularStreakMaximo(habitosList),
      habitosMaisConsistentes: habitosAtivos.slice(0, 3),
      taxaSucesso: habitosList.length > 0 ? (habitosConcluidos.length / habitosList.length) * 100 : 0,
      diasAtivos: calcularDiasAtivos(habitosList)
    });
  };

  const calcularStreak = (habitosList) => {
    // Lógica para calcular streak atual
    const hoje = new Date();
    let streak = 0;
    
    for (let i = 0; i < 365; i++) {
      const data = new Date(hoje);
      data.setDate(data.getDate() - i);
      const dataStr = data.toISOString().split('T')[0];
      
      const habitosRealizados = habitosList.filter(h => 
        h.ultimaExecucao && h.ultimaExecucao.startsWith(dataStr)
      );
      
      if (habitosRealizados.length > 0) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  };

  const calcularStreakMaximo = (habitosList) => {
    // Lógica para calcular streak máximo
    return Math.max(10, calcularStreak(habitosList)); // Placeholder
  };

  const calcularDiasAtivos = (habitosList) => {
    const diasUnicos = new Set();
    habitosList.forEach(h => {
      if (h.ultimaExecucao) {
        diasUnicos.add(h.ultimaExecucao.split('T')[0]);
      }
    });
    return diasUnicos.size;
  };

  // Estatísticas computadas
  const estatisticas = {
    totalHabitos: habitos.length,
    habitosAtivos: habitos.filter(h => h.status === 'ativo').length,
    habitosPausados: habitos.filter(h => h.status === 'pausado').length,
    habitosConcluidos: habitos.filter(h => h.status === 'concluido').length,
    metasConcluidas: metas.filter(m => m.progresso >= 100).length,
    totalMetas: metas.length,
    rotinasAtivas: rotinas.filter(r => r.ativa).length,
    entrysMes: journalEntries.filter(j => {
      const entryDate = new Date(j.data);
      const agora = new Date();
      return entryDate.getMonth() === agora.getMonth() && entryDate.getFullYear() === agora.getFullYear();
    }).length
  };

  // Filtrar dados
  const habitosFiltrados = habitos.filter(habito => {
    const categoriaOk = !filtros.categoria || habito.categoria === filtros.categoria;
    const statusOk = !filtros.status || habito.status === filtros.status;
    const dificuldadeOk = !filtros.dificuldade || habito.dificuldade === filtros.dificuldade;
    return categoriaOk && statusOk && dificuldadeOk;
  });

  // CRUD - Hábitos
  const adicionarHabito = async () => {
    if (!novoHabito.nome.trim() || !user) return;
    
    try {
      const habitoData = {
        ...novoHabito,
        userId: user.uid,
        criadoEm: new Date().toISOString(),
        status: 'ativo',
        progresso: 0,
        sequencia: 0,
        ultimaExecucao: null
      };
      
      const docRef = await addDoc(collection(db, 'habitos'), habitoData);
      setHabitos([...habitos, { id: docRef.id, ...habitoData }]);
      setNovoHabito({ nome: '', categoria: 'Saúde', descricao: '', frequencia: 'diaria', meta: 1, dificuldade: 'facil' });
    } catch (error) {
      console.error('Erro ao adicionar hábito:', error);
    }
  };

  const editarHabito = async (id, dadosAtualizados) => {
    try {
      await updateDoc(doc(db, 'habitos', id), dadosAtualizados);
      setHabitos(habitos.map(h => h.id === id ? { ...h, ...dadosAtualizados } : h));
      setEditandoHabito(null);
    } catch (error) {
      console.error('Erro ao editar hábito:', error);
    }
  };

  const excluirHabito = async (id) => {
    try {
      await deleteDoc(doc(db, 'habitos', id));
      setHabitos(habitos.filter(h => h.id !== id));
    } catch (error) {
      console.error('Erro ao excluir hábito:', error);
    }
  };

  const marcarHabitoRealizado = async (id) => {
    const habito = habitos.find(h => h.id === id);
    if (!habito) return;

    const agora = new Date().toISOString();
    const dadosAtualizados = {
      progresso: habito.progresso + 1,
      ultimaExecucao: agora,
      sequencia: habito.sequencia + 1
    };

    await editarHabito(id, dadosAtualizados);
  };

  // CRUD - Metas
  const adicionarMeta = async () => {
    if (!novaMeta.titulo.trim() || !user) return;
    
    try {
      const metaData = {
        ...novaMeta,
        userId: user.uid,
        criadaEm: new Date().toISOString()
      };
      
      const docRef = await addDoc(collection(db, 'metas_habitos'), metaData);
      setMetas([...metas, { id: docRef.id, ...metaData }]);
      setNovaMeta({ titulo: '', prazo: '', habitosRelacionados: [], progresso: 0 });
    } catch (error) {
      console.error('Erro ao adicionar meta:', error);
    }
  };

  const editarMeta = async (id, dadosAtualizados) => {
    try {
      await updateDoc(doc(db, 'metas_habitos', id), dadosAtualizados);
      setMetas(metas.map(m => m.id === id ? { ...m, ...dadosAtualizados } : m));
      setEditandoMeta(null);
    } catch (error) {
      console.error('Erro ao editar meta:', error);
    }
  };

  const excluirMeta = async (id) => {
    try {
      await deleteDoc(doc(db, 'metas_habitos', id));
      setMetas(metas.filter(m => m.id !== id));
    } catch (error) {
      console.error('Erro ao excluir meta:', error);
    }
  };

  // CRUD - Rotinas
  const adicionarRotina = async () => {
    if (!novaRotina.nome.trim() || !user) return;
    
    try {
      const rotinaData = {
        ...novaRotina,
        userId: user.uid,
        criadaEm: new Date().toISOString(),
        ativa: true
      };
      
      const docRef = await addDoc(collection(db, 'rotinas'), rotinaData);
      setRotinas([...rotinas, { id: docRef.id, ...rotinaData }]);
      setNovaRotina({ nome: '', periodo: 'manha', habitos: [], duracaoEstimada: 0 });
    } catch (error) {
      console.error('Erro ao adicionar rotina:', error);
    }
  };

  const editarRotina = async (id, dadosAtualizados) => {
    try {
      await updateDoc(doc(db, 'rotinas', id), dadosAtualizados);
      setRotinas(rotinas.map(r => r.id === id ? { ...r, ...dadosAtualizados } : r));
      setEditandoRotina(null);
    } catch (error) {
      console.error('Erro ao editar rotina:', error);
    }
  };

  const excluirRotina = async (id) => {
    try {
      await deleteDoc(doc(db, 'rotinas', id));
      setRotinas(rotinas.filter(r => r.id !== id));
    } catch (error) {
      console.error('Erro ao excluir rotina:', error);
    }
  };

  // CRUD - Journal
  const adicionarJournalEntry = async () => {
    if (!novaEntradaJournal.reflexao.trim() || !user) return;
    
    try {
      const entryData = {
        ...novaEntradaJournal,
        userId: user.uid,
        criadaEm: new Date().toISOString()
      };
      
      const docRef = await addDoc(collection(db, 'journal_habitos'), entryData);
      setJournalEntries([...journalEntries, { id: docRef.id, ...entryData }]);
      setNovaEntradaJournal({
        data: new Date().toISOString().substr(0, 10),
        reflexao: '',
        dificuldades: '',
        sucessos: '',
        humor: 5
      });
    } catch (error) {
      console.error('Erro ao adicionar entry:', error);
    }
  };

  const editarJournalEntry = async (id, dadosAtualizados) => {
    try {
      await updateDoc(doc(db, 'journal_habitos', id), dadosAtualizados);
      setJournalEntries(journalEntries.map(j => j.id === id ? { ...j, ...dadosAtualizados } : j));
      setEditandoJournal(null);
    } catch (error) {
      console.error('Erro ao editar entry:', error);
    }
  };

  const excluirJournalEntry = async (id) => {
    try {
      await deleteDoc(doc(db, 'journal_habitos', id));
      setJournalEntries(journalEntries.filter(j => j.id !== id));
    } catch (error) {
      console.error('Erro ao excluir entry:', error);
    }
  };

  // Loading
  if (loading) {
    return (
      <div className="carreira-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Carregando seus hábitos...</p>
        </div>
      </div>
    );
  }

  // Não logado
  if (!user) {
    return (
      <div className="carreira-container">
        <div className="empty-state">
          <h2>Acesso Restrito</h2>
          <p>Faça login para acessar seus hábitos</p>
          <button onClick={() => navigate('/login')} className="cta-button">
            Fazer Login
          </button>
        </div>
      </div>
    );
  }
  return (
    <>
    <div className={`carreira-container ${darkMode ? 'dark-mode' : ''}`} data-theme={darkMode ? 'dark' : 'light'}>      {/* Cabeçalho */}
      <div className="carreira-header">
        <h3>
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12,6 12,12 16,14"/>
          </svg>
          Gestão de Hábitos
        </h3>
        <button 
          className="btn-voltar" 
          onClick={() => navigate('/dashboard')}
          title="Voltar ao Dashboard"
        >
        </button>
      </div>

      {/* Navegação por Tabs */}
      <nav className="carreira-tabs">        <button 
          className={`tab ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
            <line x1="9" y1="9" x2="15" y2="9"/>
            <line x1="9" y1="15" x2="15" y2="15"/>
          </svg>
          Dashboard
        </button>
        <button 
          className={`tab ${activeTab === 'habitos' ? 'active' : ''}`}
          onClick={() => setActiveTab('habitos')}
        >
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <polyline points="20,6 9,17 4,12"/>
          </svg>
          Hábitos
        </button>
        <button 
          className={`tab ${activeTab === 'metas' ? 'active' : ''}`}
          onClick={() => setActiveTab('metas')}
        >
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12,6 12,12 16,14"/>
          </svg>
          Metas
        </button>        <button 
          className={`tab ${activeTab === 'rotinas' ? 'active' : ''}`}
          onClick={() => setActiveTab('rotinas')}
        >
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <polyline points="23,4 23,10 17,10"/>
            <polyline points="1,20 1,14 7,14"/>
            <path d="M20.49 9A9 9 0 005.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 013.51 15"/>
          </svg>
          Rotinas
        </button>
        <button 
          className={`tab ${activeTab === 'journal' ? 'active' : ''}`}
          onClick={() => setActiveTab('journal')}
        >
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
            <polyline points="14,2 14,8 20,8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
            <polyline points="10,9 9,9 8,9"/>
          </svg>
          Journal
        </button>
        <button 
          className={`tab ${activeTab === 'relatorios' ? 'active' : ''}`}
          onClick={() => setActiveTab('relatorios')}
        >
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <polyline points="23,6 13.5,15.5 8.5,10.5 1,18"/>
            <polyline points="17,6 23,6 23,12"/>
          </svg>
          Relatórios
        </button>
      </nav>

      {/* Conteúdo baseado na tab ativa */}
      <div className="carreira-content">
        {/* DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="dashboard-section">
            {/* Estatísticas Principais */}
            <div className="stats-grid">
              <div className="stat-card">
                <h3>Hábitos Ativos</h3>
                <div className="stat-number">{estatisticas.habitosAtivos}</div>
                <div className="stat-label">Total: {estatisticas.totalHabitos}</div>
              </div>
              <div className="stat-card">
                <h3>Sequência Atual</h3>
                <div className="stat-number">{relatorios.streakAtual}</div>
                <div className="stat-label">dias consecutivos</div>
              </div>
              <div className="stat-card">
                <h3>Metas Concluídas</h3>
                <div className="stat-number">{estatisticas.metasConcluidas}</div>
                <div className="stat-label">de {estatisticas.totalMetas}</div>
              </div>
              <div className="stat-card">
                <h3>Taxa de Sucesso</h3>
                <div className="stat-number">{relatorios.taxaSucesso.toFixed(1)}%</div>
                <div className="stat-label">geral</div>
              </div>
            </div>            {/* Quick Start ou Estado Vazio */}
            {estatisticas.totalHabitos === 0 && (
              <div className="empty-state">
                <div className="empty-icon">
                  <svg width="48" height="48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
                    <polyline points="22,4 12,14.01 9,11.01"/>
                  </svg>
                </div>
                <h2>Comece Sua Jornada de Hábitos</h2>
                <p>Transforme sua vida criando hábitos positivos e duradouros</p>
                <div className="quick-start-grid">
                  <div className="quick-start-card" onClick={() => setActiveTab('habitos')}>
                    <h3>
                      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                        <polyline points="20,6 9,17 4,12"/>
                      </svg>
                      Seus Primeiros Hábitos
                    </h3>
                    <p>Comece pequeno e crie consistência</p>
                  </div>
                  <div className="quick-start-card" onClick={() => setActiveTab('metas')}>
                    <h3>
                      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10"/>
                        <polyline points="12,6 12,12 16,14"/>
                      </svg>
                      Defina Metas
                    </h3>
                    <p>Estabeleça objetivos claros e alcançáveis</p>
                  </div>
                  <div className="quick-start-card" onClick={() => setActiveTab('rotinas')}>
                    <h3>
                      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                        <polyline points="23,4 23,10 17,10"/>
                        <polyline points="1,20 1,14 7,14"/>
                        <path d="M20.49 9A9 9 0 005.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 003.51 15"/>
                      </svg>
                      Crie Rotinas
                    </h3>
                    <p>Organize seus hábitos em rotinas diárias</p>
                  </div>
                </div>
              </div>
            )}            {/* Dica Motivacional */}
            {dicaAtual && (
              <div className="motivation-card">
                <h3>
                  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/>
                    <line x1="12" y1="17" x2="12.01" y2="17"/>
                  </svg>
                  Dica do Dia
                </h3>
                <p>{dicaAtual}</p>
                <button 
                  className="secondary-button"
                  onClick={() => setDicaAtual(dicas[Math.floor(Math.random() * dicas.length)])}
                >
                  Nova Dica
                </button>
              </div>
            )}

            {/* Hábitos Recentes */}
            {habitos.length > 0 && (
              <div className="recent-section">
                <h3>Hábitos Recentes</h3>
                <div className="card-grid">
                  {habitos.slice(0, 3).map(habito => (
                    <div key={habito.id} className="habit-card">
                      <h4>{habito.nome}</h4>
                      <p>{habito.categoria}</p>
                      <div className="habit-progress">
                        <div className="progress-bar">
                          <div 
                            className="progress-fill" 
                            style={{ width: `${Math.min(100, (habito.progresso / habito.meta) * 100)}%` }}
                          ></div>
                        </div>
                        <span>{habito.progresso}/{habito.meta}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* HÁBITOS */}
        {activeTab === 'habitos' && (
          <div className="section">
            <div className="section-header">
              <h2>Gestão de Hábitos</h2>              <div className="filters">
                <select 
                  className="form-select"
                  value={filtros.categoria} 
                  onChange={(e) => setFiltros({...filtros, categoria: e.target.value})}
                >
                  <option value="">Todas as categorias</option>
                  {categorias.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <select 
                  className="form-select"
                  value={filtros.status} 
                  onChange={(e) => setFiltros({...filtros, status: e.target.value})}
                >
                  <option value="">Todos os status</option>
                  <option value="ativo">Ativo</option>
                  <option value="pausado">Pausado</option>
                  <option value="concluido">Concluído</option>
                </select>
              </div>
            </div>

            {/* Formulário de Novo Hábito */}
            <div className="form-card">
              <h3>Adicionar Novo Hábito</h3>              <div className="form-grid">
                <input
                  className="form-input"
                  type="text"
                  placeholder="Nome do hábito"
                  value={novoHabito.nome}
                  onChange={(e) => setNovoHabito({...novoHabito, nome: e.target.value})}
                /><select
                  className="form-select"
                  value={novoHabito.categoria}
                  onChange={(e) => setNovoHabito({...novoHabito, categoria: e.target.value})}
                >
                  {categorias.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <select
                  className="form-select"
                  value={novoHabito.frequencia}
                  onChange={(e) => setNovoHabito({...novoHabito, frequencia: e.target.value})}
                >
                  <option value="diaria">Diária</option>
                  <option value="semanal">Semanal</option>
                  <option value="mensal">Mensal</option>
                </select>                <input
                  className="form-input"
                  type="number"
                  placeholder="Meta (ex: 1)"
                  value={novoHabito.meta}
                  onChange={(e) => setNovoHabito({...novoHabito, meta: parseInt(e.target.value) || 1})}
                /><select
                  className="form-select"
                  value={novoHabito.dificuldade}
                  onChange={(e) => setNovoHabito({...novoHabito, dificuldade: e.target.value})}
                >
                  <option value="facil">Fácil</option>
                  <option value="medio">Médio</option>
                  <option value="dificil">Difícil</option>
                </select>                <textarea
                  className="form-textarea"
                  placeholder="Descrição (opcional)"
                  value={novoHabito.descricao}
                  onChange={(e) => setNovoHabito({...novoHabito, descricao: e.target.value})}
                />
              </div>
              <button onClick={adicionarHabito} className="primary-button">
                Adicionar Hábito
              </button>
            </div>            {/* Lista de Hábitos */}
            {habitosFiltrados.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">
                  <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12,6 12,12 16,14"/>
                  </svg>
                </div>
                <h3>Nenhum hábito encontrado</h3>
                <p>Comece criando seu primeiro hábito acima</p>
              </div>
            ) : (
              <div className="card-grid">
                {habitosFiltrados.map(habito => (
                  <div key={habito.id} className="habit-card">
                    {editandoHabito === habito.id ? (
                      <div className="edit-form">
                        <input
                          type="text"
                          value={habito.nome}
                          onChange={(e) => setHabitos(habitos.map(h => 
                            h.id === habito.id ? {...h, nome: e.target.value} : h
                          ))}
                        />
                        <div className="edit-actions">
                          <button 
                            onClick={() => editarHabito(habito.id, habito)}
                            className="save-button"
                          >
                            Salvar
                          </button>
                          <button 
                            onClick={() => setEditandoHabito(null)}
                            className="cancel-button"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="habit-header">
                          <h4>{habito.nome}</h4>
                          <div className="habit-actions">                            <button 
                              onClick={() => marcarHabitoRealizado(habito.id)}
                              className="check-button"
                              title="Marcar como realizado"
                            >
                              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                                <polyline points="20,6 9,17 4,12"/>
                              </svg>
                            </button>
                            <button 
                              onClick={() => setEditandoHabito(habito.id)}
                              className="edit-button"
                              title="Editar"
                            >
                              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                              </svg>
                            </button>
                            <button 
                              onClick={() => excluirHabito(habito.id)}
                              className="delete-button"
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
                        <div className="habit-details">
                          <div className="habit-meta">
                            <span className="category">{habito.categoria}</span>
                            <span className="frequency">{habito.frequencia}</span>
                            <span className={`status ${habito.status}`}>{habito.status}</span>
                          </div>
                          {habito.descricao && (
                            <p className="habit-description">{habito.descricao}</p>
                          )}
                          <div className="habit-progress">
                            <div className="progress-bar">
                              <div 
                                className="progress-fill" 
                                style={{ width: `${Math.min(100, (habito.progresso / habito.meta) * 100)}%` }}
                              ></div>
                            </div>
                            <span>{habito.progresso}/{habito.meta}</span>
                          </div>
                          {habito.ultimaExecucao && (
                            <p className="last-execution">
                              Última execução: {new Date(habito.ultimaExecucao).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* METAS */}
        {activeTab === 'metas' && (
          <div className="section">
            <div className="section-header">
              <h2>Metas de Hábitos</h2>
            </div>

            {/* Formulário de Nova Meta */}
            <div className="form-card">
              <h3>Criar Nova Meta</h3>              <div className="form-grid">
                <input
                  className="form-input"
                  type="text"
                  placeholder="Título da meta"
                  value={novaMeta.titulo}
                  onChange={(e) => setNovaMeta({...novaMeta, titulo: e.target.value})}
                />
                <input
                  className="form-input"
                  type="date"
                  value={novaMeta.prazo}
                  onChange={(e) => setNovaMeta({...novaMeta, prazo: e.target.value})}
                />
                <input
                  className="form-input"
                  type="number"
                  placeholder="Progresso (%)"
                  value={novaMeta.progresso}
                  onChange={(e) => setNovaMeta({...novaMeta, progresso: parseInt(e.target.value) || 0})}
                />
              </div>
              <button onClick={adicionarMeta} className="primary-button">
                Criar Meta
              </button>
            </div>            {/* Lista de Metas */}
            {metas.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">
                  <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12,6 12,12 16,14"/>
                  </svg>
                </div>
                <h3>Nenhuma meta definida</h3>
                <p>Crie suas primeiras metas para direcionar seus hábitos</p>
              </div>
            ) : (
              <div className="card-grid">
                {metas.map(meta => (
                  <div key={meta.id} className="goal-card">
                    <h4>{meta.titulo}</h4>
                    <div className="goal-progress">
                      <div className="progress-bar">
                        <div 
                          className="progress-fill" 
                          style={{ width: `${meta.progresso}%` }}
                        ></div>
                      </div>
                      <span>{meta.progresso}%</span>
                    </div>
                    {meta.prazo && (
                      <p className="goal-deadline">
                        Prazo: {new Date(meta.prazo).toLocaleDateString()}
                      </p>
                    )}
                    <div className="goal-actions">
                      <button 
                        onClick={() => setEditandoMeta(meta.id)}
                        className="edit-button"
                      >
                        Editar
                      </button>
                      <button 
                        onClick={() => excluirMeta(meta.id)}
                        className="delete-button"
                      >
                        Excluir
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ROTINAS */}
        {activeTab === 'rotinas' && (
          <div className="section">
            <div className="section-header">
              <h2>Rotinas Diárias</h2>
            </div>

            {/* Formulário de Nova Rotina */}
            <div className="form-card">
              <h3>Criar Nova Rotina</h3>              <div className="form-grid">
                <input
                  className="form-input"
                  type="text"
                  placeholder="Nome da rotina"
                  value={novaRotina.nome}
                  onChange={(e) => setNovaRotina({...novaRotina, nome: e.target.value})}
                /><select
                  className="form-select"
                  value={novaRotina.periodo}
                  onChange={(e) => setNovaRotina({...novaRotina, periodo: e.target.value})}
                >
                  <option value="manha">Manhã</option>
                  <option value="tarde">Tarde</option>
                  <option value="noite">Noite</option>
                </select>                <input
                  className="form-input"
                  type="number"
                  placeholder="Duração estimada (min)"
                  value={novaRotina.duracaoEstimada}
                  onChange={(e) => setNovaRotina({...novaRotina, duracaoEstimada: parseInt(e.target.value) || 0})}
                />
              </div>
              <button onClick={adicionarRotina} className="primary-button">
                Criar Rotina
              </button>
            </div>            {/* Estado Vazio */}
            {rotinas.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">
                  <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <polyline points="23,4 23,10 17,10"/>
                    <polyline points="1,20 1,14 7,14"/>
                    <path d="M20.49 9A9 9 0 005.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 003.51 15"/>
                  </svg>
                </div>
                <h3>Nenhuma rotina criada</h3>
                <p>Organize seus hábitos em rotinas estruturadas</p>
              </div>
            ) : (
              <div className="card-grid">
                {rotinas.map(rotina => (
                  <div key={rotina.id} className="routine-card">
                    <h4>{rotina.nome}</h4>
                    <div className="routine-details">
                      <span className="period">{rotina.periodo}</span>
                      <span className="duration">{rotina.duracaoEstimada} min</span>
                      <span className={`status ${rotina.ativa ? 'active' : 'inactive'}`}>
                        {rotina.ativa ? 'Ativa' : 'Inativa'}
                      </span>
                    </div>
                    <div className="routine-actions">
                      <button 
                        onClick={() => setEditandoRotina(rotina.id)}
                        className="edit-button"
                      >
                        Editar
                      </button>
                      <button 
                        onClick={() => excluirRotina(rotina.id)}
                        className="delete-button"
                      >
                        Excluir
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* JOURNAL */}
        {activeTab === 'journal' && (
          <div className="section">
            <div className="section-header">
              <h2>Journal de Hábitos</h2>
            </div>

            {/* Formulário de Nova Entrada */}
            <div className="form-card">
              <h3>Nova Entrada no Journal</h3>              <div className="form-grid">
                <input
                  className="form-input"
                  type="date"
                  value={novaEntradaJournal.data}
                  onChange={(e) => setNovaEntradaJournal({...novaEntradaJournal, data: e.target.value})}
                />
                <input
                  className="form-range"
                  type="range"
                  min="1"
                  max="10"
                  value={novaEntradaJournal.humor}
                  onChange={(e) => setNovaEntradaJournal({...novaEntradaJournal, humor: parseInt(e.target.value)})}
                />
                <span>Humor: {novaEntradaJournal.humor}/10</span>
                <textarea
                  className="form-textarea"
                  placeholder="Reflexão do dia"
                  value={novaEntradaJournal.reflexao}
                  onChange={(e) => setNovaEntradaJournal({...novaEntradaJournal, reflexao: e.target.value})}
                />                <textarea
                  className="form-textarea"
                  placeholder="Dificuldades enfrentadas"
                  value={novaEntradaJournal.dificuldades}
                  onChange={(e) => setNovaEntradaJournal({...novaEntradaJournal, dificuldades: e.target.value})}
                />
                <textarea
                  className="form-textarea"
                  placeholder="Sucessos do dia"
                  value={novaEntradaJournal.sucessos}
                  onChange={(e) => setNovaEntradaJournal({...novaEntradaJournal, sucessos: e.target.value})}
                />
              </div>
              <button onClick={adicionarJournalEntry} className="primary-button">
                Adicionar Entrada
              </button>
            </div>            {/* Lista de Entradas */}
            {journalEntries.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">
                  <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                    <polyline points="14,2 14,8 20,8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/>
                    <line x1="16" y1="17" x2="8" y2="17"/>
                    <polyline points="10,9 9,9 8,9"/>
                  </svg>
                </div>
                <h3>Nenhuma entrada no journal</h3>
                <p>Comece a registrar suas reflexões diárias sobre seus hábitos</p>
              </div>
            ) : (
              <div className="journal-entries">
                {journalEntries.map(entry => (
                  <div key={entry.id} className="journal-entry">
                    <div className="entry-header">
                      <h4>{new Date(entry.data).toLocaleDateString()}</h4>
                      <div className="mood-indicator">
                        Humor: {entry.humor}/10
                      </div>
                    </div>
                    <div className="entry-content">
                      {entry.reflexao && (
                        <div className="reflection">
                          <h5>Reflexão:</h5>
                          <p>{entry.reflexao}</p>
                        </div>
                      )}
                      {entry.sucessos && (
                        <div className="successes">
                          <h5>Sucessos:</h5>
                          <p>{entry.sucessos}</p>
                        </div>
                      )}
                      {entry.dificuldades && (
                        <div className="difficulties">
                          <h5>Dificuldades:</h5>
                          <p>{entry.dificuldades}</p>
                        </div>
                      )}
                    </div>
                    <div className="entry-actions">
                      <button 
                        onClick={() => setEditandoJournal(entry.id)}
                        className="edit-button"
                      >
                        Editar
                      </button>
                      <button 
                        onClick={() => excluirJournalEntry(entry.id)}
                        className="delete-button"
                      >
                        Excluir
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* RELATÓRIOS */}
        {activeTab === 'relatorios' && (
          <div className="section">
            <div className="section-header">
              <h2>Relatórios e Analytics</h2>
            </div>

            {/* Métricas Principais */}
            <div className="metrics-grid">
              <div className="metric-card">
                <h3>Sequência Atual</h3>
                <div className="metric-value">{relatorios.streakAtual}</div>
                <div className="metric-label">dias consecutivos</div>
              </div>
              <div className="metric-card">
                <h3>Melhor Sequência</h3>
                <div className="metric-value">{relatorios.streakMaximo}</div>
                <div className="metric-label">dias</div>
              </div>
              <div className="metric-card">
                <h3>Taxa de Sucesso</h3>
                <div className="metric-value">{relatorios.taxaSucesso.toFixed(1)}%</div>
                <div className="metric-label">geral</div>
              </div>
              <div className="metric-card">
                <h3>Dias Ativos</h3>
                <div className="metric-value">{relatorios.diasAtivos}</div>
                <div className="metric-label">total</div>
              </div>
            </div>

            {/* Hábitos Mais Consistentes */}
            {relatorios.habitosMaisConsistentes.length > 0 && (
              <div className="consistent-habits">
                <h3>Hábitos Mais Consistentes</h3>
                <div className="habit-list">
                  {relatorios.habitosMaisConsistentes.map(habito => (
                    <div key={habito.id} className="consistent-habit">
                      <span className="habit-name">{habito.nome}</span>
                      <span className="habit-progress">{habito.progresso} execuções</span>
                    </div>
                  ))}
                </div>
              </div>
            )}            {/* Estado Vazio */}
            {estatisticas.totalHabitos === 0 && (
              <div className="empty-state">
                <div className="empty-icon">
                  <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <polyline points="23,6 13.5,15.5 8.5,10.5 1,18"/>
                    <polyline points="17,6 23,6 23,12"/>
                  </svg>
                </div>
                <h3>Sem dados para relatórios</h3>
                <p>Crie hábitos e mantenha-os por alguns dias para ver suas estatísticas</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
    </>
  );
}

export default Habitos;
