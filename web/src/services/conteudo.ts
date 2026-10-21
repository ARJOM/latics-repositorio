import { FirebaseError } from 'firebase/app'
import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
  Timestamp,
  where,
  type QueryConstraint,
  type QueryDocumentSnapshot,
} from 'firebase/firestore/lite'
import { palavrasBusca } from '@/utils/busca'
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

export interface Colecoes {
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

/**
 * Um documento publicado. Documentos ocultos são negados pelas Rules para visitantes;
 * nesse caso (ou se não existir) devolve null.
 */
export async function obterAtivo<K extends NomeColecao>(nome: K, id: string): Promise<Colecoes[K] | null> {
  try {
    const snap = await getDoc(doc(db, nome, id))
    if (!snap.exists() || snap.data().active !== true) return null
    return converter<Colecoes[K]>(snap.id, snap.data())
  } catch (e) {
    if (e instanceof FirebaseError && e.code === 'permission-denied') return null
    throw e
  }
}

export interface PaginaTextos {
  itens: Texto[]
  /** Último documento da página, para buscar a próxima; null quando não há mais. */
  cursor: QueryDocumentSnapshot | null
}

/**
 * Textos publicados, do mais recente ao mais antigo, em páginas.
 * `termo` busca uma palavra do título (a mais longa digitada; as demais filtram no navegador).
 */
export async function listarTextos(opcoes: { ano?: number; termo?: string; cursor?: QueryDocumentSnapshot | null; tamanho?: number }) {
  const tamanho = opcoes.tamanho ?? 12
  const palavras = palavrasBusca(opcoes.termo ?? '').sort((a, b) => b.length - a.length)
  const filtros: QueryConstraint[] = [where('active', '==', true)]
  if (palavras[0]) filtros.push(where('palavras', 'array-contains', palavras[0]))
  if (opcoes.ano) {
    filtros.push(where('data', '>=', Timestamp.fromDate(new Date(opcoes.ano, 0, 1))))
    filtros.push(where('data', '<', Timestamp.fromDate(new Date(opcoes.ano + 1, 0, 1))))
  }
  filtros.push(orderBy('data', 'desc'))
  if (opcoes.cursor) filtros.push(startAfter(opcoes.cursor))
  filtros.push(limit(tamanho))

  const snap = await getDocs(query(collection(db, 'textos'), ...filtros))
  const resto = palavras.slice(1)
  const itens = snap.docs
    .map((d) => converter<Texto & { palavras?: string[] }>(d.id, d.data()))
    .filter((t) => resto.every((p) => t.palavras?.some((x) => x.startsWith(p))))
  return { itens, cursor: snap.docs.length === tamanho ? snap.docs.at(-1)! : null } satisfies PaginaTextos
}
