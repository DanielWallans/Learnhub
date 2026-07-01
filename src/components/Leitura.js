import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  BookOpen, 
  Star, 
  Trash2, 
  Edit3, 
  X, 
  Plus, 
  ExternalLink, 
  Bookmark, 
  Heart, 
  AlignLeft, 
  LayoutGrid, 
  Clock, 
  LogOut,
  ChevronRight,
  Upload,
  ArrowLeft
} from 'lucide-react';
import './Leitura.css';
import Loading from './Loading';
import BibliotecaBg from '../IMG/BIBLIOTECA.jpg';

// Livros recomendados estáticos com capas oficiais do Google Books
const RECOMENDADOS_PRESET = [
  {
    titulo: "A Psicologia do Dinheiro",
    autor: "Morgan Housel",
    capa: "https://books.google.com/books/content?id=N2gHEAAAQBAJ&printsec=frontcover&img=1&zoom=1",
    paginasTotal: 304,
    categoria: "Negócios",
    descricao: "Morgan Housel compartilha 19 histórias curtas que exploram as formas estranhas como as pessoas pensam sobre o dinheiro e ensina como entender melhor o comportamento financeiro."
  },
  {
    titulo: "Hábitos Atômicos",
    autor: "James Clear",
    capa: "https://books.google.com/books/content?id=j5dVDwAAQBAJ&printsec=frontcover&img=1&zoom=1",
    paginasTotal: 320,
    categoria: "Autoajuda",
    descricao: "Um guia definitivo para quebrar maus hábitos e criar bons hábitos em quatro passos simples. James Clear explica como pequenas mudanças diárias geram resultados massivos a longo prazo."
  },
  {
    titulo: "Company of One",
    autor: "Paul Jarvis",
    capa: "https://books.google.com/books/content?id=561uDwAAQBAJ&printsec=frontcover&img=1&zoom=1",
    paginasTotal: 272,
    categoria: "Negócios",
    descricao: "Paul Jarvis apresenta uma abordagem refrescante de negócios focada em permanecer pequeno, ágil e eficiente, em vez de buscar a expansão desenfreada corporativa."
  },
  {
    titulo: "O Poder do Hábito",
    autor: "Charles Duhigg",
    capa: "https://books.google.com/books/content?id=8L1aDwAAQBAJ&printsec=frontcover&img=1&zoom=1",
    paginasTotal: 408,
    categoria: "Autoajuda",
    descricao: "Por que fazemos o que fazemos na vida e nos negócios. O livro mostra que a chave para o sucesso é entender como os hábitos funcionam para conseguir transformá-los."
  }
];

// Banco de dados local de fallback para consultas caso a API falhe ou dê 429
const MOCK_LIVROS_DB = [
  {
    titulo: "A Psicologia do Dinheiro",
    autor: "Morgan Housel",
    capa: "https://books.google.com/books/content?id=N2gHEAAAQBAJ&printsec=frontcover&img=1&zoom=1",
    paginasTotal: 304,
    categoria: "Negócios",
    descricao: "Morgan Housel compartilha histórias e lições sobre a psicologia humana por trás de nossas finanças pessoais."
  },
  {
    titulo: "Hábitos Atômicos",
    autor: "James Clear",
    capa: "https://books.google.com/books/content?id=j5dVDwAAQBAJ&printsec=frontcover&img=1&zoom=1",
    paginasTotal: 320,
    categoria: "Autoajuda",
    descricao: "Um guia definitivo para quebrar maus hábitos e criar bons hábitos em quatro passos simples."
  },
  {
    titulo: "Company of One",
    autor: "Paul Jarvis",
    capa: "https://books.google.com/books/content?id=561uDwAAQBAJ&printsec=frontcover&img=1&zoom=1",
    paginasTotal: 272,
    categoria: "Negócios",
    descricao: "Focado em permanecer pequeno, ágil e eficiente, em vez de buscar a expansão corporativa desenfreada."
  },
  {
    titulo: "O Poder do Hábito",
    autor: "Charles Duhigg",
    capa: "https://books.google.com/books/content?id=8L1aDwAAQBAJ&printsec=frontcover&img=1&zoom=1",
    paginasTotal: 408,
    categoria: "Autoajuda",
    descricao: "Por que fazemos o que fazemos na vida e nos negócios. Entenda o loop do hábito."
  },
  {
    titulo: "Pai Rico, Pai Pobre",
    autor: "Robert T. Kiyosaki",
    capa: "https://books.google.com/books/content?id=019dDwAAQBAJ&printsec=frontcover&img=1&zoom=1",
    paginasTotal: 336,
    categoria: "Negócios",
    descricao: "O que os ricos ensinam a seus filhos sobre dinheiro que as classes média e baixa não ensinam."
  },
  {
    titulo: "Rápido e Devagar: Duas Formas de Pensar",
    autor: "Daniel Kahneman",
    capa: "https://books.google.com/books/content?id=K82CDwAAQBAJ&printsec=frontcover&img=1&zoom=1",
    paginasTotal: 608,
    categoria: "Psicologia",
    descricao: "Duas formas de pensar: uma rápida, intuitiva e emocional; outra devagar, deliberativa e lógica."
  },
  {
    titulo: "Os Segredos da Mente Milionária",
    autor: "T. Harv Eker",
    capa: "https://books.google.com/books/content?id=t2lVDwAAQBAJ&printsec=frontcover&img=1&zoom=1",
    paginasTotal: 176,
    categoria: "Negócios",
    descricao: "Aprenda a substituir uma mentalidade destrutiva pelos arquivos de riqueza que distinguem os ricos."
  },
  {
    titulo: "Essencialismo",
    autor: "Greg McKeown",
    capa: "https://books.google.com/books/content?id=5C0wDwAAQBAJ&printsec=frontcover&img=1&zoom=1",
    paginasTotal: 272,
    categoria: "Autoajuda",
    descricao: "A busca disciplinada por menos. Aprenda a focar no que realmente importa e eliminar todo o resto."
  },
  {
    titulo: "Quem Pensa Enriquece",
    autor: "Napoleon Hill",
    capa: "https://books.google.com/books/content?id=YpE_DwAAQBAJ&printsec=frontcover&img=1&zoom=1",
    paginasTotal: 292,
    categoria: "Negócios",
    descricao: "O maior clássico sobre o sucesso financeiro e pessoal. Baseado na filosofia de conquistas de Andrew Carnegie."
  },
  {
    titulo: "O Homem Mais Rico da Babilônia",
    autor: "George S. Clason",
    capa: "https://books.google.com/books/content?id=16tVDwAAQBAJ&printsec=frontcover&img=1&zoom=1",
    paginasTotal: 160,
    categoria: "Negócios",
    descricao: "Com mais de dois milhões de exemplares vendidos no mundo todo, o clássico sobre finanças pessoais."
  },
  {
    titulo: "Mindset",
    autor: "Carol S. Dweck",
    capa: "https://books.google.com/books/content?id=t2RVDwAAQBAJ&printsec=frontcover&img=1&zoom=1",
    paginasTotal: 312,
    categoria: "Psicologia",
    descricao: "A nova psicologia do sucesso. Carol Dweck explica como a nossa atitude mental determina o sucesso."
  },
  {
    titulo: "Comece Pelo Porquê",
    autor: "Simon Sinek",
    capa: "https://books.google.com/books/content?id=v-0wDwAAQBAJ&printsec=frontcover&img=1&zoom=1",
    paginasTotal: 256,
    categoria: "Negócios",
    descricao: "Simon Sinek mostra que líderes inspiradores começam pelo porquê."
  },
  {
    titulo: "O Milagre da Manhã",
    autor: "Hal Elrod",
    capa: "https://books.google.com/books/content?id=DndwDwAAQBAJ&printsec=frontcover&img=1&zoom=1",
    paginasTotal: 196,
    categoria: "Autoajuda",
    descricao: "O segredo para transformar sua vida antes das 8 horas da manhã."
  },
  {
    titulo: "Sapiens: Uma Breve História da Humanidade",
    autor: "Yuval Noah Harari",
    capa: "https://books.google.com/books/content?id=38V5DwAAQBAJ&printsec=frontcover&img=1&zoom=1",
    paginasTotal: 464,
    categoria: "História",
    descricao: "Uma viagem pela história humana, desde os primeiros hominídeos até a revolução científica."
  },
  {
    titulo: "Foco",
    autor: "Daniel Goleman",
    capa: "https://books.google.com/books/content?id=lqBVDwAAQBAJ&printsec=frontcover&img=1&zoom=1",
    paginasTotal: 296,
    categoria: "Psicologia",
    descricao: "A atenção e seu papel fundamental para o sucesso. O autor aborda a ciência do foco."
  }
];

