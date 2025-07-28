import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db, auth } from "../../firebaseConfig";
import { createUserWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { collection, setDoc, doc, getDocs, query, where } from "firebase/firestore";
import "./cadastroAluno.css";

function CadastroAluno() {
  const [formData, setFormData] = useState({
    email: "",
    senha: "",
    confirmSenha: "",
    matricula: "",
    nomeCompleto: "",
    dataNascimento: "",
    cpf: "",
    telefone: "",
    emailContato: "",
    nivelEnsino: "",
    anoSerie: "",
    nomeEscola: "",
    turno: "",
    nomeInstituicao: "",
    curso: "",
    semestrePeriodo: "",
    modalidade: ""
  });

  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDocs(query(collection(db, "alunos"), where("uid", "==", user.uid)));
        if (!userDoc.empty) {
          navigate("/home");
        }
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpar erro do campo quando usuário começar a digitar
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const validateStep = (step) => {
    const newErrors = {};
    
    if (step === 1) {
      if (!formData.nomeCompleto.trim()) newErrors.nomeCompleto = "Nome completo é obrigatório";
      if (!formData.dataNascimento) newErrors.dataNascimento = "Data de nascimento é obrigatória";
      if (!formData.cpf.trim()) newErrors.cpf = "CPF é obrigatório";
      if (!formData.telefone.trim()) newErrors.telefone = "Telefone é obrigatório";
      if (!formData.emailContato.trim()) newErrors.emailContato = "Email de contato é obrigatório";
    }
    
    if (step === 2) {
      if (!formData.email.trim()) newErrors.email = "Email é obrigatório";
      if (formData.senha.length < 6) newErrors.senha = "Senha deve ter pelo menos 6 caracteres";
      if (formData.senha !== formData.confirmSenha) newErrors.confirmSenha = "Senhas não coincidem";
      if (!formData.matricula.trim()) newErrors.matricula = "Matrícula é obrigatória";
    }
    
    if (step === 3) {
      if (!formData.nivelEnsino) newErrors.nivelEnsino = "Nível de ensino é obrigatório";
      
      if (formData.nivelEnsino === "Ensino Fundamental" || formData.nivelEnsino === "Ensino Médio") {
        if (!formData.anoSerie.trim()) newErrors.anoSerie = "Ano/Série é obrigatório";
        if (!formData.nomeEscola.trim()) newErrors.nomeEscola = "Nome da escola é obrigatório";
        if (!formData.turno) newErrors.turno = "Turno é obrigatório";
      }
      
      if (formData.nivelEnsino === "Ensino Superior") {
        if (!formData.nomeInstituicao.trim()) newErrors.nomeInstituicao = "Nome da instituição é obrigatório";
        if (!formData.curso.trim()) newErrors.curso = "Curso é obrigatório";
        if (!formData.semestrePeriodo.trim()) newErrors.semestrePeriodo = "Semestre/Período é obrigatório";
        if (!formData.modalidade) newErrors.modalidade = "Modalidade é obrigatória";
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleCadastro = async (e) => {
    e.preventDefault();
    
    if (!validateStep(3)) return;
    
    setLoading(true);
    setErrors({});

    try {
      // Criando usuário no Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.senha);
      const user = userCredential.user;

      // Salvando usuário no Firestore
      await setDoc(doc(db, "alunos", user.uid), { 
        uid: user.uid, 
        ...formData,
        criadoEm: new Date().toISOString()
      });
      
      navigate("/boas-vindas");
    } catch (error) {
      let errorMessage = "Erro ao cadastrar. Tente novamente.";
      
      switch (error.code) {
        case "auth/email-already-in-use":
          errorMessage = "Este e-mail já está cadastrado";
          break;
        case "auth/weak-password":
          errorMessage = "Senha muito fraca";
          break;
        case "auth/invalid-email":
          errorMessage = "Email inválido";
          break;
        default:
          errorMessage = "Erro inesperado. Tente novamente";
      }
      
      setErrors({ submit: errorMessage });
      console.error("Erro ao cadastrar:", error.code, error.message);
    } finally {
      setLoading(false);
    }
  };

  const gerarMatricula = async () => {
    setLoading(true);
    let novaMatricula;
    let matriculaExiste = true;

    try {
      while (matriculaExiste) {
        novaMatricula = "MAT-" + Math.floor(Math.random() * 1000000);
        const q = query(collection(db, "alunos"), where("matricula", "==", novaMatricula));
        const querySnapshot = await getDocs(q);
        matriculaExiste = !querySnapshot.empty;
      }

      updateField('matricula', novaMatricula);
    } catch (error) {
      setErrors({ matricula: "Erro ao gerar matrícula. Tente novamente." });
    } finally {
      setLoading(false);
    }
  };

  const formatCPF = (value) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1');
  };

  const formatTelefone = (value) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d)/, '$1-$2')
      .replace(/(\d{4})-(\d)(\d{4})/, '$1$2-$3')
      .replace(/(-\d{4})\d+?$/, '$1');
  };

  const renderStep1 = () => (
    <div className="step-content">
      <h3 className="step-title">Dados Pessoais</h3>
      
      <div className="input-group">
        <label htmlFor="nomeCompleto" className="input-label">Nome Completo</label>
        <div className="input-wrapper">
          <svg className="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
          <input
            id="nomeCompleto"
            type="text"
            placeholder="Digite seu nome completo"
            value={formData.nomeCompleto}
            onChange={(e) => updateField('nomeCompleto', e.target.value)}
            className={`cadastro-input ${errors.nomeCompleto ? 'error' : ''}`}
          />
        </div>
        {errors.nomeCompleto && <span className="error-text">{errors.nomeCompleto}</span>}
      </div>

      <div className="input-group">
        <label htmlFor="dataNascimento" className="input-label">Data de Nascimento</label>
        <div className="input-wrapper">
          <svg className="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          <input
            id="dataNascimento"
            type="date"
            value={formData.dataNascimento}
            onChange={(e) => updateField('dataNascimento', e.target.value)}
            className={`cadastro-input ${errors.dataNascimento ? 'error' : ''}`}
          />
        </div>
        {errors.dataNascimento && <span className="error-text">{errors.dataNascimento}</span>}
      </div>

      <div className="input-group">
        <label htmlFor="cpf" className="input-label">CPF</label>
        <div className="input-wrapper">
          <svg className="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14,2 14,8 20,8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
            <polyline points="10,9 9,9 8,9"/>
          </svg>
          <input
            id="cpf"
            type="text"
            placeholder="000.000.000-00"
            value={formData.cpf}
            onChange={(e) => updateField('cpf', formatCPF(e.target.value))}
            className={`cadastro-input ${errors.cpf ? 'error' : ''}`}
            maxLength="14"
          />
        </div>
        {errors.cpf && <span className="error-text">{errors.cpf}</span>}
      </div>

      <div className="input-group">
        <label htmlFor="telefone" className="input-label">Telefone</label>
        <div className="input-wrapper">
          <svg className="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
          </svg>
          <input
            id="telefone"
            type="text"
            placeholder="(00) 00000-0000"
            value={formData.telefone}
            onChange={(e) => updateField('telefone', formatTelefone(e.target.value))}
            className={`cadastro-input ${errors.telefone ? 'error' : ''}`}
            maxLength="15"
          />
        </div>
        {errors.telefone && <span className="error-text">{errors.telefone}</span>}
      </div>

      <div className="input-group">
        <label htmlFor="emailContato" className="input-label">Email para Contato</label>
        <div className="input-wrapper">
          <svg className="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
            <polyline points="22,6 12,13 2,6"/>
          </svg>
          <input
            id="emailContato"
            type="email"
            placeholder="seu.email@exemplo.com"
            value={formData.emailContato}
            onChange={(e) => updateField('emailContato', e.target.value)}
            className={`cadastro-input ${errors.emailContato ? 'error' : ''}`}
          />
        </div>
        {errors.emailContato && <span className="error-text">{errors.emailContato}</span>}
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="step-content">
      <h3 className="step-title">Dados de Acesso</h3>
      
      <div className="input-group">
        <label htmlFor="email" className="input-label">Email de Login</label>
        <div className="input-wrapper">
          <svg className="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
            <polyline points="22,6 12,13 2,6"/>
          </svg>
          <input
            id="email"
            type="email"
            placeholder="Email para fazer login"
            value={formData.email}
            onChange={(e) => updateField('email', e.target.value)}
            className={`cadastro-input ${errors.email ? 'error' : ''}`}
          />
        </div>
        {errors.email && <span className="error-text">{errors.email}</span>}
      </div>

      <div className="input-group">
        <label htmlFor="senha" className="input-label">Senha</label>
        <div className="input-wrapper">
          <svg className="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <circle cx="12" cy="16" r="1"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
          <input
            id="senha"
            type={showPassword ? "text" : "password"}
            placeholder="Mínimo 6 caracteres"
            value={formData.senha}
            onChange={(e) => updateField('senha', e.target.value)}
            className={`cadastro-input ${errors.senha ? 'error' : ''}`}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="password-toggle"
          >
            {showPassword ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                <line x1="1" y1="1" x2="23" y2="23"/>
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            )}
          </button>
        </div>
        {errors.senha && <span className="error-text">{errors.senha}</span>}
      </div>

      <div className="input-group">
        <label htmlFor="confirmSenha" className="input-label">Confirmar Senha</label>
        <div className="input-wrapper">
          <svg className="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <circle cx="12" cy="16" r="1"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
          <input
            id="confirmSenha"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Digite a senha novamente"
            value={formData.confirmSenha}
            onChange={(e) => updateField('confirmSenha', e.target.value)}
            className={`cadastro-input ${errors.confirmSenha ? 'error' : ''}`}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="password-toggle"
          >
            {showConfirmPassword ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                <line x1="1" y1="1" x2="23" y2="23"/>
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            )}
          </button>
        </div>
        {errors.confirmSenha && <span className="error-text">{errors.confirmSenha}</span>}
      </div>

      <div className="matricula-section">
        <div className="input-group">
          <label htmlFor="matricula" className="input-label">Matrícula</label>
          <div className="matricula-wrapper">
            <div className="input-wrapper">
              <svg className="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14,2 14,8 20,8"/>
              </svg>
              <input
                id="matricula"
                type="text"
                placeholder="Clique em gerar matrícula"
                value={formData.matricula}
                readOnly
                className={`cadastro-input readonly ${errors.matricula ? 'error' : ''}`}
              />
            </div>
            <button
              type="button"
              onClick={gerarMatricula}
              className="generate-btn"
              disabled={loading}
            >
              {loading ? (
                <div className="spinner-small"></div>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="23,4 23,10 17,10"/>
                    <polyline points="1,20 1,14 7,14"/>
                    <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/>
                  </svg>
                  Gerar
                </>
              )}
            </button>
          </div>
          {errors.matricula && <span className="error-text">{errors.matricula}</span>}
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="step-content">
      <h3 className="step-title">Dados Acadêmicos</h3>
      
      <div className="input-group">
        <label htmlFor="nivelEnsino" className="input-label">Nível de Ensino</label>
        <div className="input-wrapper">
          <svg className="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
            <path d="M6 12v5c3 3 9 3 12 0v-5"/>
          </svg>
          <select
            id="nivelEnsino"
            value={formData.nivelEnsino}
            onChange={(e) => updateField('nivelEnsino', e.target.value)}
            className={`cadastro-input ${errors.nivelEnsino ? 'error' : ''}`}
          >
            <option value="">Selecione o nível de ensino</option>
            <option value="Ensino Fundamental">Ensino Fundamental</option>
            <option value="Ensino Médio">Ensino Médio</option>
            <option value="Ensino Superior">Ensino Superior</option>
          </select>
        </div>
        {errors.nivelEnsino && <span className="error-text">{errors.nivelEnsino}</span>}
      </div>

      {(formData.nivelEnsino === "Ensino Fundamental" || formData.nivelEnsino === "Ensino Médio") && (
        <>
          <div className="input-group">
            <label htmlFor="anoSerie" className="input-label">Ano/Série Atual</label>
            <div className="input-wrapper">
              <svg className="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14,2 14,8 20,8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
              </svg>
              <input
                id="anoSerie"
                type="text"
                placeholder="Ex: 9º ano, 2º ano"
                value={formData.anoSerie}
                onChange={(e) => updateField('anoSerie', e.target.value)}
                className={`cadastro-input ${errors.anoSerie ? 'error' : ''}`}
              />
            </div>
            {errors.anoSerie && <span className="error-text">{errors.anoSerie}</span>}
          </div>

          <div className="input-group">
            <label htmlFor="nomeEscola" className="input-label">Nome da Escola</label>
            <div className="input-wrapper">
              <svg className="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 21h18"/>
                <path d="M5 21V7l8-4v18"/>
                <path d="M19 21V11l-6-4"/>
              </svg>
              <input
                id="nomeEscola"
                type="text"
                placeholder="Nome da sua escola"
                value={formData.nomeEscola}
                onChange={(e) => updateField('nomeEscola', e.target.value)}
                className={`cadastro-input ${errors.nomeEscola ? 'error' : ''}`}
              />
            </div>
            {errors.nomeEscola && <span className="error-text">{errors.nomeEscola}</span>}
          </div>

          <div className="input-group">
            <label htmlFor="turno" className="input-label">Turno</label>
            <div className="input-wrapper">
              <svg className="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12,6 12,12 16,14"/>
              </svg>
              <select
                id="turno"
                value={formData.turno}
                onChange={(e) => updateField('turno', e.target.value)}
                className={`cadastro-input ${errors.turno ? 'error' : ''}`}
              >
                <option value="">Selecione o turno</option>
                <option value="Manhã">Manhã</option>
                <option value="Tarde">Tarde</option>
                <option value="Noite">Noite</option>
              </select>
            </div>
            {errors.turno && <span className="error-text">{errors.turno}</span>}
          </div>
        </>
      )}

      {formData.nivelEnsino === "Ensino Superior" && (
        <>
          <div className="input-group">
            <label htmlFor="nomeInstituicao" className="input-label">Nome da Instituição</label>
            <div className="input-wrapper">
              <svg className="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                <path d="M6 12v5c3 3 9 3 12 0v-5"/>
              </svg>
              <input
                id="nomeInstituicao"
                type="text"
                placeholder="Nome da universidade/faculdade"
                value={formData.nomeInstituicao}
                onChange={(e) => updateField('nomeInstituicao', e.target.value)}
                className={`cadastro-input ${errors.nomeInstituicao ? 'error' : ''}`}
              />
            </div>
            {errors.nomeInstituicao && <span className="error-text">{errors.nomeInstituicao}</span>}
          </div>

          <div className="input-group">
            <label htmlFor="curso" className="input-label">Curso</label>
            <div className="input-wrapper">
              <svg className="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
              </svg>
              <input
                id="curso"
                type="text"
                placeholder="Nome do seu curso"
                value={formData.curso}
                onChange={(e) => updateField('curso', e.target.value)}
                className={`cadastro-input ${errors.curso ? 'error' : ''}`}
              />
            </div>
            {errors.curso && <span className="error-text">{errors.curso}</span>}
          </div>

          <div className="input-group">
            <label htmlFor="semestrePeriodo" className="input-label">Semestre/Período Atual</label>
            <div className="input-wrapper">
              <svg className="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              <input
                id="semestrePeriodo"
                type="text"
                placeholder="Ex: 5º semestre, 3º período"
                value={formData.semestrePeriodo}
                onChange={(e) => updateField('semestrePeriodo', e.target.value)}
                className={`cadastro-input ${errors.semestrePeriodo ? 'error' : ''}`}
              />
            </div>
            {errors.semestrePeriodo && <span className="error-text">{errors.semestrePeriodo}</span>}
          </div>

          <div className="input-group">
            <label htmlFor="modalidade" className="input-label">Modalidade</label>
            <div className="input-wrapper">
              <svg className="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                <line x1="8" y1="21" x2="16" y2="21"/>
                <line x1="12" y1="17" x2="12" y2="21"/>
              </svg>
              <select
                id="modalidade"
                value={formData.modalidade}
                onChange={(e) => updateField('modalidade', e.target.value)}
                className={`cadastro-input ${errors.modalidade ? 'error' : ''}`}
              >
                <option value="">Selecione a modalidade</option>
                <option value="Presencial">Presencial</option>
                <option value="EAD">EAD (Ensino à Distância)</option>
                <option value="Híbrido">Híbrido</option>
              </select>
            </div>
            {errors.modalidade && <span className="error-text">{errors.modalidade}</span>}
          </div>
        </>
      )}
    </div>
  );

  return (
    <div className="cadastro-aluno-container">
      <div className="cadastro-aluno-wrapper">
        {/* Header */}
        <div className="cadastro-header">
          <div className="logo-container">
            <div className="logo-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                <path d="M6 12v5c3 3 9 3 12 0v-5"/>
              </svg>
            </div>
            <h1 className="logo-text">LearnHub</h1>
          </div>
          <h2 className="cadastro-aluno-title">Criar Conta de Estudante</h2>
          <p className="cadastro-subtitle">Preencha os dados para criar sua conta</p>
        </div>

        {/* Progress Bar */}
        <div className="progress-container">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${(currentStep / 3) * 100}%` }}
            ></div>
          </div>
          <div className="progress-steps">
            <div className={`progress-step ${currentStep >= 1 ? 'active' : ''}`}>
              <span className="step-number">1</span>
              <span className="step-label">Dados Pessoais</span>
            </div>
            <div className={`progress-step ${currentStep >= 2 ? 'active' : ''}`}>
              <span className="step-number">2</span>
              <span className="step-label">Acesso</span>
            </div>
            <div className={`progress-step ${currentStep >= 3 ? 'active' : ''}`}>
              <span className="step-number">3</span>
              <span className="step-label">Acadêmicos</span>
            </div>
          </div>
        </div>

        {/* Form Container */}
        <div className="cadastro-aluno-box">
          <form onSubmit={handleCadastro} className="cadastro-form">
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}

            {/* Error message */}
            {errors.submit && (
              <div className="error-message">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="15" y1="9" x2="9" y2="15"/>
                  <line x1="9" y1="9" x2="15" y2="15"/>
                </svg>
                {errors.submit}
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="form-navigation">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="nav-button secondary"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="15,18 9,12 15,6"/>
                  </svg>
                  Anterior
                </button>
              )}

              {currentStep < 3 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="nav-button primary"
                >
                  Próximo
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="9,18 15,12 9,6"/>
                  </svg>
                </button>
              ) : (
                <button
                  type="submit"
                  className={`nav-button primary ${loading ? 'loading' : ''}`}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="spinner"></div>
                      Criando conta...
                    </>
                  ) : (
                    <>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                        <polyline points="22,4 12,14.01 9,11.01"/>
                      </svg>
                      Criar Conta
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="cadastro-footer">
          <p>
            Já tem uma conta?{' '}
            <button
              type="button"
              onClick={() => navigate('/login-aluno')}
              className="link-button inline"
            >
              Faça login aqui
            </button>
          </p>
          <button
            type="button"
            onClick={() => navigate('/home')}
            className="link-button"
          >
            Voltar ao início
          </button>
        </div>
      </div>
    </div>
  );
}

export default CadastroAluno;