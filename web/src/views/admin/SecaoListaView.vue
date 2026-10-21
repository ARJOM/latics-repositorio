<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { ArrowDown, ArrowUp, Eye, EyeOff, Pencil, Plus, Search } from 'lucide-vue-next'
import type { QueryDocumentSnapshot } from 'firebase/firestore'
import { secoes } from '@/admin/secoes'
import { atualizar, listarPagina, listarTodos, trocarOrdem, type Registro, type Situacao } from '@/services/admin'
import { normalizar } from '@/utils/busca'
import { mesAno } from '@/utils/format'
import { mensagemErro } from '@/utils/erros'

const route = useRoute()
const router = useRouter()
const secao = computed(() => secoes[route.params.secao as string]!)

const itens = ref<Registro[]>([])
const cursor = ref<QueryDocumentSnapshot | null>(null)
const carregando = ref(true)
const carregandoMais = ref(false)
const erro = ref('')
const ocupado = ref<string | null>(null)

// Busca e situação ficam na URL (?q=…&situacao=…), para o filtro sobreviver à ida ao formulário.
const termo = ref('')
const situacao = ref<Situacao>('todos')
const filtrando = computed(() => !!termo.value.trim() || situacao.value !== 'todos')

const ordenacao = computed((): [string, 'asc' | 'desc'] => {
  if (secao.value.ordenavel) return ['ordem', 'asc']
  return secao.value.colecao === 'artigos' ? ['ano', 'desc'] : ['data', 'desc']
})

async function carregar(mais = false) {
  mais ? (carregandoMais.value = true) : (carregando.value = true)
  erro.value = ''
  try {
    if (secao.value.paginada) {
      const [campo, direcao] = ordenacao.value
      const r = await listarPagina(secao.value.colecao, {
        campo,
        direcao,
        situacao: situacao.value,
        termo: termo.value,
        cursor: mais ? cursor.value : null,
      })
      itens.value = mais ? [...itens.value, ...r.itens] : r.itens
      cursor.value = r.cursor
    } else {
      itens.value = await listarTodos(secao.value.colecao, ...ordenacao.value)
      cursor.value = null
    }
  } catch (e) {
    erro.value = mensagemErro(e)
  } finally {
    carregando.value = false
    carregandoMais.value = false
  }
}

watch(
  secao,
  () => {
    termo.value = (route.query.q as string) ?? ''
    situacao.value = (route.query.situacao as Situacao) ?? 'todos'
    carregar()
  },
  { immediate: true },
)

let espera: ReturnType<typeof setTimeout> | undefined
watch([termo, situacao], () => {
  clearTimeout(espera)
  espera = setTimeout(() => {
    const q = termo.value.trim()
    const query = {
      ...(q && { q }),
      ...(situacao.value !== 'todos' && { situacao: situacao.value }),
    }
    if (q === (route.query.q ?? '') && situacao.value === (route.query.situacao ?? 'todos')) return
    router.replace({ query })
    // Coleções pequenas já estão carregadas e são filtradas no navegador.
    if (secao.value.paginada) carregar()
  }, 350)
})

const exibir = (v: unknown) => (v instanceof Date ? mesAno(v) : String(v ?? ''))

// Nas coleções pequenas, a busca procura todas as palavras digitadas nas colunas da tabela.
const visiveis = computed(() => {
  if (secao.value.paginada || !filtrando.value) return itens.value
  const palavras = normalizar(termo.value).split(/\s+/).filter(Boolean)
  return itens.value.filter((item) => {
    if (situacao.value !== 'todos' && item.active !== (situacao.value === 'publicados')) return false
    const texto = normalizar(secao.value.colunas.map((c) => exibir(item[c])).join(' '))
    return palavras.every((p) => texto.includes(p))
  })
})

// Com filtro, itens vizinhos na tela podem não ser vizinhos na ordem real.
const reordenavel = computed(() => secao.value.ordenavel && !filtrando.value)

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

  <div class="mt-6 flex flex-col gap-3 sm:flex-row">
    <label class="relative flex-1">
      <span class="sr-only">Buscar</span>
      <Search :size="18" class="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-muted-foreground" />
      <input
        v-model="termo"
        type="search"
        :placeholder="secao.paginada ? 'Buscar por palavra do título' : 'Buscar'"
        class="w-full rounded-full border border-input bg-card py-2.5 pr-4 pl-11 text-sm shadow-soft outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/30"
      />
    </label>
    <label>
      <span class="sr-only">Filtrar por situação</span>
      <select
        v-model="situacao"
        class="w-full rounded-full border border-input bg-card px-5 py-2.5 text-sm shadow-soft outline-none focus:border-primary sm:w-44"
      >
        <option value="todos">Todos</option>
        <option value="publicados">Publicados</option>
        <option value="ocultos">Ocultos</option>
      </select>
    </label>
  </div>
  <p v-if="secao.ordenavel && filtrando" class="mt-3 text-xs text-muted-foreground">Limpe a busca e o filtro para reordenar.</p>

  <p v-if="erro" class="mt-6 rounded-xl bg-destructive/10 px-4 py-2.5 text-sm text-destructive" role="alert">
    {{ erro }}
  </p>

  <div v-if="carregando" class="flex justify-center py-16" role="status" aria-label="Carregando">
    <span class="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-primary" />
  </div>

  <p v-else-if="!visiveis.length" class="mt-6 rounded-2xl border border-dashed border-border p-10 text-center text-muted-foreground">
    {{ filtrando ? 'Nenhum item encontrado.' : 'Nada cadastrado ainda.' }}
  </p>

  <template v-else>
    <ul class="mt-6 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
      <li
        v-for="(item, i) in visiveis"
        :key="item.id"
        class="flex items-center gap-3 px-4 py-3 sm:px-5"
        :class="{ 'opacity-60': ocupado === item.id }"
      >
        <div v-if="reordenavel" class="flex flex-col">
          <button
            class="text-muted-foreground hover:text-primary disabled:opacity-30"
            :disabled="i === 0 || !!ocupado"
            aria-label="Mover para cima"
            @click="mover(i, -1)"
          >
            <ArrowUp :size="16" />
          </button>
          <button
            class="text-muted-foreground hover:text-primary disabled:opacity-30"
            :disabled="i === itens.length - 1 || !!ocupado"
            aria-label="Mover para baixo"
            @click="mover(i, 1)"
          >
            <ArrowDown :size="16" />
          </button>
        </div>

        <div class="min-w-0 flex-1">
          <p class="truncate font-semibold">
            {{ exibir(item[secao.colunas[0]!]) }}
          </p>
          <p v-if="secao.colunas.length > 1" class="truncate text-sm text-muted-foreground">
            {{
              secao.colunas
                .slice(1)
                .map((c) => exibir(item[c]))
                .filter(Boolean)
                .join(' · ')
            }}
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
          :to="{
            path: `/admin/${route.params.secao}/${item.id}`,
            query: route.query,
          }"
          class="grid h-9 w-9 place-items-center rounded-full border border-border text-muted-foreground transition hover:border-primary hover:text-primary"
          aria-label="Editar"
          title="Editar"
        >
          <Pencil :size="16" />
        </RouterLink>
      </li>
    </ul>
    <div v-if="cursor" class="mt-6 flex justify-center">
      <button
        :disabled="carregandoMais"
        class="rounded-full border border-border bg-card px-7 py-2.5 text-sm font-semibold shadow-soft transition hover:border-primary hover:text-primary disabled:opacity-60"
        @click="carregar(true)"
      >
        {{ carregandoMais ? 'Carregando…' : 'Carregar mais' }}
      </button>
    </div>
  </template>
</template>
