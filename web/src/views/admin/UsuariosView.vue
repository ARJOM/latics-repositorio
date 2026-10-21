<script setup lang="ts">
import { ref } from 'vue'
import { atualizarUsuario, listarUsuarios, type Usuario } from '@/services/admin'
import { useSessionStore, type Papel } from '@/stores/session'
import { mensagemErro } from '@/utils/erros'

const session = useSessionStore()
const usuarios = ref<Usuario[]>([])
const carregando = ref(true)
const erro = ref('')
const ocupado = ref<string | null>(null)

const papeis: { valor: Papel; rotulo: string }[] = [
  { valor: 'pendente', rotulo: 'Pendente' },
  { valor: 'editor', rotulo: 'Editor' },
  { valor: 'admin', rotulo: 'Administrador' },
]

listarUsuarios()
  .then((r) => (usuarios.value = r))
  .catch((e) => (erro.value = mensagemErro(e)))
  .finally(() => (carregando.value = false))

async function alterar(u: Usuario, dados: { role?: Papel; active?: boolean }) {
  ocupado.value = u.id
  erro.value = ''
  try {
    await atualizarUsuario(u.id, dados)
    Object.assign(u, dados)
  } catch (e) {
    erro.value = mensagemErro(e)
  } finally {
    ocupado.value = null
  }
}

const pendentes = () => usuarios.value.filter((u) => u.role === 'pendente' && u.active).length
</script>

<template>
  <p class="mb-2 text-xs font-semibold tracking-widest text-primary uppercase">Geral</p>
  <h1 class="text-3xl font-extrabold">Usuários</h1>
  <p class="mt-2 text-muted-foreground">
    Aprove novas contas e defina quem pode editar. Editores gerenciam o conteúdo; administradores também gerenciam usuários.
  </p>

  <p v-if="erro" class="mt-6 rounded-xl bg-destructive/10 px-4 py-2.5 text-sm text-destructive" role="alert">{{ erro }}</p>

  <div v-if="carregando" class="flex justify-center py-16" role="status" aria-label="Carregando">
    <span class="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-primary" />
  </div>

  <template v-else>
    <p v-if="pendentes()" class="mt-6 rounded-xl bg-secondary px-4 py-2.5 text-sm font-medium text-primary">
      {{ pendentes() }} {{ pendentes() === 1 ? 'conta aguarda' : 'contas aguardam' }} aprovação.
    </p>

    <ul class="mt-6 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
      <li v-for="u in usuarios" :key="u.id" class="flex flex-wrap items-center gap-3 px-5 py-4" :class="{ 'opacity-60': ocupado === u.id }">
        <div class="min-w-0 flex-1">
          <p class="truncate font-semibold">
            {{ u.nome }}
            <span v-if="u.id === session.user?.uid" class="ml-1 text-xs font-normal text-muted-foreground">(você)</span>
          </p>
          <p class="truncate text-sm text-muted-foreground">{{ u.email }}</p>
        </div>

        <span v-if="!u.active" class="rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">Desativado</span>

        <!-- Ninguém altera o próprio papel nem se desativa, para não perder o acesso por engano. -->
        <select
          :value="u.role"
          :disabled="u.id === session.user?.uid || !!ocupado"
          :aria-label="`Papel de ${u.nome}`"
          class="rounded-xl border border-input bg-card px-3 py-2 text-sm outline-none focus:border-primary disabled:opacity-60"
          @change="alterar(u, { role: ($event.target as HTMLSelectElement).value as Papel })"
        >
          <option v-for="p in papeis" :key="p.valor" :value="p.valor">{{ p.rotulo }}</option>
        </select>

        <button
          v-if="u.id !== session.user?.uid"
          :disabled="!!ocupado"
          :class="[
            'rounded-full border px-4 py-2 text-sm font-medium transition disabled:opacity-60',
            u.active ? 'border-border hover:border-destructive hover:text-destructive' : 'border-primary text-primary hover:bg-secondary',
          ]"
          @click="alterar(u, { active: !u.active })"
        >
          {{ u.active ? 'Desativar' : 'Reativar' }}
        </button>
      </li>
    </ul>
  </template>
</template>
