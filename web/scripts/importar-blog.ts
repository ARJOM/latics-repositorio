// Importa os posts do blog https://laticsufcg.blogspot.com para o Firestore.
//
//   npm run importar-blog -- --simular saida.json   (não grava nada; salva o resultado num JSON para revisão)
//   npm run importar-blog                            (grava; não sobrescreve documentos que já existem)
//   npm run importar-blog -- --force                 (grava sobrescrevendo)
//
// - Textos viram `textos` publicados, categoria "Educação em saúde", com conteúdo em Markdown.
// - Posts de vídeo viram `videos` (título, link do YouTube e descrição).
// - Posts marcados como "eventos" ou "jogos" entram como textos ocultos, para revisão no painel.
// - As imagens são copiadas para o Storage (imagens/blog/), para não depender do blog.
import { createHash, randomUUID } from 'node:crypto'
import { writeFileSync } from 'node:fs'
import TurndownService from 'turndown'
import { FieldValue, Timestamp } from 'firebase-admin/firestore'
import { getStorage } from 'firebase-admin/storage'
import { db, projectId } from './admin'
import { palavrasBusca } from '../src/utils/busca'

const BLOG = 'https://laticsufcg.blogspot.com'
const BUCKET = process.env.FIREBASE_STORAGE_BUCKET ?? `${projectId}.firebasestorage.app`

const args = process.argv.slice(2)
const simular = args.includes('--simular') ? (args[args.indexOf('--simular') + 1] ?? 'importacao-blog.json') : null
const force = args.includes('--force')

interface Post {
  titulo: string
  data: Date
  marcadores: string[]
  html: string
  url: string
  slug: string
}

// ---------------------------------------------------------------- leitura do feed

async function lerFeed(): Promise<Post[]> {
  const posts: Post[] = []
  // O Blogger devolve menos itens que o pedido quando a página é grande; por isso páginas de 25.
  for (let inicio = 1; ; inicio += 25) {
    const r = await fetch(`${BLOG}/feeds/posts/default?alt=json&max-results=25&start-index=${inicio}`)
    if (!r.ok) throw new Error(`Feed respondeu ${r.status}`)
    const entradas = ((await r.json()) as any).feed.entry ?? []
    if (!entradas.length) break
    for (const e of entradas) {
      const url: string = e.link.find((l: any) => l.rel === 'alternate')?.href ?? ''
      posts.push({
        titulo: String(e.title.$t).replace(/\s+/g, ' ').trim(),
        data: new Date(e.published.$t),
        marcadores: (e.category ?? []).map((c: any) => c.term),
        html: e.content?.$t ?? '',
        url,
        slug: url.split('/').pop()!.replace(/\.html$/, ''),
      })
    }
  }
  return posts
}

// ---------------------------------------------------------------- utilidades de texto

const decodificar = (s: string) =>
  s
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))

// Tags de bloco viram espaço; tags dentro do texto (<span>, <b>…) somem sem separar a palavra ("Jos<span>é</span>").
const textoPuro = (html: string) =>
  decodificar(
    html
      .replace(/<(script|style)[\s\S]*?<\/\1>/gi, ' ')
      .replace(/<\/?(p|div|br|li|ul|ol|h\d|tr|td|th|table|blockquote|figure|figcaption)\b[^>]*>/gi, ' ')
      .replace(/<[^>]+>/g, ''),
  )
    .replace(/\s+/g, ' ')
    .trim()

const idsYoutube = (html: string) => [
  ...new Set([...html.matchAll(/(?:youtube(?:-nocookie)?\.com\/(?:embed\/|watch\?v=|v\/)|youtu\.be\/)([\w-]{11})/g)].map((m) => m[1]!)),
]

