import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../../firebaseConfig";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useAuth } from "../../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { FaCogs, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaSignInAlt, FaChevronLeft, FaShieldAlt, FaGraduationCap, FaKey, FaUserPlus } from "react-icons/fa";

function Login() {
  const [tipoUsuario, setTipoUsuario] = useState("aluno"); // "aluno" ou "admin"
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [erro, setErro] = useState("");
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  // Redireciona usuário caso já esteja logado
  useEffect(() => {
    if (currentUser && !loading) {
      if (tipoUsuario === "admin") {
        navigate("/home");
      } else {
        navigate("/dashboard");
      }
    }
  }, [currentUser, loading, navigate, tipoUsuario]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErro("");

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, senha);
      const user = userCredential.user;
      
      if (tipoUsuario === "admin") {
        // Fluxo administrativo
        const userDoc = await getDoc(doc(db, "usuarios", user.uid));
        if (!userDoc.exists()) {
          await setDoc(doc(db, "usuarios", user.uid), {
            uid: user.uid,
            email: user.email,
            criadoEm: new Date().toISOString()
          });
        }
        navigate("/home");
      } else {
        // Fluxo de estudante
        const userDoc = await getDoc(doc(db, "alunos", user.uid));
        if (!userDoc.exists()) {
          await setDoc(doc(db, "alunos", user.uid), {
            uid: user.uid,
            email: user.email,
            criadoEm: new Date().toISOString()
          });
        }
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Login: Erro de autenticação:", error);
      
      let mensagemErro = "Erro ao fazer login. Verifique suas credenciais.";
      switch (error.code) {
        case "auth/user-not-found":
          mensagemErro = "E-mail não encontrado.";
          break;
        case "auth/wrong-password":
          mensagemErro = "Senha incorreta.";
          break;
        case "auth/invalid-email":
          mensagemErro = "E-mail inválido.";
          break;
        case "auth/too-many-requests":
          mensagemErro = "Muitas tentativas. Tente novamente mais tarde.";
          break;
        default:
          mensagemErro = "Verifique suas credenciais e tente novamente.";
      }
      setErro(mensagemErro);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-on-surface flex items-center justify-center p-6 relative overflow-hidden font-body-md">
      {/* Efeitos luminosos de fundo */}
      <div className="bg-effects">
        <div className="particle particle-1"></div>
        <div className="particle particle-2"></div>
      </div>

      <motion.div 
        className="max-w-md w-full z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="glass-card p-8 rounded-[32px] border border-outline-variant/30 shadow-xl flex flex-col items-center">
          
          {/* Header */}
          <div className="flex flex-col items-center mb-6 text-center">
            <motion.div 
              className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary to-secondary text-on-primary flex items-center justify-center mb-4 text-2xl shadow-md"
              whileHover={{ rotate: 10 }}
            >
              {tipoUsuario === "aluno" ? <FaGraduationCap /> : <FaCogs />}
            </motion.div>
            <h1 className="font-display text-3xl font-extrabold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-1">LearnHub</h1>
            <p className="text-xs text-on-surface-variant/80 mt-1">
              {tipoUsuario === "aluno" 
                ? "Acesse sua conta para continuar seus estudos" 
                : "Acesse o painel administrativo do sistema"
              }
            </p>
          </div>

          {/* Tipo de Usuário Tabs Selector */}
          <div className="w-full bg-surface-container dark:bg-surface-container-high p-1 rounded-2xl flex gap-1 mb-6 border border-outline-variant/15 z-20">
            <button
              type="button"
              onClick={() => { setTipoUsuario("aluno"); setErro(""); }}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all relative flex items-center justify-center gap-2 ${
                tipoUsuario === "aluno"
                  ? "bg-surface-container-lowest dark:bg-inverse-surface text-primary shadow-sm ring-1 ring-outline-variant/10"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              <FaGraduationCap className="text-sm" />
              <span>Estudante</span>
            </button>
            <button
              type="button"
              onClick={() => { setTipoUsuario("admin"); setErro(""); }}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all relative flex items-center justify-center gap-2 ${
                tipoUsuario === "admin"
                  ? "bg-surface-container-lowest dark:bg-inverse-surface text-primary shadow-sm ring-1 ring-outline-variant/10"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              <FaCogs className="text-sm" />
              <span>Administrativo</span>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="w-full flex flex-col gap-5">
            
            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Email</label>
              <div className="relative">
                <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm" />
                <input
                  type="email"
                  placeholder={tipoUsuario === "aluno" ? "seu.email@exemplo.com" : "admin@learnhub.com"}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-surface-container-low dark:bg-surface-container border border-outline-variant/20 rounded-2xl text-body-md focus:ring-2 focus:ring-primary focus:outline-none transition-all dark:text-white"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* Senha */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Senha</label>
              <div className="relative">
                <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm" />
                <input
                  type={mostrarSenha ? "text" : "password"}
                  placeholder="Digite sua senha"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  className="w-full pl-11 pr-11 py-3 bg-surface-container-low dark:bg-surface-container border border-outline-variant/20 rounded-2xl text-body-md focus:ring-2 focus:ring-primary focus:outline-none transition-all dark:text-white"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setMostrarSenha(!mostrarSenha)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors"
                  disabled={loading}
                >
                  {mostrarSenha ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            <AnimatePresence>
              {erro && (
                <motion.div 
                  className="flex items-center gap-2 text-xs font-bold text-error bg-error/10 border border-error/20 p-3.5 rounded-2xl"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <FaLock className="text-sm shrink-0" />
                  <span>{erro}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Button */}
            <motion.button
              type="submit"
              className="w-full py-4 bg-gradient-to-r from-primary to-secondary text-on-primary font-bold rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all active:scale-95 disabled:opacity-50"
              disabled={loading}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-on-primary border-t-transparent rounded-full animate-spin"></div>
                  <span>Acessando...</span>
                </>
              ) : (
                <>
                  <FaSignInAlt />
                  <span>Entrar</span>
                </>
              )}
            </motion.button>
          </form>

          {/* Auxiliary Links */}
          <div className="w-full flex justify-between gap-4 mt-6 text-sm">
            <button 
              type="button"
              className="text-on-surface-variant hover:text-primary transition-all font-semibold flex items-center gap-1.5" 
              onClick={() => navigate("/esqueci-senha")}
              disabled={loading}
            >
              <FaKey className="text-xs" />
              <span>Esqueci a senha</span>
            </button>

            <button 
              type="button"
              className="text-on-surface-variant hover:text-primary transition-all font-semibold flex items-center gap-1.5" 
              onClick={() => navigate(tipoUsuario === "aluno" ? "/cadastro-aluno" : "/cadastros")}
              disabled={loading}
            >
              <FaUserPlus className="text-xs" />
              <span>Criar conta</span>
            </button>
          </div>

          {/* Divider */}
          <div className="h-px bg-outline-variant/20 w-full my-6"></div>

          {/* Back to Home Button */}
          <button 
            type="button"
            className="text-xs font-bold text-on-surface-variant hover:text-on-surface flex items-center gap-1.5 transition-colors"
            onClick={() => navigate("/home")}
            disabled={loading}
          >
            <FaChevronLeft />
            <span>Voltar ao início</span>
          </button>

          {/* Security Note */}
          <div className="flex items-center gap-2 text-[10px] font-bold text-on-surface-variant/70 uppercase tracking-widest mt-6">
            <FaShieldAlt className="text-primary text-xs" />
            <span>Seus dados estão protegidos</span>
          </div>

        </div>
      </motion.div>
    </div>
  );
}

export default Login;
