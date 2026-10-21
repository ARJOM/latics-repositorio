<script setup lang="ts">
// Mostra "carregando", "erro" ou "vazio" no lugar de uma lista do Firestore.
defineProps<{ carregando: boolean; erro: boolean; vazio: boolean }>()
</script>

<template>
  <div v-if="carregando" class="flex justify-center py-16" role="status" aria-label="Carregando">
    <span class="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-primary" />
  </div>
  <p v-else-if="erro" class="py-16 text-center text-muted-foreground">
    Não foi possível carregar o conteúdo. Tente recarregar a página.
  </p>
  <p v-else-if="vazio" class="py-16 text-center text-muted-foreground">Nenhum item publicado ainda.</p>
  <slot v-else />
</template>
