// Título, descrição e Open Graph de cada página. Usado pelo router (no navegador) e por
// scripts/gerar-paginas.ts, que grava um HTML por página no deploy para robôs que não executam JavaScript.

export const SITE_URL = 'https://repositorio-latics.web.app'
export const IMAGEM_PADRAO = '/og.jpg'

export interface Seo {
  titulo: string
  descricao: string
  /** URL absoluta ou caminho no site. */
  imagem?: string
  tipo?: 'website' | 'article'
}

/** Páginas públicas fixas, por caminho. */
export const paginas: Record<string, Seo> = {
  '/': {
    titulo: 'LATICS — Grupo de Pesquisa em TIC e Saúde',
    descricao:
      'Laboratório de Tecnologias de Informação e Comunicação em Saúde (UFCG/UFFS): pesquisa, tecnologias, extensão e educação em saúde.',
  },
  '/textos-autorais': {
    titulo: 'Textos Autorais — LATICS',
    descricao: 'Textos de educação em saúde, ensaios, relatos de experiência e textos de opinião escritos pela equipe do LATICS.',
  },
  '/tecnologias': {
    titulo: 'Tecnologias — LATICS',
    descricao: 'Sistemas, sites e aplicativos desenvolvidos pelo LATICS para o cuidado e a educação em saúde.',
  },
  '/videos': {
    titulo: 'Vídeos — LATICS',
    descricao: 'Vídeos de educação em saúde produzidos pela equipe do LATICS.',
  },
  '/extensao': {
    titulo: 'Extensão — LATICS',
    descricao: 'Ações de extensão do LATICS junto à comunidade.',
  },
  '/artigos': {
    titulo: 'Artigos Acadêmicos — LATICS',
    descricao: 'Produção científica do LATICS publicada em periódicos e eventos.',
  },
}

export const absoluta = (url: string) => (url.startsWith('http') ? url : SITE_URL + url)

/** Resumo de até ~160 caracteres para a meta description. */
export function encurtar(texto: string, max = 160) {
  const limpo = texto.replace(/\s+/g, ' ').trim()
  return limpo.length <= max ? limpo : limpo.slice(0, limpo.lastIndexOf(' ', max - 1)) + '…'
}

/** Primeira imagem do Markdown de um texto, para a prévia ao compartilhar. */
export const primeiraImagem = (markdown = '') => markdown.match(/!\[[^\]]*\]\((https?:\/\/[^)\s]+)/)?.[1]

/** Atualiza título, descrição, Open Graph e canonical da página atual. */
export function definirSeo(seo: Seo, caminho = location.pathname) {
  document.title = seo.titulo
  const meta = (atributo: 'name' | 'property', chave: string, valor: string) => {
    let el = document.head.querySelector<HTMLMetaElement>(`meta[${atributo}="${chave}"]`)
    if (!el) {
      el = document.createElement('meta')
      el.setAttribute(atributo, chave)
      document.head.append(el)
    }
    el.content = valor
  }
  const descricao = encurtar(seo.descricao)
  meta('name', 'description', descricao)
  meta('property', 'og:title', seo.titulo)
  meta('property', 'og:description', descricao)
  meta('property', 'og:image', absoluta(seo.imagem ?? IMAGEM_PADRAO))
  meta('property', 'og:url', SITE_URL + caminho)
  meta('property', 'og:type', seo.tipo ?? 'website')
  document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.setAttribute('href', SITE_URL + caminho)
}
