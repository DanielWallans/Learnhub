import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { auth, db } from '../firebaseConfig';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  setDoc,
  onStateChanged
} from 'firebase/firestore';
import { 
  Clock, 
  Target, 
  Briefcase, 
  Search, 
  Pencil, 
  Handshake, 
  Trophy, 
  X, 
  Clipboard, 
  ArrowLeft, 
  Trash2, 
  Plus, 
  Check, 
  ChevronRight, 
  AlertCircle,
  HelpCircle,
  CircleDot,
  BookOpen,
  Globe,
  Users,
  Code,
  FileText,
  Link
} from 'lucide-react';
import CarreiraBg from '../IMG/CARREIRA.jpg';
import Loading from './Loading';
import './carreira.css';

// Hexagon Checkpoint Component
const RoundedHexagon = ({ color, isActive, children, onClick, pulse }) => {
  const glowFilter = isActive ? `drop-shadow(0 0 15px ${color}aa)` : `drop-shadow(0 4px 10px rgba(0, 0, 0, 0.4))`;
  
  return (
    <motion.div
      className={`hexagon-wrapper ${pulse && isActive ? (color === '#34d399' ? 'pulse-glow-green' : 'pulse-glow-red') : ''}`}
      onClick={onClick}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.95 }}
      style={{ width: '80px', height: '92px' }}
    >
      <svg viewBox="0 0 100 115" className="w-full h-full" style={{ filter: glowFilter }}>
        <path
          d="M 50 4 C 53.5 4, 89.2 24.6, 92.5 26.5 C 95.8 28.4, 98 32, 98 35.8 L 98 81.2 C 98 85, 95.8 88.6, 92.5 90.5 C 89.2 92.4, 53.5 111, 50 111 C 46.5 111, 10.8 92.4, 7.5 90.5 C 4.2 88.6, 2 85, 2 81.2 L 2 35.8 C 2 32, 4.2 28.4, 7.5 26.5 C 10.8 24.6, 46.5 4, 50 4 Z"
          fill={isActive ? color : 'rgba(255, 255, 255, 0.08)'}
          stroke={isActive ? '#ffffff' : 'rgba(255, 255, 255, 0.15)'}
          strokeWidth="2.5"
          className="transition-all duration-300"
        />
      </svg>
      <div 
        className="absolute inset-0 flex flex-col items-center justify-center z-10" 
        style={{ color: isActive ? '#111827' : 'rgba(255, 255, 255, 0.6)' }}
      >
        {children}
      </div>
    </motion.div>
  );
};

