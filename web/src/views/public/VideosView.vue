<script setup lang="ts">
import { Play } from 'lucide-vue-next'
import PageHeader from '@/components/site/PageHeader.vue'
import EstadoLista from '@/components/site/EstadoLista.vue'
import { useLista } from '@/composables/useConteudo'

const { itens: videos, carregando, erro } = useLista('videos')
</script>

<template>
  <PageHeader
    eyebrow="Vídeos"
    title="Assista ao nosso conteúdo"
    description="Tutoriais das tecnologias, apresentações e registros das nossas atividades."
  />
  <EstadoLista :carregando :erro :vazio="!videos.length">
  <div class="mx-auto grid max-w-6xl gap-6 px-4 py-16 sm:grid-cols-2 lg:grid-cols-3">
    <!-- O player em modal entra na fase 4 -->
    <article v-for="v in videos" :key="v.id" class="group">
      <div class="relative aspect-video overflow-hidden rounded-2xl bg-navy shadow-soft">
        <div class="absolute inset-0 bg-brand opacity-60 transition group-hover:opacity-80" />
        <span class="absolute inset-0 m-auto grid h-14 w-14 place-items-center rounded-full bg-card text-primary shadow-lift transition group-hover:scale-110">
          <Play :size="22" class="ml-0.5" fill="currentColor" />
        </span>
        <span class="absolute right-3 bottom-3 rounded-md bg-navy/80 px-2 py-0.5 text-xs font-medium text-navy-foreground">{{ v.duracao }}</span>
      </div>
      <h2 class="mt-3 font-semibold group-hover:text-primary">{{ v.titulo }}</h2>
    </article>
  </div>
  </EstadoLista>
</template>
