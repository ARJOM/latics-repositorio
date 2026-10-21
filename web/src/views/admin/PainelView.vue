<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { ArrowRight, Clock } from 'lucide-vue-next'
import { useSessionStore } from '@/stores/session'
import { configs, secoes } from '@/admin/secoes'

const session = useSessionStore()

const atalhos = [
  ...Object.entries(configs).map(([rota, c]) => ({ to: `/admin/${rota}`, titulo: c.titulo, descricao: c.descricao })),
  ...Object.entries(secoes).map(([rota, s]) => ({ to: `/admin/${rota}`, titulo: s.titulo, descricao: `Criar, editar e publicar ${s.titulo.toLowerCase()}.` })),
]
</script>

<template>
  <div v-if="!session.isEditor" class="mx-auto mt-10 max-w-lg rounded-3xl border border-border bg-card p-8 text-center shadow-soft">
    <span class="mx-auto grid h-14 w-14 place-items-center rounded-full bg-secondary text-primary"><Clock :size="26" /></span>
    <h1 class="mt-4 text-2xl font-extrabold">Cadastro aguardando aprovação</h1>
    <p class="mt-2 text-muted-foreground">
      Sua conta foi criada. Um administrador do LATICS precisa liberar seu acesso ao painel. Esta página atualiza sozinha
      quando isso acontecer.
    </p>
  </div>

  <div v-else>
    <p class="mb-2 text-xs font-semibold tracking-widest text-primary uppercase">Painel</p>
    <h1 class="text-3xl font-extrabold">Olá, {{ session.perfil?.nome }}</h1>
    <p class="mt-2 text-muted-foreground">Escolha o que deseja editar. As alterações aparecem no site assim que são salvas.</p>

    <div class="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <RouterLink
        v-for="a in atalhos"
        :key="a.to"
        :to="a.to"
        class="group rounded-2xl border border-border bg-card p-5 shadow-soft transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lift"
      >
        <h2 class="flex items-center justify-between font-bold">
          {{ a.titulo }}
          <ArrowRight :size="18" class="text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-primary" />
        </h2>
        <p class="mt-1 text-sm text-muted-foreground">{{ a.descricao }}</p>
      </RouterLink>
    </div>
  </div>
</template>
