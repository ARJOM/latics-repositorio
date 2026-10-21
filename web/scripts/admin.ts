// Firebase Admin com as credenciais padrão do gcloud (`gcloud auth application-default login`).
// Ignora as Security Rules: use só em scripts locais.
import { initializeApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'

const projectId = process.env.FIREBASE_PROJECT_ID ?? 'repositorio-latics'
// As credenciais do gcloud podem apontar a cobrança para outro projeto (quota_project_id);
// o Storage exige faturamento ativo nesse projeto, então fixamos o deste site.
process.env.GOOGLE_CLOUD_QUOTA_PROJECT ??= projectId
const app = initializeApp({ projectId })

export const auth = getAuth(app)
export const db = getFirestore(app)
export { projectId }
