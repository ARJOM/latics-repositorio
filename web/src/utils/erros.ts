import { FirebaseError } from 'firebase/app'

const mensagens: Record<string, string> = {
  'auth/invalid-credential': 'E-mail ou senha incorretos.',
  'auth/invalid-email': 'E-mail inválido.',
  'auth/user-disabled': 'Esta conta foi desativada.',
  'auth/email-already-in-use': 'Já existe uma conta com este e-mail.',
  'auth/weak-password': 'A senha precisa ter pelo menos 6 caracteres.',
  'auth/too-many-requests': 'Muitas tentativas. Aguarde alguns minutos e tente de novo.',
  'auth/network-request-failed': 'Sem conexão. Verifique sua internet.',
  'auth/operation-not-allowed': 'Login por e-mail e senha não está ativado no Firebase.',
}

export function mensagemErro(e: unknown): string {
  if (e instanceof FirebaseError) return mensagens[e.code] ?? `Erro inesperado (${e.code}).`
  return 'Erro inesperado. Tente novamente.'
}
