import React, { useState, useEffect } from 'react';

function Organizacao() {
  const [tarefas, setTarefas] = useState([]);
  const [novaTarefa, setNovaTarefa] = useState('');
  const [novaPrioridade, setNovaPrioridade] = useState('média');
  const [novaData, setNovaData] = useState('');
  const [editando, setEditando] = useState(null);
  const [textoEditado, setTextoEditado] = useState('');
  const [prioridadeEditada, setPrioridadeEditada] = useState('média');
  const [dataEditada, setDataEditada] = useState('');
  const [filtro, setFiltro] = useState('todas');
  const [feedback, setFeedback] = useState('');

  // Carregar tarefas do localStorage ao iniciar
  useEffect(() => {
    const tarefasSalvas = localStorage.getItem('organizacao-tarefas');
    if (tarefasSalvas) {
      setTarefas(JSON.parse(tarefasSalvas));
    }
  }, []);

  // Salvar tarefas no localStorage sempre que mudar
  useEffect(() => {
    localStorage.setItem('organizacao-tarefas', JSON.stringify(tarefas));
  }, [tarefas]);

  // Feedback visual temporário
  const mostrarFeedback = (msg) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(''), 1500);
  };

  const adicionarTarefa = () => {
    if (novaTarefa.trim()) {
      setTarefas([
        ...tarefas,
        {
          texto: novaTarefa,
          prioridade: novaPrioridade,
          data: novaData,
          concluida: false,
        },
      ]);
      setNovaTarefa('');
      setNovaPrioridade('média');
      setNovaData('');
      mostrarFeedback('Tarefa adicionada!');
    }
  };

  const excluirTarefa = (idx) => {
    setTarefas(tarefas.filter((_, i) => i !== idx));
    mostrarFeedback('Tarefa excluída!');
  };

  const iniciarEdicao = (idx, tarefa) => {
    setEditando(idx);
    setTextoEditado(tarefa.texto);
    setPrioridadeEditada(tarefa.prioridade || 'média');
    setDataEditada(tarefa.data || '');
  };

  const salvarEdicao = (idx) => {
    const novasTarefas = tarefas.map((tarefa, i) =>
      i === idx
        ? { ...tarefa, texto: textoEditado, prioridade: prioridadeEditada, data: dataEditada }
        : tarefa
    );
    setTarefas(novasTarefas);
    setEditando(null);
    setTextoEditado('');
    mostrarFeedback('Tarefa editada!');
  };

  const cancelarEdicao = () => {
    setEditando(null);
    setTextoEditado('');
  };

  const alternarConcluida = (idx) => {
    setTarefas(tarefas.map((tarefa, i) =>
      i === idx ? { ...tarefa, concluida: !tarefa.concluida } : tarefa
    ));
  };

  const limparTarefas = () => {
    setTarefas([]);
    mostrarFeedback('Todas as tarefas foram removidas!');
  };

  // Filtro de tarefas
  const tarefasFiltradas = tarefas.filter(tarefa => {
    if (filtro === 'todas') return true;
    if (filtro === 'pendentes') return !tarefa.concluida;
    if (filtro === 'concluidas') return tarefa.concluida;
    return true;
  });

  // Contadores
  const totalPendentes = tarefas.filter(t => !t.concluida).length;
  const totalConcluidas = tarefas.filter(t => t.concluida).length;

  return (
    <section className="organizacao-modulo">
      <h3>📋 Organização</h3>

      {/* Feedback visual */}
      {feedback && <div className="sucesso" style={{marginBottom: 8}}>{feedback}</div>}

      {/* Contadores */}
      <div style={{fontSize: 14, marginBottom: 8, color: '#666'}}>
        Pendentes: {totalPendentes} | Concluídas: {totalConcluidas}
      </div>

      {/* Filtros */}
      <div style={{display: 'flex', gap: 8, marginBottom: 12}}>
        <button
          className={`organizacao-btn${filtro === 'todas' ? ' salvar' : ''}`}
          onClick={() => setFiltro('todas')}
        >Todas</button>
        <button
          className={`organizacao-btn${filtro === 'pendentes' ? ' salvar' : ''}`}
          onClick={() => setFiltro('pendentes')}
        >Pendentes</button>
        <button
          className={`organizacao-btn${filtro === 'concluidas' ? ' salvar' : ''}`}
          onClick={() => setFiltro('concluidas')}
        >Concluídas</button>
        <button
          className="organizacao-btn excluir"
          style={{marginLeft: 'auto'}}
          onClick={limparTarefas}
          disabled={tarefas.length === 0}
        >Limpar tudo</button>
      </div>

      {/* Adicionar tarefa */}
      <div className="organizacao-input-row">
        <input
          type="text"
          value={novaTarefa}
          onChange={e => setNovaTarefa(e.target.value)}
          placeholder="Adicionar tarefa"
          className="organizacao-input"
          onKeyDown={e => e.key === 'Enter' && adicionarTarefa()}
        />
        <select
          value={novaPrioridade}
          onChange={e => setNovaPrioridade(e.target.value)}
          className="organizacao-input"
          style={{maxWidth: 100}}
        >
          <option value="baixa">Baixa</option>
          <option value="média">Média</option>
          <option value="alta">Alta</option>
        </select>
        <button onClick={adicionarTarefa} className="organizacao-btn">+</button>
      </div>
      {/* Lista de tarefas estilo planilha */}
      <table className="organizacao-list">
        <thead className="organizacao-table-header">
          <tr>
            <th style={{width: 40}}></th>
            <th>Tarefa</th>
            <th>Prioridade</th>
            <th style={{width: 120}}>Ações</th>
          </tr>
        </thead>
        <tbody>
          {tarefasFiltradas.length === 0 && (
            <tr className="organizacao-list-empty">
              <td colSpan={4}>Nenhuma tarefa encontrada.</td>
            </tr>
          )}
          {tarefasFiltradas.map((tarefa, idx) => (
            <tr key={idx} className={`organizacao-list-item${tarefa.concluida ? ' concluida' : ''}`}>
              {editando === tarefas.indexOf(tarefa) ? (
                <>
                  <td></td>
                  <td>
                    <input
                      type="text"
                      value={textoEditado}
                      onChange={e => setTextoEditado(e.target.value)}
                      className="organizacao-input-edit"
                      onKeyDown={e => e.key === 'Enter' && salvarEdicao(tarefas.indexOf(tarefa))}
                      autoFocus
                    />
                  </td>
                  <td>
                    <select
                      value={prioridadeEditada}
                      onChange={e => setPrioridadeEditada(e.target.value)}
                      className="organizacao-input-edit"
                      style={{maxWidth: 80}}
                    >
                      <option value="baixa">Baixa</option>
                      <option value="média">Média</option>
                      <option value="alta">Alta</option>
                    </select>
                  </td>
                  <td>
                    <button onClick={() => salvarEdicao(tarefas.indexOf(tarefa))} className="organizacao-btn salvar">Salvar</button>
                    <button onClick={cancelarEdicao} className="organizacao-btn cancelar">Cancelar</button>
                  </td>
                </>
              ) : (
                <>
                  <td>
                    <input
                      type="checkbox"
                      checked={tarefa.concluida}
                      onChange={() => alternarConcluida(tarefas.indexOf(tarefa))}
                      title="Marcar como concluída"
                    />
                  </td>
                  <td>
                    <span style={{ textDecoration: tarefa.concluida ? 'line-through' : 'none' }}>
                      {tarefa.texto}
                    </span>
                  </td>
                  <td>
                    <span style={{
                      fontSize: 12,
                      color: tarefa.prioridade === 'alta' ? '#e74c3c' : tarefa.prioridade === 'média' ? '#f1c40f' : '#2ecc40',
                      fontWeight: 500
                    }}>
                      {tarefa.prioridade}
                    </span>
                  </td>
                  <td>
                    <button onClick={() => iniciarEdicao(tarefas.indexOf(tarefa), tarefa)} className="organizacao-btn editar">Editar</button>
                    <button onClick={() => excluirTarefa(tarefas.indexOf(tarefa))} className="organizacao-btn excluir">Excluir</button>
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

export default Organizacao;