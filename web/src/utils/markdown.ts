import { marked } from 'marked'
import DOMPurify from 'dompurify'

// Links externos abrem em nova aba.
DOMPurify.addHook('afterSanitizeAttributes', (node) => {
  if (node.tagName === 'A' && node.getAttribute('href')?.startsWith('http')) {
    node.setAttribute('target', '_blank')
    node.setAttribute('rel', 'noopener noreferrer')
  }
})

/** Converte Markdown em HTML seguro (sem scripts, iframes ou atributos de evento). */
export function renderizarMarkdown(texto: string): string {
  return DOMPurify.sanitize(marked.parse(texto, { async: false, gfm: true, breaks: true }))
}
