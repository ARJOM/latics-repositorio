// Importa os projetos do Django (projetos_projeto) como tecnologias OCULTAS no Firestore.
// Mantém o UUID como id do documento, para que os links antigos /projeto/<uuid> continuem
// funcionando (redirect em firebase.json). Título, descrição e imagem são completados no painel.
//
// Uso: npm run migrar-django [-- caminho/para/db.sqlite3]   (padrão: ../db.sqlite3)
// Usuários do Django não são migrados: quem precisar de acesso cria conta em /admin/cadastro.
import { DatabaseSync } from 'node:sqlite'
import { FieldValue, Timestamp } from 'firebase-admin/firestore'
import { db, projectId } from './admin'

const caminho = process.argv[2] ?? '../db.sqlite3'

interface ProjetoDjango {
  id: string
  url: string
  project_type: 'site' | 'video'
  created_at: string
}

// Django guarda UUIDField no SQLite como 32 dígitos hexadecimais; as URLs usam o formato com hífens.
const uuidComHifens = (hex: string) =>
  `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`

async function main() {
  const sqlite = new DatabaseSync(caminho, { readOnly: true })
  const projetos = sqlite.prepare('SELECT id, url, project_type, created_at FROM projetos_projeto ORDER BY created_at').all() as unknown as ProjetoDjango[]
  sqlite.close()
  console.log(`Projeto: ${projectId} — ${projetos.length} projeto(s) em ${caminho}`)

  const existentes = await db.collection('tecnologias').orderBy('ordem', 'desc').limit(1).get()
  let ordem = ((existentes.docs[0]?.data().ordem as number | undefined) ?? -1) + 1

  for (const p of projetos) {
    const id = uuidComHifens(p.id)
    const ref = db.collection('tecnologias').doc(id)
    if ((await ref.get()).exists) {
      console.log(`  ${id}: já existe, ignorado`)
      continue
    }
    const host = new URL(p.url).hostname.replace(/^www\./, '')
    await ref.set({
      titulo: `Projeto importado (${host})`,
      tag: 'Importado',
      texto: '',
      imagemUrl: '',
      url: p.url,
      tipo: p.project_type === 'video' ? 'video' : 'site',
      ordem: ordem++,
      active: false,
      createdAt: Timestamp.fromDate(new Date(p.created_at.replace(' ', 'T') + 'Z')),
      updatedAt: FieldValue.serverTimestamp(),
    })
    console.log(`  ${id}: importado como oculto (${p.project_type}, ${host})`)
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
