import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { db, auth } from '../firebaseConfig';
import { 
  collection, 
  query, 
  where, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  doc,
  onSnapshot
} from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { 
  Server, Wrench, HardDrive, Cpu, Scale, Shield, Plus, ArrowLeft, 
  Lightbulb, Trash2, Play, Pause, Edit3, Sparkles, X, Check, Target, Clock, Calendar
} from 'lucide-react';
import './Habilidades.css';
import Loading from './Loading';
import HabilidadesBg from '../IMG/HABILIDADES.jpg';

const Habilidades = () => {
  const navigate = useNavigate();
  const [user, loading, error] = useAuthState(auth);
  
  const [habilidades, setHabilidades] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [seeding, setSeeding] = useState(false);

  // Flow control states
  const [showDashboard, setShowDashboard] = useState(false);
  const [selectedSkillId, setSelectedSkillId] = useState(null);
  const [pulsingAxisIndex, setPulsingAxisIndex] = useState(null);
  const [justAddedId, setJustAddedId] = useState(null);
  
  // Category tabs filter
  const [filtroCategoria, setFiltroCategoria] = useState('Todas');

  // FAB addition form state
  const [showFabForm, setShowFabForm] = useState(false);
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillCategory, setNewSkillCategory] = useState('Estudo');
  const [newSkillLevel, setNewSkillLevel] = useState('Iniciante');

  // Detail panel editing state
  const [isEditingDetail, setIsEditingDetail] = useState(false);
  const [editNome, setEditNome] = useState('');
  const [editDescricao, setEditDescricao] = useState('');
  const [editCategoria, setEditCategoria] = useState('Estudo');
  const [editNivel, setEditNivel] = useState('Iniciante');
  const [editMeta, setEditMeta] = useState('');
  const [editPrazo, setEditPrazo] = useState('1 mês');
  const [editDataInicio, setEditDataInicio] = useState('');

  const categorias = ['Estudo', 'Produtividade', 'Criatividade', 'Saúde', 'Social'];
  const niveis = ['Iniciante', 'Intermediário', 'Avançado'];
  const prazos = ['1 dia', '1 semana', '2 semanas', '1 mês', '3 meses', '6 meses', '1 ano'];

  // Radar axis definitions
  const radarAxes = [
    { name: 'Lógica & Algoritmos', categories: ['Estudo'] },
    { name: 'Desenvolvimento Back-end', categories: ['Produtividade'] },
    { name: 'Infraestrutura & Hardware', categories: ['Criatividade'] },
    { name: 'Gestão & Cuidados', categories: ['Saúde', 'Social'] }
  ];

  // Helper to calculate completion date based on term
  const calcularDataConclusao = (dataInicio, prazo) => {
    const data = new Date(dataInicio);
    switch (prazo) {
      case '1 dia': data.setDate(data.getDate() + 1); break;
      case '1 semana': data.setDate(data.getDate() + 7); break;
      case '2 semanas': data.setDate(data.getDate() + 14); break;
      case '1 mês': data.setMonth(data.getMonth() + 1); break;
      case '3 meses': data.setMonth(data.getMonth() + 3); break;
      case '6 meses': data.setMonth(data.getMonth() + 6); break;
      case '1 ano': data.setFullYear(data.getFullYear() + 1); break;
      default: data.setMonth(data.getMonth() + 1);
    }
    return data.toISOString().split('T')[0];
  };

  // No-op (previously seedDefaultSkills)

  // Firebase Firestore Realtime sync
  useEffect(() => {
    if (!user) {
      setCarregando(false);
      return;
    }

    const habilidadesQuery = query(
      collection(db, 'habilidades'),
      where('userId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(habilidadesQuery, (snapshot) => {
      const habilidadesData = [];
      snapshot.docs.forEach(doc => {
        habilidadesData.push({ id: doc.id, ...doc.data() });
      });
      setHabilidades(habilidadesData);
      setCarregando(false);
    }, (error) => {
      console.error('Erro ao conectar Firestore:', error);
      setCarregando(false);
    });

    return () => unsubscribe();
  }, [user]);

  // One-time cleanup trigger to clear old seeded skills for this user
  useEffect(() => {
    const clearDatabaseOnce = async () => {
      if (!user || habilidades.length === 0) return;
      const hasCleared = localStorage.getItem('learnhub_cleared_seed_v3') === 'true';
      if (!hasCleared) {
        console.log('🧹 Limpando dados semeados antigos...');
        const seedNames = [
          'Java & Spring Boot',
          'Manutenção de Impressoras',
          'Ventoy & Sergei Strelec',
          'Lógica de Programação',
          'Cálculos de Nutrição Felina',
          'Ferramentas de Segurança'
        ];
        const seedsToClear = habilidades.filter(h => seedNames.includes(h.nome));
        for (const h of seedsToClear) {
          await deletarHabilidadeFirebase(h.id);
        }
        localStorage.setItem('learnhub_cleared_seed_v3', 'true');
        console.log('🧹 Limpeza concluída!');
      }
    };
    if (!carregando) {
      clearDatabaseOnce();
    }
  }, [carregando, user, habilidades]);

  // Handle enter transitions
  const handleEnterDashboard = () => {
    setShowDashboard(true);
    sessionStorage.setItem('learnhub_habilidades_entered', 'true');
  };

  // Firebase mutations wrapper
  const salvarHabilidadeFirebase = async (habilidade) => {
    try {
      const docRef = await addDoc(collection(db, 'habilidades'), {
        ...habilidade,
        userId: user.uid,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      return docRef.id;
    } catch (error) {
      console.error('Erro ao salvar no Firebase:', error);
      return null;
    }
  };

  const atualizarHabilidadeFirebase = async (id, dadosAtualizados) => {
    try {
      const docRef = doc(db, 'habilidades', id);
      await updateDoc(docRef, {
        ...dadosAtualizados,
        updatedAt: new Date()
      });
      return true;
    } catch (error) {
      console.error('Erro ao atualizar no Firebase:', error);
      return false;
    }
  };

  const deletarHabilidadeFirebase = async (id) => {
    try {
      const docRef = doc(db, 'habilidades', id);
      await deleteDoc(docRef);
      return true;
    } catch (error) {
      console.error('Erro ao deletar do Firebase:', error);
      return false;
    }
  };

  // Action Handlers
  const handleCreateSkillSubmit = async (e) => {
    e.preventDefault();
    if (!user || !newSkillName.trim()) return;

    setSalvando(true);
    const dataInicioStr = new Date().toISOString().split('T')[0];
    const initialProgress = newSkillLevel === 'Avançado' ? 80 : newSkillLevel === 'Intermediário' ? 45 : 10;
    
    const skillObj = {
      nome: newSkillName.trim(),
      categoria: newSkillCategory,
      nivel: newSkillLevel,
      descricao: `Desenvolver competências em ${newSkillName.trim()}.`,
      meta: 'Mapear progresso e aplicar no dia a dia.',
      prazo: '1 mês',
      dataInicio: dataInicioStr,
      dataConclusao: calcularDataConclusao(dataInicioStr, '1 mês'),
      progresso: initialProgress,
      ativo: true
    };

    const docId = await salvarHabilidadeFirebase(skillObj);
    if (docId) {
      setJustAddedId(docId);
      setSelectedSkillId(docId);
      setShowFabForm(false);
      setNewSkillName('');
      // Trigger a pulse on the axis corresponding to the new skill category
      const axisIndex = radarAxes.findIndex(a => a.categories.includes(newSkillCategory));
      if (axisIndex !== -1) {
        setPulsingAxisIndex(axisIndex);
        setTimeout(() => setPulsingAxisIndex(null), 1000);
      }
      setTimeout(() => setJustAddedId(null), 3000);
    } else {
      alert('Não foi possível salvar a nova habilidade.');
    }
    setSalvando(false);
  };

  const handleUpdateProgress = async (id, delta) => {
    const skill = habilidades.find(h => h.id === id);
    if (!skill) return;
    const newProg = Math.max(0, Math.min(100, (skill.progresso || 0) + delta));
    
    // Auto adjust levels based on progress thresholds
    let newLvl = skill.nivel;
    if (newProg >= 75) newLvl = 'Avançado';
    else if (newProg >= 30) newLvl = 'Intermediário';
    else newLvl = 'Iniciante';

    await atualizarHabilidadeFirebase(id, { progresso: newProg, nivel: newLvl });
  };

  const handleToggleStatus = async (id) => {
    const skill = habilidades.find(h => h.id === id);
    if (!skill) return;
    await atualizarHabilidadeFirebase(id, { ativo: !skill.ativo });
  };

  const handleDeleteSkill = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta habilidade?')) {
      const sucesso = await deletarHabilidadeFirebase(id);
      if (sucesso) {
        if (selectedSkillId === id) setSelectedSkillId(null);
      }
    }
  };

  // Open edit mode in detail panel
  const handleOpenEditDetail = (skill) => {
    setEditNome(skill.nome);
    setEditDescricao(skill.descricao || '');
    setEditCategoria(skill.categoria);
    setEditNivel(skill.nivel);
    setEditMeta(skill.meta || '');
    setEditPrazo(skill.prazo || '1 mês');
    setEditDataInicio(skill.dataInicio || new Date().toISOString().split('T')[0]);
    setIsEditingDetail(true);
  };

  const handleSaveEditDetail = async (e) => {
    e.preventDefault();
    if (!selectedSkillId) return;

    setSalvando(true);
    const selectedSkill = habilidades.find(h => h.id === selectedSkillId);
    if (!selectedSkill) return;

    const dataConclusao = calcularDataConclusao(editDataInicio, editPrazo);
    
    const updated = {
      nome: editNome,
      descricao: editDescricao,
      categoria: editCategoria,
      nivel: editNivel,
      meta: editMeta,
      prazo: editPrazo,
      dataInicio: editDataInicio,
      dataConclusao
    };

    const sucesso = await atualizarHabilidadeFirebase(selectedSkillId, updated);
    if (sucesso) {
      setIsEditingDetail(false);
      // Trigger a pulse on the axis corresponding to the edited category
      const axisIndex = radarAxes.findIndex(a => a.categories.includes(editCategoria));
      if (axisIndex !== -1) {
        setPulsingAxisIndex(axisIndex);
        setTimeout(() => setPulsingAxisIndex(null), 1000);
      }
    } else {
      alert('Erro ao atualizar as informações.');
    }
    setSalvando(false);
  };

  // Node Clicking Sync Handlers
  const handleNodeClick = (skill) => {
    setSelectedSkillId(skill.id);
    setIsEditingDetail(false);
    
    // Find matching axis
    const axisIndex = radarAxes.findIndex(a => a.categories.includes(skill.categoria));
    if (axisIndex !== -1) {
      setPulsingAxisIndex(axisIndex);
      setTimeout(() => setPulsingAxisIndex(null), 1000);
    }
  };

  // Computed Values
  const selectedSkill = useMemo(() => {
    return habilidades.find(h => h.id === selectedSkillId) || null;
  }, [habilidades, selectedSkillId]);

  // Filter skills displayed in constellation
  const habilidadesFiltradas = useMemo(() => {
    return filtroCategoria === 'Todas'
      ? habilidades
      : habilidades.filter(h => h.categoria === filtroCategoria);
  }, [habilidades, filtroCategoria]);

  // Compute average category progress for radar chart axes
  const radarLevels = useMemo(() => {
    return radarAxes.map(axis => {
      const relevantSkills = habilidades.filter(h => axis.categories.includes(h.categoria) && h.ativo);
      if (relevantSkills.length === 0) return 0.1;
      const sum = relevantSkills.reduce((acc, c) => acc + (c.progresso || 0), 0);
      return Math.max(0.1, (sum / relevantSkills.length) / 100);
    });
  }, [habilidades]);

  // Mapping coordinate system for tag constellation positioning
  const getSkillCoordinates = (skill, index, totalInCat) => {
    // Fixed curated positions for the first 6 elements
    const fixedPositions = {
      'Estudo': [
        { x: 20, y: 25 },
        { x: 38, y: 15 },
        { x: 30, y: 38 }
      ],
      'Produtividade': [
        { x: 78, y: 20 },
        { x: 60, y: 16 },
        { x: 68, y: 38 }
      ],
      'Criatividade': [
        { x: 22, y: 75 },
        { x: 38, y: 84 },
        { x: 18, y: 88 }
      ],
      'Saúde': [
        { x: 74, y: 70 },
        { x: 86, y: 78 }
      ],
      'Social': [
        { x: 62, y: 84 },
        { x: 80, y: 88 }
      ]
    };

    const cat = skill.categoria;
    const curated = fixedPositions[cat] || [];
    if (index < curated.length) {
      return curated[index];
    }

    // Dynamic spiral algorithm for additional skills
    let cx = 50, cy = 50;
    if (cat === 'Estudo') { cx = 25; cy = 25; }
    else if (cat === 'Produtividade') { cx = 75; cy = 25; }
    else if (cat === 'Criatividade') { cx = 25; cy = 75; }
    else { cx = 75; cy = 75; } // Saúde & Social

    const goldenAngle = 2.39996;
    const spiralIndex = index - curated.length;
    const angle = (spiralIndex * goldenAngle) + 0.6;
    const radius = 16 + (spiralIndex * 4);
    
    return {
      x: Math.max(8, Math.min(92, cx + radius * Math.cos(angle))),
      y: Math.max(8, Math.min(92, cy + radius * Math.sin(angle)))
    };
  };

  // Map siblings and compile absolute coordinates
  const skillPositionsMap = useMemo(() => {
    const map = {};
    categorias.forEach(cat => {
      const sibs = habilidadesFiltradas.filter(h => h.categoria === cat);
      sibs.forEach((skill, idx) => {
        map[skill.id] = getSkillCoordinates(skill, idx, sibs.length);
      });
    });
    return map;
  }, [habilidadesFiltradas]);

  // SVG lines connecting siblings in the constellation
  const renderConnections = () => {
    const paths = [];
    categorias.forEach(cat => {
      const sibs = habilidadesFiltradas.filter(h => h.categoria === cat);
      for (let i = 0; i < sibs.length - 1; i++) {
        const s1 = sibs[i];
        const s2 = sibs[i+1];
        const p1 = skillPositionsMap[s1.id];
        const p2 = skillPositionsMap[s2.id];

        if (p1 && p2) {
          const mx = (p1.x + p2.x) / 2;
          const my = (p1.y + p2.y) / 2;
          const dx = p2.x - p1.x;
          const dy = p2.y - p1.y;
          const len = Math.sqrt(dx * dx + dy * dy);
          const qx = mx + (dy / (len || 1)) * 6;
          const qy = my - (dx / (len || 1)) * 6;

          const isMasteredConn = (s1.progresso >= 75) && (s2.progresso >= 75);
          const stroke = isMasteredConn ? '#9CA3AF' : '#111111';
          const opacity = isMasteredConn ? 0.35 : 0.08;
          const dash = isMasteredConn ? 'none' : '4 4';

          paths.push(
            <path
              key={`conn-${s1.id}-${s2.id}`}
              d={`M ${p1.x}% ${p1.y}% Q ${qx}% ${qy}% ${p2.x}% ${p2.y}%`}
              fill="none"
              stroke={stroke}
              strokeOpacity={opacity}
              strokeWidth={isMasteredConn ? 2.5 : 1.2}
              strokeDasharray={dash}
              style={isMasteredConn ? { filter: 'drop-shadow(0 0 3px rgba(156,163,175,0.4))' } : {}}
            />
          );
        }
      }
    });
    return paths;
  };

  // Get matching icon based on skill name
  const getSkillIcon = (name) => {
    const n = name.toLowerCase();
    if (n.includes('java') || n.includes('spring') || n.includes('api') || n.includes('back-end') || n.includes('servidor')) {
      return Server;
    }
    if (n.includes('impressora') || n.includes('manutenção') || n.includes('ferramenta') || n.includes('chave')) {
      return Wrench;
    }
    if (n.includes('ventoy') || n.includes('strelec') || n.includes('pendrive') || n.includes('diagnóstico') || n.includes('sistema')) {
      return HardDrive;
    }
    if (n.includes('lógica') || n.includes('programação') || n.includes('algoritmo') || n.includes('código')) {
      return Cpu;
    }
    if (n.includes('nutrição') || n.includes('felina') || n.includes('balança') || n.includes('cálculo') || n.includes('dieta')) {
      return Scale;
    }
    if (n.includes('segurança') || n.includes('escudo') || n.includes('proteção') || n.includes('harden')) {
      return Shield;
    }
    return Sparkles;
  };

  // Get tips based on selected skill progress
  const getSelectedSkillTips = (skill) => {
    if (!skill) return [];
    const tipsConfig = {
      'Estudo': {
        'Iniciante': [
          'Agende sessões curtas de 15 minutos focadas no básico.',
          'Escreva resumos curtos no Notion sobre a matéria do dia.'
        ],
        'Intermediário': [
          'Use a técnica Pomodoro com 25 minutos de imersão total.',
          'Consolide explicandos os tópicos aprendidos para outra pessoa.'
        ],
        'Avançado': [
          'Ensine os conceitos ou desenvolva soluções práticas com o tema.',
          'Aplique sistemas de repetição espaçada (ex: Anki).'
        ]
      },
      'Produtividade': {
        'Iniciante': [
          'Mantenha uma lista fixa com apenas 3 tarefas cruciais por dia.',
          'Desative as notificações do smartphone durante o fluxo.'
        ],
        'Intermediário': [
          'Classifique afazeres pela Matriz Eisenhower (Urgente vs Importante).',
          'Revise seus gargalos de tempo no final da semana.'
        ],
        'Avançado': [
          'Automatize microtarefas repetitivas usando scripts ou integrações.',
          'Implemente a arquitetura e fluxos do método GTD (Get Things Done).'
        ]
      },
      'Saúde': {
        'Iniciante': [
          'Realize caminhadas de 10 minutos após o almoço.',
          'Beba um copo de água cheio ao acordar.'
        ],
        'Intermediário': [
          'Mapeie e planeje suas refeições com antecedência na semana.',
          'Reserve 10 minutos diários para práticas de mindfulness.'
        ],
        'Avançado': [
          'Formule treinos progressivos segmentados.',
          'Monitore marcadores de sono e ajuste hábitos noturnos.'
        ]
      },
      'Criatividade': {
        'Iniciante': [
          'Crie rabiscos ou anote 3 ideias no papel sem julgamentos.',
          'Separe 10 minutos para experimentar novas estéticas visuais.'
        ],
        'Intermediário': [
          'Busque referências cruzadas fora do seu nicho de atuação.',
          'Una disciplinas diferentes num mesmo projeto de portfólio.'
        ],
        'Avançado': [
          'Publique criações e colete feedbacks ativos da comunidade.',
          'Desenvolva projetos de longo prazo com metas de entrega.'
        ]
      },
      'Social': {
        'Iniciante': [
          'Cumprimente ativamente um colega diferente na rotina diária.',
          'Foque em escuta ativa durante conversas casuais.'
        ],
        'Intermediário': [
          'Participe de fóruns e encontros de comunidade de interesse comum.',
          'Ofereça colaboração prática voluntária em pequenos projetos.'
        ],
        'Avançado': [
          'Lidere debates ou mentorias na sua comunidade local.',
          'Pratique a comunicação empática e inteligência emocional em crises.'
        ]
      }
    };

    const catTips = tipsConfig[skill.categoria] || tipsConfig['Estudo'];
    return catTips[skill.nivel] || catTips['Iniciante'];
  };

  // Render loadings / auth alerts
  if (loading) {
    return <Loading message="Conectando à sua teia de conhecimentos..." />;
  }

  if (!user) {
    return (
      <div className="modulo-habilidades-wrapper flex items-center justify-center p-8">
        <div className="habilidade-no-auth">
          <h2>Acesso Restrito</h2>
          <p>Faça login na plataforma LearnHub para gerenciar e visualizar suas habilidades estruturadas.</p>
          <button onClick={() => navigate('/login')}>Ir para o Login</button>
        </div>
      </div>
    );
  }

  // Precomputed coordinates of SVG endpoints for radar pulsing animations
  const svgCenter = 160;
  const svgRadius = 100;
  const getAxisEndCoords = (idx) => {
    const angle = -Math.PI / 2 + (idx * Math.PI / 2);
    return {
      x: svgCenter + svgRadius * Math.cos(angle),
      y: svgCenter + svgRadius * Math.sin(angle)
    };
  };

  // Point positions of radar polygon representing skill categories
  const polygonPoints = radarLevels.map((val, idx) => {
    const angle = -Math.PI / 2 + (idx * Math.PI / 2);
    const r = svgRadius * val;
    return `${svgCenter + r * Math.cos(angle)},${svgCenter + r * Math.sin(angle)}`;
  }).join(' ');

  return (
    <div className="modulo-habilidades-wrapper">
      <AnimatePresence mode="wait">
        
        {/* LANDING PAGE INTRO SCREEN */}
        {!showDashboard ? (
          <motion.div
            key="landing"
            className="habilidades-landing"
            exit={{ 
              opacity: 0, 
              scale: 1.08, 
              filter: 'blur(15px)',
              transition: { duration: 0.5, ease: [0.43, 0.13, 0.23, 0.96] }
            }}
          >
            <img 
              src={HabilidadesBg} 
              alt="Habilidades Background" 
              className="habilidades-landing-bg" 
            />
            <div className="habilidades-landing-overlay" />
            
            <div className="habilidades-landing-content">
              <motion.span 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 0.8, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-[11px] text-[#9CA3AF] font-bold uppercase tracking-[0.25em]"
              >
                LearnHub Mapeamento
              </motion.span>
              
              <motion.h1 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 50, delay: 0.3 }}
                className="habilidades-landing-title"
              >
                Habilidades
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.8 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="habilidades-landing-subtitle"
              >
                Mapeie seu arsenal técnico, controle o nível de maestria em tempo real e domine novas esferas de conhecimento.
              </motion.p>
              
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', stiffness: 100, delay: 0.6 }}
                className="habilidades-landing-btn"
                onClick={handleEnterDashboard}
              >
                Acessar Meu Arsenal
              </motion.button>
            </div>
          </motion.div>
        ) : (
          
          /* PREMIUM DASHBOARD VIEW */
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, y: 20, filter: 'blur(5px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="w-full"
          >
            {/* Header section */}
            <header className="habilidades-main-header">
              <div className="habilidades-colossal-title-wrapper">
                <h2 className="habilidades-colossal-title">HABILIDADES</h2>
                <span className="habilidades-minimalist-subtitle">O seu arsenal em constante evolução.</span>
              </div>
              <button 
                className="habilidades-back-dashboard-btn"
                onClick={() => navigate('/dashboard')}
              >
                <ArrowLeft size={15} /> Voltar ao Painel
              </button>
            </header>

            {/* Main Area layout split view */}
            <main className="habilidades-dashboard-grid">
              
              {/* LEFT COLUMN: Radar Chart + Details Card */}
              <div className="habilidades-left-col">
                
                {/* Levitating Radar Card */}
                <div className="habilidades-radar-card">
                  <svg viewBox="0 0 320 320" className="w-full h-full p-6">
                    {/* Dark grid Concentric Circles */}
                    <circle cx="160" cy="160" r="33" fill="none" stroke="rgba(255, 255, 255, 0.04)" strokeWidth="1" />
                    <circle cx="160" cy="160" r="66" fill="none" stroke="rgba(255, 255, 255, 0.04)" strokeWidth="1" />
                    <circle cx="160" cy="160" r="100" fill="none" stroke="rgba(255, 255, 255, 0.06)" strokeWidth="1" />

                    {/* Standard Axis lines */}
                    {radarAxes.map((axis, idx) => {
                      const end = getAxisEndCoords(idx);
                      const isPulsing = pulsingAxisIndex === idx;
                      return (
                        <g key={idx}>
                          {/* Inner line */}
                          <line
                            x1="160"
                            y1="160"
                            x2={end.x}
                            y2={end.y}
                            stroke={isPulsing ? '#9CA3AF' : 'rgba(255, 255, 255, 0.15)'}
                            strokeWidth={isPulsing ? 2.5 : 1}
                            className="transition-colors duration-300"
                          />
                          {/* Pulsing overlay effect */}
                          {isPulsing && (
                            <motion.line
                              x1="160"
                              y1="160"
                              x2={end.x}
                              y2={end.y}
                              stroke="#9CA3AF"
                              strokeWidth={4.5}
                              initial={{ pathLength: 0, opacity: 1 }}
                              animate={{ pathLength: 1, opacity: 0 }}
                              transition={{ duration: 0.6, ease: 'easeOut' }}
                            />
                          )}
                        </g>
                      );
                    })}

                    {/* Dynamic green neon polygon with respiration loop */}
                    <motion.polygon
                      points={polygonPoints}
                      fill="rgba(156, 163, 175, 0.22)"
                      stroke="#9CA3AF"
                      strokeWidth="2.5"
                      animate={{ 
                        points: polygonPoints,
                        fillOpacity: [0.22, 0.35, 0.22] 
                      }}
                      transition={{ 
                        points: { type: 'spring', stiffness: 70, damping: 13 },
                        fillOpacity: { repeat: Infinity, duration: 4, ease: 'easeInOut' }
                      }}
                      style={{ filter: 'drop-shadow(0 0 6px rgba(156, 163, 175, 0.5))' }}
                    />

                    {/* Outer anchor points on the polygon */}
                    {radarLevels.map((val, idx) => {
                      const angle = -Math.PI / 2 + (idx * Math.PI / 2);
                      const r = svgRadius * val;
                      const px = svgCenter + r * Math.cos(angle);
                      const py = svgCenter + r * Math.sin(angle);
                      return (
                        <circle
                          key={idx}
                          cx={px}
                          cy={py}
                          r="4"
                          fill="#FFFFFF"
                          stroke="#9CA3AF"
                          strokeWidth="1.5"
                          style={{ filter: 'drop-shadow(0 0 3px rgba(156,163,175,0.8))' }}
                        />
                      );
                    })}

                    {/* Axis Labels positioning */}
                    {radarAxes.map((axis, idx) => {
                      const angle = -Math.PI / 2 + (idx * Math.PI / 2);
                      const labelRadius = 115;
                      const lx = svgCenter + labelRadius * Math.cos(angle);
                      const ly = svgCenter + labelRadius * Math.sin(angle);
                      
                      let textAnchor = 'middle';
                      if (idx === 1) textAnchor = 'start';
                      if (idx === 3) textAnchor = 'end';

                      const isPulsing = pulsingAxisIndex === idx;

                      return (
                        <text
                          key={idx}
                          x={lx}
                          y={ly + (idx === 0 ? -4 : idx === 2 ? 10 : 3)}
                          fill={isPulsing ? '#9CA3AF' : '#888888'}
                          fontSize="8.5"
                          fontWeight="700"
                          textAnchor={textAnchor}
                          className="transition-colors duration-300 uppercase tracking-wider font-sans select-none"
                          style={isPulsing ? { textShadow: '0 0 5px rgba(156,163,175,0.5)' } : {}}
                        >
                          {axis.name}
                        </text>
                      );
                    })}
                  </svg>
                </div>

                {/* DETAILS PANEL / GENERAL PROFILE SUMMARY */}
                <div className="relative">
                  <AnimatePresence mode="wait">
                    {selectedSkill ? (
                      
                      /* SKILL DETAILS CARD */
                      <motion.div
                        key={`detail-${selectedSkill.id}`}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -15 }}
                        transition={{ duration: 0.25 }}
                        className="habilidade-detail-card"
                      >
                        {/* Detail layout standard view */}
                        {!isEditingDetail ? (
                          <>
                            <div className="habilidade-detail-header">
                              <div className="habilidade-detail-title-group">
                                <h3>{selectedSkill.nome}</h3>
                                <span className="habilidade-detail-category">
                                  {selectedSkill.categoria}
                                </span>
                              </div>
                              <span 
                                className="habilidade-detail-level-badge"
                                style={{ 
                                  backgroundColor: selectedSkill.nivel === 'Avançado' ? '#9CA3AF' : selectedSkill.nivel === 'Intermediário' ? '#6B7280' : '#374151',
                                  color: '#FFFFFF'
                                }}
                              >
                                {selectedSkill.nivel}
                              </span>
                            </div>

                            <p className="habilidade-detail-desc">
                              {selectedSkill.descricao || 'Nenhuma descrição adicionada.'}
                            </p>

                            {selectedSkill.meta && (
                              <div className="habilidade-detail-meta">
                                <strong>Objetivo:</strong> {selectedSkill.meta}
                              </div>
                            )}

                            {/* Progress bar controller */}
                            <div className="habilidade-detail-progress-section">
                              <div className="habilidade-detail-progress-label">
                                <span>Progresso da Maestria</span>
                                <span className="text-[#9CA3AF]">{selectedSkill.progresso || 0}%</span>
                              </div>
                              <div className="habilidade-detail-progress-bar-bg">
                                <div 
                                  className="habilidade-detail-progress-bar-fill" 
                                  style={{ width: `${selectedSkill.progresso || 0}%` }}
                                />
                              </div>
                              <div className="habilidade-detail-progress-controls">
                                <button 
                                  disabled={!selectedSkill.ativo || (selectedSkill.progresso || 0) <= 0}
                                  className="habilidade-detail-progress-btn"
                                  onClick={() => handleUpdateProgress(selectedSkill.id, -10)}
                                >
                                  -10%
                                </button>
                                <button 
                                  disabled={!selectedSkill.ativo || (selectedSkill.progresso || 0) >= 100}
                                  className="habilidade-detail-progress-btn"
                                  onClick={() => handleUpdateProgress(selectedSkill.id, 10)}
                                >
                                  +10%
                                </button>
                              </div>
                            </div>

                            {/* Chronology info */}
                            <div className="habilidade-detail-dates">
                              <div>
                                <strong>INÍCIO</strong>
                                <div>{selectedSkill.dataInicio ? new Date(selectedSkill.dataInicio).toLocaleDateString('pt-BR') : '-'}</div>
                              </div>
                              <div>
                                <strong>PREVISÃO</strong>
                                <div>{selectedSkill.dataConclusao ? new Date(selectedSkill.dataConclusao).toLocaleDateString('pt-BR') : '-'}</div>
                              </div>
                            </div>

                            {/* Micro tips list */}
                            <div className="habilidade-detail-tips-box">
                              <span className="habilidade-detail-tips-title">
                                <Lightbulb size={12} /> Sugestões de Evolução
                              </span>
                              <div className="habilidade-detail-tips-list">
                                {getSelectedSkillTips(selectedSkill).map((tip, idx) => (
                                  <div key={idx} className="habilidade-detail-tip-item">
                                    <Check size={10} />
                                    <span>{tip}</span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Action drawers */}
                            <div className="habilidade-detail-actions">
                              <button 
                                className="habilidade-detail-action-btn"
                                onClick={() => handleOpenEditDetail(selectedSkill)}
                              >
                                <Edit3 size={12} /> Editar Habilidade
                              </button>
                              <button 
                                className={`habilidade-detail-action-btn btn-status-toggle`}
                                onClick={() => handleToggleStatus(selectedSkill.id)}
                              >
                                {selectedSkill.ativo ? <Pause size={12} /> : <Play size={12} />}
                                {selectedSkill.ativo ? 'Pausar' : 'Reativar'}
                              </button>
                              <button 
                                className="habilidade-detail-action-btn btn-delete"
                                onClick={() => handleDeleteSkill(selectedSkill.id)}
                              >
                                <Trash2 size={12} /> Excluir
                              </button>
                            </div>
                          </>
                        ) : (
                          
                          /* EDIT FORM WITHIN CARD */
                          <form onSubmit={handleSaveEditDetail} className="flex flex-col gap-3">
                            <h4 className="text-sm font-extrabold uppercase text-[#9CA3AF] m-0">Editar Habilidade</h4>
                            
                            <div className="habilidade-fab-form-field">
                              <label>Habilidade</label>
                              <input 
                                type="text" 
                                value={editNome} 
                                onChange={(e) => setEditNome(e.target.value)} 
                                required
                              />
                            </div>

                            <div className="habilidade-fab-form-field">
                              <label>Descrição</label>
                              <textarea 
                                value={editDescricao} 
                                onChange={(e) => setEditDescricao(e.target.value)} 
                                rows={2}
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <div className="habilidade-fab-form-field">
                                <label>Categoria</label>
                                <select value={editCategoria} onChange={(e) => setEditCategoria(e.target.value)}>
                                  {categorias.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                  ))}
                                </select>
                              </div>
                              <div className="habilidade-fab-form-field">
                                <label>Nível</label>
                                <select value={editNivel} onChange={(e) => setEditNivel(e.target.value)}>
                                  {niveis.map(lvl => (
                                    <option key={lvl} value={lvl}>{lvl}</option>
                                  ))}
                                </select>
                              </div>
                            </div>

                            <div className="habilidade-fab-form-field">
                              <label>Meta / Objetivo</label>
                              <input 
                                type="text" 
                                value={editMeta} 
                                onChange={(e) => setEditMeta(e.target.value)} 
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <div className="habilidade-fab-form-field">
                                <label>Prazo</label>
                                <select value={editPrazo} onChange={(e) => setEditPrazo(e.target.value)}>
                                  {prazos.map(pr => (
                                    <option key={pr} value={pr}>{pr}</option>
                                  ))}
                                </select>
                              </div>
                              <div className="habilidade-fab-form-field">
                                <label>Data Início</label>
                                <input 
                                  type="date" 
                                  value={editDataInicio} 
                                  onChange={(e) => setEditDataInicio(e.target.value)}
                                  required
                                />
                              </div>
                            </div>

                            <div className="flex gap-2 mt-2">
                              <button 
                                type="submit" 
                                className="habilidade-fab-form-submit flex-1"
                                disabled={salvando}
                              >
                                {salvando ? 'Salvando...' : 'Salvar Alterações'}
                              </button>
                              <button 
                                type="button" 
                                className="habilidade-detail-action-btn flex-1"
                                onClick={() => setIsEditingDetail(false)}
                              >
                                Cancelar
                              </button>
                            </div>
                          </form>
                        )}
                      </motion.div>
                    ) : (
                      
                      /* PROFILE BRIEF SUMMARY CARD (When no node is active) */
                      <motion.div
                        key="no-selected"
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -15 }}
                        className="habilidade-profile-summary"
                      >
                        <h3>Meu Arsenal Geral</h3>
                        <p>
                          Clique em qualquer nó da constelação à direita para analisar as métricas individuais da habilidade, receber dicas personalizadas de estudo e atualizar o progresso de maestria.
                        </p>
                        <div className="border-t border-outline-variant/10 pt-4 flex flex-col gap-2">
                          <div className="flex justify-between text-xs font-semibold">
                            <span>Habilidades Cadastradas</span>
                            <span className="font-bold">{habilidades.length}</span>
                          </div>
                          <div className="flex justify-between text-xs font-semibold">
                            <span>Dominadas (Maestria $\ge 75\%$)</span>
                            <span className="font-bold text-[#9CA3AF]">{habilidades.filter(h => h.progresso >= 75).length}</span>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* RIGHT COLUMN: Constellation tags mapping */}
              <div className="habilidades-right-col">
                
                {/* Category filters bar */}
                <div className="habilidades-filter-tabs">
                  <button 
                    className={`habilidade-filter-tab ${filtroCategoria === 'Todas' ? 'active' : ''}`}
                    onClick={() => setFiltroCategoria('Todas')}
                  >
                    Todas
                  </button>
                  {categorias.map(cat => (
                    <button 
                      key={cat} 
                      className={`habilidade-filter-tab ${filtroCategoria === cat ? 'active' : ''}`}
                      onClick={() => setFiltroCategoria(cat)}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Constellation Canvas area */}
                <div className="habilidades-constellation-panel">
                  
                  {/* Background SVG connections drawer */}
                  <svg className="habilidades-constellation-svg">
                    {renderConnections()}
                  </svg>

                  {/* Absolute positioned floating node pills */}
                  <AnimatePresence>
                    {habilidadesFiltradas.map((skill, index) => {
                      const coords = skillPositionsMap[skill.id] || { x: 50, y: 50 };
                      const Icon = getSkillIcon(skill.nome);
                      const isNew = skill.id === justAddedId;
                      const isSelected = skill.id === selectedSkillId;
                      
                      // Node style hierarchy
                      let statusClass = 'status-estudo';
                      if ((skill.progresso || 0) >= 75) statusClass = 'status-dominado';
                      else if ((skill.progresso || 0) < 20) statusClass = 'status-alvo';

                      // Float animation variables
                      const floatDuration = 3.5 + (index % 3) * 0.8;
                      const floatOffset = index % 2 === 0 ? [0, -7, 0] : [0, -4, 0];

                      return (
                        <motion.div
                          key={skill.id}
                          className={`habilidade-node-pill ${statusClass}`}
                          style={{
                            left: `${coords.x}%`,
                            top: `${coords.y}%`,
                            opacity: skill.ativo ? 1 : 0.45,
                            borderWidth: isSelected ? '2px' : '1.5px',
                            borderColor: isSelected ? '#9CA3AF' : undefined,
                            boxShadow: isSelected ? '0 0 25px rgba(156, 163, 175, 0.4)' : undefined,
                          }}
                          initial={isNew ? { left: '85%', top: '85%', scale: 0.1, opacity: 0 } : { scale: 0.9, opacity: 0 }}
                          animate={{ 
                            left: `${coords.x}%`,
                            top: `${coords.y}%`,
                            scale: 1, 
                            opacity: 1,
                            y: floatOffset
                          }}
                          exit={{ scale: 0.8, opacity: 0 }}
                          whileHover={{ 
                            scale: 1.06, 
                            y: -10,
                            boxShadow: (skill.progresso || 0) >= 75 
                              ? '0 12px 30px rgba(156, 163, 175, 0.35)' 
                              : '0 12px 25px rgba(0, 0, 0, 0.25)',
                            transition: { duration: 0.2 }
                          }}
                          transition={isNew ? {
                            type: 'spring',
                            stiffness: 85,
                            damping: 10
                          } : {
                            y: {
                              repeat: Infinity,
                              duration: floatDuration,
                              ease: 'easeInOut'
                            },
                            default: { duration: 0.4 }
                          }}
                          onClick={() => handleNodeClick(skill)}
                        >
                          <Icon size={13} className="flex-shrink-0" />
                          <span>{skill.nome}</span>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                  
                  {/* Empty state overlay inside canvas */}
                  {habilidadesFiltradas.length === 0 && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 pointer-events-none select-none">
                      <Sparkles size={32} className="text-[#cccccc] mb-3 animate-pulse" />
                      <span className="text-sm font-bold text-[#111111] mb-1">
                        Sua Constelação está Vazia
                      </span>
                      <span className="text-xs text-[#888888] max-w-xs leading-relaxed">
                        Crie suas próprias habilidades clicando no botão de "+" no canto inferior direito para começar a mapear seu arsenal!
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </main>

            {/* FLOATING ACTION BUTTON (FAB) FOR ZERO-FRICTION ADDITION */}
            <div className="habilidade-fab-container">
              <AnimatePresence>
                {showFabForm && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8, y: 15 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8, y: 15 }}
                    transition={{ duration: 0.2 }}
                    className="habilidade-fab-form-card"
                  >
                    <h4>Nova Habilidade</h4>
                    <form onSubmit={handleCreateSkillSubmit} className="flex flex-col gap-2">
                      <div className="habilidade-fab-form-field">
                        <label>Nome da Habilidade</label>
                        <input 
                          type="text" 
                          value={newSkillName} 
                          onChange={(e) => setNewSkillName(e.target.value)} 
                          placeholder="Ex: React Native, Docker..." 
                          required
                          autoFocus
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <div className="habilidade-fab-form-field">
                          <label>Categoria</label>
                          <select 
                            value={newSkillCategory} 
                            onChange={(e) => setNewSkillCategory(e.target.value)}
                          >
                            {categorias.map(cat => (
                              <option key={cat} value={cat}>{cat}</option>
                            ))}
                          </select>
                        </div>
                        
                        <div className="habilidade-fab-form-field">
                          <label>Nível Inicial</label>
                          <select 
                            value={newSkillLevel} 
                            onChange={(e) => setNewSkillLevel(e.target.value)}
                          >
                            {niveis.map(lvl => (
                              <option key={lvl} value={lvl}>{lvl}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <button 
                        type="submit" 
                        className="habilidade-fab-form-submit mt-1" 
                        disabled={salvando || !newSkillName.trim()}
                      >
                        {salvando ? 'Criando...' : 'Adicionar à Teia'}
                      </button>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
              
              <button 
                className="habilidade-fab-trigger"
                onClick={() => setShowFabForm(!showFabForm)}
                style={{
                  backgroundColor: showFabForm ? '#4B5563' : '#333333',
                  color: '#FFFFFF',
                  boxShadow: showFabForm ? '0 8px 25px rgba(75, 85, 99, 0.4)' : '0 8px 25px rgba(51, 51, 51, 0.4)'
                }}
              >
                {showFabForm ? <X size={24} /> : <Plus size={28} strokeWidth={3} />}
              </button>
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Habilidades;