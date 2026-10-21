<script setup lang="ts">
import { ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { ArrowUpRight, Search } from 'lucide-vue-next'
import type { QueryDocumentSnapshot } from 'firebase/firestore/lite'
import PageHeader from '@/components/site/PageHeader.vue'
import EstadoLista from '@/components/site/EstadoLista.vue'
import { listarTextos } from '@/services/conteudo'
import type { Texto } from '@/types'
import { mesAno } from '@/utils/format'

const route = useRoute()
const router = useRouter()

// Busca e ano ficam na URL (?q=…&ano=…), para o filtro sobreviver ao voltar de um texto.
const termo = ref((route.query.q as string) ?? '')
const ano = ref(route.query.ano ? Number(route.query.ano) : 0)
const anos = Array.from({ length: new Date().getFullYear() - 2013 }, (_, i) => new Date().getFullYear() - i)

const textos = ref<Texto[]>([])
const cursor = ref<QueryDocumentSnapshot | null>(null)
const carregando = ref(true)
const carregandoMais = ref(false)
const erro = ref(false)

async function carregar(mais = false) {
  mais ? (carregandoMais.value = true) : (carregando.value = true)
  erro.value = false
  try {
    const r = await listarTextos({ termo: termo.value, ano: ano.value || undefined, cursor: mais ? cursor.value : null })
    textos.value = mais ? [...textos.value, ...r.itens] : r.itens
    cursor.value = r.cursor
  } catch (e) {
    console.error('Erro ao carregar textos:', e)
    erro.value = true
  } finally {
    carregando.value = false
    carregandoMais.value = false
  }
}

let espera: ReturnType<typeof setTimeout> | undefined
watch([termo, ano], () => {
  clearTimeout(espera)
  espera = setTimeout(() => {
    router.replace({ query: { ...(termo.value.trim() && { q: termo.value.trim() }), ...(ano.value && { ano: String(ano.value) }) } })
    carregar()
  }, 350)
})
carregar()
</script>

<template>
  <PageHeader
    eyebrow="Textos autorais"
    title="Reflexões da nossa equipe"
    description="Textos de educação em saúde, ensaios, relatos de experiência e textos de opinião escritos pela equipe do LATICS."
  />

  <div class="mx-auto max-w-6xl px-4 pt-10">
    <div class="flex flex-col gap-3 sm:flex-row">
      <label class="relative flex-1">
        <span class="sr-only">Buscar por título</span>
        <Search :size="18" class="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-muted-foreground" />
        <input
          v-model="termo"
          type="search"
          placeholder="Buscar por título (ex.: hipertensão)"
          class="w-full rounded-full border border-input bg-card py-3 pr-4 pl-11 text-sm shadow-soft outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/30"
        />
      </label>
      <label>
        <span class="sr-only">Filtrar por ano</span>
        <select
          v-model="ano"
          class="w-full rounded-full border border-input bg-card px-5 py-3 text-sm shadow-soft outline-none focus:border-primary sm:w-44"
        >
          <option :value="0">Todos os anos</option>
          <option v-for="a in anos" :key="a" :value="a">{{ a }}</option>
        </select>
      </label>
    </div>
  </div>

  <EstadoLista :carregando :erro :vazio="!textos.length">
    <div class="mx-auto grid max-w-6xl gap-6 px-4 py-10 md:grid-cols-2 lg:grid-cols-3">
      <RouterLink
        v-for="t in textos"
        :key="t.id"
        :to="`/textos-autorais/${t.id}`"
        class="group flex flex-col rounded-2xl border border-border bg-card p-6 shadow-soft transition hover:-translate-y-1 hover:border-primary/40 hover:shadow-lift"
      >
        <div class="flex items-center justify-between gap-3 text-xs">
          <span class="rounded-full bg-secondary px-3 py-1 font-semibold text-primary">{{ t.categoria }}</span>
          <span class="shrink-0 text-muted-foreground">{{ mesAno(t.data) }}</span>
        </div>
        <h2 class="mt-5 text-lg leading-snug font-bold">{{ t.titulo }}</h2>
        <p class="mt-2 line-clamp-3 flex-1 text-sm text-muted-foreground">{{ t.resumo }}</p>
        <div class="mt-6 flex items-center justify-between gap-3 text-sm">
          <span class="line-clamp-1 font-medium">{{ t.autor }}</span>
          <ArrowUpRight :size="18" class="shrink-0 text-muted-foreground transition group-hover:text-primary" />
        </div>
      </RouterLink>
    </div>
    <div v-if="cursor" class="flex justify-center pb-6">
      <button
        :disabled="carregandoMais"
        class="rounded-full border border-border bg-card px-7 py-3 font-semibold shadow-soft transition hover:border-primary hover:text-primary disabled:opacity-60"
        @click="carregar(true)"
      >
        {{ carregandoMais ? 'Carregando…' : 'Carregar mais' }}
      </button>
    </div>
  </EstadoLista>
</template>
