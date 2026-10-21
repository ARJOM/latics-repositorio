<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { CheckCircle2 } from 'lucide-vue-next'
import CampoFormulario from '@/components/admin/CampoFormulario.vue'
import { configs } from '@/admin/secoes'
import { obterConfigBruta, salvarConfig } from '@/services/admin'
import { mensagemErro } from '@/utils/erros'

const route = useRoute()
const cfg = computed(() => configs[route.meta.config as string]!)

const dados = ref<Record<string, unknown>>({})
const carregando = ref(true)
const salvando = ref(false)
const erro = ref('')
const salvo = ref(false)

watch(
  cfg,
  async () => {
    carregando.value = true
    erro.value = ''
    try {
      const r = await obterConfigBruta(cfg.value.doc)
      dados.value = Object.fromEntries(cfg.value.campos.map((c) => [c.nome, r[c.nome] ?? null]))
    } catch (e) {
      erro.value = mensagemErro(e)
    } finally {
      carregando.value = false
    }
  },
  { immediate: true },
)
watch(dados, () => (salvo.value = false), { deep: true })

async function salvar() {
  salvando.value = true
  erro.value = ''
  try {
    const limpo = Object.fromEntries(Object.entries(dados.value).map(([k, v]) => [k, typeof v === 'string' ? v.trim() : (v ?? '')]))
    await salvarConfig(cfg.value.doc, limpo)
    salvo.value = true
  } catch (e) {
    erro.value = mensagemErro(e)
  } finally {
    salvando.value = false
  }
}
</script>

<template>
  <p class="mb-2 text-xs font-semibold tracking-widest text-primary uppercase">Geral</p>
  <h1 class="text-3xl font-extrabold">{{ cfg.titulo }}</h1>
  <p class="mt-2 text-muted-foreground">{{ cfg.descricao }}</p>

  <div v-if="carregando" class="flex justify-center py-16" role="status" aria-label="Carregando">
    <span class="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-primary" />
  </div>

  <form v-else class="mt-6 space-y-5 rounded-3xl border border-border bg-card p-6 shadow-soft md:p-8" @submit.prevent="salvar">
    <CampoFormulario v-for="c in cfg.campos" :key="c.nome" v-model="dados[c.nome]" :campo="c" :pasta="`config-${cfg.doc}`" />

    <p v-if="erro" class="rounded-xl bg-destructive/10 px-4 py-2.5 text-sm text-destructive" role="alert">{{ erro }}</p>

    <div class="flex items-center gap-4 pt-2">
      <button
        type="submit"
        :disabled="salvando"
        class="rounded-full bg-primary px-6 py-2.5 font-semibold text-primary-foreground shadow-lift transition hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-60"
      >
        {{ salvando ? 'Salvando…' : 'Salvar' }}
      </button>
      <span v-if="salvo" class="inline-flex items-center gap-1.5 text-sm font-medium text-accent" role="status">
        <CheckCircle2 :size="18" /> Alterações salvas
      </span>
    </div>
  </form>
</template>
