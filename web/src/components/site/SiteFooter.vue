<script setup lang="ts">
import { Instagram, Mail, MapPin, Youtube } from 'lucide-vue-next'
import IconTiktok from '@/components/icons/IconTiktok.vue'
import Logo from './Logo.vue'
import { computed } from 'vue'
import { useConfig } from '@/composables/useConteudo'
import { contatoPadrao } from '@/services/padroes'

const contato = useConfig('contato', contatoPadrao)

const redes = computed(() =>
  [
    { label: 'YouTube', icon: Youtube, href: contato.value.youtube },
    { label: 'Instagram', icon: Instagram, href: contato.value.instagram },
    { label: 'TikTok', icon: IconTiktok, href: contato.value.tiktok },
  ].filter((r) => r.href),
)
</script>

<template>
  <footer class="mt-24 bg-navy text-navy-foreground">
    <div class="mx-auto grid max-w-6xl gap-10 px-4 py-14 md:grid-cols-3">
      <div class="space-y-4">
        <div class="[&_.text-muted-foreground]:text-navy-foreground/60">
          <Logo />
        </div>
        <p class="max-w-xs text-sm text-navy-foreground/70">
          Laboratório de Tecnologias de Informação e Comunicação em Saúde.
        </p>
        <div class="flex items-center gap-2 text-xs font-semibold">
          <span class="grid h-10 w-10 place-items-center rounded-lg bg-white p-1" title="UFCG">
            <img src="/logos/ufcg.png" alt="UFCG" width="32" height="32" class="h-8 w-auto" />
          </span>
          <span class="grid h-10 w-10 place-items-center rounded-lg bg-white p-1" title="UFFS">
            <img src="/logos/uffs.png" alt="UFFS" width="23" height="32" class="h-8 w-auto" />
          </span>
        </div>
      </div>

      <div class="space-y-3">
        <p class="text-xs font-semibold tracking-widest text-navy-foreground/50 uppercase">Apoio</p>
        <span class="inline-block rounded-lg bg-white px-3 py-2" title="CNPq">
          <img src="/logos/cnpq.png" alt="CNPq — Conselho Nacional de Desenvolvimento Científico e Tecnológico" width="125" height="55" class="h-12 w-auto" />
        </span>
      </div>

      <div class="space-y-3 text-sm">
        <p class="text-xs font-semibold tracking-widest text-navy-foreground/50 uppercase">Contato</p>
        <a :href="`mailto:${contato.email}`" class="flex items-center gap-2 hover:text-accent">
          <Mail :size="16" /> {{ contato.email }}
        </a>
        <p class="flex gap-2 text-navy-foreground/80">
          <MapPin :size="16" class="mt-0.5 shrink-0" />
          {{ contato.endereco }}
        </p>
        <div class="flex gap-2 pt-1">
          <a
            v-for="r in redes"
            :key="r.label"
            :href="r.href"
            :aria-label="r.label"
            target="_blank"
            rel="noopener"
            class="grid h-9 w-9 place-items-center rounded-full bg-navy-foreground/10 transition-colors hover:bg-primary"
          >
            <component :is="r.icon" :size="16" />
          </a>
        </div>
      </div>
    </div>
    <p class="border-t border-navy-foreground/10 py-5 text-center text-xs text-navy-foreground/50">
      © 2014 – {{ new Date().getFullYear() }} LATICS
    </p>
  </footer>
</template>
