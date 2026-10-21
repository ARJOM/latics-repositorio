<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { ArrowLeft } from 'lucide-vue-next'
import CampoFormulario from '@/components/admin/CampoFormulario.vue'
import { secoes } from '@/admin/secoes'
import { atualizar, criar, listarTodos, obter } from '@/services/admin'
import { mensagemErro } from '@/utils/erros'

const route = useRoute()
const router = useRouter()
const chave = computed(() => route.params.secao as string)
const secao = computed(() => secoes[chave.value]!)
const id = computed(() => (route.params.id === 'novo' ? null : (route.params.id as string)))

const dados = ref<Record<string, unknown>>({})
const carregando = ref(true)
const salvando = ref(false)
const erro = ref('')
const naoEncontrado = ref(false)

watch(
  [chave, id],
  async () => {
    carregando.value = true
    erro.value = ''
    naoEncontrado.value = false
    try {
      if (id.value) {
        const r = await obter(secao.value.colecao, id.value)
        if (!r) naoEncontrado.value = true
        else dados.value = Object.fromEntries(secao.value.campos.map((c) => [c.nome, r[c.nome] ?? null]))
      } else {
        // Valores iniciais: primeira opção dos selects obrigatórios.
        dados.value = Object.fromEntries(
          secao.value.campos.map((c) => [c.nome, c.tipo === 'select' && c.obrigatorio ? c.opcoes![0] : null]),
        )
      }
    } catch (e) {
      erro.value = mensagemErro(e)
    } finally {
      carregando.value = false
    }
  },
  { immediate: true },
)

// Campos vazios são gravados como string vazia (texto) ou removidos do formulário (null → '').
const limpar = () =>
  Object.fromEntries(Object.entries(dados.value).map(([k, v]) => [k, typeof v === 'string' ? v.trim() : (v ?? '')]))

async function salvar() {
  salvando.value = true
  erro.value = ''
  try {
    if (id.value) {
      await atualizar(secao.value.colecao, id.value, limpar())
    } else {
      // Novos itens vão para o fim das coleções ordenadas manualmente.
      const existentes = secao.value.ordenavel ? await listarTodos(secao.value.colecao, 'ordem', 'desc') : []
      const ordem = (existentes[0]?.ordem ?? -1) + 1
      await criar(secao.value.colecao, limpar(), ordem)
    }
    router.push({ path: `/admin/${chave.value}`, query: route.query })
  } catch (e) {
    erro.value = mensagemErro(e)
  } finally {
    salvando.value = false
  }
}
</script>

<template>
  <RouterLink :to="{ path: `/admin/${chave}`, query: route.query }" class="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary">
    <ArrowLeft :size="16" /> {{ secao.titulo }}
  </RouterLink>
  <h1 class="mt-3 text-3xl font-extrabold">{{ id ? `Editar ${secao.singular}` : secao.novo }}</h1>

  <div v-if="carregando" class="flex justify-center py-16" role="status" aria-label="Carregando">
    <span class="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-primary" />
  </div>

  <p v-else-if="naoEncontrado" class="mt-6 rounded-2xl border border-dashed border-border p-10 text-center text-muted-foreground">
    Este item não existe ou foi removido.
  </p>

  <form v-else class="mt-6 space-y-5 rounded-3xl border border-border bg-card p-6 shadow-soft md:p-8" @submit.prevent="salvar">
    <CampoFormulario v-for="c in secao.campos" :key="c.nome" v-model="dados[c.nome]" :campo="c" :pasta="secao.colecao" />

    <p v-if="erro" class="rounded-xl bg-destructive/10 px-4 py-2.5 text-sm text-destructive" role="alert">{{ erro }}</p>

    <div class="flex flex-wrap gap-3 pt-2">
      <button
        type="submit"
        :disabled="salvando"
        class="rounded-full bg-primary px-6 py-2.5 font-semibold text-primary-foreground shadow-lift transition hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-60"
      >
        {{ salvando ? 'Salvando…' : 'Salvar' }}
      </button>
      <RouterLink :to="{ path: `/admin/${chave}`, query: route.query }" class="rounded-full border border-border px-6 py-2.5 font-semibold transition hover:border-primary hover:text-primary">
        Cancelar
      </RouterLink>
    </div>
    <p v-if="!id" class="text-xs text-muted-foreground">Novos itens são publicados no site assim que salvos. Use o ícone de olho na lista para ocultar.</p>
  </form>
</template>
