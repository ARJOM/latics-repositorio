<script setup lang="ts">
import { computed, ref } from 'vue'
import { ImagePlus, Loader2, Plus, Trash2 } from 'lucide-vue-next'
import type { Campo } from '@/admin/secoes'
import { enviarImagem } from '@/services/admin'
import { mensagemErro } from '@/utils/erros'

const props = defineProps<{ campo: Campo; pasta: string }>()
const model = defineModel<unknown>()

const id = computed(() => `campo-${props.campo.nome}`)
const base =
  'w-full rounded-xl border border-input bg-card px-4 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/30'

// Datas: o Firestore guarda Date; o <input type="date"> trabalha com "AAAA-MM-DD".
const dataTexto = computed({
  get: () => {
    const d = model.value
    if (!(d instanceof Date) || isNaN(d.getTime())) return ''
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  },
  set: (v: string) => {
    if (!v) return (model.value = null)
    const [a, m, d] = v.split('-').map(Number)
    model.value = new Date(a!, m! - 1, d!)
  },
})

const texto = computed({
  get: () => (model.value ?? '') as string,
  set: (v: string) => (model.value = v),
})

const numero = computed({
  get: () => (model.value ?? '') as number | '',
  set: (v: number | '') => (model.value = v === '' ? null : Number(v)),
})

// Imagem
const enviando = ref(false)
const erroUpload = ref('')
async function escolherImagem(e: Event) {
  const arquivo = (e.target as HTMLInputElement).files?.[0]
  ;(e.target as HTMLInputElement).value = ''
  if (!arquivo) return
  erroUpload.value = ''
  if (!arquivo.type.startsWith('image/')) return (erroUpload.value = 'Escolha um arquivo de imagem.')
  if (arquivo.size > 2 * 1024 * 1024) return (erroUpload.value = 'A imagem precisa ter no máximo 2 MB.')
  enviando.value = true
  try {
    model.value = await enviarImagem(arquivo, props.pasta)
  } catch (err) {
    erroUpload.value = mensagemErro(err)
  } finally {
    enviando.value = false
  }
}

// Indicadores
type Indicador = { valor: string; rotulo: string }
const indicadores = computed(() => (Array.isArray(model.value) ? (model.value as Indicador[]) : []))
const alterarIndicadores = (lista: Indicador[]) => (model.value = lista)
</script>

<template>
  <div>
    <label :for="id" class="mb-1.5 block text-sm font-medium">
      {{ campo.rotulo }}<span v-if="campo.obrigatorio" class="text-destructive"> *</span>
    </label>

    <input v-if="campo.tipo === 'texto'" :id v-model="texto" :required="campo.obrigatorio" :class="base" />
    <input v-else-if="campo.tipo === 'url'" :id v-model="texto" type="url" placeholder="https://" :required="campo.obrigatorio" :class="base" />
    <input v-else-if="campo.tipo === 'numero'" :id v-model="numero" type="number" :required="campo.obrigatorio" :class="base" />
    <input v-else-if="campo.tipo === 'data'" :id v-model="dataTexto" type="date" :required="campo.obrigatorio" :class="base" />
    <textarea v-else-if="campo.tipo === 'textarea'" :id v-model="texto" rows="4" :required="campo.obrigatorio" :class="base" />
    <textarea v-else-if="campo.tipo === 'markdown'" :id v-model="texto" rows="14" :required="campo.obrigatorio" :class="[base, 'font-mono']" />

    <select v-else-if="campo.tipo === 'select'" :id v-model="texto" :required="campo.obrigatorio" :class="base">
      <option v-if="!campo.obrigatorio" value="">—</option>
      <option v-for="o in campo.opcoes" :key="o" :value="o">{{ o }}</option>
    </select>

    <div v-else-if="campo.tipo === 'imagem'" class="flex flex-wrap items-center gap-4">
      <div class="grid h-24 w-36 place-items-center overflow-hidden rounded-xl border border-border bg-muted">
        <img v-if="texto" :src="texto" alt="" class="h-full w-full object-cover" />
        <ImagePlus v-else :size="24" class="text-muted-foreground" />
      </div>
      <div class="space-y-2">
        <label class="inline-flex cursor-pointer items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium transition hover:border-primary hover:text-primary">
          <Loader2 v-if="enviando" :size="16" class="animate-spin" />
          <ImagePlus v-else :size="16" />
          {{ enviando ? 'Enviando…' : texto ? 'Trocar imagem' : 'Enviar imagem' }}
          <input :id type="file" accept="image/*" class="sr-only" :disabled="enviando" @change="escolherImagem" />
        </label>
        <button v-if="texto && !campo.obrigatorio" type="button" class="block text-sm text-muted-foreground hover:text-destructive" @click="model = ''">
          Remover imagem
        </button>
        <!-- Impede salvar um campo obrigatório sem imagem. -->
        <input v-if="campo.obrigatorio" :value="texto" required tabindex="-1" class="sr-only" aria-hidden="true" />
      </div>
      <p v-if="erroUpload" class="w-full text-sm text-destructive">{{ erroUpload }}</p>
    </div>

    <div v-else-if="campo.tipo === 'indicadores'" class="space-y-2">
      <div v-for="(ind, i) in indicadores" :key="i" class="flex gap-2">
        <input
          :value="ind.valor"
          placeholder="+40"
          :class="base.replace('w-full', 'w-32 shrink-0')"
          :aria-label="`Valor do indicador ${i + 1}`"
          @input="alterarIndicadores(indicadores.map((x, j) => (j === i ? { ...x, valor: ($event.target as HTMLInputElement).value } : x)))"
        />
        <input
          :value="ind.rotulo"
          placeholder="ações"
          :class="base"
          :aria-label="`Rótulo do indicador ${i + 1}`"
          @input="alterarIndicadores(indicadores.map((x, j) => (j === i ? { ...x, rotulo: ($event.target as HTMLInputElement).value } : x)))"
        />
        <button type="button" class="shrink-0 px-2 text-muted-foreground hover:text-destructive" aria-label="Remover indicador" @click="alterarIndicadores(indicadores.filter((_, j) => j !== i))">
          <Trash2 :size="18" />
        </button>
      </div>
      <button type="button" class="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline" @click="alterarIndicadores([...indicadores, { valor: '', rotulo: '' }])">
        <Plus :size="16" /> Adicionar indicador
      </button>
    </div>

    <p v-if="campo.ajuda" class="mt-1.5 text-xs text-muted-foreground">{{ campo.ajuda }}</p>
  </div>
</template>
