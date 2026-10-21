// Operações do painel. As Security Rules garantem que só editores (e admins, em users/) conseguem executá-las.
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  startAfter,
  Timestamp,
  updateDoc,
  where,
  writeBatch,
  type QueryConstraint,
  type QueryDocumentSnapshot,
} from 'firebase/firestore/lite'
import { getDownloadURL, getStorage, ref as storageRef, uploadBytes } from 'firebase/storage'
import { app, db } from '@/firebase'
import type { NomeColecao } from './conteudo'
import { palavrasBusca } from '@/utils/busca'
import type { Perfil } from '@/stores/session'

const storage = getStorage(app)

export type Registro = Record<string, unknown> & { id: string; active: boolean; ordem?: number }

const paraDate = (data: Record<string, unknown>) =>
  Object.fromEntries(Object.entries(data).map(([k, v]) => [k, v instanceof Timestamp ? v.toDate() : v]))

/** Todos os documentos, inclusive inativos. */
export async function listarTodos(colecao: NomeColecao, campoOrdem: string, direcao: 'asc' | 'desc') {
  const snap = await getDocs(query(collection(db, colecao), orderBy(campoOrdem, direcao)))
  return snap.docs.map((d) => ({ id: d.id, ...paraDate(d.data()) }) as Registro)
}

export type Situacao = 'todos' | 'publicados' | 'ocultos'

/**
 * Uma página de documentos (inclusive inativos), para coleções grandes.
 * `termo` usa o campo `palavras` (só textos): a palavra mais longa vai na consulta, as demais filtram no navegador.
 */
export async function listarPagina(
  colecao: NomeColecao,
  opcoes: {
    campo: string
    direcao: 'asc' | 'desc'
    situacao: Situacao
    termo?: string
    cursor?: QueryDocumentSnapshot | null
    tamanho?: number
  },
) {
  const tamanho = opcoes.tamanho ?? 25
  const palavras = palavrasBusca(opcoes.termo ?? '').sort((a, b) => b.length - a.length)
  const filtros: QueryConstraint[] = []
  if (opcoes.situacao !== 'todos') filtros.push(where('active', '==', opcoes.situacao === 'publicados'))
  if (palavras[0]) filtros.push(where('palavras', 'array-contains', palavras[0]))
  filtros.push(orderBy(opcoes.campo, opcoes.direcao))
  if (opcoes.cursor) filtros.push(startAfter(opcoes.cursor))
  filtros.push(limit(tamanho))

  const snap = await getDocs(query(collection(db, colecao), ...filtros))
  const resto = palavras.slice(1)
  const itens = snap.docs
    .map((d) => ({ id: d.id, ...paraDate(d.data()) }) as Registro & { palavras?: string[] })
    .filter((r) => resto.every((p) => r.palavras?.some((x) => x.startsWith(p))))
  return { itens, cursor: snap.docs.length === tamanho ? snap.docs.at(-1)! : null }
}

export async function obter(colecao: NomeColecao, id: string) {
  const snap = await getDoc(doc(db, colecao, id))
  return snap.exists() ? ({ id: snap.id, ...paraDate(snap.data()) } as Registro) : null
}

// Textos guardam as palavras do título para a busca do site.
const comIndice = (colecao: NomeColecao, dados: Record<string, unknown>) =>
  colecao === 'textos' && typeof dados.titulo === 'string' ? { ...dados, palavras: palavrasBusca(dados.titulo) } : dados

export async function criar(colecao: NomeColecao, dados: Record<string, unknown>, ordem: number) {
  const ref = await addDoc(collection(db, colecao), {
    ...comIndice(colecao, dados),
    ordem,
    active: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return ref.id
}

export async function atualizar(colecao: NomeColecao, id: string, dados: Record<string, unknown>) {
  await updateDoc(doc(db, colecao, id), { ...comIndice(colecao, dados), updatedAt: serverTimestamp() })
}

/** Troca a posição de dois itens de uma coleção ordenada manualmente. */
export async function trocarOrdem(colecao: NomeColecao, a: Registro, b: Registro) {
  const batch = writeBatch(db)
  batch.update(doc(db, colecao, a.id), { ordem: b.ordem, updatedAt: serverTimestamp() })
  batch.update(doc(db, colecao, b.id), { ordem: a.ordem, updatedAt: serverTimestamp() })
  await batch.commit()
}

export async function obterConfigBruta(nome: string) {
  const snap = await getDoc(doc(db, 'config', nome))
  return (snap.data() ?? {}) as Record<string, unknown>
}

export async function salvarConfig(nome: string, dados: Record<string, unknown>) {
  await setDoc(doc(db, 'config', nome), { ...dados, updatedAt: serverTimestamp() }, { merge: true })
}

/** Envia uma imagem para imagens/{pasta}/ e devolve a URL pública. */
export async function enviarImagem(arquivo: File, pasta: string) {
  const extensao = arquivo.name.split('.').pop()?.toLowerCase() ?? 'jpg'
  const caminho = `imagens/${pasta}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${extensao}`
  const ref = storageRef(storage, caminho)
  await uploadBytes(ref, arquivo, { contentType: arquivo.type })
  return getDownloadURL(ref)
}

export type Usuario = Perfil & { id: string; createdAt?: Date }

export async function listarUsuarios() {
  const snap = await getDocs(collection(db, 'users'))
  return snap.docs
    .map((d) => ({ id: d.id, ...paraDate(d.data()) }) as Usuario)
    .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
}

export async function atualizarUsuario(id: string, dados: Partial<Pick<Perfil, 'role' | 'active'>>) {
  await updateDoc(doc(db, 'users', id), { ...dados, updatedAt: serverTimestamp() })
}
