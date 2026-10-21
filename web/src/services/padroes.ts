// Valores exibidos enquanto config/* carrega (ou se o documento ainda não existir).
import type { ConfigContato, ConfigExtensao, ConfigSite } from '@/types'

export const sitePadrao: ConfigSite = {
  heroSelo: 'Grupo de Pesquisa · UFCG',
  heroTitulo: 'Bem-vindos ao',
  heroSubtitulo: 'Um Laboratório de Tecnologias de Informação e Comunicação em Saúde.',
  quemSomosTitulo: 'Pesquisa e tecnologia a serviço da saúde',
  quemSomosTexto: '',
}

export const contatoPadrao: ConfigContato = {
  email: 'laticsufcg@gmail.com',
  endereco: 'Rua Sérgio Moreira de Figueiredo, S/n - Populares, Cajazeiras - PB, 58900-000',
  youtube: '',
  instagram: '',
  tiktok: '',
}

export const extensaoPadrao: ConfigExtensao = {
  programa: '',
  descricao: '',
  imagemUrl: '',
  indicadores: [],
}
