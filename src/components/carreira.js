import React, { useState, useEffect } from 'react';
import './carreira.css';
import {
  FaGraduationCap,
  FaFile,
  FaBriefcase,
  FaUsers,
  FaBullseye,
  FaPlus,
  FaTrash,
  FaSave,
  FaLinkedin,
  FaCalendar,
  FaCheck,
  FaClock,
  FaTimes,
  FaDownload,
  FaEye,
  FaUser,
  FaClipboardList,
  FaLightbulb,
  FaBolt,
  FaChartBar,
  FaComments
} from 'react-icons/fa';

const ModuloCarreira = () => {
  const [activeTab, setActiveTab] = useState('curriculo');
  const [modalCVAberto, setModalCVAberto] = useState(false);
  
  // Estados para Currículo
  const [curriculoData, setCurriculoData] = useState({
    // Dados Pessoais
    nomeCompleto: '',
    email: '',
    telefone: '',
    endereco: '',
    cidade: '',
    estado: '',
    cep: '',
    dataNascimento: '',
    estadoCivil: '',
    
    // Objetivo Profissional
    objetivoProfissional: '',
    
    // Formação Acadêmica
    formacoes: [],
    
    // Experiência Profissional
    experiencias: [],
    
    // Cursos e Certificações
    cursos: [],
    
    // Habilidades
    habilidades: [],
    
    // Idiomas
    idiomas: []
  });

  // Funções para atualização do currículo
  const updateCurriculoField = (campo, valor) => {
    setCurriculoData(prev => ({
      ...prev,
      [campo]: valor
    }));
  };

  const addItemToArray = (campo, item) => {
    setCurriculoData(prev => ({
      ...prev,
      [campo]: [...prev[campo], { ...item, id: Date.now() }]
    }));
  };

  const removeItemFromArray = (campo, id) => {
    setCurriculoData(prev => ({
      ...prev,
      [campo]: prev[campo].filter(item => item.id !== id)
    }));
  };

  // Estados para Gerenciador de Estágios
  const [candidaturas, setCandidaturas] = useState([]);

  // Estados para Plano de Desenvolvimento
  const [metas, setMetas] = useState({
    curtoPrazo: [],
    longoPrazo: []
  });

  // Carregar dados do localStorage
  useEffect(() => {
    const savedCurriculo = localStorage.getItem('carreira_curriculo');
    const savedCandidaturas = localStorage.getItem('carreira_candidaturas');
    const savedMetas = localStorage.getItem('carreira_metas');

    if (savedCurriculo) setCurriculoData(JSON.parse(savedCurriculo));
    if (savedCandidaturas) setCandidaturas(JSON.parse(savedCandidaturas));
    if (savedMetas) setMetas(JSON.parse(savedMetas));
  }, []);

  // Salvar dados
  const salvarDados = () => {
    localStorage.setItem('carreira_curriculo', JSON.stringify(curriculoData));
    localStorage.setItem('carreira_candidaturas', JSON.stringify(candidaturas));
    localStorage.setItem('carreira_metas', JSON.stringify(metas));
    alert('Dados salvos com sucesso!');
  };

  const tabs = [
    { id: 'curriculo', nome: 'Gerador de CV', icone: FaFile },
    { id: 'estagios', nome: 'Estágios & Trainees', icone: FaBriefcase },
    { id: 'networking', nome: 'Networking', icone: FaUsers },
    { id: 'desenvolvimento', nome: 'Plano de Desenvolvimento', icone: FaBullseye }
  ];

  // COMPONENTE: Gerador de CV
  const GeradorCV = () => {
    // Estados locais simples
    const [dadosPessoais, setDadosPessoais] = useState({
      nomeCompleto: curriculoData.nomeCompleto || '',
      email: curriculoData.email || '',
      telefone: curriculoData.telefone || '',
      endereco: curriculoData.endereco || '',
      cidade: curriculoData.cidade || '',
      estado: curriculoData.estado || '',
      cep: curriculoData.cep || '',
      dataNascimento: curriculoData.dataNascimento || '',
      estadoCivil: curriculoData.estadoCivil || ''
    });

    const [objetivo, setObjetivo] = useState(curriculoData.objetivoProfissional || '');
    const [novaHabilidade, setNovaHabilidade] = useState('');

    // Formulários para adicionar itens
    const [novaFormacao, setNovaFormacao] = useState({
      curso: '',
      instituicao: '',
      inicio: '',
      fim: '',
      status: 'concluido'
    });

    const [novaExperiencia, setNovaExperiencia] = useState({
      cargo: '',
      empresa: '',
      inicio: '',
      fim: '',
      atual: false,
      descricao: ''
    });

    const [novoCurso, setNovoCurso] = useState({
      nome: '',
      instituicao: '',
      cargaHoraria: '',
      ano: ''
    });

    const [novoIdioma, setNovoIdioma] = useState({
      idioma: '',
      nivel: 'basico'
    });

    // Handlers simples
    const handleDadosChange = (campo, valor) => {
      setDadosPessoais(prev => ({ ...prev, [campo]: valor }));
      updateCurriculoField(campo, valor);
    };

    const handleObjetivoChange = (valor) => {
      setObjetivo(valor);
      updateCurriculoField('objetivoProfissional', valor);
    };

    const adicionarHabilidade = () => {
      if (novaHabilidade.trim()) {
        addItemToArray('habilidades', { nome: novaHabilidade.trim() });
        setNovaHabilidade('');
      }
    };

    const adicionarFormacao = () => {
      if (novaFormacao.curso && novaFormacao.instituicao) {
        addItemToArray('formacoes', novaFormacao);
        setNovaFormacao({ curso: '', instituicao: '', inicio: '', fim: '', status: 'concluido' });
      }
    };

    const adicionarExperiencia = () => {
      if (novaExperiencia.cargo && novaExperiencia.empresa) {
        addItemToArray('experiencias', novaExperiencia);
        setNovaExperiencia({ cargo: '', empresa: '', inicio: '', fim: '', atual: false, descricao: '' });
      }
    };

    const adicionarCurso = () => {
      if (novoCurso.nome) {
        addItemToArray('cursos', novoCurso);
        setNovoCurso({ nome: '', instituicao: '', cargaHoraria: '', ano: '' });
      }
    };

    const adicionarIdioma = () => {
      if (novoIdioma.idioma) {
        addItemToArray('idiomas', novoIdioma);
        setNovoIdioma({ idioma: '', nivel: 'basico' });
      }
    };

    return (
      <div className="feature-content">
        <div className="feature-header">
          <h2><FaFile /> Gerador de Currículo</h2>
          <p>Crie seu currículo profissional de forma simples e organizada</p>
        </div>

        <div className="cv-builder">
          {/* Dados Pessoais */}
          <div className="cv-section">
            <h3><FaUser /> Dados Pessoais</h3>
            <div className="form-grid">
              <input
                type="text"
                placeholder="Nome completo"
                value={dadosPessoais.nomeCompleto}
                onChange={(e) => handleDadosChange('nomeCompleto', e.target.value)}
              />
              <input
                type="email"
                placeholder="E-mail"
                value={dadosPessoais.email}
                onChange={(e) => handleDadosChange('email', e.target.value)}
              />
              <input
                type="tel"
                placeholder="Telefone"
                value={dadosPessoais.telefone}
                onChange={(e) => handleDadosChange('telefone', e.target.value)}
              />
              <input
                type="date"
                placeholder="Data de nascimento"
                value={dadosPessoais.dataNascimento}
                onChange={(e) => handleDadosChange('dataNascimento', e.target.value)}
              />
              <input
                type="text"
                placeholder="Endereço"
                value={dadosPessoais.endereco}
                onChange={(e) => handleDadosChange('endereco', e.target.value)}
                style={{ gridColumn: '1 / -1' }}
              />
              <input
                type="text"
                placeholder="Cidade"
                value={dadosPessoais.cidade}
                onChange={(e) => handleDadosChange('cidade', e.target.value)}
              />
              <input
                type="text"
                placeholder="Estado"
                value={dadosPessoais.estado}
                onChange={(e) => handleDadosChange('estado', e.target.value)}
              />
              <input
                type="text"
                placeholder="CEP"
                value={dadosPessoais.cep}
                onChange={(e) => handleDadosChange('cep', e.target.value)}
              />
              <select
                value={dadosPessoais.estadoCivil}
                onChange={(e) => handleDadosChange('estadoCivil', e.target.value)}
              >
                <option value="">Estado civil</option>
                <option value="solteiro">Solteiro(a)</option>
                <option value="casado">Casado(a)</option>
                <option value="divorciado">Divorciado(a)</option>
                <option value="viuvo">Viúvo(a)</option>
              </select>
            </div>
          </div>

          {/* Objetivo Profissional */}
          <div className="cv-section">
            <h3><FaBullseye /> Objetivo Profissional</h3>
            <textarea
              placeholder="Descreva seu objetivo profissional..."
              rows="3"
              value={objetivo}
              onChange={(e) => handleObjetivoChange(e.target.value)}
            />
          </div>

          {/* Formação Acadêmica */}
          <div className="cv-section">
            <h3><FaGraduationCap /> Formação Acadêmica</h3>
            
            <div className="add-item-form">
              <div className="form-grid">
                <input
                  type="text"
                  placeholder="Curso"
                  value={novaFormacao.curso}
                  onChange={(e) => setNovaFormacao(prev => ({ ...prev, curso: e.target.value }))}
                />
                <input
                  type="text"
                  placeholder="Instituição"
                  value={novaFormacao.instituicao}
                  onChange={(e) => setNovaFormacao(prev => ({ ...prev, instituicao: e.target.value }))}
                />
                <input
                  type="text"
                  placeholder="Ano de início"
                  value={novaFormacao.inicio}
                  onChange={(e) => setNovaFormacao(prev => ({ ...prev, inicio: e.target.value }))}
                />
                <input
                  type="text"
                  placeholder="Ano de conclusão"
                  value={novaFormacao.fim}
                  onChange={(e) => setNovaFormacao(prev => ({ ...prev, fim: e.target.value }))}
                />
                <select
                  value={novaFormacao.status}
                  onChange={(e) => setNovaFormacao(prev => ({ ...prev, status: e.target.value }))}
                >
                  <option value="concluido">Concluído</option>
                  <option value="cursando">Cursando</option>
                  <option value="trancado">Trancado</option>
                </select>
              </div>
              <button className="btn-add" onClick={adicionarFormacao}>
                <FaPlus /> Adicionar Formação
              </button>
            </div>

            {curriculoData.formacoes.length > 0 && (
              <div className="items-list">
                {curriculoData.formacoes.map(formacao => (
                  <div key={formacao.id} className="list-item">
                    <div className="item-content">
                      <h4>{formacao.curso}</h4>
                      <p>{formacao.instituicao}</p>
                      <small>{formacao.inicio} - {formacao.fim} ({formacao.status})</small>
                    </div>
                    <button 
                      className="btn-remove"
                      onClick={() => removeItemFromArray('formacoes', formacao.id)}
                    >
                      <FaTrash />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Experiência Profissional */}
          <div className="cv-section">
            <h3><FaBriefcase /> Experiência Profissional</h3>
            
            <div className="add-item-form">
              <div className="form-grid">
                <input
                  type="text"
                  placeholder="Cargo"
                  value={novaExperiencia.cargo}
                  onChange={(e) => setNovaExperiencia(prev => ({ ...prev, cargo: e.target.value }))}
                />
                <input
                  type="text"
                  placeholder="Empresa"
                  value={novaExperiencia.empresa}
                  onChange={(e) => setNovaExperiencia(prev => ({ ...prev, empresa: e.target.value }))}
                />
                <input
                  type="text"
                  placeholder="Início (mês/ano)"
                  value={novaExperiencia.inicio}
                  onChange={(e) => setNovaExperiencia(prev => ({ ...prev, inicio: e.target.value }))}
                />
                <input
                  type="text"
                  placeholder="Fim (mês/ano)"
                  value={novaExperiencia.fim}
                  onChange={(e) => setNovaExperiencia(prev => ({ ...prev, fim: e.target.value }))}
                  disabled={novaExperiencia.atual}
                />
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={novaExperiencia.atual}
                    onChange={(e) => setNovaExperiencia(prev => ({ 
                      ...prev, 
                      atual: e.target.checked,
                      fim: e.target.checked ? '' : prev.fim
                    }))}
                  />
                  Trabalho atual
                </label>
              </div>
              <textarea
                placeholder="Descrição das atividades (opcional)"
                rows="2"
                value={novaExperiencia.descricao}
                onChange={(e) => setNovaExperiencia(prev => ({ ...prev, descricao: e.target.value }))}
              />
              <button className="btn-add" onClick={adicionarExperiencia}>
                <FaPlus /> Adicionar Experiência
              </button>
            </div>

            {curriculoData.experiencias.length > 0 && (
              <div className="items-list">
                {curriculoData.experiencias.map(exp => (
                  <div key={exp.id} className="list-item">
                    <div className="item-content">
                      <h4>{exp.cargo}</h4>
                      <p>{exp.empresa}</p>
                      <small>{exp.inicio} - {exp.atual ? 'Atual' : exp.fim}</small>
                      {exp.descricao && <p className="description">{exp.descricao}</p>}
                    </div>
                    <button 
                      className="btn-remove"
                      onClick={() => removeItemFromArray('experiencias', exp.id)}
                    >
                      <FaTrash />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Habilidades */}
          <div className="cv-section">
            <h3><FaBolt /> Habilidades</h3>
            
            <div className="skills-input">
              <input
                type="text"
                placeholder="Digite uma habilidade"
                value={novaHabilidade}
                onChange={(e) => setNovaHabilidade(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    adicionarHabilidade();
                  }
                }}
              />
              <button className="btn-add" onClick={adicionarHabilidade}>
                <FaPlus /> Adicionar
              </button>
            </div>

            {curriculoData.habilidades.length > 0 && (
              <div className="skills-tags">
                {curriculoData.habilidades.map(skill => (
                  <span key={skill.id} className="skill-tag">
                    {skill.nome}
                    <button 
                      onClick={() => removeItemFromArray('habilidades', skill.id)}
                      className="remove-skill"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Cursos e Certificações */}
          <div className="cv-section">
            <h3><FaFile /> Cursos e Certificações</h3>
            
            <div className="add-item-form">
              <div className="form-grid">
                <input
                  type="text"
                  placeholder="Nome do curso"
                  value={novoCurso.nome}
                  onChange={(e) => setNovoCurso(prev => ({ ...prev, nome: e.target.value }))}
                />
                <input
                  type="text"
                  placeholder="Instituição"
                  value={novoCurso.instituicao}
                  onChange={(e) => setNovoCurso(prev => ({ ...prev, instituicao: e.target.value }))}
                />
                <input
                  type="text"
                  placeholder="Carga horária"
                  value={novoCurso.cargaHoraria}
                  onChange={(e) => setNovoCurso(prev => ({ ...prev, cargaHoraria: e.target.value }))}
                />
                <input
                  type="text"
                  placeholder="Ano"
                  value={novoCurso.ano}
                  onChange={(e) => setNovoCurso(prev => ({ ...prev, ano: e.target.value }))}
                />
              </div>
              <button className="btn-add" onClick={adicionarCurso}>
                <FaPlus /> Adicionar Curso
              </button>
            </div>

            {curriculoData.cursos.length > 0 && (
              <div className="items-list">
                {curriculoData.cursos.map(curso => (
                  <div key={curso.id} className="list-item">
                    <div className="item-content">
                      <h4>{curso.nome}</h4>
                      <p>{curso.instituicao}</p>
                      <small>{curso.cargaHoraria} - {curso.ano}</small>
                    </div>
                    <button 
                      className="btn-remove"
                      onClick={() => removeItemFromArray('cursos', curso.id)}
                    >
                      <FaTrash />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Idiomas */}
          <div className="cv-section">
            <h3><FaComments /> Idiomas</h3>
            
            <div className="add-item-form">
              <div className="form-grid">
                <input
                  type="text"
                  placeholder="Idioma"
                  value={novoIdioma.idioma}
                  onChange={(e) => setNovoIdioma(prev => ({ ...prev, idioma: e.target.value }))}
                />
                <select
                  value={novoIdioma.nivel}
                  onChange={(e) => setNovoIdioma(prev => ({ ...prev, nivel: e.target.value }))}
                >
                  <option value="basico">Básico</option>
                  <option value="intermediario">Intermediário</option>
                  <option value="avancado">Avançado</option>
                  <option value="fluente">Fluente</option>
                  <option value="nativo">Nativo</option>
                </select>
              </div>
              <button className="btn-add" onClick={adicionarIdioma}>
                <FaPlus /> Adicionar Idioma
              </button>
            </div>

            {curriculoData.idiomas.length > 0 && (
              <div className="items-list">
                {curriculoData.idiomas.map(idioma => (
                  <div key={idioma.id} className="list-item">
                    <div className="item-content">
                      <h4>{idioma.idioma}</h4>
                      <p>Nível: {idioma.nivel}</p>
                    </div>
                    <button 
                      className="btn-remove"
                      onClick={() => removeItemFromArray('idiomas', idioma.id)}
                    >
                      <FaTrash />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Botões de Ação */}
          <div className="cv-actions">
            <button className="btn-primary" onClick={salvarDados}>
              <FaSave /> Salvar Currículo
            </button>
            <button className="btn-secondary" onClick={() => setModalCVAberto(true)}>
              <FaEye /> Visualizar CV
            </button>
            <button className="btn-secondary">
              <FaDownload /> Baixar PDF
            </button>
          </div>
        </div>
      </div>
    );
  };

  // COMPONENTE: Gerenciador de Estágios
  const GerenciadorEstagios = () => {
    const [novaCandidatura, setNovaCandidatura] = useState({
      empresa: '',
      vaga: '',
      dataEnvio: '',
      fase: 'enviado',
      observacoes: ''
    });

    // Funções para candidatura
    const updateCandidatura = (campo, valor) => {
      setNovaCandidatura(prev => ({ ...prev, [campo]: valor }));
    };

    const adicionarCandidatura = () => {
      if (novaCandidatura.empresa && novaCandidatura.vaga) {
        setCandidaturas(prev => [...prev, { ...novaCandidatura, id: Date.now() }]);
        setNovaCandidatura({ empresa: '', vaga: '', dataEnvio: '', fase: 'enviado', observacoes: '' });
      }
    };

    const fases = [
      { value: 'enviado', label: 'Enviado', icon: FaClock, color: '#f59e0b' },
      { value: 'entrevista', label: 'Entrevista', icon: FaUsers, color: '#3b82f6' },
      { value: 'aprovado', label: 'Aprovado', icon: FaCheck, color: '#10b981' },
      { value: 'rejeitado', label: 'Rejeitado', icon: FaTimes, color: '#ef4444' }
    ];

    return (
      <div className="feature-content">
        <div className="feature-header">
          <h2><FaBriefcase /> Gerenciador de Estágios & Trainees</h2>
          <p>Acompanhe suas candidaturas e processos seletivos</p>
        </div>

        {/* Formulário Nova Candidatura */}
        <div className="candidatura-form">
          <h3><FaPlus /> Nova Candidatura</h3>
          <div className="form-grid">
            <input
              type="text"
              placeholder="Nome da empresa"
              value={novaCandidatura.empresa}
              onChange={(e) => updateCandidatura('empresa', e.target.value)}
            />
            <input
              type="text"
              placeholder="Nome da vaga"
              value={novaCandidatura.vaga}
              onChange={(e) => updateCandidatura('vaga', e.target.value)}
            />
            <input
              type="date"
              value={novaCandidatura.dataEnvio}
              onChange={(e) => updateCandidatura('dataEnvio', e.target.value)}
            />
            <select
              value={novaCandidatura.fase}
              onChange={(e) => updateCandidatura('fase', e.target.value)}
            >
              {fases.map(fase => (
                <option key={fase.value} value={fase.value}>{fase.label}</option>
              ))}
            </select>
          </div>
          <textarea
            placeholder="Observações sobre o processo..."
            rows="2"
            value={novaCandidatura.observacoes}
            onChange={(e) => updateCandidatura('observacoes', e.target.value)}
          />
          <button className="btn-primary" onClick={adicionarCandidatura}>
            <FaPlus /> Adicionar Candidatura
          </button>
        </div>

        {/* Lista de Candidaturas */}
        <div className="candidaturas-list">
          <h3><FaClipboardList /> Suas Candidaturas ({candidaturas.length})</h3>
          {candidaturas.length === 0 ? (
            <div className="empty-state">
              <p>Nenhuma candidatura cadastrada ainda.</p>
            </div>
          ) : (
            <div className="candidaturas-grid">
              {candidaturas.map(candidatura => {
                const faseInfo = fases.find(f => f.value === candidatura.fase);
                const FaseIcon = faseInfo.icon;
                
                return (
                  <div key={candidatura.id} className="candidatura-card">
                    <div className="candidatura-header">
                      <h4>{candidatura.empresa}</h4>
                      <div className={`fase-badge ${candidatura.fase}`}>
                        <FaseIcon /> {faseInfo.label}
                      </div>
                    </div>
                    <p className="vaga-nome">{candidatura.vaga}</p>
                    <p className="data-envio">
                      <FaCalendar /> {candidatura.dataEnvio ? new Date(candidatura.dataEnvio).toLocaleDateString('pt-BR') : 'Data não informada'}
                    </p>
                    {candidatura.observacoes && (
                      <p className="observacoes">{candidatura.observacoes}</p>
                    )}
                    <button 
                      className="btn-delete"
                      onClick={() => setCandidaturas(prev => prev.filter(c => c.id !== candidatura.id))}
                    >
                      <FaTrash />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  };

  // COMPONENTE: Networking
  const NetworkingGuide = () => (
    <div className="feature-content">
      <div className="feature-header">
        <h2><FaUsers /> Rede de Contatos (Networking)</h2>
        <p>Construa sua rede profissional e amplie suas oportunidades</p>
      </div>

      <div className="networking-sections">
        <div className="networking-card">
          <h3><FaLinkedin /> LinkedIn Profissional</h3>
          <div className="checklist">
            <label><input type="checkbox" /> Foto profissional de qualidade</label>
            <label><input type="checkbox" /> Headline atrativa e clara</label>
            <label><input type="checkbox" /> Resumo completo e bem escrito</label>
            <label><input type="checkbox" /> Experiências detalhadas</label>
            <label><input type="checkbox" /> Habilidades relevantes</label>
            <label><input type="checkbox" /> Pelo menos 50 conexões</label>
          </div>
          <div className="tips">
            <h4><FaLightbulb /> Dicas do LinkedIn:</h4>
            <div className="dicas-cards">
              <div className="dica-card">
                <div className="dica-icon">📝</div>
                <h5>Publique Conteúdo</h5>
                <p>Compartilhe artigos e insights relevantes da sua área</p>
              </div>
              <div className="dica-card">
                <div className="dica-icon">💬</div>
                <h5>Interaja Ativamente</h5>
                <p>Comente em posts de profissionais e empresas do setor</p>
              </div>
              <div className="dica-card">
                <div className="dica-icon">👥</div>
                <h5>Participe de Grupos</h5>
                <p>Entre em grupos profissionais e contribua com discussões</p>
              </div>
              <div className="dica-card">
                <div className="dica-icon">🤝</div>
                <h5>Convites Personalizados</h5>
                <p>Sempre adicione uma mensagem pessoal ao enviar convites</p>
              </div>
            </div>
          </div>
        </div>

        <div className="networking-card">
          <h3><FaBullseye /> Eventos e Oportunidades</h3>
          <div className="eventos-list">
            <div className="evento-item">
              <h4>Feiras de Carreira</h4>
              <p>• Participe de feiras nas universidades<br/>• Leve currículos impressos<br/>• Pratique seu elevator pitch</p>
            </div>
            <div className="evento-item">
              <h4>Eventos Online</h4>
              <p>• Webinars da sua área<br/>• Lives no Instagram/LinkedIn<br/>• Conferências virtuais</p>
            </div>
            <div className="evento-item">
              <h4>Meetups e Grupos</h4>
              <p>• Grupos no Telegram/WhatsApp<br/>• Meetups presenciais<br/>• Comunidades tech/profissionais</p>
            </div>
          </div>
        </div>

        <div className="networking-card">
          <h3><FaComments /> Estratégias de Networking</h3>
          <div className="estrategias">
            <div className="estrategia-item">
              <h4>1. Seja Genuíno</h4>
              <p>Construa relacionamentos reais, não apenas colete contatos</p>
            </div>
            <div className="estrategia-item">
              <h4>2. Ofereça Valor</h4>
              <p>Pense em como você pode ajudar antes de pedir ajuda</p>
            </div>
            <div className="estrategia-item">
              <h4>3. Mantenha Contato</h4>
              <p>Não desapareça após o primeiro contato, cultive o relacionamento</p>
            </div>
            <div className="estrategia-item">
              <h4>4. Seja Proativo</h4>
              <p>Não espere as oportunidades chegarem, vá atrás delas</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // COMPONENTE: Plano de Desenvolvimento
  const PlanoDesenvolvimento = () => {
    const [novaMeta, setNovaMeta] = useState({ texto: '', tipo: 'curtoPrazo', concluida: false });

    // Função para atualizar nova meta
    const updateNovaMeta = (campo, valor) => {
      setNovaMeta(prev => ({ ...prev, [campo]: valor }));
    };

    const adicionarMeta = () => {
      if (novaMeta.texto.trim()) {
        setMetas(prev => ({
          ...prev,
          [novaMeta.tipo]: [...prev[novaMeta.tipo], { ...novaMeta, id: Date.now() }]
        }));
        setNovaMeta({ texto: '', tipo: 'curtoPrazo', concluida: false });
      }
    };

    const toggleMeta = (tipo, id) => {
      setMetas(prev => ({
        ...prev,
        [tipo]: prev[tipo].map(meta => 
          meta.id === id ? { ...meta, concluida: !meta.concluida } : meta
        )
      }));
    };

    const removerMeta = (tipo, id) => {
      setMetas(prev => ({
        ...prev,
        [tipo]: prev[tipo].filter(meta => meta.id !== id)
      }));
    };

    return (
      <div className="feature-content">
        <div className="feature-header">
          <h2><FaBullseye /> Plano de Desenvolvimento</h2>
          <p>Trace suas metas e acompanhe seu crescimento profissional</p>
        </div>

        {/* Formulário Nova Meta */}
        <div className="meta-form">
          <h3><FaBullseye /> Nova Meta</h3>
          <div className="form-group">
            <input
              type="text"
              placeholder="Descreva sua meta..."
              value={novaMeta.texto}
              onChange={(e) => updateNovaMeta('texto', e.target.value)}
            />
            <select
              value={novaMeta.tipo}
              onChange={(e) => updateNovaMeta('tipo', e.target.value)}
            >
              <option value="curtoPrazo">Curto Prazo (até 6 meses)</option>
              <option value="longoPrazo">Longo Prazo (6+ meses)</option>
            </select>
            <button className="btn-primary" onClick={adicionarMeta}>
              <FaPlus /> Adicionar Meta
            </button>
          </div>
        </div>

        {/* Metas de Curto Prazo */}
        <div className="metas-section">
          <h3><FaBolt /> Metas de Curto Prazo ({metas.curtoPrazo.length})</h3>
          <div className="metas-list">
            {metas.curtoPrazo.length === 0 ? (
              <p className="empty-message">Nenhuma meta de curto prazo definida.</p>
            ) : (
              metas.curtoPrazo.map(meta => (
                <div key={meta.id} className={`meta-item ${meta.concluida ? 'concluida' : ''}`}>
                  <div className="meta-content">
                    <input
                      type="checkbox"
                      checked={meta.concluida}
                      onChange={() => toggleMeta('curtoPrazo', meta.id)}
                    />
                    <span className="meta-texto">{meta.texto}</span>
                  </div>
                  <button 
                    className="btn-delete"
                    onClick={() => removerMeta('curtoPrazo', meta.id)}
                  >
                    <FaTrash />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Metas de Longo Prazo */}
        <div className="metas-section">
          <h3><FaBullseye /> Metas de Longo Prazo ({metas.longoPrazo.length})</h3>
          <div className="metas-list">
            {metas.longoPrazo.length === 0 ? (
              <p className="empty-message">Nenhuma meta de longo prazo definida.</p>
            ) : (
              metas.longoPrazo.map(meta => (
                <div key={meta.id} className={`meta-item ${meta.concluida ? 'concluida' : ''}`}>
                  <div className="meta-content">
                    <input
                      type="checkbox"
                      checked={meta.concluida}
                      onChange={() => toggleMeta('longoPrazo', meta.id)}
                    />
                    <span className="meta-texto">{meta.texto}</span>
                  </div>
                  <button 
                    className="btn-delete"
                    onClick={() => removerMeta('longoPrazo', meta.id)}
                  >
                    <FaTrash />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Exemplos de Metas */}
        <div className="exemplos-metas">
          <h3><FaLightbulb /> Exemplos de Metas</h3>
          <div className="exemplos-grid">
            <div className="exemplo-card">
              <h4>Curto Prazo</h4>
              <ul>
                <li>Fazer curso de Excel avançado</li>
                <li>Atualizar o LinkedIn</li>
                <li>Participar de 2 eventos da área</li>
                <li>Enviar 10 currículos</li>
                <li>Fazer um projeto pessoal</li>
              </ul>
            </div>
            <div className="exemplo-card">
              <h4>Longo Prazo</h4>
              <ul>
                <li>Conseguir primeiro emprego na área</li>
                <li>Fazer especialização</li>
                <li>Aprender inglês fluente</li>
                <li>Conseguir promoção</li>
                <li>Mudar para área desejada</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Progresso Geral */}
        <div className="progresso-geral">
          <h3><FaChartBar /> Seu Progresso</h3>
          <div className="stats-grid">
            <div className="stat-card">
              <h4>Curto Prazo</h4>
              <div className="stat-number">
                {metas.curtoPrazo.filter(m => m.concluida).length}/{metas.curtoPrazo.length}
              </div>
              <div className="progress-bar">
                <div className="progress-fill"></div>
              </div>
            </div>
            <div className="stat-card">
              <h4>Longo Prazo</h4>
              <div className="stat-number">
                {metas.longoPrazo.filter(m => m.concluida).length}/{metas.longoPrazo.length}
              </div>
              <div className="progress-bar">
                <div className="progress-fill"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'curriculo':
        return <GeradorCV />;
      case 'estagios':
        return <GerenciadorEstagios />;
      case 'networking':
        return <NetworkingGuide />;
      case 'desenvolvimento':
        return <PlanoDesenvolvimento />;
      default:
        return <GeradorCV />;
    }
  };

  return (
    <div className="modulo-carreira">
      <div className="carreira-container">
        <div className="carreira-header">
          <div className="header-icon">
            <FaGraduationCap />
          </div>
          <h1 className="carreira-title">Módulo de Carreira</h1>
          <p className="carreira-subtitle">
            Prepare-se para o mercado de trabalho com ferramentas práticas
          </p>
        </div>

        {/* Navegação por Abas */}
        <div className="carreira-navigation">
          {tabs.map(tab => {
            const IconeTab = tab.icone;
            return (
              <button
                key={tab.id}
                className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <IconeTab />
                <span>{tab.nome}</span>
              </button>
            );
          })}
        </div>

        {/* Conteúdo da Aba Ativa */}
        <div className="carreira-content">
          {renderActiveTab()}
        </div>

        {/* Botão Salvar Global */}
        <div className="global-actions">
          <button className="btn-save-global" onClick={salvarDados}>
            <FaSave /> Salvar Todos os Dados
          </button>
        </div>

        {/* Modal de Visualização do CV */}
        {modalCVAberto && (
          <div className="cv-modal-overlay" onClick={() => setModalCVAberto(false)}>
            <div className="cv-modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="cv-modal-header">
                <h3><FaEye /> Pré-visualização do CV</h3>
                <button 
                  className="cv-modal-close" 
                  onClick={() => setModalCVAberto(false)}
                >
                  <FaTimes />
                </button>
              </div>
              
              <div className="cv-modal-body">
                <div className="cv-preview">
                  {/* Header do CV */}
                  <div className="cv-header">
                    <h1>{curriculoData.nomeCompleto || 'Seu Nome'}</h1>
                    <div className="cv-contatos">
                      {curriculoData.email && (
                        <span>{curriculoData.email}</span>
                      )}
                      {curriculoData.telefone && (
                        <span>{curriculoData.telefone}</span>
                      )}
                      {curriculoData.endereco && (
                        <span>{curriculoData.endereco}, {curriculoData.cidade} - {curriculoData.estado}</span>
                      )}
                    </div>
                  </div>

                  {/* Objetivo Profissional */}
                  {curriculoData.objetivoProfissional && (
                    <div className="cv-section">
                      <h3>Objetivo Profissional</h3>
                      <p>{curriculoData.objetivoProfissional}</p>
                    </div>
                  )}

                  {/* Formação Acadêmica */}
                  {curriculoData.formacoes && curriculoData.formacoes.length > 0 && (
                    <div className="cv-section">
                      <h3><FaGraduationCap /> Formação Acadêmica</h3>
                      {curriculoData.formacoes.map((formacao, index) => (
                        <div key={index} className="cv-item">
                          <div className="cv-item-header">
                            <h4>{formacao.curso}</h4>
                            <span className="cv-periodo">{formacao.inicio} - {formacao.fim}</span>
                          </div>
                          <p className="cv-instituicao">{formacao.instituicao}</p>
                          <p className="cv-status">Status: {formacao.status}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Experiência Profissional */}
                  {curriculoData.experiencias && curriculoData.experiencias.length > 0 && (
                    <div className="cv-section">
                      <h3><FaBriefcase /> Experiência Profissional</h3>
                      {curriculoData.experiencias.map((exp, index) => (
                        <div key={index} className="cv-item">
                          <div className="cv-item-header">
                            <h4>{exp.cargo}</h4>
                            <span className="cv-periodo">{exp.inicio} - {exp.atual ? 'Atual' : exp.fim}</span>
                          </div>
                          <p className="cv-empresa">{exp.empresa}</p>
                          {exp.descricao && <p className="cv-descricao">{exp.descricao}</p>}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Habilidades */}
                  {curriculoData.habilidades && curriculoData.habilidades.length > 0 && (
                    <div className="cv-section">
                      <h3>Habilidades</h3>
                      <div className="cv-habilidades">
                        {curriculoData.habilidades.map((habilidade, index) => (
                          <span key={index} className="cv-habilidade-tag">
                            {habilidade.nome}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Cursos e Certificações */}
                  {curriculoData.cursos && curriculoData.cursos.length > 0 && (
                    <div className="cv-section">
                      <h3><FaFile /> Cursos e Certificações</h3>
                      {curriculoData.cursos.map((curso, index) => (
                        <div key={index} className="cv-item">
                          <h4>{curso.nome}</h4>
                          <p>{curso.instituicao}</p>
                          <small>{curso.cargaHoraria} - {curso.ano}</small>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Idiomas */}
                  {curriculoData.idiomas && curriculoData.idiomas.length > 0 && (
                    <div className="cv-section">
                      <h3>Idiomas</h3>
                      <div className="cv-idiomas">
                        {curriculoData.idiomas.map((idioma, index) => (
                          <div key={index} className="cv-idioma">
                            <strong>{idioma.idioma}</strong>: {idioma.nivel}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="cv-modal-footer">
                <button 
                  className="btn-secondary"
                  onClick={() => setModalCVAberto(false)}
                >
                  Fechar
                </button>
                <button className="btn-primary">
                  <FaDownload /> Baixar PDF
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModuloCarreira;
