import { createRouter, createWebHistory } from 'vue-router'
import PublicLayout from '@/layouts/PublicLayout.vue'

const AuthLayout = () => import('@/layouts/AuthLayout.vue')
const ConfigView = () => import('@/views/admin/ConfigView.vue')
import { useSessionStore, type Papel } from '@/stores/session'
import { configs, secoes } from '@/admin/secoes'

declare module 'vue-router' {
  interface RouteMeta {
    title?: string
    /** Exige login; com `papel`, exige também esse papel (admin inclui editor). */
    requiresAuth?: boolean
    papel?: Exclude<Papel, 'pendente'>
    /** Só para quem não está logado (login, cadastro). */
    guestOnly?: boolean
    /** Chave em `configs` (admin/secoes.ts) para as telas de configuração. */
    config?: string
  }
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior: (to, _from, saved) => saved ?? (to.hash ? { el: to.hash } : { top: 0 }),
  routes: [
    {
      path: '/',
      component: PublicLayout,
      children: [
        { path: '', name: 'home', component: () => import('@/views/public/HomeView.vue'), meta: { title: 'LATICS — Grupo de Pesquisa em TIC e Saúde' } },
        { path: 'textos-autorais', name: 'textos', component: () => import('@/views/public/TextosAutoraisView.vue'), meta: { title: 'Textos Autorais — LATICS' } },
        { path: 'tecnologias', name: 'tecnologias', component: () => import('@/views/public/TecnologiasView.vue'), meta: { title: 'Tecnologias — LATICS' } },
        { path: 'videos', name: 'videos', component: () => import('@/views/public/VideosView.vue'), meta: { title: 'Vídeos — LATICS' } },
        { path: 'extensao', name: 'extensao', component: () => import('@/views/public/ExtensaoView.vue'), meta: { title: 'Extensão — LATICS' } },
        { path: 'artigos', name: 'artigos', component: () => import('@/views/public/ArtigosView.vue'), meta: { title: 'Artigos Acadêmicos — LATICS' } },
      ],
    },
    {
      path: '/admin/login',
      component: AuthLayout,
      children: [{ path: '', name: 'login', component: () => import('@/views/admin/LoginView.vue'), meta: { title: 'Entrar — LATICS', guestOnly: true } }],
    },
    {
      path: '/admin/cadastro',
      component: AuthLayout,
      children: [{ path: '', name: 'cadastro', component: () => import('@/views/admin/CadastroView.vue'), meta: { title: 'Criar conta — LATICS', guestOnly: true } }],
    },
    {
      path: '/admin',
      component: () => import('@/layouts/AdminLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        { path: '', name: 'painel', component: () => import('@/views/admin/PainelView.vue'), meta: { title: 'Painel — LATICS' } },
        { path: 'usuarios', name: 'usuarios', component: () => import('@/views/admin/UsuariosView.vue'), meta: { title: 'Usuários — LATICS', papel: 'admin' } },
        ...Object.keys(configs).map((config) => ({
          path: config,
          name: `config-${config}`,
          component: ConfigView,
          meta: { title: `${configs[config]!.titulo} — LATICS`, papel: 'editor' as const, config },
        })),
        {
          path: `:secao(${Object.keys(secoes).join('|')})`,
          name: 'secao',
          component: () => import('@/views/admin/SecaoListaView.vue'),
          meta: { title: 'Painel — LATICS', papel: 'editor' },
        },
        {
          path: `:secao(${Object.keys(secoes).join('|')})/:id`,
          name: 'secao-form',
          component: () => import('@/views/admin/SecaoFormView.vue'),
          meta: { title: 'Painel — LATICS', papel: 'editor' },
        },
        { path: ':pathMatch(.*)*', redirect: '/admin' },
      ],
    },
    {
      path: '/',
      component: PublicLayout,
      children: [
        { path: ':pathMatch(.*)*', name: 'not-found', component: () => import('@/views/public/NotFoundView.vue'), meta: { title: 'Página não encontrada — LATICS' } },
      ],
    },
  ],
})

router.beforeEach(async (to) => {
  const session = useSessionStore()
  await session.aguardarPronto()

  if (to.meta.guestOnly && session.user) return { name: 'painel' }
  if (to.matched.some((r) => r.meta.requiresAuth) && !session.user) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }
  const papel = to.meta.papel
  if (papel === 'admin' && !session.isAdmin) return { name: 'painel' }
  if (papel === 'editor' && !session.isEditor) return { name: 'painel' }
})

router.afterEach((to) => {
  document.title = (to.meta.title as string | undefined) ?? 'LATICS — Grupo de Pesquisa'
})

export default router
