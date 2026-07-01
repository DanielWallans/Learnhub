import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Mail, Phone, Calendar, GraduationCap, Building, 
  BookOpen, Clock, Globe, Camera, Save, X, Edit3, 
  CheckCircle2, Link as LinkIcon, Sparkles 
} from 'lucide-react';
import './modalPerfil.css';

const ModalPerfil = ({ 
  isOpen, 
  onClose, 
  user, 
  dadosAluno, 
  nome, 
  foto, 
  onUpdateProfile
}) => {
  const [editMode, setEditMode] = useState(false);
  const [editedData, setEditedData] = useState({});
  const [saving, setSaving] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [activeTab, setActiveTab] = useState('pessoais'); // 'pessoais' | 'academicos'
  const [imageError, setImageError] = useState(false);
  const [showPhotoInput, setShowPhotoInput] = useState(false);

  // Reset image error state when photo changes
  useEffect(() => {
    setImageError(false);
  }, [foto, editedData.foto]);

  if (!isOpen) return null;

  const handleSaveProfile = async () => {
    if (!user) return;
    
    setSaving(true);
    try {
      const docRef = doc(db, 'alunos', user.uid);
      await updateDoc(docRef, editedData);
      
      if (onUpdateProfile) {
        onUpdateProfile(editedData);
      }
      
      setEditMode(false);
      setShowPhotoInput(false);
      setEditedData({});
      
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);
      
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
      alert('Erro ao salvar perfil. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  const handleEditClick = () => {
    setEditMode(true);
    setEditedData({
      nome: dadosAluno?.nome || nome || '',
      emailContato: dadosAluno?.emailContato || user?.email || '',
      telefone: dadosAluno?.telefone || '',
      dataNascimento: dadosAluno?.dataNascimento || '',
      nomeInstituicao: dadosAluno?.nomeInstituicao || '',
      curso: dadosAluno?.curso || '',
      semestrePeriodo: dadosAluno?.semestrePeriodo || '',
      modalidade: dadosAluno?.modalidade || '',
      foto: dadosAluno?.foto || foto || ''
    });
  };

  const handleCancel = () => {
    setEditMode(false);
    setShowPhotoInput(false);
    setEditedData({});
  };

  // Helper to extract initials
  const getInitials = (fullName) => {
    if (!fullName) return '?';
    const parts = fullName.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  const currentPhoto = editMode ? (editedData.foto || foto) : (dadosAluno?.foto || foto);
  const currentNome = editMode ? (editedData.nome || nome) : (dadosAluno?.nome || nome);
  const initials = getInitials(currentNome);

  const modalContent = (
    <motion.div 
      className="modal-perfil-bg" 
      onClick={onClose}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Glow blobs in background for depth */}
      <div className="bg-glow-blob blob-1"></div>
      <div className="bg-glow-blob blob-2"></div>

      <motion.div 
        className="modal-perfil-moderno glass-modal" 
        onClick={(e) => e.stopPropagation()}
        initial={{ scale: 0.92, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0, y: 30 }}
        transition={{ type: "spring", damping: 25, stiffness: 220 }}
      >
        {/* Banner com Mesh Gradient */}
        <div className="modal-perfil-banner">
          <div className="banner-mesh"></div>
          <button className="modal-close-btn-modern" onClick={onClose} aria-label="Fechar">
            <X size={18} />
          </button>
        </div>

        {/* Header content with avatar overlapping banner */}
        <div className="modal-perfil-header-new">
          <div className="avatar-outer-wrapper">
            <div 
              className={`avatar-inner-ring ${editMode ? 'editable' : ''}`}
              onClick={() => editMode && setShowPhotoInput(!showPhotoInput)}
            >
              {currentPhoto && !imageError ? (
                <img 
                  src={currentPhoto} 
                  alt="Perfil" 
                  onError={() => setImageError(true)} 
                  className="avatar-img-modern"
                />
              ) : (
                <div className="avatar-placeholder-initials">
                  {initials}
                </div>
              )}
              
              {editMode && (
                <div className="avatar-edit-overlay">
                  <Camera size={20} className="camera-icon-anim" />
                  <span>Alterar</span>
                </div>
              )}
            </div>
            <div className="avatar-status-indicator-online"></div>
          </div>

          <div className="header-details-modern">
            <h2 className="header-name-modern">
              {currentNome}
              <Sparkles size={16} className="sparkle-title-icon" />
            </h2>
            <p className="header-subtitle-modern">
              {dadosAluno?.curso ? `${dadosAluno.curso} • ${dadosAluno.nomeInstituicao || 'Estudante'}` : (dadosAluno?.emailContato || user?.email)}
            </p>
          </div>
        </div>

        {/* Tab Navigation Selector */}
        <div className="modal-tabs-container">
          <button 
            className={`tab-btn-modern ${activeTab === 'pessoais' ? 'active' : ''}`}
            onClick={() => setActiveTab('pessoais')}
          >
            <User size={16} />
            <span>Dados Pessoais</span>
            {activeTab === 'pessoais' && (
              <motion.div className="active-tab-line" layoutId="activeTabLine" />
            )}
          </button>
          <button 
            className={`tab-btn-modern ${activeTab === 'academicos' ? 'active' : ''}`}
            onClick={() => setActiveTab('academicos')}
          >
            <GraduationCap size={16} />
            <span>Acadêmico</span>
            {activeTab === 'academicos' && (
              <motion.div className="active-tab-line" layoutId="activeTabLine" />
            )}
          </button>
        </div>

        {/* Modal Scrollable Content Container */}
        <div className="modal-perfil-content-new">
          <AnimatePresence mode="wait">
            {showPhotoInput && editMode && (
              <motion.div 
                className="photo-url-drawer glass-card-input"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="input-field-glow">
                  <label className="input-label-modern">
                    <LinkIcon size={12} style={{ marginRight: '6px' }} />
                    URL da Foto de Perfil
                  </label>
                  <input 
                    type="text" 
                    className="input-element-modern"
                    value={editedData.foto || ''}
                    onChange={(e) => setEditedData({...editedData, foto: e.target.value})}
                    placeholder="Cole o link (URL) de uma imagem hospedada"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div
            key={activeTab + (editMode ? '-edit' : '-view')}
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -15 }}
            transition={{ duration: 0.25 }}
            className="tab-content-panel"
          >
            {!editMode ? (
              /* --- VIEW MODE --- */
              activeTab === 'pessoais' ? (
                <div className="cards-grid-modern">
                  <div className="info-card-modern">
                    <div className="card-icon-wrapper">
                      <User size={18} />
                    </div>
                    <div className="card-texts">
                      <span className="card-label-modern">Nome Completo</span>
                      <span className="card-value-modern">{dadosAluno?.nome || 'Não informado'}</span>
                    </div>
                  </div>

                  <div className="info-card-modern">
                    <div className="card-icon-wrapper">
                      <Mail size={18} />
                    </div>
                    <div className="card-texts">
                      <span className="card-label-modern">Email Principal</span>
                      <span className="card-value-modern">{user?.email || 'Não informado'}</span>
                    </div>
                  </div>

                  <div className="info-card-modern">
                    <div className="card-icon-wrapper">
                      <Globe size={18} />
                    </div>
                    <div className="card-texts">
                      <span className="card-label-modern">Email de Contato</span>
                      <span className="card-value-modern">{dadosAluno?.emailContato || 'Não informado'}</span>
                    </div>
                  </div>

                  <div className="info-card-modern">
                    <div className="card-icon-wrapper">
                      <Phone size={18} />
                    </div>
                    <div className="card-texts">
                      <span className="card-label-modern">Telefone</span>
                      <span className="card-value-modern">{dadosAluno?.telefone || 'Não informado'}</span>
                    </div>
                  </div>

                  <div className="info-card-modern full-width">
                    <div className="card-icon-wrapper">
                      <Calendar size={18} />
                    </div>
                    <div className="card-texts">
                      <span className="card-label-modern">Data de Nascimento</span>
                      <span className="card-value-modern">
                        {dadosAluno?.dataNascimento ? new Date(dadosAluno.dataNascimento + 'T00:00:00').toLocaleDateString('pt-BR') : 'Não informado'}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="cards-grid-modern">
                  <div className="info-card-modern">
                    <div className="card-icon-wrapper">
                      <Building size={18} />
                    </div>
                    <div className="card-texts">
                      <span className="card-label-modern">Instituição</span>
                      <span className="card-value-modern">{dadosAluno?.nomeInstituicao || 'Não informado'}</span>
                    </div>
                  </div>

                  <div className="info-card-modern">
                    <div className="card-icon-wrapper">
                      <BookOpen size={18} />
                    </div>
                    <div className="card-texts">
                      <span className="card-label-modern">Curso</span>
                      <span className="card-value-modern">{dadosAluno?.curso || 'Não informado'}</span>
                    </div>
                  </div>

                  <div className="info-card-modern">
                    <div className="card-icon-wrapper">
                      <Clock size={18} />
                    </div>
                    <div className="card-texts">
                      <span className="card-label-modern">Semestre / Período</span>
                      <span className="card-value-modern">{dadosAluno?.semestrePeriodo || 'Não informado'}</span>
                    </div>
                  </div>

                  <div className="info-card-modern">
                    <div className="card-icon-wrapper">
                      <Globe size={18} />
                    </div>
                    <div className="card-texts">
                      <span className="card-label-modern">Modalidade de Ensino</span>
                      <span className="card-value-modern">{dadosAluno?.modalidade || 'Não informado'}</span>
                    </div>
                  </div>
                </div>
              )
            ) : (
              /* --- EDIT MODE --- */
              activeTab === 'pessoais' ? (
                <div className="form-grid-modern">
                  <div className="input-field-glow">
                    <label className="input-label-modern">Nome Completo</label>
                    <input 
                      type="text" 
                      className="input-element-modern"
                      value={editedData.nome || ''}
                      onChange={(e) => setEditedData({...editedData, nome: e.target.value})}
                      placeholder="Nome completo"
                    />
                  </div>

                  <div className="input-field-glow readonly">
                    <label className="input-label-modern">Email Principal (Conta)</label>
                    <input 
                      type="email" 
                      className="input-element-modern disabled"
                      value={user?.email || ''}
                      disabled
                      placeholder="Não editável"
                    />
                  </div>

                  <div className="input-field-glow">
                    <label className="input-label-modern">Email de Contato</label>
                    <input 
                      type="email" 
                      className="input-element-modern"
                      value={editedData.emailContato || ''}
                      onChange={(e) => setEditedData({...editedData, emailContato: e.target.value})}
                      placeholder="Email de contato secundário"
                    />
                  </div>

                  <div className="input-field-glow">
                    <label className="input-label-modern">Telefone</label>
                    <input 
                      type="tel" 
                      className="input-element-modern"
                      value={editedData.telefone || ''}
                      onChange={(e) => setEditedData({...editedData, telefone: e.target.value})}
                      placeholder="DDD + Número"
                    />
                  </div>

                  <div className="input-field-glow full-width">
                    <label className="input-label-modern">Data de Nascimento</label>
                    <input 
                      type="date" 
                      className="input-element-modern"
                      value={editedData.dataNascimento || ''}
                      onChange={(e) => setEditedData({...editedData, dataNascimento: e.target.value})}
                    />
                  </div>
                </div>
              ) : (
                <div className="form-grid-modern">
                  <div className="input-field-glow">
                    <label className="input-label-modern">Instituição de Ensino</label>
                    <input 
                      type="text" 
                      className="input-element-modern"
                      value={editedData.nomeInstituicao || ''}
                      onChange={(e) => setEditedData({...editedData, nomeInstituicao: e.target.value})}
                      placeholder="Nome da faculdade/escola"
                    />
                  </div>

                  <div className="input-field-glow">
                    <label className="input-label-modern">Curso</label>
                    <input 
                      type="text" 
                      className="input-element-modern"
                      value={editedData.curso || ''}
                      onChange={(e) => setEditedData({...editedData, curso: e.target.value})}
                      placeholder="Nome do curso acadêmico"
                    />
                  </div>

                  <div className="input-field-glow">
                    <label className="input-label-modern">Semestre / Período</label>
                    <input 
                      type="text" 
                      className="input-element-modern"
                      value={editedData.semestrePeriodo || ''}
                      onChange={(e) => setEditedData({...editedData, semestrePeriodo: e.target.value})}
                      placeholder="Ex: 5º Semestre"
                    />
                  </div>

                  <div className="input-field-glow">
                    <label className="input-label-modern">Modalidade</label>
                    <select 
                      className="input-element-modern select-input-modern"
                      value={editedData.modalidade || ''}
                      onChange={(e) => setEditedData({...editedData, modalidade: e.target.value})}
                    >
                      <option value="">Selecione a modalidade</option>
                      <option value="Presencial">Presencial</option>
                      <option value="EAD">EAD</option>
                      <option value="Semipresencial">Semipresencial</option>
                    </select>
                  </div>
                </div>
              )
            )}
          </motion.div>
        </div>

        {/* Modal Footer Controls */}
        <div className="modal-perfil-actions-new">
          {!editMode ? (
            <button 
              className="btn-modern-primary glass-btn glow-purple"
              onClick={handleEditClick}
            >
              <Edit3 size={16} />
              <span>Editar Perfil</span>
            </button>
          ) : (
            <div className="edit-actions-wrapper">
              <button 
                className="btn-modern-secondary glass-btn"
                onClick={handleCancel}
                disabled={saving}
              >
                Cancelar
              </button>
              <button 
                className="btn-modern-primary glass-btn glow-blue"
                onClick={handleSaveProfile}
                disabled={saving}
              >
                {saving ? (
                  <>
                    <div className="btn-spinner-modern"></div>
                    <span>Salvando...</span>
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    <span>Salvar Alterações</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );

  return (
    <>
      {createPortal(modalContent, document.body)}
      
      {/* Alerta de Sucesso */}
      <AnimatePresence>
        {showSuccessMessage && (
          createPortal(
            <motion.div 
              className="success-alert-container"
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
            >
              <div className="success-alert-content glass-card">
                <div className="success-icon-bg">
                  <CheckCircle2 size={24} className="success-icon-anim" />
                </div>
                <div className="success-texts">
                  <h4>Atualizado!</h4>
                  <p>Suas informações foram salvas com sucesso.</p>
                </div>
              </div>
            </motion.div>,
            document.body
          )
        )}
      </AnimatePresence>
    </>
  );
};

export default ModalPerfil;
