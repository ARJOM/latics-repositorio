<script setup lang="ts">
// Mostra uma tecnologia embutida na página (como fazia o site antigo, em Django).
import { computed } from 'vue'
import { ExternalLink } from 'lucide-vue-next'
import { embedYoutube, idYoutube } from '@/utils/youtube'

const props = defineProps<{ url: string; tipo: 'site' | 'video'; titulo: string }>()

const src = computed(() => {
  if (props.tipo === 'video') {
    const id = idYoutube(props.url)
    return id ? embedYoutube(id) : null
  }
  return props.url || null
})
</script>

<template>
  <div v-if="src">
    <div
      :class="[
        'overflow-hidden rounded-3xl border border-border bg-muted shadow-soft',
        tipo === 'video' ? 'aspect-video' : 'h-[75vh] min-h-[480px]',
      ]"
    >
      <iframe
        :src="src"
        :title="titulo"
        class="h-full w-full"
        loading="lazy"
        referrerpolicy="strict-origin-when-cross-origin"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
        allowfullscreen
      />
    </div>
    <!-- Alguns sites bloqueiam a exibição dentro de outras páginas; o link garante o acesso. -->
    <p class="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
      <span>Não carregou? Alguns sites não permitem ser exibidos dentro de outra página.</span>
      <a
        :href="url"
        target="_blank"
        rel="noopener"
        class="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 font-semibold text-foreground transition hover:border-primary hover:text-primary"
      >
        Abrir em nova aba <ExternalLink :size="16" />
      </a>
    </p>
  </div>
</template>
