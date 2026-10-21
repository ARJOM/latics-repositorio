// As páginas públicas só carregam o Firestore Lite (leituras e gravações, sem tempo real).
// Auth e o Firestore completo (stores/session.ts) e Storage (services/admin.ts) ficam nos módulos do painel,
// carregados sob demanda.
import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore/lite'

export const app = initializeApp({
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
})

export const db = getFirestore(app)
