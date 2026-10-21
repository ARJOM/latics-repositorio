<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import Logo from '@/components/site/Logo.vue'
</script>

<template>
  <div class="flex min-h-screen flex-col items-center justify-center bg-secondary/50 px-4 py-12">
    <RouterLink to="/" class="mb-8" aria-label="Voltar ao site">
      <Logo />
    </RouterLink>
    <div class="w-full max-w-sm rounded-3xl border border-border bg-card p-8 shadow-soft">
      <RouterView />
    </div>
  </div>
</template>
