import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db, auth } from "../../firebaseConfig";
import { createUserWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { collection, setDoc, doc, getDocs, query, where } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FaUser, 
  FaCalendarAlt, 
  FaIdCard, 
  FaPhone, 
  FaEnvelope, 
  FaLock, 
  FaEye, 
  FaEyeSlash, 
  FaArrowLeft, 
  FaArrowRight, 
  FaCheck, 
  FaGraduationCap, 
  FaUniversity, 
  FaBook,
  FaClock,
  FaShieldAlt,
  FaRedo
} from "react-icons/fa";

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
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.senha);
      const user = userCredential.user;

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
    <div className="flex flex-col gap-4">
      <h3 className="font-display text-lg font-bold text-on-surface mb-2">Dados Pessoais</h3>
      
      {/* Nome Completo */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="nomeCompleto" className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Nome Completo</label>
        <div className="relative">
          <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm" />
          <input
            id="nomeCompleto"
            type="text"
            placeholder="Digite seu nome completo"
            value={formData.nomeCompleto}
            onChange={(e) => updateField('nomeCompleto', e.target.value)}
            className={`w-full pl-11 pr-4 py-3 bg-surface-container-low dark:bg-surface-container border ${errors.nomeCompleto ? 'border-error' : 'border-outline-variant/20'} rounded-2xl text-body-md focus:ring-2 focus:ring-primary focus:outline-none transition-all dark:text-white`}
          />
        </div>
        {errors.nomeCompleto && <span className="text-xs font-semibold text-error mt-0.5">{errors.nomeCompleto}</span>}
      </div>

      {/* Data Nascimento */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="dataNascimento" className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Data de Nascimento</label>
        <div className="relative">
          <FaCalendarAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm" />
          <input
            id="dataNascimento"
            type="date"
            value={formData.dataNascimento}
            onChange={(e) => updateField('dataNascimento', e.target.value)}
            className={`w-full pl-11 pr-4 py-3 bg-surface-container-low dark:bg-surface-container border ${errors.dataNascimento ? 'border-error' : 'border-outline-variant/20'} rounded-2xl text-body-md focus:ring-2 focus:ring-primary focus:outline-none transition-all dark:text-white`}
          />
        </div>
        {errors.dataNascimento && <span className="text-xs font-semibold text-error mt-0.5">{errors.dataNascimento}</span>}
      </div>

      {/* CPF */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="cpf" className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">CPF</label>
        <div className="relative">
          <FaIdCard className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm" />
          <input
            id="cpf"
            type="text"
            placeholder="000.000.000-00"
            value={formData.cpf}
            onChange={(e) => updateField('cpf', formatCPF(e.target.value))}
            className={`w-full pl-11 pr-4 py-3 bg-surface-container-low dark:bg-surface-container border ${errors.cpf ? 'border-error' : 'border-outline-variant/20'} rounded-2xl text-body-md focus:ring-2 focus:ring-primary focus:outline-none transition-all dark:text-white`}
            maxLength="14"
          />
        </div>
        {errors.cpf && <span className="text-xs font-semibold text-error mt-0.5">{errors.cpf}</span>}
      </div>

      {/* Telefone */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="telefone" className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Telefone</label>
        <div className="relative">
          <FaPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm" />
          <input
            id="telefone"
            type="text"
            placeholder="(00) 00000-0000"
            value={formData.telefone}
            onChange={(e) => updateField('telefone', formatTelefone(e.target.value))}
            className={`w-full pl-11 pr-4 py-3 bg-surface-container-low dark:bg-surface-container border ${errors.telefone ? 'border-error' : 'border-outline-variant/20'} rounded-2xl text-body-md focus:ring-2 focus:ring-primary focus:outline-none transition-all dark:text-white`}
            maxLength="15"
          />
        </div>
        {errors.telefone && <span className="text-xs font-semibold text-error mt-0.5">{errors.telefone}</span>}
      </div>

      {/* Email Contato */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="emailContato" className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Email para Contato</label>
        <div className="relative">
          <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm" />
          <input
            id="emailContato"
            type="email"
            placeholder="seu.email@exemplo.com"
            value={formData.emailContato}
            onChange={(e) => updateField('emailContato', e.target.value)}
            className={`w-full pl-11 pr-4 py-3 bg-surface-container-low dark:bg-surface-container border ${errors.emailContato ? 'border-error' : 'border-outline-variant/20'} rounded-2xl text-body-md focus:ring-2 focus:ring-primary focus:outline-none transition-all dark:text-white`}
          />
        </div>
        {errors.emailContato && <span className="text-xs font-semibold text-error mt-0.5">{errors.emailContato}</span>}
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="flex flex-col gap-4">
      <h3 className="font-display text-lg font-bold text-on-surface mb-2">Dados de Acesso</h3>
      
      {/* Email Login */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Email de Login</label>
        <div className="relative">
          <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm" />
          <input
            id="email"
            type="email"
            placeholder="Email para fazer login"
            value={formData.email}
            onChange={(e) => updateField('email', e.target.value)}
            className={`w-full pl-11 pr-4 py-3 bg-surface-container-low dark:bg-surface-container border ${errors.email ? 'border-error' : 'border-outline-variant/20'} rounded-2xl text-body-md focus:ring-2 focus:ring-primary focus:outline-none transition-all dark:text-white`}
          />
        </div>
        {errors.email && <span className="text-xs font-semibold text-error mt-0.5">{errors.email}</span>}
      </div>

      {/* Senha */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="senha" className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Senha</label>
        <div className="relative">
          <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm" />
          <input
            id="senha"
            type={showPassword ? "text" : "password"}
            placeholder="Mínimo 6 caracteres"
            value={formData.senha}
            onChange={(e) => updateField('senha', e.target.value)}
            className={`w-full pl-11 pr-11 py-3 bg-surface-container-low dark:bg-surface-container border ${errors.senha ? 'border-error' : 'border-outline-variant/20'} rounded-2xl text-body-md focus:ring-2 focus:ring-primary focus:outline-none transition-all dark:text-white`}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors"
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>
        {errors.senha && <span className="text-xs font-semibold text-error mt-0.5">{errors.senha}</span>}
      </div>

      {/* Confirmar Senha */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="confirmSenha" className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Confirmar Senha</label>
        <div className="relative">
          <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm" />
          <input
            id="confirmSenha"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Digite a senha novamente"
            value={formData.confirmSenha}
            onChange={(e) => updateField('confirmSenha', e.target.value)}
            className={`w-full pl-11 pr-11 py-3 bg-surface-container-low dark:bg-surface-container border ${errors.confirmSenha ? 'border-error' : 'border-outline-variant/20'} rounded-2xl text-body-md focus:ring-2 focus:ring-primary focus:outline-none transition-all dark:text-white`}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors"
          >
            {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>
        {errors.confirmSenha && <span className="text-xs font-semibold text-error mt-0.5">{errors.confirmSenha}</span>}
      </div>

      {/* Matrícula */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="matricula" className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Matrícula</label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <FaIdCard className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm" />
            <input
              id="matricula"
              type="text"
              placeholder="Gere uma matrícula..."
              value={formData.matricula}
              readOnly
              className={`w-full pl-11 pr-4 py-3 bg-surface-container-low dark:bg-surface-container border ${errors.matricula ? 'border-error' : 'border-outline-variant/20'} rounded-2xl text-body-md focus:ring-2 focus:outline-none cursor-not-allowed dark:text-white font-mono font-bold text-primary`}
            />
          </div>
          <button
            type="button"
            onClick={gerarMatricula}
            className="px-5 bg-primary/10 border border-primary/20 text-primary hover:bg-primary/25 rounded-2xl font-bold flex items-center justify-center gap-2 transition-colors active:scale-95 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div> : <><FaRedo className="text-xs" /><span>Gerar</span></>}
          </button>
        </div>
        {errors.matricula && <span className="text-xs font-semibold text-error mt-0.5">{errors.matricula}</span>}
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="flex flex-col gap-4">
      <h3 className="font-display text-lg font-bold text-on-surface mb-2">Dados Acadêmicos</h3>
      
      {/* Nivel de Ensino */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="nivelEnsino" className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Nível de Ensino</label>
        <div className="relative">
          <FaGraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm" />
          <select
            id="nivelEnsino"
            value={formData.nivelEnsino}
            onChange={(e) => updateField('nivelEnsino', e.target.value)}
            className={`w-full pl-11 pr-4 py-3 bg-surface-container-low dark:bg-surface-container border ${errors.nivelEnsino ? 'border-error' : 'border-outline-variant/20'} rounded-2xl text-body-md focus:ring-2 focus:ring-primary focus:outline-none transition-all dark:text-white appearance-none`}
          >
            <option value="">Selecione o nível de ensino</option>
            <option value="Ensino Fundamental">Ensino Fundamental</option>
            <option value="Ensino Médio">Ensino Médio</option>
            <option value="Ensino Superior">Ensino Superior</option>
          </select>
        </div>
        {errors.nivelEnsino && <span className="text-xs font-semibold text-error mt-0.5">{errors.nivelEnsino}</span>}
      </div>

      {/* Fundamental e Médio */}
      {(formData.nivelEnsino === "Ensino Fundamental" || formData.nivelEnsino === "Ensino Médio") && (
        <motion.div 
          className="flex flex-col gap-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Ano Serie */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="anoSerie" className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Ano/Série Atual</label>
            <div className="relative">
              <FaBook className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm" />
              <input
                id="anoSerie"
                type="text"
                placeholder="Ex: 9º ano, 2º ano"
                value={formData.anoSerie}
                onChange={(e) => updateField('anoSerie', e.target.value)}
                className={`w-full pl-11 pr-4 py-3 bg-surface-container-low dark:bg-surface-container border ${errors.anoSerie ? 'border-error' : 'border-outline-variant/20'} rounded-2xl text-body-md focus:ring-2 focus:ring-primary focus:outline-none transition-all dark:text-white`}
              />
            </div>
            {errors.anoSerie && <span className="text-xs font-semibold text-error mt-0.5">{errors.anoSerie}</span>}
          </div>

          {/* Nome Escola */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="nomeEscola" className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Nome da Escola</label>
            <div className="relative">
              <FaUniversity className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm" />
              <input
                id="nomeEscola"
                type="text"
                placeholder="Nome da sua escola"
                value={formData.nomeEscola}
                onChange={(e) => updateField('nomeEscola', e.target.value)}
                className={`w-full pl-11 pr-4 py-3 bg-surface-container-low dark:bg-surface-container border ${errors.nomeEscola ? 'border-error' : 'border-outline-variant/20'} rounded-2xl text-body-md focus:ring-2 focus:ring-primary focus:outline-none transition-all dark:text-white`}
              />
            </div>
            {errors.nomeEscola && <span className="text-xs font-semibold text-error mt-0.5">{errors.nomeEscola}</span>}
          </div>

          {/* Turno */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="turno" className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Turno</label>
            <div className="relative">
              <FaClock className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm" />
              <select
                id="turno"
                value={formData.turno}
                onChange={(e) => updateField('turno', e.target.value)}
                className={`w-full pl-11 pr-4 py-3 bg-surface-container-low dark:bg-surface-container border ${errors.turno ? 'border-error' : 'border-outline-variant/20'} rounded-2xl text-body-md focus:ring-2 focus:ring-primary focus:outline-none transition-all dark:text-white appearance-none`}
              >
                <option value="">Selecione o turno</option>
                <option value="Manhã">Manhã</option>
                <option value="Tarde">Tarde</option>
                <option value="Noite">Noite</option>
              </select>
            </div>
            {errors.turno && <span className="text-xs font-semibold text-error mt-0.5">{errors.turno}</span>}
          </div>
        </motion.div>
      )}

      {/* Ensino Superior */}
      {formData.nivelEnsino === "Ensino Superior" && (
        <motion.div 
          className="flex flex-col gap-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Nome Instituição */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="nomeInstituicao" className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Nome da Instituição</label>
            <div className="relative">
              <FaUniversity className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm" />
              <input
                id="nomeInstituicao"
                type="text"
                placeholder="Nome da universidade/faculdade"
                value={formData.nomeInstituicao}
                onChange={(e) => updateField('nomeInstituicao', e.target.value)}
                className={`w-full pl-11 pr-4 py-3 bg-surface-container-low dark:bg-surface-container border ${errors.nomeInstituicao ? 'border-error' : 'border-outline-variant/20'} rounded-2xl text-body-md focus:ring-2 focus:ring-primary focus:outline-none transition-all dark:text-white`}
              />
            </div>
            {errors.nomeInstituicao && <span className="text-xs font-semibold text-error mt-0.5">{errors.nomeInstituicao}</span>}
          </div>

          {/* Curso */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="curso" className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Curso</label>
            <div className="relative">
              <FaBook className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm" />
              <input
                id="curso"
                type="text"
                placeholder="Nome do seu curso"
                value={formData.curso}
                onChange={(e) => updateField('curso', e.target.value)}
                className={`w-full pl-11 pr-4 py-3 bg-surface-container-low dark:bg-surface-container border ${errors.curso ? 'border-error' : 'border-outline-variant/20'} rounded-2xl text-body-md focus:ring-2 focus:ring-primary focus:outline-none transition-all dark:text-white`}
              />
            </div>
            {errors.curso && <span className="text-xs font-semibold text-error mt-0.5">{errors.curso}</span>}
          </div>

          {/* Semestre Periodo */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="semestrePeriodo" className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Semestre/Período Atual</label>
            <div className="relative">
              <FaCalendarAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm" />
              <input
                id="semestrePeriodo"
                type="text"
                placeholder="Ex: 5º semestre, 3º período"
                value={formData.semestrePeriodo}
                onChange={(e) => updateField('semestrePeriodo', e.target.value)}
                className={`w-full pl-11 pr-4 py-3 bg-surface-container-low dark:bg-surface-container border ${errors.semestrePeriodo ? 'border-error' : 'border-outline-variant/20'} rounded-2xl text-body-md focus:ring-2 focus:ring-primary focus:outline-none transition-all dark:text-white`}
              />
            </div>
            {errors.semestrePeriodo && <span className="text-xs font-semibold text-error mt-0.5">{errors.semestrePeriodo}</span>}
          </div>

          {/* Modalidade */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="modalidade" className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Modalidade</label>
            <div className="relative">
              <FaClock className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm" />
              <select
                id="modalidade"
                value={formData.modalidade}
                onChange={(e) => updateField('modalidade', e.target.value)}
                className={`w-full pl-11 pr-4 py-3 bg-surface-container-low dark:bg-surface-container border ${errors.modalidade ? 'border-error' : 'border-outline-variant/20'} rounded-2xl text-body-md focus:ring-2 focus:ring-primary focus:outline-none transition-all dark:text-white appearance-none`}
              >
                <option value="">Selecione a modalidade</option>
                <option value="Presencial">Presencial</option>
                <option value="EAD">EAD (Ensino à Distância)</option>
                <option value="Híbrido">Híbrido</option>
              </select>
            </div>
            {errors.modalidade && <span className="text-xs font-semibold text-error mt-0.5">{errors.modalidade}</span>}
          </div>
        </motion.div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-on-surface flex items-center justify-center p-6 relative overflow-hidden font-body-md">
      {/* Efeitos de fundo */}
      <div className="bg-effects">
        <div className="particle particle-1"></div>
        <div className="particle particle-2"></div>
      </div>

      <motion.div 
        className="max-w-xl w-full z-10 my-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="glass-card p-8 sm:p-10 rounded-[32px] border border-outline-variant/30 shadow-xl flex flex-col">
          
          {/* Header */}
          <div className="flex flex-col items-center mb-8 text-center">
            <motion.div 
              className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary to-secondary text-on-primary flex items-center justify-center mb-4 text-2xl shadow-md"
              whileHover={{ scale: 1.05 }}
            >
              <FaGraduationCap />
            </motion.div>
            <h1 className="font-display text-3xl font-extrabold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-1">LearnHub</h1>
            <h2 className="text-sm font-bold text-on-surface-variant uppercase tracking-wider">Criar Conta de Estudante</h2>
            <p className="text-xs text-on-surface-variant/80 mt-1">Preencha as informações necessárias para se registrar</p>
          </div>

          {/* Stepper Progress Visualizer */}
          <div className="flex items-center justify-between w-full mb-10 relative">
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-surface-container-high dark:bg-surface-container -translate-y-1/2 -z-10 rounded-full">
              <motion.div 
                className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
                animate={{ width: `${((currentStep - 1) / 2) * 100}%` }}
                transition={{ duration: 0.3 }}
              ></motion.div>
            </div>
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex flex-col items-center">
                <div 
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                    currentStep === step 
                      ? 'bg-primary text-on-primary ring-4 ring-primary/20 scale-110' 
                      : currentStep > step 
                      ? 'bg-secondary text-on-secondary' 
                      : 'bg-surface-container-high dark:bg-surface-container text-on-surface-variant'
                  }`}
                >
                  {currentStep > step ? <FaCheck className="text-xs" /> : step}
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-wider mt-2 transition-colors duration-300 ${currentStep === step ? 'text-primary' : 'text-on-surface-variant/80'}`}>
                  {step === 1 ? 'Pessoal' : step === 2 ? 'Acesso' : 'Acadêmico'}
                </span>
              </div>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleCadastro} className="flex-1 flex flex-col gap-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                transition={{ duration: 0.25 }}
              >
                {currentStep === 1 && renderStep1()}
                {currentStep === 2 && renderStep2()}
                {currentStep === 3 && renderStep3()}
              </motion.div>
            </AnimatePresence>

            {/* Error Message */}
            <AnimatePresence>
              {errors.submit && (
                <motion.div 
                  className="flex items-center gap-2 text-xs font-bold text-error bg-error/10 border border-error/20 p-3.5 rounded-2xl"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <FaShieldAlt className="text-sm shrink-0" />
                  <span>{errors.submit}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation buttons */}
            <div className="flex gap-4 mt-4">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="flex-1 py-3.5 border border-outline-variant/30 text-on-surface-variant hover:text-on-surface hover:border-on-surface-variant font-bold rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-all text-sm"
                >
                  <FaArrowLeft />
                  <span>Anterior</span>
                </button>
              )}

              {currentStep < 3 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="flex-1 py-3.5 bg-primary text-on-primary hover:bg-primary/95 font-bold rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-all text-sm shadow-md"
                >
                  <span>Próximo</span>
                  <FaArrowRight />
                </button>
              ) : (
                <button
                  type="submit"
                  className="flex-1 py-3.5 bg-gradient-to-r from-primary to-secondary text-on-primary font-bold rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-all text-sm shadow-md disabled:opacity-50"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-on-primary border-t-transparent rounded-full animate-spin"></div>
                      <span>Criando conta...</span>
                    </>
                  ) : (
                    <>
                      <FaCheck />
                      <span>Concluir Cadastro</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </form>

          {/* Footer */}
          <div className="flex flex-col items-center gap-3 mt-8 pt-6 border-t border-outline-variant/20">
            <p className="text-sm text-on-surface-variant">
              Já tem uma conta?{" "}
              <button
                type="button"
                onClick={() => navigate('/login-aluno')}
                className="text-primary font-bold hover:underline inline"
              >
                Faça login aqui
              </button>
            </p>
            <button
              type="button"
              onClick={() => navigate('/home')}
              className="text-xs text-on-surface-variant/80 hover:text-on-surface font-semibold flex items-center gap-1 transition-colors"
            >
              <FaArrowLeft className="text-[10px]" />
              <span>Voltar ao início</span>
            </button>
          </div>

        </div>
      </motion.div>
    </div>
  );
}

export default CadastroAluno;