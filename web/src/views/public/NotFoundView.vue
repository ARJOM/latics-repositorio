<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <div class="flex min-h-[60vh] items-center justify-center px-4">
    <div class="max-w-md text-center">
      <h1 class="text-7xl font-bold">404</h1>
      <h2 class="mt-4 text-xl font-semibold">Página não encontrada</h2>
      <p class="mt-2 text-sm text-muted-foreground">A página que você procura não existe ou foi movida.</p>
      <RouterLink
        to="/"
        class="mt-6 inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
      >
        Voltar ao início
      </RouterLink>
    </div>
  </div>
</template>
