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
    const startTime = Date.now();

    // Monitora mudanças no estado de autenticação
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      let resolvedUser = null;
      let resolvedType = null;

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
            resolvedUser = user;
            resolvedType = foundUserType;
          } else {
            console.warn("AuthContext: Usuário não encontrado em nenhuma coleção:", user.uid);
          }
        } catch (error) {
          console.error("AuthContext: Erro ao verificar usuário no Firestore:", error);
        }
      }

      // Garantir tempo de carregamento mínimo de 2.5s (2500ms) para um carregamento suave e cinemático
      const elapsed = Date.now() - startTime;
      const remainingTime = Math.max(0, 2500 - elapsed);

      setTimeout(() => {
        setCurrentUser(resolvedUser);
        setUserType(resolvedType);
        setLoading(false);
      }, remainingTime);
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