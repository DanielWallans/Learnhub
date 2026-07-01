import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { FaStar, FaHandPaper, FaChevronRight } from 'react-icons/fa';
import { motion } from 'framer-motion';
import Loading from './Loading';

function BoasVindas() {
  const [nome, setNome] = useState('');
  const [saudacao, setSaudacao] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Saudação dinâmica
    const hora = new Date().getHours();
    if (hora < 12) setSaudacao('Bom dia');
    else if (hora < 18) setSaudacao('Boa tarde');
    else setSaudacao('Boa noite');

    // Buscar nome do usuário logado no Firestore
    const user = auth.currentUser;
    if (user) {
      const docRef = doc(db, 'alunos', user.uid);
      getDoc(docRef).then((docSnap) => {
        if (docSnap.exists()) {
          setNome(docSnap.data().nomeCompleto || docSnap.data().nome || '');
        }
        setLoading(false);
      }).catch(() => {
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, []);

  const handleComecar = () => {
    navigate('/dashboard');
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: 'easeOut',
        when: 'beforeChildren',
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
  };

  const cardHover = {
    hover: {
      y: -8,
      scale: 1.02,
      boxShadow: '0px 12px 30px rgba(70, 72, 212, 0.15)',
      transition: { duration: 0.3, ease: 'easeInOut' }
    }
  };

  if (loading) {
    return <Loading message="Carregando sua jornada..." />;
  }

  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col items-center justify-center p-6 relative overflow-hidden font-body-md">
      {/* Elementos decorativos de fundo */}
      <div className="bg-effects">
        <div className="particle particle-1"></div>
        <div className="particle particle-2"></div>
        <div className="particle particle-3"></div>
      </div>

      <motion.div 
        className="max-w-3xl w-full text-center z-10 flex flex-col items-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Badge de boas-vindas */}
        <motion.div 
          className="flex items-center gap-2 px-4 py-1.5 bg-primary/10 border border-primary/20 text-primary rounded-full text-label-sm font-bold shadow-sm mb-6"
          variants={itemVariants}
        >
          <span className="text-secondary"><FaStar className="animate-pulse" /></span>
          <span>Tudo pronto para começar!</span>
        </motion.div>

        {/* Título principal */}
        <motion.h1 
          className="font-display text-display text-4xl sm:text-5xl md:text-6xl font-extrabold mb-4 leading-tight"
          variants={itemVariants}
        >
          {saudacao}
          {nome && <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">, {nome}</span>}!
          <motion.span 
            className="inline-block ml-3 text-amber-500"
            animate={{ rotate: [0, 15, -15, 15, 0] }}
            transition={{ repeat: Infinity, duration: 2.5, repeatDelay: 1 }}
          >
            <FaHandPaper />
          </motion.span>
        </motion.h1>

        {/* Subtítulo */}
        <motion.p 
          className="text-on-surface-variant text-body-lg sm:text-xl max-w-xl mb-12 leading-relaxed"
          variants={itemVariants}
        >
          Sua jornada de <strong className="text-primary font-semibold">organização</strong> e <strong className="text-secondary font-semibold">crescimento</strong> começa agora!
        </motion.p>

        {/* Cards de features */}
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full mb-12"
          variants={itemVariants}
        >
          {/* Card 1 */}
          <motion.div 
            className="glass-card p-6 rounded-[24px] border border-outline-variant/30 flex flex-col items-center gap-4 hover:border-primary/30 cursor-pointer shadow-sm"
            variants={cardHover}
            whileHover="hover"
          >
            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl font-bold">dashboard</span>
            </div>
            <div>
              <h3 className="font-headline-md text-lg font-bold text-on-surface mb-1">Organize</h3>
              <p className="text-on-surface-variant text-sm">Seus estudos e tarefas com facilidade.</p>
            </div>
          </motion.div>

          {/* Card 2 */}
          <motion.div 
            className="glass-card p-6 rounded-[24px] border border-outline-variant/30 flex flex-col items-center gap-4 hover:border-secondary/30 cursor-pointer shadow-sm"
            variants={cardHover}
            whileHover="hover"
          >
            <div className="w-12 h-12 rounded-2xl bg-secondary/10 text-secondary flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl font-bold">schedule</span>
            </div>
            <div>
              <h3 className="font-headline-md text-lg font-bold text-on-surface mb-1">Planeje</h3>
              <p className="text-on-surface-variant text-sm">Suas metas e objetivos financeiros.</p>
            </div>
          </motion.div>

          {/* Card 3 */}
          <motion.div 
            className="glass-card p-6 rounded-[24px] border border-outline-variant/30 flex flex-col items-center gap-4 hover:border-tertiary/30 cursor-pointer shadow-sm"
            variants={cardHover}
            whileHover="hover"
          >
            <div className="w-12 h-12 rounded-2xl bg-tertiary/10 text-tertiary flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl font-bold">trending_up</span>
            </div>
            <div>
              <h3 className="font-headline-md text-lg font-bold text-on-surface mb-1">Evolua</h3>
              <p className="text-on-surface-variant text-sm">Com relatórios e métricas de hábitos.</p>
            </div>
          </motion.div>
        </motion.div>

        {/* Botão principal */}
        <motion.div 
          className="w-full flex flex-col items-center gap-4"
          variants={itemVariants}
        >
          <motion.button 
            onClick={handleComecar}
            className="group px-8 py-4 bg-gradient-to-r from-primary to-secondary text-on-primary font-bold rounded-2xl flex items-center gap-3 shadow-lg shadow-primary/25 hover:shadow-primary/35 active:scale-95 transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span>Começar minha jornada</span>
            <FaChevronRight className="group-hover:translate-x-1 transition-transform" />
          </motion.button>
          
          <p className="text-xs text-on-surface-variant/80">
            Acesse seu dashboard personalizado e comece a transformar seus objetivos em realidade.
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default BoasVindas;