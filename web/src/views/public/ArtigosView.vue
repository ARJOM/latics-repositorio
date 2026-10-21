<script setup lang="ts">
import { ExternalLink, FileText } from 'lucide-vue-next'
import PageHeader from '@/components/site/PageHeader.vue'
import EstadoLista from '@/components/site/EstadoLista.vue'
import { useLista } from '@/composables/useConteudo'
import { registrarVisualizacao } from '@/services/estatisticas'

const { itens: artigos, carregando, erro } = useLista('artigos')
</script>

<template>
  <PageHeader
    eyebrow="Artigos acadêmicos"
    title="Produção científica"
    description="Artigos publicados pela equipe em periódicos nacionais e internacionais."
  />
  <EstadoLista :carregando :erro :vazio="!artigos.length">
  <div class="mx-auto max-w-4xl divide-y divide-border px-4 py-12">
    <article v-for="a in artigos" :key="a.id" class="group flex gap-5 py-6">
      <span class="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-secondary text-primary">
        <FileText :size="22" />
      </span>
      <div class="flex-1">
        <h2 class="leading-snug font-bold">{{ a.titulo }}</h2>
        <p class="mt-1 text-sm text-muted-foreground">{{ a.autores }} · <em>{{ a.periodico }}</em> · {{ a.ano }}</p>
      </div>
      <a
        :href="a.link"
        target="_blank"
        rel="noopener"
        aria-label="Abrir artigo"
        class="self-center text-muted-foreground transition hover:text-primary"
        @click="registrarVisualizacao('artigos', a.id)"
      >
        <ExternalLink :size="18" />
      </a>
    </article>
  </div>
  </EstadoLista>
</template>
