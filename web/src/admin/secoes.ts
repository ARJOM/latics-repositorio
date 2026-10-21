// Descrição de cada coleção editável no painel. ResourceTable e ResourceForm montam as telas a partir daqui.
import type { NomeColecao } from '@/services/conteudo'

export type TipoCampo = 'texto' | 'textarea' | 'markdown' | 'url' | 'numero' | 'data' | 'select' | 'imagem' | 'indicadores'

export interface Campo {
  nome: string
  rotulo: string
  tipo: TipoCampo
  obrigatorio?: boolean
  opcoes?: string[]
  ajuda?: string
}

export interface Secao {
  colecao: NomeColecao
  titulo: string
  singular: string
  /** Rótulo do botão de criação, com a concordância certa ("Nova área", "Novo texto"). */
  novo: string
  /** Campos exibidos como colunas na tabela (o primeiro é o título da linha). */
  colunas: string[]
  campos: Campo[]
  /** Coleções ordenadas manualmente (campo `ordem`) ganham setas para reordenar. */
  ordenavel: boolean
}

export const icones = ['FlaskConical', 'Cpu', 'HeartHandshake', 'GraduationCap', 'BookOpen', 'Users', 'Stethoscope', 'Microscope', 'Lightbulb', 'Globe']

export const secoes: Record<string, Secao> = {
  areas: {
    colecao: 'areas',
    titulo: 'Áreas de atuação',
    singular: 'área',
    novo: 'Nova área',
    colunas: ['titulo'],
    ordenavel: true,
    campos: [
      { nome: 'titulo', rotulo: 'Título', tipo: 'texto', obrigatorio: true },
      { nome: 'texto', rotulo: 'Texto', tipo: 'textarea', obrigatorio: true },
      { nome: 'icone', rotulo: 'Ícone', tipo: 'select', opcoes: icones, ajuda: 'Usado quando não há imagem.' },
      { nome: 'imagemUrl', rotulo: 'Imagem', tipo: 'imagem' },
    ],
  },
  tecnologias: {
    colecao: 'tecnologias',
    titulo: 'Tecnologias',
    singular: 'tecnologia',
    novo: 'Nova tecnologia',
    colunas: ['titulo', 'tag'],
    ordenavel: true,
    campos: [
      { nome: 'titulo', rotulo: 'Título', tipo: 'texto', obrigatorio: true },
      { nome: 'tag', rotulo: 'Tag', tipo: 'texto', obrigatorio: true, ajuda: 'Ex.: Web, Sistema, Aplicativo.' },
      { nome: 'texto', rotulo: 'Descrição', tipo: 'textarea', obrigatorio: true },
      { nome: 'url', rotulo: 'Link da tecnologia', tipo: 'url' },
      { nome: 'tipo', rotulo: 'Tipo de link', tipo: 'select', opcoes: ['site', 'video'], obrigatorio: true },
      { nome: 'imagemUrl', rotulo: 'Imagem', tipo: 'imagem', obrigatorio: true },
    ],
  },
  equipe: {
    colecao: 'equipe',
    titulo: 'Equipe',
    singular: 'membro',
    novo: 'Novo membro',
    colunas: ['nome', 'papel'],
    ordenavel: true,
    campos: [
      { nome: 'nome', rotulo: 'Nome', tipo: 'texto', obrigatorio: true },
      { nome: 'papel', rotulo: 'Papel no grupo', tipo: 'textarea', obrigatorio: true },
      { nome: 'fotoUrl', rotulo: 'Foto', tipo: 'imagem', ajuda: 'Sem foto, o site mostra as iniciais.' },
    ],
  },
  textos: {
    colecao: 'textos',
    titulo: 'Textos autorais',
    singular: 'texto',
    novo: 'Novo texto',
    colunas: ['titulo', 'autor', 'data'],
    ordenavel: false,
    campos: [
      { nome: 'titulo', rotulo: 'Título', tipo: 'texto', obrigatorio: true },
      { nome: 'categoria', rotulo: 'Categoria', tipo: 'select', opcoes: ['Educação em saúde', 'Ensaio', 'Relato', 'Opinião'], obrigatorio: true },
      { nome: 'autor', rotulo: 'Autor', tipo: 'texto', obrigatorio: true },
      { nome: 'data', rotulo: 'Data', tipo: 'data', obrigatorio: true },
      { nome: 'resumo', rotulo: 'Resumo', tipo: 'textarea', obrigatorio: true },
      { nome: 'conteudo', rotulo: 'Conteúdo', tipo: 'markdown', ajuda: 'Aceita Markdown: **negrito**, *itálico*, ## títulos, listas e [links](https://…).' },
    ],
  },
  videos: {
    colecao: 'videos',
    titulo: 'Vídeos',
    singular: 'vídeo',
    novo: 'Novo vídeo',
    colunas: ['titulo', 'duracao'],
    ordenavel: true,
    campos: [
      { nome: 'titulo', rotulo: 'Título', tipo: 'texto', obrigatorio: true },
      { nome: 'youtubeUrl', rotulo: 'Link do YouTube', tipo: 'url', obrigatorio: true },
      { nome: 'duracao', rotulo: 'Duração', tipo: 'texto', ajuda: 'Ex.: 5:10' },
      { nome: 'descricao', rotulo: 'Descrição', tipo: 'textarea', ajuda: 'Aparece abaixo do player.' },
    ],
  },
  acoesExtensao: {
    colecao: 'acoesExtensao',
    titulo: 'Ações de extensão',
    singular: 'ação',
    novo: 'Nova ação',
    colunas: ['titulo', 'local', 'data'],
    ordenavel: false,
    campos: [
      { nome: 'titulo', rotulo: 'Título', tipo: 'texto', obrigatorio: true },
      { nome: 'local', rotulo: 'Local', tipo: 'texto', obrigatorio: true },
      { nome: 'data', rotulo: 'Data', tipo: 'data', obrigatorio: true },
    ],
  },
  artigos: {
    colecao: 'artigos',
    titulo: 'Artigos acadêmicos',
    singular: 'artigo',
    novo: 'Novo artigo',
    colunas: ['titulo', 'periodico', 'ano'],
    ordenavel: false,
    campos: [
      { nome: 'titulo', rotulo: 'Título', tipo: 'texto', obrigatorio: true },
      { nome: 'autores', rotulo: 'Autores', tipo: 'texto', obrigatorio: true },
      { nome: 'periodico', rotulo: 'Periódico', tipo: 'texto', obrigatorio: true },
      { nome: 'ano', rotulo: 'Ano', tipo: 'numero', obrigatorio: true },
      { nome: 'link', rotulo: 'Link (DOI ou PDF)', tipo: 'url' },
    ],
  },
}

