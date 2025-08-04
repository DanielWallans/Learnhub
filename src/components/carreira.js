import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, auth } from '../firebaseConfig';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  doc,
  onSnapshot,
  getDoc
} from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import './carreira.css';
import {
  FaGraduationCap,
  FaBriefcase,
  FaUsers,
  FaBullseye,
  FaPlus,
  FaTrash,
  FaLinkedin,
  FaCalendar,
  FaCheck,
  FaClock,
  FaTimes,
  FaClipboardList,
  FaLightbulb,
  FaBolt,
  FaChartBar,
  FaComments,
  FaArrowLeft,
  FaStar,
  FaTrophy,
  FaHeart,
  FaGem,
  FaLink,
  FaRocket,
  FaLaptop,
  FaUserFriends,
  FaSearch,
  FaEdit,
  FaPhone,
  FaBook,
  FaCloudUploadAlt,
  FaNetworkWired
} from 'react-icons/fa';

const ModuloCarreira = () => {
  const navigate = useNavigate();
  const [user, loading, error] = useAuthState(auth);
  const [activeTab, setActiveTab] = useState('estagios');
  
  // Estados para Gerenciador de Estágios
  const [candidaturas, setCandidaturas] = useState([]);

  // Estados para Plano de Desenvolvimento
  const [metas, setMetas] = useState({
    curtoPrazo: [],
    longoPrazo: []
  });

  // Memoização das abas para evitar re-renders desnecessários
  const tabs = useMemo(() => [
    { 
      id: 'estagios', 
      nome: 'Estágios & Trainees', 
      icone: FaBriefcase,
      cor: '#3b82f6',
      descricao: 'Gerencie suas candidaturas'
    },
    { 
      id: 'networking', 
      nome: 'Networking', 
      icone: FaUsers,
      cor: '#10b981',
      descricao: 'Construa sua rede profissional'
    },
    { 
      id: 'desenvolvimento', 
      nome: 'Plano de Desenvolvimento', 
      icone: FaBullseye,
      cor: '#f59e0b',
      descricao: 'Defina e acompanhe metas'
    }
  ], []);

  // Handlers memoizados
  const handleTabChange = useCallback((tabId) => {
    setActiveTab(tabId);
  }, []);

  const handleBackToDashboard = useCallback(() => {
    navigate('/dashboard');
  }, [navigate]);

  // Renderização do componente ativo
  const renderActiveTab = () => {
    switch (activeTab) {
      case 'estagios':
        return <GerenciadorEstagios />;
      case 'networking':
        return <NetworkingGuide />;
      case 'desenvolvimento':
        return <PlanoDesenvolvimento />;
      default:
        return <GerenciadorEstagios />;
    }
  };

  // Carregar dados do Firebase ou localStorage
  useEffect(() => {
    if (user) {
      // Carregar dados do Firebase se usuário logado
      loadFirebaseData();
      setupRealtimeListeners();
    } else {
      // Carregar dados do localStorage como fallback
      loadLocalStorageData();
    }

    // Cleanup listeners
    return () => {
      // Limpar listeners quando componente desmontar
    };
  }, [user]);

  // Early return para loading
  if (loading) {
    return (
      <div className="modulo-carreira">
        <div className="carreira-container">
          <div className="loading-container" style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '60vh',
            flexDirection: 'column',
            gap: '1rem'
          }}>
            <div className="loading-spinner" style={{
              width: '40px',
              height: '40px',
              border: '3px solid #f3f4f6',
              borderTop: '3px solid #6366f1',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}></div>
            <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>Carregando módulo carreira...</p>
          </div>
        </div>
      </div>
    );
  }

  const setupRealtimeListeners = () => {
    if (!user) return;

    console.log('🔄 Configurando listeners em tempo real...');

    // Listener para candidaturas
    const candidaturasQuery = query(
      collection(db, 'candidaturas'), 
      where('userId', '==', user.uid)
    );
    
    const unsubscribeCandidaturas = onSnapshot(candidaturasQuery, (snapshot) => {
      console.log('📡 Listener candidaturas ativado - documentos:', snapshot.docs.length);
      const candidaturasData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Log dos documentos recebidos
      console.log('📄 Candidaturas do Firebase:');
      candidaturasData.forEach(c => console.log(`  - ${c.id}: ${c.empresa}`));
      
      setCandidaturas(candidaturasData);
      localStorage.setItem('carreira_candidaturas', JSON.stringify(candidaturasData));
      console.log('✅ Estado de candidaturas atualizado via listener');
    }, (error) => {
      console.error('❌ Erro no listener de candidaturas:', error);
    });

    // Listener para metas
    const metasQuery = query(
      collection(db, 'metas_carreira'), 
      where('userId', '==', user.uid)
    );
    
    const unsubscribeMetas = onSnapshot(metasQuery, (snapshot) => {
      console.log('📡 Listener metas ativado - documentos:', snapshot.docs.length);
      const metasData = {
        curtoPrazo: [],
        longoPrazo: []
      };
      
      snapshot.docs.forEach(doc => {
        const meta = { id: doc.id, ...doc.data() };
        if (meta.tipo === 'curtoPrazo') {
          metasData.curtoPrazo.push(meta);
        } else {
          metasData.longoPrazo.push(meta);
        }
      });
      
      // Log das metas recebidas
      console.log('📄 Metas do Firebase:');
      console.log(`  - Curto prazo: ${metasData.curtoPrazo.length}`);
      console.log(`  - Longo prazo: ${metasData.longoPrazo.length}`);
      metasData.curtoPrazo.forEach(m => console.log(`    - ${m.id}: ${m.texto}`));
      metasData.longoPrazo.forEach(m => console.log(`    - ${m.id}: ${m.texto}`));
      
      setMetas(metasData);
      localStorage.setItem('carreira_metas', JSON.stringify(metasData));
      console.log('✅ Estado de metas atualizado via listener');
    }, (error) => {
      console.error('❌ Erro no listener de metas:', error);
    });

    // Retornar função de cleanup
    return () => {
      console.log('🛑 Desconectando listeners Firebase');
      unsubscribeCandidaturas();
      unsubscribeMetas();
    };
  };

  const loadFirebaseData = async () => {
    if (!user) return;

    try {
      // Carregar candidaturas
      const candidaturasQuery = query(
        collection(db, 'candidaturas'), 
        where('userId', '==', user.uid)
      );
      const candidaturasSnapshot = await getDocs(candidaturasQuery);
      const candidaturasData = candidaturasSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCandidaturas(candidaturasData);

      // Carregar metas
      const metasQuery = query(
        collection(db, 'metas_carreira'), 
        where('userId', '==', user.uid)
      );
      const metasSnapshot = await getDocs(metasQuery);
      const metasData = {
        curtoPrazo: [],
        longoPrazo: []
      };
      
      metasSnapshot.docs.forEach(doc => {
        const meta = { id: doc.id, ...doc.data() };
        if (meta.tipo === 'curtoPrazo') {
          metasData.curtoPrazo.push(meta);
        } else {
          metasData.longoPrazo.push(meta);
        }
      });
      
      setMetas(metasData);
    } catch (error) {
      console.error('Erro ao carregar dados do Firebase:', error);
      // Fallback para localStorage em caso de erro
      loadLocalStorageData();
    }
  };

  const loadLocalStorageData = () => {
    const savedCandidaturas = localStorage.getItem('carreira_candidaturas');
    const savedMetas = localStorage.getItem('carreira_metas');

    if (savedCandidaturas) setCandidaturas(JSON.parse(savedCandidaturas));
    if (savedMetas) setMetas(JSON.parse(savedMetas));
  };

  // Função para salvar candidatura no Firebase
  const salvarCandidaturaFirebase = async (candidatura) => {
    if (!user) return null;
    
    try {
      const docRef = await addDoc(collection(db, 'candidaturas'), {
        ...candidatura,
        userId: user.uid,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      return docRef.id;
    } catch (error) {
      console.error('Erro ao salvar candidatura:', error);
      return null;
    }
  };

  // Função para salvar meta no Firebase
  const salvarMetaFirebase = async (meta) => {
    if (!user) return null;
    
    try {
      const docRef = await addDoc(collection(db, 'metas_carreira'), {
        ...meta,
        userId: user.uid,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      return docRef.id;
    } catch (error) {
      console.error('Erro ao salvar meta:', error);
      return null;
    }
  };

  // Função para deletar do Firebase
  const deletarDoFirebase = async (collection_name, id) => {
    if (!user || !id) {
      console.log('❌ Usuário não logado ou ID inválido');
      return false;
    }
    
    try {
      console.log(`🗑️ === INICIANDO EXCLUSÃO FIREBASE ===`);
      console.log(`📋 Coleção: ${collection_name}`);
      console.log(`🆔 ID para deletar: ${id}`);
      console.log(`🔤 Tipo do ID: ${typeof id}`);
      console.log(`👤 User ID: ${user.uid}`);
      
      // Primeiro, verificar se o documento realmente existe
      const docRef = doc(db, collection_name, String(id));
      console.log(`📄 Referência criada: ${docRef.path}`);
      
      // Usar getDoc ao invés de getDocs com query
      const docSnap = await getDoc(docRef);
      console.log(`📋 Documento existe? ${docSnap.exists()}`);
      
      if (!docSnap.exists()) {
        console.log('⚠️ DOCUMENTO NÃO EXISTE - Listando todos os documentos do usuário:');
        
        // Listar todos os documentos do usuário para debug
        const userDocsQuery = query(collection(db, collection_name), where('userId', '==', user.uid));
        const userDocs = await getDocs(userDocsQuery);
        console.log(`� Documentos encontrados para o usuário: ${userDocs.docs.length}`);
        
        userDocs.docs.forEach((doc, index) => {
          console.log(`  ${index + 1}. ID: "${doc.id}" | Data:`, {
            empresa: doc.data().empresa,
            vaga: doc.data().vaga,
            userId: doc.data().userId
          });
        });
        
        return false; // Retornar false se não existe
      }
      
      // Verificar se o documento pertence ao usuário
      const docData = docSnap.data();
      if (docData.userId !== user.uid) {
        console.log('❌ ERRO: Documento não pertence ao usuário atual');
        console.log(`   Doc userId: ${docData.userId}`);
        console.log(`   User atual: ${user.uid}`);
        return false;
      }
      
      console.log('✅ Documento validado - Iniciando exclusão...');
      console.log('📄 Dados do documento:', {
        empresa: docData.empresa,
        vaga: docData.vaga,
        userId: docData.userId
      });
      
      // Executar a exclusão
      await deleteDoc(docRef);
      console.log(`🔥 DELETEION EXECUTADO com sucesso!`);
      
      // Aguardar um pouco para garantir sincronização
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Verificar se realmente foi deletado
      const verificaDoc = await getDoc(docRef);
      if (!verificaDoc.exists()) {
        console.log(`✅ CONFIRMADO: Documento ${id} foi REMOVIDO do Firebase`);
        return true;
      } else {
        console.log(`❌ ERRO: Documento ${id} ainda existe após exclusão!`);
        return false;
      }
      
    } catch (error) {
      console.error(`❌ ERRO CRÍTICO ao deletar ${collection_name}/${id}:`, error);
      console.error('🔴 Código do erro:', error.code);
      console.error('🔴 Mensagem:', error.message);
      console.error('🔴 Stack completo:', error.stack);
      
      // Tratar erros específicos
      if (error.code === 'not-found') {
        console.log('⚠️ Documento não encontrado - pode ter sido deletado por outro processo');
        return true;
      }
      
      if (error.code === 'permission-denied') {
        console.log('🚫 Erro de permissão - verificar regras do Firestore');
        return false;
      }
      
      return false;
    }
  };

  // Função para forçar sincronização
  const forcarSincronizacao = async () => {
    if (!user) return;
    
    console.log('🔄 FORÇANDO SINCRONIZAÇÃO com Firebase...');
    
    try {
      // Listar todos os documentos do usuário no Firebase
      console.log('📋 Listando candidaturas no Firebase:');
      const candidaturasQuery = query(
        collection(db, 'candidaturas'), 
        where('userId', '==', user.uid)
      );
      const candidaturasSnap = await getDocs(candidaturasQuery);
      console.log(`📄 ${candidaturasSnap.docs.length} candidaturas encontradas no Firebase`);
      candidaturasSnap.docs.forEach(doc => {
        console.log(`  - ${doc.id}: ${doc.data().empresa || 'N/A'}`);
      });

      console.log('📋 Listando metas no Firebase:');
      const metasQuery = query(
        collection(db, 'metas_carreira'), 
        where('userId', '==', user.uid)
      );
      const metasSnap = await getDocs(metasQuery);
      console.log(`📄 ${metasSnap.docs.length} metas encontradas no Firebase`);
      metasSnap.docs.forEach(doc => {
        console.log(`  - ${doc.id}: ${doc.data().texto || 'N/A'} (${doc.data().tipo})`);
      });
      
      // Recarregar dados
      await loadFirebaseData();
      console.log('✅ Sincronização concluída!');
      
    } catch (error) {
      console.error('❌ Erro na sincronização:', error);
    }
  };

  // Função para debugar documentos do Firebase
  const debugarFirebase = async () => {
    if (!user) {
      console.log('❌ Usuário não logado');
      return;
    }
    
    try {
      console.log('🔍 === DEBUG FIREBASE COMPLETO ===');
      console.log('👤 User ID:', user.uid);
      console.log('📱 Estado Local:');
      console.log('  - Candidaturas:', candidaturas.length);
      console.log('  - Metas CP:', metas.curtoPrazo.length);
      console.log('  - Metas LP:', metas.longoPrazo.length);
      
      // Listar candidaturas do Firebase
      const candidaturasQuery = query(collection(db, 'candidaturas'), where('userId', '==', user.uid));
      const candidaturasSnap = await getDocs(candidaturasQuery);
      console.log('📋 Candidaturas no Firebase:', candidaturasSnap.docs.length);
      candidaturasSnap.docs.forEach(doc => {
        const data = doc.data();
        console.log(`  - ID: ${doc.id}`, {
          empresa: data.empresa,
          vaga: data.vaga,
          userId: data.userId,
          createdAt: data.createdAt
        });
      });
      
      // Listar metas do Firebase
      const metasQuery = query(collection(db, 'metas_carreira'), where('userId', '==', user.uid));
      const metasSnap = await getDocs(metasQuery);
      console.log('🎯 Metas no Firebase:', metasSnap.docs.length);
      metasSnap.docs.forEach(doc => {
        const data = doc.data();
        console.log(`  - ID: ${doc.id}`, {
          texto: data.texto,
          tipo: data.tipo,
          userId: data.userId,
          createdAt: data.createdAt
        });
      });
      
      console.log('🔍 === FIM DEBUG ===');
      
      return {
        candidaturasFirebase: candidaturasSnap.docs.length,
        metasFirebase: metasSnap.docs.length,
        candidaturasLocal: candidaturas.length,
        metasLocal: metas.curtoPrazo.length + metas.longoPrazo.length
      };
    } catch (error) {
      console.error('❌ Erro no debug:', error);
      return null;
    }
  };

  // Função para deletar meta específica (lida com IDs diferentes)
  const deletarMetaFirebase = async (id) => {
    if (!user || !id) {
      console.log('❌ Usuário não logado ou ID inválido para meta');
      return false;
    }
    
    try {
      console.log(`🎯 === EXCLUSÃO DE META ESPECÍFICA ===`);
      console.log(`🆔 ID da meta: ${id}`);
      console.log(`👤 User ID: ${user.uid}`);
      
      // Buscar a meta pelo userId e outros critérios se necessário
      const metasQuery = query(
        collection(db, 'metas_carreira'), 
        where('userId', '==', user.uid)
      );
      const metasSnap = await getDocs(metasQuery);
      
      console.log(`📋 Metas encontradas no Firebase: ${metasSnap.docs.length}`);
      
      let metaEncontrada = null;
      metasSnap.docs.forEach(doc => {
        console.log(`🔍 Verificando meta ${doc.id}:`, doc.data());
        if (doc.id === String(id)) {
          metaEncontrada = doc;
        }
      });
      
      if (!metaEncontrada) {
        console.log('❌ Meta não encontrada no Firebase');
        // Tentar buscar por texto como fallback
        const metaLocal = [...metas.curtoPrazo, ...metas.longoPrazo].find(m => m.id === id);
        if (metaLocal) {
          console.log('🔍 Tentando buscar por texto da meta:', metaLocal.texto);
          const metaPorTexto = metasSnap.docs.find(doc => doc.data().texto === metaLocal.texto);
          if (metaPorTexto) {
            metaEncontrada = metaPorTexto;
            console.log('✅ Meta encontrada por texto!');
          }
        }
      }
      
      if (!metaEncontrada) {
        console.log('❌ Meta definitivamente não encontrada - considerando como já deletada');
        return true;
      }
      
      console.log('🗑️ Deletando meta encontrada:', metaEncontrada.id);
      await deleteDoc(metaEncontrada.ref);
      
      console.log('✅ Meta deletada com sucesso do Firebase');
      return true;
      
    } catch (error) {
      console.error('❌ Erro ao deletar meta:', error);
      return false;
    }
  };
  const limparDocumentosOrfaos = async () => {
    if (!user) {
      console.log('❌ Usuário não logado');
      return;
    }
    
    try {
      console.log('🧹 === LIMPANDO DOCUMENTOS ÓRFÃOS ===');
      
      // Buscar todos os documentos do usuário no Firebase
      const candidaturasQuery = query(collection(db, 'candidaturas'), where('userId', '==', user.uid));
      const candidaturasSnap = await getDocs(candidaturasQuery);
      
      console.log(`📋 Encontrados ${candidaturasSnap.docs.length} documentos no Firebase`);
      console.log(`📱 Estado local tem ${candidaturas.length} candidaturas`);
      
      const idsLocais = candidaturas.map(c => c.id);
      console.log('🗂️ IDs locais:', idsLocais);
      
      let documentosRemovidos = 0;
      
      for (const doc of candidaturasSnap.docs) {
        const docId = doc.id;
        const docData = doc.data();
        
        console.log(`🔍 Analisando documento: ${docId}`);
        console.log(`   Empresa: ${docData.empresa}`);
        console.log(`   Existe no estado local? ${idsLocais.includes(docId)}`);
        
        // Se o documento não existe no estado local, deletar
        if (!idsLocais.includes(docId)) {
          console.log(`🗑️ REMOVENDO documento órfão: ${docId}`);
          try {
            await deleteDoc(doc.ref);
            documentosRemovidos++;
            console.log(`✅ Documento ${docId} removido com sucesso`);
          } catch (error) {
            console.error(`❌ Erro ao remover ${docId}:`, error);
          }
        }
      }
      
      console.log(`🎯 LIMPEZA CONCLUÍDA: ${documentosRemovidos} documentos removidos`);
      
      // Forçar recarregamento dos dados
      await loadFirebaseData();
      
      return documentosRemovidos;
      
    } catch (error) {
      console.error('❌ Erro na limpeza:', error);
      return 0;
    }
  };

  // COMPONENTE: Gerenciador de Estágios
  const GerenciadorEstagios = () => {
    const [novaCandidatura, setNovaCandidatura] = useState({
      empresa: '',
      vaga: '',
      dataEnvio: '',
      fase: 'enviado',
      observacoes: ''
    });
    const [editandoCandidatura, setEditandoCandidatura] = useState(null);

    // Funções para candidatura
    const updateCandidatura = (campo, valor) => {
      setNovaCandidatura(prev => ({ ...prev, [campo]: valor }));
    };

    const iniciarEdicao = (candidatura) => {
      setEditandoCandidatura(candidatura.id);
      setNovaCandidatura({
        empresa: candidatura.empresa,
        vaga: candidatura.vaga,
        dataEnvio: candidatura.dataEnvio,
        fase: candidatura.fase,
        observacoes: candidatura.observacoes || ''
      });
    };

    const cancelarEdicao = () => {
      setEditandoCandidatura(null);
      setNovaCandidatura({ empresa: '', vaga: '', dataEnvio: '', fase: 'enviado', observacoes: '' });
    };

    const salvarEdicao = async () => {
      if (editandoCandidatura && novaCandidatura.empresa && novaCandidatura.vaga) {
        if (user && editandoCandidatura) {
          // Atualizar no Firebase
          try {
            const candidaturaRef = doc(db, 'candidaturas', String(editandoCandidatura));
            await updateDoc(candidaturaRef, {
              ...novaCandidatura,
              updatedAt: new Date()
            });
          } catch (error) {
            console.error('Erro ao atualizar candidatura:', error);
          }
        }
        
        // Atualizar estado local
        const candidaturasAtualizadas = candidaturas.map(c => 
          c.id === editandoCandidatura ? { ...c, ...novaCandidatura } : c
        );
        setCandidaturas(candidaturasAtualizadas);
        localStorage.setItem('carreira_candidaturas', JSON.stringify(candidaturasAtualizadas));
        
        // Resetar formulário
        cancelarEdicao();
      }
    };

    const adicionarCandidatura = async () => {
      if (novaCandidatura.empresa && novaCandidatura.vaga) {
        const candidaturaData = { ...novaCandidatura, id: Date.now() };
        
        if (user) {
          // Salvar no Firebase
          const firebaseId = await salvarCandidaturaFirebase(candidaturaData);
          if (firebaseId) {
            candidaturaData.id = firebaseId;
          }
        }
        
        // Atualizar estado local
        const novasCandidaturas = [...candidaturas, candidaturaData];
        setCandidaturas(novasCandidaturas);
        
        // Salvar no localStorage como backup
        localStorage.setItem('carreira_candidaturas', JSON.stringify(novasCandidaturas));
        
        // Limpar formulário
        setNovaCandidatura({ empresa: '', vaga: '', dataEnvio: '', fase: 'enviado', observacoes: '' });
      }
    };

    const removerCandidatura = async (id) => {
      console.log('🚨 === INICIANDO REMOÇÃO DE CANDIDATURA ===');
      console.log('🆔 ID para deletar:', id);
      console.log('🆔 Tipo do ID:', typeof id);
      console.log('👤 Usuário logado:', !!user);
      console.log('🗂️ Total candidaturas antes:', candidaturas.length);
      
      // Validar se o ID existe nas candidaturas locais
      const candidaturaLocal = candidaturas.find(c => c.id === id);
      if (!candidaturaLocal) {
        console.log('❌ ERRO: Candidatura não encontrada no estado local');
        console.log('🔍 IDs disponíveis:', candidaturas.map(c => c.id));
        return;
      }
      
      console.log('📋 Candidatura encontrada:', candidaturaLocal);
      
      // PRIMEIRO: Deletar do Firebase se usuário logado
      if (user && id) {
        console.log('🔥 Tentando deletar do Firebase...');
        try {
          const sucesso = await deletarDoFirebase('candidaturas', String(id));
          console.log('🔥 Resultado do Firebase:', sucesso ? 'SUCESSO' : 'FALHA');
          
          if (!sucesso) {
            console.log('❌ FALHA no Firebase - Continuando com exclusão local');
            console.log('⚠️ O item será removido localmente mesmo com falha no Firebase');
          }
        } catch (error) {
          console.error('🔥 ERRO CRÍTICO no Firebase:', error);
          console.log('⚠️ Continuando com exclusão local mesmo com erro no Firebase');
        }
      } else {
        console.log('⚠️ PULANDO Firebase - Usuário não logado ou ID inválido');
      }
      
      // SEGUNDO: Atualizar estado local
      console.log('💾 Atualizando estado local...');
      const novasCandidaturas = candidaturas.filter(c => c.id !== id);
      console.log('🗂️ Total candidaturas depois:', novasCandidaturas.length);
      
      setCandidaturas(novasCandidaturas);
      localStorage.setItem('carreira_candidaturas', JSON.stringify(novasCandidaturas));
      
      console.log('✅ REMOÇÃO LOCAL CONCLUÍDA');
      console.log('⏳ Aguardando confirmação do listener Firebase...');
      
      // Opcional: Forçar uma verificação após um tempo
      setTimeout(() => {
        console.log('🔍 Verificação pós-exclusão - candidaturas atuais:', candidaturas.length);
      }, 1000);
    };

    const fases = [
      { value: 'enviado', label: 'Enviado', icon: FaClock, color: '#f59e0b' },
      { value: 'entrevista', label: 'Entrevista', icon: FaUsers, color: '#3b82f6' },
      { value: 'aprovado', label: 'Aprovado', icon: FaCheck, color: '#10b981' },
      { value: 'rejeitado', label: 'Rejeitado', icon: FaTimes, color: '#ef4444' }
    ];

    // Calcular estatísticas - Memoizado para performance
    const estatisticas = useMemo(() => {
      const totalCandidaturas = candidaturas.length;
      const candidaturasEnviadas = candidaturas.filter(c => c.fase === 'enviado').length;
      const entrevistas = candidaturas.filter(c => c.fase === 'entrevista').length;
      const aprovados = candidaturas.filter(c => c.fase === 'aprovado').length;
      const taxaSucesso = totalCandidaturas > 0 ? Math.round((aprovados / totalCandidaturas) * 100) : 0;
      
      return {
        totalCandidaturas,
        candidaturasEnviadas,
        entrevistas,
        aprovados,
        taxaSucesso
      };
    }, [candidaturas]);

    return (
      <div className="feature-content">
        <div className="feature-header">
          <h2><FaBriefcase /> Gerenciador de Estágios & Trainees</h2>
          <p>Acompanhe suas candidaturas e processos seletivos com organização</p>
        </div>

        {/* Dashboard de Estatísticas */}
        <div className="estagios-dashboard">
          <div className="stats-overview-estagios">
            <div className="stat-card main-stat-estagios">
              <div className="stat-icon">
                <FaBriefcase />
              </div>
              <div className="stat-content">
                <h3>Total de Candidaturas</h3>
                <div className="stat-number">{estatisticas.totalCandidaturas}</div>
                <div className="stat-detail">Processos acompanhados</div>
              </div>
              <div className="briefcase-animation">
                <div className="floating-resume"></div>
                <div className="floating-resume delay-1"></div>
                <div className="floating-resume delay-2"></div>
              </div>
            </div>

            <div className="stat-card enviadas">
              <div className="stat-icon enviadas-icon">
                <FaClock />
              </div>
              <div className="stat-content">
                <h3>Enviadas</h3>
                <div className="stat-number">{estatisticas.candidaturasEnviadas}</div>
                <div className="progress-bar-mini">
                  <div className="progress-fill-mini enviadas-fill" style={{width: estatisticas.totalCandidaturas > 0 ? `${(estatisticas.candidaturasEnviadas/estatisticas.totalCandidaturas)*100}%` : '0%'}}></div>
                </div>
              </div>
            </div>

            <div className="stat-card entrevistas">
              <div className="stat-icon entrevistas-icon">
                <FaUsers />
              </div>
              <div className="stat-content">
                <h3>Entrevistas</h3>
                <div className="stat-number">{estatisticas.entrevistas}</div>
                <div className="progress-bar-mini">
                  <div className="progress-fill-mini entrevistas-fill" style={{width: estatisticas.totalCandidaturas > 0 ? `${(estatisticas.entrevistas/estatisticas.totalCandidaturas)*100}%` : '0%'}}></div>
                </div>
              </div>
            </div>

            <div className="stat-card aprovados">
              <div className="stat-icon aprovados-icon">
                <FaCheck />
              </div>
              <div className="stat-content">
                <h3>Aprovados</h3>
                <div className="stat-number">{estatisticas.aprovados}</div>
                <div className="success-rate">Taxa: {estatisticas.taxaSucesso}%</div>
              </div>
            </div>
          </div>
        </div>

        {/* Formulário Nova Candidatura */}
        <div className="candidatura-form-modern">
          <div className="form-header">
            <h3><FaPlus /> {editandoCandidatura ? 'Editar Candidatura' : 'Nova Candidatura'}</h3>
            <p>{editandoCandidatura ? 'Modifique os dados da candidatura' : 'Adicione uma nova oportunidade ao seu acompanhamento'}</p>
          </div>
          
          <div className="form-content">
            <div className="form-grid">
              <div className="input-group">
                <label>Empresa</label>
                <input
                  type="text"
                  placeholder="Nome da empresa"
                  value={novaCandidatura.empresa}
                  onChange={(e) => updateCandidatura('empresa', e.target.value)}
                  className="input-modern"
                />
              </div>
              
              <div className="input-group">
                <label>Vaga</label>
                <input
                  type="text"
                  placeholder="Título da vaga"
                  value={novaCandidatura.vaga}
                  onChange={(e) => updateCandidatura('vaga', e.target.value)}
                  className="input-modern"
                />
              </div>
              
              <div className="input-group">
                <label>Data de Envio</label>
                <input
                  type="date"
                  value={novaCandidatura.dataEnvio}
                  onChange={(e) => updateCandidatura('dataEnvio', e.target.value)}
                  className="input-modern"
                />
              </div>
              
              <div className="input-group">
                <label>Status Atual</label>
                <select
                  value={novaCandidatura.fase}
                  onChange={(e) => updateCandidatura('fase', e.target.value)}
                  className="select-modern"
                >
                  {fases.map(fase => (
                    <option key={fase.value} value={fase.value}>{fase.label}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="input-group full-width">
              <label>Observações</label>
              <textarea
                placeholder="Detalhes sobre o processo, contatos, próximos passos..."
                rows="3"
                value={novaCandidatura.observacoes}
                onChange={(e) => updateCandidatura('observacoes', e.target.value)}
                className="textarea-modern"
              />
            </div>
            
            <div className="form-actions">
              {editandoCandidatura ? (
                <>
                  <button className="btn-primary btn-save-candidatura" onClick={salvarEdicao}>
                    <FaCheck /> Salvar Alterações
                  </button>
                  <button className="btn-secondary btn-cancel-candidatura" onClick={cancelarEdicao}>
                    <FaTimes /> Cancelar
                  </button>
                </>
              ) : (
                <button className="btn-primary btn-add-candidatura" onClick={adicionarCandidatura}>
                  <FaPlus /> Adicionar Candidatura
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Lista de Candidaturas */}
        <div className="candidaturas-section">
          <div className="section-header-estagios">
            <h3><FaClipboardList /> Suas Candidaturas</h3>
            <div className="candidaturas-count">
              {estatisticas.totalCandidaturas} {estatisticas.totalCandidaturas === 1 ? 'candidatura' : 'candidaturas'}
            </div>
          </div>
          
          {candidaturas.length === 0 ? (
            <div className="empty-state-estagios">
              <div className="empty-icon-estagios">
                <FaBriefcase />
              </div>
              <h4>Nenhuma candidatura cadastrada</h4>
              <p>Comece adicionando suas primeiras candidaturas para acompanhar o progresso</p>
            </div>
          ) : (
            <div className="candidaturas-grid-modern">
              {candidaturas.map(candidatura => {
                const faseInfo = fases.find(f => f.value === candidatura.fase);
                const FaseIcon = faseInfo.icon;
                
                return (
                  <div key={candidatura.id} className={`candidatura-card-modern ${candidatura.fase}`}>
                    <div className="candidatura-header-modern">
                      <div className="empresa-info">
                        <h4>{candidatura.empresa}</h4>
                        <p className="vaga-titulo">{candidatura.vaga}</p>
                      </div>
                      <div className={`fase-badge-modern ${candidatura.fase}`}>
                        <FaseIcon className="fase-icon" />
                        <span>{faseInfo.label}</span>
                      </div>
                    </div>
                    
                    <div className="candidatura-details">
                      {candidatura.dataEnvio && (
                        <div className="detail-item">
                          <FaCalendar className="detail-icon" />
                          <span>Enviado em {new Date(candidatura.dataEnvio).toLocaleDateString('pt-BR')}</span>
                        </div>
                      )}
                      
                      {candidatura.observacoes && (
                        <div className="observacoes-modern">
                          <p>{candidatura.observacoes}</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="candidatura-actions">
                      <button 
                        className="btn-edit-modern"
                        onClick={() => iniciarEdicao(candidatura)}
                        title="Editar candidatura"
                      >
                        <FaEdit />
                      </button>
                      <button 
                        className="btn-delete-modern"
                        onClick={() => removerCandidatura(candidatura.id)}
                        title="Remover candidatura"
                      >
                        <FaTrash />
                      </button>
                    </div>
                    
                    <div className={`status-indicator ${candidatura.fase}`}></div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Dicas para Candidaturas */}
        <div className="candidatura-tips">
          <div className="tips-header">
            <h3><FaLightbulb /> Dicas para Candidaturas de Sucesso</h3>
            <p>Estratégias para se destacar nos processos seletivos</p>
          </div>
          
          <div className="tips-grid">
            <div className="tip-card">
              <div className="tip-icon research">
                <FaSearch />
              </div>
              <div className="tip-content">
                <h4>Pesquise a Empresa</h4>
                <p>Conheça a cultura, valores e projetos da empresa antes de se candidatar</p>
              </div>
            </div>
            
            <div className="tip-card">
              <div className="tip-icon customize">
                <FaEdit />
              </div>
              <div className="tip-content">
                <h4>Personalize sua Candidatura</h4>
                <p>Adapte seu currículo e carta de apresentação para cada vaga específica</p>
              </div>
            </div>
            
            <div className="tip-card">
              <div className="tip-icon follow">
                <FaPhone />
              </div>
              <div className="tip-content">
                <h4>Faça Follow-up</h4>
                <p>Entre em contato após 1-2 semanas para demonstrar interesse genuíno</p>
              </div>
            </div>
            
            <div className="tip-card">
              <div className="tip-icon prepare">
                <FaBullseye />
              </div>
              <div className="tip-content">
                <h4>Prepare-se para Entrevistas</h4>
                <p>Pratique respostas para perguntas comuns e prepare perguntas sobre a empresa</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // COMPONENTE: Networking
  const NetworkingGuide = () => {
    const [linkedinProgress, setLinkedinProgress] = useState(0);

    // Calcular progresso do LinkedIn baseado nos checkboxes
    const updateLinkedinProgress = () => {
      const checkboxes = document.querySelectorAll('.checklist-item input[type="checkbox"]');
      const checked = document.querySelectorAll('.checklist-item input[type="checkbox"]:checked');
      const progress = checkboxes.length > 0 ? (checked.length / checkboxes.length) * 100 : 0;
      setLinkedinProgress(progress);
    };

    return (
      <div className="feature-content">
        <div className="feature-header">
          <h2><FaUsers /> Rede de Contatos (Networking)</h2>
          <p>Construa sua rede profissional e amplie suas oportunidades</p>
        </div>

        <div className="networking-dashboard">
          {/* Estatísticas de Networking */}
          <div className="networking-stats">
            <div className="stat-card networking-main">
              <div className="stat-icon">
                <FaUsers />
              </div>
              <div className="stat-content">
                <h3>Sua Rede Profissional</h3>
                <div className="stat-number">Expandindo</div>
                <div className="stat-detail">Construa conexões valiosas</div>
              </div>
              <div className="networking-visual">
                <div className="connection-dots">
                  <div className="dot active"></div>
                  <div className="dot"></div>
                  <div className="dot active"></div>
                  <div className="dot"></div>
                  <div className="connection-line"></div>
                </div>
              </div>
            </div>

            <div className="stat-card linkedin-progress">
              <div className="stat-icon linkedin-icon">
                <FaLinkedin />
              </div>
              <div className="stat-content">
                <h3>LinkedIn</h3>
                <div className="stat-number">{Math.round(linkedinProgress)}%</div>
                <div className="progress-circle-mini">
                  <svg width="40" height="40">
                    <circle cx="20" cy="20" r="16" fill="none" stroke="#e2e8f0" strokeWidth="3"/>
                    <circle 
                      cx="20" 
                      cy="20" 
                      r="16" 
                      fill="none" 
                      stroke="#0077b5" 
                      strokeWidth="3"
                      strokeDasharray={`${linkedinProgress * 1.005} 100.5`}
                      strokeLinecap="round"
                      transform="rotate(-90 20 20)"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="networking-sections">
          {/* LinkedIn Profissional */}
          <div className="networking-card linkedin-card">
            <div className="card-header">
              <div className="header-content">
                <h3><FaLinkedin /> LinkedIn Profissional</h3>
                <p>Complete seu perfil para maximizar oportunidades</p>
              </div>
              <div className="progress-badge">
                {Math.round(linkedinProgress)}% Completo
              </div>
            </div>

            <div className="checklist-modern">
              <div className="checklist-item">
                <input type="checkbox" id="foto" onChange={updateLinkedinProgress} />
                <label htmlFor="foto">
                  <span className="checkmark-modern">
                    <FaCheck className="check-icon-modern" />
                  </span>
                  <div className="item-content">
                    <span className="item-title">Foto profissional de qualidade</span>
                    <span className="item-desc">Uma foto clara e profissional aumenta visualizações</span>
                  </div>
                </label>
              </div>
              
              <div className="checklist-item">
                <input type="checkbox" id="headline" onChange={updateLinkedinProgress} />
                <label htmlFor="headline">
                  <span className="checkmark-modern">
                    <FaCheck className="check-icon-modern" />
                  </span>
                  <div className="item-content">
                    <span className="item-title">Headline atrativa e clara</span>
                    <span className="item-desc">Descreva sua área e objetivo profissional</span>
                  </div>
                </label>
              </div>
              
              <div className="checklist-item">
                <input type="checkbox" id="resumo" onChange={updateLinkedinProgress} />
                <label htmlFor="resumo">
                  <span className="checkmark-modern">
                    <FaCheck className="check-icon-modern" />
                  </span>
                  <div className="item-content">
                    <span className="item-title">Resumo completo e bem escrito</span>
                    <span className="item-desc">Conte sua história profissional</span>
                  </div>
                </label>
              </div>
              
              <div className="checklist-item">
                <input type="checkbox" id="experiencias" onChange={updateLinkedinProgress} />
                <label htmlFor="experiencias">
                  <span className="checkmark-modern">
                    <FaCheck className="check-icon-modern" />
                  </span>
                  <div className="item-content">
                    <span className="item-title">Experiências detalhadas</span>
                    <span className="item-desc">Inclua projetos, estágios e trabalhos voluntários</span>
                  </div>
                </label>
              </div>
              
              <div className="checklist-item">
                <input type="checkbox" id="habilidades" onChange={updateLinkedinProgress} />
                <label htmlFor="habilidades">
                  <span className="checkmark-modern">
                    <FaCheck className="check-icon-modern" />
                  </span>
                  <div className="item-content">
                    <span className="item-title">Habilidades relevantes</span>
                    <span className="item-desc">Adicione pelo menos 10 habilidades da sua área</span>
                  </div>
                </label>
              </div>
              
              <div className="checklist-item">
                <input type="checkbox" id="conexoes" onChange={updateLinkedinProgress} />
                <label htmlFor="conexoes">
                  <span className="checkmark-modern">
                    <FaCheck className="check-icon-modern" />
                  </span>
                  <div className="item-content">
                    <span className="item-title">Pelo menos 50 conexões</span>
                    <span className="item-desc">Conecte-se com colegas, professores e profissionais</span>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Estratégias de Networking */}
          <div className="networking-card strategies-card">
            <div className="card-header">
              <div className="header-content">
                <h3><FaComments /> Estratégias de Networking</h3>
                <p>Dicas para construir relacionamentos profissionais autênticos</p>
              </div>
            </div>
            
            <div className="strategies-grid">
              <div className="strategy-item">
                <div className="strategy-icon genuine">
                  <FaHeart />
                </div>
                <div className="strategy-content">
                  <h4>Seja Genuíno</h4>
                  <p>Construa relacionamentos reais, não apenas colete contatos. Mostre interesse sincero nas pessoas.</p>
                </div>
              </div>
              
              <div className="strategy-item">
                <div className="strategy-icon value">
                  <FaGem />
                </div>
                <div className="strategy-content">
                  <h4>Ofereça Valor</h4>
                  <p>Pense em como você pode ajudar antes de pedir ajuda. Compartilhe conhecimento e oportunidades.</p>
                </div>
              </div>
              
              <div className="strategy-item">
                <div className="strategy-icon maintain">
                  <FaLink />
                </div>
                <div className="strategy-content">
                  <h4>Mantenha Contato</h4>
                  <p>Não desapareça após o primeiro contato. Cultive relacionamentos com interações regulares.</p>
                </div>
              </div>
              
              <div className="strategy-item">
                <div className="strategy-icon proactive">
                  <FaRocket />
                </div>
                <div className="strategy-content">
                  <h4>Seja Proativo</h4>
                  <p>Não espere as oportunidades chegarem. Participe de eventos e tome iniciativa.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Eventos e Oportunidades */}
          <div className="networking-card events-card">
            <div className="card-header">
              <div className="header-content">
                <h3><FaBullseye /> Eventos e Oportunidades</h3>
                <p>Onde encontrar e como aproveitar oportunidades de networking</p>
              </div>
            </div>
            
            <div className="events-grid">
              <div className="event-item online">
                <div className="event-icon">
                  <FaLaptop />
                </div>
                <div className="event-content">
                  <h4>Eventos Online</h4>
                  <p>Webinars, lives no LinkedIn e conferências virtuais são ótimas para começar</p>
                  <div className="event-tags">
                    <span className="tag">Acessível</span>
                    <span className="tag">Global</span>
                  </div>
                </div>
              </div>
              
              <div className="event-item university">
                <div className="event-icon">
                  <FaGraduationCap />
                </div>
                <div className="event-content">
                  <h4>Feiras de Carreira</h4>
                  <p>Participe de feiras nas universidades e leve currículos impressos</p>
                  <div className="event-tags">
                    <span className="tag">Presencial</span>
                    <span className="tag">Local</span>
                  </div>
                </div>
              </div>
              
              <div className="event-item meetups">
                <div className="event-icon">
                  <FaUserFriends />
                </div>
                <div className="event-content">
                  <h4>Meetups e Grupos</h4>
                  <p>Participe de grupos no Telegram/WhatsApp e meetups da sua área</p>
                  <div className="event-tags">
                    <span className="tag">Comunidade</span>
                    <span className="tag">Específico</span>
                  </div>
                </div>
              </div>
              
              <div className="event-item pitch">
                <div className="event-icon">
                  <FaBullseye />
                </div>
                <div className="event-content">
                  <h4>Elevator Pitch</h4>
                  <p>Pratique sua apresentação pessoal de 30 segundos para causar boa impressão</p>
                  <div className="event-tags">
                    <span className="tag">Essencial</span>
                    <span className="tag">Prática</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Dicas Avançadas */}
          <div className="networking-card tips-card">
            <div className="card-header">
              <div className="header-content">
                <h3><FaLightbulb /> Dicas Avançadas</h3>
                <p>Estratégias para se destacar no networking profissional</p>
              </div>
            </div>
            
            <div className="advanced-tips">
              <div className="tip-item">
                <div className="tip-number">01</div>
                <div className="tip-content">
                  <h4>Pesquise antes dos eventos</h4>
                  <p>Identifique palestrantes e participantes interessantes. Prepare perguntas específicas e relevantes.</p>
                </div>
              </div>
              
              <div className="tip-item">
                <div className="tip-number">02</div>
                <div className="tip-content">
                  <h4>Follow-up em até 48h</h4>
                  <p>Envie uma mensagem personalizada mencionando onde se conheceram e sugerindo próximos passos.</p>
                </div>
              </div>
              
              <div className="tip-item">
                <div className="tip-number">03</div>
                <div className="tip-content">
                  <h4>Crie conteúdo relevante</h4>
                  <p>Compartilhe insights, artigos e experiências. Isso ajuda a construir sua presença digital.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // COMPONENTE: Plano de Desenvolvimento
  const PlanoDesenvolvimento = () => {
    const [novaMeta, setNovaMeta] = useState({ texto: '', tipo: 'curtoPrazo', concluida: false });
    const [editandoMeta, setEditandoMeta] = useState(null);

    // Função para atualizar nova meta
    const updateNovaMeta = (campo, valor) => {
      setNovaMeta(prev => ({ ...prev, [campo]: valor }));
    };

    const iniciarEdicaoMeta = (meta) => {
      setEditandoMeta(meta.id);
      setNovaMeta({
        texto: meta.texto,
        tipo: meta.tipo,
        concluida: meta.concluida
      });
    };

    const cancelarEdicaoMeta = () => {
      setEditandoMeta(null);
      setNovaMeta({ texto: '', tipo: 'curtoPrazo', concluida: false });
    };

    const salvarEdicaoMeta = async () => {
      if (editandoMeta && novaMeta.texto.trim()) {
        if (user && editandoMeta) {
          // Atualizar no Firebase
          try {
            const metaRef = doc(db, 'metas_carreira', String(editandoMeta));
            await updateDoc(metaRef, {
              ...novaMeta,
              updatedAt: new Date()
            });
          } catch (error) {
            console.error('Erro ao atualizar meta:', error);
          }
        }
        
        // Atualizar estado local
        const metasAtualizadas = { ...metas };
        Object.keys(metasAtualizadas).forEach(tipo => {
          metasAtualizadas[tipo] = metasAtualizadas[tipo].map(m => 
            m.id === editandoMeta ? { ...m, ...novaMeta } : m
          );
        });
        setMetas(metasAtualizadas);
        localStorage.setItem('carreira_metas', JSON.stringify(metasAtualizadas));
        
        // Resetar formulário
        cancelarEdicaoMeta();
      }
    };

    const adicionarMeta = async () => {
      if (novaMeta.texto.trim()) {
        const metaData = { ...novaMeta, id: Date.now() };
        
        if (user) {
          // Salvar no Firebase
          const firebaseId = await salvarMetaFirebase(metaData);
          if (firebaseId) {
            metaData.id = firebaseId;
          }
        }
        
        // Atualizar estado local
        const novasMetas = {
          ...metas,
          [novaMeta.tipo]: [...metas[novaMeta.tipo], metaData]
        };
        setMetas(novasMetas);
        localStorage.setItem('carreira_metas', JSON.stringify(novasMetas));
        setNovaMeta({ texto: '', tipo: 'curtoPrazo', concluida: false });
      }
    };

    const toggleMeta = async (tipo, id) => {
      if (user && id) {
        // Atualizar no Firebase
        try {
          const metaRef = doc(db, 'metas_carreira', String(id));
          const metaAtual = metas[tipo].find(m => m.id === id);
          await updateDoc(metaRef, { 
            concluida: !metaAtual.concluida,
            updatedAt: new Date()
          });
        } catch (error) {
          console.error('Erro ao atualizar meta:', error);
        }
      }
      
      // Atualizar estado local
      const novasMetas = {
        ...metas,
        [tipo]: metas[tipo].map(meta => 
          meta.id === id ? { ...meta, concluida: !meta.concluida } : meta
        )
      };
      setMetas(novasMetas);
      localStorage.setItem('carreira_metas', JSON.stringify(novasMetas));
    };

    const removerMeta = async (tipo, id) => {
      console.log('🚨 === INICIANDO REMOÇÃO DE META ===');
      console.log('🆔 ID para deletar:', id);
      console.log('🆔 Tipo do ID:', typeof id);
      console.log('📁 Tipo:', tipo);
      console.log('👤 Usuário logado:', !!user);
      console.log('🗂️ Total metas antes:', metas.curtoPrazo.length + metas.longoPrazo.length);
      
      // Validar se o ID existe nas metas locais
      const metaLocal = metas[tipo].find(m => m.id === id);
      if (!metaLocal) {
        console.log('❌ ERRO: Meta não encontrada no estado local');
        console.log('🔍 IDs disponíveis:', metas[tipo].map(m => m.id));
        return;
      }
      
      console.log('📋 Meta encontrada:', metaLocal);
      
      // PRIMEIRO: Deletar do Firebase se usuário logado
      if (user && id) {
        console.log('🔥 Tentando deletar meta do Firebase...');
        try {
          const sucesso = await deletarMetaFirebase(id);
          console.log('🔥 Resultado do Firebase:', sucesso ? 'SUCESSO' : 'FALHA');
          
          if (!sucesso) {
            console.log('❌ FALHA no Firebase - Continuando com exclusão local');
            console.log('⚠️ A meta será removida localmente mesmo com falha no Firebase');
          }
        } catch (error) {
          console.error('🔥 ERRO CRÍTICO no Firebase:', error);
          console.log('⚠️ Continuando com exclusão local mesmo com erro no Firebase');
        }
      } else {
        console.log('⚠️ PULANDO Firebase - Usuário não logado ou ID inválido');
      }
      
      // SEGUNDO: Atualizar estado local
      console.log('💾 Atualizando estado local...');
      const novasMetas = {
        ...metas,
        [tipo]: metas[tipo].filter(meta => meta.id !== id)
      };
      console.log('🗂️ Total metas depois:', novasMetas.curtoPrazo.length + novasMetas.longoPrazo.length);
      
      setMetas(novasMetas);
      localStorage.setItem('carreira_metas', JSON.stringify(novasMetas));
      
      console.log('✅ REMOÇÃO LOCAL DE META CONCLUÍDA');
      console.log('⏳ Aguardando confirmação do listener Firebase...');
      
      // Opcional: Forçar uma verificação após um tempo
      setTimeout(() => {
        console.log('🔍 Verificação pós-exclusão - metas atuais:', metas.curtoPrazo.length + metas.longoPrazo.length);
      }, 1000);
    };

    // Calcular estatísticas - Memoizado para performance
    const estatisticasMetas = useMemo(() => {
      const totalMetas = metas.curtoPrazo.length + metas.longoPrazo.length;
      const metasConcluidas = metas.curtoPrazo.filter(m => m.concluida).length + metas.longoPrazo.filter(m => m.concluida).length;
      const progressoGeral = totalMetas > 0 ? Math.round((metasConcluidas / totalMetas) * 100) : 0;
      const progressoCurtoPrazo = metas.curtoPrazo.length > 0 ? Math.round((metas.curtoPrazo.filter(m => m.concluida).length / metas.curtoPrazo.length) * 100) : 0;
      const progressoLongoPrazo = metas.longoPrazo.length > 0 ? Math.round((metas.longoPrazo.filter(m => m.concluida).length / metas.longoPrazo.length) * 100) : 0;
      
      return {
        totalMetas,
        metasConcluidas,
        progressoGeral,
        progressoCurtoPrazo,
        progressoLongoPrazo
      };
    }, [metas]);

    return (
      <div className="feature-content">
        <div className="feature-header">
          <h2><FaBullseye /> Plano de Desenvolvimento</h2>
          <p>Trace suas metas e acompanhe seu crescimento profissional</p>
        </div>

        {/* Dashboard de Estatísticas */}
        <div className="desenvolvimento-dashboard">
          <div className="stats-overview">
            <div className="stat-card main-stat">
              <div className="stat-icon">
                <FaChartBar />
              </div>
              <div className="stat-content">
                <h3>Progresso Geral</h3>
                <div className="stat-number">{estatisticasMetas.progressoGeral}%</div>
                <div className="stat-detail">{estatisticasMetas.metasConcluidas} de {estatisticasMetas.totalMetas} metas concluídas</div>
              </div>
              <div className="progress-ring">
                <svg width="60" height="60">
                  <circle cx="30" cy="30" r="25" fill="none" stroke="#e2e8f0" strokeWidth="4"/>
                  <circle 
                    cx="30" 
                    cy="30" 
                    r="25" 
                    fill="none" 
                    stroke="#3b82f6" 
                    strokeWidth="5"
                    strokeDasharray={`${estatisticasMetas.progressoGeral * 1.57} 157`}
                    strokeLinecap="round"
                    transform="rotate(-90 30 30)"
                  />
                </svg>
              </div>
            </div>

            <div className="stat-card curto-prazo">
              <div className="stat-icon short-term">
                <FaBolt />
              </div>
              <div className="stat-content">
                <h3>Curto Prazo</h3>
                <div className="stat-number">{metas.curtoPrazo.filter(m => m.concluida).length}/{metas.curtoPrazo.length}</div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{width: `${estatisticasMetas.progressoCurtoPrazo}%`}}></div>
                </div>
              </div>
            </div>

            <div className="stat-card longo-prazo">
              <div className="stat-icon long-term">
                <FaBullseye />
              </div>
              <div className="stat-content">
                <h3>Longo Prazo</h3>
                <div className="stat-number">{metas.longoPrazo.filter(m => m.concluida).length}/{metas.longoPrazo.length}</div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{width: `${estatisticasMetas.progressoLongoPrazo}%`}}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Formulário Nova Meta */}
        <div className="meta-form-card">
          <div className="form-header">
            <h3><FaPlus /> {editandoMeta ? 'Editar Meta' : 'Adicionar Nova Meta'}</h3>
            <p>{editandoMeta ? 'Modifique os detalhes da sua meta' : 'Defina objetivos claros para seu desenvolvimento profissional'}</p>
          </div>
          <div className="form-grid">
            <input
              type="text"
              placeholder="Ex: Aprender Excel avançado, Conseguir estágio na área..."
              value={novaMeta.texto}
              onChange={(e) => updateNovaMeta('texto', e.target.value)}
              className="meta-input"
            />
            <select
              value={novaMeta.tipo}
              onChange={(e) => updateNovaMeta('tipo', e.target.value)}
              className="meta-select"
            >
              <option value="curtoPrazo">Curto Prazo (até 6 meses)</option>
              <option value="longoPrazo">Longo Prazo (6+ meses)</option>
            </select>
            
            <div className="form-actions">
              {editandoMeta ? (
                <>
                  <button className="btn-primary btn-save-meta" onClick={salvarEdicaoMeta}>
                    <FaCheck /> Salvar Alterações
                  </button>
                  <button className="btn-secondary btn-cancel-meta" onClick={cancelarEdicaoMeta}>
                    <FaTimes /> Cancelar
                  </button>
                </>
              ) : (
                <button className="btn-primary btn-add-meta" onClick={adicionarMeta}>
                  <FaPlus /> Adicionar Meta
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Seção de Metas */}
        <div className="metas-container">
          {/* Metas de Curto Prazo */}
          <div className="metas-section curto-prazo">
            <div className="section-header">
              <div className="section-icon">
                <FaBolt />
              </div>
              <div className="section-info">
                <h3>Metas de Curto Prazo</h3>
                <span className="meta-count">{metas.curtoPrazo.length} {metas.curtoPrazo.length === 1 ? 'meta' : 'metas'}</span>
              </div>
              <div className="section-progress">
                {estatisticasMetas.progressoCurtoPrazo}%
              </div>
            </div>
            
            <div className="metas-list">
              {metas.curtoPrazo.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon"><FaBolt /></div>
                  <p>Nenhuma meta de curto prazo definida</p>
                  <small>Comece definindo objetivos para os próximos 6 meses</small>
                </div>
              ) : (
                metas.curtoPrazo.map(meta => (
                  <div key={meta.id} className={`meta-item ${meta.concluida ? 'concluida' : ''}`}>
                    <div className="meta-checkbox">
                      <input
                        type="checkbox"
                        id={`curto-${meta.id}`}
                        checked={meta.concluida}
                        onChange={() => toggleMeta('curtoPrazo', meta.id)}
                      />
                      <label htmlFor={`curto-${meta.id}`} className="custom-checkbox">
                        <FaCheck className="check-icon" />
                      </label>
                    </div>
                    <div className="meta-content">
                      <span className="meta-texto">{meta.texto}</span>
                      {meta.concluida && <span className="meta-badge">Concluída</span>}
                    </div>
                    <div className="meta-actions">
                      <button 
                        className="btn-edit"
                        onClick={() => iniciarEdicaoMeta(meta)}
                        title="Editar meta"
                      >
                        <FaEdit />
                      </button>
                      <button 
                        className="btn-delete"
                        onClick={() => removerMeta('curtoPrazo', meta.id)}
                        title="Remover meta"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Metas de Longo Prazo */}
          <div className="metas-section longo-prazo">
            <div className="section-header">
              <div className="section-icon">
                <FaBullseye />
              </div>
              <div className="section-info">
                <h3>Metas de Longo Prazo</h3>
                <span className="meta-count">{metas.longoPrazo.length} {metas.longoPrazo.length === 1 ? 'meta' : 'metas'}</span>
              </div>
              <div className="section-progress">
                {estatisticasMetas.progressoLongoPrazo}%
              </div>
            </div>
            
            <div className="metas-list">
              {metas.longoPrazo.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon"><FaBullseye /></div>
                  <p>Nenhuma meta de longo prazo definida</p>
                  <small>Pense em objetivos para sua carreira futura</small>
                </div>
              ) : (
                metas.longoPrazo.map(meta => (
                  <div key={meta.id} className={`meta-item ${meta.concluida ? 'concluida' : ''}`}>
                    <div className="meta-checkbox">
                      <input
                        type="checkbox"
                        id={`longo-${meta.id}`}
                        checked={meta.concluida}
                        onChange={() => toggleMeta('longoPrazo', meta.id)}
                      />
                      <label htmlFor={`longo-${meta.id}`} className="custom-checkbox">
                        <FaCheck className="check-icon" />
                      </label>
                    </div>
                    <div className="meta-content">
                      <span className="meta-texto">{meta.texto}</span>
                      {meta.concluida && <span className="meta-badge">Concluída</span>}
                    </div>
                    <div className="meta-actions">
                      <button 
                        className="btn-edit"
                        onClick={() => iniciarEdicaoMeta(meta)}
                        title="Editar meta"
                      >
                        <FaEdit />
                      </button>
                      <button 
                        className="btn-delete"
                        onClick={() => removerMeta('longoPrazo', meta.id)}
                        title="Remover meta"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Exemplos de Metas */}
        <div className="exemplos-metas-card">
          <div className="tips">
            <h4><FaLightbulb /> Ideias para suas Metas:</h4>
            <div className="dicas-cards">
              <div className="dica-card">
                <div className="dica-icon"><FaBolt /></div>
                <h5>Curto Prazo</h5>
                <p>Fazer curso de Excel, atualizar LinkedIn, participar de eventos</p>
              </div>
              <div className="dica-card">
                <div className="dica-icon"><FaBullseye /></div>
                <h5>Longo Prazo</h5>
                <p>Conseguir primeiro emprego, fazer especialização, aprender inglês</p>
              </div>
              <div className="dica-card">
                <div className="dica-icon"><FaBook /></div>
                <h5>Capacitação</h5>
                <p>Cursos online, certificações profissionais, projetos pessoais</p>
              </div>
              <div className="dica-card">
                <div className="dica-icon"><FaNetworkWired /></div>
                <h5>Networking</h5>
                <p>Expandir rede de contatos, participar de comunidades profissionais</p>
              </div>
            </div>
          </div>
        </div>

        {/* Motivação */}
        <div className="motivacao-card">
          <div className="motivacao-content">
            <div className="motivacao-icon">
              <FaTrophy />
            </div>
            <div className="motivacao-text">
              <h3>Continue assim!</h3>
              <p>Cada meta concluída é um passo importante na sua jornada profissional. Mantenha o foco e celebre suas conquistas!</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="modulo-carreira">
      <div className="carreira-container">
        {/* Botão de volta ao dashboard */}
        <div className="back-to-dashboard">
          <button 
            className="btn-back-dashboard" 
            onClick={handleBackToDashboard}
          >
            <FaArrowLeft />
            Voltar ao Dashboard
          </button>
        </div>

        {/* Header com título */}
        <div className="carreira-header">
          <div className="header-icon">
            <FaGraduationCap />
          </div>
          <h1 className="carreira-title">
            <div className="title-decorative-icons">
              <div className="decorative-icon left-icon">
                <FaStar />
              </div>
              <div className="decorative-icon right-icon">
                <FaTrophy />
              </div>
            </div>
            Desenvolvimento de Carreira
          </h1>
          <p className="carreira-subtitle">
            Desenvolva suas habilidades profissionais e construa uma carreira sólida
          </p>
        </div>

        {/* Navegação por abas */}
        <div className="carreira-navigation">
          {tabs.map(tab => {
            const IconeTab = tab.icone;
            return (
              <button
                key={tab.id}
                className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => handleTabChange(tab.id)}
              >
                <IconeTab />
                {tab.nome}
              </button>
            );
          })}
        </div>

        {/* Status Firebase */}
        <div className="firebase-status-message">
          {loading ? (
            <div className="status-loading">
              <FaClock className="status-icon spinning" />
              <span>Carregando dados...</span>
            </div>
          ) : user ? (
            <div className="status-connected">
              <FaCheck className="status-icon" />
              <FaCloudUploadAlt className="status-icon-secondary" />
              <span>Todos os dados estão salvos automaticamente no Firebase</span>
            </div>
          ) : (
            <div className="status-offline">
              <FaTimes className="status-icon" />
              <span>Dados salvos localmente - Faça login para sincronizar</span>
            </div>
          )}
        </div>

        {/* Conteúdo da aba ativa */}
        <div className="carreira-content">
          {renderActiveTab()}
        </div>
      </div>
    </div>
  );
};

export default ModuloCarreira;
