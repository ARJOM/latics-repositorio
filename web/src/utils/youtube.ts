/** Extrai o id de um link do YouTube (watch?v=, youtu.be/, embed/, shorts/, live/). */
export function idYoutube(url: string | undefined): string | null {
  if (!url) return null
  try {
    const u = new URL(url)
    const host = u.hostname.replace(/^(www\.|m\.)/, '')
    if (host === 'youtu.be') return u.pathname.slice(1) || null
    if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
      const v = u.searchParams.get('v')
      if (v) return v
      const [, tipo, id] = u.pathname.split('/')
      if (tipo && id && ['embed', 'shorts', 'live'].includes(tipo)) return id
    }
  } catch {
    // URL inválida
  }
  return null
}

export const embedYoutube = (id: string, autoplay = false) =>
  `https://www.youtube-nocookie.com/embed/${id}${autoplay ? '?autoplay=1' : ''}`

export const miniaturaYoutube = (id: string) => `https://img.youtube.com/vi/${id}/hqdefault.jpg`
