const API_URL = 'http://localhost:3000/aplicacoes';

export async function getAplicacoes(
  categoria?: string,
  criticidade?: string
) {
  const params = new URLSearchParams();

  if (categoria && categoria !== 'TODOS') {
    params.append('categoria', categoria);
  }

  if (criticidade && criticidade !== 'TODOS') {
    params.append('criticidade', criticidade);
  }

  const url = params.toString()
    ? `${API_URL}?${params.toString()}`
    : API_URL;

  const res = await fetch(url);

  if (!res.ok) {
    throw new Error('Erro ao buscar aplicações');
  }

  return res.json();
}
