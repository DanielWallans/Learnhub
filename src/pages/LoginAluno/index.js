import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../../firebaseConfig";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import { FaGraduationCap, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaArrowLeft, FaExclamationCircle, FaSignInAlt } from "react-icons/fa";

function LoginAluno() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, senha);
      const user = userCredential.user;
      
      const userDoc = await getDoc(doc(db, "alunos", user.uid));
      if (!userDoc.exists()) {
        await setDoc(doc(db, "alunos", user.uid), {
          uid: user.uid,
          email: user.email,
          criadoEm: new Date().toISOString()
        });
      }
      
      navigate("/boas-vindas");
    } catch (error) {
      console.error("Erro ao fazer login:", error.code, error.message);
      
      let errorMessage = "Erro ao fazer login. Verifique suas credenciais.";
      switch (error.code) {
        case "auth/user-not-found":
          errorMessage = "Usuário não encontrado.";
          break;
        case "auth/wrong-password":
          errorMessage = "Senha incorreta.";
          break;
        case "auth/invalid-email":
          errorMessage = "Email inválido.";
          break;
        case "auth/too-many-requests":
          errorMessage = "Muitas tentativas. Tente novamente mais tarde.";
          break;
        default:
          errorMessage = "Erro ao fazer login. Verifique suas credenciais.";
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToHome = () => {
    navigate("/home");
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
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
        {/* Card de Login */}
        <div className="glass-card p-8 rounded-[32px] border border-outline-variant/30 shadow-xl flex flex-col items-center">
          
          {/* Header */}
          <div className="flex flex-col items-center mb-8 text-center">
            <motion.div 
              className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary to-secondary text-on-primary flex items-center justify-center mb-4 text-2xl shadow-md"
              whileHover={{ rotate: 10 }}
            >
              <FaGraduationCap />
            </motion.div>
            <h1 className="font-display text-3xl font-extrabold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-1">LearnHub</h1>
            <h2 className="text-sm font-bold text-on-surface-variant uppercase tracking-wider">Área do Estudante</h2>
            <p className="text-xs text-on-surface-variant/80 mt-1">Acesse sua conta para continuar seus estudos</p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="w-full flex flex-col gap-5">
            
            {/* Email Field */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Email</label>
              <div className="relative">
                <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm" />
                <input
                  id="email"
                  type="email"
                  placeholder="seu.email@exemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-surface-container-low dark:bg-surface-container border border-outline-variant/20 rounded-2xl text-body-md focus:ring-2 focus:ring-primary focus:outline-none transition-all dark:text-white"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="senha" className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Senha</label>
              <div className="relative">
                <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm" />
                <input
                  id="senha"
                  type={showPassword ? "text" : "password"}
                  placeholder="Digite sua senha"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  className="w-full pl-11 pr-11 py-3 bg-surface-container-low dark:bg-surface-container border border-outline-variant/20 rounded-2xl text-body-md focus:ring-2 focus:ring-primary focus:outline-none transition-all dark:text-white"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors"
                  disabled={loading}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div 
                  className="flex items-center gap-2 text-xs font-bold text-error bg-error/10 border border-error/20 p-3.5 rounded-2xl"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <FaExclamationCircle className="text-sm shrink-0" />
                  <span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit Button */}
            <motion.button
              type="submit"
              className="w-full py-4 bg-gradient-to-r from-primary to-secondary text-on-primary font-bold rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-on-primary border-t-transparent rounded-full animate-spin"></div>
                  <span>Entrando...</span>
                </>
              ) : (
                <>
                  <FaSignInAlt />
                  <span>Entrar</span>
                </>
              )}
            </motion.button>
          </form>

          {/* Divider */}
          <div className="w-full flex items-center gap-4 my-6 text-xs text-on-surface-variant/60 font-bold uppercase tracking-widest">
            <div className="h-px bg-outline-variant/20 flex-1"></div>
            <span>ou</span>
            <div className="h-px bg-outline-variant/20 flex-1"></div>
          </div>

          {/* Actions Footer */}
          <button 
            type="button" 
            onClick={handleBackToHome} 
            className="w-full py-3.5 bg-surface-container-lowest dark:bg-inverse-surface border border-outline-variant/30 text-on-surface-variant hover:text-on-surface hover:border-on-surface-variant font-bold rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95 text-sm"
          >
            <FaArrowLeft />
            <span>Voltar ao início</span>
          </button>

          <p className="mt-8 text-sm text-on-surface-variant">
            Não tem uma conta?{" "}
            <button 
              onClick={() => navigate("/cadastro-aluno")} 
              className="text-primary font-bold hover:underline"
            >
              Cadastre-se aqui
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

export default LoginAluno;