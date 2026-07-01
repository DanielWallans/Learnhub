import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../../firebaseConfig";
import { sendPasswordResetEmail } from "firebase/auth";
import { motion, AnimatePresence } from "framer-motion";
import { FaKey, FaEnvelope, FaExclamationCircle, FaCheckCircle, FaPlus, FaChevronLeft } from "react-icons/fa";
import "./recuperarSenha.css";

function RecuperarSenha() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const navigate = useNavigate();

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validação básica de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Por favor, digite um email válido");
      setLoading(false);
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email, {
        url: window.location.origin + '/login-aluno', // URL para redirecionamento após reset
        handleCodeInApp: false
      });
      setEmailSent(true);
    } catch (error) {
      console.error("Erro ao enviar email de recuperação:", error.code, error.message);
      
      let errorMessage = "Erro ao enviar email de recuperação";
      switch (error.code) {
        case "auth/user-not-found":
          errorMessage = "Não encontramos uma conta com este email";
          break;
        case "auth/invalid-email":
          errorMessage = "Email inválido";
          break;
        case "auth/too-many-requests":
          errorMessage = "Muitas tentativas. Tente novamente em alguns minutos";
          break;
        case "auth/user-disabled":
          errorMessage = "Esta conta foi desabilitada. Entre em contato com o suporte";
          break;
        default:
          errorMessage = "Erro ao enviar email. Verifique sua conexão e tente novamente";
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigate("/login");
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
        {/* Card de Recuperação */}
        <div className="glass-card p-8 rounded-[32px] border border-outline-variant/30 shadow-xl flex flex-col items-center">
          
          {/* Header */}
          <div className="flex flex-col items-center mb-8 text-center">
            <motion.div 
              className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary to-secondary text-on-primary flex items-center justify-center mb-4 text-2xl shadow-md"
              whileHover={{ rotate: -10 }}
            >
              <FaKey />
            </motion.div>
            <h1 className="font-display text-3xl font-extrabold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-1">Recuperar Senha</h1>
            <p className="text-sm text-on-surface-variant mt-2 max-w-[300px]">
              {!emailSent 
                ? "Digite seu email para receber um link de recuperação"
                : "Instruções de recuperação enviadas para seu email"
              }
            </p>
          </div>

          {/* Caixa principal */}
          <div className="w-full">
            <AnimatePresence mode="wait">
              {!emailSent ? (
                <motion.form 
                  key="reset-form"
                  onSubmit={handlePasswordReset} 
                  className="w-full flex flex-col gap-5"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Campo de email */}
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="email" className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Email</label>
                    <div className="relative">
                      <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm" />
                      <input
                        id="email"
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

                  {/* Mensagem de erro */}
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

                  {/* Botão de enviar */}
                  <motion.button 
                    type="submit" 
                    className="w-full py-4 bg-gradient-to-r from-primary to-secondary text-on-primary font-bold rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={loading}
                    whileTap={{ scale: 0.98 }}
                  >
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-on-primary border-t-transparent rounded-full animate-spin"></div>
                        <span>Enviando...</span>
                      </>
                    ) : (
                      <>
                        <span>Enviar Link</span>
                      </>
                    )}
                  </motion.button>
                </motion.form>
              ) : (
                <motion.div 
                  key="success-container"
                  className="flex flex-col items-center gap-4 text-center p-4"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                >
                  <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center text-success text-3xl mb-2">
                    <FaCheckCircle />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-on-surface">Email enviado com sucesso!</h3>
                    <p className="text-sm text-on-surface-variant/90 mt-2 leading-relaxed">
                      Verifique sua caixa de entrada e pasta de spam. O link de recuperação expira em 1 hora.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Divider */}
            <div className="h-px bg-outline-variant/20 w-full my-6"></div>

            {/* Links de navegação */}
            <div className="w-full flex justify-between gap-4 mt-2 text-sm">
              <button 
                type="button" 
                onClick={handleBackToLogin} 
                className="text-on-surface-variant hover:text-primary transition-all font-semibold flex items-center gap-1.5"
              >
                <FaChevronLeft className="text-xs" />
                <span>Voltar ao Login</span>
              </button>
              
              <button 
                type="button" 
                onClick={() => navigate("/cadastros")} 
                className="text-on-surface-variant hover:text-primary transition-all font-semibold flex items-center gap-1.5"
              >
                <FaPlus className="text-xs" />
                <span>Criar Conta</span>
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default RecuperarSenha;
