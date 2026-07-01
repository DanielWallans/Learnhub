import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../../firebaseConfig";
import { sendPasswordResetEmail } from "firebase/auth";
import { motion, AnimatePresence } from "framer-motion";
import { FaEnvelope, FaPaperPlane, FaChevronLeft, FaExclamationCircle, FaCheckCircle, FaKey } from "react-icons/fa";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMensagem("");

    if (!email) {
      setMensagem("Digite um e-mail válido.");
      setLoading(false);
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      setMensagem("E-mail de redefinição enviado! Verifique sua caixa de entrada e pasta de spam.");
    } catch (error) {
      let errorMessage = "Erro ao enviar e-mail. Tente novamente.";
      
      switch (error.code) {
        case "auth/user-not-found":
          errorMessage = "E-mail não encontrado. Verifique o endereço digitado.";
          break;
        case "auth/invalid-email":
          errorMessage = "E-mail inválido. Digite um endereço válido.";
          break;
        case "auth/too-many-requests":
          errorMessage = "Muitas tentativas. Aguarde alguns minutos e tente novamente.";
          break;
        default:
          errorMessage = "Erro ao enviar e-mail. Verifique sua conexão e tente novamente.";
      }
      
      setMensagem(errorMessage);
      console.error("Erro ao redefinir senha:", error);
    } finally {
      setLoading(false);
    }
  };

  const isError = mensagem.includes("Erro") || mensagem.includes("inválido") || mensagem.includes("encontrado") || mensagem.includes("tentativas") || mensagem.includes("válido");

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
          <div className="flex flex-col items-center mb-8 text-center">
            <motion.div 
              className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary to-secondary text-on-primary flex items-center justify-center mb-4 text-xl shadow-md"
              whileHover={{ rotate: 10 }}
            >
              <FaKey />
            </motion.div>
            <h1 className="font-display text-2xl font-extrabold text-on-surface mb-2">Recuperar Senha</h1>
            <p className="text-xs text-on-surface-variant/80 max-w-xs leading-relaxed">Insira seu e-mail para receber um link de redefinição de senha seguro e rápido.</p>
          </div>

          {/* Form */}
          <form onSubmit={handleResetPassword} className="w-full flex flex-col gap-5">
            
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

            {/* Feedback Message */}
            <AnimatePresence>
              {mensagem && (
                <motion.div 
                  className={`flex items-start gap-2.5 text-xs font-bold p-4 rounded-2xl border ${
                    isError 
                      ? 'text-error bg-error/10 border-error/20' 
                      : 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20'
                  }`}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  {isError ? (
                    <FaExclamationCircle className="text-sm shrink-0 mt-0.5" />
                  ) : (
                    <FaCheckCircle className="text-sm shrink-0 mt-0.5" />
                  )}
                  <span>{mensagem}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit Button */}
            <motion.button
              type="submit"
              className="w-full py-4 bg-gradient-to-r from-primary to-secondary text-on-primary font-bold rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all active:scale-95 disabled:opacity-50"
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
                  <FaPaperPlane className="text-xs" />
                  <span>Enviar Link</span>
                </>
              )}
            </motion.button>
          </form>

          {/* Divider */}
          <div className="h-px bg-outline-variant/20 w-full my-6"></div>

          {/* Back to Login */}
          <button 
            type="button" 
            onClick={() => navigate("/login")} 
            className="text-xs font-bold text-on-surface-variant hover:text-on-surface flex items-center gap-1.5 transition-colors"
          >
            <FaChevronLeft />
            <span>Voltar ao login</span>
          </button>

        </div>
      </motion.div>
    </div>
  );
}

export default ForgotPassword;
