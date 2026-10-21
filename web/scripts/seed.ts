// Popula o Firestore com o conteúdo de exemplo do protótipo.
// Uso: npm run seed            (não sobrescreve documentos que já existem)
//      npm run seed -- --force (sobrescreve)
import { FieldValue } from 'firebase-admin/firestore'
import { db, projectId } from './admin'
import * as dados from './dados-exemplo'

const force = process.argv.includes('--force')

const colecoes: Record<string, { id: string }[]> = {
  areas: dados.areas,
  tecnologias: dados.tecnologias,
  equipe: dados.equipe,
  textos: dados.textos,
  videos: dados.videos,
  artigos: dados.artigos,
  acoesExtensao: dados.acoesExtensao,
}

const configs: Record<string, object> = {
  site: dados.site,
  contato: dados.contato,
  extensao: dados.extensaoConfig,
}

const carimbo = () => ({ createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp() })

async function gravar(ref: FirebaseFirestore.DocumentReference, data: object) {
  if (!force && (await ref.get()).exists) return false
  await ref.set({ ...data, ...carimbo() })
  return true
}

async function main() {
  console.log(`Projeto: ${projectId}${force ? ' (sobrescrevendo)' : ''}`)

  for (const [nome, itens] of Object.entries(colecoes)) {
    let gravados = 0
    for (const [ordem, { id, ...resto }] of itens.entries()) {
      if (await gravar(db.collection(nome).doc(id), { ...resto, ordem, active: true })) gravados++
    }
    console.log(`  ${nome}: ${gravados}/${itens.length} gravados`)
  }

  for (const [id, data] of Object.entries(configs)) {
    const ok = await gravar(db.collection('config').doc(id), data)
    console.log(`  config/${id}: ${ok ? 'gravado' : 'já existia'}`)
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
