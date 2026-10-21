<script setup lang="ts">
import { ref, watch } from 'vue'
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router'
import {
  BookOpen,
  CalendarDays,
  Cpu,
  ExternalLink,
  FileText,
  HeartHandshake,
  House,
  Layers,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  PlayCircle,
  Users,
  UserCog,
  X,
} from 'lucide-vue-next'
import Logo from '@/components/site/Logo.vue'
import { useSessionStore } from '@/stores/session'

const session = useSessionStore()
const router = useRouter()
const route = useRoute()
const aberto = ref(false)
watch(() => route.fullPath, () => (aberto.value = false))

// Sidebar do Figma, com os nomes padronizados e as seções que faltavam.
const grupos = [
  {
    titulo: 'Geral',
    itens: [
      { to: '/admin', label: 'Visão geral', icon: LayoutDashboard },
      { to: '/admin/usuarios', label: 'Usuários', icon: UserCog, soAdmin: true },
      { to: '/admin/home', label: 'Conteúdo da Home', icon: House },
      { to: '/admin/contato', label: 'Informações de Contato', icon: Mail },
    ],
  },
  {
    titulo: 'Conteúdo',
    itens: [
      { to: '/admin/areas', label: 'Áreas', icon: Layers },
      { to: '/admin/tecnologias', label: 'Tecnologias', icon: Cpu },
      { to: '/admin/equipe', label: 'Equipe', icon: Users },
      { to: '/admin/textos', label: 'Textos Autorais', icon: FileText },
      { to: '/admin/videos', label: 'Vídeos', icon: PlayCircle },
      { to: '/admin/extensao', label: 'Programa de Extensão', icon: HeartHandshake },
      { to: '/admin/acoesExtensao', label: 'Ações de Extensão', icon: CalendarDays },
      { to: '/admin/artigos', label: 'Artigos Acadêmicos', icon: BookOpen },
    ],
  },
]

const ativo = (to: string) => (to === '/admin' ? route.path === '/admin' : route.path.startsWith(to))

async function sair() {
  await session.sair()
  router.push({ name: 'login' })
}
</script>

<template>
  <div class="min-h-screen bg-secondary/30 lg:flex">
    <!-- Barra superior no celular -->
    <header class="flex h-16 items-center justify-between border-b border-border bg-card px-4 lg:hidden">
      <RouterLink to="/admin"><Logo /></RouterLink>
      <button class="grid h-10 w-10 place-items-center rounded-xl border border-border" :aria-label="aberto ? 'Fechar menu' : 'Abrir menu'" @click="aberto = !aberto">
        <X v-if="aberto" :size="20" />
        <Menu v-else :size="20" />
      </button>
    </header>

    <aside
      :class="[
        'border-r border-border bg-card lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-72 lg:shrink-0 lg:flex-col',
        aberto ? 'flex flex-col' : 'hidden',
      ]"
    >
      <div class="hidden items-center gap-3 px-6 py-5 lg:flex">
        <RouterLink to="/admin"><Logo /></RouterLink>
      </div>

      <nav class="flex-1 overflow-y-auto px-3 py-2" aria-label="Painel">
        <div v-for="g in grupos" :key="g.titulo" class="mb-4">
          <p class="px-3 pb-2 text-[11px] font-semibold tracking-widest text-muted-foreground uppercase">{{ g.titulo }}</p>
          <template v-for="item in g.itens" :key="item.to">
            <RouterLink
              v-if="!item.soAdmin || session.isAdmin"
              :to="item.to"
              :class="[
                'flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors',
                ativo(item.to) ? 'bg-secondary text-primary' : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground',
              ]"
            >
              <component :is="item.icon" :size="18" />
              {{ item.label }}
            </RouterLink>
          </template>
        </div>
      </nav>

      <div class="border-t border-border p-4">
        <p class="truncate text-sm font-semibold">{{ session.perfil?.nome ?? session.user?.email }}</p>
        <p class="truncate text-xs text-muted-foreground">{{ session.user?.email }}</p>
        <div class="mt-3 flex gap-2">
          <RouterLink to="/" target="_blank" class="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full border border-border px-3 py-2 text-xs font-medium transition hover:border-primary hover:text-primary">
            <ExternalLink :size="14" /> Ver site
          </RouterLink>
          <button class="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full border border-border px-3 py-2 text-xs font-medium transition hover:border-destructive hover:text-destructive" @click="sair">
            <LogOut :size="14" /> Sair
          </button>
        </div>
      </div>
    </aside>

    <main class="min-w-0 flex-1 px-4 py-8 md:px-10 md:py-10">
      <div class="mx-auto max-w-5xl">
        <RouterView />
      </div>
    </main>
  </div>
</template>
