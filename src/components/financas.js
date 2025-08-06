import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebaseConfig';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { 
  FaWallet, 
  FaChartLine, 
  FaMoneyBillWave, 
  FaPiggyBank, 
  FaRegCalendarAlt,
  FaTrash,
  FaEdit
} from 'react-icons/fa';
import './financas.css';

const ModuloFinancas = () => {
  // Estados para gerenciar os dados financeiros
  const [user, setUser] = useState(null);
  const [orcamento, setOrcamento] = useState({
    entrada: [],
    saida: [],
    metas: []
  });
  const [novaTransacao, setNovaTransacao] = useState({
    descricao: '',
    valor: '',
    categoria: '',
    data: new Date().toISOString().split('T')[0],
    tipo: 'entrada'
  });
  const [novaMeta, setNovaMeta] = useState({
    descricao: '',
    valor: '',
    dataAlvo: '',
    valorAtual: '0'
  });
  const [editandoTransacao, setEditandoTransacao] = useState(null);
  const [editandoMeta, setEditandoMeta] = useState(null);
  const [activeTab, setActiveTab] = useState('visaoGeral');

  // Categorias para entradas e saídas
  const categoriasSaida = [
    'Moradia', 'Alimentação', 'Transporte', 'Educação', 
    'Saúde', 'Lazer', 'Vestuário', 'Outros'
  ];
  
  const categoriasEntrada = [
    'Salário', 'Freelance', 'Investimentos', 'Mesada', 
    'Presente', 'Reembolso', 'Outros'
  ];

  // Carregar dados do usuário
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setUser(user);
        try {
          // Carregar dados do aluno
          const docRef = doc(db, 'alunos', user.uid);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            // Carregar dados financeiros
            const financasRef = doc(db, 'financas', user.uid);
            const financasSnap = await getDoc(financasRef);
            
            if (financasSnap.exists()) {
              setOrcamento(financasSnap.data());
            } else {
              // Criar documento financeiro inicial
              await setDoc(financasRef, {
                entrada: [],
                saida: [],
                metas: []
              });
            }
          }
        } catch (error) {
          console.error('Erro ao carregar dados:', error);
        }
      }
    });
    
    return () => unsubscribe();
  }, []);

  // Cálculos financeiros
  const totalEntrada = orcamento.entrada ? orcamento.entrada.reduce((acc, item) => acc + parseFloat(item.valor), 0) : 0;
  const totalSaida = orcamento.saida ? orcamento.saida.reduce((acc, item) => acc + parseFloat(item.valor), 0) : 0;
  const saldoAtual = totalEntrada - totalSaida;
  
  // Progresso das metas
  const calcularProgressoMeta = (meta) => {
    const percentual = (parseFloat(meta.valorAtual) / parseFloat(meta.valor)) * 100;
    return Math.min(percentual, 100).toFixed(0);
  };

  // Manipuladores de eventos
  const handleInputChange = (e, setStateFunction, stateObject) => {
    const { name, value } = e.target;
    setStateFunction({ ...stateObject, [name]: value });
  };

  const salvarTransacao = async () => {
    if (!novaTransacao.descricao || !novaTransacao.valor || !novaTransacao.categoria) {
      alert('Por favor, preencha todos os campos.');
      return;
    }

    try {
      const financasRef = doc(db, 'financas', user.uid);
      const tipo = novaTransacao.tipo;
      const novoItem = { ...novaTransacao, id: Date.now().toString() };
      
      if (editandoTransacao) {
        // Atualizar transação existente
        const tipoAtual = editandoTransacao.tipo;
        const itensAtualizados = orcamento[`${tipoAtual}s`].map(item => 
          item.id === editandoTransacao.id ? novoItem : item
        );
        
        await updateDoc(financasRef, {
          [`${tipoAtual}s`]: itensAtualizados
        });
        
        // Se o tipo mudou, remover do array antigo e adicionar ao novo
        if (tipoAtual !== tipo) {
          const itensAntigos = orcamento[`${tipoAtual}s`].filter(item => 
            item.id !== editandoTransacao.id
          );
          
          const itensNovos = [...orcamento[`${tipo}s`], novoItem];
          
          await updateDoc(financasRef, {
            [`${tipoAtual}s`]: itensAntigos,
            [`${tipo}s`]: itensNovos
          });
        }
        
        setEditandoTransacao(null);
      } else {
        // Adicionar nova transação
        await updateDoc(financasRef, {
          [`${tipo}s`]: [...orcamento[`${tipo}s`], novoItem]
        });
      }
      
      // Atualizar estado local
      const docSnap = await getDoc(financasRef);
      if (docSnap.exists()) {
        setOrcamento(docSnap.data());
      }
      
      // Limpar formulário
      setNovaTransacao({
        descricao: '',
        valor: '',
        categoria: '',
        data: new Date().toISOString().split('T')[0],
        tipo: 'entrada'
      });
    } catch (error) {
      console.error('Erro ao salvar transação:', error);
      alert('Erro ao salvar. Tente novamente.');
    }
  };

  const salvarMeta = async () => {
    if (!novaMeta.descricao || !novaMeta.valor || !novaMeta.dataAlvo) {
      alert('Por favor, preencha todos os campos da meta.');
      return;
    }

    try {
      const financasRef = doc(db, 'financas', user.uid);
      const novaMeta_ = { ...novaMeta, id: Date.now().toString() };
      
      if (editandoMeta) {
        // Atualizar meta existente
        const metasAtualizadas = orcamento.metas.map(meta => 
          meta.id === editandoMeta.id ? novaMeta_ : meta
        );
        
        await updateDoc(financasRef, {
          metas: metasAtualizadas
        });
        
        setEditandoMeta(null);
      } else {
        // Adicionar nova meta
        await updateDoc(financasRef, {
          metas: [...orcamento.metas, novaMeta_]
        });
      }
      
      // Atualizar estado local
      const docSnap = await getDoc(financasRef);
      if (docSnap.exists()) {
        setOrcamento(docSnap.data());
      }
      
      // Limpar formulário
      setNovaMeta({
        descricao: '',
        valor: '',
        dataAlvo: '',
        valorAtual: '0'
      });
    } catch (error) {
      console.error('Erro ao salvar meta:', error);
      alert('Erro ao salvar. Tente novamente.');
    }
  };

  const editarTransacao = (item, tipo) => {
    setNovaTransacao({
      ...item,
      tipo: tipo === 'entrada' ? 'entrada' : 'saida'
    });
    setEditandoTransacao({ ...item, tipo: tipo === 'entrada' ? 'entrada' : 'saida' });
  };

  const editarMeta = (meta) => {
    setNovaMeta(meta);
    setEditandoMeta(meta);
  };

  const excluirTransacao = async (id, tipo) => {
    if (window.confirm('Tem certeza que deseja excluir esta transação?')) {
      try {
        const financasRef = doc(db, 'financas', user.uid);
        const itensAtualizados = orcamento[tipo].filter(item => item.id !== id);
        
        await updateDoc(financasRef, {
          [tipo]: itensAtualizados
        });
        
        // Atualizar estado local
        const docSnap = await getDoc(financasRef);
        if (docSnap.exists()) {
          setOrcamento(docSnap.data());
        }
      } catch (error) {
        console.error('Erro ao excluir transação:', error);
        alert('Erro ao excluir. Tente novamente.');
      }
    }
  };

  const excluirMeta = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta meta?')) {
      try {
        const financasRef = doc(db, 'financas', user.uid);
        const metasAtualizadas = orcamento.metas.filter(meta => meta.id !== id);
        
        await updateDoc(financasRef, {
          metas: metasAtualizadas
        });
        
        // Atualizar estado local
        const docSnap = await getDoc(financasRef);
        if (docSnap.exists()) {
          setOrcamento(docSnap.data());
        }
      } catch (error) {
        console.error('Erro ao excluir meta:', error);
        alert('Erro ao excluir. Tente novamente.');
      }
    }
  };

  const atualizarValorMeta = async (id, novoValor) => {
    try {
      const financasRef = doc(db, 'financas', user.uid);
      const metasAtualizadas = orcamento.metas.map(meta => {
        if (meta.id === id) {
          return { ...meta, valorAtual: novoValor };
        }
        return meta;
      });
      
      await updateDoc(financasRef, {
        metas: metasAtualizadas
      });
      
      // Atualizar estado local
      const docSnap = await getDoc(financasRef);
      if (docSnap.exists()) {
        setOrcamento(docSnap.data());
      }
    } catch (error) {
      console.error('Erro ao atualizar valor da meta:', error);
      alert('Erro ao atualizar. Tente novamente.');
    }
  };

  // Renderização dos componentes
  const renderVisaoGeral = () => (
    <div className="visao-geral-container">
      <div className="cards-financeiros">
        <div className="card-financeiro saldo">
          <div className="card-icon">
            <FaWallet />
          </div>
          <div className="card-content">
            <h3>Saldo Atual</h3>
            <p className={`valor ${saldoAtual >= 0 ? 'positivo' : 'negativo'}`}>
              R$ {saldoAtual.toFixed(2)}
            </p>
          </div>
        </div>
        
        <div className="card-financeiro receitas">
          <div className="card-icon">
            <FaMoneyBillWave />
          </div>
          <div className="card-content">
            <h3>Entrada</h3>
            <p className="valor positivo">R$ {totalEntrada.toFixed(2)}</p>
          </div>
        </div>
        
        <div className="card-financeiro despesas">
          <div className="card-icon">
            <FaChartLine />
          </div>
          <div className="card-content">
            <h3>Saída</h3>
            <p className="valor negativo">R$ {totalSaida.toFixed(2)}</p>
          </div>
        </div>
      </div>
      
      <div className="metas-financeiras">
        <h3 className="section-title">Metas Financeiras</h3>
        {orcamento.metas.length > 0 ? (
          <div className="metas-lista">
            {orcamento.metas.map(meta => (
              <div className="meta-item" key={meta.id}>
                <div className="meta-info">
                  <h4>{meta.descricao}</h4>
                  <div className="meta-valores">
                    <span>R$ {parseFloat(meta.valorAtual).toFixed(2)} / R$ {parseFloat(meta.valor).toFixed(2)}</span>
                    <span className="meta-data">Meta para: {new Date(meta.dataAlvo).toLocaleDateString()}</span>
                  </div>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${calcularProgressoMeta(meta)}%` }}
                    ></div>
                  </div>
                  <span className="progress-text">{calcularProgressoMeta(meta)}% concluído</span>
                </div>
                <div className="meta-acoes">
                  <button onClick={() => editarMeta(meta)} className="btn-editar">
                    <FaEdit />
                  </button>
                  <button onClick={() => excluirMeta(meta.id)} className="btn-excluir">
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="mensagem-vazia">Você ainda não tem metas financeiras. Crie uma meta para acompanhar seu progresso!</p>
        )}
      </div>
      
      <div className="transacoes-recentes">
        <h3 className="section-title">Transações Recentes</h3>
        {[...orcamento.entrada, ...orcamento.saida]
          .sort((a, b) => new Date(b.data) - new Date(a.data))
          .slice(0, 5)
          .map(item => {
            const tipo = orcamento.entrada.includes(item) ? 'entrada' : 'saida';
            return (
              <div className={`transacao-item ${tipo === 'entrada' ? 'receita' : 'despesa'}`} key={item.id}>
                <div className="transacao-info">
                  <h4>{item.descricao}</h4>
                  <div className="transacao-detalhes">
                    <span className="categoria">{item.categoria}</span>
                    <span className="data">{new Date(item.data).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="transacao-valor">
                  <span>{tipo === 'entrada' ? '+' : '-'} R$ {parseFloat(item.valor).toFixed(2)}</span>
                  <div className="transacao-acoes">
                    <button onClick={() => editarTransacao(item, tipo)} className="btn-editar">
                      <FaEdit />
                    </button>
                    <button onClick={() => excluirTransacao(item.id, tipo)} className="btn-excluir">
                      <FaTrash />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        {[...orcamento.entrada, ...orcamento.saida].length === 0 && (
          <p className="mensagem-vazia">Você ainda não tem transações registradas.</p>
        )}
      </div>
    </div>
  );

  const renderTransacoes = () => (
    <div className="transacoes-container">
      <div className="form-container">
        <h3 className="section-title">
          {editandoTransacao ? 'Editar Transação' : 'Nova Transação'}
        </h3>
        <div className="form-group">
          <label>Descrição</label>
          <input 
            type="text" 
            name="descricao" 
            value={novaTransacao.descricao} 
            onChange={(e) => handleInputChange(e, setNovaTransacao, novaTransacao)} 
            placeholder="Ex: Salário, Conta de luz"
          />
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label>Valor (R$)</label>
            <input 
              type="number" 
              name="valor" 
              value={novaTransacao.valor} 
              onChange={(e) => handleInputChange(e, setNovaTransacao, novaTransacao)} 
              placeholder="0,00"
              min="0"
              step="0.01"
            />
          </div>
          
          <div className="form-group">
            <label>Data</label>
            <input 
              type="date" 
              name="data" 
              value={novaTransacao.data} 
              onChange={(e) => handleInputChange(e, setNovaTransacao, novaTransacao)} 
            />
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label>Tipo</label>
            <select 
              name="tipo" 
              value={novaTransacao.tipo} 
              onChange={(e) => handleInputChange(e, setNovaTransacao, novaTransacao)}
            >
              <option value="entrada">Entrada</option>
              <option value="saida">Saída</option>
            </select>
          </div>
          
          <div className="form-group">
            <label>Categoria</label>
            <select 
              name="categoria" 
              value={novaTransacao.categoria} 
              onChange={(e) => handleInputChange(e, setNovaTransacao, novaTransacao)}
            >
              <option value="">Selecione uma categoria</option>
              {novaTransacao.tipo === 'entrada' ? (
                categoriasEntrada.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))
              ) : (
                categoriasSaida.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))
              )}
            </select>
          </div>
        </div>
        
        <div className="form-actions">
          <button onClick={salvarTransacao} className="btn-salvar">
            {editandoTransacao ? 'Atualizar' : 'Adicionar'} Transação
          </button>
          {editandoTransacao && (
            <button 
              onClick={() => {
                setEditandoTransacao(null);
                setNovaTransacao({
                  descricao: '',
                  valor: '',
                  categoria: '',
                  data: new Date().toISOString().split('T')[0],
                  tipo: 'entrada'
                });
              }} 
              className="btn-cancelar"
            >
              Cancelar Edição
            </button>
          )}
        </div>
      </div>
      
      <div className="lista-container">
        <div className="tabs">
          <button 
            className={`tab ${activeTab === 'entrada' ? 'active' : ''}`}
            onClick={() => setActiveTab('entrada')}
          >
            Entrada
          </button>
          <button 
            className={`tab ${activeTab === 'saida' ? 'active' : ''}`}
            onClick={() => setActiveTab('saida')}
          >
            Saída
          </button>
        </div>
        
        <div className="lista-transacoes">
          {activeTab === 'entrada' ? (
            orcamento.entrada.length > 0 ? (
              orcamento.entrada
                .sort((a, b) => new Date(b.data) - new Date(a.data))
                .map(item => (
                  <div className="transacao-item receita" key={item.id}>
                    <div className="transacao-info">
                      <h4>{item.descricao}</h4>
                      <div className="transacao-detalhes">
                        <span className="categoria">{item.categoria}</span>
                        <span className="data">{new Date(item.data).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="transacao-valor">
                      <span>+ R$ {parseFloat(item.valor).toFixed(2)}</span>
                      <div className="transacao-acoes">
                        <button onClick={() => editarTransacao(item, 'entrada')} className="btn-editar">
                          <FaEdit />
                        </button>
                        <button onClick={() => excluirTransacao(item.id, 'entrada')} className="btn-excluir">
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
            ) : (
              <p className="mensagem-vazia">Você ainda não tem entradas registradas.</p>
            )
          ) : (
            orcamento.saida.length > 0 ? (
              orcamento.saida
                .sort((a, b) => new Date(b.data) - new Date(a.data))
                .map(item => (
                  <div className="transacao-item despesa" key={item.id}>
                    <div className="transacao-info">
                      <h4>{item.descricao}</h4>
                      <div className="transacao-detalhes">
                        <span className="categoria">{item.categoria}</span>
                        <span className="data">{new Date(item.data).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="transacao-valor">
                      <span>- R$ {parseFloat(item.valor).toFixed(2)}</span>
                      <div className="transacao-acoes">
                        <button onClick={() => editarTransacao(item, 'saida')} className="btn-editar">
                          <FaEdit />
                        </button>
                        <button onClick={() => excluirTransacao(item.id, 'saida')} className="btn-excluir">
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
            ) : (
              <p className="mensagem-vazia">Você ainda não tem saídas registradas.</p>
            )
          )}
        </div>
      </div>
    </div>
  );

  const renderMetas = () => (
    <div className="metas-container">
      <div className="form-container">
        <h3 className="section-title">
          {editandoMeta ? 'Editar Meta' : 'Nova Meta Financeira'}
        </h3>
        <div className="form-group">
          <label>Descrição da Meta</label>
          <input 
            type="text" 
            name="descricao" 
            value={novaMeta.descricao} 
            onChange={(e) => handleInputChange(e, setNovaMeta, novaMeta)} 
            placeholder="Ex: Comprar um notebook, Viagem de férias"
          />
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label>Valor Total (R$)</label>
            <input 
              type="number" 
              name="valor" 
              value={novaMeta.valor} 
              onChange={(e) => handleInputChange(e, setNovaMeta, novaMeta)} 
              placeholder="0,00"
              min="0"
              step="0.01"
            />
          </div>
          
          <div className="form-group">
            <label>Data Alvo</label>
            <input 
              type="date" 
              name="dataAlvo" 
              value={novaMeta.dataAlvo} 
              onChange={(e) => handleInputChange(e, setNovaMeta, novaMeta)} 
            />
          </div>
        </div>
        
        <div className="form-group">
          <label>Valor Atual (R$)</label>
          <input 
            type="number" 
            name="valorAtual" 
            value={novaMeta.valorAtual} 
            onChange={(e) => handleInputChange(e, setNovaMeta, novaMeta)} 
            placeholder="0,00"
            min="0"
            step="0.01"
          />
        </div>
        
        <div className="form-actions">
          <button onClick={salvarMeta} className="btn-salvar">
            {editandoMeta ? 'Atualizar' : 'Adicionar'} Meta
          </button>
          {editandoMeta && (
            <button 
              onClick={() => {
                setEditandoMeta(null);
                setNovaMeta({
                  descricao: '',
                  valor: '',
                  dataAlvo: '',
                  valorAtual: '0'
                });
              }} 
              className="btn-cancelar"
            >
              Cancelar Edição
            </button>
          )}
        </div>
      </div>
      
      <div className="lista-container">
        <h3 className="section-title">Suas Metas Financeiras</h3>
        
        <div className="lista-metas">
          {orcamento.metas.length > 0 ? (
            orcamento.metas
              .sort((a, b) => new Date(a.dataAlvo) - new Date(b.dataAlvo))
              .map(meta => (
                <div className="meta-item" key={meta.id}>
                  <div className="meta-info">
                    <h4>{meta.descricao}</h4>
                    <div className="meta-valores">
                      <span>R$ {parseFloat(meta.valorAtual).toFixed(2)} / R$ {parseFloat(meta.valor).toFixed(2)}</span>
                      <span className="meta-data">Meta para: {new Date(meta.dataAlvo).toLocaleDateString()}</span>
                    </div>
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ width: `${calcularProgressoMeta(meta)}%` }}
                      ></div>
                    </div>
                    <span className="progress-text">{calcularProgressoMeta(meta)}% concluído</span>
                  </div>
                  
                  <div className="meta-acoes">
                    <div className="atualizar-valor">
                      <input 
                        type="number" 
                        placeholder="Novo valor atual" 
                        min="0" 
                        step="0.01"
                        onChange={(e) => {
                          if (e.target.value && parseFloat(e.target.value) >= 0) {
                            atualizarValorMeta(meta.id, e.target.value);
                          }
                        }}
                        defaultValue={meta.valorAtual}
                      />
                    </div>
                    <button onClick={() => editarMeta(meta)} className="btn-editar">
                      <FaEdit />
                    </button>
                    <button onClick={() => excluirMeta(meta.id)} className="btn-excluir">
                      <FaTrash />
                    </button>
                  </div>
                </div>
              ))
          ) : (
            <p className="mensagem-vazia">Você ainda não tem metas financeiras. Crie uma meta para acompanhar seu progresso!</p>
          )}
        </div>
      </div>
    </div>
  );

  const renderDicas = () => (
    <div className="dicas-container">
      <h2 className="section-title">Dicas de Educação Financeira para Estudantes</h2>
      
      <div className="dicas-grid">
        <div className="dica-card">
          <div className="dica-icon">
            <FaWallet />
          </div>
          <h3>Orçamento Básico</h3>
          <p>Crie um orçamento simples dividindo suas receitas e despesas em categorias. Acompanhe seus gastos regularmente e ajuste conforme necessário.</p>
        </div>
        
        <div className="dica-card">
          <div className="dica-icon">
            <FaPiggyBank />
          </div>
          <h3>Economize Regularmente</h3>
          <p>Estabeleça o hábito de economizar uma porcentagem fixa da sua renda, mesmo que seja pequena. Com o tempo, esses valores se acumulam.</p>
        </div>
        
        <div className="dica-card">
          <div className="dica-icon">
            <FaChartLine />
          </div>
          <h3>Evite Dívidas</h3>
          <p>Evite gastar mais do que ganha. Se precisar de crédito, entenda completamente os termos e juros antes de se comprometer.</p>
        </div>
        
        <div className="dica-card">
          <div className="dica-icon">
            <FaMoneyBillWave />
          </div>
          <h3>Renda Extra</h3>
          <p>Considere oportunidades de renda extra compatíveis com seus estudos, como freelance, estágios ou trabalhos de meio período.</p>
        </div>
        
        <div className="dica-card">
          <div className="dica-icon">
            <FaRegCalendarAlt />
          </div>
          <h3>Planejamento Futuro</h3>
          <p>Comece a pensar em objetivos financeiros de longo prazo, como fundo de emergência, investimentos e planos pós-formatura.</p>
        </div>
      </div>
      
      <div className="recursos-adicionais">
        <h3>Recursos Adicionais</h3>
        <ul>
          <li><a href="https://www.bcb.gov.br/cidadaniafinanceira" target="_blank" rel="noopener noreferrer">Banco Central do Brasil - Cidadania Financeira</a></li>
          <li><a href="https://www.investidor.gov.br/" target="_blank" rel="noopener noreferrer">Portal do Investidor - CVM</a></li>
          <li><a href="https://www.serasa.com.br/ensina/" target="_blank" rel="noopener noreferrer">Serasa Ensina</a></li>
        </ul>
      </div>
    </div>
  );

  return (
    <div className="modulo-financas">
      <header className="financas-header">
        <div className="header-container">
          <h1>
            <FaWallet /> Gestão Financeira Estudantil
          </h1>
          <p>Organize suas finanças, estabeleça metas e desenvolva hábitos financeiros saudáveis</p>
        </div>
      </header>
      
      <main className="financas-content">
        <div className="tabs-container">
          <button 
            className={`tab ${activeTab === 'visaoGeral' ? 'active' : ''}`}
            onClick={() => setActiveTab('visaoGeral')}
          >
            Visão Geral
          </button>
          <button 
            className={`tab ${activeTab === 'transacoes' ? 'active' : ''}`}
            onClick={() => setActiveTab('transacoes')}
          >
            Transações
          </button>
          <button 
            className={`tab ${activeTab === 'metas' ? 'active' : ''}`}
            onClick={() => setActiveTab('metas')}
          >
            Metas
          </button>
          <button 
            className={`tab ${activeTab === 'dicas' ? 'active' : ''}`}
            onClick={() => setActiveTab('dicas')}
          >
            Dicas
          </button>
        </div>
        
        <div className="tab-content">
          {activeTab === 'visaoGeral' && renderVisaoGeral()}
          {activeTab === 'transacoes' && renderTransacoes()}
          {activeTab === 'metas' && renderMetas()}
          {activeTab === 'dicas' && renderDicas()}
        </div>
      </main>
    </div>
  );
};

export default ModuloFinancas;