/** Autor a partir da assinatura "Texto elaborado pela Acadêmica X e pelo Professor Y." no fim do post. */
function extrairAutor(texto: string): string | null {
  const fim = texto.slice(-900)
  const m = [...fim.matchAll(/(?:elaborad|produzid|escrit|desenvolvid|redigid)[oa]s?\s+(?:pel[oa]s?|por)\s+(.+?)(?=$|\s(?:REFER[ÊE]NCIAS|Refer[êe]ncias)\b)/gi)].pop()
  if (!m) return null
  const autor = m[1]!
    .replace(/\s+e\s+(?:orientad[oa]s?\s+)?pel[oa]s?\s+/gi, ' e ')
    .replace(/,?\s*orientad[oa]s?\s+pel[oa]s?\s+/gi, ', orientação de ')
    .replace(/[.;\s]+$/, '')
    .trim()
  return autor.length >= 5 && autor.length <= 300 ? autor[0]!.toUpperCase() + autor.slice(1) : null
}

/** Primeiras frases do texto (sem repetir o título), com até ~260 caracteres. */
function extrairResumo(texto: string, titulo: string): string {
  let t = texto
  if (t.toLowerCase().startsWith(titulo.toLowerCase())) t = t.slice(titulo.length).trim()
  if (t.length <= 260) return t
  const corte = t.slice(0, 260)
  const ponto = corte.lastIndexOf('. ')
  return ponto > 120 ? corte.slice(0, ponto + 1) : corte.replace(/\s+\S*$/, '') + '…'
}

// ---------------------------------------------------------------- imagens

const imagensCopiadas = new Map<string, string>()
const falhasImagem: string[] = []

