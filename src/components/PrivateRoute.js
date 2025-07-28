import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loading from './Loading';

const PrivateRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();

  // Se ainda está carregando, mostra loading
  if (loading) {
    return <Loading message="Verificando autenticação..." />;
  }

  console.log("PrivateRoute: currentUser =", currentUser ? "existe" : "null");
  return currentUser ? children : <Navigate to="/login" />;
};

export default PrivateRoute;