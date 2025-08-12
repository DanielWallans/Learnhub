import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Home from './pages/Home';
import Cadastros from './pages/Cadastros';
import CadastroAluno from './pages/CadastroAluno';
import LoginAluno from './pages/LoginAluno';
import RecuperarSenha from './pages/RecuperarSenha';
import ModuloCarreira from './components/carreira';
import ModuloFinancas from './components/financas';
import Habilidades from './components/Habilidades';
import Leitura from './components/Leitura';
import Projetos from './components/Projetos';

import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import PrivateRoute from './components/PrivateRoute';
import ForgotPassword from "./pages/Login/ForgotPassword";
import Dashboard from './components/Dashboard';
import BoasVindas from './components/BoasVindas';

// ...existing code...

function AppRoutes() {
  const { currentUser } = useAuth();

  return (
    <Router>
      <Routes>
        {/* rotas públicas */}
        <Route path="/login" element={<Login />} />
        <Route path="/esqueci-senha" element={<ForgotPassword />} />
        <Route path="/recuperar-senha" element={<RecuperarSenha />} />
      <Route path="/cadastros" element={<Cadastros />} />
      <Route path="/cadastro-aluno" element={<CadastroAluno />} />
      <Route path="/login-aluno" element={<LoginAluno />} />
      <Route path="/boas-vindas" element={<BoasVindas />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/carreira" element={<ModuloCarreira />} />
      <Route path="/financas" element={<ModuloFinancas />} />
      <Route path="/habilidades" element={<Habilidades />} />
      <Route path="/leitura" element={<Leitura />} />
        <Route path="/projetos" element={<Projetos />} />


      {/* algumas rotas específicas do sistema */}
      <Route
        path="/home"
        element={
          <PrivateRoute>
            <Home />
          </PrivateRoute>
        }
      />
      <Route
        path="/"
        element={currentUser ? <Navigate to="/home" replace /> : <Navigate to="/login" replace />}
      />
    </Routes>
  </Router>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;