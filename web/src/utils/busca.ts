// Busca por título no Firestore: cada texto guarda as palavras normalizadas do título em `palavras`,
// e a consulta usa array-contains. Usado pelo site, pelo painel e pelo script de importação do blog.

const ignorar = new Set(['para', 'com', 'dos', 'das', 'nos', 'nas', 'uma', 'por', 'que', 'pela', 'pelo', 'sobre', 'entre'])

/** Remove acentos e pontuação, deixa em minúsculas. */
export function normalizar(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
}

/** Palavras do título que entram no índice de busca (3+ letras, sem repetição). */
export function palavrasBusca(titulo: string): string[] {
  const palavras = normalizar(titulo)
    .split(/[\s-]+/)
    .filter((p) => p.length >= 3 && !ignorar.has(p))
  return [...new Set(palavras)]
}
