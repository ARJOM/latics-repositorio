<script setup lang="ts">
import { RouterLink } from 'vue-router'
import {
  ArrowRight,
  BookOpen,
  Cpu,
  FlaskConical,
  Globe,
  GraduationCap,
  HeartHandshake,
  Lightbulb,
  Microscope,
  Stethoscope,
  Users,
} from 'lucide-vue-next'
import type { Component } from 'vue'
import hero from '@/assets/hero.jpg'
import about from '@/assets/about.jpg'
import CarouselArrows from '@/components/site/CarouselArrows.vue'
import ImagemProporcional from '@/components/site/ImagemProporcional.vue'
import { useScroller } from '@/composables/useScroller'
import { useConfig, useLista } from '@/composables/useConteudo'
import { sitePadrao } from '@/services/padroes'
import { proporcaoImagem } from '@/admin/secoes'

const site = useConfig('site', sitePadrao)
const { itens: areas } = useLista('areas')
const { itens: tecnologias } = useLista('tecnologias')
const { itens: equipe } = useLista('equipe')

// Ícones disponíveis para as áreas (campo `icone`); a lista do painel está em admin/secoes.ts.
const icones: Record<string, Component> = { FlaskConical, Cpu, HeartHandshake, GraduationCap, BookOpen, Users, Stethoscope, Microscope, Lightbulb, Globe }

const iniciais = (nome: string) =>
  nome.split(' ').filter(Boolean).map((p) => p[0]).slice(0, 2).join('').toUpperCase()

const a = useScroller()
const t = useScroller()
</script>

<template>
  <section class="relative overflow-hidden">
    <img :src="hero" alt="" width="1600" height="800" class="absolute inset-0 h-full w-full object-cover object-right" />
    <div class="relative mx-auto max-w-6xl px-4 py-24 md:py-36">
      <span class="inline-flex items-center gap-2 rounded-full border border-border bg-card/80 px-3 py-1 text-xs font-semibold text-primary backdrop-blur">
        <span class="h-1.5 w-1.5 rounded-full bg-accent" /> {{ site.heroSelo }}
      </span>
      <h1 class="mt-6 max-w-xl text-4xl leading-[1.1] font-extrabold md:text-6xl">
        {{ site.heroTitulo }} <span class="text-brand">LATICS</span>
      </h1>
      <p class="mt-5 max-w-lg text-lg text-muted-foreground md:text-xl">{{ site.heroSubtitulo }}</p>
      <div class="mt-9 flex flex-wrap gap-3">
        <a href="#quem-somos" class="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 font-semibold text-primary-foreground shadow-lift transition hover:-translate-y-0.5">
          Saiba mais <ArrowRight :size="18" />
        </a>
        <RouterLink to="/tecnologias" class="inline-flex items-center rounded-full border border-border bg-card px-7 py-3.5 font-semibold transition hover:border-primary hover:text-primary">
          Nossas tecnologias
        </RouterLink>
      </div>
    </div>
  </section>

  <section id="quem-somos" class="mx-auto grid max-w-6xl scroll-mt-24 items-center gap-12 px-4 py-24 md:grid-cols-2">
    <div>
      <p class="mb-3 text-xs font-semibold tracking-widest text-primary uppercase">Quem somos</p>
      <h2 class="text-3xl font-extrabold md:text-4xl">{{ site.quemSomosTitulo }}</h2>
      <p class="mt-6 text-lg leading-relaxed text-muted-foreground">{{ site.quemSomosTexto }}</p>
    </div>
    <img :src="about" alt="Ilustração de profissionais de saúde usando tecnologia" width="1024" height="1024" loading="lazy" class="w-full rounded-3xl" />
  </section>

  <section class="mx-auto max-w-6xl px-4 py-16">
    <div class="mb-8 flex items-end justify-between gap-4">
      <h2 class="text-3xl font-extrabold md:text-4xl">O que fazemos</h2>
      <CarouselArrows @prev="a.prev" @next="a.next" />
    </div>
    <div :ref="(el) => (a.el.value = el as HTMLElement)" class="no-scrollbar flex snap-x snap-mandatory gap-6 overflow-x-auto pb-4">
      <article
        v-for="area in areas"
        :key="area.id"
        class="group flex w-[85%] shrink-0 snap-start flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-soft transition hover:-translate-y-1 hover:shadow-lift sm:w-[420px]"
      >
        <div class="relative h-56 overflow-hidden bg-brand">
          <ImagemProporcional v-if="area.imagemUrl" :src="area.imagemUrl" :proporcao="proporcaoImagem('areas')" class="h-full transition duration-500 group-hover:scale-105" />
          <component v-else :is="icones[area.icone] ?? FlaskConical" class="absolute inset-0 m-auto text-primary-foreground/90" :size="64" :stroke-width="1.4" />
        </div>
        <div class="p-6">
          <h3 class="mb-2 text-xl font-bold">{{ area.titulo }}</h3>
          <p class="text-sm leading-relaxed text-muted-foreground">{{ area.texto }}</p>
        </div>
      </article>
    </div>
  </section>

  <section class="mx-auto max-w-6xl px-4 py-16">
    <div class="mb-8 flex items-end justify-between gap-4">
      <h2 class="text-3xl font-extrabold md:text-4xl">Tecnologias desenvolvidas</h2>
      <CarouselArrows @prev="t.prev" @next="t.next" />
    </div>
    <div :ref="(el) => (t.el.value = el as HTMLElement)" class="no-scrollbar flex snap-x snap-mandatory items-start gap-6 overflow-x-auto">
      <article
        v-for="tc in tecnologias"
        :key="tc.id"
        class="grid w-full shrink-0 snap-start items-center gap-8 rounded-3xl border border-border bg-card p-6 shadow-soft md:grid-cols-2 md:p-10"
      >
        <div>
          <span class="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-primary">{{ tc.tag }}</span>
          <h3 class="mt-4 text-2xl font-bold">{{ tc.titulo }}</h3>
          <p class="mt-3 leading-relaxed text-muted-foreground">{{ tc.texto }}</p>
          <RouterLink :to="`/tecnologias/${tc.id}`" class="mt-6 inline-flex items-center gap-2 font-semibold text-primary hover:underline">
            Conhecer <ArrowRight :size="18" />
          </RouterLink>
        </div>
        <ImagemProporcional :src="tc.imagemUrl" :proporcao="proporcaoImagem('tecnologias')" class="rounded-2xl" />
      </article>
    </div>
  </section>

  <section class="mx-auto max-w-6xl px-4 py-16">
    <h2 class="mb-10 text-3xl font-extrabold md:text-4xl">Equipe do LATICS</h2>
    <ul class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      <li
        v-for="m in equipe"
        :key="m.id"
        class="rounded-2xl border border-border bg-card p-6 text-center shadow-soft transition hover:-translate-y-1"
      >
        <img v-if="m.fotoUrl" :src="m.fotoUrl" alt="" width="96" height="96" loading="lazy" class="mx-auto mb-4 h-24 w-24 rounded-full object-cover" />
        <div v-else class="mx-auto mb-4 grid h-24 w-24 place-items-center rounded-full bg-brand text-2xl font-bold text-primary-foreground">
          {{ iniciais(m.nome) }}
        </div>
        <h3 class="font-bold">{{ m.nome }}</h3>
        <p class="mt-1 text-sm text-muted-foreground">{{ m.papel }}</p>
      </li>
    </ul>
  </section>
</template>
