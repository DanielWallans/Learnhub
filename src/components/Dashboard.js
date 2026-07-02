import React, { useEffect, useState, useMemo, useCallback, Suspense, lazy } from 'react';
import { auth, db } from '../firebaseConfig';
import { doc, collection, query, where, onSnapshot } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaBriefcase, 
  FaBook,
  FaCogs,
  FaSearch,
  FaEye,
  FaEyeSlash
} from 'react-icons/fa';
import Loading from './Loading';

// Lazy loading modals
const RelatorioBug = lazy(() => import('./RelatorioBug'));
const ModalPerfil = lazy(() => import('./ModalPerfil'));

const Dashboard = () => {
  const navigate = useNavigate();

  // Estados principais
  const [user, setUser] = useState(null);
  const [nome, setNome] = useState('');
  const [foto, setFoto] = useState('');
  const [dadosAluno, setDadosAluno] = useState(null);
  const [showPerfil, setShowPerfil] = useState(false);
  const [showBugReport, setShowBugReport] = useState(false);
  const [loading, setLoading] = useState(true);

  // Novos estados interativos
  const [livrosLendo, setLivrosLendo] = useState([]);
  const [habilidadesLista, setHabilidadesLista] = useState([]);
  const [candidaturasLista, setCandidaturasLista] = useState([]);
  const [mostrarSaldo, setMostrarSaldo] = useState(() => localStorage.getItem('learnhub_mostrar_saldo') !== 'false');

  // Estados estatísticos reais do Firebase
  const [estatisticas, setEstatisticas] = useState({
    streak: 0,
    progressoHabitos: 0,
    totalLivros: 0,
    livrosLidos: 0,
    progressoLeitura: 0,
    totalCandidaturas: 0,
    candidaturasEntrevista: 0,
    saldoFinanceiro: 0,
    totalSpending: 0,
    totalSaved: 0
  });

  const defaultAvatar = useMemo(() => {
    if (!nome) return '';
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(nome)}&background=2563eb&color=ffffff`;
  }, [nome]);

  const handleLogout = useCallback(async () => {
    try {
      await auth.signOut();
      navigate('/home');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  }, [navigate]);

  const handleOpenPerfil = useCallback(() => setShowPerfil(true), []);
  const handleClosePerfil = useCallback(() => setShowPerfil(false), []);
  const handleUpdateProfile = useCallback((newData) => {
    setDadosAluno(prev => ({ ...prev, ...newData }));
    setNome(newData.nome || newData.nomeCompleto || nome);
  }, [nome]);

  const handleOpenBugReport = useCallback(() => setShowBugReport(true), []);
  const handleCloseBugReport = useCallback(() => setShowBugReport(false), []);

  // Monitora autenticação
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      if (!user) {
        navigate('/home');
      } else {
        setLoading(false);
      }
    });
    return unsubscribe;
  }, [navigate]);

  // Carrega dados do Firestore (Perfil e Estatísticas)
  useEffect(() => {
    if (!user) return;

    // 1. Ouvir dados do aluno
    const docRef = doc(db, 'alunos', user.uid);
    const unsubAluno = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const userName = data.nomeCompleto || data.nome || 'Estudante';
        setNome(userName);
        setFoto(data.foto || `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=2563eb&color=ffffff`);
        setDadosAluno(data);
      }
    });

    // 2. Ouvir hábitos (para Streak e Progresso Semanal)
    const habitosQuery = query(collection(db, 'habitos'), where('uid', '==', user.uid));
    const unsubHabitos = onSnapshot(habitosQuery, (snapshot) => {
      const hoje = new Date();
      const docs = snapshot.docs;
      
      // Calcular Streak (Dias Consecutivos)
      let streakCount = 0;
      if (docs.length > 0) {
        const dataAtual = new Date(hoje);
        for (let i = 0; i < 30; i++) {
          const dataVerificar = new Date(dataAtual);
          dataVerificar.setDate(dataAtual.getDate() - i);
          const dataString = dataVerificar.toISOString().split('T')[0];
          
          let temHabitoHoje = false;
          docs.forEach(doc => {
            const h = doc.data();
            if (h.diasConcluidos && h.diasConcluidos.includes(dataString)) {
              temHabitoHoje = true;
            }
          });
          if (temHabitoHoje) streakCount++;
          else break;
        }
      }

      // Calcular Progresso Semanal
      let progressoSemanal = 0;
      if (docs.length > 0) {
        const inicioSemana = new Date(hoje);
        inicioSemana.setDate(hoje.getDate() - hoje.getDay()); // Domingo
        let totalHabitos = 0;
        let habitosConcluidos = 0;
        for (let i = 0; i < 7; i++) {
          const dataVerificar = new Date(inicioSemana);
          dataVerificar.setDate(inicioSemana.getDate() + i);
          const dataString = dataVerificar.toISOString().split('T')[0];
          
          for (const doc of docs) {
            const h = doc.data();
            if (h.ativo !== false) {
              totalHabitos++;
              if (h.diasConcluidos && h.diasConcluidos.includes(dataString)) {
                habitosConcluidos++;
              }
            }
          }
        }
        progressoSemanal = totalHabitos > 0 ? Math.round((habitosConcluidos / totalHabitos) * 100) : 0;
      }

      setEstatisticas(prev => ({
        ...prev,
        streak: streakCount,
        progressoHabitos: progressoSemanal
      }));
    });

    // 3. Ouvir biblioteca (leitura)
    const leituraQuery = query(collection(db, 'leitura'), where('userId', '==', user.uid));
    const unsubLeitura = onSnapshot(leituraQuery, (snapshot) => {
      const booksList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const total = booksList.length;
      const concluidos = booksList.filter(book => book.status === 'Concluído').length;
      const progresso = total > 0 ? Math.round((concluidos / total) * 100) : 0;
      
      // Filtrar livros que estão sendo lidos
      const lendo = booksList.filter(book => book.status === 'Lendo');
      setLivrosLendo(lendo);

      setEstatisticas(prev => ({
        ...prev,
        totalLivros: total,
        livrosLidos: concluidos,
        progressoLeitura: progresso
      }));
    });

    // 4. Ouvir candidaturas (carreira)
    const carreiraQuery = query(collection(db, 'candidaturas'), where('userId', '==', user.uid));
    const unsubCarreira = onSnapshot(carreiraQuery, (snapshot) => {
      const cands = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCandidaturasLista(cands);

      const total = cands.length;
      const entrevistas = cands.filter(cand => cand.fase === 'entrevista').length;
      setEstatisticas(prev => ({
        ...prev,
        totalCandidaturas: total,
        candidaturasEntrevista: entrevistas
      }));
    });

    // 5. Ouvir finanças (resumo)
    const financasRef = doc(db, 'financas_resumo', user.uid);
    const unsubFinancas = onSnapshot(financasRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setEstatisticas(prev => ({
          ...prev,
          saldoFinanceiro: data.totalBalance || 0,
          totalSpending: data.totalSpending || 0,
          totalSaved: data.totalSaved || 0
        }));
      } else {
        setEstatisticas(prev => ({
          ...prev,
          saldoFinanceiro: 0,
          totalSpending: 0,
          totalSaved: 0
        }));
      }
    });

    // 6. Ouvir Habilidades
    const habilidadesQuery = query(collection(db, 'habilidades'), where('userId', '==', user.uid));
    const unsubHabilidades = onSnapshot(habilidadesQuery, (snapshot) => {
      const skills = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setHabilidadesLista(skills);
    });

    return () => {
      unsubAluno();
      unsubHabitos();
      unsubLeitura();
      unsubCarreira();
      unsubFinancas();
      unsubHabilidades();
    };
  }, [user]);

  // Framer Motion Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
  };

  // Propriedades computadas dinamicamente para os cartões interativos
  const livroAtivoDashboard = livrosLendo.length > 0 ? livrosLendo[0] : null;
  const progressoLivroAtivo = livroAtivoDashboard && livroAtivoDashboard.paginasTotal > 0
    ? Math.round((livroAtivoDashboard.paginasLidas / livroAtivoDashboard.paginasTotal) * 100)
    : 0;

  const habilidadeAtiva = habilidadesLista.length > 0 
    ? habilidadesLista[habilidadesLista.length - 1] 
    : null;
  const totalHabilidades = habilidadesLista.length;
  const mediaProgressoHabilidades = totalHabilidades > 0
    ? Math.round(habilidadesLista.reduce((acc, h) => acc + (h.progresso || 0), 0) / totalHabilidades)
    : 0;
  const badgesConquistadas = habilidadesLista.filter(h => h.progresso >= 75 || h.nivel === 'Avançado').length;

  const candidaturaAtiva = candidaturasLista.length > 0 
    ? candidaturasLista[candidaturasLista.length - 1] 
    : null;

  if (loading) {
    return <Loading message="Carregando painel principal..." size="large" />;
  }

  return (
    <div className="min-h-screen bg-background text-on-surface font-body-md relative overflow-x-hidden flex">
      {/* Background animado */}
      <div className="bg-effects">
        <div className="particle particle-1"></div>
        <div className="particle particle-2"></div>
        <div className="particle particle-3"></div>
      </div>

      {/* Desktop SideNavBar */}
      <aside className="w-64 h-screen fixed left-0 top-0 hidden md:flex flex-col border-r border-outline-variant/30 bg-surface-container-lowest dark:bg-inverse-surface p-5 gap-2 z-50 transition-colors duration-300">
        <div className="mb-8 px-2">
          <span className="font-display text-2xl font-extrabold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">LearnHub</span>
          <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest mt-1">Plataforma de Estudos</p>
        </div>
        
        <nav className="flex flex-col gap-1 flex-1">
          <button 
            className="flex items-center gap-3 px-4 py-3 bg-primary-fixed text-on-primary-fixed font-bold rounded-xl active:scale-[0.98] transition-all text-left"
            onClick={() => navigate('/dashboard')}
          >
            <span className="material-symbols-outlined">home</span>
            <span className="font-body-md text-body-md">Dashboard</span>
          </button>
          
          <button 
            className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high dark:hover:bg-surface-container transition-all rounded-xl text-left"
            onClick={() => navigate('/carreira')}
          >
            <span className="material-symbols-outlined">work</span>
            <span className="font-body-md text-body-md">Carreira</span>
          </button>
          
          <button 
            className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high dark:hover:bg-surface-container transition-all rounded-xl text-left"
            onClick={() => navigate('/financas')}
          >
            <span className="material-symbols-outlined">wallet</span>
            <span className="font-body-md text-body-md">Finanças</span>
          </button>
          
          <button 
            className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high dark:hover:bg-surface-container transition-all rounded-xl text-left"
            onClick={() => navigate('/habilidades')}
          >
            <span className="material-symbols-outlined">check_circle</span>
            <span className="font-body-md text-body-md">Habilidades</span>
          </button>
          
          <button 
            className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high dark:hover:bg-surface-container transition-all rounded-xl text-left"
            onClick={() => navigate('/leitura')}
          >
            <span className="material-symbols-outlined">book</span>
            <span className="font-body-md text-body-md">Biblioteca</span>
          </button>
        </nav>

        <div className="mt-auto flex flex-col gap-1 pt-4 border-t border-outline-variant/30">
          <button 
            className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high dark:hover:bg-surface-container transition-all rounded-xl text-left"
            onClick={handleOpenPerfil}
          >
            <span className="material-symbols-outlined">settings</span>
            <span className="font-body-md text-body-md">Configurações</span>
          </button>

          <button 
            className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high dark:hover:bg-surface-container transition-all rounded-xl text-left"
            onClick={handleOpenBugReport}
          >
            <span className="material-symbols-outlined text-amber-500">bug_report</span>
            <span className="font-body-md text-body-md">Reportar Bug</span>
          </button>

          <button 
            className="flex items-center gap-3 px-4 py-3 text-error hover:bg-error/10 transition-all rounded-xl text-left font-bold"
            onClick={handleLogout}
          >
            <span className="material-symbols-outlined">logout</span>
            <span className="font-body-md text-body-md">Sair</span>
          </button>
        </div>
      </aside>

      {/* Main Wrap (Desktop margin left) */}
      <div className="flex-1 flex flex-col min-h-screen ml-0 md:ml-64 pb-20 md:pb-0 transition-all duration-300">
        
        {/* Top AppBar */}
        <header className="flex items-center justify-between px-6 py-4 bg-surface/80 dark:bg-inverse-surface/80 backdrop-blur-md border-b border-outline-variant/30 sticky top-0 z-40 transition-colors duration-300">
          <div className="flex items-center gap-6">
            <span className="font-display text-xl font-extrabold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent md:hidden">LearnHub</span>
            <div className="relative hidden lg:block">
              <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm" />
              <input 
                className="pl-10 pr-4 py-2 bg-surface-container-low dark:bg-surface-container border border-outline-variant/20 rounded-full text-body-md focus:ring-2 focus:ring-primary focus:outline-none transition-all w-64 dark:text-white" 
                placeholder="Buscar no LearnHub..." 
                type="text"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            {/* Mobile Quick Actions */}
            <button 
              onClick={handleOpenBugReport}
              className="md:hidden p-1.5 text-amber-500 hover:bg-surface-container-high dark:hover:bg-surface-container rounded-full transition-colors flex items-center justify-center"
              title="Reportar Bug"
            >
              <span className="material-symbols-outlined text-[20px]">bug_report</span>
            </button>

            <button 
              onClick={handleLogout}
              className="md:hidden p-1.5 text-error hover:bg-error/10 rounded-full transition-colors flex items-center justify-center"
              title="Sair"
            >
              <span className="material-symbols-outlined text-[20px]">logout</span>
            </button>

            {/* Profile controls */}
            <div className="flex items-center gap-3">
              <div 
                className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
                onClick={handleOpenPerfil}
              >
                <div className="text-right hidden sm:block">
                  <p className="font-bold text-body-md leading-none text-on-surface">{nome || 'Carregando...'}</p>
                  <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider mt-0.5">Painel do Estudante</p>
                </div>
                <img 
                  alt="Perfil" 
                  className="w-10 h-10 rounded-full object-cover p-0.5 border-2 border-primary shadow-sm hover:scale-105 transition-transform" 
                  src={foto || defaultAvatar}
                />
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="p-6 lg:p-10 flex-1 flex flex-col">
          
          {/* Header Section */}
          <section className="mb-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <motion.h1 
                  className="font-display text-4xl sm:text-5xl font-extrabold text-on-surface leading-tight tracking-tight mb-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  Painel de Controle
                </motion.h1>
                <motion.p 
                  className="text-on-surface-variant text-body-lg"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                >
                  Olá, <span className="font-bold text-primary">{nome}</span>! Explore seus módulos de desenvolvimento e estudos.
                </motion.p>
              </div>
            </div>
          </section>

          {/* Bento Grid */}
          <motion.section 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div 
              className="lg:col-span-2 group bg-surface-container-lowest dark:bg-inverse-surface/40 border border-outline-variant/30 rounded-[32px] overflow-hidden hover:shadow-xl dark:hover:shadow-primary/5 transition-all duration-500 flex flex-col md:flex-row shadow-sm cursor-pointer"
              variants={itemVariants}
              onClick={() => navigate('/leitura')}
            >
              <div className="md:w-1/2 relative h-64 md:h-auto bg-gradient-to-br from-primary/10 to-secondary/10 overflow-hidden flex items-center justify-center p-8">
                {/* Abstract Visual Design */}
                <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
                {livroAtivoDashboard?.capa ? (
                  <img 
                    src={livroAtivoDashboard.capa} 
                    alt={livroAtivoDashboard.titulo} 
                    className="max-h-56 rounded-lg shadow-lg object-contain relative z-10 transition-transform duration-500 group-hover:scale-105" 
                  />
                ) : (
                  <motion.div 
                    className="relative z-10 w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center text-primary text-5xl"
                    animate={{ y: [0, -10, 0] }}
                    transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                  >
                    <FaBook />
                  </motion.div>
                )}
                <div className="absolute top-4 left-4 bg-primary text-on-primary px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-md">
                  {livroAtivoDashboard ? 'Lendo Agora' : 'Mais Acessado'}
                </div>
              </div>
              <div className="md:w-1/2 p-8 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="material-symbols-outlined text-primary text-lg">school</span>
                    <span className="text-[10px] text-primary font-bold uppercase tracking-widest">Biblioteca Pessoal</span>
                  </div>
                  <h3 className="font-display text-2xl font-extrabold mb-3 text-on-surface leading-snug">
                    {livroAtivoDashboard ? livroAtivoDashboard.titulo : 'Sua Estante Digital de Leituras'}
                  </h3>
                  <p className="text-on-surface-variant text-body-md mb-6 line-clamp-3">
                    {livroAtivoDashboard 
                      ? `Você está com a leitura ativa deste livro. Autor: ${livroAtivoDashboard.autor || 'Desconhecido'}.` 
                      : 'Gerencie seus livros, artigos, audiobooks e resumos de estudo de forma estruturada, com controle dinâmico de progresso.'
                    }
                  </p>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-label-sm font-bold text-on-surface-variant font-extrabold text-[10px]">
                      {livroAtivoDashboard ? `Progresso (${livroAtivoDashboard.paginasLidas}/${livroAtivoDashboard.paginasTotal} pág.)` : 'Progresso Geral'}
                    </span>
                    <span className="text-label-sm font-bold text-primary">
                      {livroAtivoDashboard ? `${progressoLivroAtivo}%` : `${estatisticas.progressoLeitura}%`}
                    </span>
                  </div>
                  <div className="h-2.5 w-full bg-surface-container-high dark:bg-surface-container rounded-full overflow-hidden mb-6">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-primary to-secondary rounded-full" 
                      initial={{ width: 0 }}
                      animate={{ width: `${livroAtivoDashboard ? progressoLivroAtivo : estatisticas.progressoLeitura}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                    ></motion.div>
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); navigate('/leitura'); }}
                    className="w-full py-3.5 bg-primary text-on-primary hover:bg-primary/95 rounded-2xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-all group/btn shadow-md"
                  >
                    <span>Acessar Biblioteca</span>
                    <span className="material-symbols-outlined group-hover/btn:translate-x-1 transition-transform">arrow_forward</span>
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Standard Module Card 3 - Habilidades (occupies 1 column) */}
            <motion.div 
              className="group bg-surface-container-lowest dark:bg-inverse-surface/40 border border-outline-variant/30 rounded-[32px] p-6 flex flex-col hover:shadow-lg dark:hover:shadow-primary/5 transition-all duration-300 shadow-sm cursor-pointer"
              variants={itemVariants}
              onClick={() => navigate('/habilidades')}
            >
              <div className="h-44 rounded-2xl bg-gradient-to-br from-primary/5 to-tertiary/5 mb-5 flex items-center justify-center overflow-hidden relative">
                <FaCogs className="text-primary text-4xl group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute bottom-3 left-3 bg-white/90 dark:bg-inverse-surface/90 backdrop-blur px-3 py-1 rounded-lg text-[10px] font-bold text-on-surface shadow-sm">
                  {habilidadeAtiva ? `Progresso: ${habilidadeAtiva.progresso}%` : 'Controle'}
                </div>
              </div>
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="material-symbols-outlined text-primary text-lg">check_circle</span>
                    <span className="text-[10px] text-primary font-bold uppercase tracking-widest">Habilidades</span>
                  </div>
                  <h4 className="font-display text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                    {habilidadeAtiva ? habilidadeAtiva.nome : 'Controle de Habilidades'}
                  </h4>
                  <p className="text-on-surface-variant text-body-md mb-6 line-clamp-2">
                    {habilidadeAtiva 
                      ? `Desenvolvendo nível ${habilidadeAtiva.nivel || 'Iniciante'}. Categoria: ${habilidadeAtiva.categoria || 'Geral'}.`
                      : 'Desenvolva competências estruturadas e acompanhe seu progresso de aprendizado.'
                    }
                  </p>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-label-sm font-bold text-on-surface-variant">Progresso Habilidade</span>
                    <span className="text-label-sm font-bold text-primary">
                      {habilidadeAtiva ? `${habilidadeAtiva.progresso}%` : '0%'}
                    </span>
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); navigate('/habilidades'); }}
                    className="w-full py-3 border border-primary/30 text-primary hover:bg-primary/5 rounded-xl font-bold active:scale-[0.98] transition-all"
                  >
                    Acessar Habilidades
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Standard Module Card 2 - Finanças (Large Card now, occupies 2 columns) */}
            <motion.div 
              className="lg:col-span-2 group bg-surface-container-lowest dark:bg-inverse-surface/40 border border-outline-variant/30 rounded-[32px] p-8 flex flex-col hover:shadow-lg dark:hover:shadow-tertiary/5 transition-all duration-300 shadow-sm cursor-pointer"
              variants={itemVariants}
              onClick={() => navigate('/financas')}
            >
              <div className="flex flex-col md:flex-row gap-8 flex-1 justify-between">
                
                {/* Left Side: Balance Info */}
                <div className="md:w-1/2 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="material-symbols-outlined text-tertiary text-lg">payments</span>
                      <span className="text-[10px] text-tertiary font-bold uppercase tracking-widest">Finanças</span>
                    </div>
                    <h4 className="font-display text-xl font-bold mb-4 group-hover:text-primary transition-colors">Gestão Financeira</h4>
                    
                    <div className="bg-surface-container-low dark:bg-surface-container/60 p-5 rounded-2xl border border-outline-variant/20 mb-4 relative overflow-hidden">
                      <p className="text-xs text-on-surface-variant font-medium mb-1">Saldo em Conta</p>
                      <div className="flex items-center justify-between">
                        <span className="font-display text-2xl font-black text-on-surface">
                          {mostrarSaldo ? `R$ ${estatisticas.saldoFinanceiro.toFixed(2)}` : 'R$ ****'}
                        </span>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setMostrarSaldo(prev => {
                              const newVal = !prev;
                              localStorage.setItem('learnhub_mostrar_saldo', newVal);
                              return newVal;
                            });
                          }}
                          className="p-2 hover:bg-surface-container rounded-full text-on-surface-variant hover:text-on-surface transition-colors"
                          title={mostrarSaldo ? "Ocultar Saldo" : "Mostrar Saldo"}
                        >
                          {mostrarSaldo ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-label-sm font-bold text-on-surface-variant">Saúde Financeira</span>
                      <span className={`text-label-sm font-bold px-3 py-1 rounded-full ${estatisticas.saldoFinanceiro >= 0 ? 'bg-emerald-500/10 text-emerald-500 font-extrabold' : 'bg-red-500/10 text-red-500 font-extrabold'}`}>
                        {estatisticas.saldoFinanceiro >= 0 ? 'Positiva' : 'Revisar'}
                      </span>
                    </div>
                    <button 
                      onClick={(e) => { e.stopPropagation(); navigate('/financas'); }}
                      className="w-full py-3.5 bg-tertiary text-white hover:bg-tertiary/90 rounded-xl font-bold active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                    >
                      <span>Acessar Finanças</span>
                      <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </button>
                  </div>
                </div>

                {/* Right Side: Quick Stats breakdown */}
                <div className="md:w-1/2 flex flex-col justify-between border-t md:border-t-0 md:border-l border-outline-variant/20 pt-6 md:pt-0 md:pl-8">
                  <div>
                    <h5 className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-4">Detalhamento Financeiro</h5>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-red-500/5 rounded-xl border border-red-500/10">
                        <div>
                          <p className="text-[10px] text-on-surface-variant font-bold uppercase">Total Gasto</p>
                          <p className="font-bold text-body-lg text-red-500">
                            {mostrarSaldo ? `R$ ${estatisticas.totalSpending.toFixed(2)}` : 'R$ ****'}
                          </p>
                        </div>
                        <span className="material-symbols-outlined text-red-500">trending_down</span>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-emerald-500/5 rounded-xl border border-emerald-500/10">
                        <div>
                          <p className="text-[10px] text-on-surface-variant font-bold uppercase">Total Economizado</p>
                          <p className="font-bold text-body-lg text-emerald-500">
                            {mostrarSaldo ? `R$ ${estatisticas.totalSaved.toFixed(2)}` : 'R$ ****'}
                          </p>
                        </div>
                        <span className="material-symbols-outlined text-emerald-500">trending_up</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 text-center md:text-left text-[11px] text-on-surface-variant bg-surface-container-low dark:bg-surface-container/35 p-3 rounded-xl border border-outline-variant/10">
                    <p className="leading-relaxed">Acompanhe suas despesas de estudos de forma eficiente para manter a saúde financeira em dia.</p>
                  </div>
                </div>

              </div>
            </motion.div>

            {/* Standard Module Card 1 - Carreira (occupies 1 column) */}
            <motion.div 
              className="group bg-surface-container-lowest dark:bg-inverse-surface/40 border border-outline-variant/30 rounded-[32px] p-6 flex flex-col hover:shadow-lg dark:hover:shadow-secondary/5 transition-all duration-300 shadow-sm cursor-pointer"
              variants={itemVariants}
              onClick={() => navigate('/carreira')}
            >
              <div className="h-44 rounded-2xl bg-gradient-to-br from-secondary/5 to-primary/5 mb-5 flex items-center justify-center overflow-hidden relative">
                <FaBriefcase className="text-secondary text-4xl group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute bottom-3 left-3 bg-white/90 dark:bg-inverse-surface/90 backdrop-blur px-3 py-1 rounded-lg text-[10px] font-bold text-on-surface shadow-sm">
                  {candidaturasLista.length} CANDIDATURAS
                </div>
              </div>
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="material-symbols-outlined text-secondary text-lg">work</span>
                    <span className="text-[10px] text-secondary font-bold uppercase tracking-widest">Carreira</span>
                  </div>
                  <h4 className="font-display text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                    {candidaturaAtiva ? candidaturaAtiva.vaga : 'Desenvolvimento de Carreira'}
                  </h4>
                  <p className="text-on-surface-variant text-body-md mb-6 line-clamp-2">
                    {candidaturaAtiva 
                      ? `Empresa: ${candidaturaAtiva.empresa}. Fase: ${candidaturaAtiva.fase.toUpperCase()}.`
                      : 'Gerencie processos seletivos de estágios, controle sua rede de contatos e metas profissionais.'
                    }
                  </p>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-label-sm font-bold text-on-surface-variant font-extrabold uppercase text-[10px]">
                      {candidaturaAtiva ? `Fase: ${candidaturaAtiva.fase}` : `${estatisticas.candidaturasEntrevista} em entrevista`}
                    </span>
                    <span className="text-label-sm font-bold text-on-surface">Ativo</span>
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); navigate('/carreira'); }}
                    className="w-full py-3 border border-primary/30 text-primary hover:bg-primary/5 rounded-xl font-bold active:scale-[0.98] transition-all"
                  >
                    Acessar Carreira
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.section>

          {/* Stats Widgets */}
          <motion.section 
            className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            <div 
              className="bg-surface-container dark:bg-inverse-surface/20 p-5 rounded-2xl border border-outline-variant/30 flex items-center gap-4 shadow-sm hover:scale-[1.01] transition-transform duration-300 cursor-pointer"
              onClick={() => navigate('/leitura')}
            >
              <div className="w-12 h-12 bg-white dark:bg-surface-container-high rounded-xl flex items-center justify-center text-primary shadow-sm text-xl">
                <span className="material-symbols-outlined">timer</span>
              </div>
              <div>
                <p className="text-xs text-on-surface-variant font-medium">Tempo de estudo</p>
                <p className="font-bold text-body-lg text-on-surface">44 horas</p>
              </div>
            </div>

            <div 
              className="bg-surface-container dark:bg-inverse-surface/20 p-5 rounded-2xl border border-outline-variant/30 flex items-center gap-4 shadow-sm hover:scale-[1.01] transition-transform duration-300 cursor-pointer"
              onClick={() => navigate('/habilidades')}
            >
              <div className="w-12 h-12 bg-white dark:bg-surface-container-high rounded-xl flex items-center justify-center text-secondary shadow-sm text-xl">
                <span className="material-symbols-outlined">emoji_events</span>
              </div>
              <div>
                <p className="text-xs text-on-surface-variant font-medium">Badges conquistadas</p>
                <p className="font-bold text-body-lg text-on-surface">{badgesConquistadas} conquistas</p>
              </div>
            </div>

            <div 
              className="bg-surface-container dark:bg-inverse-surface/20 p-5 rounded-2xl border border-outline-variant/30 flex items-center gap-4 shadow-sm hover:scale-[1.01] transition-transform duration-300 cursor-pointer"
              onClick={() => navigate('/habilidades')}
            >
              <div className="w-12 h-12 bg-white dark:bg-surface-container-high rounded-xl flex items-center justify-center text-tertiary shadow-sm text-xl">
                <span className="material-symbols-outlined">task_alt</span>
              </div>
              <div>
                <p className="text-xs text-on-surface-variant font-medium">Progresso Habilidades</p>
                <p className="font-bold text-body-lg text-on-surface">{mediaProgressoHabilidades}% Geral</p>
              </div>
            </div>

            <div 
              className="bg-surface-container dark:bg-inverse-surface/20 p-5 rounded-2xl border border-outline-variant/30 flex items-center gap-4 shadow-sm hover:scale-[1.01] transition-transform duration-300 cursor-pointer"
              onClick={() => navigate('/habilidades')}
            >
              <div className="w-12 h-12 bg-white dark:bg-surface-container-high rounded-xl flex items-center justify-center text-error shadow-sm text-xl">
                <span className="material-symbols-outlined text-amber-500">local_fire_department</span>
              </div>
              <div>
                <p className="text-xs text-on-surface-variant font-medium">Streak Consecutivo</p>
                <p className="font-bold text-body-lg text-on-surface">{estatisticas.streak} dias</p>
              </div>
            </div>
          </motion.section>
        </main>
      </div>



      {/* Modal de Perfil */}
      <AnimatePresence>
        {showPerfil && (
          <Suspense fallback={null}>
            <ModalPerfil
              isOpen={showPerfil}
              onClose={handleClosePerfil}
              user={user}
              dadosAluno={dadosAluno}
              nome={nome}
              foto={foto}
              onUpdateProfile={handleUpdateProfile}
            />
          </Suspense>
        )}
      </AnimatePresence>

      {/* Modal de Relatório de Bug */}
      <AnimatePresence>
        {showBugReport && (
          <Suspense fallback={null}>
            <RelatorioBug onClose={handleCloseBugReport} />
          </Suspense>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;
