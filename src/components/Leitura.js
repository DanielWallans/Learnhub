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
import './Leitura.css';

const Leitura = () => {
  const [user, loading] = useAuthState(auth);
  const navigate = useNavigate();
  
  // Estados principais
  const [livros, setLivros] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [livroEditando, setLivroEditando] = useState(null);
  
  // Estados do formulário
  const [novoLivro, setNovoLivro] = useState({
    titulo: '',
    autor: '',
    categoria: 'Ficção',
    tipo: 'Livro',
    descricao: '',
    paginasTotal: '',
    paginasLidas: 0,
    status: 'Não Iniciado',
    avaliacao: 0,
    notas: '',
    dataInicio: '',
    dataTermino: '',
    linkCompra: '',
    capa: ''
  });
  
  // Estados de filtros e visualização
  const [filtroCategoria, setFiltroCategoria] = useState('Todas');
  const [filtroStatus, setFiltroStatus] = useState('Todos');
  const [filtroTipo, setFiltroTipo] = useState('Todos');
  const [modoVisualizacao, setModoVisualizacao] = useState('grid'); // grid ou lista
  const [mostrarEstatisticas, setMostrarEstatisticas] = useState(true);
  const [mostrarDicas, setMostrarDicas] = useState(false);
  
  // Configurações
  const categorias = [
    'Ficção', 'Não-Ficção', 'Biografia', 'História', 'Ciência',
    'Tecnologia', 'Filosofia', 'Psicologia', 'Autoajuda', 'Negócios',
    'Literatura', 'Poesia', 'Drama', 'Mistério', 'Romance',
    'Fantasia', 'Ficção Científica', 'Terror', 'Aventura', 'Educação'
  ];
  
  const tipos = [
    'Livro', 'E-book', 'Audiobook', 'Resumo', 'Apostila', 
    'Artigo', 'Paper', 'Revista', 'Jornal', 'Manual'
  ];
  
  const statusLeitura = [
    'Não Iniciado', 'Lendo', 'Pausado', 'Concluído', 'Abandonado'
  ];
  
  const sitesRecomendados = [
    {
      nome: 'Amazon Kindle',
      url: 'https://www.amazon.com.br/kindle',
      descricao: 'A maior loja de e-books do mundo com milhões de títulos. Encontre desde best-sellers até livros independentes, com recursos de sincronização entre dispositivos e notas compartilhadas.',
      categoria: 'E-books',
      icone: <svg width="32" height="32" viewBox="0 0 24 24" fill="#ff9800"><path d="M21,5c-1.11-0.35-2.33-0.5-3.5-0.5c-1.95,0-4.05,0.4-5.5,1.5c-1.45-1.1-3.55-1.5-5.5-1.5S2.45,4.9,1,6v14.65 c0,0.25,0.25,0.5,0.5,0.5c0.1,0,0.15-0.05,0.25-0.05C3.1,20.45,5.05,20,6.5,20c1.95,0,4.05,0.4,5.5,1.5c1.35-0.85,3.8-1.5,5.5-1.5 c1.65,0,3.35,0.3,4.75,1.05c0.1,0.05,0.15,0.05,0.25,0.05c0.25,0,0.5-0.25,0.5-0.5V6C22.4,5.55,21.75,5.25,21,5z M21,18.5 c-1.1-0.35-2.3-0.5-3.5-0.5c-1.7,0-4.15,0.65-5.5,1.5V8c1.35-0.85,3.8-1.5,5.5-1.5c1.2,0,2.4,0.15,3.5,0.5V18.5z"/><path d="M17.5,10.5c0.88,0,1.73,0.09,2.5,0.26V9.24C19.21,9.09,18.36,9,17.5,9c-1.7,0-3.24,0.29-4.5,0.83v1.66 C14.13,10.81,15.7,10.5,17.5,10.5z"/><path d="M13,12.49v1.66c1.13-0.68,2.7-0.99,4.5-0.99c0.88,0,1.73,0.09,2.5,0.26V11.9c-0.79-0.15-1.64-0.24-2.5-0.24 C15.8,11.66,14.26,11.96,13,12.49z"/><path d="M17.5,14.33c-1.7,0-3.24,0.29-4.5,0.83v1.66c1.26-0.54,2.8-0.83,4.5-0.83c0.88,0,1.73,0.09,2.5,0.26v-1.52 C19.21,14.58,18.36,14.33,17.5,14.33z"/></svg>,
      recursos: ['Sincronização multi-dispositivo', 'Notas e destaques', 'Dicionário integrado', 'Ajuste de fonte']
    },
    {
      nome: 'Google Books',
      url: 'https://books.google.com.br',
      descricao: 'Biblioteca digital gratuita do Google com milhões de livros digitalizados. Acesse obras clássicas, livros acadêmicos e visualize prévias de livros comerciais.',
      categoria: 'Gratuito',
      icone: <svg width="32" height="32" viewBox="0 0 24 24" fill="#4285f4"><path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.097.118.112.221.083.343-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.746-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24c6.624 0 11.99-5.367 11.99-12.013C24.007 5.367 18.641.001 12.017.001z"/></svg>,
      recursos: ['Busca dentro dos livros', 'Visualização de páginas', 'Livros de domínio público', 'Integração com Google Drive']
    },
    {
      nome: 'Project Gutenberg',
      url: 'https://www.gutenberg.org',
      descricao: 'Mais de 70.000 livros gratuitos de domínio público. Encontre clássicos da literatura mundial em diversos formatos (EPUB, PDF, HTML) e idiomas.',
      categoria: 'Gratuito',
      icone: <svg width="32" height="32" viewBox="0 0 24 24" fill="#8bc34a"><path d="M18,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V4A2,2 0 0,0 18,2M18,20H6V4H7V9L9.5,7.5L12,9V4H18V20Z"/></svg>,
      recursos: ['70.000+ livros gratuitos', 'Múltiplos formatos', 'Clássicos mundiais', 'Sem DRM']
    },
    {
      nome: 'Skoob',
      url: 'https://www.skoob.com.br',
      descricao: 'A maior rede social brasileira para leitores. Organize sua estante virtual, descubra novos livros através de recomendações e conecte-se com outros leitores.',
      categoria: 'Comunidade',
      icone: <svg width="32" height="32" viewBox="0 0 24 24" fill="#e91e63"><path d="M16,4C16.88,4 17.67,4.84 17.67,5.75C17.67,6.66 16.88,7.5 16,7.5C15.12,7.5 14.33,6.66 14.33,5.75C14.33,4.84 15.12,4 16,4M8,4C8.88,4 9.67,4.84 9.67,5.75C9.67,6.66 8.88,7.5 8,7.5C7.12,7.5 6.33,6.66 6.33,5.75C6.33,4.84 7.12,4 8,4M12,14C16,14 20,15.79 20,18V20H4V18C4,15.79 8,14 12,14M8,9C10.21,9 12,10.79 12,13C12,15.21 10.21,17 8,17C5.79,17 4,15.21 4,13C4,10.79 5.79,9 8,9M16,9C18.21,9 20,10.79 20,13C20,15.21 18.21,17 16,17C13.79,17 12,15.21 12,13C12,10.79 13.79,9 16,9Z"/></svg>,
      recursos: ['Estante virtual', 'Recomendações personalizadas', 'Grupos de leitura', 'Metas de leitura']
    },
    {
      nome: 'Goodreads',
      url: 'https://www.goodreads.com',
      descricao: 'A maior comunidade mundial de leitores com mais de 90 milhões de membros. Descubra livros, leia resenhas, participe de desafios de leitura e conecte-se globalmente.',
      categoria: 'Comunidade',
      icone: <svg width="32" height="32" viewBox="0 0 24 24" fill="#ffc107"><path d="M12,17.27L18.18,21L16.54,13.97L22,9.24L14.81,8.62L12,2L9.19,8.62L2,9.24L7.45,13.97L5.82,21L12,17.27Z"/></svg>,
      recursos: ['90M+ membros', 'Desafios de leitura', 'Resenhas detalhadas', 'Listas temáticas']
    },
    {
      nome: 'Biblioteca Nacional Digital',
      url: 'https://bndigital.bn.gov.br',
      descricao: 'Acervo digital oficial da Biblioteca Nacional do Brasil. Acesse documentos históricos, manuscritos raros, jornais antigos e obras brasileiras digitalizadas.',
      categoria: 'Gratuito',
      icone: <svg width="32" height="32" viewBox="0 0 24 24" fill="#795548"><path d="M12,3L2,12H5V20H19V12H22L12,3M12,8.75A2.25,2.25 0 0,1 14.25,11A2.25,2.25 0 0,1 12,13.25A2.25,2.25 0 0,1 9.75,11A2.25,2.25 0 0,1 12,8.75M7,18.5V16.5H17V18.5H7Z"/></svg>,
      recursos: ['Documentos históricos', 'Manuscritos raros', 'Jornais antigos', 'Patrimônio cultural brasileiro']
    },
    {
      nome: 'SciELO',
      url: 'https://www.scielo.br',
      descricao: 'Biblioteca eletrônica de periódicos científicos brasileiros e latino-americanos. Acesse artigos revisados por pares em acesso aberto nas mais diversas áreas.',
      categoria: 'Acadêmico',
      icone: <svg width="32" height="32" viewBox="0 0 24 24" fill="#009688"><path d="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z"/></svg>,
      recursos: ['Artigos revisados por pares', 'Acesso aberto', 'Métricas de citação', 'Múltiplas áreas científicas']
    },
    {
      nome: 'JSTOR',
      url: 'https://www.jstor.org',
      descricao: 'Base de dados acadêmica com milhões de artigos, livros e fontes primárias. Essencial para pesquisa acadêmica com conteúdo de alta qualidade.',
      categoria: 'Acadêmico',
      icone: <svg width="32" height="32" viewBox="0 0 24 24" fill="#3f51b5"><path d="M12,3L1,9L12,15L21,10.09V17H23V9M5,13.18V17.18L12,21L19,17.18V13.18L12,17L5,13.18Z"/></svg>,
      recursos: ['Milhões de artigos', 'Fontes primárias', 'Pesquisa avançada', 'Conteúdo multidisciplinar']
    },
    {
      nome: 'Open Library',
      url: 'https://openlibrary.org',
      descricao: 'Biblioteca aberta da Internet Archive com mais de 20 milhões de registros. Empreste livros digitalmente ou acesse obras de domínio público gratuitamente.',
      categoria: 'Gratuito',
      icone: <svg width="32" height="32" viewBox="0 0 24 24" fill="#4caf50"><path d="M18,16.08C17.24,16.08 16.56,16.38 16.04,16.85L8.91,12.7C8.96,12.47 9,12.24 9,12C9,11.76 8.96,11.53 8.91,11.3L15.96,7.19C16.5,7.69 17.21,8 18,8A3,3 0 0,0 21,5A3,3 0 0,0 18,2A3,3 0 0,0 15,5C15,5.24 15.04,5.47 15.09,5.7L8.04,9.81C7.5,9.31 6.79,9 6,9A3,3 0 0,0 3,12A3,3 0 0,0 6,15C6.79,15 7.5,14.69 8.04,14.19L15.16,18.34C15.11,18.55 15.08,18.77 15.08,19C15.08,20.61 16.39,21.91 18,21.91C19.61,21.91 20.92,20.61 20.92,19A2.92,2.92 0 0,0 18,16.08Z"/></svg>,
      recursos: ['20M+ registros', 'Empréstimo digital', 'Domínio público', 'Edição colaborativa']
    },
    {
      nome: 'Kobo',
      url: 'https://www.kobo.com',
      descricao: 'Plataforma global de e-books com mais de 6 milhões de títulos. Oferece e-readers dedicados e aplicativos para todos os dispositivos com recursos sociais.',
      categoria: 'E-books',
      icone: <svg width="32" height="32" viewBox="0 0 24 24" fill="#607d8b"><path d="M17,7H22V17H17V19A1,1 0 0,0 18,20H20V22H17.5C16.95,22 16,21.55 16,21C16,21.55 15.05,22 14.5,22H12V20H14A1,1 0 0,0 15,19V5A1,1 0 0,0 14,4H12V2H14.5C15.05,2 16,2.45 16,3C16,2.45 16.95,2 17.5,2H20V4H18A1,1 0 0,0 17,5V7M2,7H7V17H2V7M8,7H13V17H8V7M4,9V15H5V9H4M10,9V15H11V9H10M19,9V15H20V9H19Z"/></svg>,
      recursos: ['6M+ títulos', 'E-readers dedicados', 'Recursos sociais', 'Sincronização na nuvem']
    },
    {
      nome: 'Audible',
      url: 'https://www.audible.com',
      descricao: 'Maior plataforma de audiolivros do mundo. Escute milhares de títulos narrados por profissionais, com recursos de velocidade variável e marcadores.',
      categoria: 'Audiobooks',
      icone: <svg width="32" height="32" viewBox="0 0 24 24" fill="#ff5722"><path d="M14,3.23V5.29C16.89,6.15 19,8.83 19,12C19,15.17 16.89,17.84 14,18.7V20.77C18,19.86 21,16.28 21,12C21,7.72 18,4.14 14,3.23M16.5,12C16.5,10.23 15.5,8.71 14,7.97V16C15.5,15.29 16.5,13.76 16.5,12M3,9V15H7L12,20V4L7,9H3Z"/></svg>,
      recursos: ['Narração profissional', 'Velocidade variável', 'Marcadores', 'Modo offline']
    },
    {
      nome: 'Storytel',
      url: 'https://www.storytel.com',
      descricao: 'Serviço de streaming de audiolivros e e-books por assinatura. Acesse milhares de títulos em português e outros idiomas, com narrações de alta qualidade.',
      categoria: 'Audiobooks',
      icone: <svg width="32" height="32" viewBox="0 0 24 24" fill="#9c27b0"><path d="M12,3V12.26C11.5,12.09 11,12 10.5,12C8,12 6,14 6,16.5C6,19 8,21 10.5,21C13,21 15,19 15,16.5V6H19V3H12Z"/></svg>,
      recursos: ['Streaming ilimitado', 'Múltiplos idiomas', 'Narrações exclusivas', 'Modo offline']
    },
    {
      nome: 'ResearchGate',
      url: 'https://www.researchgate.net',
      descricao: 'Rede social para pesquisadores e cientistas. Acesse publicações acadêmicas, conecte-se com pesquisadores e acompanhe as últimas descobertas científicas.',
      categoria: 'Acadêmico',
      icone: <svg width="32" height="32" viewBox="0 0 24 24" fill="#00bcd4"><path d="M5,3H7V5H5V10A2,2 0 0,1 3,8V5A2,2 0 0,1 5,3M19,3A2,2 0 0,1 21,5V8A2,2 0 0,1 19,10V5H17V3H19M12,5A3,3 0 0,1 15,8A3,3 0 0,1 12,11A3,3 0 0,1 9,8A3,3 0 0,1 12,5M12,7A1,1 0 0,0 11,8A1,1 0 0,0 12,9A1,1 0 0,0 13,8A1,1 0 0,0 12,7M7,22A2,2 0 0,1 5,20V18A2,2 0 0,1 7,16H17A2,2 0 0,1 19,18V20A2,2 0 0,1 17,22H7M7,18V20H17V18H7Z"/></svg>,
      recursos: ['Rede de pesquisadores', 'Publicações acadêmicas', 'Colaboração científica', 'Métricas de impacto']
    },
    {
      nome: 'Wattpad',
      url: 'https://www.wattpad.com',
      descricao: 'Plataforma global para escritores e leitores independentes. Descubra histórias originais, participe de comunidades de fãs e acompanhe autores emergentes.',
      categoria: 'Comunidade',
      icone: <svg width="32" height="32" viewBox="0 0 24 24" fill="#ff9800"><path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/></svg>,
      recursos: ['Histórias originais', 'Autores independentes', 'Comunidades ativas', 'Publicação gratuita']
    },
    {
      nome: 'Medium',
      url: 'https://medium.com',
      descricao: 'Plataforma de publicação com artigos de alta qualidade sobre tecnologia, negócios, ciência e cultura. Leia insights de especialistas e thought leaders.',
      categoria: 'Artigos',
      icone: <svg width="32" height="32" viewBox="0 0 24 24" fill="#424242"><path d="M19,5V19H5V5H19M19,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5A2,2 0 0,0 19,3M14,17H7V15H14V17M17,13H7V11H17V13M17,9H7V7H17V9Z"/></svg>,
      recursos: ['Artigos especializados', 'Thought leaders', 'Curadoria de qualidade', 'Temas variados']
    },
    {
      nome: 'Librivox',
      url: 'https://librivox.org',
      descricao: 'Audiolivros gratuitos de obras de domínio público, narrados por voluntários do mundo todo. Acesse clássicos da literatura em formato de áudio gratuitamente.',
      categoria: 'Audiobooks',
      icone: <svg width="32" height="32" viewBox="0 0 24 24" fill="#2196f3"><path d="M3,9H7L12,4V20L7,15H3V9M16.59,12L14,9.41L15.41,8L20.41,13L15.41,18L14,16.59L16.59,12Z"/></svg>,
      recursos: ['Audiolivros gratuitos', 'Domínio público', 'Voluntários globais', 'Clássicos da literatura']
    }
  ];
  
  // Carregar livros do Firebase
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
  
  // Funções de manipulação de dados
  const salvarLivroFirebase = async (livroData) => {
    try {
      await addDoc(collection(db, 'leitura'), {
        ...livroData,
        userId: user.uid,
        dataCriacao: new Date().toISOString(),
        dataAtualizacao: new Date().toISOString()
      });
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
      const livroData = {
        ...novoLivro,
        paginasTotal: parseInt(novoLivro.paginasTotal) || 0,
        paginasLidas: parseInt(novoLivro.paginasLidas) || 0,
        avaliacao: parseInt(novoLivro.avaliacao) || 0
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
      status: 'Não Iniciado',
      avaliacao: 0,
      notas: '',
      dataInicio: '',
      dataTermino: '',
      linkCompra: '',
      capa: ''
    });
  };
  
  const removerLivro = async (id) => {
    if (window.confirm('Tem certeza que deseja remover este item?')) {
      try {
        await deletarLivroFirebase(id);
      } catch (error) {
        alert('Erro ao remover item. Tente novamente.');
      }
    }
  };
  
  const atualizarProgresso = async (id, novasPaginas) => {
    const livro = livros.find(l => l.id === id);
    if (!livro) return;
    
    const paginasLidas = Math.max(0, Math.min(novasPaginas, livro.paginasTotal));
    let novoStatus = livro.status;
    
    if (paginasLidas === 0) {
      novoStatus = 'Não Iniciado';
    } else if (paginasLidas === livro.paginasTotal) {
      novoStatus = 'Concluído';
    } else if (livro.status === 'Não Iniciado') {
      novoStatus = 'Lendo';
    }
    
    try {
      await atualizarLivroFirebase(id, {
        paginasLidas,
        status: novoStatus,
        ...(novoStatus === 'Concluído' && !livro.dataTermino ? { dataTermino: new Date().toISOString().split('T')[0] } : {})
      });
    } catch (error) {
      alert('Erro ao atualizar progresso.');
    }
  };

  const atualizarAvaliacao = async (id, novaAvaliacao) => {
    try {
      await atualizarLivroFirebase(id, {
        avaliacao: novaAvaliacao
      });
    } catch (error) {
      alert('Erro ao atualizar avaliação.');
    }
  };
  
  // Funções de filtro
  const livrosFiltrados = livros.filter(livro => {
    const categoriaMatch = filtroCategoria === 'Todas' || livro.categoria === filtroCategoria;
    const statusMatch = filtroStatus === 'Todos' || livro.status === filtroStatus;
    const tipoMatch = filtroTipo === 'Todos' || livro.tipo === filtroTipo;
    return categoriaMatch && statusMatch && tipoMatch;
  });
  
  // Calcular estatísticas
  const estatisticas = {
    total: livros.length,
    concluidos: livros.filter(l => l.status === 'Concluído').length,
    lendo: livros.filter(l => l.status === 'Lendo').length,
    paginasLidas: livros.reduce((acc, l) => acc + (l.paginasLidas || 0), 0),
    mediaAvaliacao: livros.length > 0 ? (livros.reduce((acc, l) => acc + (l.avaliacao || 0), 0) / livros.length).toFixed(1) : 0
  };
  
  // Funções utilitárias
  const calcularProgresso = (livro) => {
    if (!livro.paginasTotal || livro.paginasTotal === 0) return 0;
    return Math.round((livro.paginasLidas / livro.paginasTotal) * 100);
  };
  
  const getStatusCor = (status) => {
    const cores = {
      'Não Iniciado': '#6b7280',
      'Lendo': '#3b82f6',
      'Pausado': '#f59e0b',
      'Concluído': '#10b981',
      'Abandonado': '#ef4444'
    };
    return cores[status] || '#6b7280';
  };
  
  const renderEstrelas = (avaliacao) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={`estrela ${i < avaliacao ? 'preenchida' : ''}`}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill={i < avaliacao ? "#ffd700" : "#e0e0e0"}>
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      </span>
    ));
  };

  const renderEstrelasInterativas = (livroId, avaliacaoAtual) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span 
        key={i} 
        className={`estrela-interativa ${i < avaliacaoAtual ? 'preenchida' : ''}`}
        onClick={() => atualizarAvaliacao(livroId, i + 1)}
        title={`Avaliar com ${i + 1} estrela${i > 0 ? 's' : ''}`}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill={i < avaliacaoAtual ? "#ffd700" : "#e0e0e0"}>
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      </span>
    ));
  };
  
  if (loading) {
    return <div className="carregando">Carregando...</div>;
  }
  
  if (!user) {
    return (
      <div className="modulo-leitura">
        <div className="acesso-restrito">
          <div className="icone-restrito">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="#546e7a">
              <path d="M21 5c-1.11-.35-2.33-.5-3.5-.5-1.95 0-4.05.4-5.5 1.5-1.45-1.1-3.55-1.5-5.5-1.5S2.45 4.9 1 6v14.65c0 .25.25.5.5.5.1 0 .15-.05.25-.05C3.1 20.45 5.05 20 6.5 20c1.95 0 4.05.4 5.5 1.5 1.35-.85 3.8-1.5 5.5-1.5 1.65 0 3.35.3 4.75 1.05.1.05.15.05.25.05.25 0 .5-.25.5-.5V6c-.6-.45-1.25-.75-2-1zm0 13.5c-1.1-.35-2.3-.5-3.5-.5-1.7 0-4.15.65-5.5 1.5V8c1.35-.85 3.8-1.5 5.5-1.5 1.2 0 2.4.15 3.5.5v11.5z"/>
            </svg>
          </div>
          <h2>Acesso Restrito</h2>
          <p>Você precisa estar logado para acessar o módulo de leitura.</p>
          <button onClick={() => navigate('/login')} className="btn-login">
            Fazer Login
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="modulo-leitura">
      <div className="container-leitura">
        {/* Header */}
        <div className="header-leitura">
          <div className="titulo-secao">
            <div className="icone-titulo">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="#546e7a">
                <path d="M21 5c-1.11-.35-2.33-.5-3.5-.5-1.95 0-4.05.4-5.5 1.5-1.45-1.1-3.55-1.5-5.5-1.5S2.45 4.9 1 6v14.65c0 .25.25.5.5.5.1 0 .15-.05.25-.05C3.1 20.45 5.05 20 6.5 20c1.95 0 4.05.4 5.5 1.5 1.35-.85 3.8-1.5 5.5-1.5 1.65 0 3.35.3 4.75 1.05.1.05.15.05.25.05.25 0 .5-.25.5-.5V6c-.6-.45-1.25-.75-2-1zm0 13.5c-1.1-.35-2.3-.5-3.5-.5-1.7 0-4.15.65-5.5 1.5V8c1.35-.85 3.8-1.5 5.5-1.5 1.2 0 2.4.15 3.5.5v11.5z"/>
              </svg>
            </div>
            <div>
              <h1>Biblioteca Pessoal</h1>
              <p>Organize sua jornada de leitura e conhecimento</p>
            </div>
          </div>
          
          <div className="acoes-header">
            <button 
              onClick={() => navigate('/dashboard')} 
              className="btn-voltar"
            >
              ← Dashboard
            </button>
            <button 
              onClick={() => setMostrarDicas(!mostrarDicas)} 
              className="btn-dicas"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{marginRight: '8px'}}>
                <path d="M9 21c0 .5.4 1 1 1h4c.6 0 1-.5 1-1v-1H9v1zm3-19C8.1 2 5 5.1 5 9c0 2.4 1.2 4.5 3 5.7V17c0 .5.4 1 1 1h6c.6 0 1-.5 1-1v-2.3c1.8-1.3 3-3.4 3-5.7 0-3.9-3.1-7-7-7z"/>
              </svg>
              Dicas de Sites
            </button>
            <button 
              onClick={() => {
                cancelarEdicao();
                setMostrarFormulario(!mostrarFormulario);
              }} 
              className="btn-adicionar"
            >
              + Adicionar Item
            </button>
          </div>
        </div>
        
        {/* Estatísticas */}
        {mostrarEstatisticas && (
          <div className="estatisticas-leitura">
            <div className="stat-card">
              <div className="stat-numero">{estatisticas.total}</div>
              <div className="stat-label">Total de Itens</div>
            </div>
            <div className="stat-card">
              <div className="stat-numero">{estatisticas.concluidos}</div>
              <div className="stat-label">Concluídos</div>
            </div>
            <div className="stat-card">
              <div className="stat-numero">{estatisticas.lendo}</div>
              <div className="stat-label">Lendo Agora</div>
            </div>
            <div className="stat-card">
              <div className="stat-numero">{estatisticas.paginasLidas}</div>
              <div className="stat-label">Páginas Lidas</div>
            </div>
            <div className="stat-card">
              <div className="stat-numero">{estatisticas.mediaAvaliacao}</div>
              <div className="stat-label">Avaliação Média</div>
            </div>
          </div>
        )}
        
        {/* Dicas de Sites */}
        {mostrarDicas && (
          <div className="dicas-sites">
            <h3><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style={{marginRight: '8px'}}>
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
            </svg> Sites Recomendados para Leitura</h3>
            <div className="sites-grid">
              {sitesRecomendados.map((site, index) => (
                <div key={index} className="site-card" data-categoria={site.categoria}>
                  <div className="site-header">
                    <div className="site-icone">{site.icone}</div>
                    <div className="site-categoria">{site.categoria}</div>
                  </div>
                  
                  <div className="site-content">
                    <h4 className="site-nome">{site.nome}</h4>
                    <p className="site-descricao">{site.descricao}</p>
                    
                    <div className="site-recursos">
                      <h5>Principais recursos:</h5>
                      <ul className="recursos-lista">
                        {site.recursos.map((recurso, idx) => (
                          <li key={idx} className="recurso-item">
                            <span className="recurso-bullet">✓</span>
                            {recurso}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  
                  <div className="site-footer">
                    <a href={site.url} target="_blank" rel="noopener noreferrer" className="btn-visitar">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{marginRight: '8px'}}>
                        <path d="M14,3V5H17.59L7.76,14.83L9.17,16.24L19,6.41V10H21V3M19,19H5V5H12V3H5C3.89,3 3,3.9 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V12H19V19Z"/>
                      </svg>
                      Visitar Site
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Controles e Filtros */}
        <div className="controles-leitura">
          <div className="filtros">
            <select 
              value={filtroCategoria} 
              onChange={(e) => setFiltroCategoria(e.target.value)}
              className="filtro-select"
            >
              <option value="Todas">Todas as Categorias</option>
              {categorias.map(categoria => (
                <option key={categoria} value={categoria}>{categoria}</option>
              ))}
            </select>
            
            <select 
              value={filtroStatus} 
              onChange={(e) => setFiltroStatus(e.target.value)}
              className="filtro-select"
            >
              <option value="Todos">Todos os Status</option>
              {statusLeitura.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
            
            <select 
              value={filtroTipo} 
              onChange={(e) => setFiltroTipo(e.target.value)}
              className="filtro-select"
            >
              <option value="Todos">Todos os Tipos</option>
              {tipos.map(tipo => (
                <option key={tipo} value={tipo}>{tipo}</option>
              ))}
            </select>
          </div>
          
          <div className="controles-visualizacao">
            <button 
              onClick={() => setModoVisualizacao('grid')} 
              className={`btn-visualizacao ${modoVisualizacao === 'grid' ? 'ativo' : ''}`}
            >
              ⊞ Grade
            </button>
            <button 
              onClick={() => setModoVisualizacao('lista')} 
              className={`btn-visualizacao ${modoVisualizacao === 'lista' ? 'ativo' : ''}`}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{marginRight: '6px'}}>
                <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
              </svg> Lista
            </button>
          </div>
        </div>
        
        {/* Modal Novo - Design Moderno */}
        {mostrarFormulario && (
          <div className="modal-overlay-novo">
            <div className="modal-container-novo">
              <div className="modal-header-novo">
                <h2>{modoEdicao ? 'Editar Item' : 'Adicionar Novo Item'}</h2>
                <button 
                  className="btn-fechar-novo"
                  onClick={() => {
                    setMostrarFormulario(false);
                    cancelarEdicao();
                  }}
                >
                  ✕
                </button>
              </div>
              
              <form onSubmit={adicionarLivro} className="form-novo">
                <div className="form-grid-novo">
                  <div className="input-group-novo">
                    <label className="label-novo">Título *</label>
                    <input
                      className="input-novo"
                      type="text"
                      value={modoEdicao ? livroEditando?.titulo || '' : novoLivro.titulo}
                      onChange={(e) => {
                        if (modoEdicao) {
                          setLivroEditando({...livroEditando, titulo: e.target.value});
                        } else {
                          setNovoLivro({...novoLivro, titulo: e.target.value});
                        }
                      }}
                      placeholder="Nome do livro, resumo, apostila..."
                      required
                    />
                  </div>
                  
                  <div className="input-group-novo">
                    <label className="label-novo">Autor</label>
                    <input
                      className="input-novo"
                      type="text"
                      value={modoEdicao ? livroEditando?.autor || '' : novoLivro.autor}
                      onChange={(e) => {
                        if (modoEdicao) {
                          setLivroEditando({...livroEditando, autor: e.target.value});
                        } else {
                          setNovoLivro({...novoLivro, autor: e.target.value});
                        }
                      }}
                      placeholder="Nome do autor"
                    />
                  </div>
                  
                  <div className="input-group-novo">
                    <label className="label-novo">Categoria</label>
                    <select
                      className="select-novo"
                      value={modoEdicao ? livroEditando?.categoria || 'Ficção' : novoLivro.categoria}
                      onChange={(e) => {
                        if (modoEdicao) {
                          setLivroEditando({...livroEditando, categoria: e.target.value});
                        } else {
                          setNovoLivro({...novoLivro, categoria: e.target.value});
                        }
                      }}
                    >
                      {categorias.map(categoria => (
                        <option key={categoria} value={categoria}>{categoria}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="input-group-novo">
                    <label className="label-novo">Tipo</label>
                    <select
                      className="select-novo"
                      value={modoEdicao ? livroEditando?.tipo || 'Livro' : novoLivro.tipo}
                      onChange={(e) => {
                        if (modoEdicao) {
                          setLivroEditando({...livroEditando, tipo: e.target.value});
                        } else {
                          setNovoLivro({...novoLivro, tipo: e.target.value});
                        }
                      }}
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
                      value={modoEdicao ? livroEditando?.descricao || '' : novoLivro.descricao}
                      onChange={(e) => {
                        if (modoEdicao) {
                          setLivroEditando({...livroEditando, descricao: e.target.value});
                        } else {
                          setNovoLivro({...novoLivro, descricao: e.target.value});
                        }
                      }}
                      placeholder="Resumo ou descrição do conteúdo..."
                      rows="3"
                    />
                  </div>
                  
                  <div className="input-group-novo">
                    <label className="label-novo">Total de Páginas</label>
                    <input
                      className="input-novo"
                      type="number"
                      value={modoEdicao ? livroEditando?.paginasTotal || '' : novoLivro.paginasTotal}
                      onChange={(e) => {
                        if (modoEdicao) {
                          setLivroEditando({...livroEditando, paginasTotal: e.target.value});
                        } else {
                          setNovoLivro({...novoLivro, paginasTotal: e.target.value});
                        }
                      }}
                      placeholder="Número total de páginas"
                      min="0"
                    />
                  </div>
                  
                  <div className="input-group-novo">
                    <label className="label-novo">Páginas Lidas</label>
                    <input
                      className="input-novo"
                      type="number"
                      value={modoEdicao ? livroEditando?.paginasLidas || 0 : novoLivro.paginasLidas}
                      onChange={(e) => {
                        if (modoEdicao) {
                          setLivroEditando({...livroEditando, paginasLidas: parseInt(e.target.value) || 0});
                        } else {
                          setNovoLivro({...novoLivro, paginasLidas: parseInt(e.target.value) || 0});
                        }
                      }}
                      placeholder="Páginas já lidas"
                      min="0"
                    />
                  </div>
                  
                  <div className="input-group-novo">
                    <label className="label-novo">Status</label>
                    <select
                      className="select-novo"
                      value={modoEdicao ? livroEditando?.status || 'Não Iniciado' : novoLivro.status}
                      onChange={(e) => {
                        if (modoEdicao) {
                          setLivroEditando({...livroEditando, status: e.target.value});
                        } else {
                          setNovoLivro({...novoLivro, status: e.target.value});
                        }
                      }}
                    >
                      {statusLeitura.map(status => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="input-group-novo">
                    <label className="label-novo">Avaliação (0-5)</label>
                    <select
                      className="select-novo"
                      value={modoEdicao ? livroEditando?.avaliacao || 0 : novoLivro.avaliacao}
                      onChange={(e) => {
                        if (modoEdicao) {
                          setLivroEditando({...livroEditando, avaliacao: parseInt(e.target.value)});
                        } else {
                          setNovoLivro({...novoLivro, avaliacao: parseInt(e.target.value)});
                        }
                      }}
                    >
                      {[0, 1, 2, 3, 4, 5].map(nota => (
                        <option key={nota} value={nota}>{nota} {nota > 0 ? '⭐'.repeat(nota) : ''}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="input-group-novo">
                    <label className="label-novo">Data de Início</label>
                    <input
                      className="input-novo"
                      type="date"
                      value={modoEdicao ? livroEditando?.dataInicio || '' : novoLivro.dataInicio}
                      onChange={(e) => {
                        if (modoEdicao) {
                          setLivroEditando({...livroEditando, dataInicio: e.target.value});
                        } else {
                          setNovoLivro({...novoLivro, dataInicio: e.target.value});
                        }
                      }}
                    />
                  </div>
                  
                  <div className="input-group-novo">
                    <label className="label-novo">Data de Término</label>
                    <input
                      className="input-novo"
                      type="date"
                      value={modoEdicao ? livroEditando?.dataTermino || '' : novoLivro.dataTermino}
                      onChange={(e) => {
                        if (modoEdicao) {
                          setLivroEditando({...livroEditando, dataTermino: e.target.value});
                        } else {
                          setNovoLivro({...novoLivro, dataTermino: e.target.value});
                        }
                      }}
                    />
                  </div>
                  
                  <div className="input-group-novo input-full-novo">
                    <label className="label-novo">Link para Compra/Download</label>
                    <input
                      className="input-novo"
                      type="url"
                      value={modoEdicao ? livroEditando?.linkCompra || '' : novoLivro.linkCompra}
                      onChange={(e) => {
                        if (modoEdicao) {
                          setLivroEditando({...livroEditando, linkCompra: e.target.value});
                        } else {
                          setNovoLivro({...novoLivro, linkCompra: e.target.value});
                        }
                      }}
                      placeholder="https://..."
                    />
                  </div>
                  
                  <div className="input-group-novo input-full-novo">
                    <label className="label-novo">Notas Pessoais</label>
                    <textarea
                      className="textarea-novo"
                      value={modoEdicao ? livroEditando?.notas || '' : novoLivro.notas}
                      onChange={(e) => {
                        if (modoEdicao) {
                          setLivroEditando({...livroEditando, notas: e.target.value});
                        } else {
                          setNovoLivro({...novoLivro, notas: e.target.value});
                        }
                      }}
                      placeholder="Suas anotações, citações favoritas, reflexões..."
                      rows="4"
                    />
                  </div>
                </div>
                
                <div className="form-actions-novo">
                  <button type="submit" className="btn-salvar-novo" disabled={salvando}>
                    {salvando ? (
                      <>
                        <div className="spinner-novo"></div>
                        Salvando...
                      </>
                    ) : (
                      <>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                        </svg>
                        {modoEdicao ? 'Atualizar Item' : 'Salvar Item'}
                      </>
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
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                    </svg>
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        
        {/* Lista de Livros */}
        {carregando ? (
          <div className="carregando">
            <div className="spinner"></div>
            <p>Carregando sua biblioteca...</p>
          </div>
        ) : (
          <div className={`livros-container ${modoVisualizacao}`}>
            {livrosFiltrados.map(livro => (
              <div key={livro.id} className="livro-card">
                <div className="livro-header">
                  <div className="livro-info">
                    <h3>{livro.titulo}</h3>
                    {livro.autor && <p className="autor">por {livro.autor}</p>}
                    <div className="badges">
                      <span className="badge categoria">{livro.categoria}</span>
                      <span className="badge tipo">{livro.tipo}</span>
                      <span 
                        className="badge status" 
                        style={{backgroundColor: getStatusCor(livro.status)}}
                      >
                        {livro.status}
                      </span>
                    </div>
                  </div>
                  
                  <div className="livro-acoes">
                    <button 
                      onClick={() => iniciarEdicao(livro)}
                      className="btn-editar"
                      title="Editar"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                      </svg>
                    </button>
                    <button 
                      onClick={() => removerLivro(livro.id)}
                      className="btn-remover"
                      title="Remover"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                      </svg>
                    </button>
                  </div>
                </div>
                
                {livro.descricao && (
                  <p className="descricao">{livro.descricao}</p>
                )}
                
                {/* Progresso de Leitura */}
                {livro.paginasTotal > 0 && (
                  <div className="progresso-leitura">
                    <div className="progresso-header">
                      <span>Progresso: {livro.paginasLidas}/{livro.paginasTotal} páginas</span>
                      <span>{calcularProgresso(livro)}%</span>
                    </div>
                    <div className="barra-progresso">
                      <div 
                        className="progresso-fill"
                        style={{width: `${calcularProgresso(livro)}%`}}
                      ></div>
                    </div>
                    <div className="controles-progresso">
                      <button 
                        onClick={() => atualizarProgresso(livro.id, livro.paginasLidas - 10)}
                        disabled={livro.paginasLidas <= 0}
                        className="btn-progresso"
                      >
                        -10
                      </button>
                      <div className="input-pagina-manual">
                        <input
                          type="number"
                          value={livro.paginasLidas}
                          onChange={(e) => {
                            const novasPaginas = parseInt(e.target.value) || 0;
                            atualizarProgresso(livro.id, novasPaginas);
                          }}
                          min="0"
                          max={livro.paginasTotal}
                          className="input-progresso"
                          placeholder="Página atual"
                        />
                        <span className="separador-paginas">/</span>
                        <span className="total-paginas">{livro.paginasTotal}</span>
                      </div>
                      <button 
                        onClick={() => atualizarProgresso(livro.id, livro.paginasLidas + 10)}
                        disabled={livro.paginasLidas >= livro.paginasTotal}
                        className="btn-progresso"
                      >
                        +10
                      </button>
                    </div>
                    
                    {/* Avaliação Interativa */}
                    <div className="avaliacao-interativa">
                      <span>Sua avaliação: </span>
                      <div className="estrelas-container">
                        {renderEstrelasInterativas(livro.id, livro.avaliacao || 0)}
                      </div>
                      {livro.avaliacao > 0 && (
                        <button 
                          className="btn-limpar-avaliacao"
                          onClick={() => atualizarAvaliacao(livro.id, 0)}
                          title="Remover avaliação"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Datas */}
                <div className="datas-info">
                  {livro.dataInicio && (
                    <div className="data-item">
                      <strong>Início:</strong> {new Date(livro.dataInicio).toLocaleDateString('pt-BR')}
                    </div>
                  )}
                  {livro.dataTermino && (
                    <div className="data-item">
                      <strong>Término:</strong> {new Date(livro.dataTermino).toLocaleDateString('pt-BR')}
                    </div>
                  )}
                </div>
                
                {/* Notas */}
                {livro.notas && (
                  <div className="notas">
                    <strong>Notas:</strong>
                    <p>{livro.notas}</p>
                  </div>
                )}
                
                {/* Link */}
                {livro.linkCompra && (
                  <div className="link-compra">
                    <a href={livro.linkCompra} target="_blank" rel="noopener noreferrer" className="btn-link">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{marginRight: '8px'}}>
                        <path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/>
                      </svg>
                      Acessar Link
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        
        {!carregando && livrosFiltrados.length === 0 && (
          <div className="sem-livros">
            <div className="icone-vazio">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="#9e9e9e">
                <path d="M21 5c-1.11-.35-2.33-.5-3.5-.5-1.95 0-4.05.4-5.5 1.5-1.45-1.1-3.55-1.5-5.5-1.5S2.45 4.9 1 6v14.65c0 .25.25.5.5.5.1 0 .15-.05.25-.05C3.1 20.45 5.05 20 6.5 20c1.95 0 4.05.4 5.5 1.5 1.35-.85 3.8-1.5 5.5-1.5 1.65 0 3.35.3 4.75 1.05.1.05.15.05.25.05.25 0 .5-.25.5-.5V6c-.6-.45-1.25-.75-2-1zm0 13.5c-1.1-.35-2.3-.5-3.5-.5-1.7 0-4.15.65-5.5 1.5V8c1.35-.85 3.8-1.5 5.5-1.5 1.2 0 2.4.15 3.5.5v11.5z"/>
              </svg>
            </div>
            <h3>Sua biblioteca está vazia</h3>
            <p>Comece adicionando seu primeiro livro, resumo ou apostila!</p>
            <button onClick={() => setMostrarFormulario(true)} className="btn-adicionar-primeiro">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{marginRight: '8px'}}>
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
              </svg>
              Adicionar Primeiro Item
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Leitura;