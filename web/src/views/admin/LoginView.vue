<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import CampoTexto from '@/components/admin/CampoTexto.vue'
import { useSessionStore } from '@/stores/session'
import { mensagemErro } from '@/utils/erros'

const session = useSessionStore()
const router = useRouter()
const route = useRoute()

const email = ref('')
const senha = ref('')
const erro = ref('')
const aviso = ref('')
const enviando = ref(false)

async function entrar() {
  erro.value = ''
  enviando.value = true
  try {
    await session.entrar(email.value, senha.value)
    router.push((route.query.redirect as string) || '/admin')
  } catch (e) {
    erro.value = mensagemErro(e)
  } finally {
    enviando.value = false
  }
}

async function esqueci() {
  erro.value = ''
  aviso.value = ''
  if (!email.value) {
    erro.value = 'Informe seu e-mail para receber o link de redefinição.'
    return
  }
  try {
    await session.redefinirSenha(email.value)
    aviso.value = 'Se o e-mail estiver cadastrado, você receberá um link para redefinir a senha.'
  } catch (e) {
    erro.value = mensagemErro(e)
  }
}
</script>

<template>
  <h1 class="text-2xl font-extrabold">Entrar</h1>
  <p class="mt-1 text-sm text-muted-foreground">Acesso ao painel de conteúdo do LATICS.</p>

  <form class="mt-6 space-y-4" @submit.prevent="entrar">
    <CampoTexto v-model="email" label="E-mail" type="email" autocomplete="email" required />
    <CampoTexto v-model="senha" label="Senha" type="password" autocomplete="current-password" required />

    <p v-if="erro" class="rounded-xl bg-destructive/10 px-4 py-2.5 text-sm text-destructive" role="alert">{{ erro }}</p>
    <p v-if="aviso" class="rounded-xl bg-secondary px-4 py-2.5 text-sm text-primary" role="status">{{ aviso }}</p>

    <button
      type="submit"
      :disabled="enviando"
      class="w-full rounded-full bg-primary px-5 py-3 font-semibold text-primary-foreground shadow-lift transition hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-60"
    >
      {{ enviando ? 'Entrando…' : 'Entrar' }}
    </button>
  </form>

  <div class="mt-6 flex justify-between text-sm">
    <button class="text-muted-foreground hover:text-primary" @click="esqueci">Esqueci a senha</button>
    <RouterLink to="/admin/cadastro" class="font-medium text-primary hover:underline">Criar conta</RouterLink>
  </div>
</template>
