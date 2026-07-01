import React from 'react';
import { motion } from 'framer-motion';
import './Loading.css';

const Loading = ({ title = 'LearnHub', message = 'Carregando...', size = 'medium' }) => {
  const letters = title.split("");

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08
      }
    }
  };

  const letterVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 180
      }
    }
  };

  return (
    <div className={`loading-overlay-container ${size}`}>
      <div className="loading-effects-glow"></div>
      
      <div className="loading-card-glass">
        {/* Cinematic Title Stagger */}
        <motion.div 
          className="loading-logo-glow flex gap-1 justify-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {letters.map((char, index) => (
            <motion.span 
              key={index}
              variants={letterVariants}
              className="inline-block"
              style={{ textShadow: '0 0 20px rgba(37, 99, 235, 0.4)' }}
            >
              {char}
            </motion.span>
          ))}
        </motion.div>

        {/* Minimalist Progress Line */}
        <div className="loading-line-progress-container">
          <div className="loading-line-progress-fill"></div>
        </div>

        {/* Action / Status Message */}
        <span className="loading-message-text">{message}</span>
      </div>
    </div>
  );
};

export default Loading;
