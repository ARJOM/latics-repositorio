// Conteúdo de exemplo copiado do protótipo do Lovable. Gravado no Firestore por scripts/seed.ts.
// As imagens ficam em public/exemplo/ e são servidas pelo Hosting.
import type {
  AcaoExtensao,
  Area,
  Artigo,
  ConfigContato,
  ConfigExtensao,
  ConfigSite,
  Membro,
  Tecnologia,
  Texto,
  Video,
} from '../src/types'

const tech = '/exemplo/tech.jpg'
const extensao = '/exemplo/extensao.jpg'

export const lorem =
  'Suspendisse dignissim est at ante mollis, ut dapibus dui ornare. Maecenas nec magna posuere, dapibus lorem vitae, fringilla nulla. In a porta tortor, id cursus nunc.'

export const site: ConfigSite = {
  heroSelo: 'Grupo de Pesquisa · UFCG',
  heroTitulo: 'Bem-vindos ao',
  heroSubtitulo: 'Um Laboratório de Tecnologias de Informação e Comunicação em Saúde.',
  quemSomosTitulo: 'Pesquisa e tecnologia a serviço da saúde',
  quemSomosTexto:
    'O LATICS é um grupo de pesquisa voltado para a área da saúde, com desenvolvimento de tecnologias. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam vitae dolor gravida erat finibus molestie. Sed ut ante at est placerat congue ac sed arcu.',
}

export const contato: ConfigContato = {
  email: 'laticsufcg@gmail.com',
  endereco: 'Rua Sérgio Moreira de Figueiredo, S/n - Populares, Cajazeiras - PB, 58900-000',
  youtube: '#',
  instagram: '#',
  tiktok: '#',
}

export const areas: Area[] = [
  { id: 'pesquisas', titulo: 'Pesquisas', icone: 'FlaskConical', texto: lorem },
  { id: 'tecnologias', titulo: 'Tecnologias', icone: 'Cpu', texto: lorem, imagemUrl: tech },
  {
    id: 'extensao',
    titulo: 'Extensão',
    icone: 'HeartHandshake',
    imagemUrl: extensao,
    texto:
      'Atividades vinculadas ao programa "Atenção à saúde e vigilância no enfrentamento de doenças infectocontagiosas no município de Cajazeiras-PB".',
  },
  { id: 'educacao', titulo: 'Educação em Saúde', icone: 'GraduationCap', texto: lorem },
]

export const tecnologias: Tecnologia[] = [
  { id: 'infografico', titulo: 'Infográfico Interativo', tag: 'Web', texto: lorem, imagemUrl: tech, url: '', tipo: 'site' },
  { id: 'notificacao', titulo: 'Notificação Compulsória', tag: 'Sistema', texto: lorem, imagemUrl: tech, url: '', tipo: 'site' },
  { id: 'quiz-idoso', titulo: 'Quiz Cuidado ao Idoso', tag: 'Aplicativo', texto: lorem, imagemUrl: tech, url: '', tipo: 'site' },
  { id: 'exemplo', titulo: 'Exemplo', tag: 'Em desenvolvimento', texto: lorem, imagemUrl: tech, url: '', tipo: 'site' },
]

export const equipe: Membro[] = Array.from({ length: 4 }, (_, i) => ({
  id: `membro-${i}`,
  nome: 'Marcelo Fernandes',
  papel: 'Líder do Grupo de Pesquisa Saúde Coletiva; Hanseníase e Minorias Sexuais e de Gênero',
  fotoUrl: '/exemplo/membro.png',
}))

const d = (ano: number, mes: number) => new Date(ano, mes - 1, 1)

