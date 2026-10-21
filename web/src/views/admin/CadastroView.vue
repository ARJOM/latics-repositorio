<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import CampoTexto from '@/components/admin/CampoTexto.vue'
import { useSessionStore } from '@/stores/session'
import { mensagemErro } from '@/utils/erros'

const session = useSessionStore()
const router = useRouter()

const nome = ref('')
const email = ref('')
const senha = ref('')
const erro = ref('')
const enviando = ref(false)

async function cadastrar() {
  erro.value = ''
  enviando.value = true
  try {
    await session.cadastrar(nome.value.trim(), email.value, senha.value)
    router.push('/admin')
  } catch (e) {
    erro.value = mensagemErro(e)
  } finally {
    enviando.value = false
  }
}
</script>

<template>
  <h1 class="text-2xl font-extrabold">Criar conta</h1>
  <p class="mt-1 text-sm text-muted-foreground">Novas contas ficam pendentes até um administrador aprovar.</p>

  <form class="mt-6 space-y-4" @submit.prevent="cadastrar">
    <CampoTexto v-model="nome" label="Nome" autocomplete="name" required />
    <CampoTexto v-model="email" label="E-mail" type="email" autocomplete="email" required />
    <CampoTexto v-model="senha" label="Senha (mínimo 6 caracteres)" type="password" autocomplete="new-password" required />

    <p v-if="erro" class="rounded-xl bg-destructive/10 px-4 py-2.5 text-sm text-destructive" role="alert">{{ erro }}</p>

    <button
      type="submit"
      :disabled="enviando"
      class="w-full rounded-full bg-primary px-5 py-3 font-semibold text-primary-foreground shadow-lift transition hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-60"
    >
      {{ enviando ? 'Criando…' : 'Criar conta' }}
    </button>
  </form>

  <p class="mt-6 text-center text-sm text-muted-foreground">
    Já tem conta? <RouterLink to="/admin/login" class="font-medium text-primary hover:underline">Entrar</RouterLink>
  </p>
</template>
