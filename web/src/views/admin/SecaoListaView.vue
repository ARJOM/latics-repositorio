<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { ArrowDown, ArrowUp, Eye, EyeOff, Pencil, Plus } from 'lucide-vue-next'
import { secoes } from '@/admin/secoes'
import { atualizar, listarTodos, trocarOrdem, type Registro } from '@/services/admin'
import { mesAno } from '@/utils/format'
import { mensagemErro } from '@/utils/erros'

const route = useRoute()
const secao = computed(() => secoes[route.params.secao as string]!)

const itens = ref<Registro[]>([])
const carregando = ref(true)
const erro = ref('')
const ocupado = ref<string | null>(null)

const ordenacao = computed((): [string, 'asc' | 'desc'] => {
  if (secao.value.ordenavel) return ['ordem', 'asc']
  return secao.value.colecao === 'artigos' ? ['ano', 'desc'] : ['data', 'desc']
})

async function carregar() {
  carregando.value = true
  erro.value = ''
  try {
    itens.value = await listarTodos(secao.value.colecao, ...ordenacao.value)
  } catch (e) {
    erro.value = mensagemErro(e)
  } finally {
    carregando.value = false
  }
}
watch(secao, carregar, { immediate: true })

const exibir = (v: unknown) => (v instanceof Date ? mesAno(v) : String(v ?? ''))

async function alternar(item: Registro) {
  ocupado.value = item.id
  try {
    await atualizar(secao.value.colecao, item.id, { active: !item.active })
    item.active = !item.active
  } catch (e) {
    erro.value = mensagemErro(e)
  } finally {
    ocupado.value = null
  }
}

async function mover(i: number, dir: -1 | 1) {
  const a = itens.value[i]!
  const b = itens.value[i + dir]
  if (!b) return
  ocupado.value = a.id
  try {
    await trocarOrdem(secao.value.colecao, a, b)
    ;[a.ordem, b.ordem] = [b.ordem, a.ordem]
    itens.value.splice(i, 1)
    itens.value.splice(i + dir, 0, a)
  } catch (e) {
    erro.value = mensagemErro(e)
  } finally {
    ocupado.value = null
  }
}
</script>

<template>
  <div class="flex flex-wrap items-end justify-between gap-4">
    <div>
      <p class="mb-2 text-xs font-semibold tracking-widest text-primary uppercase">Conteúdo</p>
      <h1 class="text-3xl font-extrabold">{{ secao.titulo }}</h1>
    </div>
    <RouterLink
      :to="`/admin/${route.params.secao}/novo`"
      class="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-lift transition hover:-translate-y-0.5"
    >
      <Plus :size="18" /> {{ secao.novo }}
    </RouterLink>
  </div>

  <p v-if="erro" class="mt-6 rounded-xl bg-destructive/10 px-4 py-2.5 text-sm text-destructive" role="alert">{{ erro }}</p>

  <div v-if="carregando" class="flex justify-center py-16" role="status" aria-label="Carregando">
    <span class="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-primary" />
  </div>

  <p v-else-if="!itens.length" class="mt-6 rounded-2xl border border-dashed border-border p-10 text-center text-muted-foreground">
    Nada cadastrado ainda.
  </p>

  <ul v-else class="mt-6 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
    <li v-for="(item, i) in itens" :key="item.id" class="flex items-center gap-3 px-4 py-3 sm:px-5" :class="{ 'opacity-60': ocupado === item.id }">
      <div v-if="secao.ordenavel" class="flex flex-col">
        <button class="text-muted-foreground hover:text-primary disabled:opacity-30" :disabled="i === 0 || !!ocupado" aria-label="Mover para cima" @click="mover(i, -1)">
          <ArrowUp :size="16" />
        </button>
        <button class="text-muted-foreground hover:text-primary disabled:opacity-30" :disabled="i === itens.length - 1 || !!ocupado" aria-label="Mover para baixo" @click="mover(i, 1)">
          <ArrowDown :size="16" />
        </button>
      </div>

      <div class="min-w-0 flex-1">
        <p class="truncate font-semibold">{{ exibir(item[secao.colunas[0]!]) }}</p>
        <p v-if="secao.colunas.length > 1" class="truncate text-sm text-muted-foreground">
          {{ secao.colunas.slice(1).map((c) => exibir(item[c])).filter(Boolean).join(' · ') }}
        </p>
      </div>

      <span
        :class="[
          'hidden rounded-full px-2.5 py-0.5 text-xs font-semibold sm:inline',
          item.active ? 'bg-accent/15 text-accent' : 'bg-muted text-muted-foreground',
        ]"
      >
        {{ item.active ? 'Publicado' : 'Oculto' }}
      </span>

      <button
        class="grid h-9 w-9 place-items-center rounded-full border border-border text-muted-foreground transition hover:border-primary hover:text-primary disabled:opacity-40"
        :disabled="!!ocupado"
        :aria-label="item.active ? 'Ocultar do site' : 'Publicar no site'"
        :title="item.active ? 'Ocultar do site' : 'Publicar no site'"
        @click="alternar(item)"
      >
        <EyeOff v-if="item.active" :size="16" />
        <Eye v-else :size="16" />
      </button>
      <RouterLink
        :to="`/admin/${route.params.secao}/${item.id}`"
        class="grid h-9 w-9 place-items-center rounded-full border border-border text-muted-foreground transition hover:border-primary hover:text-primary"
        aria-label="Editar"
        title="Editar"
      >
        <Pencil :size="16" />
      </RouterLink>
    </li>
  </ul>
</template>
