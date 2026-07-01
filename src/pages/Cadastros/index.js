import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { db, auth } from "../../firebaseConfig"; 
import { createUserWithEmailAndPassword } from "firebase/auth";
import { collection, addDoc } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import { FaUserPlus, FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaArrowLeft, FaExclamationCircle } from "react-icons/fa";
import "./cadastro.css";

function Cadastros() {
  const [nome, setNome] = useState("");
  const [sobrenome, setSobrenome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmSenha, setConfirmSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmSenha, setMostrarConfirmSenha] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const navigate = useNavigate();

  const handleCadastro = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErro("");

    if (senha.length < 6) {
      setErro("A senha deve ter pelo menos 6 caracteres!");
      setLoading(false);
      return;
    }
    if (senha !== confirmSenha) {
      setErro("As senhas não coincidem!");
      setLoading(false);
      return;
    }

    try {
      console.log("Tentando cadastrar usuário...");
      
      // Criando usuário no Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
      const user = userCredential.user;
      console.log("Usuário cadastrado com sucesso:", user);

      // Salvando usuário no Firestore
      await addDoc(collection(db, "usuarios"), { 
        uid: user.uid, 
        email,
        nome,
        sobrenome,
        criadoEm: new Date().toISOString()
      });
      console.log("Usuário salvo no Firestore!");

      navigate("/home"); 

    } catch (error) {
      console.error("Erro ao cadastrar:", error.code, error.message);

      // Verifica se o usuário foi criado antes de exibir erro
      if (auth.currentUser) {
        console.log("Usuário já está autenticado:", auth.currentUser);
        navigate("/home");
        return;
      }

      // Mensagens de erro mais específicas
      let errorMessage = "Erro ao cadastrar.";
      if (error.code === "auth/email-already-in-use") {
        errorMessage = "Este email já está cadastrado!";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Email inválido!";
      } else if (error.code === "auth/weak-password") {
        errorMessage = "A senha deve ter pelo menos 6 caracteres!";
      } else {
        errorMessage = `Erro: ${error.message}`;
      }

      setErro(errorMessage);
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
        className="max-w-xl w-full z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        {/* Card de Cadastro */}
        <div className="glass-card p-8 rounded-[32px] border border-outline-variant/30 shadow-xl flex flex-col items-center">
          
          {/* Header */}
          <div className="flex flex-col items-center mb-8 text-center">
            <motion.div 
              className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary to-secondary text-on-primary flex items-center justify-center mb-4 text-2xl shadow-md"
              whileHover={{ rotate: 10 }}
            >
              <FaUserPlus />
            </motion.div>
            <h1 className="font-display text-3xl font-extrabold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-1">LearnHub</h1>
            <h2 className="text-sm font-bold text-on-surface-variant uppercase tracking-wider">Criar Conta Administrativa</h2>
            <p className="text-xs text-on-surface-variant/80 mt-1">Cadastre-se para acessar o painel admin</p>
          </div>

          {/* Form */}
          <form onSubmit={handleCadastro} className="w-full flex flex-col gap-5">
            {/* Nome e Sobrenome */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Nome</label>
                <div className="relative">
                  <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm" />
                  <input
                    type="text"
                    placeholder="Seu nome"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-surface-container-low dark:bg-surface-container border border-outline-variant/20 rounded-2xl text-body-md focus:ring-2 focus:ring-primary focus:outline-none transition-all dark:text-white"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Sobrenome</label>
                <div className="relative">
                  <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm" />
                  <input
                    type="text"
                    placeholder="Seu sobrenome"
                    value={sobrenome}
                    onChange={(e) => setSobrenome(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-surface-container-low dark:bg-surface-container border border-outline-variant/20 rounded-2xl text-body-md focus:ring-2 focus:ring-primary focus:outline-none transition-all dark:text-white"
                    required
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Email</label>
              <div className="relative">
                <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm" />
                <input
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-surface-container-low dark:bg-surface-container border border-outline-variant/20 rounded-2xl text-body-md focus:ring-2 focus:ring-primary focus:outline-none transition-all dark:text-white"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* Senhas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Senha</label>
                <div className="relative">
                  <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm" />
                  <input
                    type={mostrarSenha ? "text" : "password"}
                    placeholder="Senha"
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

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Confirmar Senha</label>
                <div className="relative">
                  <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm" />
                  <input
                    type={mostrarConfirmSenha ? "text" : "password"}
                    placeholder="Repita a senha"
                    value={confirmSenha}
                    onChange={(e) => setConfirmSenha(e.target.value)}
                    className="w-full pl-11 pr-11 py-3 bg-surface-container-low dark:bg-surface-container border border-outline-variant/20 rounded-2xl text-body-md focus:ring-2 focus:ring-primary focus:outline-none transition-all dark:text-white"
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarConfirmSenha(!mostrarConfirmSenha)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors"
                    disabled={loading}
                  >
                    {mostrarConfirmSenha ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
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
                  <FaExclamationCircle className="text-sm shrink-0" />
                  <span>{erro}</span>
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
                  <span>Criando conta...</span>
                </>
              ) : (
                <>
                  <FaUserPlus />
                  <span>Criar Conta</span>
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

          {/* Fazer Login Link */}
          <button 
            type="button" 
            onClick={() => navigate("/login")} 
            className="w-full py-3.5 bg-surface-container-lowest dark:bg-inverse-surface border border-outline-variant/30 text-on-surface-variant hover:text-on-surface hover:border-on-surface-variant font-bold rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95 text-sm"
          >
            <FaArrowLeft />
            <span>Voltar ao Login</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default Cadastros;