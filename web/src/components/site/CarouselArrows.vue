<script setup lang="ts">
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'

defineEmits<{ prev: []; next: [] }>()

const cls =
  'grid h-11 w-11 place-items-center rounded-full border border-border bg-card shadow-soft transition hover:border-primary hover:text-primary'
</script>

<template>
  <div class="flex gap-2">
    <button :class="cls" aria-label="Anterior" @click="$emit('prev')"><ChevronLeft :size="20" /></button>
    <button :class="cls" aria-label="Próximo" @click="$emit('next')"><ChevronRight :size="20" /></button>
  </div>
</template>
