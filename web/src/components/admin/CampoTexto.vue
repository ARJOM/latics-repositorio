<script setup lang="ts">
defineProps<{ label: string; type?: string; autocomplete?: string; required?: boolean }>()
const model = defineModel<string>({ required: true })
</script>

<template>
  <label class="block">
    <span class="mb-1.5 block text-sm font-medium">{{ label }}</span>
    <input
      v-model="model"
      :type="type ?? 'text'"
      :autocomplete
      :required
      class="w-full rounded-xl border border-input bg-card px-4 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/30"
    />
  </label>
</template>
