import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Login from './pages/Login';
import Home from './pages/Home';
import Cadastros from './pages/Cadastros';
import CadastroAluno from './pages/CadastroAluno';
import RecuperarSenha from './pages/RecuperarSenha';
import ModuloCarreira from './components/carreira';
import ModuloFinancas from './components/financas';
import Habilidades from './components/Habilidades';
import Leitura from './components/Leitura';

import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

import ForgotPassword from "./pages/Login/ForgotPassword";
import Dashboard from './components/Dashboard';
import BoasVindas from './components/BoasVindas';
import CacheManager from './components/CacheManager';
import { setupCacheShortcuts, detectCacheIssues, fixCacheIssues } from './utils/cacheUtils';
import { NavBar } from './components/ui/tubelight-navbar';
import { Home as HomeIcon, Briefcase, Wallet, CheckCircle, BookOpen } from 'lucide-react';

function AppLayout() {
  const { currentUser } = useAuth();
  const location = useLocation();

  // Itens de navegação para alunos logados
  const studentNavItems = [
    { name: 'Início', url: '/dashboard', icon: HomeIcon },
    { name: 'Carreira', url: '/carreira', icon: Briefcase },
    { name: 'Finanças', url: '/financas', icon: Wallet },
    { name: 'Hábitos', url: '/habilidades', icon: CheckCircle },
    { name: 'Biblioteca', url: '/leitura', icon: BookOpen }
  ];

  const isStudentPage = ['/dashboard', '/carreira', '/financas', '/habilidades', '/leitura'].includes(location.pathname);
  const showStudentNavBar = currentUser && isStudentPage;

  return (
    <>
      {showStudentNavBar && <NavBar items={studentNavItems} />}
      <Routes>
        {/* rotas públicas */}
        <Route path="/login" element={<Login />} />
        <Route path="/esqueci-senha" element={<ForgotPassword />} />
        <Route path="/recuperar-senha" element={<RecuperarSenha />} />
        <Route path="/cadastros" element={<Cadastros />} />
        <Route path="/cadastro-aluno" element={<CadastroAluno />} />
        <Route path="/login-aluno" element={<Navigate to="/login" replace />} />
        <Route path="/boas-vindas" element={<BoasVindas />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/carreira" element={<ModuloCarreira />} />
        <Route path="/financas" element={<ModuloFinancas />} />
        <Route path="/habilidades" element={<Habilidades />} />
        <Route path="/leitura" element={<Leitura />} />

        {/* algumas rotas específicas do sistema */}
        <Route path="/home" element={<Home />} />
        <Route
          path="/"
          element={<Navigate to="/home" replace />}
        />
      </Routes>
    </>
  );
}

function AppRoutes() {
  return (
    <Router>
      <AppLayout />
    </Router>
  );
}

function App() {
  useEffect(() => {
    // Configurar atalhos de teclado para cache
    setupCacheShortcuts();
    
    // Detectar problemas de cache na inicialização
    if (detectCacheIssues()) {
      console.warn('Problemas de cache detectados. Use Ctrl+Shift+R para limpar.');
    }
    
    // Adicionar listener para detectar atualizações do service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('Service Worker atualizado, recarregando página...');
        window.location.reload();
      });
    }
  }, []);

  return (
    <ThemeProvider>
      <AuthProvider>
        <AppRoutes />
        <CacheManager />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;