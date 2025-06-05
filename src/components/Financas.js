import React, { useState } from 'react';

function Financas() {
  const [transacoes, setTransacoes] = useState([]);
  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');
  const [tipo, setTipo] = useState('despesa');
  const [categoria, setCategoria] = useState('');
  const [data, setData] = useState('');

  const adicionarTransacao = () => {
    if (descricao.trim() && valor && categoria && data) {
      setTransacoes([
        ...transacoes,
        {
          descricao,
          valor: parseFloat(valor) * (tipo === 'despesa' ? -1 : 1),
          tipo,
          categoria,
          data
        }
      ]);
      setDescricao('');
      setValor('');
      setTipo('despesa');
      setCategoria('');
      setData('');
    }
  };

  const total = transacoes.reduce((acc, t) => acc + t.valor, 0);

  return (
    <section className="organizacao-modulo">
      <h3>💰 Finanças</h3>
      <div className="organizacao-input-row" style={{flexWrap: 'wrap', gap: 8}}>
        <select
          value={tipo}
          onChange={e => setTipo(e.target.value)}
          className="organizacao-input"
          style={{maxWidth: 110}}
        >
          <option value="despesa">Despesa</option>
          <option value="receita">Receita</option>
        </select>
        <input
          type="text"
          value={descricao}
          onChange={e => setDescricao(e.target.value)}
          placeholder="Descrição (ex: Faculdade, Netflix)"
          className="organizacao-input"
        />
        <input
          type="text"
          value={categoria}
          onChange={e => setCategoria(e.target.value)}
          placeholder="Categoria (ex: Educação, Lazer)"
          className="organizacao-input"
        />
        <input
          type="number"
          value={valor}
          onChange={e => setValor(e.target.value)}
          placeholder="Valor"
          className="organizacao-input"
          min="0"
        />
        <input
          type="date"
          value={data}
          onChange={e => setData(e.target.value)}
          className="organizacao-input"
          style={{maxWidth: 150}}
        />
        <button onClick={adicionarTransacao} className="organizacao-btn">+</button>
      </div>
      <ul className="organizacao-list">
        {transacoes.map((t, idx) => (
          <li key={idx} className="organizacao-list-item">
            <strong>{t.tipo === 'despesa' ? '🔻' : '🔺'} {t.descricao}</strong> <br />
            Categoria: {t.categoria} <br />
            Valor: <span style={{color: t.tipo === 'despesa' ? '#e74c3c' : '#27ae60'}}>
              R$ {Math.abs(t.valor).toFixed(2)}
            </span> <br />
            Data: {t.data}
          </li>
        ))}
        {transacoes.length === 0 && (
          <li className="organizacao-list-empty">Nenhuma transação registrada.</li>
        )}
      </ul>
      <div style={{marginTop: 8, fontWeight: 600}}>
        Total: <span style={{color: total < 0 ? '#e74c3c' : '#27ae60'}}>R$ {total.toFixed(2)}</span>
      </div>
    </section>
  );
}

export default Financas;