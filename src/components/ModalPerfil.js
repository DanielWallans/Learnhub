import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
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

  // Se o modal não está aberto, não renderiza nada
  if (!isOpen) return null;

  const handleSaveProfile = async () => {
    if (!user) return;
    
    setSaving(true);
    try {
      const docRef = doc(db, 'alunos', user.uid);
      await updateDoc(docRef, editedData);
      
      // Chama a função callback para atualizar os dados no componente pai
      if (onUpdateProfile) {
        onUpdateProfile(editedData);
      }
      
      setEditMode(false);
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
      nome: dadosAluno?.nome || '',
      emailContato: dadosAluno?.emailContato || user?.email || '',
      telefone: dadosAluno?.telefone || '',
      dataNascimento: dadosAluno?.dataNascimento || '',
      nomeInstituicao: dadosAluno?.nomeInstituicao || '',
      curso: dadosAluno?.curso || '',
      semestrePeriodo: dadosAluno?.semestrePeriodo || '',
      modalidade: dadosAluno?.modalidade || ''
    });
  };

  const handleCancel = () => {
    setEditMode(false);
    setEditedData({});
  };

  const modalContent = (
    <div className="modal-perfil-bg" onClick={onClose}>
      <div className="modal-perfil-moderno" onClick={(e) => e.stopPropagation()}>
        <div className="modal-perfil-header">
          <div className="modal-perfil-avatar-section">
            <div className="modal-perfil-avatar">
              <img src={foto} alt="Perfil" />
              <div className="avatar-badge-online"></div>
            </div>
            <div className="modal-perfil-info">
              <h2 className="modal-perfil-nome">{nome}</h2>
              <p className="modal-perfil-email">{dadosAluno?.emailContato || user?.email}</p>
            </div>
          </div>
          <button 
            className="modal-close-btn"
            onClick={onClose}
          >
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
        
        <div className="modal-perfil-content">
          {!editMode ? (
            // Modo Visualização
            <div className="perfil-view-mode">
              <div className="perfil-section">
                <h3 className="section-title">
                  <svg viewBox="0 0 24 24" fill="none">
                    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                  Informações Pessoais
                </h3>
                <div className="perfil-info-grid">
                  <div className="info-item">
                    <label>Nome Completo</label>
                    <span>{dadosAluno?.nome || 'Não informado'}</span>
                  </div>
                  <div className="info-item">
                    <label>Email Principal</label>
                    <span>{user?.email || 'Não informado'}</span>
                  </div>
                  <div className="info-item">
                    <label>Email de Contato</label>
                    <span>{dadosAluno?.emailContato || 'Não informado'}</span>
                  </div>
                  <div className="info-item">
                    <label>Telefone</label>
                    <span>{dadosAluno?.telefone || 'Não informado'}</span>
                  </div>
                  <div className="info-item">
                    <label>Data de Nascimento</label>
                    <span>{dadosAluno?.dataNascimento || 'Não informado'}</span>
                  </div>
                </div>
              </div>
              
              {/* Seção Acadêmica */}
              <div className="perfil-section">
                <h3 className="section-title">
                  <svg viewBox="0 0 24 24" fill="none">
                    <path d="M22 10v6M2 10v8a2 2 0 002 2h16a2 2 0 002-2v-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M7 15v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 15v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M17 15v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M2 10l10-8 10 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Informações Acadêmicas
                </h3>
                <div className="perfil-info-grid">
                  <div className="info-item">
                    <label>Instituição</label>
                    <span>{dadosAluno?.nomeInstituicao || 'Não informado'}</span>
                  </div>
                  <div className="info-item">
                    <label>Curso</label>
                    <span>{dadosAluno?.curso || 'Não informado'}</span>
                  </div>
                  <div className="info-item">
                    <label>Semestre/Período</label>
                    <span>{dadosAluno?.semestrePeriodo || 'Não informado'}</span>
                  </div>
                  <div className="info-item">
                    <label>Modalidade</label>
                    <span>{dadosAluno?.modalidade || 'Não informado'}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Modo Edição
            <div className="perfil-edit-mode">
              <div className="perfil-section">
                <h3 className="section-title">
                  <svg viewBox="0 0 24 24" fill="none">
                    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                  Editar Informações Pessoais
                </h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Nome Completo</label>
                    <input 
                      type="text" 
                      value={editedData.nome || ''}
                      onChange={(e) => setEditedData({...editedData, nome: e.target.value})}
                      placeholder="Digite seu nome completo"
                    />
                  </div>
                  <div className="form-group">
                    <label>Email Principal</label>
                    <input 
                      type="email" 
                      value={user?.email || ''}
                      disabled
                      style={{
                        opacity: 0.7,
                        cursor: 'not-allowed',
                        backgroundColor: 'rgba(15, 23, 42, 0.5)'
                      }}
                      placeholder="Email da conta (não editável)"
                    />
                  </div>
                  <div className="form-group">
                    <label>Email de Contato</label>
                    <input 
                      type="email" 
                      value={editedData.emailContato || ''}
                      onChange={(e) => setEditedData({...editedData, emailContato: e.target.value})}
                      placeholder="Digite seu email de contato"
                    />
                  </div>
                  <div className="form-group">
                    <label>Telefone</label>
                    <input 
                      type="tel" 
                      value={editedData.telefone || ''}
                      onChange={(e) => setEditedData({...editedData, telefone: e.target.value})}
                      placeholder="Digite seu telefone"
                    />
                  </div>
                  <div className="form-group">
                    <label>Data de Nascimento</label>
                    <input 
                      type="date" 
                      value={editedData.dataNascimento || ''}
                      onChange={(e) => setEditedData({...editedData, dataNascimento: e.target.value})}
                    />
                  </div>
                </div>
              </div>
              
              {/* Seção Acadêmica - Modo Edição */}
              <div className="perfil-section">
                <h3 className="section-title">
                  <svg viewBox="0 0 24 24" fill="none">
                    <path d="M22 10v6M2 10v8a2 2 0 002 2h16a2 2 0 002-2v-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M7 15v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 15v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M17 15v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M2 10l10-8 10 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Editar Informações Acadêmicas
                </h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Instituição</label>
                    <input 
                      type="text" 
                      value={editedData.nomeInstituicao || ''}
                      onChange={(e) => setEditedData({...editedData, nomeInstituicao: e.target.value})}
                      placeholder="Nome da instituição de ensino"
                    />
                  </div>
                  <div className="form-group">
                    <label>Curso</label>
                    <input 
                      type="text" 
                      value={editedData.curso || ''}
                      onChange={(e) => setEditedData({...editedData, curso: e.target.value})}
                      placeholder="Nome do seu curso"
                    />
                  </div>
                  <div className="form-group">
                    <label>Semestre/Período</label>
                    <input 
                      type="text" 
                      value={editedData.semestrePeriodo || ''}
                      onChange={(e) => setEditedData({...editedData, semestrePeriodo: e.target.value})}
                      placeholder="Ex: 3º Semestre, 5º Período"
                    />
                  </div>
                  <div className="form-group">
                    <label>Modalidade</label>
                    <select 
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
              </div>
            </div>
          )}
        </div>

        <div className="modal-perfil-actions">
          {!editMode ? (
            <button 
              className="btn-modal-primary"
              onClick={handleEditClick}
            >
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Editar Perfil
            </button>
          ) : (
            <>
              <button 
                className="btn-modal-secondary"
                onClick={handleCancel}
              >
                Cancelar
              </button>
              <button 
                className="btn-modal-primary"
                onClick={handleSaveProfile}
                disabled={saving}
              >
                {saving ? (
                  <>
                    <div className="modal-perfil-spinner"></div>
                    Salvando...
                  </>
                ) : (
                  <>
                    <svg viewBox="0 0 24 24" fill="none">
                      <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <polyline points="17,21 17,13 7,13 7,21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <polyline points="7,3 7,8 15,8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Salvar Alterações
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );

  // Renderiza via portal se estiver aberto
  return (
    <>
      {createPortal(modalContent, document.body)}
      
      {/* Mensagem de Sucesso */}
      {showSuccessMessage && createPortal(
        <div className="success-message">
          <div className="success-content">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14" stroke="currentColor" strokeWidth="2"/>
              <polyline points="22,4 12,14.01 9,11.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>Perfil atualizado com sucesso!</span>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default ModalPerfil;
