import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { firebaseService } from '../firebaseService';
import './Saude.css';

function Saude({ onBack }) {
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
  const [historico, setHistorico] = useState([]);
  
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

  useEffect(() => {
    if (currentUser) {
      carregarDados();
    }
  }, [currentUser]);

  const carregarDados = async () => {
    setLoading(true);
    try {
      const [atividadesData, metasData, historicoData, gamificacaoData] = await Promise.all([
        firebaseService.getDocuments('saude-atividades', currentUser.uid),
        firebaseService.getDocuments('saude-metas', currentUser.uid),
        firebaseService.getDocuments('saude-historico', currentUser.uid),
        firebaseService.getDocument('saude-gamificacao', currentUser.uid)
      ]);
      
      setAtividades(atividadesData || []);
      setMetas(metasData || []);
      setHistorico(historicoData || []);
      
      if (gamificacaoData) {
        setBadges(gamificacaoData.badges || []);
        setStreak(gamificacaoData.streak || 0);
        setPontos(gamificacaoData.pontos || 0);
      }
      
      calcularEstatisticasDiarias(atividadesData || []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setMessage('Erro ao carregar dados');
    }
    setLoading(false);
  };

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
    try {
      const atividade = {
        ...novaAtividade,
        id: Date.now().toString(),
        userId: currentUser.uid,
        timestamp: new Date().toISOString()
      };
      
      await firebaseService.addDocument('saude-atividades', atividade);
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
      
      await firebaseService.addDocument('saude-metas', meta);
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
      
      await firebaseService.setDocument('saude-gamificacao', currentUser.uid, gamificacao);
      
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
      await firebaseService.addDocument('saude-atividades', atividade);
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
      await firebaseService.deleteDocument('saude-atividades', id);
      setAtividades(atividades.filter(a => a.id !== id));
      setMessage('Atividade excluída com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir atividade:', error);
      setMessage('Erro ao excluir atividade');
    }
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
          <div className="stat-icon">🏃‍♂️</div>
          <div className="stat-info">
            <h3>{dailyStats.exercicio}</h3>
            <p>min exercício hoje</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">💧</div>
          <div className="stat-info">
            <h3>{dailyStats.agua}</h3>
            <p>ml água hoje</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">😴</div>
          <div className="stat-info">
            <h3>{dailyStats.sono}</h3>
            <p>horas sono</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">⚖️</div>
          <div className="stat-info">
            <h3>{dailyStats.peso || '--'}</h3>
            <p>kg peso atual</p>
          </div>
        </div>
      </div>
      
      <div className="gamificacao-section">
        <div className="gamif-card">
          <h3>🎯 Gamificação</h3>
          <div className="gamif-stats">
            <div className="gamif-item">
              <span className="gamif-icon">⭐</span>
              <span>{pontos} pontos</span>
            </div>
            <div className="gamif-item">
              <span className="gamif-icon">🔥</span>
              <span>{streak} dias seguidos</span>
            </div>
            <div className="gamif-item">
              <span className="gamif-icon">🏆</span>
              <span>{badges.length} badges</span>
            </div>
          </div>
          
          {badges.length > 0 && (
            <div className="badges-section">
              <h4>Badges Conquistadas:</h4>
              <div className="badges-list">
                {badges.map((badge, index) => (
                  <span key={index} className="badge">
                    {badge === '7-dias' && '🔥 7 Dias'}
                    {badge === '30-dias' && '🏆 30 Dias'}
                    {badge === '50-atividades' && '⭐ 50 Atividades'}
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
        <h3>➕ Nova Atividade</h3>
        <div className="form-row">
          <select 
            value={novaAtividade.tipo} 
            onChange={e => setNovaAtividade({...novaAtividade, tipo: e.target.value})}
          >
            <option value="exercicio">🏃‍♂️ Exercício</option>
            <option value="alimentacao">🍎 Alimentação</option>
            <option value="sono">😴 Sono</option>
            <option value="hidratacao">💧 Hidratação</option>
            <option value="mental">🧠 Mental</option>
            <option value="peso">⚖️ Peso</option>
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
            <span className="empty-icon">🏃‍♂️</span>
            <h3>Nenhuma atividade registrada</h3>
            <p>Comece adicionando sua primeira atividade de saúde!</p>
          </div>
        ) : (
          filtrarAtividades().map(atividade => (
            <div key={atividade.id} className="atividade-card">
              <div className="atividade-header">
                <span className="atividade-tipo">
                  {atividade.tipo === 'exercicio' && '🏃‍♂️'}
                  {atividade.tipo === 'alimentacao' && '🍎'}
                  {atividade.tipo === 'sono' && '😴'}
                  {atividade.tipo === 'hidratacao' && '💧'}
                  {atividade.tipo === 'mental' && '🧠'}
                  {atividade.tipo === 'peso' && '⚖️'}
                </span>
                <h4>{atividade.nome}</h4>
                <button 
                  className="delete-btn"
                  onClick={() => excluirAtividade(atividade.id)}
                >
                  🗑️
                </button>
              </div>
              <div className="atividade-details">
                {atividade.duracao && <span>⏱️ {atividade.duracao} min</span>}
                {atividade.calorias && <span>🔥 {atividade.calorias} cal</span>}
                {atividade.peso && <span>⚖️ {atividade.peso} kg</span>}
                {atividade.quantidade && <span>💧 {atividade.quantidade} ml</span>}
                <span className="atividade-data">📅 {new Date(atividade.data).toLocaleDateString()}</span>
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
        <h3>🎯 Nova Meta</h3>
        <div className="form-row">
          <select 
            value={novaMeta.tipo} 
            onChange={e => setNovaMeta({...novaMeta, tipo: e.target.value})}
          >
            <option value="exercicio">🏃‍♂️ Exercício</option>
            <option value="peso">⚖️ Peso</option>
            <option value="hidratacao">💧 Hidratação</option>
            <option value="sono">😴 Sono</option>
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
            <span className="empty-icon">🎯</span>
            <h3>Nenhuma meta definida</h3>
            <p>Crie suas primeiras metas de saúde!</p>
          </div>
        ) : (
          metas.map(meta => (
            <div key={meta.id} className="meta-card">
              <div className="meta-header">
                <span className="meta-tipo">
                  {meta.tipo === 'exercicio' && '🏃‍♂️'}
                  {meta.tipo === 'peso' && '⚖️'}
                  {meta.tipo === 'hidratacao' && '💧'}
                  {meta.tipo === 'sono' && '😴'}
                </span>
                <h4>{meta.objetivo}</h4>
              </div>
              <div className="meta-progress">
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{width: `${Math.min(meta.progresso, 100)}%`}}
                  ></div>
                </div>
                <span>{meta.progresso}% / {meta.valor}</span>
              </div>
              <div className="meta-prazo">
                📅 Prazo: {new Date(meta.prazo).toLocaleDateString()}
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
          <h3>😊 Registro de Humor</h3>
          <div className="humor-scale">
            {[1, 2, 3, 4, 5].map(nivel => (
              <button
                key={nivel}
                className={`humor-btn ${dailyStats.humor === nivel ? 'active' : ''}`}
                onClick={() => setDailyStats({...dailyStats, humor: nivel})}
              >
                {nivel === 1 && '😢'}
                {nivel === 2 && '😕'}
                {nivel === 3 && '😐'}
                {nivel === 4 && '😊'}
                {nivel === 5 && '😄'}
              </button>
            ))}
          </div>
        </div>
        
        {/* Registro de Sono */}
        <div className="ferramenta-card">
          <h3>😴 Qualidade do Sono</h3>
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
      <h3>📊 Histórico & Estatísticas</h3>
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
          <div key={atividade.id} className="atividade-historico">
            <span className="atividade-tipo">
              {atividade.tipo === 'exercicio' && '🏃‍♂️'}
              {atividade.tipo === 'alimentacao' && '🍎'}
              {atividade.tipo === 'sono' && '😴'}
              {atividade.tipo === 'hidratacao' && '💧'}
              {atividade.tipo === 'mental' && '🧠'}
              {atividade.tipo === 'peso' && '⚖️'}
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
    <div className="saude-container">
      {/* Header */}
      <div className="saude-header">
        <button className="back-button" onClick={onBack}>
          ← Voltar
        </button>
        <h1>🏃‍♂️ Saúde & Bem-estar</h1>
      </div>

      {/* Animação de celebração */}
      {showCelebration && (
        <div className="celebration-overlay">
          <div className="celebration-content">
            <div className="celebration-icon">🎉</div>
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
      <div className="saude-tabs">
        <button 
          className={activeTab === 'dashboard' ? 'active' : ''}
          onClick={() => setActiveTab('dashboard')}
        >
          📊 Dashboard
        </button>
        <button 
          className={activeTab === 'atividades' ? 'active' : ''}
          onClick={() => setActiveTab('atividades')}
        >
          🏃‍♂️ Atividades
        </button>
        <button 
          className={activeTab === 'metas' ? 'active' : ''}
          onClick={() => setActiveTab('metas')}
        >
          🎯 Metas
        </button>
        <button 
          className={activeTab === 'ferramentas' ? 'active' : ''}
          onClick={() => setActiveTab('ferramentas')}
        >
          🛠️ Ferramentas
        </button>
        <button 
          className={activeTab === 'historico' ? 'active' : ''}
          onClick={() => setActiveTab('historico')}
        >
          📈 Histórico
        </button>
      </div>

      {/* Conteúdo das tabs */}
      <div className="saude-content">
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'atividades' && renderAtividades()}
        {activeTab === 'metas' && renderMetas()}
        {activeTab === 'ferramentas' && renderFerramentas()}
        {activeTab === 'historico' && renderHistorico()}
      </div>
    </div>
  );
}

export default Saude;
