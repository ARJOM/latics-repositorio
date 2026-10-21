import { collection, doc, getDoc, getDocs, orderBy, query, Timestamp, where } from 'firebase/firestore'
import { db } from '@/firebase'
import type {
  AcaoExtensao,
  Area,
  Artigo,
  ConfigContato,
  ConfigExtensao,
  ConfigSite,
  Membro,
  Tecnologia,
  Texto,
  Video,
} from '@/types'

interface Colecoes {
  areas: Area
  tecnologias: Tecnologia
  equipe: Membro
  textos: Texto
  videos: Video
  artigos: Artigo
  acoesExtensao: AcaoExtensao
}

interface Configs {
  site: ConfigSite
  contato: ConfigContato
  extensao: ConfigExtensao
}

export type NomeColecao = keyof Colecoes

// Ordem das listagens públicas — cada par precisa de um índice em firestore.indexes.json.
const ordenacao: Record<NomeColecao, [campo: string, direcao: 'asc' | 'desc']> = {
  areas: ['ordem', 'asc'],
  tecnologias: ['ordem', 'asc'],
  equipe: ['ordem', 'asc'],
  videos: ['ordem', 'asc'],
  textos: ['data', 'desc'],
  acoesExtensao: ['data', 'desc'],
  artigos: ['ano', 'desc'],
}

/** Converte Timestamps do Firestore em Date (campos `data`, `createdAt`…). */
function converter<T>(id: string, data: Record<string, unknown>): T {
  const out: Record<string, unknown> = { id }
  for (const [k, v] of Object.entries(data)) out[k] = v instanceof Timestamp ? v.toDate() : v
  return out as T
}

/** Documentos ativos de uma coleção, na ordem pública. */
export async function listarAtivos<K extends NomeColecao>(nome: K): Promise<Colecoes[K][]> {
  const [campo, direcao] = ordenacao[nome]
  const snap = await getDocs(query(collection(db, nome), where('active', '==', true), orderBy(campo, direcao)))
  return snap.docs.map((d) => converter<Colecoes[K]>(d.id, d.data()))
}

export async function obterConfig<K extends keyof Configs>(nome: K): Promise<Configs[K] | null> {
  const snap = await getDoc(doc(db, 'config', nome))
  return snap.exists() ? (snap.data() as Configs[K]) : null
}
