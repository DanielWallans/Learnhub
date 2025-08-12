import React, { useState, useEffect } from 'react';
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
  onSnapshot
} from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { 
  FaBook, FaBullseye, FaEdit, FaSync, FaClock, FaPalette, FaChartLine, FaUsers, 
  FaBan, FaCheck, FaRocket, FaRobot, FaWalking, FaWater, FaBed, FaAppleAlt, 
  FaRunning, FaDumbbell, FaOm, FaMobile, FaStrongArm, FaUtensils, FaBrain, 
  FaPencilAlt, FaCamera, FaStar, FaTheaterMasks, FaRedo, FaGraduationCap, 
  FaMoneyBillWave, FaHandPaper, FaSmile, FaParty, FaComments, FaHandshake, 
  FaPhone, FaMicrophone, FaGlobe, FaLightbulb, FaFire, FaClipboardList, 
  FaTimes, FaExclamationTriangle, FaStop, FaEar
} from 'react-icons/fa';
import './Habilidades.css';

const Habilidades = () => {
  const navigate = useNavigate();
  const [user, loading, error] = useAuthState(auth);
  
  const [habilidades, setHabilidades] = useState([]);

  const [novaHabilidade, setNovaHabilidade] = useState({
    nome: '',
    categoria: 'Estudo',
    descricao: '',
    nivel: 'Iniciante',
    meta: '',
    prazo: '1 mês',
    dataInicio: new Date().toISOString().split('T')[0]
  });

  const [habilidadeEditando, setHabilidadeEditando] = useState(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [filtroCategoria, setFiltroCategoria] = useState('Todas');
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);

  const categorias = ['Todas', 'Estudo', 'Produtividade', 'Saúde', 'Criatividade', 'Social'];
  const niveis = ['Iniciante', 'Intermediário', 'Avançado'];
  const prazos = ['1 dia', '1 semana', '2 semanas', '1 mês', '3 meses', '6 meses', '1 ano', 'Personalizado'];

  // Sistema de dicas personalizadas
  const obterDicasHabilidade = (categoria, nivel, progresso) => {
    const dicasPorCategoria = {
      'Estudo': {
        'Iniciante': [
          '<FaBook /> Comece com sessões de 15-20 minutos para criar o hábito',
          '<FaBullseye /> Defina um horário fixo para estudar todos os dias',
          '<FaEdit /> Use técnicas simples como resumos e mapas mentais',
          '<FaSync /> Revise o conteúdo no dia seguinte para fixar'
        ],
        'Intermediário': [
          '<FaClock /> Aplique a técnica Pomodoro (25min estudo + 5min pausa)',
          '<FaPalette /> Varie as técnicas: flashcards, diagramas, explicação oral',
          '<FaChartLine /> Acompanhe seu desempenho e identifique pontos fracos',
          '<FaUsers /> Forme grupos de estudo ou encontre um parceiro'
        ],
        'Avançado': [
          '<FaBrain /> Use técnicas avançadas como método Feynman e spaced repetition',
          '<FaChartLine /> Crie um sistema de revisão espaçada personalizado',
          '<FaGraduationCap /> Ensine outros para consolidar seu conhecimento',
          '<FaBrain /> Aplique o conhecimento em projetos práticos'
        ]
      },
      'Produtividade': {
        'Iniciante': [
          '<FaClipboardList /> Faça uma lista simples de 3 tarefas prioritárias por dia',
          '<FaClock /> Use um timer para controlar o tempo das atividades',
          '<FaBan /> Elimine uma distração por vez (celular, redes sociais)',
          '<FaCheck /> Comemore pequenas conquistas para manter a motivação'
        ],
        'Intermediário': [
          '<FaBullseye /> Implemente a matriz de Eisenhower (urgente vs importante)',
          '<FaMobile /> Use aplicativos de produtividade como Todoist ou Notion',
          '<FaSync /> Estabeleça rotinas matinais e noturnas consistentes',
          '<FaChartLine /> Analise semanalmente onde seu tempo está sendo gasto'
        ],
        'Avançado': [
          '<FaRocket /> Domine técnicas como GTD (Getting Things Done)',
          '<FaRobot /> Automatize tarefas repetitivas sempre que possível',
          '<FaChartLine /> Otimize fluxos de trabalho com ferramentas avançadas',
          '<FaPalette /> Desenvolva sistemas personalizados de organização'
        ]
      },
      'Saúde': {
        'Iniciante': [
          '<FaWalking /> Comece com caminhadas de 10-15 minutos diários',
          '<FaWater /> Beba um copo de água ao acordar e antes das refeições',
          '<FaBed /> Estabeleça um horário fixo para dormir e acordar',
          '<FaAppleAlt /> Inclua uma fruta ou vegetal em cada refeição'
        ],
        'Intermediário': [
          '<FaRunning /> Alterne entre exercícios aeróbicos e de força',
          '<FaAppleAlt /> Planeje refeições semanalmente e prepare marmitas',
          '<FaOm /> Pratique 10 minutos de meditação ou respiração',
          '<FaMobile /> Use apps para monitorar atividade física e sono'
        ],
        'Avançado': [
          '<FaDumbbell /> Crie um programa de treino periodizado e progressivo',
          '<FaUtensils /> Calcule macronutrientes e ajuste dieta aos objetivos',
          '<FaBrain /> Integre práticas de mindfulness no dia a dia',
          '<FaChartLine /> Monitore biomarcadores e ajuste estratégias'
        ]
      },
      'Criatividade': {
        'Iniciante': [
          '<FaPencilAlt /> Dedique 10 minutos diários para desenhar ou escrever',
          '<FaPalette /> Experimente uma nova técnica criativa por semana',
          '<FaCamera /> Documente ideias criativas em um caderno ou app',
          '<FaStar /> Não julgue suas criações, foque no processo'
        ],
        'Intermediário': [
          '<FaTheaterMasks /> Combine diferentes formas de arte (música + visual)',
          '<FaUsers /> Participe de comunidades criativas online ou presenciais',
          '<FaRedo /> Estabeleça projetos criativos com prazos definidos',
          '<FaBook /> Estude trabalhos de artistas que você admira'
        ],
        'Avançado': [
          '<FaRocket /> Desenvolva seu estilo único e assinatura criativa',
          '<FaMoneyBillWave /> Monetize suas criações através de plataformas digitais',
          '<FaGraduationCap /> Ensine sua arte para outros e receba feedback',
          '<FaGlobe /> Participe de concursos e exposições para visibilidade'
        ]
      },
      'Social': {
        'Iniciante': [
          '<FaHandPaper /> Cumprimente uma pessoa nova por dia',
          '<FaEar /> Pratique escuta ativa em conversas',
          '<FaSmile /> Sorria mais e mantenha contato visual',
          '<FaMobile /> Limite uso de redes sociais durante interações'
        ],
        'Intermediário': [
          '<FaParty /> Participe de eventos e atividades em grupo',
          '<FaComments /> Inicie conversas sobre interesses em comum',
          '<FaHandshake /> Ofereça ajuda e apoio quando apropriado',
          '<FaPhone /> Mantenha contato regular com amigos e família'
        ],
        'Avançado': [
          '<FaMicrophone /> Desenvolva habilidades de apresentação e oratória',
          '<FaGlobe /> Construa uma rede profissional sólida',
          '<FaUsers /> Lidere grupos ou projetos colaborativos',
          '<FaBrain /> Pratique empatia e inteligência emocional'
        ]
      }
    };

    const dicasCategoria = dicasPorCategoria[categoria] || dicasPorCategoria['Estudo'];
    const dicasNivel = dicasCategoria[nivel] || dicasCategoria['Iniciante'];
    
    // Seleciona dicas baseadas no progresso
    if (progresso < 25) {
      return dicasNivel.slice(0, 2); // Primeiras 2 dicas para iniciantes
    } else if (progresso < 75) {
      return dicasNivel.slice(1, 3); // Dicas intermediárias
    } else {
      return dicasNivel.slice(2, 4); // Dicas avançadas
    }
  };

  // Carregar habilidades do Firebase
  useEffect(() => {
    if (!user) {
      setCarregando(false);
      return;
    }

    console.log('🔥 Configurando listener Firebase para habilidades...');
    const habilidadesQuery = query(
      collection(db, 'habilidades'),
      where('userId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(habilidadesQuery, (snapshot) => {
      const habilidadesData = [];
      snapshot.docs.forEach(doc => {
        habilidadesData.push({ id: doc.id, ...doc.data() });
      });
      
      console.log(`📋 ${habilidadesData.length} habilidades carregadas do Firebase`);
      setHabilidades(habilidadesData);
      setCarregando(false);
    }, (error) => {
      console.error('❌ Erro ao carregar habilidades:', error);
      setCarregando(false);
    });

    return () => {
      console.log('🛑 Desconectando listener de habilidades');
      unsubscribe();
    };
  }, [user]);

  // Função para calcular data de conclusão baseada no prazo
  const calcularDataConclusao = (dataInicio, prazo) => {
    const data = new Date(dataInicio);
    
    switch (prazo) {
      case '1 dia':
        data.setDate(data.getDate() + 1);
        break;
      case '1 semana':
        data.setDate(data.getDate() + 7);
        break;
      case '2 semanas':
        data.setDate(data.getDate() + 14);
        break;
      case '1 mês':
        data.setMonth(data.getMonth() + 1);
        break;
      case '3 meses':
        data.setMonth(data.getMonth() + 3);
        break;
      case '6 meses':
        data.setMonth(data.getMonth() + 6);
        break;
      case '1 ano':
        data.setFullYear(data.getFullYear() + 1);
        break;
      default:
        data.setMonth(data.getMonth() + 1); // Default para 1 mês
    }
    
    return data.toISOString().split('T')[0];
  };

  // Função para iniciar edição de habilidade
  const iniciarEdicao = (habilidade) => {
    setHabilidadeEditando({
      ...habilidade,
      dataInicio: habilidade.dataInicio || new Date().toISOString().split('T')[0],
      prazo: habilidade.prazo || '1 mês'
    });
    setModoEdicao(true);
    setMostrarFormulario(true);
  };

  // Função para cancelar edição
  const cancelarEdicao = () => {
    setHabilidadeEditando(null);
    setModoEdicao(false);
    setMostrarFormulario(false);
    setNovaHabilidade({
      nome: '',
      categoria: 'Estudo',
      descricao: '',
      nivel: 'Iniciante',
      meta: '',
      prazo: '1 mês',
      dataInicio: new Date().toISOString().split('T')[0]
    });
  };

  // Salvar habilidade no Firebase
  const salvarHabilidadeFirebase = async (habilidade) => {
    if (!user) return null;
    
    try {
      const docRef = await addDoc(collection(db, 'habilidades'), {
        ...habilidade,
        userId: user.uid,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log('✅ Habilidade salva no Firebase:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('❌ Erro ao salvar habilidade:', error);
      return null;
    }
  };

  // Atualizar habilidade no Firebase
  const atualizarHabilidadeFirebase = async (id, dadosAtualizados) => {
    if (!user || !id) return false;
    
    try {
      const docRef = doc(db, 'habilidades', id);
      await updateDoc(docRef, {
        ...dadosAtualizados,
        updatedAt: new Date()
      });
      console.log('✅ Habilidade atualizada no Firebase:', id);
      return true;
    } catch (error) {
      console.error('❌ Erro ao atualizar habilidade:', error);
      return false;
    }
  };

  // Deletar habilidade do Firebase
  const deletarHabilidadeFirebase = async (id) => {
    if (!user || !id) return false;
    
    try {
      const docRef = doc(db, 'habilidades', id);
      await deleteDoc(docRef);
      console.log('✅ Habilidade deletada do Firebase:', id);
      return true;
    } catch (error) {
      console.error('❌ Erro ao deletar habilidade:', error);
      return false;
    }
  };

  const adicionarHabilidade = async (e) => {
    e.preventDefault();
    if (!user) {
      alert('Você precisa estar logado para gerenciar habilidades!');
      return;
    }

    const dadosHabilidade = modoEdicao ? habilidadeEditando : novaHabilidade;
    
    if (dadosHabilidade.nome && dadosHabilidade.descricao) {
      setSalvando(true);
      
      const habilidade = {
        ...dadosHabilidade,
        dataConclusao: calcularDataConclusao(dadosHabilidade.dataInicio, dadosHabilidade.prazo),
        progresso: modoEdicao ? dadosHabilidade.progresso : 0,
        ativo: modoEdicao ? dadosHabilidade.ativo : true
      };
      
      let sucesso;
      if (modoEdicao) {
        sucesso = await atualizarHabilidadeFirebase(habilidadeEditando.id, habilidade);
      } else {
        sucesso = await salvarHabilidadeFirebase(habilidade);
      }
      
      if (sucesso) {
        cancelarEdicao();
      } else {
        alert(`Erro ao ${modoEdicao ? 'atualizar' : 'salvar'} habilidade. Tente novamente.`);
      }
      setSalvando(false);
    }
  };

  const alternarStatus = async (id) => {
    if (!user) return;
    
    const habilidade = habilidades.find(hab => hab.id === id);
    if (habilidade) {
      await atualizarHabilidadeFirebase(id, { ativo: !habilidade.ativo });
    }
  };

  const atualizarProgresso = async (id, novoProgresso) => {
    if (!user) return;
    
    const progressoFinal = Math.min(100, Math.max(0, novoProgresso));
    await atualizarHabilidadeFirebase(id, { progresso: progressoFinal });
  };

  const removerHabilidade = async (id) => {
    if (!user) return;
    
    if (window.confirm('Tem certeza que deseja remover esta habilidade?')) {
      await deletarHabilidadeFirebase(id);
    }
  };

  const habilidadesFiltradas = filtroCategoria === 'Todas' 
    ? habilidades 
    : habilidades.filter(hab => hab.categoria === filtroCategoria);

  const getNivelCor = (nivel) => {
    switch(nivel) {
      case 'Iniciante': return '#4CAF50';
      case 'Intermediário': return '#FF9800';
      case 'Avançado': return '#F44336';
      default: return '#2196F3';
    }
  };

  // Verificar autenticação
  if (loading) {
    return (
      <div className="modulo-habilidades">
        <div className="carregando">
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="modulo-habilidades">
        <div className="nao-autenticado">
          <h2>Acesso Restrito</h2>
          <p>Você precisa estar logado para acessar o módulo de habilidades.</p>
          <button onClick={() => navigate('/login')}>Fazer Login</button>
        </div>
      </div>
    );
  }

  return (
    <div className="modulo-habilidades">
      <div className="volta-dashboard-container">
        <button 
          className="volta-dashboard-btn"
          onClick={() => navigate('/dashboard')}
        >
          Voltar ao Dashboard
        </button>
      </div>
      
      <div className="habilidades-container">
      <div className="habilidades-header">
        <h2>Gerenciamento de Habilidades</h2>
        <p>Desenvolva e acompanhe seus hábitos de estudo e crescimento pessoal</p>
      </div>

      <div className="habilidades-controles">
        <div className="filtros">
          <label>Filtrar por categoria:</label>
          <select 
            value={filtroCategoria} 
            onChange={(e) => setFiltroCategoria(e.target.value)}
          >
            {categorias.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        
        <button 
          className="btn-adicionar"
          onClick={() => {
            if (mostrarFormulario) {
              cancelarEdicao();
            } else {
              setMostrarFormulario(true);
            }
          }}
        >
          {mostrarFormulario ? 'Cancelar' : '+ Nova Habilidade'}
        </button>
      </div>

      {mostrarFormulario && (
        <div className="formulario-habilidade">
          <h3>{modoEdicao ? 'Editar Habilidade' : 'Adicionar Nova Habilidade'}</h3>
          <form onSubmit={adicionarHabilidade}>
            <div className="form-row">
              <div className="form-group">
                <label>Nome da Habilidade:</label>
                <input
                  type="text"
                  value={modoEdicao ? habilidadeEditando.nome : novaHabilidade.nome}
                  onChange={(e) => {
                    if (modoEdicao) {
                      setHabilidadeEditando({...habilidadeEditando, nome: e.target.value});
                    } else {
                      setNovaHabilidade({...novaHabilidade, nome: e.target.value});
                    }
                  }}
                  placeholder="Ex: Leitura diária, Exercícios..."
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Categoria:</label>
                <select
                  value={modoEdicao ? habilidadeEditando.categoria : novaHabilidade.categoria}
                  onChange={(e) => {
                    if (modoEdicao) {
                      setHabilidadeEditando({...habilidadeEditando, categoria: e.target.value});
                    } else {
                      setNovaHabilidade({...novaHabilidade, categoria: e.target.value});
                    }
                  }}
                >
                  {categorias.slice(1).map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Descrição:</label>
              <textarea
                value={modoEdicao ? habilidadeEditando.descricao : novaHabilidade.descricao}
                onChange={(e) => {
                  if (modoEdicao) {
                    setHabilidadeEditando({...habilidadeEditando, descricao: e.target.value});
                  } else {
                    setNovaHabilidade({...novaHabilidade, descricao: e.target.value});
                  }
                }}
                placeholder="Descreva como você pretende desenvolver esta habilidade..."
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Nível:</label>
                <select
                  value={modoEdicao ? habilidadeEditando.nivel : novaHabilidade.nivel}
                  onChange={(e) => {
                    if (modoEdicao) {
                      setHabilidadeEditando({...habilidadeEditando, nivel: e.target.value});
                    } else {
                      setNovaHabilidade({...novaHabilidade, nivel: e.target.value});
                    }
                  }}
                >
                  {niveis.map(nivel => (
                    <option key={nivel} value={nivel}>{nivel}</option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label>Prazo:</label>
                <select
                  value={modoEdicao ? habilidadeEditando.prazo : novaHabilidade.prazo}
                  onChange={(e) => {
                    if (modoEdicao) {
                      setHabilidadeEditando({...habilidadeEditando, prazo: e.target.value});
                    } else {
                      setNovaHabilidade({...novaHabilidade, prazo: e.target.value});
                    }
                  }}
                >
                  {prazos.map(prazo => (
                    <option key={prazo} value={prazo}>{prazo}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Meta:</label>
                <input
                  type="text"
                  value={modoEdicao ? habilidadeEditando.meta : novaHabilidade.meta}
                  onChange={(e) => {
                    if (modoEdicao) {
                      setHabilidadeEditando({...habilidadeEditando, meta: e.target.value});
                    } else {
                      setNovaHabilidade({...novaHabilidade, meta: e.target.value});
                    }
                  }}
                  placeholder="Qual seu objetivo com esta habilidade?"
                />
              </div>
              
              <div className="form-group">
                <label>Data de Início:</label>
                <input
                  type="date"
                  value={modoEdicao ? habilidadeEditando.dataInicio : novaHabilidade.dataInicio}
                  onChange={(e) => {
                    if (modoEdicao) {
                      setHabilidadeEditando({...habilidadeEditando, dataInicio: e.target.value});
                    } else {
                      setNovaHabilidade({...novaHabilidade, dataInicio: e.target.value});
                    }
                  }}
                  required
                />
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-salvar" disabled={salvando}>
                {salvando ? 'Salvando...' : (modoEdicao ? 'Atualizar Habilidade' : 'Salvar Habilidade')}
              </button>
              <button type="button" className="btn-cancelar" onClick={() => {
                setMostrarFormulario(false);
                cancelarEdicao();
              }} disabled={salvando}>
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {carregando ? (
        <div className="carregando">
          <p>Carregando suas habilidades...</p>
        </div>
      ) : (
        <div className="habilidades-grid">
          {habilidadesFiltradas.map(habilidade => (
          <div key={habilidade.id} className={`habilidade-card ${!habilidade.ativo ? 'inativa' : ''}`}>
            <div className="card-header">
              <div className="titulo-categoria">
                <h3>{habilidade.nome}</h3>
                <span className="categoria">{habilidade.categoria}</span>
              </div>
              <div className="nivel-badge" style={{backgroundColor: getNivelCor(habilidade.nivel)}}>
                {habilidade.nivel}
              </div>
            </div>

            <p className="descricao">{habilidade.descricao}</p>
            
            {habilidade.meta && (
              <div className="meta">
                <strong>Meta:</strong> {habilidade.meta}
              </div>
            )}

            <div className="prazo-info">
              <div className="prazo-item">
                <strong>Prazo:</strong> {habilidade.prazo || '1 mês'}
              </div>
              {habilidade.dataInicio && (
                <div className="prazo-item">
                  <strong>Início:</strong> {new Date(habilidade.dataInicio).toLocaleDateString('pt-BR')}
                </div>
              )}
              {habilidade.dataConclusao && (
                <div className="prazo-item">
                  <strong>Conclusão:</strong> {new Date(habilidade.dataConclusao).toLocaleDateString('pt-BR')}
                </div>
              )}
            </div>

            <div className="dicas-container">
              <h4><FaLightbulb /> Dicas Personalizadas</h4>
              <div className="dicas-lista">
                {obterDicasHabilidade(habilidade.categoria, habilidade.nivel, habilidade.progresso).map((dica, index) => (
                  <div key={index} className="dica-item">
                    {dica}
                  </div>
                ))}
              </div>
            </div>

            <div className="progresso-container">
              <div className="progresso-header">
                <span>Progresso</span>
                <span>{habilidade.progresso}%</span>
              </div>
              <div className="barra-progresso">
                <div 
                  className="progresso-fill"
                  style={{width: `${habilidade.progresso}%`}}
                ></div>
              </div>
              <div className="controles-progresso">
                <button 
                  onClick={() => atualizarProgresso(habilidade.id, habilidade.progresso - 10)}
                  disabled={habilidade.progresso <= 0}
                >
                  -10%
                </button>
                <button 
                  onClick={() => atualizarProgresso(habilidade.id, habilidade.progresso + 10)}
                  disabled={habilidade.progresso >= 100}
                >
                  +10%
                </button>
              </div>
            </div>

            <div className="card-actions">
              <button 
                className="btn-editar"
                onClick={() => iniciarEdicao(habilidade)}
              >
                Editar
              </button>
              <button 
                className={`btn-status ${habilidade.ativo ? 'ativo' : 'inativo'}`}
                onClick={() => alternarStatus(habilidade.id)}
              >
                {habilidade.ativo ? 'Pausar' : 'Ativar'}
              </button>
              <button 
                className="btn-remover"
                onClick={() => removerHabilidade(habilidade.id)}
              >
                Remover
              </button>
            </div>
          </div>
          ))}
        </div>
      )}

      {!carregando && habilidadesFiltradas.length === 0 && (
        <div className="sem-habilidades">
          <p>{filtroCategoria === 'Todas' ? 'Você ainda não possui habilidades cadastradas.' : `Nenhuma habilidade encontrada para a categoria "${filtroCategoria}".`}</p>
          <button onClick={() => setMostrarFormulario(true)}>Adicionar primeira habilidade</button>
        </div>
      )}
      </div>
    </div>
  );
};

export default Habilidades;