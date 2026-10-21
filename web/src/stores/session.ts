import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  type User,
} from 'firebase/auth'
import { doc, onSnapshot, serverTimestamp, setDoc, type Unsubscribe } from 'firebase/firestore'
import { auth, db } from '@/firebase'

export type Papel = 'admin' | 'editor' | 'pendente'

export interface Perfil {
  nome: string
  email: string
  role: Papel
  active: boolean
}

export const useSessionStore = defineStore('session', () => {
  const user = ref<User | null>(null)
  const perfil = ref<Perfil | null>(null)
  const pronto = ref(false)

  const isEditor = computed(() => !!perfil.value?.active && ['admin', 'editor'].includes(perfil.value.role))
  const isAdmin = computed(() => !!perfil.value?.active && perfil.value.role === 'admin')

  let pararPerfil: Unsubscribe | null = null
  let resolverPronto: () => void
  const aguardarPronto = new Promise<void>((r) => (resolverPronto = r))

  const marcarPronto = () => {
    pronto.value = true
    resolverPronto()
  }

  onAuthStateChanged(auth, (u) => {
    user.value = u
    pararPerfil?.()
    pararPerfil = null

    if (!u) {
      perfil.value = null
      marcarPronto()
      return
    }

    // Acompanha o perfil em tempo real: aprovação ou desativação valem sem recarregar a página.
    pararPerfil = onSnapshot(
      doc(db, 'users', u.uid),
      (snap) => {
        perfil.value = snap.exists() ? (snap.data() as Perfil) : null
        if (perfil.value?.active === false) signOut(auth)
        marcarPronto()
      },
      () => {
        perfil.value = null
        marcarPronto()
      },
    )
  })

  async function entrar(email: string, senha: string) {
    await signInWithEmailAndPassword(auth, email, senha)
  }

  async function cadastrar(nome: string, email: string, senha: string) {
    const { user: u } = await createUserWithEmailAndPassword(auth, email, senha)
    await updateProfile(u, { displayName: nome })
    await setDoc(doc(db, 'users', u.uid), {
      nome,
      email,
      role: 'pendente',
      active: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
  }

  async function sair() {
    await signOut(auth)
  }

  async function redefinirSenha(email: string) {
    await sendPasswordResetEmail(auth, email)
  }

  return { user, perfil, pronto, isEditor, isAdmin, aguardarPronto: () => aguardarPronto, entrar, cadastrar, sair, redefinirSenha }
})
