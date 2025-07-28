import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { addDocument, getDocuments, updateDocument, deleteDocument, getDocument, setDocument } from '../firebaseService';
import './Saude.css';

function Saude({ darkMode = false }) {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  
  // Estados para dashboard
  const [dailyStats, setDailyStats] = useState({
    exercicio: 0,
    agua: 0,
    sono: 0,
    peso: 0,
    humor: 3
  });
  
  // Estados para atividades
  const [atividades, setAtividades] = useState([]);
  const [metas, setMetas] = useState([]);
  
  // Estados para formulários
  const [novaAtividade, setNovaAtividade] = useState({
    tipo: 'exercicio',
    nome: '',
    duracao: '',
    calorias: '',
    data: new Date().toISOString().split('T')[0]
  });
  
  const [novaMeta, setNovaMeta] = useState({
    tipo: 'exercicio',
    objetivo: '',
    valor: '',
    prazo: ''
  });
  
  // Estados para gamificação
  const [badges, setBadges] = useState([]);
  const [streak, setStreak] = useState(0);
  const [pontos, setPontos] = useState(0);
  
  // Estados para ferramentas
  const [timer, setTimer] = useState({
    minutos: 0,
    segundos: 0,
    ativo: false,
    tipo: 'exercicio'
  });
  
  const [pesoForm, setPesoForm] = useState({
    peso: '',
    data: new Date().toISOString().split('T')[0]
  });
  
  const [filtros, setFiltros] = useState({
    tipo: 'todos',
    periodo: 'semana'
  });
  
  const [showCelebration, setShowCelebration] = useState(false);

  // Estados para edição
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingType, setEditingType] = useState(''); // 'atividade' ou 'meta'
  const [editingItem, setEditingItem] = useState(null);
  const [editAtividadeForm, setEditAtividadeForm] = useState({
    tipo: 'exercicio',
    nome: '',
    duracao: '',
    calorias: '',
    data: ''
  });
  const [editMetaForm, setEditMetaForm] = useState({
    tipo: 'exercicio',
    objetivo: '',
    valor: '',
    prazo: '',
    progresso: 0
  });

  const carregarDados = useCallback(async () => {
    setLoading(true);
    try {      const [atividadesData, metasData, gamificacaoData] = await Promise.all([
        getDocuments('saude-atividades'),
        getDocuments('saude-metas'),
        getDocument('saude-gamificacao', currentUser.uid)
      ]);
      
      // Filtrar por usuário atual
      const minhasAtividades = atividadesData.filter(a => a.userId === currentUser.uid);
      const minhasMetas = metasData.filter(m => m.userId === currentUser.uid);
      
      setAtividades(minhasAtividades || []);
      setMetas(minhasMetas || []);
      
      if (gamificacaoData) {
        setBadges(gamificacaoData.badges || []);
        setStreak(gamificacaoData.streak || 0);
        setPontos(gamificacaoData.pontos || 0);
      }
      
      calcularEstatisticasDiarias(minhasAtividades || []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setMessage('Erro ao carregar dados');
    }
    setLoading(false);
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      carregarDados();
    }
  }, [currentUser, carregarDados]);

  const calcularEstatisticasDiarias = (atividades) => {
    const hoje = new Date().toISOString().split('T')[0];
    const atividadesHoje = atividades.filter(a => a.data === hoje);
    
    const stats = {
      exercicio: atividadesHoje.filter(a => a.tipo === 'exercicio').reduce((sum, a) => sum + (parseInt(a.duracao) || 0), 0),
      agua: atividadesHoje.filter(a => a.tipo === 'hidratacao').reduce((sum, a) => sum + (parseInt(a.quantidade) || 0), 0),
      sono: atividadesHoje.filter(a => a.tipo === 'sono').reduce((sum, a) => sum + (parseInt(a.duracao) || 0), 0),
      peso: atividadesHoje.filter(a => a.tipo === 'peso').slice(-1)[0]?.peso || 0,
      humor: atividadesHoje.filter(a => a.tipo === 'mental').slice(-1)[0]?.humor || 3
    };
    
    setDailyStats(stats);
  };

  const adicionarAtividade = async () => {
    if (!novaAtividade.nome.trim()) return;
    
    setLoading(true);
    try {      const atividade = {
        ...novaAtividade,
        id: Date.now().toString(),
        userId: currentUser.uid,
        timestamp: new Date().toISOString()
      };
      
      await addDocument('saude-atividades', atividade);
      setAtividades([...atividades, atividade]);
      
      // Atualizar pontos e streak
      await atualizarGamificacao('atividade');
      
      setNovaAtividade({
        tipo: 'exercicio',
        nome: '',
        duracao: '',
        calorias: '',
        data: new Date().toISOString().split('T')[0]
      });
      
      setMessage('Atividade registrada com sucesso!');
      mostrarCelebracao();
      
    } catch (error) {
      console.error('Erro ao adicionar atividade:', error);
      setMessage('Erro ao registrar atividade');
    }
    setLoading(false);
  };

  const adicionarMeta = async () => {
    if (!novaMeta.objetivo.trim()) return;
    
    setLoading(true);
    try {
      const meta = {
        ...novaMeta,
        id: Date.now().toString(),
        userId: currentUser.uid,
        progresso: 0,
        concluida: false,
        timestamp: new Date().toISOString()
      };
      
      await addDocument('saude-metas', meta);
      setMetas([...metas, meta]);
      
      setNovaMeta({
        tipo: 'exercicio',
        objetivo: '',
        valor: '',
        prazo: ''
      });
      
      setMessage('Meta criada com sucesso!');
      
    } catch (error) {
      console.error('Erro ao adicionar meta:', error);
      setMessage('Erro ao criar meta');
    }
    setLoading(false);
  };

  const atualizarGamificacao = async (tipo) => {
    try {
      let novosPontos = pontos + 10;
      let novoStreak = streak;
      let novasBadges = [...badges];
      
      // Verificar streak diário
      const hoje = new Date().toISOString().split('T')[0];
      const ontem = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      
      const atividadeHoje = atividades.some(a => a.data === hoje);
      const atividadeOntem = atividades.some(a => a.data === ontem);
      
      if (atividadeHoje && atividadeOntem) {
        novoStreak = streak + 1;
      } else if (atividadeHoje) {
        novoStreak = 1;
      }
      
      // Verificar badges
      if (novoStreak >= 7 && !badges.includes('7-dias')) {
        novasBadges.push('7-dias');
      }
      if (novoStreak >= 30 && !badges.includes('30-dias')) {
        novasBadges.push('30-dias');
      }
      if (atividades.length >= 50 && !badges.includes('50-atividades')) {
        novasBadges.push('50-atividades');
      }
      
      const gamificacao = {
        userId: currentUser.uid,
        pontos: novosPontos,
        streak: novoStreak,
        badges: novasBadges,
        timestamp: new Date().toISOString()
      };
      
      await setDocument('saude-gamificacao', currentUser.uid, gamificacao);
      
      setPontos(novosPontos);
      setStreak(novoStreak);
      setBadges(novasBadges);
      
    } catch (error) {
      console.error('Erro ao atualizar gamificação:', error);
    }
  };

  const mostrarCelebracao = () => {
    setShowCelebration(true);
    setTimeout(() => setShowCelebration(false), 3000);
  };

  const iniciarTimer = () => {
    setTimer({...timer, ativo: true});
    const interval = setInterval(() => {
      setTimer(prev => {
        if (prev.segundos === 59) {
          return {...prev, minutos: prev.minutos + 1, segundos: 0};
        }
        return {...prev, segundos: prev.segundos + 1};
      });
    }, 1000);
    
    // Salvar intervalo para poder parar depois
    timer.interval = interval;
  };

  const pararTimer = () => {
    if (timer.interval) {
      clearInterval(timer.interval);
    }
    setTimer({...timer, ativo: false});
  };

  const resetarTimer = () => {
    if (timer.interval) {
      clearInterval(timer.interval);
    }
    setTimer({
      minutos: 0,
      segundos: 0,
      ativo: false,
      tipo: timer.tipo
    });
  };

  const registrarPeso = async () => {
    if (!pesoForm.peso) return;
    
    const atividade = {
      tipo: 'peso',
      nome: 'Registro de Peso',
      peso: parseFloat(pesoForm.peso),
      data: pesoForm.data,
      id: Date.now().toString(),
      userId: currentUser.uid,
      timestamp: new Date().toISOString()
    };
      try {
      await addDocument('saude-atividades', atividade);
      setAtividades([...atividades, atividade]);
      setPesoForm({
        peso: '',
        data: new Date().toISOString().split('T')[0]
      });
      setMessage('Peso registrado com sucesso!');
    } catch (error) {
      console.error('Erro ao registrar peso:', error);
      setMessage('Erro ao registrar peso');
    }
  };
  const excluirAtividade = async (id) => {
    try {
      await deleteDocument('saude-atividades', id);
      setAtividades(atividades.filter(a => a.id !== id));
      setMessage('Atividade excluída com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir atividade:', error);
      setMessage('Erro ao excluir atividade');
    }
  };

  const abrirEdicaoAtividade = (atividade) => {
    setEditingType('atividade');
    setEditingItem(atividade);
    setEditAtividadeForm({
      tipo: atividade.tipo,
      nome: atividade.nome,
      duracao: atividade.duracao || '',
      calorias: atividade.calorias || '',
      data: atividade.data
    });
    setShowEditModal(true);
  };

  const abrirEdicaoMeta = (meta) => {
    setEditingType('meta');
    setEditingItem(meta);
    setEditMetaForm({
      tipo: meta.tipo,
      objetivo: meta.objetivo,
      valor: meta.valor,
      prazo: meta.prazo,
      progresso: meta.progresso || 0
    });
    setShowEditModal(true);
  };

  const salvarEdicaoAtividade = async () => {
    if (!editAtividadeForm.nome.trim()) return;
    
    setLoading(true);
    try {
      const atividadeAtualizada = {
        ...editingItem,
        ...editAtividadeForm,
        timestamp: new Date().toISOString()
      };
      
      await updateDocument('saude-atividades', editingItem.id, atividadeAtualizada);
      
      setAtividades(atividades.map(a => 
        a.id === editingItem.id ? atividadeAtualizada : a
      ));
      
      setShowEditModal(false);
      setMessage('Atividade atualizada com sucesso!');
      
    } catch (error) {
      console.error('Erro ao atualizar atividade:', error);
      setMessage('Erro ao atualizar atividade');
    }
    setLoading(false);
  };

  const salvarEdicaoMeta = async () => {
    if (!editMetaForm.objetivo.trim()) return;
    
    setLoading(true);
    try {
      const metaAtualizada = {
        ...editingItem,
        ...editMetaForm,
        timestamp: new Date().toISOString()
      };
      
      await updateDocument('saude-metas', editingItem.id, metaAtualizada);
      
      setMetas(metas.map(m => 
        m.id === editingItem.id ? metaAtualizada : m
      ));
      
      setShowEditModal(false);
      setMessage('Meta atualizada com sucesso!');
      
    } catch (error) {
      console.error('Erro ao atualizar meta:', error);
      setMessage('Erro ao atualizar meta');
    }
    setLoading(false);
  };

  const fecharModalEdicao = () => {
    setShowEditModal(false);
    setEditingType('');
    setEditingItem(null);
  };

  const filtrarAtividades = () => {
    let atividadesFiltradas = [...atividades];
    
    if (filtros.tipo !== 'todos') {
      atividadesFiltradas = atividadesFiltradas.filter(a => a.tipo === filtros.tipo);
    }
    
    const hoje = new Date();
    const diasAtras = filtros.periodo === 'semana' ? 7 : filtros.periodo === 'mes' ? 30 : 365;
    const dataLimite = new Date(hoje.getTime() - (diasAtras * 24 * 60 * 60 * 1000));
    
    atividadesFiltradas = atividadesFiltradas.filter(a => 
      new Date(a.data) >= dataLimite
    );
    
    return atividadesFiltradas.sort((a, b) => new Date(b.data) - new Date(a.data));
  };

  const renderDashboard = () => (
    <div className="saude-dashboard">
      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-icon">
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
            </svg>
          </div>
          <div className="stat-info">
            <h3>{dailyStats.exercicio}</h3>
            <p>min exercício hoje</p>
          </div>
        </div>
          <div className="stat-card">
          <div className="stat-icon">
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <path d="M7 16.3c2.2 0 4-1.83 4-4.05 0-1.16-.57-2.26-1.71-3.19S7.29 6.75 7 5.3c-.29 1.45-1.14 2.84-2.29 3.76S3 11.1 3 12.25c0 2.22 1.8 4.05 4 4.05z"/>
            </svg>
          </div>
          <div className="stat-info">
            <h3>{dailyStats.agua}</h3>
            <p>ml água hoje</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
            </svg>
          </div>
          <div className="stat-info">
            <h3>{dailyStats.sono}</h3>
            <p>horas sono</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <path d="M20 6L9 17l-5-5"/>
            </svg>
          </div>
          <div className="stat-info">
            <h3>{dailyStats.peso || '--'}</h3>
            <p>kg peso atual</p>
          </div>
        </div>
      </div>
      
      <div className="gamificacao-section">
        <div className="gamif-card">
          <h3>
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12,6 12,12 16,14"/>
            </svg>
            Gamificação
          </h3>
          <div className="gamif-stats">
            <div className="gamif-item">
              <span className="gamif-icon">
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
                </svg>
              </span>
              <span>{pontos} pontos</span>
            </div>
            <div className="gamif-item">
              <span className="gamif-icon">
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <line x1="8" y1="6" x2="21" y2="6"/>
                  <line x1="8" y1="12" x2="21" y2="12"/>
                  <line x1="8" y1="18" x2="21" y2="18"/>
                  <line x1="3" y1="6" x2="3.01" y2="6"/>
                  <line x1="3" y1="12" x2="3.01" y2="12"/>
                  <line x1="3" y1="18" x2="3.01" y2="18"/>
                </svg>
              </span>
              <span>{streak} dias seguidos</span>
            </div>
            <div className="gamif-item">
              <span className="gamif-icon">
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d="M6 9H4.5a2.5 2.5 0 010-5H6"/>
                  <path d="M18 9h1.5a2.5 2.5 0 000-5H18"/>
                  <path d="M4 22h16"/>
                  <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/>
                  <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
                  <path d="M18 2H6v7a6 6 0 0012 0V2z"/>
                </svg>
              </span>
              <span>{badges.length} badges</span>
            </div>
          </div>
          
          {badges.length > 0 && (
            <div className="badges-section">
              <h4>Badges Conquistadas:</h4>
              <div className="badges-list">
                {badges.map((badge, index) => (
                  <span key={index} className="badge">                    {badge === '7-dias' && (
                      <>
                        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                          <line x1="8" y1="6" x2="21" y2="6"/>
                          <line x1="8" y1="12" x2="21" y2="12"/>
                          <line x1="8" y1="18" x2="21" y2="18"/>
                          <line x1="3" y1="6" x2="3.01" y2="6"/>
                          <line x1="3" y1="12" x2="3.01" y2="12"/>
                          <line x1="3" y1="18" x2="3.01" y2="18"/>
                        </svg>
                        7 Dias
                      </>
                    )}
                    {badge === '30-dias' && (
                      <>
                        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                          <path d="M6 9H4.5a2.5 2.5 0 010-5H6"/>
                          <path d="M18 9h1.5a2.5 2.5 0 000-5H18"/>
                          <path d="M4 22h16"/>
                          <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/>
                          <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
                          <path d="M18 2H6v7a6 6 0 0012 0V2z"/>
                        </svg>
                        30 Dias
                      </>
                    )}
                    {badge === '50-atividades' && (
                      <>
                        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                          <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
                        </svg>
                        50 Atividades
                      </>
                    )}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderAtividades = () => (
    <div className="saude-atividades">
      <div className="atividades-form">
        <h3>
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="3"/>
            <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1"/>
          </svg>
          Nova Atividade
        </h3>
        <div className="form-row">          <select 
            value={novaAtividade.tipo} 
            onChange={e => setNovaAtividade({...novaAtividade, tipo: e.target.value})}
          >
            <option value="exercicio">Exercício</option>
            <option value="alimentacao">Alimentação</option>
            <option value="sono">Sono</option>
            <option value="hidratacao">Hidratação</option>
            <option value="mental">Mental</option>
            <option value="peso">Peso</option>
          </select>
          
          <input
            type="text"
            placeholder="Nome da atividade"
            value={novaAtividade.nome}
            onChange={e => setNovaAtividade({...novaAtividade, nome: e.target.value})}
          />
          
          <input
            type="number"
            placeholder="Duração (min)"
            value={novaAtividade.duracao}
            onChange={e => setNovaAtividade({...novaAtividade, duracao: e.target.value})}
          />
          
          <input
            type="date"
            value={novaAtividade.data}
            onChange={e => setNovaAtividade({...novaAtividade, data: e.target.value})}
          />
          
          <button onClick={adicionarAtividade} disabled={loading}>
            {loading ? '...' : 'Adicionar'}
          </button>
        </div>
      </div>
      
      <div className="filtros-section">
        <select 
          value={filtros.tipo} 
          onChange={e => setFiltros({...filtros, tipo: e.target.value})}
        >
          <option value="todos">Todos os tipos</option>
          <option value="exercicio">Exercício</option>
          <option value="alimentacao">Alimentação</option>
          <option value="sono">Sono</option>
          <option value="hidratacao">Hidratação</option>
          <option value="mental">Mental</option>
          <option value="peso">Peso</option>
        </select>
        
        <select 
          value={filtros.periodo} 
          onChange={e => setFiltros({...filtros, periodo: e.target.value})}
        >
          <option value="semana">Última semana</option>
          <option value="mes">Último mês</option>
          <option value="ano">Último ano</option>
        </select>
      </div>
      
      <div className="atividades-list">
        {filtrarAtividades().length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">
              <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
              </svg>
            </span>
            <h3>Nenhuma atividade registrada</h3>
            <p>Comece adicionando sua primeira atividade de saúde!</p>
          </div>
        ) : (
          filtrarAtividades().map(atividade => (            <div key={atividade.id} className="atividade-card">              <div className="atividade-header">
                <span className="atividade-tipo">
                  {atividade.tipo === 'exercicio' && (
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                      <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                    </svg>
                  )}
                  {atividade.tipo === 'alimentacao' && (
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                  )}
                  {atividade.tipo === 'sono' && (
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                      <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
                    </svg>
                  )}
                  {atividade.tipo === 'hidratacao' && (
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                      <path d="M7 16.3c2.2 0 4-1.83 4-4.05 0-1.16-.57-2.26-1.71-3.19S7.29 6.75 7 5.3c-.29 1.45-1.14 2.84-2.29 3.76S3 11.1 3 12.25c0 2.22 1.8 4.05 4 4.05z"/>
                    </svg>
                  )}
                  {atividade.tipo === 'mental' && (
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                      <path d="M9 12l2 2 4-4"/>
                      <circle cx="12" cy="12" r="10"/>
                    </svg>
                  )}
                  {atividade.tipo === 'peso' && (
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                      <path d="M20 6L9 17l-5-5"/>
                    </svg>
                  )}
                </span>
                <h4>{atividade.nome}</h4>
                <div className="atividade-actions">                  <button 
                    className="edit-btn"
                    onClick={() => abrirEdicaoAtividade(atividade)}
                    title="Editar atividade"
                  >
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                  </button>
                  <button 
                    className="delete-btn"
                    onClick={() => excluirAtividade(atividade.id)}
                    title="Excluir atividade"
                  >
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                      <polyline points="3,6 5,6 21,6"/>
                      <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                      <line x1="10" y1="11" x2="10" y2="17"/>
                      <line x1="14" y1="11" x2="14" y2="17"/>
                    </svg>
                  </button>
                </div>
              </div>              <div className="atividade-details">
                {atividade.duracao && (
                  <span>
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10"/>
                      <polyline points="12,6 12,12 16,14"/>
                    </svg>
                    {atividade.duracao} min
                  </span>
                )}
                {atividade.calorias && (
                  <span>
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                      <line x1="8" y1="6" x2="21" y2="6"/>
                      <line x1="8" y1="12" x2="21" y2="12"/>
                      <line x1="8" y1="18" x2="21" y2="18"/>
                      <line x1="3" y1="6" x2="3.01" y2="6"/>
                      <line x1="3" y1="12" x2="3.01" y2="12"/>
                      <line x1="3" y1="18" x2="3.01" y2="18"/>
                    </svg>
                    {atividade.calorias} cal
                  </span>
                )}
                {atividade.peso && (
                  <span>
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                      <path d="M20 6L9 17l-5-5"/>
                    </svg>
                    {atividade.peso} kg
                  </span>
                )}
                {atividade.quantidade && (
                  <span>
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                      <path d="M7 16.3c2.2 0 4-1.83 4-4.05 0-1.16-.57-2.26-1.71-3.19S7.29 6.75 7 5.3c-.29 1.45-1.14 2.84-2.29 3.76S3 11.1 3 12.25c0 2.22 1.8 4.05 4 4.05z"/>
                    </svg>
                    {atividade.quantidade} ml
                  </span>
                )}
                <span className="atividade-data">
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                  {new Date(atividade.data).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const renderMetas = () => (
    <div className="saude-metas">
      <div className="metas-form">
        <h3>
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12,6 12,12 16,14"/>
          </svg>
          Nova Meta
        </h3>
        <div className="form-row">          <select 
            value={novaMeta.tipo} 
            onChange={e => setNovaMeta({...novaMeta, tipo: e.target.value})}
          >
            <option value="exercicio">Exercício</option>
            <option value="peso">Peso</option>
            <option value="hidratacao">Hidratação</option>
            <option value="sono">Sono</option>
          </select>
          
          <input
            type="text"
            placeholder="Objetivo da meta"
            value={novaMeta.objetivo}
            onChange={e => setNovaMeta({...novaMeta, objetivo: e.target.value})}
          />
          
          <input
            type="number"
            placeholder="Valor alvo"
            value={novaMeta.valor}
            onChange={e => setNovaMeta({...novaMeta, valor: e.target.value})}
          />
          
          <input
            type="date"
            value={novaMeta.prazo}
            onChange={e => setNovaMeta({...novaMeta, prazo: e.target.value})}
          />
          
          <button onClick={adicionarMeta} disabled={loading}>
            {loading ? '...' : 'Criar Meta'}
          </button>
        </div>
      </div>
      
      <div className="metas-list">
        {metas.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">
              <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12,6 12,12 16,14"/>
              </svg>
            </span>
            <h3>Nenhuma meta definida</h3>
            <p>Crie suas primeiras metas de saúde!</p>
          </div>
        ) : (
          metas.map(meta => (
            <div key={meta.id} className="meta-card">              <div className="meta-header">                <span className="meta-tipo">
                  {meta.tipo === 'exercicio' && (
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                      <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                    </svg>
                  )}
                  {meta.tipo === 'peso' && (
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                      <path d="M20 6L9 17l-5-5"/>
                    </svg>
                  )}
                  {meta.tipo === 'hidratacao' && (
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                      <path d="M7 16.3c2.2 0 4-1.83 4-4.05 0-1.16-.57-2.26-1.71-3.19S7.29 6.75 7 5.3c-.29 1.45-1.14 2.84-2.29 3.76S3 11.1 3 12.25c0 2.22 1.8 4.05 4 4.05z"/>
                    </svg>
                  )}
                  {meta.tipo === 'sono' && (
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                      <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
                    </svg>
                  )}
                </span>
                <h4>{meta.objetivo}</h4>
                <div className="meta-actions">                  <button 
                    className="edit-btn"
                    onClick={() => abrirEdicaoMeta(meta)}
                    title="Editar meta"
                  >
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                  </button>
                </div>
              </div>
              <div className="meta-progress">
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{width: `${Math.min(meta.progresso, 100)}%`}}
                  ></div>
                </div>
                <span>{meta.progresso}% / {meta.valor}</span>
              </div>              <div className="meta-prazo">
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
                Prazo: {new Date(meta.prazo).toLocaleDateString()}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const renderFerramentas = () => (
    <div className="saude-ferramentas">
      <div className="ferramentas-grid">
        {/* Timer */}
        <div className="ferramenta-card">
          <h3>⏱️ Timer de Exercício</h3>
          <div className="timer-display">
            {String(timer.minutos).padStart(2, '0')}:{String(timer.segundos).padStart(2, '0')}
          </div>
          <div className="timer-controls">
            <button onClick={iniciarTimer} disabled={timer.ativo}>Iniciar</button>
            <button onClick={pararTimer} disabled={!timer.ativo}>Parar</button>
            <button onClick={resetarTimer}>Reset</button>
          </div>
        </div>
        
        {/* Registro de Peso */}
        <div className="ferramenta-card">
          <h3>⚖️ Registro de Peso</h3>
          <div className="peso-form">
            <input
              type="number"
              step="0.1"
              placeholder="Peso (kg)"
              value={pesoForm.peso}
              onChange={e => setPesoForm({...pesoForm, peso: e.target.value})}
            />
            <input
              type="date"
              value={pesoForm.data}
              onChange={e => setPesoForm({...pesoForm, data: e.target.value})}
            />
            <button onClick={registrarPeso}>Registrar</button>
          </div>
        </div>
        
        {/* Registro de Humor */}
        <div className="ferramenta-card">
          <h3>
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="9"/>
              <path d="M9 12l2 2 4-4"/>
            </svg>
            Registro de Humor
          </h3>
          <div className="humor-scale">
            {[1, 2, 3, 4, 5].map(nivel => (              <button
                key={nivel}
                className={`humor-btn ${dailyStats.humor === nivel ? 'active' : ''}`}
                onClick={() => setDailyStats({...dailyStats, humor: nivel})}
              >
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10"/>
                  {nivel === 1 && <path d="M16 16s-1.5-2-4-2-4 2-4 2"/>}
                  {nivel === 2 && <path d="M16 16s-1.5-2-4-2-4 2-4 2"/>}
                  {nivel === 3 && <line x1="8" y1="15" x2="16" y2="15"/>}
                  {nivel === 4 && <path d="M8 14s1.5 2 4 2 4-2 4-2"/>}
                  {nivel === 5 && <path d="M8 14s1.5 2 4 2 4-2 4-2"/>}
                  <line x1="9" y1="9" x2="9.01" y2="9"/>
                  <line x1="15" y1="9" x2="15.01" y2="9"/>
                </svg>
              </button>
            ))}
          </div>
        </div>
        
        {/* Registro de Sono */}
        <div className="ferramenta-card">
          <h3>
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
            </svg>
            Qualidade do Sono
          </h3>
          <div className="sono-form">
            <input
              type="number"
              placeholder="Horas dormidas"
              min="0"
              max="24"
              step="0.5"
            />
            <select>
              <option value="otimo">Ótimo</option>
              <option value="bom">Bom</option>
              <option value="regular">Regular</option>
              <option value="ruim">Ruim</option>
            </select>
            <button>Registrar</button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderHistorico = () => (
    <div className="saude-historico">
      <h3>
        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
          <path d="M3 3v5h5V3zM16 3v5h5V3zM16 16v5h5v-5zM3 16v5h5v-5z"/>
        </svg>
        Histórico & Estatísticas
      </h3>
      <div className="historico-resumo">
        <div className="resumo-card">
          <h4>Total de Atividades</h4>
          <span className="resumo-numero">{atividades.length}</span>
        </div>
        <div className="resumo-card">
          <h4>Exercícios Este Mês</h4>
          <span className="resumo-numero">
            {atividades.filter(a => 
              a.tipo === 'exercicio' && 
              new Date(a.data).getMonth() === new Date().getMonth()
            ).length}
          </span>
        </div>
        <div className="resumo-card">
          <h4>Maior Streak</h4>
          <span className="resumo-numero">{streak} dias</span>
        </div>
        <div className="resumo-card">
          <h4>Metas Concluídas</h4>
          <span className="resumo-numero">
            {metas.filter(m => m.concluida).length}
          </span>
        </div>
      </div>
      
      <div className="atividades-recentes">
        <h4>Atividades Recentes</h4>
        {atividades.slice(0, 10).map(atividade => (
          <div key={atividade.id} className="atividade-historico">            <span className="atividade-tipo">
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
              </svg>
            </span>
            <span className="atividade-nome">{atividade.nome}</span>
            <span className="atividade-data">
              {new Date(atividade.data).toLocaleDateString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="saude-loading">
        <div className="spinner"></div>
        <p>Carregando dados de saúde...</p>
      </div>
    );
  }

  return (
    <>
    <div className={`saude-container ${darkMode ? 'dark-mode' : ''}`} data-theme={darkMode ? 'dark' : 'light'}>
      {/* Cabeçalho */}
      <div className="carreira-header">
        <h3>
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
          </svg>
          Saúde & Bem-estar
        </h3>
        <button 
          className="btn-voltar" 
          onClick={() => navigate('/dashboard')}
          aria-label="Voltar ao Dashboard"
          title="Voltar ao Dashboard"
        >
        </button>
      </div>

      {/* Animação de celebração */}
      {showCelebration && (
        <div className="celebration-overlay">
          <div className="celebration-content">
            <div className="celebration-icon">
              <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <path d="M7 16.3c2.2 0 4-1.83 4-4.05 0-1.16-.57-2.26-1.71-3.19S7.29 6.75 7 5.3c-.29 1.45-1.14 2.84-2.29 3.76S3 11.1 3 12.25c0 2.22 1.8 4.05 4 4.05z"/>
                <path d="M12.56 6.6A9 9 0 0116 20.77"/>
                <path d="M2.3 9.4a9 9 0 005.9-.4"/>
                <path d="M8 15.4a9 9 0 005.4.4"/>
              </svg>
            </div>
            <h3>Parabéns!</h3>
            <p>Atividade registrada com sucesso!</p>
          </div>
        </div>
      )}

      {/* Mensagem de feedback */}
      {message && (
        <div className={`message ${message.includes('Erro') ? 'error' : 'success'}`}>
          {message}
          <button onClick={() => setMessage('')}>×</button>
        </div>
      )}

      {/* Tabs */}
      <div className="saude-tabs">        <button 
          className={activeTab === 'dashboard' ? 'active' : ''}
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
          className={activeTab === 'atividades' ? 'active' : ''}
          onClick={() => setActiveTab('atividades')}
        >
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
          </svg>
          Atividades
        </button>        <button 
          className={activeTab === 'metas' ? 'active' : ''}
          onClick={() => setActiveTab('metas')}
        >
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12,6 12,12 16,14"/>
          </svg>
          Metas
        </button>
        <button 
          className={activeTab === 'ferramentas' ? 'active' : ''}
          onClick={() => setActiveTab('ferramentas')}
        >
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/>
          </svg>
          Ferramentas
        </button>
        <button 
          className={activeTab === 'historico' ? 'active' : ''}
          onClick={() => setActiveTab('historico')}
        >
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <polyline points="23,6 13.5,15.5 8.5,10.5 1,18"/>
            <polyline points="17,6 23,6 23,12"/>
          </svg>
          Histórico
        </button>
      </div>      {/* Conteúdo das tabs */}
      <div className="saude-content">
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'atividades' && renderAtividades()}
        {activeTab === 'metas' && renderMetas()}
        {activeTab === 'ferramentas' && renderFerramentas()}
        {activeTab === 'historico' && renderHistorico()}
      </div>

      {/* Modal de Edição */}
      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>
                {editingType === 'atividade' ? (
                  <>
                    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                      <path d="M12 20h9"/>
                      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                    </svg>
                    Editar Atividade
                  </>
                ) : (
                  <>
                    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                      <path d="M6 9H4.5a2.5 2.5 0 010-5H6"/>
                      <path d="M18 9h1.5a2.5 2.5 0 000-5H18"/>
                      <path d="M4 22h16"/>
                      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/>
                      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
                      <path d="M18 2H6v7a6 6 0 0012 0V2z"/>
                    </svg>
                    Editar Meta
                  </>
                )}
              </h3>
              <button className="close-btn" onClick={fecharModalEdicao}>
                ×
              </button>
            </div>
            
            <div className="modal-body">
              {editingType === 'atividade' ? (
                <div className="edit-form">
                  <div className="form-group">
                    <label>Tipo de Atividade</label>
                    <select 
                      value={editAtividadeForm.tipo} 
                      onChange={e => setEditAtividadeForm({...editAtividadeForm, tipo: e.target.value})}
                    >                      <option value="exercicio">Exercício</option>
                      <option value="alimentacao">Alimentação</option>
                      <option value="sono">Sono</option>
                      <option value="hidratacao">Hidratação</option>
                      <option value="mental">Mental</option>
                      <option value="peso">Peso</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label>Nome da Atividade</label>
                    <input
                      type="text"
                      placeholder="Nome da atividade"
                      value={editAtividadeForm.nome}
                      onChange={e => setEditAtividadeForm({...editAtividadeForm, nome: e.target.value})}
                    />
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label>Duração (min)</label>
                      <input
                        type="number"
                        placeholder="Duração em minutos"
                        value={editAtividadeForm.duracao}
                        onChange={e => setEditAtividadeForm({...editAtividadeForm, duracao: e.target.value})}
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Calorias</label>
                      <input
                        type="number"
                        placeholder="Calorias gastas"
                        value={editAtividadeForm.calorias}
                        onChange={e => setEditAtividadeForm({...editAtividadeForm, calorias: e.target.value})}
                      />
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label>Data</label>
                    <input
                      type="date"
                      value={editAtividadeForm.data}
                      onChange={e => setEditAtividadeForm({...editAtividadeForm, data: e.target.value})}
                    />
                  </div>
                </div>
              ) : (
                <div className="edit-form">
                  <div className="form-group">
                    <label>Tipo de Meta</label>
                    <select 
                      value={editMetaForm.tipo} 
                      onChange={e => setEditMetaForm({...editMetaForm, tipo: e.target.value})}
                    >                      <option value="exercicio">Exercício</option>
                      <option value="peso">Peso</option>
                      <option value="hidratacao">Hidratação</option>
                      <option value="sono">Sono</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label>Objetivo da Meta</label>
                    <input
                      type="text"
                      placeholder="Objetivo da meta"
                      value={editMetaForm.objetivo}
                      onChange={e => setEditMetaForm({...editMetaForm, objetivo: e.target.value})}
                    />
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label>Valor Alvo</label>
                      <input
                        type="number"
                        placeholder="Valor alvo"
                        value={editMetaForm.valor}
                        onChange={e => setEditMetaForm({...editMetaForm, valor: e.target.value})}
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Progresso (%)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        placeholder="Progresso atual"
                        value={editMetaForm.progresso}
                        onChange={e => setEditMetaForm({...editMetaForm, progresso: parseInt(e.target.value) || 0})}
                      />
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label>Prazo</label>
                    <input
                      type="date"
                      value={editMetaForm.prazo}
                      onChange={e => setEditMetaForm({...editMetaForm, prazo: e.target.value})}
                    />
                  </div>
                </div>
              )}
            </div>
            
            <div className="modal-actions">
              <button 
                className="cancel-btn" 
                onClick={fecharModalEdicao}
              >
                Cancelar
              </button>
              <button 
                className="save-btn" 
                onClick={editingType === 'atividade' ? salvarEdicaoAtividade : salvarEdicaoMeta}
                disabled={loading}
              >
                {loading ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
}

export default Saude;
