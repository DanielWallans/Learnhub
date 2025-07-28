import { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userType, setUserType] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Monitora mudanças no estado de autenticação
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Verifica primeiro na coleção "usuarios" (login principal)
          let userDoc = await getDoc(doc(db, "usuarios", user.uid));
          let foundUserType = "admin";
          
          // Se não encontrar, verifica na coleção "alunos"
          if (!userDoc.exists()) {
            userDoc = await getDoc(doc(db, "alunos", user.uid));
            foundUserType = "aluno";
          }
          
          console.log("AuthContext: Verificando usuário:", user.uid, "Tipo:", foundUserType, "Existe:", userDoc.exists());
          
          if (userDoc.exists()) {
            setCurrentUser(user);
            setUserType(foundUserType);
          } else {
            console.warn("AuthContext: Usuário não encontrado em nenhuma coleção:", user.uid);
            setCurrentUser(null);
            setUserType(null);
          }
        } catch (error) {
          console.error("AuthContext: Erro ao verificar usuário no Firestore:", error);
          setCurrentUser(null);
          setUserType(null);
        }
      } else {
        setCurrentUser(null);
        setUserType(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userType,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};