const Leitura = () => {
  const [user, loading] = useAuthState(auth);
  const navigate = useNavigate();
  
  // Controle de exibição da tela de boas-vindas/landing page
  const [showDashboard, setShowDashboard] = useState(false);
  
  // Estados principais
  const [livros, setLivros] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [livroEditando, setLivroEditando] = useState(null);
  
  // Detalhes do Livro Selecionado (Exibido no Painel Direito Dark Navy)
  const [livroSelecionadoId, setLivroSelecionadoId] = useState(null);
  
  // Estados de busca (API Google Books)
  const [termoBusca, setTermoBusca] = useState('');
  const [resultadosBusca, setResultadosBusca] = useState([]);
  const [buscando, setBuscando] = useState(false);
  
  // Estados de nova anotação/resumo
  const [anotacaoTexto, setAnotacaoTexto] = useState('');
  const [anotacaoCapitulo, setAnotacaoCapitulo] = useState('');
  const [anotacaoPagina, setAnotacaoPagina] = useState('');

  // Estado do filtro ativo da Sidebar Esquerda
  const [secaoAtiva, setSecaoAtiva] = useState('library'); // library, discover, favourites
  
  // Estados do formulário manual/adição
  const [novoLivro, setNovoLivro] = useState({
    titulo: '',
    autor: '',
    categoria: 'Ficção',
    tipo: 'Livro',
    descricao: '',
    paginasTotal: '',
    paginasLidas: 0,
    capituloAtual: '',
    status: 'Não Iniciado',
    avaliacao: 0,
    notas: '',
    dataInicio: '',
    dataTermino: '',
    linkCompra: '',
    capa: '',
    favorito: false,
    anotacoes: []
  });
  
  // Estados de filtros
  const [filtroCategoria, setFiltroCategoria] = useState('Todas');
  const [modoVisualizacao, setModoVisualizacao] = useState('grid'); // grid ou lista
  
  // Configurações
  const categorias = [
    'Ficção', 'Não-Ficção', 'Biografia', 'História', 'Ciência',
    'Tecnologia', 'Filosofia', 'Psicologia', 'Autoajuda', 'Negócios',
    'Literatura', 'Poesia', 'Aventura', 'Educação'
  ];
  
  const tipos = [
    'Livro', 'E-book', 'Audiobook', 'Resumo', 'Apostila', 
    'Artigo', 'Manual'
  ];
  
  const statusLeitura = [
    'Não Iniciado', 'Lendo', 'Pausado', 'Concluído', 'Abandonado'
  ];

  // Debounce para busca de livros na API do Google Books
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (termoBusca.trim().length > 2) {
        buscarLivrosAPI(termoBusca);
      } else {
        setResultadosBusca([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [termoBusca]);

  // Helper para buscar na Open Library API
  const buscarOpenLibrary = async (q) => {
    try {
      const response = await fetch(
        `https://openlibrary.org/search.json?q=${encodeURIComponent(q)}&limit=6`
      );
      if (response.ok) {
        const data = await response.json();
        if (data.docs) {
          return data.docs.map((item, idx) => {
            let capaUrl = '';
            if (item.cover_i) {
              capaUrl = `https://covers.openlibrary.org/b/id/${item.cover_i}-M.jpg`;
            }
            return {
              id: item.key || `ol-${idx}-${Date.now()}`,
              titulo: item.title || 'Sem título',
              autor: item.author_name ? item.author_name.join(', ') : 'Autor Desconhecido',
              descricao: item.first_sentence ? item.first_sentence.join(' ') : '',
              paginasTotal: item.number_of_pages_median || item.number_of_pages || 0,
              capa: capaUrl,
              categoria: item.subject ? item.subject[0] : 'Geral'
            };
          });
        }
      }
    } catch (e) {
      console.error("Erro ao buscar na Open Library:", e);
    }
    return [];
  };

  // Função para buscar livros usando Google Books API com fallbacks robustos
  const buscarLivrosAPI = async (q) => {
    setBuscando(true);
    
    // 1. Busca local nos presets e mock
    const queryLimpa = q.toLowerCase().trim();
    const resultadosLocais = MOCK_LIVROS_DB.filter(livro => 
      livro.titulo.toLowerCase().includes(queryLimpa) || 
      livro.autor.toLowerCase().includes(queryLimpa)
    ).map((livro, idx) => ({
      id: `local-mock-${idx}-${Date.now()}`,
      ...livro
    }));

    let resultadosOnline = [];

    // 2. Busca na API do Google Books
    try {
      const response = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(q)}&maxResults=6&langRestrict=pt`
      );
      if (response.ok) {
        const data = await response.json();
        if (data.items) {
          resultadosOnline = data.items.map(item => {
            const info = item.volumeInfo;
            let capaUrl = '';
            if (info.imageLinks) {
              capaUrl = info.imageLinks.thumbnail || info.imageLinks.smallThumbnail || '';
              capaUrl = capaUrl.replace(/^http:/i, 'https:');
            }
            
            return {
              id: item.id,
              titulo: info.title || 'Sem título',
              autor: info.authors ? info.authors.join(', ') : 'Autor Desconhecido',
              descricao: info.description || '',
              paginasTotal: info.pageCount || 0,
              capa: capaUrl,
              categoria: info.categories ? info.categories[0] : 'Geral'
            };
          });
        }
      } else {
        console.warn("Google Books API retornou erro. Tentando Open Library...");
        resultadosOnline = await buscarOpenLibrary(q);
      }
    } catch (error) {
      console.warn("Erro ao acessar Google Books API. Tentando Open Library...", error);
      resultadosOnline = await buscarOpenLibrary(q);
    }

    // Mesclar resultados priorizando locais, eliminando duplicados por título
    const combinados = [...resultadosLocais];
    resultadosOnline.forEach(online => {
      const jaExiste = combinados.some(local => 
        local.titulo.toLowerCase().trim() === online.titulo.toLowerCase().trim()
      );
      if (!jaExiste) {
        combinados.push(online);
      }
    });

    setResultadosBusca(combinados.slice(0, 8));
    setBuscando(false);
  };

  // Carregar livros do Firebase (Realtime onSnapshot)
  useEffect(() => {
    if (!user) {
      setCarregando(false);
      return;
    }
    
    const q = query(
      collection(db, 'leitura'),
      where('userId', '==', user.uid)
    );
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const livrosData = [];
      querySnapshot.forEach((doc) => {
        livrosData.push({ id: doc.id, ...doc.data() });
      });
      setLivros(livrosData);
      setCarregando(false);
    });
    
    return () => unsubscribe();
  }, [user]);

  // Ao carregar a lista de livros, pré-seleciona o primeiro caso nenhum esteja selecionado
  useEffect(() => {
    if (livros.length > 0 && !livroSelecionadoId) {
      setLivroSelecionadoId(livros[0].id);
    }
  }, [livros, livroSelecionadoId]);

  // Deriva o livro selecionado a partir da lista
  const livroAtivo = livros.find(l => l.id === livroSelecionadoId) || (livros.length > 0 ? livros[0] : null);
  
  // Funções de manipulação de dados no Firebase
  const salvarLivroFirebase = async (livroData) => {
    try {
      const ref = await addDoc(collection(db, 'leitura'), {
        ...livroData,
        userId: user.uid,
        dataCriacao: new Date().toISOString(),
        dataAtualizacao: new Date().toISOString()
      });
      // Seleciona o livro recém adicionado
      setLivroSelecionadoId(ref.id);
    } catch (error) {
      console.error('Erro ao salvar livro:', error);
      throw error;
    }
  };
  
  const atualizarLivroFirebase = async (id, livroData) => {
    try {
      const livroRef = doc(db, 'leitura', id);
      await updateDoc(livroRef, {
        ...livroData,
        dataAtualizacao: new Date().toISOString()
      });
    } catch (error) {
      console.error('Erro ao atualizar livro:', error);
      throw error;
    }
  };
  
  const deletarLivroFirebase = async (id) => {
    try {
      await deleteDoc(doc(db, 'leitura', id));
    } catch (error) {
      console.error('Erro ao deletar livro:', error);
      throw error;
    }
  };
  
  // Funções de controle
  const adicionarLivro = async (e) => {
    e.preventDefault();
    if (!user) return;
    
    setSalvando(true);
    try {
      let capaFinal = novoLivro.capa || '';
      
      // Se não tiver capa ou se for um link de site comum em vez de imagem direta/base64, buscamos na API baseado no título
      const isUrlBase64 = capaFinal.startsWith('data:image/');
      const isDirectImageLink = capaFinal.match(/\.(jpeg|jpg|gif|png|webp)/i) || 
                                capaFinal.includes('google.com') || 
                                capaFinal.includes('openlibrary.org') || 
                                capaFinal.includes('googleapis.com');
                                
      if (!capaFinal || (!isUrlBase64 && !isDirectImageLink)) {
        try {
          const resp = await fetch(
            `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(novoLivro.titulo)}&maxResults=1&langRestrict=pt`
          );
          if (resp.ok) {
            const data = await resp.json();
            if (data.items && data.items[0].volumeInfo.imageLinks) {
              capaFinal = data.items[0].volumeInfo.imageLinks.thumbnail || 
                          data.items[0].volumeInfo.imageLinks.smallThumbnail || '';
              capaFinal = capaFinal.replace(/^http:/i, 'https:');
            }
          }
        } catch (e) {
          console.warn("Nenhuma capa encontrada na API do Google Books para o título fornecido.");
        }
      }

      const livroData = {
        ...novoLivro,
        capa: capaFinal,
        paginasTotal: parseInt(novoLivro.paginasTotal) || 0,
        paginasLidas: parseInt(novoLivro.paginasLidas) || 0,
        avaliacao: parseInt(novoLivro.avaliacao) || 0,
        anotacoes: novoLivro.anotacoes || []
      };
      
      if (modoEdicao && livroEditando) {
        await atualizarLivroFirebase(livroEditando.id, livroData);
      } else {
        await salvarLivroFirebase(livroData);
      }
      
      cancelarEdicao();
      setMostrarFormulario(false);
    } catch (error) {
      alert('Erro ao salvar livro. Tente novamente.');
    } finally {
      setSalvando(false);
    }
  };
  
  const iniciarEdicao = (livro) => {
    setLivroEditando(livro);
    setNovoLivro({ ...livro });
    setModoEdicao(true);
    setMostrarFormulario(true);
  };
  
  const cancelarEdicao = () => {
    setModoEdicao(false);
    setLivroEditando(null);
    setNovoLivro({
      titulo: '',
      autor: '',
      categoria: 'Ficção',
      tipo: 'Livro',
      descricao: '',
      paginasTotal: '',
      paginasLidas: 0,
      capituloAtual: '',
      status: 'Não Iniciado',
      avaliacao: 0,
      notas: '',
      dataInicio: '',
      dataTermino: '',
      linkCompra: '',
      capa: '',
      favorito: false,
      anotacoes: []
    });
  };
  
  const removerLivro = async (id) => {
    if (window.confirm('Tem certeza que deseja remover este livro da sua estante?')) {
      try {
        await deletarLivroFirebase(id);
        if (livroSelecionadoId === id) {
          setLivroSelecionadoId(null);
        }
      } catch (error) {
        alert('Erro ao remover item. Tente novamente.');
      }
    }
  };

  const alternarFavorito = async (e, id, estadoAtual) => {
    e.stopPropagation();
    try {
      await atualizarLivroFirebase(id, {
        favorito: !estadoAtual
      });
    } catch (error) {
      console.error("Erro ao alternar favorito:", error);
    }
  };

  const selecionarLivroParaAdicionar = (livroInfo) => {
    let cat = 'Ficção';
    if (livroInfo.categoria) {
      const encontrada = categorias.find(c => c.toLowerCase() === livroInfo.categoria.toLowerCase());
      if (encontrada) cat = encontrada;
    }

    setNovoLivro({
      titulo: livroInfo.titulo,
      autor: livroInfo.autor,
      categoria: cat,
      tipo: 'Livro',
      descricao: livroInfo.descricao || '',
      paginasTotal: livroInfo.paginasTotal || '',
      paginasLidas: 0,
      capituloAtual: '',
      status: 'Não Iniciado',
      avaliacao: 0,
      notas: '',
      dataInicio: new Date().toISOString().split('T')[0],
      dataTermino: '',
      linkCompra: '',
      capa: livroInfo.capa,
      favorito: false,
      anotacoes: []
    });
    setModoEdicao(false);
    setMostrarFormulario(true);
    setTermoBusca('');
    setResultadosBusca([]);
  };

  const handleUploadImagemCapa = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 1.5 * 1024 * 1024) {
      alert("Por favor, selecione uma imagem menor que 1.5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setNovoLivro(prev => ({
        ...prev,
        capa: reader.result
      }));
    };
    reader.readAsDataURL(file);
  };
  
  const atualizarProgresso = async (id, novasPaginas) => {
    const livro = livros.find(l => l.id === id);
    if (!livro) return;
    
    const paginasLidas = Math.max(0, Math.min(novasPaginas, livro.paginasTotal));
    let novoStatus = livro.status;
    
    if (paginasLidas === 0) {
      novoStatus = 'Não Iniciado';
    } else if (paginasLidas === livro.paginasTotal && livro.paginasTotal > 0) {
      novoStatus = 'Concluído';
    } else if (livro.status === 'Não Iniciado' || livro.status === 'Concluído') {
      novoStatus = 'Lendo';
    }
    
    try {
      await atualizarLivroFirebase(id, {
        paginasLidas,
        status: novoStatus,
        ...(novoStatus === 'Concluído' && !livro.dataTermino ? { dataTermino: new Date().toISOString().split('T')[0] } : {})
      });
    } catch (error) {
      console.error('Erro ao atualizar progresso:', error);
    }
  };

  const atualizarCapitulo = async (id, novoCapitulo) => {
    try {
      await atualizarLivroFirebase(id, {
        capituloAtual: novoCapitulo
      });
    } catch (error) {
      console.error('Erro ao atualizar capítulo:', error);
    }
  };

  const atualizarStatusDireto = async (id, novoStatus) => {
    const livro = livros.find(l => l.id === id);
    if (!livro) return;

    let paginasLidas = livro.paginasLidas;
    if (novoStatus === 'Concluído') {
      paginasLidas = livro.paginasTotal;
    } else if (novoStatus === 'Não Iniciado') {
      paginasLidas = 0;
    }

    try {
      await atualizarLivroFirebase(id, {
        status: novoStatus,
        paginasLidas,
        ...(novoStatus === 'Concluído' && !livro.dataTermino ? { dataTermino: new Date().toISOString().split('T')[0] } : {})
      });
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
    }
  };

  const atualizarAvaliacao = async (id, novaAvaliacao) => {
    try {
      await atualizarLivroFirebase(id, {
        avaliacao: novaAvaliacao
      });
    } catch (error) {
      console.error('Erro ao atualizar avaliação:', error);
    }
  };

  // Funções de Anotações/Resumos
  const salvarAnotacao = async (e) => {
    e.preventDefault();
    if (!anotacaoTexto.trim() || !livroAtivo) return;

    const novaAnotacao = {
      id: Date.now().toString(),
      data: new Date().toISOString(),
      texto: anotacaoTexto.trim(),
      capitulo: anotacaoCapitulo.trim() || 'Geral',
      pagina: parseInt(anotacaoPagina) || 0
    };

    const anotacoesAtualizadas = [novaAnotacao, ...(livroAtivo.anotacoes || [])];

    try {
      await atualizarLivroFirebase(livroAtivo.id, {
        anotacoes: anotacoesAtualizadas
      });
      setAnotacaoTexto('');
      setAnotacaoCapitulo('');
      setAnotacaoPagina('');
    } catch (error) {
      alert('Erro ao salvar anotação. Tente novamente.');
    }
  };

  const deletarAnotacao = async (anotacaoId) => {
    if (!livroAtivo) return;
    if (window.confirm('Tem certeza que deseja apagar este resumo/anotação?')) {
      const anotacoesAtualizadas = (livroAtivo.anotacoes || []).filter(a => a.id !== anotacaoId);
      try {
        await atualizarLivroFirebase(livroAtivo.id, {
          anotacoes: anotacoesAtualizadas
        });
      } catch (error) {
        alert('Erro ao deletar anotação.');
      }
    }
  };
  
  // Filtragem dos livros da estante
  const livrosFiltrados = livros.filter(livro => {
    const matchesCategoria = filtroCategoria === 'Todas' || livro.categoria === filtroCategoria;
    
    if (secaoAtiva === 'favourites') {
      return livro.favorito && matchesCategoria;
    }
    
    return matchesCategoria;
  });
  
  // Utilidades
  const calcularProgresso = (livro) => {
    if (!livro || !livro.paginasTotal || livro.paginasTotal === 0) return 0;
    return Math.round((livro.paginasLidas / livro.paginasTotal) * 100);
  };

  const getStatusCor = (status) => {
    const cores = {
      'Não Iniciado': '#64748b',
      'Lendo': '#2563eb',
      'Pausado': '#f59e0b',
      'Concluído': '#10b981',
      'Abandonado': '#ef4444'
    };
    return cores[status] || '#64748b';
  };
  
  const renderEstrelas = (avaliacao, size = 14) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star 
        key={i} 
        size={size} 
        fill={i < avaliacao ? "#ffd700" : "none"} 
        color={i < avaliacao ? "#ffd700" : "#cbd5e1"} 
      />
    ));
  };

  const renderEstrelasInterativas = (livroId, avaliacaoAtual) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span 
        key={i} 
        onClick={() => atualizarAvaliacao(livroId, i + 1)}
        title={`Avaliar com ${i + 1} estrela${i > 0 ? 's' : ''}`}
        style={{ cursor: 'pointer', display: 'inline-flex' }}
      >
        <Star 
          size={18}
          fill={i < avaliacaoAtual ? "#ffd700" : "none"} 
          color={i < avaliacaoAtual ? "#ffd700" : "#94a3b8"} 
          style={{ transition: 'all 0.15s ease' }}
        />
      </span>
    ));
  };

  if (loading) {
    return <Loading message="Verificando autenticação..." />;
  }
  
  if (!user) {
    return (
      <div className="modulo-leitura">
        <div className="acesso-restrito">
          <div className="icone-restrito">
            <BookOpen size={32} />
          </div>
          <h2>Acesso Restrito</h2>
          <p>Você precisa estar logado para acessar o módulo de leitura da sua biblioteca.</p>
          <button onClick={() => navigate('/login')} className="btn-login">
            Fazer Login
          </button>
        </div>
      </div>
    );
  }

  // Contagem de livros nas abas da Sidebar
  const countLibrary = livros.length;
  const countFavoritos = livros.filter(l => l.favorito).length;
  
  if (!showDashboard) {
    return (
      <div className="leitura-hero-container">
        <img src={BibliotecaBg} alt="Biblioteca" className="leitura-hero-bg" />
        <div className="leitura-hero-overlay"></div>
        
        <div className="leitura-hero-content">
          <header className="leitura-hero-header">
            <button className="leitura-back-btn" onClick={() => navigate('/dashboard')}>
              <ArrowLeft size={16} /> Voltar ao Painel
            </button>
          </header>

          <div className="leitura-hero-center">
            <motion.h1 
              className="leitura-hero-title"
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              Biblioteca
            </motion.h1>
            <motion.p 
              className="leitura-hero-subtitle"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              Expanda seus horizontes: gerencie suas leituras, faça resumos marcantes e acompanhe seu progresso rumo ao conhecimento.
            </motion.p>
            <motion.button 
              className="leitura-hero-action-btn"
              onClick={() => setShowDashboard(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.6 }}
            >
              <BookOpen size={18} /> Acessar Minha Biblioteca
            </motion.button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modulo-leitura">
      <div className="biblioteca-layout">
        
        {/* ===================================================
           COLUNA ESQUERDA - Sidebar (BookBase Style)
           =================================================== */}
        <aside className="biblioteca-sidebar-esquerda">
          <div className="sidebar-logo" onClick={() => navigate('/dashboard')} style={{ cursor: 'pointer' }}>
            <div className="sidebar-logo-icon">
              <BookOpen size={18} />
            </div>
            <span>BookBase</span>
          </div>

          <div className="sidebar-menu">
            <span className="sidebar-menu-title">Navegar</span>
            <button 
              className="sidebar-item"
              onClick={() => navigate('/dashboard')}
              style={{ color: 'var(--book-primary)', backgroundColor: 'rgba(37, 99, 235, 0.04)' }}
            >
              <BookOpen size={16} /> Voltar ao Dashboard
            </button>
            <button 
              className={`sidebar-item ${secaoAtiva === 'library' ? 'ativo' : ''}`}
              onClick={() => { setSecaoAtiva('library'); setFiltroCategoria('Todas'); }}
            >
              <LayoutGrid size={16} /> Minha Biblioteca
            </button>
            <button 
              className={`sidebar-item ${secaoAtiva === 'favourites' ? 'ativo' : ''}`}
              onClick={() => { setSecaoAtiva('favourites'); setFiltroCategoria('Todas'); }}
            >
              <Heart size={16} /> Favoritos
            </button>
          </div>
        </aside>

        {/* ===================================================
           COLUNA CENTRAL - Conteúdo (BookBase Center Area)
           =================================================== */}
        <main className="biblioteca-conteudo-central">
          
          {/* Top Bar (Busca e Botão de Cadastro) */}
          <div className="conteudo-central-topbar">
            <div className="search-bar-container">
              <div className="search-bar-input-wrapper">
                <Search size={18} color="var(--book-text-muted)" />
                <input 
                  type="text" 
                  placeholder="Pesquise seus livros favoritos aqui..."
                  value={termoBusca}
                  onChange={(e) => setTermoBusca(e.target.value)}
                  className="search-bar-input"
                />
                {termoBusca && (
                  <button onClick={() => setTermoBusca('')} className="search-clear-btn" style={{ padding: 2 }}>
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Resultados flutuantes da Busca (Google Books API) */}
              <AnimatePresence>
                {(buscando || resultadosBusca.length > 0) && (
                  <motion.div 
                    className="search-dropdown-results"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                  >
                    <div className="search-dropdown-header">Livros da Biblioteca Pública</div>
                    {buscando && (
                      <div className="search-loading-spinner" style={{ padding: 20 }}>
                        <div className="spinner" style={{width: 16, height: 16}}></div>
                        <span style={{ fontSize: 13, marginLeft: 8 }}>Buscando dados da obra...</span>
                      </div>
                    )}
                    {!buscando && resultadosBusca.map(item => (
                      <div 
                        key={item.id} 
                        className="search-dropdown-item"
                        onClick={() => selecionarLivroParaAdicionar(item)}
                      >
                        <img src={item.capa || 'https://via.placeholder.com/128x192?text=Capa'} alt={item.titulo} className="search-dropdown-capa" />
                        <div className="search-dropdown-info">
                          <h5>{item.titulo}</h5>
                          <p>{item.autor} {item.paginasTotal > 0 && `• ${item.paginasTotal} pág.`}</p>
                        </div>
                        <div className="search-dropdown-btn-add">
                          <Plus size={16} />
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="topbar-actions">
              <button 
                className="btn-add-livro-novo"
                onClick={() => {
                  console.log('DEBUG: Botao Adicionar Manual clicado');
                  cancelarEdicao();
                  setMostrarFormulario(true);
                }}
              >
                <Plus size={16} /> Adicionar Manual
              </button>
            </div>
          </div>



          {/* Seção Minha Estante */}
          <section className="secao-estante">
            <div className="secao-estante-header">
              <h3>Minha Biblioteca ({livrosFiltrados.length})</h3>
              
              <div className="estante-header-controles">
                <div className="controles-visualizacao">
                  <button 
                    onClick={() => setModoVisualizacao('grid')} 
                    className={`btn-visualizacao ${modoVisualizacao === 'grid' ? 'ativo' : ''}`}
                    style={{ padding: 6 }}
                  >
                    <LayoutGrid size={14} />
                  </button>
                  <button 
                    onClick={() => setModoVisualizacao('lista')} 
                    className={`btn-visualizacao ${modoVisualizacao === 'lista' ? 'ativo' : ''}`}
                    style={{ padding: 6 }}
                  >
                    <AlignLeft size={14} />
                  </button>
                </div>
              </div>
            </div>

            {/* Abas horizontais de filtragem de categoria */}
            <div className="estante-categorias-tabs">
              <button 
                className={`estante-tab ${filtroCategoria === 'Todas' ? 'ativo' : ''}`}
                onClick={() => setFiltroCategoria('Todas')}
              >
                Todos
              </button>
              {categorias.map(cat => {
                const count = livros.filter(l => l.categoria === cat).length;
                if (count === 0) return null;
                return (
                  <button 
                    key={cat}
                    className={`estante-tab ${filtroCategoria === cat ? 'ativo' : ''}`}
                    onClick={() => setFiltroCategoria(cat)}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>

            {/* Grade de Livros */}
            {carregando ? (
              <div className="carregando">
                <div className="spinner"></div>
                <p>Carregando estante...</p>
              </div>
            ) : (
              <div className={`grid-livros-estante ${modoVisualizacao}`}>
                {livrosFiltrados.map(livro => {
                  const prog = calcularProgresso(livro);
                  const isSelecionado = livroAtivo && livroAtivo.id === livro.id;
                  return (
                    <motion.div 
                      key={livro.id}
                      className={`card-livro-estilo ${isSelecionado ? 'ativo' : ''}`}
                      onClick={() => setLivroSelecionadoId(livro.id)}
                      whileHover={{ y: -4 }}
                      layoutId={`estante-livro-${livro.id}`}
                    >
                      <div className="card-livro-cover-wrapper">
                        {livro.capa ? (
                          <img src={livro.capa} alt={livro.titulo} className="card-livro-cover" />
                        ) : (
                          <div className="card-livro-no-cover">
                            <Bookmark size={24} />
                          </div>
                        )}
                        
                        {/* Indicadores sobre a capa */}
                        <div 
                          className={`card-livro-badge-heart ${livro.favorito ? 'favorito' : ''}`}
                          onClick={(e) => alternarFavorito(e, livro.id, livro.favorito)}
                        >
                          <Heart size={14} fill={livro.favorito ? "#ef4444" : "none"} />
                        </div>

                        {livro.avaliacao > 0 && (
                          <div className="card-livro-badge-rating">
                            <Star size={10} fill="#ffd700" />
                            <span>{livro.avaliacao.toFixed(1)}</span>
                          </div>
                        )}

                        {/* Barra de progresso discreta sob a capa */}
                        <div className="card-livro-progress-overlay">
                          <div 
                            className="card-livro-progress-overlay-fill"
                            style={{ width: `${prog}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="card-livro-info-container">
                        <h4>{livro.titulo}</h4>
                        <p>{livro.autor || 'Autor Desconhecido'}</p>
                        
                        <div className="card-livro-reading-meta">
                          <span className="card-livro-meta-chapter">
                            {livro.capituloAtual ? livro.capituloAtual : 'Não iniciado'}
                          </span>
                          <span className="card-livro-meta-percent">
                            {prog}% lido
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}

            {/* Caso estante vazia */}
            {!carregando && livrosFiltrados.length === 0 && (
              <div className="sem-livros" style={{ margin: '40px auto 0 auto' }}>
                <div className="icone-vazio"><Bookmark size={24} /></div>
                <h3>Sem livros correspondentes</h3>
                <p>Use a barra de pesquisa acima para encontrar livros e capas automaticamente, ou crie manualmente!</p>
                <button className="btn-adicionar-primeiro" onClick={() => { console.log('DEBUG: Botao Adicionar Livro (Centro) clicado'); setMostrarFormulario(true); }}>
                  <Plus size={16} /> Adicionar Livro
                </button>
              </div>
            )}
          </section>
        </main>

        {/* ===================================================
           COLUNA DIREITA - Painel Detalhes (Navy Blue Theme)
           =================================================== */}
        <aside className="biblioteca-painel-direita">
          {!livroAtivo ? (
            <div className="painel-direita-vazio">
              <div className="painel-direita-vazio-icon">
                <Bookmark size={24} />
              </div>
              <h4>Nenhum livro selecionado</h4>
              <p>Adicione ou clique em algum livro da sua biblioteca para gerenciar o progresso e criar anotações.</p>
            </div>
          ) : (
            <div className="painel-detalhe-conteudo">
              
              {/* Capa Centralizada em um Container */}
              <div className="painel-detalhe-capa-frame">
                {livroAtivo.capa ? (
                  <img src={livroAtivo.capa} alt={livroAtivo.titulo} className="painel-detalhe-capa-imagem" />
                ) : (
                  <div className="painel-detalhe-capa-no-imagem">
                    <BookOpen size={48} />
                  </div>
                )}
              </div>

              {/* Título & Autor */}
              <div className="painel-detalhe-livro-info">
                <h2>{livroAtivo.titulo}</h2>
                <p>{livroAtivo.autor || 'Autor Desconhecido'}</p>
                <div className="painel-detalhe-stars-rating">
                  {renderEstrelas(livroAtivo.avaliacao || 0, 16)}
                </div>
              </div>

              {/* Caixas de Status/Métricas (3 Colunas) */}
              <div className="painel-detalhe-stats-grid">
                <div className="painel-stat-box">
                  <span className="painel-stat-val">{livroAtivo.paginasTotal || 0}</span>
                  <span className="painel-stat-lbl">Páginas</span>
                </div>
                <div className="painel-stat-box">
                  <span className="painel-stat-val">{calcularProgresso(livroAtivo)}%</span>
                  <span className="painel-stat-lbl">Concluído</span>
                </div>
                <div className="painel-stat-box">
                  <span className="painel-stat-val" style={{ color: getStatusCor(livroAtivo.status), fontSize: '11px' }}>
                    {livroAtivo.status}
                  </span>
                  <span className="painel-stat-lbl">Status</span>
                </div>
              </div>

              {/* Sinopse/Descrição */}
              {livroAtivo.descricao && (
                <div className="painel-detalhe-secao">
                  <h4>Descrição</h4>
                  <p className="painel-detalhe-sinopse-text">{livroAtivo.descricao}</p>
                </div>
              )}

              {/* Acompanhar Progresso (Inputs de Capítulo e Páginas) */}
              <div className="painel-detalhe-tracker-container">
                <div className="painel-detalhe-progress-bar-wrapper">
                  <div className="painel-detalhe-progress-bar-labels">
                    <span>Lido {livroAtivo.paginasLidas} de {livroAtivo.paginasTotal} páginas</span>
                    <span>{calcularProgresso(livroAtivo)}%</span>
                  </div>
                  <div className="painel-detalhe-progress-bar-bg">
                    <div 
                      className="painel-detalhe-progress-bar-fill"
                      style={{ width: `${calcularProgresso(livroAtivo)}%` }}
                    ></div>
                  </div>
                </div>

                <div className="painel-detalhe-tracker-row">
                  <div className="tracker-item-col">
                    <label>Pág. Lidas</label>
                    <input 
                      type="number" 
                      min="0"
                      max={livroAtivo.paginasTotal}
                      value={livroAtivo.paginasLidas}
                      onChange={(e) => atualizarProgresso(livroAtivo.id, parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div className="tracker-item-col">
                    <label>Capítulo Atual</label>
                    <input 
                      type="text" 
                      placeholder="Ex: Cap. 4"
                      value={livroAtivo.capituloAtual || ''}
                      onChange={(e) => atualizarCapitulo(livroAtivo.id, e.target.value)}
                    />
                  </div>
                  <div className="tracker-item-col">
                    <label>Status</label>
                    <select 
                      value={livroAtivo.status}
                      onChange={(e) => atualizarStatusDireto(livroAtivo.id, e.target.value)}
                    >
                      {statusLeitura.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Avaliação por estrelas interativa */}
              <div className="painel-detalhe-secao" style={{ alignItems: 'center' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--book-navy-text-muted)', textTransform: 'uppercase' }}>
                  Avaliar Obra
                </span>
                <div className="painel-detalhe-stars-rating">
                  {renderEstrelasInterativas(livroAtivo.id, livroAtivo.avaliacao || 0)}
                </div>
              </div>

              {/* Anotações e Resumos do Livro */}
              <div className="painel-detalhe-secao">
                <h4>Anotações e Resumos</h4>
                
                {/* Form para Nova Anotação */}
                <form onSubmit={salvarAnotacao} className="painel-anotacoes-form">
                  <div className="painel-anotacoes-inputs-row">
                    <div className="tracker-item-col">
                      <label>Capítulo/Tópico</label>
                      <input 
                        type="text" 
                        placeholder="Capítulo"
                        value={anotacaoCapitulo}
                        onChange={(e) => setAnotacaoCapitulo(e.target.value)}
                      />
                    </div>
                    <div className="tracker-item-col">
                      <label>Página</label>
                      <input 
                        type="number" 
                        placeholder="Pág."
                        value={anotacaoPagina}
                        onChange={(e) => setAnotacaoPagina(e.target.value)}
                      />
                    </div>
                  </div>
                  <textarea 
                    placeholder="Escreva um resumo, citação ou insight sobre este livro..."
                    value={anotacaoTexto}
                    onChange={(e) => setAnotacaoTexto(e.target.value)}
                    className="painel-anotacoes-textarea"
                    required
                  />
                  <button type="submit" className="painel-anotacoes-btn-submit">
                    Adicionar Anotação
                  </button>
                </form>

                {/* Lista de Anotações */}
                <div className="painel-anotacoes-lista">
                  {(!livroAtivo.anotacoes || livroAtivo.anotacoes.length === 0) ? (
                    <div className="sem-anotacoes" style={{ backgroundColor: 'var(--book-navy-surface)', borderStyle: 'dashed' }}>
                      Nenhum resumo feito ainda. Salve anotações dos capítulos no formulário acima.
                    </div>
                  ) : (
                    <AnimatePresence>
                      {livroAtivo.anotacoes.map(anot => (
                        <motion.div 
                          key={anot.id}
                          className="painel-anotacao-card"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 10 }}
                        >
                          <div className="painel-anotacao-header">
                            <div className="painel-anotacao-tags">
                              {anot.capitulo && <span className="tag-navy-cap">Cap. {anot.capitulo}</span>}
                              {anot.pagina > 0 && <span className="tag-navy-pag">Pág. {anot.pagina}</span>}
                            </div>
                            <button 
                              className="btn-apagar-anotacao-navy"
                              onClick={() => deletarAnotacao(anot.id)}
                            >
                              <X size={12} />
                            </button>
                          </div>
                          <p className="painel-anotacao-texto">{anot.texto}</p>
                          <div className="painel-anotacao-data">
                            <Clock size={10} />
                            <span>{new Date(anot.data).toLocaleDateString('pt-BR')}</span>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  )}
                </div>
              </div>

              {/* Botões de Ação do Painel */}
              <div className="painel-detalhe-acoes-rodape">
                <button className="btn-painel-editar" onClick={() => iniciarEdicao(livroAtivo)}>
                  <Edit3 size={14} /> Editar Dados
                </button>
                <button className="btn-painel-remover" onClick={() => removerLivro(livroAtivo.id)}>
                  <Trash2 size={14} /> Remover
                </button>
              </div>

            </div>
          )}
        </aside>

      </div>

      {/* ===================================================
         MODAL DE CADASTRO/EDIÇÃO MANUAL (Form Overlay)
         =================================================== */}
      <AnimatePresence>
        {mostrarFormulario && (
          <div className="modal-overlay-novo">
            <motion.div 
              className="modal-container-novo"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <div className="modal-header-novo">
                <h2>{modoEdicao ? 'Editar Registro' : 'Adicionar Manualmente'}</h2>
                <button 
                  className="btn-fechar-novo"
                  onClick={() => {
                    setMostrarFormulario(false);
                    cancelarEdicao();
                  }}
                >
                  <X size={20} />
                </button>
              </div>
              
              <form onSubmit={adicionarLivro} className="form-novo">
                <div className="form-grid-novo">
                  <div className="input-group-novo input-full-novo">
                    <label className="label-novo">Título *</label>
                    <input
                      className="input-novo"
                      type="text"
                      value={novoLivro.titulo}
                      onChange={(e) => setNovoLivro({...novoLivro, titulo: e.target.value})}
                      placeholder="Nome do livro ou resumo"
                      required
                    />
                  </div>
                  
                  <div className="input-group-novo">
                    <label className="label-novo">Autor</label>
                    <input
                      className="input-novo"
                      type="text"
                      value={novoLivro.autor}
                      onChange={(e) => setNovoLivro({...novoLivro, autor: e.target.value})}
                      placeholder="Autor do livro"
                    />
                  </div>

                  <div className="input-group-novo input-full-novo">
                    <label className="label-novo">Capa do Livro (Imagem)</label>
                    <div className="upload-container-row" style={{ display: 'flex', gap: '12px', alignItems: 'center', marginTop: '4px' }}>
                      <input
                        className="input-novo"
                        type="text"
                        value={novoLivro.capa}
                        onChange={(e) => setNovoLivro({...novoLivro, capa: e.target.value})}
                        placeholder="Cole o link da capa ou deixe vazio para busca automática pelo título"
                        style={{ flex: 1 }}
                      />
                      <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--book-text-muted)' }}>OU</span>
                      <label className="btn-upload-capa-label" style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        backgroundColor: 'var(--book-bg-center)',
                        color: 'var(--book-text-dark)',
                        padding: '12px 16px',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: 700,
                        border: '1px solid var(--book-border)',
                        whiteSpace: 'nowrap',
                        transition: 'all 0.2s ease'
                      }}>
                        <Upload size={14} /> Carregar Arquivo
                        <input 
                          type="file" 
                          accept="image/*"
                          onChange={handleUploadImagemCapa}
                          style={{ display: 'none' }}
                        />
                      </label>
                    </div>
                    {novoLivro.capa && (
                      <div className="upload-preview-row" style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <img 
                          src={novoLivro.capa} 
                          alt="Previsualização" 
                          style={{ width: '40px', height: '60px', borderRadius: '6px', objectFit: 'cover', border: '1px solid var(--book-border)' }} 
                        />
                        <span style={{ fontSize: '12px', color: 'var(--book-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '300px' }}>
                          Previsualização da Capa
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="input-group-novo">
                    <label className="label-novo">Categoria</label>
                    <select
                      className="select-novo"
                      value={novoLivro.categoria}
                      onChange={(e) => setNovoLivro({...novoLivro, categoria: e.target.value})}
                    >
                      {categorias.map(categoria => (
                        <option key={categoria} value={categoria}>{categoria}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="input-group-novo">
                    <label className="label-novo">Tipo de Material</label>
                    <select
                      className="select-novo"
                      value={novoLivro.tipo}
                      onChange={(e) => setNovoLivro({...novoLivro, tipo: e.target.value})}
                    >
                      {tipos.map(tipo => (
                        <option key={tipo} value={tipo}>{tipo}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="input-group-novo input-full-novo">
                    <label className="label-novo">Descrição</label>
                    <textarea
                      className="textarea-novo"
                      value={novoLivro.descricao}
                      onChange={(e) => setNovoLivro({...novoLivro, descricao: e.target.value})}
                      placeholder="Descrição, sinopse ou resumo rápido da obra..."
                      rows="3"
                    />
                  </div>
                  
                  <div className="input-group-novo">
                    <label className="label-novo">Total de Páginas</label>
                    <input
                      className="input-novo"
                      type="number"
                      value={novoLivro.paginasTotal}
                      onChange={(e) => setNovoLivro({...novoLivro, paginasTotal: e.target.value})}
                      placeholder="Ex: 350"
                      min="0"
                    />
                  </div>
                  
                  <div className="input-group-novo">
                    <label className="label-novo">Páginas Lidas</label>
                    <input
                      className="input-novo"
                      type="number"
                      value={novoLivro.paginasLidas}
                      onChange={(e) => setNovoLivro({...novoLivro, paginasLidas: parseInt(e.target.value) || 0})}
                      placeholder="Ex: 50"
                      min="0"
                    />
                  </div>
                  
                  <div className="input-group-novo">
                    <label className="label-novo">Status</label>
                    <select
                      className="select-novo"
                      value={novoLivro.status}
                      onChange={(e) => setNovoLivro({...novoLivro, status: e.target.value})}
                    >
                      {statusLeitura.map(status => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="input-group-novo">
                    <label className="label-novo">Avaliação</label>
                    <select
                      className="select-novo"
                      value={novoLivro.avaliacao}
                      onChange={(e) => setNovoLivro({...novoLivro, avaliacao: parseInt(e.target.value)})}
                    >
                      {[0, 1, 2, 3, 4, 5].map(nota => (
                        <option key={nota} value={nota}>{nota} {nota > 0 ? '⭐'.repeat(nota) : 'Sem Nota'}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="input-group-novo">
                    <label className="label-novo">Data de Início</label>
                    <input
                      className="input-novo"
                      type="date"
                      value={novoLivro.dataInicio}
                      onChange={(e) => setNovoLivro({...novoLivro, dataInicio: e.target.value})}
                    />
                  </div>
                  
                  <div className="input-group-novo">
                    <label className="label-novo">Data de Término</label>
                    <input
                      className="input-novo"
                      type="date"
                      value={novoLivro.dataTermino}
                      onChange={(e) => setNovoLivro({...novoLivro, dataTermino: e.target.value})}
                    />
                  </div>

                  <div className="input-group-novo input-full-novo">
                    <label className="label-novo">Link para Compra/Download</label>
                    <input
                      className="input-novo"
                      type="url"
                      value={novoLivro.linkCompra}
                      onChange={(e) => setNovoLivro({...novoLivro, linkCompra: e.target.value})}
                      placeholder="https://amazon.com..."
                    />
                  </div>
                </div>
                
                <div className="form-actions-novo">
                  <button type="submit" className="btn-salvar-novo" disabled={salvando}>
                    {salvando ? (
                      <>
                        <div className="spinner-novo"></div>
                        Gravando...
                      </>
                    ) : (
                      'Salvar Registro'
                    )}
                  </button>
                  <button 
                    type="button" 
                    className="btn-cancelar-novo" 
                    onClick={() => {
                      setMostrarFormulario(false);
                      cancelarEdicao();
                    }}
                    disabled={salvando}
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Leitura;