import React, { useState } from 'react';

function Leituras() {
  const [leituras, setLeituras] = useState([]);
  const [novaLeitura, setNovaLeitura] = useState('');

  const adicionarLeitura = () => {
    if (novaLeitura.trim()) {
      setLeituras([...leituras, novaLeitura]);
      setNovaLeitura('');
    }
  };

  return (
    <section className="organizacao-modulo">
      <h3>📚 Leituras</h3>
      <div className="organizacao-input-row">
        <input
          type="text"
          value={novaLeitura}
          onChange={e => setNovaLeitura(e.target.value)}
          placeholder="Adicionar livro, artigo ou curso"
          className="organizacao-input"
        />
        <button onClick={adicionarLeitura} className="organizacao-btn">+</button>
      </div>
      <ul className="organizacao-list">
        {leituras.map((leitura, idx) => (
          <li key={idx} className="organizacao-list-item">{leitura}</li>
        ))}
        {leituras.length === 0 && (
          <li className="organizacao-list-empty">Nenhuma leitura registrada.</li>
        )}
      </ul>
    </section>
  );
}

export default Leituras;