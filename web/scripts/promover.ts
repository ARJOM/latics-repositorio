// Define o papel de um usuário já cadastrado.
// Uso: npm run promover -- email@exemplo.com admin|editor|pendente
import { FieldValue } from 'firebase-admin/firestore'
import { auth, db } from './admin'

const [email, role] = process.argv.slice(2)
const papeis = ['admin', 'editor', 'pendente']

async function main() {
  if (!email || !role || !papeis.includes(role)) {
    console.error(`Uso: npm run promover -- <email> <${papeis.join('|')}>`)
    process.exit(1)
  }
  const user = await auth.getUserByEmail(email)
  await db.collection('users').doc(user.uid).set(
    { email, nome: user.displayName ?? email, role, active: true, updatedAt: FieldValue.serverTimestamp() },
    { merge: true },
  )
  console.log(`${email} agora é ${role}`)
}

main().catch((e) => {
  console.error(e.message ?? e)
  process.exit(1)
})
