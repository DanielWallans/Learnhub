import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebaseConfig';
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  query, 
  where, 
  onSnapshot 
} from 'firebase/firestore';
import './Carreira.css';

function Carreira({ darkMode = false }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Estados principais
  const [activeTab, setActiveTab] = useState('dashboard');
  const [userData, setUserData] = useState({
    nome: 'Usuário',
    cargo: 'Desenvolvedor',
    experiencia: '2 anos',
    salarioAtual: 5000,
    satisfacao: 7
  });

  // 1. Planejamento e Objetivos - INICIANDO VAZIO
  const [objetivos, setObjetivos] = useState([]);
  const [novoObjetivo, setNovoObjetivo] = useState({
    titulo: '',
    prazo: '',
    tipo: 'curto', // curto, medio, longo
    progresso: 0
  });

  // 2. Autoavaliação e Análise - INICIANDO VAZIO
  const [competencias, setCompetencias] = useState([]);
  const [editandoCompetencia, setEditandoCompetencia] = useState(null);
  const [novaCompetencia, setNovaCompetencia] = useState({ nome: '', nivel: 5, categoria: 'tecnica' });
  
  const [swotAnalysis, setSwotAnalysis] = useState({
    forcas: [],
    fraquezas: [],
    oportunidades: [],
    ameacas: []
  });
  const [editandoSwot, setEditandoSwot] = useState({ tipo: '', index: -1, valor: '' });
  const [novoItemSwot, setNovoItemSwot] = useState({ tipo: 'forcas', valor: '' });

  // Trilhas de aprendizagem
  const [trilhasAprendizagem, setTrilhasAprendizagem] = useState([]);
  const [editandoTrilha, setEditandoTrilha] = useState(null);
  const [novaTrilha, setNovaTrilha] = useState({ nome: '', progresso: 0, cursos: [] });
  const [novoCurso, setNovoCurso] = useState('');

  // Portfolio e projetos
  const [portfolio, setPortfolio] = useState([]);
  const [editandoProjeto, setEditandoProjeto] = useState(null);
  const [novoProjeto, setNovoProjeto] = useState({ titulo: '', tecnologias: [], status: 'Em andamento', descricao: '' });
  const [novaTecnologia, setNovaTecnologia] = useState('');

  // Oportunidades de trabalho
  const [oportunidades, setOportunidades] = useState([]);
  const [editandoOportunidade, setEditandoOportunidade] = useState(null);
  const [novaOportunidade, setNovaOportunidade] = useState({ empresa: '', cargo: '', salario: '', match: 0, requisitos: [] });
  const [novoRequisito, setNovoRequisito] = useState('');

  // Networking
  const [contatos, setContatos] = useState([]);
  const [editandoContato, setEditandoContato] = useState(null);
  const [novoContato, setNovoContato] = useState({ nome: '', cargo: '', empresa: '', status: 'Pendente', email: '', linkedin: '' });

  // Métricas de progresso
  const [metricas, setMetricas] = useState({
    objetivosConcluidos: 0,
    competenciasDesenvolvidas: 0,
    networkingAtivo: 0,
    satisfacaoCarreira: 0,
    evolucaoSalarial: 0
  });

  // Ferramentas auxiliares
  const [ferramentas, setFerramentas] = useState({
    entrevistasRealizadas: 0,
    pitchPessoal: '',
    negociacaoSalarial: ''
  });

  // Journal de carreira
  const [journalEntries, setJournalEntries] = useState([]);
  const [editandoJournal, setEditandoJournal] = useState(null);
  const [novaEntradaJournal, setNovaEntradaJournal] = useState({ data: '', entry: '', tipo: 'reflexao' });

  // Configuração do Firebase
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

  // Carregar dados do Firebase
  const carregarDadosFirebase = async (userId) => {
    try {
      const carreiraRef = collection(db, 'carreira');
      const q = query(carreiraRef, where('userId', '==', userId));
      
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const dados = {};
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          dados[data.tipo] = { id: doc.id, ...data };
        });

        // Organizar dados por tipo
        if (dados.objetivos) setObjetivos(dados.objetivos.dados || []);
        if (dados.competencias) setCompetencias(dados.competencias.dados || []);
        if (dados.swot) setSwotAnalysis(dados.swot.dados || { forcas: [], fraquezas: [], oportunidades: [], ameacas: [] });
        if (dados.trilhas) setTrilhasAprendizagem(dados.trilhas.dados || []);
        if (dados.portfolio) setPortfolio(dados.portfolio.dados || []);
        if (dados.oportunidades) setOportunidades(dados.oportunidades.dados || []);
        if (dados.contatos) setContatos(dados.contatos.dados || []);
        if (dados.journal) setJournalEntries(dados.journal.dados || []);
        if (dados.metricas) setMetricas(dados.metricas.dados || metricas);
        if (dados.ferramentas) setFerramentas(dados.ferramentas.dados || ferramentas);

        setLoading(false);
      });

      return unsubscribe;
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setLoading(false);
    }
  };

  // Salvar dados no Firebase
  const salvarNoFirebase = async (tipo, dados) => {
    if (!user) return;

    try {
      const carreiraRef = collection(db, 'carreira');
      const q = query(carreiraRef, where('userId', '==', user.uid), where('tipo', '==', tipo));
      const querySnapshot = await getDocs(q);

      const docData = {
        userId: user.uid,
        tipo: tipo,
        dados: dados,
        updatedAt: new Date()
      };

      if (querySnapshot.empty) {
        // Criar novo documento
        await addDoc(carreiraRef, {
          ...docData,
          createdAt: new Date()
        });
      } else {
        // Atualizar documento existente
        const docId = querySnapshot.docs[0].id;
        await updateDoc(doc(db, 'carreira', docId), docData);
      }
    } catch (error) {
      console.error('Erro ao salvar no Firebase:', error);
    }
  };

  // Funções utilitárias com Firebase
  const adicionarObjetivo = async () => {
    if (novoObjetivo.titulo.trim()) {
      const novosObjetivos = [...objetivos, { ...novoObjetivo, id: Date.now() }];
      setObjetivos(novosObjetivos);
      await salvarNoFirebase('objetivos', novosObjetivos);
      setNovoObjetivo({ titulo: '', prazo: '', tipo: 'curto', progresso: 0 });
    }
  };

  const editarObjetivo = (id) => {
    const objetivo = objetivos.find(obj => obj.id === id);
    setNovoObjetivo(objetivo);
    setObjetivos(objetivos.filter(obj => obj.id !== id));
  };

  const excluirObjetivo = async (id) => {
    const novosObjetivos = objetivos.filter(obj => obj.id !== id);
    setObjetivos(novosObjetivos);
    await salvarNoFirebase('objetivos', novosObjetivos);
  };

  const concluirObjetivo = async (id) => {
    const novosObjetivos = objetivos.map(obj => 
      obj.id === id ? { ...obj, progresso: 100 } : obj
    );
    setObjetivos(novosObjetivos);
    await salvarNoFirebase('objetivos', novosObjetivos);
  };

  const atualizarProgresso = async (id, novoProgresso) => {
    const novosObjetivos = objetivos.map(obj => 
      obj.id === id ? { ...obj, progresso: novoProgresso } : obj
    );
    setObjetivos(novosObjetivos);
    await salvarNoFirebase('objetivos', novosObjetivos);
  };

  // Funções para Competências com Firebase
  const adicionarCompetencia = async () => {
    if (novaCompetencia.nome.trim()) {
      const novasCompetencias = [...competencias, { ...novaCompetencia, id: Date.now() }];
      setCompetencias(novasCompetencias);
      await salvarNoFirebase('competencias', novasCompetencias);
      setNovaCompetencia({ nome: '', nivel: 5, categoria: 'tecnica' });
    }
  };

  const editarCompetencia = (id) => {
    const competencia = competencias.find(comp => comp.id === id);
    setEditandoCompetencia(competencia);
  };

  const salvarEdicaoCompetencia = async () => {
    const novasCompetencias = competencias.map(comp => 
      comp.id === editandoCompetencia.id ? editandoCompetencia : comp
    );
    setCompetencias(novasCompetencias);
    await salvarNoFirebase('competencias', novasCompetencias);
    setEditandoCompetencia(null);
  };

  const excluirCompetencia = async (id) => {
    const novasCompetencias = competencias.filter(comp => comp.id !== id);
    setCompetencias(novasCompetencias);
    await salvarNoFirebase('competencias', novasCompetencias);
  };

  // Funções para SWOT com Firebase
  const adicionarItemSwot = async () => {
    if (novoItemSwot.valor.trim()) {
      const novoSwot = {
        ...swotAnalysis,
        [novoItemSwot.tipo]: [...swotAnalysis[novoItemSwot.tipo], novoItemSwot.valor]
      };
      setSwotAnalysis(novoSwot);
      await salvarNoFirebase('swot', novoSwot);
      setNovoItemSwot({ tipo: 'forcas', valor: '' });
    }
  };

  const editarItemSwot = (tipo, index) => {
    setEditandoSwot({ tipo, index, valor: swotAnalysis[tipo][index] });
  };

  const salvarEdicaoSwot = async () => {
    const novoArray = [...swotAnalysis[editandoSwot.tipo]];
    novoArray[editandoSwot.index] = editandoSwot.valor;
    const novoSwot = {
      ...swotAnalysis,
      [editandoSwot.tipo]: novoArray
    };
    setSwotAnalysis(novoSwot);
    await salvarNoFirebase('swot', novoSwot);
    setEditandoSwot({ tipo: '', index: -1, valor: '' });
  };

  const excluirItemSwot = async (tipo, index) => {
    const novoSwot = {
      ...swotAnalysis,
      [tipo]: swotAnalysis[tipo].filter((_, i) => i !== index)
    };
    setSwotAnalysis(novoSwot);
    await salvarNoFirebase('swot', novoSwot);
  };

  // Funções para Trilhas com Firebase
  const adicionarTrilha = async () => {
    if (novaTrilha.nome.trim()) {
      const novasTrilhas = [...trilhasAprendizagem, { ...novaTrilha, id: Date.now() }];
      setTrilhasAprendizagem(novasTrilhas);
      await salvarNoFirebase('trilhas', novasTrilhas);
      setNovaTrilha({ nome: '', progresso: 0, cursos: [] });
    }
  };

  const editarTrilha = (id) => {
    const trilha = trilhasAprendizagem.find(t => t.id === id);
    setEditandoTrilha(trilha);
  };

  const salvarEdicaoTrilha = async () => {
    const novasTrilhas = trilhasAprendizagem.map(trilha => 
      trilha.id === editandoTrilha.id ? editandoTrilha : trilha
    );
    setTrilhasAprendizagem(novasTrilhas);
    await salvarNoFirebase('trilhas', novasTrilhas);
    setEditandoTrilha(null);
  };

  const excluirTrilha = async (id) => {
    const novasTrilhas = trilhasAprendizagem.filter(trilha => trilha.id !== id);
    setTrilhasAprendizagem(novasTrilhas);
    await salvarNoFirebase('trilhas', novasTrilhas);
  };

  const adicionarCursoTrilha = async (trilhaId) => {
    if (novoCurso.trim()) {
      let novasTrilhas;
      if (editandoTrilha && editandoTrilha.id === trilhaId) {
        setEditandoTrilha({
          ...editandoTrilha,
          cursos: [...editandoTrilha.cursos, novoCurso]
        });
        return;
      } else {
        novasTrilhas = trilhasAprendizagem.map(trilha => 
          trilha.id === trilhaId ? 
          { ...trilha, cursos: [...trilha.cursos, novoCurso] } : trilha
        );
        setTrilhasAprendizagem(novasTrilhas);
        await salvarNoFirebase('trilhas', novasTrilhas);
      }
      setNovoCurso('');
    }
  };

  const excluirCursoTrilha = async (trilhaId, cursoIndex) => {
    if (editandoTrilha && editandoTrilha.id === trilhaId) {
      setEditandoTrilha({
        ...editandoTrilha,
        cursos: editandoTrilha.cursos.filter((_, i) => i !== cursoIndex)
      });
    } else {
      const novasTrilhas = trilhasAprendizagem.map(trilha => 
        trilha.id === trilhaId ? 
        { ...trilha, cursos: trilha.cursos.filter((_, i) => i !== cursoIndex) } : trilha
      );
      setTrilhasAprendizagem(novasTrilhas);
      await salvarNoFirebase('trilhas', novasTrilhas);
    }
  };

  // Funções para Portfolio com Firebase
  const adicionarProjeto = async () => {
    if (novoProjeto.titulo.trim()) {
      const novoPortfolio = [...portfolio, { ...novoProjeto, id: Date.now() }];
      setPortfolio(novoPortfolio);
      await salvarNoFirebase('portfolio', novoPortfolio);
      setNovoProjeto({ titulo: '', tecnologias: [], status: 'Em andamento', descricao: '' });
    }
  };

  const editarProjeto = (id) => {
    const projeto = portfolio.find(p => p.id === id);
    setEditandoProjeto(projeto);
  };

  const salvarEdicaoProjeto = async () => {
    const novoPortfolio = portfolio.map(projeto => 
      projeto.id === editandoProjeto.id ? editandoProjeto : projeto
    );
    setPortfolio(novoPortfolio);
    await salvarNoFirebase('portfolio', novoPortfolio);
    setEditandoProjeto(null);
  };

  const excluirProjeto = async (id) => {
    const novoPortfolio = portfolio.filter(projeto => projeto.id !== id);
    setPortfolio(novoPortfolio);
    await salvarNoFirebase('portfolio', novoPortfolio);
  };

  const adicionarTecnologiaProjeto = async (projetoId) => {
    if (novaTecnologia.trim()) {
      let novoPortfolio;
      if (editandoProjeto && editandoProjeto.id === projetoId) {
        setEditandoProjeto({
          ...editandoProjeto,
          tecnologias: [...editandoProjeto.tecnologias, novaTecnologia]
        });
        return;
      } else {
        novoPortfolio = portfolio.map(projeto => 
          projeto.id === projetoId ? 
          { ...projeto, tecnologias: [...projeto.tecnologias, novaTecnologia] } : projeto
        );
        setPortfolio(novoPortfolio);
        await salvarNoFirebase('portfolio', novoPortfolio);
      }
      setNovaTecnologia('');
    }
  };

  // Funções para Oportunidades com Firebase
  const adicionarOportunidade = async () => {
    if (novaOportunidade.empresa.trim() && novaOportunidade.cargo.trim()) {
      const novasOportunidades = [...oportunidades, { ...novaOportunidade, id: Date.now() }];
      setOportunidades(novasOportunidades);
      await salvarNoFirebase('oportunidades', novasOportunidades);
      setNovaOportunidade({ empresa: '', cargo: '', salario: '', match: 0, requisitos: [] });
    }
  };

  const editarOportunidade = (id) => {
    const oportunidade = oportunidades.find(o => o.id === id);
    setEditandoOportunidade(oportunidade);
  };

  const salvarEdicaoOportunidade = async () => {
    const novasOportunidades = oportunidades.map(oportunidade => 
      oportunidade.id === editandoOportunidade.id ? editandoOportunidade : oportunidade
    );
    setOportunidades(novasOportunidades);
    await salvarNoFirebase('oportunidades', novasOportunidades);
    setEditandoOportunidade(null);
  };

  const excluirOportunidade = async (id) => {
    const novasOportunidades = oportunidades.filter(oportunidade => oportunidade.id !== id);
    setOportunidades(novasOportunidades);
    await salvarNoFirebase('oportunidades', novasOportunidades);
  };

  // Funções para Contatos com Firebase
  const adicionarContato = async () => {
    if (novoContato.nome.trim()) {
      const novosContatos = [...contatos, { ...novoContato, id: Date.now() }];
      setContatos(novosContatos);
      await salvarNoFirebase('contatos', novosContatos);
      setNovoContato({ nome: '', cargo: '', empresa: '', status: 'Pendente', email: '', linkedin: '' });
    }
  };

  const editarContato = (id) => {
    const contato = contatos.find(c => c.id === id);
    setEditandoContato(contato);
  };

  const salvarEdicaoContato = async () => {
    const novosContatos = contatos.map(contato => 
      contato.id === editandoContato.id ? editandoContato : contato
    );
    setContatos(novosContatos);
    await salvarNoFirebase('contatos', novosContatos);
    setEditandoContato(null);
  };

  const excluirContato = async (id) => {
    const novosContatos = contatos.filter(contato => contato.id !== id);
    setContatos(novosContatos);
    await salvarNoFirebase('contatos', novosContatos);
  };

  // Funções para Journal com Firebase
  const adicionarEntradaJournal = async () => {
    if (novaEntradaJournal.entry.trim()) {
      const novasEntradas = [...journalEntries, { 
        ...novaEntradaJournal, 
        id: Date.now(),
        data: novaEntradaJournal.data || new Date().toISOString().split('T')[0]
      }];
      setJournalEntries(novasEntradas);
      await salvarNoFirebase('journal', novasEntradas);
      setNovaEntradaJournal({ data: '', entry: '', tipo: 'reflexao' });
    }
  };

  const editarEntradaJournal = (id) => {
    const entrada = journalEntries.find(j => j.id === id);
    setEditandoJournal(entrada);
  };

  const salvarEdicaoJournal = async () => {
    const novasEntradas = journalEntries.map(entrada => 
      entrada.id === editandoJournal.id ? editandoJournal : entrada
    );
    setJournalEntries(novasEntradas);
    await salvarNoFirebase('journal', novasEntradas);
    setEditandoJournal(null);
  };

  const excluirEntradaJournal = async (id) => {
    const novasEntradas = journalEntries.filter(entrada => entrada.id !== id);
    setJournalEntries(novasEntradas);
    await salvarNoFirebase('journal', novasEntradas);
  };

  const calcularScoreGeral = () => {
    if (competencias.length === 0) return 0;
    const competenciasMedia = competencias.reduce((acc, comp) => acc + comp.nivel, 0) / competencias.length;
    const objetivosMedia = objetivos.length > 0 ? 
      objetivos.reduce((acc, obj) => acc + obj.progresso, 0) / objetivos.length : 0;
    return Math.round((competenciasMedia + objetivosMedia + userData.satisfacao) / 3 * 10) / 10;
  };

  // Componente Dashboard
  const renderDashboard = () => (
    <div className="carreira-dashboard">
      <div className="dashboard-header">
        <h4>
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
            <line x1="9" y1="9" x2="15" y2="9"/>
            <line x1="9" y1="15" x2="15" y2="15"/>
          </svg>
          Dashboard de Carreira
        </h4>
        <div className="score-geral">
          <span>Score Geral: <strong>{calcularScoreGeral()}/10</strong></span>
        </div>
      </div>
      
      <div className="dashboard-cards">
        <div className="dashboard-card">
          <h5>
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12,6 12,12 16,14"/>
            </svg>
            Objetivos
          </h5>
          <p>{objetivos.length} {objetivos.length === 1 ? 'objetivo' : 'objetivos'}</p>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${objetivos.length > 0 ? objetivos.reduce((acc, obj) => acc + obj.progresso, 0) / objetivos.length : 0}%` }}
            ></div>
          </div>
          {objetivos.length === 0 && <small className="empty-message">Comece adicionando seus objetivos!</small>}
        </div>
        
        <div className="dashboard-card">
          <h5>
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
            Competências
          </h5>
          <p>{competencias.length > 0 ? `Média: ${(competencias.reduce((acc, comp) => acc + comp.nivel, 0) / competencias.length).toFixed(1)}/10` : 'Nenhuma competência'}</p>
          {competencias.length === 0 && <small className="empty-message">Avalie suas competências!</small>}
        </div>
        
        <div className="dashboard-card">
          <h5>
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 00-3-3.87"/>
              <path d="M16 3.13a4 4 0 010 7.75"/>
            </svg>
            Network
          </h5>
          <p>{contatos.length} {contatos.length === 1 ? 'contato' : 'contatos'}</p>
          {contatos.length === 0 && <small className="empty-message">Construa sua rede de contatos!</small>}
        </div>
        
        <div className="dashboard-card">
          <h5>
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
              <line x1="8" y1="21" x2="16" y2="21"/>
              <line x1="12" y1="17" x2="12" y2="21"/>
            </svg>
            Portfolio
          </h5>
          <p>{portfolio.length} {portfolio.length === 1 ? 'projeto' : 'projetos'}</p>
          {portfolio.length === 0 && <small className="empty-message">Adicione seus projetos!</small>}
        </div>

        <div className="dashboard-card">
          <h5>
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
            Oportunidades
          </h5>
          <p>{oportunidades.length} {oportunidades.length === 1 ? 'oportunidade' : 'oportunidades'}</p>
          {oportunidades.length === 0 && <small className="empty-message">Explore oportunidades!</small>}
        </div>
        
        <div className="dashboard-card">
          <h5>
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
              <path d="M6 12v5c3 3 9 3 12 0v-5"/>
            </svg>
            Trilhas
          </h5>
          <p>{trilhasAprendizagem.length} {trilhasAprendizagem.length === 1 ? 'trilha' : 'trilhas'}</p>
          {trilhasAprendizagem.length === 0 && <small className="empty-message">Crie trilhas de aprendizagem!</small>}
        </div>

        <div className="dashboard-card">
          <h5>
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
              <polyline points="14,2 14,8 20,8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10,9 9,9 8,9"/>
            </svg>
            Journal
          </h5>
          <p>{journalEntries.length} {journalEntries.length === 1 ? 'entrada' : 'entradas'}</p>
          {journalEntries.length === 0 && <small className="empty-message">Registre suas reflexões!</small>}
        </div>

        <div className="dashboard-card">
          <h5>
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <polyline points="23,6 13.5,15.5 8.5,10.5 1,18"/>
              <polyline points="17,6 23,6 23,12"/>
            </svg>
            SWOT
          </h5>
          <p>{(swotAnalysis.forcas.length + swotAnalysis.fraquezas.length + swotAnalysis.oportunidades.length + swotAnalysis.ameacas.length)} itens</p>
          {(swotAnalysis.forcas.length + swotAnalysis.fraquezas.length + swotAnalysis.oportunidades.length + swotAnalysis.ameacas.length) === 0 && 
            <small className="empty-message">Faça sua análise SWOT!</small>}
        </div>
      </div>

      {loading && (
        <div className="loading-message">
          <div className="spinner"></div>
          <p>Carregando seus dados...</p>
        </div>
      )}

      {!loading && objetivos.length === 0 && competencias.length === 0 && contatos.length === 0 && (
        <div className="welcome-message">
          <h3>
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
            </svg>
            Bem-vindo à sua jornada de carreira!
          </h3>
          <p>Comece explorando as diferentes seções para planejar e acompanhar seu desenvolvimento profissional.</p>
          <div className="quick-start">
            <h4>Por onde começar:</h4>
            <ul>
              <li>
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <polyline points="23,6 13.5,15.5 8.5,10.5 1,18"/>
                  <polyline points="17,6 23,6 23,12"/>
                </svg>
                <strong>Objetivos:</strong> Defina suas metas de carreira
              </li>
              <li>
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d="M9 12l2 2 4-4"/>
                  <path d="M21 12c-1 0-3-1-3-3s2-3 3-3 3 1 3 3-2 3-3 3"/>
                  <path d="M3 12c1 0 3-1 3-3s-2-3-3-3-3 1-3 3 2 3 3 3"/>
                </svg>
                <strong>Competências:</strong> Avalie suas habilidades
              </li>
              <li>
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                  <line x1="8" y1="21" x2="16" y2="21"/>
                  <line x1="12" y1="17" x2="12" y2="21"/>
                </svg>
                <strong>Portfolio:</strong> Documente seus projetos
              </li>
              <li>
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 00-3-3.87"/>
                  <path d="M16 3.13a4 4 0 010 7.75"/>
                </svg>
                <strong>Network:</strong> Gerencie seus contatos profissionais
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );

  // Componente Objetivos
  const renderObjetivos = () => (
    <div className="carreira-objetivos">
      <h4>
        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12,6 12,12 16,14"/>
        </svg>
        Objetivos de Carreira
      </h4>
      
      <div className="objetivo-form">
        <input
          type="text"
          value={novoObjetivo.titulo}
          onChange={e => setNovoObjetivo({...novoObjetivo, titulo: e.target.value})}
          placeholder="Título do objetivo"
          className="organizacao-input"
        />
        <input
          type="date"
          value={novoObjetivo.prazo}
          onChange={e => setNovoObjetivo({...novoObjetivo, prazo: e.target.value})}
          className="organizacao-input"
        />
        <select 
          value={novoObjetivo.tipo}
          onChange={e => setNovoObjetivo({...novoObjetivo, tipo: e.target.value})}
          className="organizacao-input"
        >
          <option value="curto">Curto Prazo</option>
          <option value="medio">Médio Prazo</option>
          <option value="longo">Longo Prazo</option>
        </select>
        <button onClick={adicionarObjetivo} className="organizacao-btn">Adicionar</button>
      </div>

      <div className="objetivos-list">            {objetivos.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">
                  <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12,6 12,12 16,14"/>
                  </svg>
                </div>
            <h4>Nenhum objetivo ainda</h4>
            <p>Comece definindo seus objetivos de carreira para acompanhar seu progresso!</p>
          </div>
        ) : (
          objetivos.map(objetivo => (
            <div key={objetivo.id} className="objetivo-card">
              <div className="objetivo-header">
                <h5>{objetivo.titulo}</h5>
                <div className="objetivo-actions">
                  <button 
                    onClick={() => editarObjetivo(objetivo.id)} 
                    className="btn-edit"
                    title="Editar"
                  >
                    ✏️
                  </button>
                  <button 
                    onClick={() => concluirObjetivo(objetivo.id)} 
                    className="btn-complete"
                    title="Concluir"
                    disabled={objetivo.progresso === 100}
                  >
                    ✅
                  </button>
                  <button 
                    onClick={() => excluirObjetivo(objetivo.id)} 
                    className="btn-delete"
                    title="Excluir"
                  >
                    🗑️
                  </button>
                </div>
              </div>
              <p>Prazo: {objetivo.prazo} | Tipo: {objetivo.tipo}</p>
              <div className="progress-container">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={objetivo.progresso}
                  onChange={e => atualizarProgresso(objetivo.id, parseInt(e.target.value))}
                  className="progress-slider"
                />
                <span className={objetivo.progresso === 100 ? 'completed' : ''}>{objetivo.progresso}%</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  // Componente Competências
  const renderCompetencias = () => (
    <div className="carreira-competencias">
      <h4>
        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
          <polyline points="23,6 13.5,15.5 8.5,10.5 1,18"/>
          <polyline points="17,6 23,6 23,12"/>
        </svg>
        Competências
      </h4>
      
      <div className="competencia-form">
        <input
          type="text"
          value={novaCompetencia.nome}
          onChange={e => setNovaCompetencia({...novaCompetencia, nome: e.target.value})}
          placeholder="Nome da competência"
          className="organizacao-input"
        />
        <select 
          value={novaCompetencia.categoria}
          onChange={e => setNovaCompetencia({...novaCompetencia, categoria: e.target.value})}
          className="organizacao-input"
        >
          <option value="tecnica">Técnica</option>
          <option value="comportamental">Comportamental</option>
        </select>
        <input
          type="range"
          min="1"
          max="10"
          value={novaCompetencia.nivel}
          onChange={e => setNovaCompetencia({...novaCompetencia, nivel: parseInt(e.target.value)})}
          className="organizacao-input"
        />
        <span>{novaCompetencia.nivel}/10</span>
        <button onClick={adicionarCompetencia} className="organizacao-btn">Adicionar</button>
      </div>
      
      <div className="competencias-grid">
        {competencias.map((comp) => (
          <div key={comp.id} className="competencia-card">
            {editandoCompetencia && editandoCompetencia.id === comp.id ? (
              <div className="competencia-edit">
                <input
                  type="text"
                  value={editandoCompetencia.nome}
                  onChange={e => setEditandoCompetencia({...editandoCompetencia, nome: e.target.value})}
                  className="edit-input"
                />
                <select 
                  value={editandoCompetencia.categoria}
                  onChange={e => setEditandoCompetencia({...editandoCompetencia, categoria: e.target.value})}
                  className="edit-input"
                >
                  <option value="tecnica">Técnica</option>
                  <option value="comportamental">Comportamental</option>
                </select>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={editandoCompetencia.nivel}
                  onChange={e => setEditandoCompetencia({...editandoCompetencia, nivel: parseInt(e.target.value)})}
                />
                <div className="edit-actions">
                  <button onClick={salvarEdicaoCompetencia} className="btn-save">💾</button>
                  <button onClick={() => setEditandoCompetencia(null)} className="btn-cancel">❌</button>
                </div>
              </div>
            ) : (
              <>
                <div className="competencia-header">
                  <h5>{comp.nome}</h5>
                  <div className="competencia-actions">
                    <button onClick={() => editarCompetencia(comp.id)} className="btn-edit">✏️</button>
                    <button onClick={() => excluirCompetencia(comp.id)} className="btn-delete">🗑️</button>
                  </div>
                </div>
                <span className={`categoria ${comp.categoria}`}>{comp.categoria}</span>
                <div className="nivel-container">
                  <div className="nivel-bar">
                    <div 
                      className="nivel-fill" 
                      style={{ width: `${comp.nivel * 10}%` }}
                    ></div>
                  </div>
                  <span>{comp.nivel}/10</span>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      <div className="swot-analysis">
        <h5>
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
            <line x1="9" y1="9" x2="15" y2="9"/>
            <line x1="9" y1="15" x2="15" y2="15"/>
          </svg>
          Análise SWOT
        </h5>
        
        <div className="swot-form">
          <select 
            value={novoItemSwot.tipo}
            onChange={e => setNovoItemSwot({...novoItemSwot, tipo: e.target.value})}
            className="organizacao-input"
          >
            <option value="forcas">Forças</option>
            <option value="fraquezas">Fraquezas</option>
            <option value="oportunidades">Oportunidades</option>
            <option value="ameacas">Ameaças</option>
          </select>
          <input
            type="text"
            value={novoItemSwot.valor}
            onChange={e => setNovoItemSwot({...novoItemSwot, valor: e.target.value})}
            placeholder="Adicionar item"
            className="organizacao-input"
          />
          <button onClick={adicionarItemSwot} className="organizacao-btn">Adicionar</button>
        </div>

        <div className="swot-grid">
          {Object.entries(swotAnalysis).map(([tipo, items]) => (
            <div key={tipo} className={`swot-quadrant ${tipo}`}>
              <h6>
                {tipo === 'forcas' && '💪 Forças'}
                {tipo === 'fraquezas' && '⚠️ Fraquezas'}
                {tipo === 'oportunidades' && (
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
                  </svg>
                )}
                {tipo === 'oportunidades' && ' Oportunidades'}
                {tipo === 'ameacas' && '⚡ Ameaças'}
              </h6>
              <ul>
                {items.map((item, index) => (
                  <li key={index} className="swot-item">
                    {editandoSwot.tipo === tipo && editandoSwot.index === index ? (
                      <div className="swot-edit">
                        <input
                          type="text"
                          value={editandoSwot.valor}
                          onChange={e => setEditandoSwot({...editandoSwot, valor: e.target.value})}
                          className="edit-input"
                        />
                        <button onClick={salvarEdicaoSwot} className="btn-save">💾</button>
                        <button onClick={() => setEditandoSwot({ tipo: '', index: -1, valor: '' })} className="btn-cancel">❌</button>
                      </div>
                    ) : (
                      <div className="swot-item-content">
                        <span>{item}</span>
                        <div className="swot-actions">
                          <button onClick={() => editarItemSwot(tipo, index)} className="btn-edit">✏️</button>
                          <button onClick={() => excluirItemSwot(tipo, index)} className="btn-delete">🗑️</button>
                        </div>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Componente Trilhas de Aprendizagem
  const renderTrilhas = () => (
    <div className="carreira-trilhas">
      <h4>
        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
          <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
          <path d="M6 12v5c3 3 9 3 12 0v-5"/>
        </svg>
        Trilhas de Aprendizagem
      </h4>
      
      <div className="trilha-form">
        <input
          type="text"
          value={novaTrilha.nome}
          onChange={e => setNovaTrilha({...novaTrilha, nome: e.target.value})}
          placeholder="Nome da trilha"
          className="organizacao-input"
        />
        <input
          type="range"
          min="0"
          max="100"
          value={novaTrilha.progresso}
          onChange={e => setNovaTrilha({...novaTrilha, progresso: parseInt(e.target.value)})}
          className="organizacao-input"
        />
        <span>{novaTrilha.progresso}%</span>
        <button onClick={adicionarTrilha} className="organizacao-btn">Adicionar Trilha</button>
      </div>
      
      {trilhasAprendizagem.map((trilha) => (
        <div key={trilha.id} className="trilha-card">
          {editandoTrilha && editandoTrilha.id === trilha.id ? (
            <div className="trilha-edit">
              <input
                type="text"
                value={editandoTrilha.nome}
                onChange={e => setEditandoTrilha({...editandoTrilha, nome: e.target.value})}
                className="edit-input"
              />
              <input
                type="range"
                min="0"
                max="100"
                value={editandoTrilha.progresso}
                onChange={e => setEditandoTrilha({...editandoTrilha, progresso: parseInt(e.target.value)})}
              />
              <span>{editandoTrilha.progresso}%</span>
              <div className="edit-actions">
                <button onClick={salvarEdicaoTrilha} className="btn-save">💾</button>
                <button onClick={() => setEditandoTrilha(null)} className="btn-cancel">❌</button>
              </div>
            </div>
          ) : (
            <>
              <div className="trilha-header">
                <h5>{trilha.nome}</h5>
                <div className="trilha-actions">
                  <button onClick={() => editarTrilha(trilha.id)} className="btn-edit">✏️</button>
                  <button onClick={() => excluirTrilha(trilha.id)} className="btn-delete">🗑️</button>
                </div>
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${trilha.progresso}%` }}
                ></div>
              </div>
              <p>{trilha.progresso}% concluído</p>
            </>
          )}
          
          <div className="cursos-section">
            <div className="curso-form">
              <input
                type="text"
                value={novoCurso}
                onChange={e => setNovoCurso(e.target.value)}
                placeholder="Adicionar curso"
                className="curso-input"
              />
              <button 
                onClick={() => adicionarCursoTrilha(trilha.id)} 
                className="btn-add-curso"
              >
                +
              </button>
            </div>
            
            <div className="cursos-list">
              {(editandoTrilha && editandoTrilha.id === trilha.id ? editandoTrilha.cursos : trilha.cursos).map((curso, cIdx) => (
                <span key={cIdx} className="curso-tag">
                  {curso}
                  <button 
                    onClick={() => excluirCursoTrilha(trilha.id, cIdx)} 
                    className="btn-remove-curso"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  // Componente Portfolio
  const renderPortfolio = () => (
    <div className="carreira-portfolio">
      <h4>
        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
          <line x1="8" y1="21" x2="16" y2="21"/>
          <line x1="12" y1="17" x2="12" y2="21"/>
        </svg>
        Portfolio
      </h4>
      
      <div className="projeto-form">
        <input
          type="text"
          value={novoProjeto.titulo}
          onChange={e => setNovoProjeto({...novoProjeto, titulo: e.target.value})}
          placeholder="Título do projeto"
          className="organizacao-input"
        />
        <textarea
          value={novoProjeto.descricao}
          onChange={e => setNovoProjeto({...novoProjeto, descricao: e.target.value})}
          placeholder="Descrição do projeto"
          className="organizacao-input"
        />
        <select 
          value={novoProjeto.status}
          onChange={e => setNovoProjeto({...novoProjeto, status: e.target.value})}
          className="organizacao-input"
        >
          <option value="Em andamento">Em andamento</option>
          <option value="Concluído">Concluído</option>
          <option value="Pausado">Pausado</option>
        </select>
        <button onClick={adicionarProjeto} className="organizacao-btn">Adicionar Projeto</button>
      </div>
      
      {portfolio.map((projeto) => (
        <div key={projeto.id} className="projeto-card">
          {editandoProjeto && editandoProjeto.id === projeto.id ? (
            <div className="projeto-edit">
              <input
                type="text"
                value={editandoProjeto.titulo}
                onChange={e => setEditandoProjeto({...editandoProjeto, titulo: e.target.value})}
                className="edit-input"
              />
              <textarea
                value={editandoProjeto.descricao}
                onChange={e => setEditandoProjeto({...editandoProjeto, descricao: e.target.value})}
                className="edit-input"
              />
              <select 
                value={editandoProjeto.status}
                onChange={e => setEditandoProjeto({...editandoProjeto, status: e.target.value})}
                className="edit-input"
              >
                <option value="Em andamento">Em andamento</option>
                <option value="Concluído">Concluído</option>
                <option value="Pausado">Pausado</option>
              </select>
              <div className="edit-actions">
                <button onClick={salvarEdicaoProjeto} className="btn-save">💾</button>
                <button onClick={() => setEditandoProjeto(null)} className="btn-cancel">❌</button>
              </div>
            </div>
          ) : (
            <>
              <div className="projeto-header">
                <div>
                  <h5>{projeto.titulo}</h5>
                  <p>{projeto.descricao}</p>
                </div>
                <div className="projeto-actions">
                  <button onClick={() => editarProjeto(projeto.id)} className="btn-edit">✏️</button>
                  <button onClick={() => excluirProjeto(projeto.id)} className="btn-delete">🗑️</button>
                </div>
              </div>
              <span className={`status ${projeto.status.toLowerCase().replace(' ', '-')}`}>
                {projeto.status}
              </span>
            </>
          )}
          
          <div className="tecnologias-section">
            <div className="tech-form">
              <input
                type="text"
                value={novaTecnologia}
                onChange={e => setNovaTecnologia(e.target.value)}
                placeholder="Adicionar tecnologia"
                className="tech-input"
              />
              <button 
                onClick={() => adicionarTecnologiaProjeto(projeto.id)} 
                className="btn-add-tech"
              >
                +
              </button>
            </div>
            
            <div className="tecnologias">
              {(editandoProjeto && editandoProjeto.id === projeto.id ? 
                editandoProjeto.tecnologias : projeto.tecnologias).map((tech, tIdx) => (
                <span key={tIdx} className="tech-tag">
                  {tech}
                  <button 
                    onClick={() => {
                      if (editandoProjeto && editandoProjeto.id === projeto.id) {
                        setEditandoProjeto({
                          ...editandoProjeto,
                          tecnologias: editandoProjeto.tecnologias.filter((_, i) => i !== tIdx)
                        });
                      } else {
                        setPortfolio(portfolio.map(p => 
                          p.id === projeto.id ? 
                          { ...p, tecnologias: p.tecnologias.filter((_, i) => i !== tIdx) } : p
                        ));
                      }
                    }}
                    className="btn-remove-tech"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  // Componente Oportunidades
  const renderOportunidades = () => (
    <div className="carreira-oportunidades">
      <h4>
        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="8"/>
          <path d="M21 21l-4.35-4.35"/>
        </svg>
        Oportunidades
      </h4>
      
      <div className="oportunidade-form">
        <input
          type="text"
          value={novaOportunidade.empresa}
          onChange={e => setNovaOportunidade({...novaOportunidade, empresa: e.target.value})}
          placeholder="Nome da empresa"
          className="organizacao-input"
        />
        <input
          type="text"
          value={novaOportunidade.cargo}
          onChange={e => setNovaOportunidade({...novaOportunidade, cargo: e.target.value})}
          placeholder="Cargo"
          className="organizacao-input"
        />
        <input
          type="text"
          value={novaOportunidade.salario}
          onChange={e => setNovaOportunidade({...novaOportunidade, salario: e.target.value})}
          placeholder="Faixa salarial (ex: 5000-8000)"
          className="organizacao-input"
        />
        <input
          type="range"
          min="0"
          max="100"
          value={novaOportunidade.match}
          onChange={e => setNovaOportunidade({...novaOportunidade, match: parseInt(e.target.value)})}
          className="organizacao-input"
        />
        <span>{novaOportunidade.match}%</span>
        <button onClick={adicionarOportunidade} className="organizacao-btn">Adicionar</button>
      </div>
      
      {oportunidades.map((opp) => (
        <div key={opp.id} className="oportunidade-card">
          {editandoOportunidade && editandoOportunidade.id === opp.id ? (
            <div className="oportunidade-edit">
              <input
                type="text"
                value={editandoOportunidade.empresa}
                onChange={e => setEditandoOportunidade({...editandoOportunidade, empresa: e.target.value})}
                className="edit-input"
              />
              <input
                type="text"
                value={editandoOportunidade.cargo}
                onChange={e => setEditandoOportunidade({...editandoOportunidade, cargo: e.target.value})}
                className="edit-input"
              />
              <input
                type="text"
                value={editandoOportunidade.salario}
                onChange={e => setEditandoOportunidade({...editandoOportunidade, salario: e.target.value})}
                className="edit-input"
              />
              <input
                type="range"
                min="0"
                max="100"
                value={editandoOportunidade.match}
                onChange={e => setEditandoOportunidade({...editandoOportunidade, match: parseInt(e.target.value)})}
              />
              <span>{editandoOportunidade.match}%</span>
              <div className="edit-actions">
                <button onClick={salvarEdicaoOportunidade} className="btn-save">💾</button>
                <button onClick={() => setEditandoOportunidade(null)} className="btn-cancel">❌</button>
              </div>
            </div>
          ) : (
            <>
              <div className="oportunidade-header">
                <div>
                  <h5>{opp.cargo}</h5>
                  <p><strong>{opp.empresa}</strong></p>
                  <p>Salário: R$ {opp.salario}</p>
                </div>
                <div className="oportunidade-actions">
                  <button onClick={() => editarOportunidade(opp.id)} className="btn-edit">✏️</button>
                  <button onClick={() => excluirOportunidade(opp.id)} className="btn-delete">🗑️</button>
                </div>
              </div>
              <div className="match-score">
                <span>Match: {opp.match}%</span>
                <div className="match-bar">
                  <div 
                    className="match-fill" 
                    style={{ width: `${opp.match}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="requisitos-section">
                <h6>Requisitos:</h6>
                <div className="requisitos-list">
                  {opp.requisitos.map((req, rIdx) => (
                    <span key={rIdx} className="requisito-tag">{req}</span>
                  ))}
                </div>
                
                <div className="requisito-form">
                  <input
                    type="text"
                    value={novoRequisito}
                    onChange={e => setNovoRequisito(e.target.value)}
                    placeholder="Adicionar requisito"
                    className="req-input"
                  />
                  <button 
                    onClick={() => {
                      if (novoRequisito.trim()) {
                        setOportunidades(oportunidades.map(o => 
                          o.id === opp.id ? 
                          { ...o, requisitos: [...o.requisitos, novoRequisito] } : o
                        ));
                        setNovoRequisito('');
                      }
                    }}
                    className="btn-add-req"
                  >
                    +
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );

  // Componente Networking
  const renderNetworking = () => (
    <div className="carreira-networking">
      <h4>🤝 Networking</h4>
      
      <div className="contato-form">
        <input
          type="text"
          value={novoContato.nome}
          onChange={e => setNovoContato({...novoContato, nome: e.target.value})}
          placeholder="Nome do contato"
          className="organizacao-input"
        />
        <input
          type="text"
          value={novoContato.cargo}
          onChange={e => setNovoContato({...novoContato, cargo: e.target.value})}
          placeholder="Cargo"
          className="organizacao-input"
        />
        <input
          type="text"
          value={novoContato.empresa}
          onChange={e => setNovoContato({...novoContato, empresa: e.target.value})}
          placeholder="Empresa"
          className="organizacao-input"
        />
        <input
          type="email"
          value={novoContato.email}
          onChange={e => setNovoContato({...novoContato, email: e.target.value})}
          placeholder="Email"
          className="organizacao-input"
        />
        <input
          type="text"
          value={novoContato.linkedin}
          onChange={e => setNovoContato({...novoContato, linkedin: e.target.value})}
          placeholder="LinkedIn"
          className="organizacao-input"
        />
        <select 
          value={novoContato.status}
          onChange={e => setNovoContato({...novoContato, status: e.target.value})}
          className="organizacao-input"
        >
          <option value="Pendente">Pendente</option>
          <option value="Ativo">Ativo</option>
          <option value="Inativo">Inativo</option>
        </select>
        <button onClick={adicionarContato} className="organizacao-btn">Adicionar</button>
      </div>
      
      {contatos.map((contato) => (
        <div key={contato.id} className="contato-card">
          {editandoContato && editandoContato.id === contato.id ? (
            <div className="contato-edit">
              <input
                type="text"
                value={editandoContato.nome}
                onChange={e => setEditandoContato({...editandoContato, nome: e.target.value})}
                className="edit-input"
              />
              <input
                type="text"
                value={editandoContato.cargo}
                onChange={e => setEditandoContato({...editandoContato, cargo: e.target.value})}
                className="edit-input"
              />
              <input
                type="text"
                value={editandoContato.empresa}
                onChange={e => setEditandoContato({...editandoContato, empresa: e.target.value})}
                className="edit-input"
              />
              <input
                type="email"
                value={editandoContato.email}
                onChange={e => setEditandoContato({...editandoContato, email: e.target.value})}
                className="edit-input"
              />
              <input
                type="text"
                value={editandoContato.linkedin}
                onChange={e => setEditandoContato({...editandoContato, linkedin: e.target.value})}
                className="edit-input"
              />
              <select 
                value={editandoContato.status}
                onChange={e => setEditandoContato({...editandoContato, status: e.target.value})}
                className="edit-input"
              >
                <option value="Pendente">Pendente</option>
                <option value="Ativo">Ativo</option>
                <option value="Inativo">Inativo</option>
              </select>
              <div className="edit-actions">
                <button onClick={salvarEdicaoContato} className="btn-save">💾</button>
                <button onClick={() => setEditandoContato(null)} className="btn-cancel">❌</button>
              </div>
            </div>
          ) : (
            <>
              <div className="contato-header">
                <div className="contato-info">
                  <h5>{contato.nome}</h5>
                  <p>{contato.cargo} - {contato.empresa}</p>
                  <p>📧 {contato.email}</p>
                  <p>🔗 {contato.linkedin}</p>
                </div>
                <div className="contato-actions">
                  <button onClick={() => editarContato(contato.id)} className="btn-edit">✏️</button>
                  <button onClick={() => excluirContato(contato.id)} className="btn-delete">🗑️</button>
                </div>
              </div>
              <span className={`status-badge ${contato.status.toLowerCase()}`}>
                {contato.status}
              </span>
            </>
          )}
        </div>
      ))}
    </div>
  );

  // Componente Journal
  const renderJournal = () => (
    <div className="carreira-journal">
      <h4>
        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
          <polyline points="14,2 14,8 20,8"/>
          <line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/>
          <polyline points="10,9 9,9 8,9"/>
        </svg>
        Journal de Carreira
      </h4>
      
      <div className="journal-form">
        <input
          type="date"
          value={novaEntradaJournal.data}
          onChange={e => setNovaEntradaJournal({...novaEntradaJournal, data: e.target.value})}
          className="organizacao-input"
        />
        <select 
          value={novaEntradaJournal.tipo}
          onChange={e => setNovaEntradaJournal({...novaEntradaJournal, tipo: e.target.value})}
          className="organizacao-input"
        >
          <option value="reflexao">Reflexão</option>
          <option value="conquista">Conquista</option>
          <option value="aprendizado">Aprendizado</option>
          <option value="meta">Meta</option>
        </select>
        <textarea
          value={novaEntradaJournal.entry}
          onChange={e => setNovaEntradaJournal({...novaEntradaJournal, entry: e.target.value})}
          placeholder="Escreva sua entrada..."
          className="organizacao-input journal-textarea"
          rows="3"
        />
        <button onClick={adicionarEntradaJournal} className="organizacao-btn">Adicionar Entrada</button>
      </div>
      
      <div className="journal-entries">
        {journalEntries.map((entry) => (
          <div key={entry.id} className="journal-entry">
            {editandoJournal && editandoJournal.id === entry.id ? (
              <div className="journal-edit">
                <input
                  type="date"
                  value={editandoJournal.data}
                  onChange={e => setEditandoJournal({...editandoJournal, data: e.target.value})}
                  className="edit-input"
                />
                <select 
                  value={editandoJournal.tipo}
                  onChange={e => setEditandoJournal({...editandoJournal, tipo: e.target.value})}
                  className="edit-input"
                >
                  <option value="reflexao">Reflexão</option>
                  <option value="conquista">Conquista</option>
                  <option value="aprendizado">Aprendizado</option>
                  <option value="meta">Meta</option>
                </select>
                <textarea
                  value={editandoJournal.entry}
                  onChange={e => setEditandoJournal({...editandoJournal, entry: e.target.value})}
                  className="edit-input"
                  rows="3"
                />
                <div className="edit-actions">
                  <button onClick={salvarEdicaoJournal} className="btn-save">
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                      <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/>
                      <polyline points="17,21 17,13 7,13 7,21"/>
                      <polyline points="7,3 7,8 15,8"/>
                    </svg>
                  </button>
                  <button onClick={() => setEditandoJournal(null)} className="btn-cancel">
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                      <line x1="18" y1="6" x2="6" y2="18"/>
                      <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="entry-header">
                  <div className="entry-meta">
                    <span className="entry-date">{entry.data}</span>
                    <span className={`entry-type ${entry.tipo}`}>
                      {entry.tipo === 'conquista' && (
                        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                          <path d="M6 9H4.5a2.5 2.5 0 010-5H6"/>
                          <path d="M18 9h1.5a2.5 2.5 0 000-5H18"/>
                          <path d="M4 22h16"/>
                          <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/>
                          <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
                          <path d="M18 2H6v7a6 6 0 0012 0V2z"/>
                        </svg>
                      )}
                      {entry.tipo === 'reflexao' && (
                        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                          <circle cx="12" cy="12" r="10"/>
                          <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/>
                          <line x1="12" y1="17" x2="12.01" y2="17"/>
                        </svg>
                      )}
                      {entry.tipo === 'aprendizado' && (
                        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                          <path d="M4 19.5A2.5 2.5 0 016.5 17H20"/>
                          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>
                        </svg>
                      )}
                      {entry.tipo === 'meta' && (
                        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                          <circle cx="12" cy="12" r="10"/>
                          <polyline points="12,6 12,12 16,14"/>
                        </svg>
                      )}
                      {entry.tipo}
                    </span>
                  </div>
                  <div className="entry-actions">
                    <button onClick={() => editarEntradaJournal(entry.id)} className="btn-edit">
                      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                    </button>
                    <button onClick={() => excluirEntradaJournal(entry.id)} className="btn-delete">
                      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                        <polyline points="3,6 5,6 21,6"/>
                        <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                        <line x1="10" y1="11" x2="10" y2="17"/>
                        <line x1="14" y1="11" x2="14" y2="17"/>
                      </svg>
                    </button>
                  </div>
                </div>
                <p className="entry-content">{entry.entry}</p>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  if (loading) {
    return (
      <section className="carreira-container">
        <div className="carreira-header">
          <h3>
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
            Carreira
          </h3>
          <button 
            className="btn-voltar" 
            onClick={() => navigate('/dashboard')}
            title="Voltar ao Dashboard"
          >
          </button>
        </div>
        <div className="loading-screen">
          <div className="spinner"></div>
          <p>Carregando sua plataforma de carreira...</p>
        </div>
      </section>
    );
  }

  return (
    <section className={`carreira-container ${darkMode ? 'dark-mode' : ''}`} data-theme={darkMode ? 'dark' : 'light'}>
      <div className="carreira-header">
        <h3>
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
          Carreira
        </h3>
        <button 
          className="btn-voltar" 
          onClick={() => navigate('/dashboard')}
          title="Voltar ao Dashboard"
        >
        </button>
      </div>

      <div className="carreira-tabs">
        <button 
          className={activeTab === 'dashboard' ? 'tab active' : 'tab'}
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
          className={activeTab === 'objetivos' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('objetivos')}
        >
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12,6 12,12 16,14"/>
          </svg>
          Objetivos
        </button>
        <button 
          className={activeTab === 'competencias' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('competencias')}
        >
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <polyline points="23,6 13.5,15.5 8.5,10.5 1,18"/>
            <polyline points="17,6 23,6 23,12"/>
          </svg>
          Competências
        </button>
        <button 
          className={activeTab === 'trilhas' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('trilhas')}
        >
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
            <path d="M6 12v5c3 3 9 3 12 0v-5"/>
          </svg>
          Trilhas
        </button>
        <button 
          className={activeTab === 'portfolio' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('portfolio')}
        >
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
            <line x1="8" y1="21" x2="16" y2="21"/>
            <line x1="12" y1="17" x2="12" y2="21"/>
          </svg>
          Portfolio
        </button>
        <button 
          className={activeTab === 'oportunidades' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('oportunidades')}
        >
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35"/>
          </svg>
          Vagas
        </button>
        <button 
          className={activeTab === 'networking' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('networking')}
        >
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 00-3-3.87"/>
            <path d="M16 3.13a4 4 0 010 7.75"/>
          </svg>
          Network
        </button>
        <button 
          className={activeTab === 'journal' ? 'tab active' : 'tab'}
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
      </div>

      <div className="carreira-content">
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'objetivos' && renderObjetivos()}
        {activeTab === 'competencias' && renderCompetencias()}
        {activeTab === 'trilhas' && renderTrilhas()}
        {activeTab === 'portfolio' && renderPortfolio()}
        {activeTab === 'oportunidades' && renderOportunidades()}
        {activeTab === 'networking' && renderNetworking()}
        {activeTab === 'journal' && renderJournal()}
      </div>
    </section>
  );
}

export default Carreira;