export const textos: Texto[] = [
  { id: 't1', titulo: 'Tecnologia e cuidado: aproximações possíveis', autor: 'Marcelo Fernandes', data: d(2025, 9), categoria: 'Ensaio', resumo: lorem },
  { id: 't2', titulo: 'Vigilância em saúde no sertão paraibano', autor: 'Equipe LATICS', data: d(2025, 8), categoria: 'Relato', resumo: lorem },
  { id: 't3', titulo: 'Educação em saúde mediada por aplicativos', autor: 'Equipe LATICS', data: d(2025, 6), categoria: 'Opinião', resumo: lorem },
  { id: 't4', titulo: 'Hanseníase: desafios e caminhos', autor: 'Marcelo Fernandes', data: d(2025, 4), categoria: 'Ensaio', resumo: lorem },
  { id: 't5', titulo: 'O cuidado ao idoso na atenção primária', autor: 'Equipe LATICS', data: d(2025, 3), categoria: 'Relato', resumo: lorem },
  { id: 't6', titulo: 'Minorias e acesso à saúde', autor: 'Equipe LATICS', data: d(2025, 1), categoria: 'Opinião', resumo: lorem },
]

export const videos: Video[] = [
  { id: 'v1', titulo: 'Apresentação do LATICS', duracao: '3:42', youtubeUrl: '' },
  { id: 'v2', titulo: 'Como usar o Infográfico Interativo', duracao: '5:10', youtubeUrl: '' },
  { id: 'v3', titulo: 'Notificação compulsória na prática', duracao: '8:25', youtubeUrl: '' },
  { id: 'v4', titulo: 'Quiz Cuidado ao Idoso — tutorial', duracao: '4:03', youtubeUrl: '' },
  { id: 'v5', titulo: 'Ação de extensão em Cajazeiras', duracao: '6:18', youtubeUrl: '' },
  { id: 'v6', titulo: 'Roda de conversa: saúde e tecnologia', duracao: '21:47', youtubeUrl: '' },
]

export const artigos: Artigo[] = [
  { id: 'a1', titulo: 'Desenvolvimento e validação de infográfico interativo sobre cuidados transicionais', periodico: 'Revista Brasileira de Enfermagem', ano: 2025, autores: 'Fernandes M., et al.', link: '#' },
  { id: 'a2', titulo: 'Sistema digital para notificação compulsória: estudo metodológico', periodico: 'Cogitare Enfermagem', ano: 2024, autores: 'Fernandes M., et al.', link: '#' },
  { id: 'a3', titulo: 'Aplicativo educativo para o cuidado ao idoso: avaliação de usabilidade', periodico: 'Texto & Contexto Enfermagem', ano: 2024, autores: 'Equipe LATICS', link: '#' },
  { id: 'a4', titulo: 'Hanseníase e minorias sexuais e de gênero: revisão de escopo', periodico: 'Ciência & Saúde Coletiva', ano: 2023, autores: 'Fernandes M., et al.', link: '#' },
  { id: 'a5', titulo: 'Tecnologias educacionais em saúde no semiárido nordestino', periodico: 'Revista de Saúde Pública', ano: 2023, autores: 'Equipe LATICS', link: '#' },
]

export const extensaoConfig: ConfigExtensao = {
  programa: 'Atenção à saúde e vigilância no enfrentamento de doenças infectocontagiosas no município de Cajazeiras-PB',
  descricao: `${lorem} ${lorem}`,
  imagemUrl: extensao,
  indicadores: [
    { valor: '+40', rotulo: 'ações' },
    { valor: '+1.200', rotulo: 'pessoas atendidas' },
    { valor: '6', rotulo: 'parceiros' },
  ],
}

export const acoesExtensao: AcaoExtensao[] = [
  { id: 'e1', titulo: 'Aferição de pressão e orientação comunitária', local: 'Cajazeiras-PB', data: d(2025, 10) },
  { id: 'e2', titulo: 'Oficina de prevenção a doenças infectocontagiosas', local: 'Escola municipal', data: d(2025, 8) },
  { id: 'e3', titulo: 'Busca ativa de casos de hanseníase', local: 'UBS Populares', data: d(2025, 5) },
]
