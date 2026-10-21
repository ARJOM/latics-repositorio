// Gera, a partir de dist/index.html, um HTML por página pública com título, descrição e Open Graph próprios,
// além de sitemap.xml e robots.txt. Robôs que não executam JavaScript (WhatsApp, Facebook, LinkedIn…) leem
// esses arquivos; no navegador o Vue assume a página normalmente.
// Roda depois do build (npm run deploy). Textos publicados depois do deploy só entram no próximo.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import type { Timestamp } from 'firebase-admin/firestore'
import { db } from './admin'
import { absoluta, encurtar, IMAGEM_PADRAO, paginas, primeiraImagem, SITE_URL, type Seo } from '../src/seo'

const dist = join(import.meta.dirname, '..', 'dist')
const modelo = readFileSync(join(dist, 'index.html'), 'utf8')

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
const mesAno = (d: Date) => d.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric', timeZone: 'America/Sao_Paulo' })

function trocarMeta(html: string, seletor: string, valor: string) {
  const re = new RegExp(`(<${seletor})[^>]*?(content|href)="[^"]*"`)
  if (!re.test(html)) throw new Error(`index.html sem <${seletor}>`)
  return html.replace(re, `$1 $2="${esc(valor)}"`)
}

/** Grava /a/b em dist/a/b/index.html, que o Hosting serve em /a/b sem redirecionar. */
function gravar(caminho: string, seo: Seo, corpo: string) {
  const descricao = encurtar(seo.descricao)
  let html = modelo.replace(/<title>[^<]*<\/title>/, `<title>${esc(seo.titulo)}</title>`)
  html = trocarMeta(html, 'meta name="description"', descricao)
  html = trocarMeta(html, 'link rel="canonical"', SITE_URL + caminho)
  html = trocarMeta(html, 'meta property="og:type"', seo.tipo ?? 'website')
  html = trocarMeta(html, 'meta property="og:title"', seo.titulo)
  html = trocarMeta(html, 'meta property="og:description"', descricao)
  html = trocarMeta(html, 'meta property="og:image"', absoluta(seo.imagem ?? IMAGEM_PADRAO))
  html = trocarMeta(html, 'meta property="og:url"', SITE_URL + caminho)
  // O Vue substitui este conteúdo ao montar; até lá (ou sem JavaScript) ele fica visível.
  html = html.replace('<div id="app"></div>', `<div id="app">${corpo}</div>`)

  const arquivo = join(dist, caminho, 'index.html')
  mkdirSync(dirname(arquivo), { recursive: true })
  writeFileSync(arquivo, html)
}

const bloco = (titulo: string, ...paragrafos: string[]) =>
  `<main class="mx-auto max-w-3xl px-4 py-14"><h1 class="text-3xl font-extrabold">${esc(titulo)}</h1>` +
  paragrafos.map((p) => `<p class="mt-4 text-muted-foreground">${esc(p)}</p>`).join('') +
  '</main>'

const idValido = (id: string) => /^[\w-]+$/.test(id)

async function main() {
  const sitemap: { caminho: string; modificado?: Date }[] = [{ caminho: '/' }]

  // A Home fica no próprio index.html, que também serve de fallback para as demais rotas (/admin…).
  for (const [caminho, seo] of Object.entries(paginas)) {
    if (caminho === '/') continue
    gravar(caminho, seo, bloco(seo.titulo.replace(/ — LATICS$/, ''), seo.descricao))
    sitemap.push({ caminho })
  }

  const textos = await db.collection('textos').where('active', '==', true).get()
  for (const d of textos.docs) {
    if (!idValido(d.id)) continue
    const t = d.data()
    const data = (t.data as Timestamp).toDate()
    gravar(
      `/textos-autorais/${d.id}`,
      { titulo: `${t.titulo} — LATICS`, descricao: t.resumo || t.titulo, imagem: primeiraImagem(t.conteudo), tipo: 'article' },
      bloco(t.titulo, t.resumo ?? '', `${t.autor} · ${mesAno(data)}`),
    )
    sitemap.push({ caminho: `/textos-autorais/${d.id}`, modificado: (t.updatedAt as Timestamp | undefined)?.toDate() ?? data })
  }

  const tecnologias = await db.collection('tecnologias').where('active', '==', true).get()
  for (const d of tecnologias.docs) {
    if (!idValido(d.id)) continue
    const t = d.data()
    gravar(`/tecnologias/${d.id}`, { titulo: `${t.titulo} — LATICS`, descricao: t.texto, imagem: t.imagemUrl }, bloco(t.titulo, t.texto))
    sitemap.push({ caminho: `/tecnologias/${d.id}`, modificado: (t.updatedAt as Timestamp | undefined)?.toDate() })
  }

  writeFileSync(
    join(dist, 'sitemap.xml'),
    '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
      sitemap
        .map(
          (u) =>
            `  <url><loc>${esc(SITE_URL + u.caminho)}</loc>${u.modificado ? `<lastmod>${u.modificado.toISOString().slice(0, 10)}</lastmod>` : ''}</url>`,
        )
        .join('\n') +
      '\n</urlset>\n',
  )
  writeFileSync(join(dist, 'robots.txt'), `User-agent: *\nDisallow: /admin\n\nSitemap: ${SITE_URL}/sitemap.xml\n`)

  console.log(`${sitemap.length} páginas no sitemap (${textos.size} textos, ${tecnologias.size} tecnologias)`)
}

main().catch((e) => {
  console.error(e.message ?? e)
  process.exit(1)
})
