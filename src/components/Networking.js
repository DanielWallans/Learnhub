import React, { useState } from 'react';

function Networking() {
  const [contatos, setContatos] = useState([]);
  const [novoContato, setNovoContato] = useState('');

  const adicionarContato = () => {
    if (novoContato.trim()) {
      setContatos([...contatos, novoContato]);
      setNovoContato('');
    }
  };

  return (
    <section className="organizacao-modulo">
      <h3>🤝 Networking</h3>
      <div className="organizacao-input-row">
        <input
          type="text"
          value={novoContato}
          onChange={e => setNovoContato(e.target.value)}
          placeholder="Adicionar contato ou mentor"
          className="organizacao-input"
        />
        <button onClick={adicionarContato} className="organizacao-btn">+</button>
      </div>
      <ul className="organizacao-list">
        {contatos.map((c, idx) => (
          <li key={idx} className="organizacao-list-item">{c}</li>
        ))}
        {contatos.length === 0 && (
          <li className="organizacao-list-empty">Nenhum contato registrado.</li>
        )}
      </ul>
    </section>
  );
}

export default Networking;