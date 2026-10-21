<script setup lang="ts">
import { computed, onBeforeUnmount, reactive, ref, watch } from 'vue'
import { Check, Maximize, X } from 'lucide-vue-next'

const props = withDefaults(
  defineProps<{
    arquivo: File | null
    /** Largura ÷ altura do recorte (16 / 9, 1, 3 / 2…). */
    proporcao: number
    /** Largura máxima do arquivo gerado; a altura sai da proporção. */
    larguraMax?: number
    tipo?: 'image/webp' | 'image/jpeg'
    qualidade?: number
    /** Cor das faixas quando a imagem é encaixada inteira (zoom abaixo de "cobrir"). */
    fundo?: string
  }>(),
  { larguraMax: 1600, tipo: 'image/webp', qualidade: 0.85, fundo: '#ffffff' },
)
const emit = defineEmits<{ confirmar: [arquivo: File]; cancelar: [] }>()

const dialogo = ref<HTMLDialogElement | null>(null)
const moldura = ref<HTMLElement | null>(null)
const imagem = ref<HTMLImageElement | null>(null)
const url = ref('')
const gerando = ref(false)

// Estado em coordenadas da imagem original: independe do tamanho da moldura na tela.
const img = reactive({ largura: 0, altura: 0 })
const quadro = reactive({ largura: 0, altura: 0 })
const centro = reactive({ x: 0, y: 0 })
const zoom = ref(1)

// zoom 1 = a imagem cobre a moldura; abaixo disso ela cabe inteira, com faixas de fundo.
const escalaCobrir = computed(() =>
  img.largura ? Math.max(quadro.largura / img.largura, quadro.altura / img.altura) : 1,
)
const zoomMin = computed(() =>
  img.largura ? Math.min(quadro.largura / img.largura, quadro.altura / img.altura) / escalaCobrir.value : 1,
)
const escala = computed(() => escalaCobrir.value * zoom.value)

const limitar = (c: number, tamImg: number, tamQuadro: number) => {
  const metade = tamQuadro / 2 / escala.value
  return tamImg * escala.value <= tamQuadro ? tamImg / 2 : Math.min(Math.max(c, metade), tamImg - metade)
}
function ajustarCentro() {
  centro.x = limitar(centro.x, img.largura, quadro.largura)
  centro.y = limitar(centro.y, img.altura, quadro.altura)
}
watch(zoom, ajustarCentro)

/** Retângulo da imagem dentro da moldura, em pixels de tela. */
const posicao = computed(() => ({
  esquerda: quadro.largura / 2 - centro.x * escala.value,
  topo: quadro.altura / 2 - centro.y * escala.value,
  largura: img.largura * escala.value,
  altura: img.altura * escala.value,
}))

const observador = new ResizeObserver(([e]) => {
  quadro.largura = e!.contentRect.width
  quadro.altura = e!.contentRect.height
  ajustarCentro()
})
watch(moldura, (el, antigo) => {
  if (antigo) observador.unobserve(antigo)
  if (el) observador.observe(el)
})

watch(
  () => props.arquivo,
  (a) => {
    if (url.value) URL.revokeObjectURL(url.value)
    url.value = a ? URL.createObjectURL(a) : ''
    img.largura = img.altura = 0
    if (!a) return dialogo.value?.close()
    dialogo.value?.showModal()
  },
)
onBeforeUnmount(() => {
  observador.disconnect()
  if (url.value) URL.revokeObjectURL(url.value)
})

function carregou() {
  img.largura = imagem.value!.naturalWidth
  img.altura = imagem.value!.naturalHeight
  centro.x = img.largura / 2
  centro.y = img.altura / 2
  zoom.value = 1
}

// Arrastar (mouse, toque e caneta)
let arrasto: { x: number; y: number } | null = null
function iniciar(e: PointerEvent) {
  ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  arrasto = { x: e.clientX, y: e.clientY }
}
function mover(e: PointerEvent) {
  if (!arrasto) return
  centro.x -= (e.clientX - arrasto.x) / escala.value
  centro.y -= (e.clientY - arrasto.y) / escala.value
  arrasto = { x: e.clientX, y: e.clientY }
  ajustarCentro()
}
const soltar = () => (arrasto = null)

