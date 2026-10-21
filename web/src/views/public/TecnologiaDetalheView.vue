<script setup lang="ts">
import { computed, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { ArrowLeft } from 'lucide-vue-next'
import EmbedViewer from '@/components/site/EmbedViewer.vue'
import EstadoLista from '@/components/site/EstadoLista.vue'
import ImagemProporcional from '@/components/site/ImagemProporcional.vue'
import NotFoundView from './NotFoundView.vue'
import { useDocumento } from '@/composables/useConteudo'
import { proporcaoImagem } from '@/admin/secoes'
import { definirSeo } from '@/seo'
import { registrarVisualizacao } from '@/services/estatisticas'

const route = useRoute()
const { item: tec, carregando, erro } = useDocumento('tecnologias', computed(() => route.params.id as string))

watch(tec, (t) => {
  if (!t) return
  definirSeo({ titulo: `${t.titulo} — LATICS`, descricao: t.texto, imagem: t.imagemUrl })
  registrarVisualizacao('tecnologias', t.id)
})
</script>

<template>
  <EstadoLista :carregando :erro :vazio="false">
    <NotFoundView v-if="!tec" />
    <template v-else>
      <section class="border-b border-border bg-secondary/50">
        <div class="mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 md:grid-cols-2 md:py-20">
          <div>
            <RouterLink to="/tecnologias" class="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-primary">
              <ArrowLeft :size="16" /> Tecnologias
            </RouterLink>
            <span class="mt-6 block w-fit rounded-full bg-card px-3 py-1 text-xs font-semibold text-primary">{{ tec.tag }}</span>
            <h1 class="mt-4 text-4xl font-extrabold md:text-5xl">{{ tec.titulo }}</h1>
            <p class="mt-4 text-lg leading-relaxed text-muted-foreground">{{ tec.texto }}</p>
          </div>
          <ImagemProporcional :src="tec.imagemUrl" :proporcao="proporcaoImagem('tecnologias')" carregamento="eager" class="rounded-3xl shadow-lift" />
        </div>
      </section>
      <section class="mx-auto max-w-6xl px-4 py-14">
        <EmbedViewer v-if="tec.url" :url="tec.url" :tipo="tec.tipo" :titulo="tec.titulo" />
        <p v-else class="rounded-2xl border border-dashed border-border p-10 text-center text-muted-foreground">
          O acesso a esta tecnologia ainda não está disponível.
        </p>
      </section>
    </template>
  </EstadoLista>
</template>
