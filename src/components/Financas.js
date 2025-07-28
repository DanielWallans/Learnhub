import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebaseConfig';
import {
  collection,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
  query,
  where,
  onSnapshot
} from "firebase/firestore";
import './Carreira.css'; // Usando o CSS moderno

function Financas({ darkMode = false }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');

  // Estados das transações - INICIANDO VAZIO para experiência completa
  const [transacoes, setTransacoes] = useState([]);
  const [editandoTransacao, setEditandoTransacao] = useState(null);
  const [novaTransacao, setNovaTransacao] = useState({
    descricao: '',
    valor: '',
    tipo: 'despesa',
    categoria: 'Alimentação',
    data: new Date().toISOString().split('T')[0],
    observacoes: ''
  });

  // Categorias de finanças
  const [categorias] = useState([
    'Alimentação', 'Transporte', 'Educação', 'Saúde', 'Lazer',
    'Moradia', 'Roupas', 'Tecnologia', 'Investimentos', 'Outros'
  ]);

  // Metas financeiras - INICIANDO VAZIO
  const [metas, setMetas] = useState([]);
  const [novaMeta, setNovaMeta] = useState({
    nome: '',
    valor: '',
    prazo: '',
    categoria: 'Economia',
    descricao: ''
  });

  // Orçamentos - INICIANDO VAZIO
  const [orcamentos, setOrcamentos] = useState([]);
  const [novoOrcamento, setNovoOrcamento] = useState({
    categoria: 'Alimentação',
    limite: '',
    mes: new Date().toISOString().slice(0, 7)
  });

  // Filtros
  const [filtros, setFiltros] = useState({
    categoria: '',
    tipo: '',
    mes: ''
  });

  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        carregarDados(currentUser.uid);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const carregarDados = async (userId) => {
    try {
      // Carregar transações
      const transacoesQuery = query(collection(db, "financas"), where("userId", "==", userId));
      onSnapshot(transacoesQuery, (snapshot) => {
        const transacoesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setTransacoes(transacoesData);
      });

      // Carregar metas
      const metasQuery = query(collection(db, "metas-financeiras"), where("userId", "==", userId));
      onSnapshot(metasQuery, (snapshot) => {
        const metasData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setMetas(metasData);
      });

      // Carregar orçamentos
      const orcamentosQuery = query(collection(db, "orcamentos"), where("userId", "==", userId));
      onSnapshot(orcamentosQuery, (snapshot) => {
        const orcamentosData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setOrcamentos(orcamentosData);
      });
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    }
  };

  // Adicionar transação
  const adicionarTransacao = async () => {
    if (!novaTransacao.descricao.trim() || !novaTransacao.valor || !user) return;

    try {
      const transacao = {
        ...novaTransacao,
        valor: parseFloat(novaTransacao.valor),
        userId: user.uid,
        criadoEm: new Date().toISOString()
      };

      await addDoc(collection(db, "financas"), transacao);
      setNovaTransacao({
        descricao: '',
        valor: '',
        tipo: 'despesa',
        categoria: 'Alimentação',
        data: new Date().toISOString().split('T')[0],
        observacoes: ''
      });
      setFeedback('Transação adicionada com sucesso!');
      setTimeout(() => setFeedback(''), 3000);
    } catch (error) {
      console.error("Erro ao adicionar transação:", error);
      setFeedback('Erro ao adicionar transação.');
      setTimeout(() => setFeedback(''), 3000);
    }
  };

  // Editar transação
  const editarTransacao = async (id, dadosAtualizados) => {
    try {
      await updateDoc(doc(db, "financas", id), dadosAtualizados);
      setEditandoTransacao(null);
      setFeedback('Transação atualizada!');
      setTimeout(() => setFeedback(''), 3000);
    } catch (error) {
      console.error("Erro ao editar transação:", error);
    }
  };

  // Remover transação
  const removerTransacao = async (id) => {
    try {
      await deleteDoc(doc(db, "financas", id));
      setFeedback('Transação removida!');
      setTimeout(() => setFeedback(''), 3000);
    } catch (error) {
      console.error("Erro ao remover transação:", error);
    }
  };

  // Adicionar meta
  const adicionarMeta = async () => {
    if (!novaMeta.nome.trim() || !novaMeta.valor || !user) return;

    try {
      const meta = {
        ...novaMeta,
        valor: parseFloat(novaMeta.valor),
        valorAlcancado: 0,
        userId: user.uid,
        criadoEm: new Date().toISOString(),
        status: 'ativa'
      };

      await addDoc(collection(db, "metas-financeiras"), meta);
      setNovaMeta({
        nome: '',
        valor: '',
        prazo: '',
        categoria: 'Economia',
        descricao: ''
      });
      setFeedback('Meta adicionada com sucesso!');
      setTimeout(() => setFeedback(''), 3000);
    } catch (error) {
      console.error("Erro ao adicionar meta:", error);
    }
  };

  // Adicionar orçamento
  const adicionarOrcamento = async () => {
    if (!novoOrcamento.limite || !user) return;

    try {
      const orcamento = {
        ...novoOrcamento,
        limite: parseFloat(novoOrcamento.limite),
        gastoAtual: 0,
        userId: user.uid,
        criadoEm: new Date().toISOString()
      };

      await addDoc(collection(db, "orcamentos"), orcamento);
      setNovoOrcamento({
        categoria: 'Alimentação',
        limite: '',
        mes: new Date().toISOString().slice(0, 7)
      });
      setFeedback('Orçamento definido com sucesso!');
      setTimeout(() => setFeedback(''), 3000);
    } catch (error) {
      console.error("Erro ao adicionar orçamento:", error);
    }
  };

  // Cálculos
  const totalReceitas = transacoes.filter(t => t.tipo === 'receita').reduce((acc, t) => acc + t.valor, 0);
  const totalDespesas = transacoes.filter(t => t.tipo === 'despesa').reduce((acc, t) => acc + t.valor, 0);
  const saldoAtual = totalReceitas - totalDespesas;

  // Filtrar transações
  const transacoesFiltradas = transacoes.filter(transacao => {
    return (
      (!filtros.categoria || transacao.categoria === filtros.categoria) &&
      (!filtros.tipo || transacao.tipo === filtros.tipo) &&
      (!filtros.mes || transacao.data.startsWith(filtros.mes))
    );
  });

  if (loading) {
    return (
      <div className="carreira-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Carregando suas finanças...</p>
        </div>
      </div>
    );
  }

  return (
    <>
    <div className={`carreira-container ${darkMode ? 'dark-mode' : ''}`} data-theme={darkMode ? 'dark' : 'light'}>
      {/* Cabeçalho */}
      <div className="carreira-header">
        <h3>
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <line x1="12" y1="1" x2="12" y2="23"/>
            <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
          </svg>
          Gestão Financeira
        </h3>
        <button 
          className="btn-voltar"
          onClick={() => navigate('/dashboard')}
          title="Voltar ao Dashboard"
        >
        </button>
      </div>

      {/* Sistema de Abas */}
      <div className="carreira-tabs">
        <button
          className={`tab-button ${activeTab === 'dashboard' ? 'active' : ''}`}
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
          className={`tab-button ${activeTab === 'transacoes' ? 'active' : ''}`}
          onClick={() => setActiveTab('transacoes')}
        >
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
            <line x1="1" y1="10" x2="23" y2="10"/>
          </svg>
          Transações
        </button>
        <button
          className={`tab-button ${activeTab === 'metas' ? 'active' : ''}`}
          onClick={() => setActiveTab('metas')}
        >
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12,6 12,12 16,14"/>
          </svg>
          Metas
        </button>
        <button
          className={`tab-button ${activeTab === 'orcamentos' ? 'active' : ''}`}
          onClick={() => setActiveTab('orcamentos')}
        >
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
            <line x1="9" y1="9" x2="15" y2="9"/>
            <line x1="9" y1="15" x2="15" y2="15"/>
          </svg>
          Orçamentos
        </button>
        <button
          className={`tab-button ${activeTab === 'relatorios' ? 'active' : ''}`}
          onClick={() => setActiveTab('relatorios')}
        >
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <polyline points="23,6 13.5,15.5 8.5,10.5 1,18"/>
            <polyline points="17,6 23,6 23,12"/>
          </svg>
          Relatórios
        </button>
      </div>

      {/* Feedback */}
      {feedback && (
        <div className="feedback-message feedback-success">
          {feedback}
        </div>
      )}

      {/* Conteúdo das Abas */}
      <div className="carreira-content">
        {renderTabContent()}
      </div>
    </div>
    </>
  );

  function renderTabContent() {
    switch (activeTab) {
      case 'dashboard':
        return renderDashboard();
      case 'transacoes':
        return renderTransacoes();
      case 'metas':
        return renderMetas();
      case 'orcamentos':
        return renderOrcamentos();
      case 'relatorios':
        return renderRelatorios();
      default:
        return renderDashboard();
    }
  }

  function renderDashboard() {
    const despesasPorCategoria = categorias.map(cat => ({
      categoria: cat,
      valor: transacoes.filter(t => t.tipo === 'despesa' && t.categoria === cat).reduce((acc, t) => acc + t.valor, 0)
    })).filter(item => item.valor > 0);

    return (
      <div>
        {/* Cards de Resumo */}
        <div className="habitos-dashboard">
          <div className="dashboard-card">
            <div className="dashboard-card-header">
              <div className="dashboard-card-icon">
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <line x1="12" y1="1" x2="12" y2="23"/>
                  <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
                </svg>
              </div>
              <h3>Saldo Atual</h3>
            </div>
            <div className={`dashboard-stat ${saldoAtual >= 0 ? 'positive' : 'negative'}`}>
              R$ {saldoAtual.toFixed(2)}
            </div>
            <p className="dashboard-description">
              {saldoAtual >= 0 ? 'Suas finanças estão no azul!' : 'Atenção: saldo negativo'}
            </p>
          </div>

          <div className="dashboard-card">
            <div className="dashboard-card-header">
              <div className="dashboard-card-icon">
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <polyline points="23,6 13.5,15.5 8.5,10.5 1,18"/>
                  <polyline points="17,6 23,6 23,12"/>
                </svg>
              </div>
              <h3>Receitas</h3>
            </div>
            <div className="dashboard-stat" style={{color: '#28a745'}}>
              R$ {totalReceitas.toFixed(2)}
            </div>
            <p className="dashboard-description">
              {transacoes.filter(t => t.tipo === 'receita').length} transações
            </p>
          </div>

          <div className="dashboard-card">
            <div className="dashboard-card-header">
              <div className="dashboard-card-icon">
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <polyline points="23,18 13.5,8.5 8.5,13.5 1,6"/>
                  <polyline points="17,18 23,18 23,12"/>
                </svg>
              </div>
              <h3>Despesas</h3>
            </div>
            <div className="dashboard-stat" style={{color: '#dc3545'}}>
              R$ {totalDespesas.toFixed(2)}
            </div>
            <p className="dashboard-description">
              {transacoes.filter(t => t.tipo === 'despesa').length} transações
            </p>
          </div>

          <div className="dashboard-card">
            <div className="dashboard-card-header">
              <div className="dashboard-card-icon">
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12,6 12,12 16,14"/>
                </svg>
              </div>
              <h3>Metas Ativas</h3>
            </div>
            <div className="dashboard-stat">
              {metas.filter(m => m.status === 'ativa').length}
            </div>
            <p className="dashboard-description">
              {metas.length} metas no total
            </p>
          </div>
        </div>

        {/* Principais Categorias de Gastos */}
        {despesasPorCategoria.length > 0 && (
          <div className="form-section">
            <h2>
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <line x1="9" y1="9" x2="15" y2="9"/>
                <line x1="9" y1="15" x2="15" y2="15"/>
              </svg>
              Gastos por Categoria
            </h2>
            <div className="items-grid">
              {despesasPorCategoria.slice(0, 6).map((item, index) => (
                <div key={index} className="item-card">
                  <div className="item-header">
                    <h3 className="item-title">{item.categoria}</h3>
                  </div>
                  <p className="dashboard-stat" style={{color: '#dc3545', fontSize: '1.5rem'}}>
                    R$ {item.valor.toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {transacoes.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">
              <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <line x1="12" y1="1" x2="12" y2="23"/>
                <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
              </svg>
            </div>
            <h3>Bem-vindo ao seu Controle Financeiro!</h3>
            <p>Comece registrando suas primeiras transações para ter controle total das suas finanças.</p>
            <div className="empty-actions">
              <button className="primary-button" onClick={() => setActiveTab('transacoes')}>
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                  <line x1="1" y1="10" x2="23" y2="10"/>
                </svg>
                Adicionar Transação
              </button>
              <button className="secondary-button" onClick={() => setActiveTab('metas')}>
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12,6 12,12 16,14"/>
                </svg>
                Definir Meta
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  function renderTransacoes() {
    return (
      <div>
        {/* Formulário para Nova Transação */}
        <div className="form-section">
          <h2>
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
              <line x1="1" y1="10" x2="23" y2="10"/>
            </svg>
            Adicionar Nova Transação
          </h2>
          <div className="form-grid">
            <div className="form-group">
              <label>Tipo</label>
              <select
                className="form-select"
                value={novaTransacao.tipo}
                onChange={(e) => setNovaTransacao({...novaTransacao, tipo: e.target.value})}
              >
                <option value="despesa">Despesa</option>
                <option value="receita">Receita</option>
              </select>
            </div>
            <div className="form-group">
              <label>Descrição</label>
              <input
                type="text"
                className="form-input"
                value={novaTransacao.descricao}
                onChange={(e) => setNovaTransacao({...novaTransacao, descricao: e.target.value})}
                placeholder="Ex: Almoço, Salário, etc."
              />
            </div>
            <div className="form-group">
              <label>Categoria</label>
              <select
                className="form-select"
                value={novaTransacao.categoria}
                onChange={(e) => setNovaTransacao({...novaTransacao, categoria: e.target.value})}
              >
                {categorias.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Valor (R$)</label>
              <input
                type="number"
                className="form-input"
                value={novaTransacao.valor}
                onChange={(e) => setNovaTransacao({...novaTransacao, valor: e.target.value})}
                placeholder="0.00"
                min="0"
                step="0.01"
              />
            </div>
            <div className="form-group">
              <label>Data</label>
              <input
                type="date"
                className="form-input"
                value={novaTransacao.data}
                onChange={(e) => setNovaTransacao({...novaTransacao, data: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Observações</label>
              <input
                type="text"
                className="form-input"
                value={novaTransacao.observacoes}
                onChange={(e) => setNovaTransacao({...novaTransacao, observacoes: e.target.value})}
                placeholder="Opcional"
              />
            </div>
          </div>
          <div className="form-actions">
            <button className="primary-button" onClick={adicionarTransacao}>
              ✅ Adicionar Transação
            </button>
          </div>
        </div>

        {/* Filtros */}
        <div className="filters-section">
          <div className="filters-grid">
            <div className="form-group">
              <label>Filtrar por Categoria</label>
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
            </div>
            <div className="form-group">
              <label>Filtrar por Tipo</label>
              <select
                className="form-select"
                value={filtros.tipo}
                onChange={(e) => setFiltros({...filtros, tipo: e.target.value})}
              >
                <option value="">Todos os tipos</option>
                <option value="receita">Receita</option>
                <option value="despesa">Despesa</option>
              </select>
            </div>
            <div className="form-group">
              <label>Filtrar por Mês</label>
              <input
                type="month"
                className="form-input"
                value={filtros.mes}
                onChange={(e) => setFiltros({...filtros, mes: e.target.value})}
              />
            </div>
            <div className="form-group">
              <button 
                className="secondary-button" 
                onClick={() => setFiltros({categoria: '', tipo: '', mes: ''})}
              >
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <polyline points="23,4 23,10 17,10"/>
                  <polyline points="1,20 1,14 7,14"/>
                  <path d="M20.49 9A9 9 0 005.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 003.51 15"/>
                </svg>
                Limpar Filtros
              </button>
            </div>
          </div>
        </div>

        {/* Lista de Transações */}
        {transacoesFiltradas.length > 0 ? (
          <div className="items-grid">
            {transacoesFiltradas.map((transacao) => 
              editandoTransacao === transacao.id ? (
                <EditarTransacaoForm 
                  key={transacao.id}
                  transacao={transacao}
                  categorias={categorias}
                  onSave={editarTransacao}
                  onCancel={() => setEditandoTransacao(null)}
                />
              ) : (
                <div key={transacao.id} className="item-card">
                  <div className="item-header">
                    <h3 className="item-title">
                      {transacao.tipo === 'receita' ? (
                        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                          <line x1="12" y1="1" x2="12" y2="23"/>
                          <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
                        </svg>
                      ) : (
                        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                          <polyline points="23,18 13.5,8.5 8.5,13.5 1,6"/>
                          <polyline points="17,18 23,18 23,12"/>
                        </svg>
                      )} {transacao.descricao}
                    </h3>
                    <div className="item-actions">
                      <button 
                        className="action-button"
                        onClick={() => setEditandoTransacao(transacao.id)}
                      >
                        ✏️
                      </button>
                      <button 
                        className="action-button"
                        onClick={() => removerTransacao(transacao.id)}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                  <div className="item-meta">
                    <span className="meta-tag categoria">{transacao.categoria}</span>
                    <span className="meta-tag">{transacao.data}</span>
                  </div>
                  <p className="dashboard-stat" style={{
                    color: transacao.tipo === 'receita' ? '#28a745' : '#dc3545',
                    fontSize: '1.25rem'
                  }}>
                    {transacao.tipo === 'receita' ? '+' : '-'}R$ {transacao.valor.toFixed(2)}
                  </p>
                  {transacao.observacoes && (
                    <p className="item-description">{transacao.observacoes}</p>
                  )}
                </div>
              )
            )}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">
              <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                <line x1="1" y1="10" x2="23" y2="10"/>
              </svg>
            </div>
            <h3>Nenhuma transação encontrada</h3>
            <p>
              {transacoes.length === 0 
                ? 'Adicione sua primeira transação para começar o controle financeiro!'
                : 'Tente ajustar os filtros para encontrar suas transações.'
              }
            </p>
            <div className="empty-actions">
              <button className="primary-button" onClick={() => setActiveTab('dashboard')}>
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                  <line x1="9" y1="9" x2="15" y2="9"/>
                  <line x1="9" y1="15" x2="15" y2="15"/>
                </svg>
                Ver Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  function renderMetas() {
    return (
      <div>
        {/* Formulário para Nova Meta */}
        <div className="form-section">
          <h2>
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12,6 12,12 16,14"/>
            </svg>
            Definir Nova Meta
          </h2>
          <div className="form-grid">
            <div className="form-group">
              <label>Nome da Meta</label>
              <input
                type="text"
                className="form-input"
                value={novaMeta.nome}
                onChange={(e) => setNovaMeta({...novaMeta, nome: e.target.value})}
                placeholder="Ex: Viagem, Notebook, Reserva de Emergência"
              />
            </div>
            <div className="form-group">
              <label>Valor (R$)</label>
              <input
                type="number"
                className="form-input"
                value={novaMeta.valor}
                onChange={(e) => setNovaMeta({...novaMeta, valor: e.target.value})}
                placeholder="0.00"
                min="0"
                step="0.01"
              />
            </div>
            <div className="form-group">
              <label>Prazo</label>
              <input
                type="date"
                className="form-input"
                value={novaMeta.prazo}
                onChange={(e) => setNovaMeta({...novaMeta, prazo: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Categoria</label>
              <select
                className="form-select"
                value={novaMeta.categoria}
                onChange={(e) => setNovaMeta({...novaMeta, categoria: e.target.value})}
              >
                <option value="Economia">Economia</option>
                <option value="Investimento">Investimento</option>
                <option value="Compra">Compra</option>
                <option value="Viagem">Viagem</option>
                <option value="Educação">Educação</option>
                <option value="Emergência">Emergência</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>Descrição</label>
            <textarea
              className="form-textarea"
              value={novaMeta.descricao}
              onChange={(e) => setNovaMeta({...novaMeta, descricao: e.target.value})}
              placeholder="Descreva sua meta..."
            />
          </div>
          <div className="form-actions">
            <button className="primary-button" onClick={adicionarMeta}>
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12,6 12,12 16,14"/>
              </svg>
              Criar Meta
            </button>
          </div>
        </div>

        {/* Lista de Metas */}
        {metas.length > 0 ? (
          <div className="items-grid">
            {metas.map((meta) => (
              <div key={meta.id} className="item-card">
                <div className="item-header">
                  <h3 className="item-title">
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10"/>
                      <polyline points="12,6 12,12 16,14"/>
                    </svg>
                    {meta.nome}
                  </h3>
                  <div className="item-actions">
                    <button className="action-button">✏️</button>
                    <button className="action-button">🗑️</button>
                  </div>
                </div>
                <div className="item-meta">
                  <span className="meta-tag categoria">{meta.categoria}</span>
                  <span className="meta-tag">{meta.prazo}</span>
                </div>
                <p className="dashboard-stat" style={{color: '#4c6ef5'}}>
                  R$ {meta.valor.toFixed(2)}
                </p>
                {meta.descricao && (
                  <p className="item-description">{meta.descricao}</p>
                )}
                <div style={{marginTop: '12px'}}>
                  <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: '#6c757d'}}>
                    <span>Progresso: R$ {meta.valorAlcancado?.toFixed(2) || '0.00'}</span>
                    <span>{(((meta.valorAlcancado || 0) / meta.valor) * 100).toFixed(1)}%</span>
                  </div>
                  <div className="stat-bar" style={{marginTop: '4px'}}>
                    <div 
                      className="stat-fill" 
                      style={{width: `${Math.min(((meta.valorAlcancado || 0) / meta.valor) * 100, 100)}%`}}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">
              <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12,6 12,12 16,14"/>
              </svg>
            </div>
            <h3>Nenhuma meta definida</h3>
            <p>Crie suas primeiras metas financeiras para ter objetivos claros e motivação para economizar!</p>
          </div>
        )}
      </div>
    );
  }

  function renderOrcamentos() {
    return (
      <div>
        {/* Formulário para Novo Orçamento */}
        <div className="form-section">
          <h2>📋 Definir Orçamento</h2>
          <div className="form-grid">
            <div className="form-group">
              <label>Categoria</label>
              <select
                className="form-select"
                value={novoOrcamento.categoria}
                onChange={(e) => setNovoOrcamento({...novoOrcamento, categoria: e.target.value})}
              >
                {categorias.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Limite (R$)</label>
              <input
                type="number"
                className="form-input"
                value={novoOrcamento.limite}
                onChange={(e) => setNovoOrcamento({...novoOrcamento, limite: e.target.value})}
                placeholder="0.00"
                min="0"
                step="0.01"
              />
            </div>
            <div className="form-group">
              <label>Mês</label>
              <input
                type="month"
                className="form-input"
                value={novoOrcamento.mes}
                onChange={(e) => setNovoOrcamento({...novoOrcamento, mes: e.target.value})}
              />
            </div>
          </div>
          <div className="form-actions">
            <button className="primary-button" onClick={adicionarOrcamento}>
              📋 Definir Orçamento
            </button>
          </div>
        </div>

        {/* Lista de Orçamentos */}
        {orcamentos.length > 0 ? (
          <div className="items-grid">
            {orcamentos.map((orcamento) => {
              const gastoAtual = transacoes
                .filter(t => 
                  t.tipo === 'despesa' && 
                  t.categoria === orcamento.categoria && 
                  t.data.startsWith(orcamento.mes)
                )
                .reduce((acc, t) => acc + t.valor, 0);
              
              const percentual = (gastoAtual / orcamento.limite) * 100;
              const status = percentual > 100 ? 'danger' : percentual > 80 ? 'warning' : 'success';

              return (
                <div key={orcamento.id} className="item-card">
                  <div className="item-header">
                    <h3 className="item-title">📋 {orcamento.categoria}</h3>
                    <div className="item-actions">
                      <button className="action-button">✏️</button>
                      <button className="action-button">🗑️</button>
                    </div>
                  </div>
                  <div className="item-meta">
                    <span className="meta-tag">{orcamento.mes}</span>
                    <span className={`meta-tag ${status}`}>
                      {percentual.toFixed(1)}%
                    </span>
                  </div>
                  <p className="dashboard-stat" style={{color: '#4c6ef5'}}>
                    R$ {orcamento.limite.toFixed(2)}
                  </p>
                  <div style={{marginTop: '12px'}}>
                    <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: '#6c757d'}}>
                      <span>Gasto: R$ {gastoAtual.toFixed(2)}</span>
                      <span>Restante: R$ {(orcamento.limite - gastoAtual).toFixed(2)}</span>
                    </div>
                    <div className="stat-bar" style={{marginTop: '4px'}}>
                      <div 
                        className="stat-fill" 
                        style={{
                          width: `${Math.min(percentual, 100)}%`,
                          background: status === 'danger' ? '#dc3545' : status === 'warning' ? '#ffc107' : '#28a745'
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <h3>Nenhum orçamento definido</h3>
            <p>Crie orçamentos para controlar seus gastos por categoria e evitar surpresas no final do mês!</p>
          </div>
        )}
      </div>
    );
  }

  function renderRelatorios() {
    const mesAtual = new Date().toISOString().slice(0, 7);
    const transacoesMes = transacoes.filter(t => t.data.startsWith(mesAtual));
    const receitasMes = transacoesMes.filter(t => t.tipo === 'receita').reduce((acc, t) => acc + t.valor, 0);
    const despesasMes = transacoesMes.filter(t => t.tipo === 'despesa').reduce((acc, t) => acc + t.valor, 0);

    return (
      <div>
        <div className="form-section">
          <h2>📈 Relatório do Mês Atual</h2>
          <div className="habitos-dashboard">
            <div className="dashboard-card">
              <div className="dashboard-card-header">
                <div className="dashboard-card-icon">
                  <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <line x1="12" y1="1" x2="12" y2="23"/>
                    <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
                  </svg>
                </div>
                <h3>Receitas do Mês</h3>
              </div>
              <div className="dashboard-stat" style={{color: '#28a745'}}>
                R$ {receitasMes.toFixed(2)}
              </div>
            </div>
            <div className="dashboard-card">
              <div className="dashboard-card-header">
                <div className="dashboard-card-icon">
                  <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <polyline points="23,18 13.5,8.5 8.5,13.5 1,6"/>
                    <polyline points="17,18 23,18 23,12"/>
                  </svg>
                </div>
                <h3>Despesas do Mês</h3>
              </div>
              <div className="dashboard-stat" style={{color: '#dc3545'}}>
                R$ {despesasMes.toFixed(2)}
              </div>
            </div>
            <div className="dashboard-card">
              <div className="dashboard-card-header">
                <div className="dashboard-card-icon">
                  <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                    <line x1="9" y1="9" x2="15" y2="9"/>
                    <line x1="9" y1="15" x2="15" y2="15"/>
                  </svg>
                </div>
                <h3>Resultado do Mês</h3>
              </div>
              <div className={`dashboard-stat ${(receitasMes - despesasMes) >= 0 ? 'positive' : 'negative'}`}>
                R$ {(receitasMes - despesasMes).toFixed(2)}
              </div>
            </div>
          </div>
        </div>

        {transacoes.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">📈</div>
            <h3>Relatórios indisponíveis</h3>
            <p>Adicione algumas transações para visualizar relatórios detalhados das suas finanças.</p>
            <div className="empty-actions">
              <button className="primary-button" onClick={() => setActiveTab('transacoes')}>
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                  <line x1="1" y1="10" x2="23" y2="10"/>
                </svg>
                Adicionar Transações
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }
}

// Componente para editar transação
function EditarTransacaoForm({ transacao, categorias, onSave, onCancel }) {
  const [dados, setDados] = useState({
    descricao: transacao.descricao,
    valor: transacao.valor.toString(),
    tipo: transacao.tipo,
    categoria: transacao.categoria,
    data: transacao.data,
    observacoes: transacao.observacoes || ''
  });

  const handleSave = () => {
    onSave(transacao.id, {
      ...dados,
      valor: parseFloat(dados.valor)
    });
  };

  return (
    <div className="item-card" style={{border: '2px solid #4c6ef5'}}>
      <h3>Editando Transação</h3>
      <div className="form-grid">
        <div className="form-group">
          <label>Tipo</label>
          <select
            className="form-select"
            value={dados.tipo}
            onChange={(e) => setDados({...dados, tipo: e.target.value})}
          >
            <option value="despesa">Despesa</option>
            <option value="receita">Receita</option>
          </select>
        </div>
        <div className="form-group">
          <label>Descrição</label>
          <input
            type="text"
            className="form-input"
            value={dados.descricao}
            onChange={(e) => setDados({...dados, descricao: e.target.value})}
          />
        </div>
        <div className="form-group">
          <label>Categoria</label>
          <select
            className="form-select"
            value={dados.categoria}
            onChange={(e) => setDados({...dados, categoria: e.target.value})}
          >
            {categorias.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Valor (R$)</label>
          <input
            type="number"
            className="form-input"
            value={dados.valor}
            onChange={(e) => setDados({...dados, valor: e.target.value})}
            step="0.01"
          />
        </div>
        <div className="form-group">
          <label>Data</label>
          <input
            type="date"
            className="form-input"
            value={dados.data}
            onChange={(e) => setDados({...dados, data: e.target.value})}
          />
        </div>
        <div className="form-group">
          <label>Observações</label>
          <input
            type="text"
            className="form-input"
            value={dados.observacoes}
            onChange={(e) => setDados({...dados, observacoes: e.target.value})}
          />
        </div>
      </div>
      <div className="form-actions">
        <button className="primary-button" onClick={handleSave}>
          ✅ Salvar
        </button>
        <button className="secondary-button" onClick={onCancel}>
          ❌ Cancelar
        </button>
      </div>
    </div>
  );
}

export default Financas;