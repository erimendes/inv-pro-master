const API_URL = 'http://localhost:3000/hardware/assets';

// Adicionamos o parâmetro 'tipo' aqui
export async function getAssets(tipo?: string) {
  let url = API_URL;

  // Se o tipo existir e não for 'TODOS', adicionamos o filtro na URL
  if (tipo && tipo !== 'TODOS') {
    url += `?tipo=${tipo}`;
  }

  const res = await fetch(url);

  if (!res.ok) throw new Error('Erro ao buscar ativos');

  return res.json();
}

// ... as outras funções (getAsset, updateAsset) continuam iguais

export async function getAsset(id: number) {
  const res = await fetch(`${API_URL}/${id}`);

  if (!res.ok) throw new Error('Erro ao buscar ativo');

  return res.json();
}

export async function updateAsset(id: number, data: any) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error('Erro ao atualizar ativo');

  return res.json();
}