function teclado(e: KeyboardEvent) {
  const passo = 10 / escala.value
  const mapa: Record<string, [number, number]> = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }
  const d = mapa[e.key]
  if (!d) return
  e.preventDefault()
  centro.x += d[0] * passo
  centro.y += d[1] * passo
  ajustarCentro()
}

async function confirmar() {
  if (!imagem.value || !props.arquivo) return
  gerando.value = true
  try {
    // Não amplia além da resolução que a imagem original oferece para o recorte.
    const largura = Math.max(1, Math.round(Math.min(props.larguraMax, quadro.largura / escala.value)))
    const altura = Math.round(largura / props.proporcao)
    const k = largura / quadro.largura

    const canvas = document.createElement('canvas')
    canvas.width = largura
    canvas.height = altura
    const ctx = canvas.getContext('2d')!
    ctx.fillStyle = props.fundo
    ctx.fillRect(0, 0, largura, altura)
    ctx.imageSmoothingQuality = 'high'
    const p = posicao.value
    ctx.drawImage(imagem.value, p.esquerda * k, p.topo * k, p.largura * k, p.altura * k)

    const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, props.tipo, props.qualidade))
    if (!blob) throw new Error('Não foi possível gerar a imagem.')
    const nome = props.arquivo.name.replace(/\.[^.]+$/, '') + (props.tipo === 'image/webp' ? '.webp' : '.jpg')
    emit('confirmar', new File([blob], nome, { type: props.tipo }))
  } finally {
    gerando.value = false
  }
}

function clicouFundo(e: MouseEvent) {
  if (e.target === dialogo.value) emit('cancelar')
}
</script>

<template>
  <dialog
    ref="dialogo"
    class="m-auto w-[min(720px,calc(100vw-2rem))] max-w-none rounded-3xl bg-card p-0 text-foreground shadow-lift backdrop:bg-navy/70 backdrop:backdrop-blur-sm"
    aria-label="Ajustar imagem"
    @close="emit('cancelar')"
    @click="clicouFundo"
  >
    <div v-if="arquivo" class="space-y-4 p-4 sm:p-6">
      <div class="flex items-center justify-between gap-4">
        <h2 class="font-semibold">Ajustar imagem</h2>
        <button type="button" class="grid h-9 w-9 place-items-center rounded-full transition hover:bg-muted" aria-label="Cancelar" @click="emit('cancelar')">
          <X :size="18" />
        </button>
      </div>

      <div
        ref="moldura"
        class="relative mx-auto cursor-grab touch-none overflow-hidden rounded-2xl outline-none select-none focus-visible:ring-2 focus-visible:ring-ring active:cursor-grabbing"
        :style="{ aspectRatio: proporcao, width: `min(100%, calc(60vh * ${proporcao}))`, background: fundo }"
        tabindex="0"
        aria-label="Área de recorte. Arraste ou use as setas do teclado para reposicionar."
        @pointerdown="iniciar"
        @pointermove="mover"
        @pointerup="soltar"
        @pointercancel="soltar"
        @keydown="teclado"
      >
        <img
          ref="imagem"
          :src="url"
          alt=""
          draggable="false"
          class="absolute max-w-none"
          :class="{ invisible: !img.largura }"
          :style="{ left: `${posicao.esquerda}px`, top: `${posicao.topo}px`, width: `${posicao.largura}px`, height: `${posicao.altura}px` }"
          @load="carregou"
        />
      </div>

      <div class="flex flex-wrap items-center gap-3">
        <label for="recorte-zoom" class="text-sm font-medium">Zoom</label>
        <input id="recorte-zoom" v-model.number="zoom" type="range" :min="zoomMin" max="3" step="0.01" class="min-w-40 flex-1 accent-primary" />
        <button
          type="button"
          class="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-sm transition hover:border-primary hover:text-primary"
          @click="zoom = zoomMin"
        >
          <Maximize :size="14" /> Imagem inteira
        </button>
      </div>

      <div class="flex justify-end gap-2">
        <button type="button" class="rounded-full px-4 py-2 text-sm font-medium transition hover:bg-muted" @click="emit('cancelar')">Cancelar</button>
        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-60"
          :disabled="!img.largura || gerando"
          @click="confirmar"
        >
          <Check :size="16" /> Usar imagem
        </button>
      </div>
    </div>
  </dialog>
</template>
