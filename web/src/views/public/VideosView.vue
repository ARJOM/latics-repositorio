<script setup lang="ts">
import { ref } from 'vue'
import { Play } from 'lucide-vue-next'
import PageHeader from '@/components/site/PageHeader.vue'
import VideoModal from '@/components/site/VideoModal.vue'
import EstadoLista from '@/components/site/EstadoLista.vue'
import { useLista } from '@/composables/useConteudo'
import type { Video } from '@/types'
import { idYoutube, miniaturaYoutube } from '@/utils/youtube'

const { itens: videos, carregando, erro } = useLista('videos')
const aberto = ref<Video | null>(null)
</script>

<template>
  <PageHeader
    eyebrow="Vídeos"
    title="Assista ao nosso conteúdo"
    description="Tutoriais das tecnologias, apresentações e registros das nossas atividades."
  />
  <EstadoLista :carregando :erro :vazio="!videos.length">
    <div class="mx-auto grid max-w-6xl gap-6 px-4 py-16 sm:grid-cols-2 lg:grid-cols-3">
      <button
        v-for="v in videos"
        :key="v.id"
        type="button"
        class="group text-left disabled:cursor-default"
        :disabled="!idYoutube(v.youtubeUrl)"
        :aria-label="`Assistir: ${v.titulo}`"
        @click="aberto = v"
      >
        <div class="relative aspect-video overflow-hidden rounded-2xl bg-navy shadow-soft">
          <img
            v-if="idYoutube(v.youtubeUrl)"
            :src="miniaturaYoutube(idYoutube(v.youtubeUrl)!)"
            alt=""
            loading="lazy"
            class="absolute inset-0 h-full w-full object-cover"
          />
          <div class="absolute inset-0 bg-brand opacity-60 transition group-hover:opacity-80 group-disabled:opacity-60" />
          <span class="absolute inset-0 m-auto grid h-14 w-14 place-items-center rounded-full bg-card text-primary shadow-lift transition group-hover:scale-110 group-disabled:scale-100">
            <Play :size="22" class="ml-0.5" fill="currentColor" />
          </span>
          <span v-if="v.duracao" class="absolute right-3 bottom-3 rounded-md bg-navy/80 px-2 py-0.5 text-xs font-medium text-navy-foreground">{{ v.duracao }}</span>
        </div>
        <h2 class="mt-3 font-semibold group-hover:text-primary group-disabled:text-foreground">{{ v.titulo }}</h2>
      </button>
    </div>
  </EstadoLista>
  <VideoModal :video="aberto" @fechar="aberto = null" />
</template>
