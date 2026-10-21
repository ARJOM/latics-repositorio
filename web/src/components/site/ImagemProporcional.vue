<script setup lang="ts">
import { computed } from 'vue'

// Imagem enviada pelo painel exibida sempre na mesma proporção, seja qual for a do arquivo:
// reserva o espaço antes do carregamento (sem salto de layout) e recorta o excedente.
const props = withDefaults(
  defineProps<{
    src: string
    /** Largura ÷ altura; use proporcaoImagem() para ler a do painel. */
    proporcao: number
    alt?: string
    /** Largura intrínseca informada ao navegador; a altura sai da proporção. */
    largura?: number
    carregamento?: 'lazy' | 'eager'
  }>(),
  { alt: '', largura: 1600, carregamento: 'lazy' },
)

const altura = computed(() => Math.round(props.largura / props.proporcao))
</script>

<template>
  <img
    :src
    :alt
    :width="largura"
    :height="altura"
    :loading="carregamento"
    decoding="async"
    class="w-full bg-muted object-cover"
    :style="{ aspectRatio: proporcao }"
  />
</template>
