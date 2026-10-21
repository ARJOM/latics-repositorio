<script setup lang="ts">
import PageHeader from '@/components/site/PageHeader.vue'
import EstadoLista from '@/components/site/EstadoLista.vue'
import { useLista } from '@/composables/useConteudo'

const { itens: tecnologias, carregando, erro } = useLista('tecnologias')
</script>

<template>
  <PageHeader
    eyebrow="Tecnologias"
    title="Soluções digitais para o cuidado em saúde"
    description="Aplicativos, sistemas e materiais interativos criados pela nossa equipe."
  />
  <EstadoLista :carregando :erro :vazio="!tecnologias.length">
  <div class="mx-auto grid max-w-6xl gap-8 px-4 py-16 md:grid-cols-2">
    <!-- O link para /tecnologias/:id entra na fase 4 -->
    <article
      v-for="t in tecnologias"
      :key="t.id"
      class="group overflow-hidden rounded-2xl border border-border bg-card shadow-soft transition hover:-translate-y-1 hover:shadow-lift"
    >
      <div class="overflow-hidden bg-muted">
        <img :src="t.imagemUrl" alt="" loading="lazy" class="aspect-[16/9] w-full object-cover transition duration-500 group-hover:scale-105" />
      </div>
      <div class="p-6">
        <span class="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-primary">{{ t.tag }}</span>
        <h2 class="mt-4 text-xl font-bold">{{ t.titulo }}</h2>
        <p class="mt-2 text-sm leading-relaxed text-muted-foreground">{{ t.texto }}</p>
      </div>
    </article>
  </div>
  </EstadoLista>
</template>
