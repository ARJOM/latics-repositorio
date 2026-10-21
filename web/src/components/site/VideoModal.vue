<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { X } from 'lucide-vue-next'
import type { Video } from '@/types'
import { embedYoutube, idYoutube } from '@/utils/youtube'

const props = defineProps<{ video: Video | null }>()
const emit = defineEmits<{ fechar: [] }>()

const dialogo = ref<HTMLDialogElement | null>(null)
const id = computed(() => idYoutube(props.video?.youtubeUrl))

// <dialog> nativo: Esc fecha, o foco fica preso dentro e o fundo não rola.
watch(
  () => props.video,
  (v) => (v ? dialogo.value?.showModal() : dialogo.value?.close()),
)

function clicouFundo(e: MouseEvent) {
  if (e.target === dialogo.value) emit('fechar')
}
</script>

<template>
  <dialog
    ref="dialogo"
    class="m-auto w-[min(960px,calc(100vw-2rem))] max-w-none rounded-3xl bg-navy p-0 text-navy-foreground shadow-lift backdrop:bg-navy/70 backdrop:backdrop-blur-sm"
    :aria-label="video?.titulo"
    @close="emit('fechar')"
    @click="clicouFundo"
  >
    <div v-if="video" class="p-3 sm:p-4">
      <div class="mb-3 flex items-center justify-between gap-4 px-1">
        <h2 class="font-semibold">{{ video.titulo }}</h2>
        <button class="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-navy-foreground/10 transition hover:bg-primary" aria-label="Fechar" @click="emit('fechar')">
          <X :size="18" />
        </button>
      </div>
      <div class="aspect-video overflow-hidden rounded-2xl bg-black">
        <iframe
          v-if="id"
          :src="embedYoutube(id, true)"
          :title="video.titulo"
          class="h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
          allowfullscreen
        />
      </div>
      <p v-if="video.descricao" class="mt-3 max-h-40 overflow-y-auto px-1 text-sm whitespace-pre-line text-navy-foreground/80">{{ video.descricao }}</p>
    </div>
  </dialog>
</template>
