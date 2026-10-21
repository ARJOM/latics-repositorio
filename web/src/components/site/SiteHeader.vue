<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import { Menu, X } from 'lucide-vue-next'
import Logo from './Logo.vue'

const links = [
  { to: '/', label: 'Início' },
  { to: '/textos-autorais', label: 'Textos Autorais' },
  { to: '/tecnologias', label: 'Tecnologias' },
  { to: '/videos', label: 'Vídeos' },
  { to: '/extensao', label: 'Extensão' },
  { to: '/artigos', label: 'Artigos Acadêmicos' },
]

const open = ref(false)
</script>

<template>
  <header class="sticky top-0 z-40 border-b border-border/70 bg-background/80 backdrop-blur-lg">
    <div class="mx-auto flex h-18 max-w-6xl items-center justify-between gap-6 px-4 py-3">
      <RouterLink to="/" aria-label="LATICS — início" @click="open = false">
        <Logo />
      </RouterLink>

      <nav class="hidden items-center gap-1 lg:flex" aria-label="Principal">
        <RouterLink v-for="l in links" :key="l.to" :to="l.to" custom v-slot="{ href, navigate, isExactActive }">
          <a
            :href="href"
            @click="navigate"
            :class="[
              'rounded-full px-3.5 py-2 text-sm font-medium transition-colors hover:bg-secondary hover:text-foreground',
              isExactActive ? 'bg-secondary text-primary' : 'text-muted-foreground',
            ]"
          >
            {{ l.label }}
          </a>
        </RouterLink>
      </nav>

      <button
        class="grid h-10 w-10 place-items-center rounded-xl border border-border lg:hidden"
        :aria-label="open ? 'Fechar menu' : 'Abrir menu'"
        :aria-expanded="open"
        @click="open = !open"
      >
        <X v-if="open" :size="20" />
        <Menu v-else :size="20" />
      </button>
    </div>

    <nav v-if="open" class="border-t border-border bg-background px-4 py-3 lg:hidden" aria-label="Principal">
      <RouterLink v-for="l in links" :key="l.to" :to="l.to" custom v-slot="{ href, navigate, isExactActive }">
        <a
          :href="href"
          @click="(e) => { navigate(e); open = false }"
          :class="[
            'block rounded-lg px-3 py-2.5 font-medium',
            isExactActive ? 'bg-secondary text-primary' : 'text-muted-foreground',
          ]"
        >
          {{ l.label }}
        </a>
      </RouterLink>
    </nav>
  </header>
</template>