export interface SecaoConfig {
  doc: 'site' | 'contato' | 'extensao'
  titulo: string
  descricao: string
  campos: Campo[]
}

export const configs: Record<string, SecaoConfig> = {
  home: {
    doc: 'site',
    titulo: 'Conteúdo da Home',
    descricao: 'Textos do topo e da seção "Quem somos".',
    campos: [
      { nome: 'heroSelo', rotulo: 'Selo acima do título', tipo: 'texto' },
      { nome: 'heroTitulo', rotulo: 'Título (antes de "LATICS")', tipo: 'texto', obrigatorio: true },
      { nome: 'heroSubtitulo', rotulo: 'Subtítulo', tipo: 'textarea' },
      { nome: 'quemSomosTitulo', rotulo: 'Título de "Quem somos"', tipo: 'texto', obrigatorio: true },
      { nome: 'quemSomosTexto', rotulo: 'Texto de "Quem somos"', tipo: 'textarea', obrigatorio: true },
    ],
  },
  contato: {
    doc: 'contato',
    titulo: 'Informações de contato',
    descricao: 'Exibidas no rodapé de todas as páginas. Redes sem link não aparecem.',
    campos: [
      { nome: 'email', rotulo: 'E-mail', tipo: 'texto', obrigatorio: true },
      { nome: 'endereco', rotulo: 'Endereço', tipo: 'textarea', obrigatorio: true },
      { nome: 'youtube', rotulo: 'YouTube', tipo: 'url' },
      { nome: 'instagram', rotulo: 'Instagram', tipo: 'url' },
      { nome: 'tiktok', rotulo: 'TikTok', tipo: 'url' },
    ],
  },
  extensao: {
    doc: 'extensao',
    titulo: 'Programa de extensão',
    descricao: 'Descrição e indicadores da página Extensão. As ações ficam em "Ações de extensão".',
    campos: [
      { nome: 'programa', rotulo: 'Nome do programa', tipo: 'texto', obrigatorio: true },
      { nome: 'descricao', rotulo: 'Descrição', tipo: 'textarea', obrigatorio: true },
      { nome: 'imagemUrl', rotulo: 'Imagem', tipo: 'imagem' },
      { nome: 'indicadores', rotulo: 'Indicadores', tipo: 'indicadores', ajuda: 'Números de destaque, como "+40 ações".' },
    ],
  },
}
