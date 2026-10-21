<script setup lang="ts">
import { CalendarDays, MapPin } from 'lucide-vue-next'
import PageHeader from '@/components/site/PageHeader.vue'
import EstadoLista from '@/components/site/EstadoLista.vue'
import ImagemProporcional from '@/components/site/ImagemProporcional.vue'
import { useConfig, useLista } from '@/composables/useConteudo'
import { extensaoPadrao } from '@/services/padroes'
import { proporcaoImagem } from '@/admin/secoes'

const extensaoConfig = useConfig('extensao', extensaoPadrao)
const { itens: acoesExtensao, carregando, erro } = useLista('acoesExtensao')
import { mesAno } from '@/utils/format'
</script>

<template>
  <PageHeader
    eyebrow="Extensão"
    title="A universidade junto à comunidade"
    :description="`Programa &quot;${extensaoConfig.programa}&quot;.`"
  />
  <section class="mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 md:grid-cols-2">
    <ImagemProporcional v-if="extensaoConfig.imagemUrl" :src="extensaoConfig.imagemUrl" :proporcao="proporcaoImagem('extensao')" alt="Estudantes em atividade de extensão" class="rounded-3xl shadow-lift" />
    <div>
      <h2 class="text-3xl font-extrabold">Sobre o programa</h2>
      <p class="mt-4 leading-relaxed text-muted-foreground">{{ extensaoConfig.descricao }}</p>
      <div class="mt-8 grid grid-cols-3 gap-4">
        <div v-for="ind in extensaoConfig.indicadores" :key="ind.rotulo" class="rounded-2xl bg-secondary p-4">
          <p class="text-2xl font-extrabold text-primary">{{ ind.valor }}</p>
          <p class="text-xs text-muted-foreground">{{ ind.rotulo }}</p>
        </div>
      </div>
    </div>
  </section>
  <section class="mx-auto max-w-6xl px-4 py-8">
    <h2 class="mb-6 text-2xl font-extrabold">Ações recentes</h2>
    <EstadoLista :carregando :erro :vazio="!acoesExtensao.length">
    <div class="grid gap-4">
      <article
        v-for="acao in acoesExtensao"
        :key="acao.id"
        class="flex flex-col justify-between gap-3 rounded-2xl border border-border bg-card p-6 shadow-soft md:flex-row md:items-center"
      >
        <h3 class="font-bold">{{ acao.titulo }}</h3>
        <div class="flex gap-5 text-sm text-muted-foreground">
          <span class="flex items-center gap-1.5"><MapPin :size="15" /> {{ acao.local }}</span>
          <span class="flex items-center gap-1.5"><CalendarDays :size="15" /> {{ mesAno(acao.data) }}</span>
        </div>
      </article>
    </div>
    </EstadoLista>
  </section>
</template>
