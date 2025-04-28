'use client'
import React, { useState, useCallback } from 'react';

const ComponentePai = () => {
  const [itens, setItens] = useState<string[]>(['Maçã', 'Banana', 'Laranja']);
  const [filtro, setFiltro] = useState<string>('');

  // A função é recriada apenas quando o filtro mudar
  const filtrarItens = useCallback(() => {
    return itens.filter(item => item.toLowerCase().includes(filtro.toLowerCase()));
  }, [filtro, itens]);  // A função é atualizada quando 'filtro' ou 'itens' mudar

  return (
    <div>
      <input
        type="text"
        value={filtro}
        onChange={e => setFiltro(e.target.value)}
        placeholder="Filtrar itens"
      />
      <ul>
        {filtrarItens().map(item => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
};

export default ComponentePai;
