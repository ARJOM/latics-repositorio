<script setup lang="ts">
defineProps<{ eyebrow: string; title: string; description: string }>()
</script>

<template>
  <section class="border-b border-border bg-secondary/50">
    <div class="mx-auto max-w-6xl px-4 py-16 md:py-20">
      <p class="mb-3 text-xs font-semibold tracking-widest text-primary uppercase">{{ eyebrow }}</p>
      <h1 class="max-w-3xl text-4xl font-extrabold md:text-5xl">{{ title }}</h1>
      <p class="mt-4 max-w-2xl text-lg text-muted-foreground">{{ description }}</p>
    </div>
  </section>
</template>
