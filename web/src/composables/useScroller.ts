import { ref } from 'vue'

/** Rola um trilho com scroll-snap um item para cada lado (setas dos carrosséis). */
export function useScroller(gap = 24) {
  const el = ref<HTMLElement | null>(null)

  const go = (dir: number) => {
    const first = el.value?.firstElementChild
    if (!el.value || !first) return
    const step = first.getBoundingClientRect().width + gap
    el.value.scrollBy({ left: step * dir, behavior: 'smooth' })
  }

  return { el, prev: () => go(-1), next: () => go(1) }
}
