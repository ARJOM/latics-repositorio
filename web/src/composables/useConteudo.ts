import { ref, shallowRef, type Ref } from 'vue'
import { listarAtivos, obterConfig, type NomeColecao } from '@/services/conteudo'

/** Carrega uma lista do Firestore ao montar o componente. */
export function useLista<K extends NomeColecao>(nome: K) {
  const itens = shallowRef([]) as Ref<Awaited<ReturnType<typeof listarAtivos<K>>>>
  const carregando = ref(true)
  const erro = ref(false)

  listarAtivos(nome)
    .then((r) => (itens.value = r))
    .catch((e) => {
      console.error(`Erro ao carregar ${nome}:`, e)
      erro.value = true
    })
    .finally(() => (carregando.value = false))

  return { itens, carregando, erro }
}

/** Carrega um documento de config/, começando pelo valor padrão para não piscar vazio. */
export function useConfig<K extends Parameters<typeof obterConfig>[0]>(
  nome: K,
  padrao: NonNullable<Awaited<ReturnType<typeof obterConfig<K>>>>,
) {
  const valor = shallowRef(padrao)
  obterConfig(nome)
    .then((r) => r && (valor.value = { ...padrao, ...r }))
    .catch((e) => console.error(`Erro ao carregar config/${nome}:`, e))
  return valor
}