/** Pede ao Blogger uma versão de até 1200 px em vez da miniatura usada no post. */
const versaoGrande = (src: string) =>
  src.includes('googleusercontent.com') || src.includes('bp.blogspot.com')
    ? src.replace(/\/s\d+(-[\w-]+)?\//, '/s1200/').replace(/=[swh]\d+(-[\w-]+)*$/, '=s1200')
    : src

async function copiarImagem(src: string): Promise<string> {
  if (imagensCopiadas.has(src)) return imagensCopiadas.get(src)!
  if (simular) {
    imagensCopiadas.set(src, src)
    return src
  }
  const hash = createHash('sha1').update(src).digest('hex').slice(0, 20)
  const bucket = getStorage().bucket(BUCKET)
  try {
    let resp = await fetch(versaoGrande(src))
    if (!resp.ok) resp = await fetch(src)
    const tipo = resp.headers.get('content-type') ?? ''
    if (!resp.ok || !tipo.startsWith('image/')) throw new Error(`${resp.status} ${tipo}`)
    const ext = tipo.split('/')[1]!.replace('jpeg', 'jpg').replace(/\+.*/, '')
    const arquivo = bucket.file(`imagens/blog/${hash}.${ext}`)
    let token: string
    const [existe] = await arquivo.exists()
    if (existe) {
      const [meta] = await arquivo.getMetadata()
      token = String(meta.metadata?.firebaseStorageDownloadTokens ?? '').split(',')[0]!
    } else {
      token = randomUUID()
      await arquivo.save(Buffer.from(await resp.arrayBuffer()), {
        contentType: tipo,
        metadata: { cacheControl: 'public, max-age=31536000', metadata: { firebaseStorageDownloadTokens: token, origem: src } },
      })
    }
    const url = `https://firebasestorage.googleapis.com/v0/b/${BUCKET}/o/${encodeURIComponent(arquivo.name)}?alt=media&token=${token}`
    imagensCopiadas.set(src, url)
    return url
  } catch (e) {
    falhasImagem.push(`${src} (${(e as Error).message})`)
    imagensCopiadas.set(src, src) // mantém o link original
    return src
  }
}

async function copiarImagensDoHtml(html: string) {
  const srcs = [...new Set([...html.matchAll(/<img[^>]+src="([^"]+)"/gi)].map((m) => m[1]!))]
  // Algumas em paralelo para não demorar, sem sobrecarregar.
  for (let i = 0; i < srcs.length; i += 6) await Promise.all(srcs.slice(i, i + 6).map(copiarImagem))
}

// ---------------------------------------------------------------- HTML → Markdown

const turndown = new TurndownService({ headingStyle: 'atx', bulletListMarker: '-', emDelimiter: '*' })
turndown.remove(['script', 'style'])

// Legendas de imagem do Blogger: <table class="tr-caption-container"> com a imagem e a legenda.
turndown.addRule('legenda-blogger', {
  filter: (n) => n.nodeName === 'TABLE' && /tr-caption-container/.test((n as HTMLElement).getAttribute('class') ?? ''),
  replacement: (_c, n) => {
    const el = n as HTMLElement
    const img = el.querySelector('img')
    const legenda = (el.querySelector('.tr-caption')?.textContent ?? '').replace(/\s+/g, ' ').trim()
    if (!img) return legenda ? `\n\n*${legenda}*\n\n` : ''
    const src = imagensCopiadas.get(img.getAttribute('src') ?? '') ?? img.getAttribute('src')
    return `\n\n![${legenda}](${src})${legenda ? `\n*${legenda}*` : ''}\n\n`
  },
})
turndown.addRule('imagem', {
  filter: 'img',
  replacement: (_c, n) => {
    const src = (n as HTMLElement).getAttribute('src') ?? ''
    const alt = ((n as HTMLElement).getAttribute('alt') ?? '').trim()
    return src ? `\n\n![${alt}](${imagensCopiadas.get(src) ?? src})\n\n` : ''
  },
})
// Imagem envolta em link para a versão grande: fica só a imagem.
turndown.addRule('link-de-imagem', {
  filter: (n) => n.nodeName === 'A' && n.childNodes.length === 1 && n.firstChild?.nodeName === 'IMG',
  replacement: (c) => c,
})
turndown.addRule('iframe', {
  filter: 'iframe',
  replacement: (_c, n) => {
    const src = (n as HTMLElement).getAttribute('src') ?? ''
    const [yt] = idsYoutube(src)
    if (yt) return `\n\n[▶ Assista ao vídeo no YouTube](https://www.youtube.com/watch?v=${yt})\n\n`
    return src.startsWith('http') ? `\n\n[Abrir conteúdo incorporado](${src})\n\n` : ''
  },
})
turndown.addRule('instagram', {
  filter: (n) => n.nodeName === 'BLOCKQUOTE' && /instagram-media/.test((n as HTMLElement).getAttribute('class') ?? ''),
  replacement: (_c, n) => {
    const link = (n as HTMLElement).getAttribute('data-instgrm-permalink') ?? (n as HTMLElement).querySelector('a')?.getAttribute('href')
    return link ? `\n\n[Ver publicação no Instagram](${link.split('?')[0]})\n\n` : ''
  },
})

function paraMarkdown(html: string, titulo: string): string {
  let md = turndown.turndown(html.replace(/&nbsp;/g, ' '))
  md = md
    .replace(/ /g, ' ')
    .split('\n')
    .map((l) => l.replace(/^[ \t]+(?![-*+] |\d+\. )/, '').replace(/[ \t]+$/, '')) // recuos com &nbsp; virariam blocos de código
    .join('\n')
    .replace(/^\*\*\s*\*\*$/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
  // Títulos repetidos no começo do post.
  const primeira = md.split('\n')[0]!.replace(/[#*_\s]/g, '').toLowerCase()
  if (primeira && primeira === titulo.replace(/\s/g, '').toLowerCase()) md = md.split('\n').slice(1).join('\n').trim()
  return md
}

// ---------------------------------------------------------------- conversão

type Destino = { colecao: 'textos' | 'videos'; id: string; dados: Record<string, unknown>; aviso?: string }

function classificar(p: Post): 'texto' | 'video' | 'revisao' {
  if (p.marcadores.includes('eventos') || p.marcadores.includes('jogos')) return 'revisao'
  const palavras = textoPuro(p.html).split(' ').length
  if (p.marcadores.includes('videos') || (idsYoutube(p.html).length && palavras < 300)) return 'video'
  return 'texto'
}

async function main() {
  console.log(`Projeto: ${projectId}${simular ? ` — SIMULAÇÃO (nada será gravado; resultado em ${simular})` : ''}${force ? ' — sobrescrevendo' : ''}`)
  const posts = (await lerFeed()).sort((a, b) => b.data.getTime() - a.data.getTime())
  console.log(`  ${posts.length} posts lidos do blog`)

  const usados = new Set<string>()
  const novoId = (slug: string, ano: number) => {
    let id = slug || `post-${ano}`
    if (usados.has(id)) id = `${slug}-${ano}`
    for (let n = 2; usados.has(id); n++) id = `${slug}-${ano}-${n}`
    usados.add(id)
    return id
  }

  const destinos: Destino[] = []
  const videosVistos = new Set<string>()
  const repetidos: string[] = []
  let ordemVideo = 100

  for (const p of posts) {
    let tipo = classificar(p)
    const texto = textoPuro(p.html)
    const [yt] = idsYoutube(p.html)
    // Post de vídeo cujo vídeo sumiu: entra como texto oculto para revisão.
    if (tipo === 'video' && !yt) tipo = 'revisao'
    if (tipo === 'video' && videosVistos.has(yt!)) {
      repetidos.push(`${p.titulo} (${p.url})`)
      continue
    }
    const id = novoId(p.slug, p.data.getFullYear())

    if (tipo === 'video') {
      videosVistos.add(yt!)
      destinos.push({
        colecao: 'videos',
        id,
        dados: {
          titulo: p.titulo,
          youtubeUrl: `https://www.youtube.com/watch?v=${yt}`,
          duracao: '',
          descricao: texto.length > 1000 ? texto.slice(0, 1000).replace(/\s+\S*$/, '') + '…' : texto,
          ordem: ordemVideo++,
          active: true,
          origem: 'blog',
          blogUrl: p.url,
          createdAt: Timestamp.fromDate(p.data),
        },
      })
      continue
    }

    await copiarImagensDoHtml(p.html)
    const autor = extrairAutor(texto)
    destinos.push({
      colecao: 'textos',
      id,
      aviso:
        tipo === 'revisao'
          ? p.marcadores.includes('videos') ? 'post de vídeo sem vídeo do YouTube: importado oculto' : `marcado como ${p.marcadores.join('/')}: importado oculto`
          : autor ? undefined : 'sem assinatura de autor',
      dados: {
        titulo: p.titulo,
        categoria: 'Educação em saúde',
        autor: autor ?? 'Equipe LATICS',
        data: Timestamp.fromDate(p.data),
        resumo: extrairResumo(texto, p.titulo),
        conteudo: paraMarkdown(p.html, p.titulo),
        palavras: palavrasBusca(p.titulo),
        active: tipo !== 'revisao',
        origem: 'blog',
        blogUrl: p.url,
        createdAt: Timestamp.fromDate(p.data),
      },
    })
  }

  const textos = destinos.filter((d) => d.colecao === 'textos')
  const resumo = {
    textosPublicados: textos.filter((d) => d.dados.active).length,
    textosOcultos: textos.filter((d) => !d.dados.active).length,
    textosSemAutor: textos.filter((d) => d.aviso === 'sem assinatura de autor').length,
    videos: destinos.filter((d) => d.colecao === 'videos').length,
    imagens: imagensCopiadas.size,
    falhasImagem: falhasImagem.length,
  }
  console.log('  resultado:', resumo)
  if (repetidos.length) console.log('  posts de vídeo repetidos (mesmo vídeo de outro post, não importados):\n   ', repetidos.join('\n    '))

  if (simular) {
    const serial = destinos.map((d) => ({ ...d, dados: { ...d.dados, data: (d.dados.data as Timestamp | undefined)?.toDate(), createdAt: undefined } }))
    writeFileSync(simular, JSON.stringify({ resumo, falhasImagem, destinos: serial }, null, 2))
    return
  }

  let gravados = 0
  let ignorados = 0
  for (let i = 0; i < destinos.length; i += 400) {
    const batch = db.batch()
    for (const d of destinos.slice(i, i + 400)) {
      const ref = db.collection(d.colecao).doc(d.id)
      if (!force && (await ref.get()).exists) {
        ignorados++
        continue
      }
      batch.set(ref, { ...d.dados, updatedAt: FieldValue.serverTimestamp() })
      gravados++
    }
    await batch.commit()
  }
  console.log(`  gravados: ${gravados} | já existiam (ignorados): ${ignorados}`)
  if (falhasImagem.length) console.log('  imagens que mantiveram o link original:\n   ', falhasImagem.join('\n    '))
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
