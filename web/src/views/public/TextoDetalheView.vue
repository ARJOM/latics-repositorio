<script setup lang="ts">
import { computed, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { ArrowLeft, CalendarDays, UserRound } from 'lucide-vue-next'
import EstadoLista from '@/components/site/EstadoLista.vue'
import NotFoundView from './NotFoundView.vue'
import { useDocumento } from '@/composables/useConteudo'
import { mesAno } from '@/utils/format'
import { renderizarMarkdown } from '@/utils/markdown'
import { definirSeo, primeiraImagem } from '@/seo'
import { registrarVisualizacao } from '@/services/estatisticas'

const route = useRoute()
const { item: texto, carregando, erro } = useDocumento('textos', computed(() => route.params.id as string))

const corpo = computed(() => (texto.value?.conteudo ? renderizarMarkdown(texto.value.conteudo) : ''))

watch(texto, (t) => {
  if (!t) return
  definirSeo({ titulo: `${t.titulo} — LATICS`, descricao: t.resumo || t.titulo, imagem: primeiraImagem(t.conteudo), tipo: 'article' })
  registrarVisualizacao('textos', t.id)
})
</script>

<template>
  <EstadoLista :carregando :erro :vazio="false">
    <NotFoundView v-if="!texto" />
    <article v-else>
      <header class="border-b border-border bg-secondary/50">
        <div class="mx-auto max-w-3xl px-4 py-14 md:py-20">
          <RouterLink to="/textos-autorais" class="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-primary">
            <ArrowLeft :size="16" /> Textos autorais
          </RouterLink>
          <span class="mt-6 block w-fit rounded-full bg-card px-3 py-1 text-xs font-semibold text-primary">{{ texto.categoria }}</span>
          <h1 class="mt-4 text-3xl leading-tight font-extrabold md:text-5xl">{{ texto.titulo }}</h1>
          <p class="mt-5 text-lg text-muted-foreground">{{ texto.resumo }}</p>
          <p class="mt-6 flex flex-wrap gap-5 text-sm text-muted-foreground">
            <span class="flex items-center gap-1.5"><UserRound :size="16" /> {{ texto.autor }}</span>
            <span class="flex items-center gap-1.5"><CalendarDays :size="16" /> {{ mesAno(texto.data) }}</span>
          </p>
        </div>
      </header>
      <!-- HTML vindo do Markdown já sanitizado por DOMPurify em renderizarMarkdown. -->
      <div v-if="corpo" class="conteudo-markdown mx-auto max-w-3xl px-4 py-14" v-html="corpo" />
    </article>
  </EstadoLista>
</template>
