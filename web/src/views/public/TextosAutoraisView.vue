<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { ArrowUpRight } from 'lucide-vue-next'
import PageHeader from '@/components/site/PageHeader.vue'
import EstadoLista from '@/components/site/EstadoLista.vue'
import { useLista } from '@/composables/useConteudo'

const { itens: textos, carregando, erro } = useLista('textos')
import { mesAno } from '@/utils/format'
</script>

<template>
  <PageHeader
    eyebrow="Textos autorais"
    title="Reflexões da nossa equipe"
    description="Ensaios, relatos de experiência e textos de opinião sobre saúde e tecnologia."
  />
  <EstadoLista :carregando :erro :vazio="!textos.length">
  <div class="mx-auto grid max-w-6xl gap-6 px-4 py-16 md:grid-cols-2 lg:grid-cols-3">
    <RouterLink
      v-for="t in textos"
      :key="t.id"
      :to="`/textos-autorais/${t.id}`"
      class="group flex flex-col rounded-2xl border border-border bg-card p-6 shadow-soft transition hover:-translate-y-1 hover:border-primary/40 hover:shadow-lift"
    >
      <div class="flex items-center justify-between text-xs">
        <span class="rounded-full bg-secondary px-3 py-1 font-semibold text-primary">{{ t.categoria }}</span>
        <span class="text-muted-foreground">{{ mesAno(t.data) }}</span>
      </div>
      <h2 class="mt-5 text-lg leading-snug font-bold">{{ t.titulo }}</h2>
      <p class="mt-2 line-clamp-3 flex-1 text-sm text-muted-foreground">{{ t.resumo }}</p>
      <div class="mt-6 flex items-center justify-between text-sm">
        <span class="font-medium">{{ t.autor }}</span>
        <ArrowUpRight :size="18" class="text-muted-foreground transition group-hover:text-primary" />
      </div>
    </RouterLink>
  </div>
  </EstadoLista>
</template>