export default function ModuloCarreira() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [introLoading, setIntroLoading] = useState(true);
  const [firebaseConnected, setFirebaseConnected] = useState(false);
  const [nome, setNome] = useState('');
  const [foto, setFoto] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setIntroLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  // Metas (Left side)
  const [metas, setMetas] = useState([]);
  
  // Candidaturas (Right side)
  const [candidaturas, setCandidaturas] = useState([]);
  const [selectedCandidaturaId, setSelectedCandidaturaId] = useState('');
  
  // Selected candidacy computed properties
  const selectedCandidatura = useMemo(() => {
    return candidaturas.find(c => c.id === selectedCandidaturaId) || null;
  }, [candidaturas, selectedCandidaturaId]);
  
  const [showAddCandidaturaForm, setShowAddCandidaturaForm] = useState(false);
  
  // Add Candidatura Form inputs
  const [newEmpresa, setNewEmpresa] = useState('');
  const [newVaga, setNewVaga] = useState('');
  const [newTipoVaga, setNewTipoVaga] = useState('Estágio');
  const [newModalidade, setNewModalidade] = useState('Remoto');
  const [newSalario, setNewSalario] = useState('');
  const [newLinkVaga, setNewLinkVaga] = useState('');
  const [newLocalizacao, setNewLocalizacao] = useState('');
  const [newRequisitos, setNewRequisitos] = useState('');
  const [newObservacoes, setNewObservacoes] = useState('');

  // Edit Candidatura Form inputs
  const [isEditingCandidatura, setIsEditingCandidatura] = useState(false);
  const [editEmpresa, setEditEmpresa] = useState('');
  const [editVaga, setEditVaga] = useState('');
  const [editTipoVaga, setEditTipoVaga] = useState('Estágio');
  const [editModalidade, setEditModalidade] = useState('Remoto');
  const [editSalario, setEditSalario] = useState('');
  const [editLinkVaga, setEditLinkVaga] = useState('');
  const [editLocalizacao, setEditLocalizacao] = useState('');
  const [editRequisitos, setEditRequisitos] = useState('');
  const [editObservacoes, setEditObservacoes] = useState('');

  // Candidatura Notepad state
  const [notesText, setNotesText] = useState('');
  const [isSavingNotes, setIsSavingNotes] = useState(false);

  // Sync Notepad and Reset Edit status on Selected Candidacy change
  useEffect(() => {
    if (selectedCandidatura) {
      setNotesText(selectedCandidatura.observacoes || '');
    } else {
      setNotesText('');
    }
    setIsEditingCandidatura(false);
  }, [selectedCandidaturaId, selectedCandidatura]);

  const startEditCandidatura = () => {
    if (!selectedCandidatura) return;
    setEditEmpresa(selectedCandidatura.empresa || '');
    setEditVaga(selectedCandidatura.vaga || '');
    setEditTipoVaga(selectedCandidatura.tipoVaga || 'Estágio');
    setEditModalidade(selectedCandidatura.modalidade || 'Remoto');
    setEditSalario(selectedCandidatura.salario || '');
    setEditLinkVaga(selectedCandidatura.linkVaga || '');
    setEditLocalizacao(selectedCandidatura.localizacao || '');
    setEditRequisitos(selectedCandidatura.requisitos || '');
    setEditObservacoes(selectedCandidatura.observacoes || '');
    setIsEditingCandidatura(true);
  };

  const handleSaveNotes = async () => {
    if (!selectedCandidatura) return;
    setIsSavingNotes(true);
    try {
      if (user) {
        const docRef = doc(db, 'candidaturas', selectedCandidatura.id);
        await updateDoc(docRef, { observacoes: notesText });
      } else {
        const updated = candidaturas.map(c => c.id === selectedCandidatura.id ? { ...c, observacoes: notesText } : c);
        setCandidaturas(updated);
        localStorage.setItem('carreira_candidaturas', JSON.stringify(updated));
      }
    } catch (error) {
      console.error("Error saving notes: ", error);
    } finally {
      setIsSavingNotes(false);
    }
  };

  const handleUpdateCandidacyDetails = async (e) => {
    e.preventDefault();
    if (!selectedCandidatura) return;
    if (!editEmpresa || !editVaga) return;

    const updatedFields = {
      empresa: editEmpresa,
      vaga: editVaga,
      tipoVaga: editTipoVaga,
      modalidade: editModalidade,
      salario: editSalario,
      linkVaga: editLinkVaga,
      localizacao: editLocalizacao,
      requisitos: editRequisitos,
      observacoes: editObservacoes
    };

    try {
      if (user) {
        const docRef = doc(db, 'candidaturas', selectedCandidatura.id);
        await updateDoc(docRef, updatedFields);
      } else {
        const updated = candidaturas.map(c => c.id === selectedCandidatura.id ? { ...c, ...updatedFields } : c);
        setCandidaturas(updated);
        localStorage.setItem('carreira_candidaturas', JSON.stringify(updated));
      }
      setIsEditingCandidatura(false);
    } catch (err) {
      console.error("Error updating candidacy: ", err);
    }
  };

  // 1. Observe Authentication State
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        setLoading(false);
        // Load data from localStorage
        const localMetas = localStorage.getItem('carreira_metas');
        const localCand = localStorage.getItem('carreira_candidaturas');
        if (localMetas) setMetas(JSON.parse(localMetas));
        if (localCand) {
          const parsedCand = JSON.parse(localCand);
          setCandidaturas(parsedCand);
          if (parsedCand.length > 0) setSelectedCandidaturaId(parsedCand[0].id);
        }
      } else {
        // Fetch User Info
        const studentRef = doc(db, 'alunos', currentUser.uid);
        onSnapshot(studentRef, (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.data();
            setNome(data.nomeCompleto || data.nome || 'Estudante');
            setFoto(data.foto || '');
          }
        });
      }
    });
    return unsubscribe;
  }, []);

  // 2. Load Real-time Data from Firebase when user is logged in
  useEffect(() => {
    if (!user) return;

    setFirebaseConnected(true);

    // Subscribe to Metas
    const metasQuery = query(collection(db, 'carreira_metas'), where('userId', '==', user.uid));
    const unsubMetas = onSnapshot(metasQuery, (snapshot) => {
      const metasData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMetas(metasData);
      localStorage.setItem('carreira_metas', JSON.stringify(metasData));
    }, (err) => {
      console.error("Firestore Metas error: ", err);
      setFirebaseConnected(false);
    });

    // Subscribe to Candidaturas
    const candQuery = query(collection(db, 'candidaturas'), where('userId', '==', user.uid));
    const unsubCand = onSnapshot(candQuery, (snapshot) => {
      const candData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCandidaturas(candData);
      localStorage.setItem('carreira_candidaturas', JSON.stringify(candData));
      
      // Auto select first candidacy if none selected
      if (candData.length > 0 && !selectedCandidaturaId) {
        setSelectedCandidaturaId(candData[0].id);
      }
    }, (err) => {
      console.error("Firestore Candidaturas error: ", err);
      setFirebaseConnected(false);
    });

    setLoading(false);

    return () => {
      unsubMetas();
      unsubCand();
    };
  }, [user, selectedCandidaturaId]);

  // Selected candidacy computed properties moved to top of component

  // Timeline stage details
  const FLOW_STAGES = [
    { key: 'enviado', title: 'Candidatura / Inscrição', desc: 'Envio do currículo ou cadastro inicial', color: '#3b82f6', icon: Search },
    { key: 'prova', title: 'Prova / Teste', desc: 'Testes técnicos ou provas de conhecimento', color: '#f59e0b', icon: Pencil },
    { key: 'entrevista', title: 'Entrevista', desc: 'Bate-papo com RH ou entrevista técnica', color: '#10b981', icon: Handshake },
    { key: 'aprovado', title: 'Concluiu / Passou', desc: 'Proposta recebida ou processo ganho!', color: '#34d399', icon: Trophy, pulse: true },
    { key: 'reprovado', title: 'Não Passou / Pendente', desc: 'Processo encerrado ou em espera', color: '#ef4444', icon: X, pulse: true }
  ];

  // Helper to determine if a stage is active for the current candidacy
  const getStageStatus = (stageKey) => {
    if (!selectedCandidatura) return { isActive: false, isCompleted: false };
    const currentFase = selectedCandidatura.fase;
    
    if (currentFase === 'reprovado') {
      if (stageKey === 'reprovado') return { isActive: true, isCompleted: false };
      // Otherwise, mark the previous states up to interview as completed
      const completionMap = { 'enviado': true, 'prova': true, 'entrevista': true };
      return { isActive: false, isCompleted: !!completionMap[stageKey] };
    }

    const stagesOrder = ['enviado', 'prova', 'entrevista', 'aprovado'];
    const currentIndex = stagesOrder.indexOf(currentFase);
    const stageIndex = stagesOrder.indexOf(stageKey);

    if (stageKey === 'reprovado') return { isActive: false, isCompleted: false };
    
    return {
      isActive: currentFase === stageKey,
      isCompleted: stageIndex !== -1 && stageIndex < currentIndex
    };
  };

  // 3. Handle Candidacy State Modifications
  const handleUpdateCandidacyStage = async (candidacyId, newStage) => {
    if (user) {
      const docRef = doc(db, 'candidaturas', candidacyId);
      await updateDoc(docRef, { fase: newStage });
    } else {
      const updated = candidaturas.map(c => c.id === candidacyId ? { ...c, fase: newStage } : c);
      setCandidaturas(updated);
      localStorage.setItem('carreira_candidaturas', JSON.stringify(updated));
    }
  };

  const handleDeleteCandidacy = async (candidacyId) => {
    if (window.confirm("Deseja realmente excluir este processo seletivo?")) {
      if (user) {
        await deleteDoc(doc(db, 'candidaturas', candidacyId));
      } else {
        const updated = candidaturas.filter(c => c.id !== candidacyId);
        setCandidaturas(updated);
        localStorage.setItem('carreira_candidaturas', JSON.stringify(updated));
      }
      setSelectedCandidaturaId('');
    }
  };

  const handleAddCandidacy = async (e) => {
    e.preventDefault();
    if (!newEmpresa || !newVaga) return;

    const newObj = {
      empresa: newEmpresa,
      vaga: newVaga,
      tipoVaga: newTipoVaga,
      modalidade: newModalidade,
      salario: newSalario,
      linkVaga: newLinkVaga,
      localizacao: newLocalizacao,
      requisitos: newRequisitos,
      observacoes: newObservacoes,
      fase: 'enviado',
      dataEnvio: new Date().toISOString()
    };

    if (user) {
      const docRef = await addDoc(collection(db, 'candidaturas'), {
        ...newObj,
        userId: user.uid
      });
      setSelectedCandidaturaId(docRef.id);
    } else {
      const generatedId = 'local_' + Date.now();
      const updated = [...candidaturas, { ...newObj, id: generatedId }];
      setCandidaturas(updated);
      setSelectedCandidaturaId(generatedId);
      localStorage.setItem('carreira_candidaturas', JSON.stringify(updated));
    }

    setNewEmpresa('');
    setNewVaga('');
    setNewTipoVaga('Estágio');
    setNewModalidade('Remoto');
    setNewSalario('');
    setNewLinkVaga('');
    setNewLocalizacao('');
    setNewRequisitos('');
    setNewObservacoes('');
    setShowAddCandidaturaForm(false);
  };

  // 4. Handle Goals (Metas) State Modifications
  const handleAddGoalPlaceholder = () => {
    const newPlaceholder = {
      id: 'temp_' + Date.now(),
      isEditing: true,
      tipo: 'objetivo',
      valorTempo: { anos: '0', meses: '6', dias: '0' },
      valorObjetivo: '',
      plataforma: '',
      instituicao: '',
      dataAlvo: '',
      tecnologias: '',
      idiomaNivel: '',
      detalhesNetworking: '',
      texto: '',
      concluida: false
    };
    setMetas(prev => [...prev, newPlaceholder]);
  };

  const handleSaveGoal = async (goal) => {
    let finalTexto = goal.valorObjetivo || 'Objetivo indefinido';
    
    if (goal.tipo === 'tempo') {
      const { anos, meses, dias } = goal.valorTempo || { anos: '0', meses: '0', dias: '0' };
      const parts = [];
      if (anos !== '0') parts.push(`${anos} ${anos === '1' ? 'Ano' : 'Anos'}`);
      if (meses !== '0') parts.push(`${meses} ${meses === '1' ? 'Mês' : 'Meses'}`);
      if (dias !== '0') parts.push(`${dias} ${dias === '1' ? 'Dia' : 'Dias'}`);
      const durationStr = parts.length > 0 ? parts.join(', ') : '0 dias';
      finalTexto = `${goal.valorObjetivo || 'Meta'} (Duração: ${durationStr})`;
    }

    const payload = {
      tipo: goal.tipo,
      texto: finalTexto,
      valorTempo: goal.valorTempo || { anos: '0', meses: '6', dias: '0' },
      valorObjetivo: goal.valorObjetivo || '',
      plataforma: goal.plataforma || '',
      instituicao: goal.instituicao || '',
      dataAlvo: goal.dataAlvo || '',
      tecnologias: goal.tecnologias || '',
      idiomaNivel: goal.idiomaNivel || '',
      detalhesNetworking: goal.detalhesNetworking || '',
      concluida: goal.concluida || false
    };

    if (goal.id.toString().startsWith('temp_')) {
      // Add new goal
      if (user) {
        await addDoc(collection(db, 'carreira_metas'), {
          ...payload,
          userId: user.uid
        });
      } else {
        const finalId = 'local_' + Date.now();
        const updated = [...metas.filter(m => m.id !== goal.id), { ...payload, id: finalId }];
        setMetas(updated);
        localStorage.setItem('carreira_metas', JSON.stringify(updated));
      }
    } else {
      // Update existing goal
      if (user) {
        await updateDoc(doc(db, 'carreira_metas', goal.id), payload);
      } else {
        const updated = metas.map(m => m.id === goal.id ? { ...m, ...payload, isEditing: false } : m);
        setMetas(updated);
        localStorage.setItem('carreira_metas', JSON.stringify(updated));
      }
    }
  };

  const handleCancelGoalEdit = (goalId) => {
    if (goalId.toString().startsWith('temp_')) {
      setMetas(prev => prev.filter(m => m.id !== goalId));
    } else {
      setMetas(prev => prev.map(m => m.id === goalId ? { ...m, isEditing: false } : m));
    }
  };

  const handleDeleteGoal = async (goalId) => {
    if (user) {
      await deleteDoc(doc(db, 'carreira_metas', goalId));
    } else {
      const updated = metas.filter(m => m.id !== goalId);
      setMetas(updated);
      localStorage.setItem('carreira_metas', JSON.stringify(updated));
    }
  };

  const handleToggleGoalComplete = async (goal) => {
    const updatedStatus = !goal.concluida;
    if (user) {
      await updateDoc(doc(db, 'carreira_metas', goal.id), { concluida: updatedStatus });
    } else {
      const updated = metas.map(m => m.id === goal.id ? { ...m, concluida: updatedStatus } : m);
      setMetas(updated);
      localStorage.setItem('carreira_metas', JSON.stringify(updated));
    }
  };

  const handleUpdateGoalField = (goalId, field, value) => {
    setMetas(prev => prev.map(m => {
      if (m.id === goalId) {
        if (field === 'valorTempo') {
          return { ...m, valorTempo: { ...m.valorTempo, ...value } };
        }
        return { ...m, [field]: value };
      }
      return m;
    }));
  };

  const handleEditGoal = (goal) => {
    setMetas(prev => prev.map(m => m.id === goal.id ? { ...m, isEditing: true } : m));
  };

  // Compute connecting line height based on active candidacy stage
  const activeLineHeight = useMemo(() => {
    if (!selectedCandidatura) return '0%';
    const stage = selectedCandidatura.fase;
    if (stage === 'reprovado') return '75%'; // Down to interview stage
    
    const stagePositions = {
      'enviado': '0%',
      'prova': '25%',
      'entrevista': '50%',
      'aprovado': '75%'
    };
    return stagePositions[stage] || '0%';
  }, [selectedCandidatura]);

  const defaultAvatar = useMemo(() => {
    if (!nome) return '';
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(nome)}&background=2563eb&color=ffffff`;
  }, [nome]);

  const isStillLoading = introLoading || loading;

  const letters = "CARREIRA".split("");

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08
      }
    }
  };

  const letterVariants = {
    hidden: { y: 25, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        damping: 10,
        stiffness: 150
      }
    }
  };

  return (
    <AnimatePresence mode="wait">
      {isStillLoading ? (
        <motion.div
          key="loader"
          initial={{ opacity: 1 }}
          exit={{ 
            opacity: 0,
            scale: 1.02,
            filter: "blur(5px)",
            transition: { duration: 0.4, ease: "easeInOut" }
          }}
        >
          <Loading title="CARREIRA" message="Preparando sua jornada profissional..." />
        </motion.div>
      ) : (
        <motion.div
          key="content"
          className="carreira-page-wrapper"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          {/* Background image & frosted overlay */}
          <img src={CarreiraBg} alt="Background" className="carreira-bg-image" />
          <div className="carreira-backdrop-overlay"></div>

          <div className="carreira-content-container">
            {/* Minimalist Top Nav Header */}
            <header className="carreira-header">
              <button className="carreira-back-btn" onClick={() => navigate('/dashboard')}>
                <ArrowLeft size={16} /> Voltar ao Painel
              </button>
            </header>

            {/* 3 Column Main Layout Grid */}
            <div className="carreira-grid">
              
              {/* COLUMN 1: GOALS LIST (LEFT) */}
              <div className="metas-col">
                <div className="metas-title-container" id="metas-title-id">
                  <span className="metas-subtitle-eyebrow">[DEFINA SEU FUTURO]</span>
                  <h2 className="metas-main-title">Metas de Carreira</h2>
                </div>

                <div className="metas-list-container">
                  <AnimatePresence initial={false}>
                    {metas.map((goal) => {
                      const getGoalIcon = (tipo) => {
                        switch (tipo) {
                          case 'tempo': return Clock;
                          case 'estudo': return Code;
                          case 'curso': return BookOpen;
                          case 'certificacao': return Trophy;
                          case 'projeto': return Briefcase;
                          case 'idioma': return Globe;
                          case 'networking': return Users;
                          default: return Target;
                        }
                      };
                      const IconComponent = getGoalIcon(goal.tipo);
                      
                      return (
                        <motion.div 
                          key={goal.id} 
                          className="meta-item-row"
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        >
                          <div className="meta-icon-wrapper">
                            <IconComponent size={18} />
                          </div>

                          <div className="meta-content-area">
                            {goal.isEditing ? (
                              <div className="flex flex-col gap-3 w-full">
                                <input 
                                  type="text"
                                  placeholder="Título / Descrição da Meta (Ex: Aprender React)"
                                  value={goal.valorObjetivo || ''}
                                  onChange={(e) => handleUpdateGoalField(goal.id, 'valorObjetivo', e.target.value)}
                                  className="meta-input-modern"
                                  autoFocus
                                />

                                <div className="flex items-center gap-2">
                                  <span className="meta-select-label">Tipo:</span>
                                  <select 
                                    value={goal.tipo}
                                    onChange={(e) => handleUpdateGoalField(goal.id, 'tipo', e.target.value)}
                                    className="meta-select-modern"
                                  >
                                    <option value="objetivo">Objetivo Geral</option>
                                    <option value="estudo">Estudo Técnico</option>
                                    <option value="curso">Curso / Treinamento</option>
                                    <option value="certificacao">Certificação</option>
                                    <option value="projeto">Projeto Prático</option>
                                    <option value="idioma">Idioma</option>
                                    <option value="networking">Networking</option>
                                    <option value="tempo">Tempo de Estudo</option>
                                  </select>
                                </div>

                                {goal.tipo === 'tempo' && (
                                  <div className="meta-time-inputs">
                                    <span className="meta-select-label">Estudar por:</span>
                                    <select 
                                      value={goal.valorTempo?.anos || '0'} 
                                      onChange={(e) => handleUpdateGoalField(goal.id, 'valorTempo', { anos: e.target.value })}
                                      className="meta-select-modern"
                                    >
                                      {[0,1,2,3,4,5].map(y => <option key={y} value={y}>{y} {y === 1 ? 'Ano' : 'Anos'}</option>)}
                                    </select>
                                    <select 
                                      value={goal.valorTempo?.meses || '6'} 
                                      onChange={(e) => handleUpdateGoalField(goal.id, 'valorTempo', { meses: e.target.value })}
                                      className="meta-select-modern"
                                    >
                                      {[0,1,2,3,4,5,6,7,8,9,10,11].map(m => <option key={m} value={m}>{m} {m === 1 ? 'Mês' : 'Meses'}</option>)}
                                    </select>
                                    <select 
                                      value={goal.valorTempo?.dias || '0'} 
                                      onChange={(e) => handleUpdateGoalField(goal.id, 'valorTempo', { dias: e.target.value })}
                                      className="meta-select-modern"
                                    >
                                      {[0,5,10,15,20,25].map(d => <option key={d} value={d}>{d} {d === 1 ? 'Dia' : 'Dias'}</option>)}
                                    </select>
                                  </div>
                                )}

                                {goal.tipo === 'estudo' && (
                                  <input 
                                    type="text"
                                    placeholder="Tecnologias (ex: TypeScript, Docker)"
                                    value={goal.tecnologias || ''}
                                    onChange={(e) => handleUpdateGoalField(goal.id, 'tecnologias', e.target.value)}
                                    className="meta-input-modern"
                                  />
                                )}

                                {goal.tipo === 'curso' && (
                                  <input 
                                    type="text"
                                    placeholder="Plataforma / Escola (ex: Udemy, Alura, Coursera)"
                                    value={goal.plataforma || ''}
                                    onChange={(e) => handleUpdateGoalField(goal.id, 'plataforma', e.target.value)}
                                    className="meta-input-modern"
                                  />
                                )}

                                {goal.tipo === 'certificacao' && (
                                  <div className="flex flex-col gap-2 w-full">
                                    <input 
                                      type="text"
                                      placeholder="Órgão Emissor / Sigla (ex: AWS, Google, Scrum Alliance)"
                                      value={goal.instituicao || ''}
                                      onChange={(e) => handleUpdateGoalField(goal.id, 'instituicao', e.target.value)}
                                      className="meta-input-modern"
                                    />
                                    <div className="flex items-center gap-2">
                                      <span className="meta-select-label">Data Limite:</span>
                                      <input 
                                        type="date"
                                        value={goal.dataAlvo || ''}
                                        onChange={(e) => handleUpdateGoalField(goal.id, 'dataAlvo', e.target.value)}
                                        className="meta-select-modern"
                                        style={{ width: 'auto', background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.15)' }}
                                      />
                                    </div>
                                  </div>
                                )}

                                {goal.tipo === 'projeto' && (
                                  <input 
                                    type="text"
                                    placeholder="Tecnologias do Projeto (ex: React Native, Firebase)"
                                    value={goal.tecnologias || ''}
                                    onChange={(e) => handleUpdateGoalField(goal.id, 'tecnologias', e.target.value)}
                                    className="meta-input-modern"
                                  />
                                )}

                                {goal.tipo === 'idioma' && (
                                  <input 
                                    type="text"
                                    placeholder="Nível Alvo (ex: Inglês Avançado, Fluência, B2)"
                                    value={goal.idiomaNivel || ''}
                                    onChange={(e) => handleUpdateGoalField(goal.id, 'idiomaNivel', e.target.value)}
                                    className="meta-input-modern"
                                  />
                                )}

                                {goal.tipo === 'networking' && (
                                  <input 
                                    type="text"
                                    placeholder="Eventos, LinkedIn ou pessoas de interesse"
                                    value={goal.detalhesNetworking || ''}
                                    onChange={(e) => handleUpdateGoalField(goal.id, 'detalhesNetworking', e.target.value)}
                                    className="meta-input-modern"
                                  />
                                )}

                                <div className="flex gap-2">
                                  <button 
                                    className="add-candidacy-btn-action save" 
                                    onClick={() => handleSaveGoal(goal)}
                                  >
                                    Salvar
                                  </button>
                                  <button 
                                    className="add-candidacy-btn-action cancel" 
                                    onClick={() => handleCancelGoalEdit(goal.id)}
                                  >
                                    Cancelar
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <div className="flex flex-col">
                                  <span 
                                    className={`font-medium cursor-pointer transition-colors duration-200 ${goal.concluida ? 'text-gray-500 line-through' : 'text-white'}`}
                                    onClick={() => handleToggleGoalComplete(goal)}
                                  >
                                    {goal.valorObjetivo || goal.texto}
                                  </span>
                                  
                                  {goal.tipo === 'tempo' && (
                                    <span className="text-[11px] text-gray-400 font-light mt-0.5">
                                      Duração: {
                                        (() => {
                                          const { anos, meses, dias } = goal.valorTempo || { anos: '0', meses: '0', dias: '0' };
                                          const parts = [];
                                          if (anos && anos !== '0') parts.push(`${anos} ${anos === '1' ? 'ano' : 'anos'}`);
                                          if (meses && meses !== '0') parts.push(`${meses} ${meses === '1' ? 'mês' : 'meses'}`);
                                          if (dias && dias !== '0') parts.push(`${dias} ${dias === '1' ? 'dia' : 'dias'}`);
                                          return parts.length > 0 ? parts.join(', ') : 'não especificada';
                                        })()
                                      }
                                    </span>
                                  )}

                                  {goal.tipo === 'estudo' && goal.tecnologias && (
                                    <span className="text-[11px] text-blue-400 font-light mt-0.5">
                                      Techs: <strong className="text-gray-300">{goal.tecnologias}</strong>
                                    </span>
                                  )}

                                  {goal.tipo === 'curso' && goal.plataforma && (
                                    <span className="text-[11px] text-indigo-400 font-light mt-0.5">
                                      Plataforma: <strong className="text-gray-300">{goal.plataforma}</strong>
                                    </span>
                                  )}

                                  {goal.tipo === 'certificacao' && (goal.instituicao || goal.dataAlvo) && (
                                    <span className="text-[11px] text-yellow-400 font-light mt-0.5">
                                      {goal.instituicao && <>Órgão: <strong className="text-gray-300">{goal.instituicao}</strong></>}
                                      {goal.instituicao && goal.dataAlvo && ' | '}
                                      {goal.dataAlvo && <>Data Limite: <strong className="text-gray-300">{
                                        (() => {
                                          try {
                                            const parts = goal.dataAlvo.split('-');
                                            if (parts.length === 3) {
                                              return `${parts[2]}/${parts[1]}/${parts[0]}`;
                                            }
                                            return goal.dataAlvo;
                                          } catch(e) {
                                            return goal.dataAlvo;
                                          }
                                        })()
                                      }</strong></>}
                                    </span>
                                  )}

                                  {goal.tipo === 'projeto' && goal.tecnologias && (
                                    <span className="text-[11px] text-emerald-400 font-light mt-0.5">
                                      Techs: <strong className="text-gray-300">{goal.tecnologias}</strong>
                                    </span>
                                  )}

                                  {goal.tipo === 'idioma' && goal.idiomaNivel && (
                                    <span className="text-[11px] text-purple-400 font-light mt-0.5">
                                      Nível: <strong className="text-gray-300">{goal.idiomaNivel}</strong>
                                    </span>
                                  )}

                                  {goal.tipo === 'networking' && goal.detalhesNetworking && (
                                    <span className="text-[11px] text-pink-400 font-light mt-0.5">
                                      Foco: <strong className="text-gray-300">{goal.detalhesNetworking}</strong>
                                    </span>
                                  )}

                                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                                    <span className="text-[9px] uppercase tracking-wider bg-white/5 text-gray-400 font-semibold px-2 py-0.5 rounded border border-white/5 flex items-center gap-1">
                                      <IconComponent size={10} />
                                      {
                                        goal.tipo === 'objetivo' ? 'Geral' :
                                        goal.tipo === 'estudo' ? 'Estudo' :
                                        goal.tipo === 'curso' ? 'Curso' :
                                        goal.tipo === 'certificacao' ? 'Certificação' :
                                        goal.tipo === 'projeto' ? 'Projeto' :
                                        goal.tipo === 'idioma' ? 'Idioma' :
                                        goal.tipo === 'networking' ? 'Networking' :
                                        goal.tipo === 'tempo' ? 'Tempo' : 'Geral'
                                      }
                                    </span>
                                    {goal.concluida && (
                                      <span className="text-[9px] uppercase tracking-wider bg-green-500/20 text-green-400 font-bold px-2 py-0.5 rounded border border-green-500/30">
                                        Concluída
                                      </span>
                                    )}
                                  </div>
                                </div>
                                
                                <div className="meta-actions-wrapper">
                                  <button className="meta-btn-action" onClick={() => handleEditGoal(goal)}>Editar</button>
                                  <button className="meta-btn-action delete" onClick={() => handleDeleteGoal(goal.id)}>Excluir</button>
                                </div>
                              </>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>

                  {metas.length === 0 && (
                    <div className="text-gray-500 text-sm py-4 italic">
                      Nenhuma meta cadastrada. Adicione sua primeira meta de carreira abaixo.
                    </div>
                  )}

                  <button className="meta-btn-add" onClick={handleAddGoalPlaceholder}>
                    <Plus size={16} /> ADICIONAR NOVA META
                  </button>
                </div>
              </div>

              {/* COLUMN 2: DOMINANT HERO TITLE (CENTER) */}
              <div className="center-title-col">
                <motion.h1 
                  className="giant-title-text"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  whileHover={{ 
                    scale: 1.04, 
                    textShadow: '0 25px 50px rgba(0, 0, 0, 0.8)',
                    transition: { duration: 0.3 }
                  }}
                >
                  Carreira
                </motion.h1>
                
                <motion.p 
                  className="center-subtitle-text"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.8 }}
                >
                  Você faz a sua carreira, da maneira como quiser.
                </motion.p>
              </div>

              {/* COLUMN 3: FLOW COLUMN / CANDIDACIES (RIGHT) */}
              <div className="flow-col">
                <div className="candidacy-selector-container">
                  <div className="flex justify-between items-center gap-3">
                    <span className="candidacy-selector-label">[PROCESSOS SELETIVOS]</span>
                    {!showAddCandidaturaForm && (
                      <button 
                        onClick={() => setShowAddCandidaturaForm(true)}
                        className="candidacy-btn-new-process"
                      >
                        <Plus size={14} /> Novo Processo
                      </button>
                    )}
                  </div>
                  
                  {candidaturas.length > 0 ? (
                    <div className="flex gap-2">
                      <select 
                        value={selectedCandidaturaId}
                        onChange={(e) => setSelectedCandidaturaId(e.target.value)}
                        className="candidacy-dropdown"
                      >
                        {candidaturas.map(c => (
                          <option key={c.id} value={c.id}>
                            {c.empresa} — {c.vaga}
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    !showAddCandidaturaForm && (
                      <div className="flow-empty-state">
                        <span className="flow-empty-title">Acompanhe Seus Processos</span>
                        <span className="flow-empty-desc">
                          Registre e atualize as etapas das suas candidaturas a vagas de estágio ou emprego.
                        </span>
                        <button className="flow-empty-btn" onClick={() => setShowAddCandidaturaForm(true)}>
                          Registrar Candidatura
                        </button>
                      </div>
                    )
                  )}

                  {/* Inline adding form */}
                  {showAddCandidaturaForm && (
                    <motion.form 
                      onSubmit={handleAddCandidacy}
                      className="add-candidacy-inline"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <div className="add-candidacy-inputs">
                        <div className="grid grid-cols-2 gap-2">
                          <input 
                            type="text" 
                            placeholder="Empresa (Ex: Google)"
                            value={newEmpresa}
                            onChange={(e) => setNewEmpresa(e.target.value)}
                            className="add-candidacy-input"
                            required
                          />
                          <input 
                            type="text" 
                            placeholder="Vaga (Ex: Dev React)"
                            value={newVaga}
                            onChange={(e) => setNewVaga(e.target.value)}
                            className="add-candidacy-input"
                            required
                          />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2">
                          <div className="flex flex-col gap-1">
                            <span className="text-[10px] text-gray-400 font-semibold uppercase">Tipo de Contrato</span>
                            <select 
                              value={newTipoVaga} 
                              onChange={(e) => setNewTipoVaga(e.target.value)} 
                              className="add-candidacy-input"
                            >
                              <option value="Estágio">Estágio</option>
                              <option value="CLT">CLT</option>
                              <option value="PJ">PJ</option>
                              <option value="Trainee">Trainee</option>
                              <option value="Freelance">Freelance</option>
                            </select>
                          </div>
                          
                          <div className="flex flex-col gap-1">
                            <span className="text-[10px] text-gray-400 font-semibold uppercase">Modalidade</span>
                            <select 
                              value={newModalidade} 
                              onChange={(e) => setNewModalidade(e.target.value)} 
                              className="add-candidacy-input"
                            >
                              <option value="Remoto">Remoto</option>
                              <option value="Híbrido">Híbrido</option>
                              <option value="Presencial">Presencial</option>
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <input 
                            type="text" 
                            placeholder="Salário / Bolsa"
                            value={newSalario}
                            onChange={(e) => setNewSalario(e.target.value)}
                            className="add-candidacy-input"
                          />
                          <input 
                            type="text" 
                            placeholder="Local (Cidade/UF)"
                            value={newLocalizacao}
                            onChange={(e) => setNewLocalizacao(e.target.value)}
                            className="add-candidacy-input"
                          />
                        </div>

                        <input 
                          type="text" 
                          placeholder="Link da Vaga (URL)"
                          value={newLinkVaga}
                          onChange={(e) => setNewLinkVaga(e.target.value)}
                          className="add-candidacy-input"
                        />

                        <input 
                          type="text" 
                          placeholder="Requisitos principais (React, Docker, etc.)"
                          value={newRequisitos}
                          onChange={(e) => setNewRequisitos(e.target.value)}
                          className="add-candidacy-input"
                        />

                        <textarea 
                          placeholder="Anotações / Observações iniciais..."
                          value={newObservacoes}
                          onChange={(e) => setNewObservacoes(e.target.value)}
                          className="add-candidacy-input h-16 resize-none"
                        />
                      </div>
                      <div className="add-candidacy-buttons">
                        <button type="submit" className="add-candidacy-btn-action save">Salvar Vaga</button>
                        <button 
                          type="button" 
                          onClick={() => setShowAddCandidaturaForm(false)} 
                          className="add-candidacy-btn-action cancel"
                        >
                          Cancelar
                        </button>
                      </div>
                    </motion.form>
                  )}
                </div>

                {/* Details Panel of Selected Candidacy */}
                {selectedCandidatura && (
                  <motion.div 
                    className="candidacy-details-card"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {isEditingCandidatura ? (
                      /* EDIT MODE FORM */
                      <form onSubmit={handleUpdateCandidacyDetails} className="candidacy-edit-form flex flex-col gap-3">
                        <div className="flex justify-between items-center border-b border-white/10 pb-2">
                          <span className="text-xs text-blue-400 font-bold uppercase tracking-wider">Editar Detalhes da Vaga</span>
                          <button type="button" onClick={() => setIsEditingCandidatura(false)} className="text-gray-400 hover:text-white">
                            <X size={16} />
                          </button>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] text-gray-400 font-semibold uppercase">Empresa</label>
                            <input 
                              type="text" 
                              value={editEmpresa} 
                              onChange={(e) => setEditEmpresa(e.target.value)} 
                              className="add-candidacy-input" 
                              required 
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] text-gray-400 font-semibold uppercase">Vaga</label>
                            <input 
                              type="text" 
                              value={editVaga} 
                              onChange={(e) => setEditVaga(e.target.value)} 
                              className="add-candidacy-input" 
                              required 
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] text-gray-400 font-semibold uppercase">Contrato</label>
                            <select 
                              value={editTipoVaga} 
                              onChange={(e) => setEditTipoVaga(e.target.value)} 
                              className="add-candidacy-input"
                            >
                              <option value="Estágio">Estágio</option>
                              <option value="CLT">CLT</option>
                              <option value="PJ">PJ</option>
                              <option value="Trainee">Trainee</option>
                              <option value="Freelance">Freelance</option>
                            </select>
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] text-gray-400 font-semibold uppercase">Modalidade</label>
                            <select 
                              value={editModalidade} 
                              onChange={(e) => setEditModalidade(e.target.value)} 
                              className="add-candidacy-input"
                            >
                              <option value="Remoto">Remoto</option>
                              <option value="Híbrido">Híbrido</option>
                              <option value="Presencial">Presencial</option>
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] text-gray-400 font-semibold uppercase">Salário / Bolsa</label>
                            <input 
                              type="text" 
                              value={editSalario} 
                              onChange={(e) => setEditSalario(e.target.value)} 
                              className="add-candidacy-input" 
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] text-gray-400 font-semibold uppercase">Local</label>
                            <input 
                              type="text" 
                              value={editLocalizacao} 
                              onChange={(e) => setEditLocalizacao(e.target.value)} 
                              className="add-candidacy-input" 
                            />
                          </div>
                        </div>

                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] text-gray-400 font-semibold uppercase">Link da Vaga</label>
                          <input 
                            type="text" 
                            value={editLinkVaga} 
                            onChange={(e) => setEditLinkVaga(e.target.value)} 
                            className="add-candidacy-input" 
                          />
                        </div>

                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] text-gray-400 font-semibold uppercase">Requisitos / Skills</label>
                          <input 
                            type="text" 
                            value={editRequisitos} 
                            onChange={(e) => setEditRequisitos(e.target.value)} 
                            className="add-candidacy-input" 
                          />
                        </div>

                        <div className="flex gap-2 justify-end mt-2">
                          <button type="submit" className="add-candidacy-btn-action save">Salvar Alterações</button>
                          <button type="button" onClick={() => setIsEditingCandidatura(false)} className="add-candidacy-btn-action cancel">Cancelar</button>
                        </div>
                      </form>
                    ) : (
                      /* VIEW MODE */
                      <div className="candidacy-view-details flex flex-col gap-3">
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <h3 className="text-base font-bold text-white leading-tight">{selectedCandidatura.vaga}</h3>
                            <span className="text-xs text-gray-400">{selectedCandidatura.empresa}</span>
                          </div>
                          
                          <div className="flex gap-1.5">
                            <button 
                              onClick={startEditCandidatura}
                              className="p-1.5 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded transition-colors"
                              title="Editar Vaga"
                            >
                              <Pencil size={13} />
                            </button>
                            <button 
                              onClick={() => handleDeleteCandidacy(selectedCandidatura.id)}
                              className="p-1.5 text-gray-400 hover:text-red-400 bg-white/5 hover:bg-red-500/10 rounded transition-colors"
                              title="Excluir Vaga"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>

                        {/* Badges Row */}
                        <div className="flex flex-wrap gap-1.5 my-1">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                            selectedCandidatura.tipoVaga === 'Estágio' 
                              ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' 
                              : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          }`}>
                            {selectedCandidatura.tipoVaga || 'Estágio'}
                          </span>
                          
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded border bg-purple-500/10 text-purple-400 border-purple-500/20">
                            {selectedCandidatura.modalidade || 'Remoto'}
                          </span>

                          {selectedCandidatura.salario && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded border bg-amber-500/10 text-amber-400 border-amber-500/20">
                              {selectedCandidatura.salario.startsWith('R$') ? selectedCandidatura.salario : `R$ ${selectedCandidatura.salario}`}
                            </span>
                          )}

                          {selectedCandidatura.localizacao && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded border bg-gray-500/10 text-gray-300 border-gray-500/20">
                              {selectedCandidatura.localizacao}
                            </span>
                          )}
                        </div>

                        {selectedCandidatura.requisitos && (
                          <div className="text-[11px] text-gray-400 bg-white/5 border border-white/5 p-2 rounded">
                            <span className="font-semibold text-gray-300 uppercase tracking-wider block text-[9px] mb-1">Requisitos Principais</span>
                            {selectedCandidatura.requisitos}
                          </div>
                        )}

                        {selectedCandidatura.linkVaga && (
                          <a 
                            href={selectedCandidatura.linkVaga.startsWith('http') ? selectedCandidatura.linkVaga : `https://${selectedCandidatura.linkVaga}`} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="candidacy-link-btn flex items-center justify-center gap-1.5 py-1.5 text-xs text-blue-400 bg-blue-500/5 hover:bg-blue-500/10 border border-blue-500/20 hover:border-blue-500/30 rounded font-semibold transition-all mt-1"
                          >
                            <Link size={12} /> Acessar Link da Vaga
                          </a>
                        )}

                        {/* Quick Notes / Notepad */}
                        <div className="flex flex-col gap-1.5 mt-2 border-t border-white/5 pt-3">
                          <div className="flex justify-between items-center">
                            <span className="text-[9px] font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1">
                              <FileText size={11} className="text-blue-400" /> Bloco de Notas / Lembretes
                            </span>
                            
                            <button 
                              onClick={handleSaveNotes} 
                              className="text-[9px] font-bold text-blue-400 hover:text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 px-2 py-0.5 rounded border border-blue-500/20 transition-all"
                              disabled={isSavingNotes}
                            >
                              {isSavingNotes ? 'Salvando...' : 'Salvar Notas'}
                            </button>
                          </div>

                          <textarea 
                            value={notesText} 
                            onChange={(e) => setNotesText(e.target.value)} 
                            placeholder="Anote datas de entrevistas, contatos de recrutadores, feedback, etc..." 
                            className="add-candidacy-input h-20 resize-none font-sans text-xs"
                          />
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Vertical continuous timeline */}
                {selectedCandidatura && (
                  <div className="flow-timeline-container">
                    {/* Connecting lines */}
                    <div className="flow-timeline-line"></div>
                    <div 
                      className="flow-timeline-line-active" 
                      style={{ height: activeLineHeight }}
                    ></div>

                    {/* Render hexagonal checkpoints */}
                    {FLOW_STAGES.map((stage, idx) => {
                      const { isActive, isCompleted } = getStageStatus(stage.key);
                      const Icon = stage.icon;
                      
                      // Compute if we show controls near this hexagon
                      const showControls = isActive && stage.key !== 'aprovado' && stage.key !== 'reprovado';
                      
                      // Map transition flows
                      const getNextStageKey = () => {
                        const order = ['enviado', 'prova', 'entrevista', 'aprovado'];
                        const currentIdx = order.indexOf(stage.key);
                        return order[currentIdx + 1];
                      };

                      return (
                        <div key={stage.key} className="flow-step-node">
                          <RoundedHexagon 
                            color={stage.color} 
                            isActive={isActive || isCompleted}
                            onClick={() => handleUpdateCandidacyStage(selectedCandidatura.id, stage.key)}
                            pulse={stage.pulse}
                          >
                            {isCompleted ? <Check size={26} strokeWidth={3} className="text-white" /> : <Icon size={26} />}
                          </RoundedHexagon>

                          <div className="hexagon-label-content">
                            <span className="hexagon-step-status" style={{ color: (isActive || isCompleted) ? stage.color : 'rgba(255, 255, 255, 0.3)' }}>
                              {isActive ? 'Atual' : isCompleted ? 'Concluído' : 'Aguardando'}
                            </span>
                            
                            <h4 className="hexagon-step-title">{stage.title}</h4>
                            <span className="hexagon-step-desc">{stage.desc}</span>

                            {/* Interactive Buttons Inline */}
                            {showControls && (
                              <div className="flow-control-buttons">
                                <button 
                                  className="flow-control-btn next"
                                  onClick={() => handleUpdateCandidacyStage(selectedCandidatura.id, getNextStageKey())}
                                >
                                  Próximo Passo
                                </button>
                                <button 
                                  className="flow-control-btn reject"
                                  onClick={() => handleUpdateCandidacyStage(selectedCandidatura.id, 'reprovado')}
                                >
                                  Reprovado
                                </button>
                              </div>
                            )}

                            {/* Reset / Action if reached approved or reproved terminal states */}
                            {isActive && (stage.key === 'aprovado' || stage.key === 'reprovado') && (
                              <div className="flow-control-buttons">
                                <button 
                                  className="flow-control-btn"
                                  style={{ borderColor: 'rgba(255,255,255,0.2)' }}
                                  onClick={() => handleUpdateCandidacyStage(selectedCandidatura.id, 'enviado')}
                                >
                                  Reiniciar Fluxo
                                </button>
                                <button 
                                  className="flow-control-btn delete"
                                  onClick={() => handleDeleteCandidacy(selectedCandidatura.id)}
                                >
                                  Excluir Vaga
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>

            {/* Sync Status Footer */}
            <footer className="carreira-footer-status">
              <div className={`status-indicator-dot ${firebaseConnected && user ? 'online' : 'offline'}`}></div>
              <span>
                {firebaseConnected && user 
                  ? "Sincronizado na Nuvem (Firebase Firestore)" 
                  : "Salvando localmente no navegador (Sem conexão ou offline)"}
              </span>
            </footer>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
