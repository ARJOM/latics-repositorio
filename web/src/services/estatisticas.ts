// Contagem de visualizações: textos e tecnologias abertos, vídeos assistidos e artigos acessados.
// Cada item tem um contador em estatisticas/{colecao}/itens/{id} ({ total }), somado no máximo uma vez
// por sessão do navegador. As Security Rules só aceitam +1 em itens publicados; a leitura é só para editores.
// Desligada até o lançamento: liga com VITE_ESTATISTICAS=true em web/.env (e um novo deploy).
import { doc, increment, setDoc } from 'firebase/firestore/lite'
import { db } from '@/firebase'

export type Contavel = 'textos' | 'tecnologias' | 'videos' | 'artigos'

const ativa = import.meta.env.VITE_ESTATISTICAS === 'true'

export function registrarVisualizacao(colecao: Contavel, id: string) {
  if (!ativa) return
  const chave = `visto:${colecao}/${id}`
  try {
    if (sessionStorage.getItem(chave)) return
    sessionStorage.setItem(chave, '1')
  } catch {
    // Sem sessionStorage (modo privado restrito): conta mesmo assim.
  }
  setDoc(doc(db, 'estatisticas', colecao, 'itens', id), { total: increment(1) }, { merge: true }).catch((e) =>
    console.warn('Não foi possível registrar a visualização:', e),
  )
}
