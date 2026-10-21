// Formato dos documentos do Firestore (docs/plano-migracao-firebase.md, §3).
// Os dados vêm do Firestore (services/conteudo.ts); o conteúdo de exemplo está em scripts/dados-exemplo.ts.

export interface Area {
  id: string
  titulo: string
  texto: string
  icone: string
  imagemUrl?: string
}

export interface Tecnologia {
  id: string
  titulo: string
  tag: string
  texto: string
  imagemUrl: string
  url: string
  tipo: 'site' | 'video'
}

export interface Membro {
  id: string
  nome: string
  papel: string
  fotoUrl?: string
}

export interface Texto {
  id: string
  titulo: string
  categoria: 'Ensaio' | 'Relato' | 'Opinião' | 'Educação em saúde'
  autor: string
  data: Date
  resumo: string
  conteudo?: string
  /** Endereço do post original, para textos importados do blog. */
  blogUrl?: string
}

export interface Video {
  id: string
  titulo: string
  duracao: string
  youtubeUrl: string
  descricao?: string
}

export interface Artigo {
  id: string
  titulo: string
  autores: string
  periodico: string
  ano: number
  link: string
}

export interface AcaoExtensao {
  id: string
  titulo: string
  local: string
  data: Date
}

export interface ConfigSite {
  heroSelo: string
  heroTitulo: string
  heroSubtitulo: string
  quemSomosTitulo: string
  quemSomosTexto: string
}

export interface ConfigContato {
  email: string
  endereco: string
  youtube: string
  instagram: string
  tiktok: string
}

export interface ConfigExtensao {
  programa: string
  descricao: string
  imagemUrl: string
  indicadores: { valor: string; rotulo: string }[]
}
