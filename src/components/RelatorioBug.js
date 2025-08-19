import React, { useState, useCallback } from 'react';
import { 
  FaBug, 
  FaExclamationTriangle, 
  FaInfoCircle, 
  FaLightbulb,
  FaPaperPlane,
  FaTimes,
  FaCheckCircle
} from 'react-icons/fa';
import { auth, db } from '../firebaseConfig';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import './RelatorioBug.css';

const RelatorioBug = ({ onClose }) => {
  const [formData, setFormData] = useState({
    tipo: 'bug',
    titulo: '',
    descricao: '',
    passos: '',
    navegador: '',
    dispositivo: '',
    prioridade: 'media'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.titulo.trim() || !formData.descricao.trim()) {
      setError('Por favor, preencha pelo menos o título e a descrição.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const user = auth.currentUser;
      
      // Dados do relatório
      const reportData = {
        ...formData,
        userId: user?.uid || 'anonimo',
        userEmail: user?.email || 'não informado',
        timestamp: serverTimestamp(),
        status: 'aberto',
        url: window.location.href,
        userAgent: navigator.userAgent
      };

      // Salva no Firestore
      await addDoc(collection(db, 'bug-reports'), reportData);
      
      setIsSubmitted(true);
      
      // Fecha o modal após 2 segundos
      setTimeout(() => {
        onClose();
      }, 2000);
      
    } catch (error) {
      console.error('Erro ao enviar relatório:', error);
      setError('Erro ao enviar o relatório. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTipoIcon = (tipo) => {
    switch (tipo) {
      case 'bug': return <FaBug />;
      case 'melhoria': return <FaLightbulb />;
      case 'problema': return <FaExclamationTriangle />;
      default: return <FaInfoCircle />;
    }
  };

  const getPrioridadeColor = (prioridade) => {
    switch (prioridade) {
      case 'alta': return '#ff4757';
      case 'media': return '#ffa502';
      case 'baixa': return '#2ed573';
      default: return '#747d8c';
    }
  };

  if (isSubmitted) {
    return (
      <div className="bug-report-overlay">
        <div className="bug-report-modal success-modal">
          <div className="success-content">
            <FaCheckCircle className="success-icon" />
            <h2>Relatório enviado com sucesso! 🎉</h2>
            <p>Obrigado por nos ajudar a melhorar o LearnHub!</p>
            <p>Sua contribuição é muito importante para nós.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bug-report-overlay">
      <div className="bug-report-modal">
        <div className="modal-header">
          <h2>
            <FaBug className="header-icon" />
            Reportar Problema
          </h2>
          <button className="close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="bug-report-form">
          {/* Tipo do Relatório */}
          <div className="form-group">
            <label htmlFor="tipo">Tipo do Relatório</label>
            <div className="tipo-options">
              {[
                { value: 'bug', label: 'Bug/Erro', icon: <FaBug /> },
                { value: 'melhoria', label: 'Sugestão', icon: <FaLightbulb /> },
                { value: 'problema', label: 'Problema', icon: <FaExclamationTriangle /> }
              ].map(option => (
                <label key={option.value} className="tipo-option">
                  <input
                    type="radio"
                    name="tipo"
                    value={option.value}
                    checked={formData.tipo === option.value}
                    onChange={handleInputChange}
                  />
                  <span className="tipo-label">
                    {option.icon}
                    {option.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Título */}
          <div className="form-group">
            <label htmlFor="titulo">Título *</label>
            <input
              type="text"
              id="titulo"
              name="titulo"
              value={formData.titulo}
              onChange={handleInputChange}
              placeholder="Descreva brevemente o problema..."
              required
            />
          </div>

          {/* Descrição */}
          <div className="form-group">
            <label htmlFor="descricao">Descrição Detalhada *</label>
            <textarea
              id="descricao"
              name="descricao"
              value={formData.descricao}
              onChange={handleInputChange}
              placeholder="Descreva o problema em detalhes. O que aconteceu? O que você esperava que acontecesse?"
              rows={4}
              required
            />
          </div>

          {/* Passos para Reproduzir */}
          <div className="form-group">
            <label htmlFor="passos">Passos para Reproduzir</label>
            <textarea
              id="passos"
              name="passos"
              value={formData.passos}
              onChange={handleInputChange}
              placeholder="1. Vá para...\n2. Clique em...\n3. Veja o erro..."
              rows={3}
            />
          </div>

          {/* Informações do Sistema */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="navegador">Navegador</label>
              <input
                type="text"
                id="navegador"
                name="navegador"
                value={formData.navegador}
                onChange={handleInputChange}
                placeholder="Ex: Chrome 120, Firefox 121..."
              />
            </div>
            <div className="form-group">
              <label htmlFor="dispositivo">Dispositivo</label>
              <input
                type="text"
                id="dispositivo"
                name="dispositivo"
                value={formData.dispositivo}
                onChange={handleInputChange}
                placeholder="Ex: Desktop, Mobile, Tablet..."
              />
            </div>
          </div>

          {/* Prioridade */}
          <div className="form-group">
            <label htmlFor="prioridade">Prioridade</label>
            <select
              id="prioridade"
              name="prioridade"
              value={formData.prioridade}
              onChange={handleInputChange}
            >
              <option value="baixa">🟢 Baixa - Não impacta o uso</option>
              <option value="media">🟡 Média - Impacta parcialmente</option>
              <option value="alta">🔴 Alta - Impede o uso</option>
            </select>
          </div>

          {/* Erro */}
          {error && (
            <div className="error-message">
              <FaExclamationTriangle />
              {error}
            </div>
          )}

          {/* Botões */}
          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button 
              type="submit" 
              className="btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="loading-spinner small"></div>
                  Enviando...
                </>
              ) : (
                <>
                  <FaPaperPlane />
                  Enviar Relatório
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RelatorioBug;