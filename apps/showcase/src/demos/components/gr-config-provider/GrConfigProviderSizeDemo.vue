<script setup lang="ts">
import { ref } from 'vue'

import { GrButton, GrConfigProvider, GrInput, type GrComponentSize } from '@feugene/granularity'

const size = ref<GrComponentSize>('md')
const value = ref('Config-driven size')

const sizes: GrComponentSize[] = ['xs', 'sm', 'md', 'lg']
</script>

<template>
  <div class="grid gap-4">
    <!-- Переключатель размера — сами кнопки вне провайдера (фиксированный sm). -->
    <div class="flex gap-2">
      <GrButton
        v-for="s in sizes"
        :key="s"
        size="sm"
        :variant="size === s ? 'primary' : 'outline'"
        @click="size = s"
      >
        {{ s }}
      </GrButton>
    </div>

    <!-- Ни у одного контрола ниже нет пропа `size` — он приходит из провайдера. -->
    <GrConfigProvider :size="size">
      <div class="flex flex-wrap items-center gap-3 rounded-xl border border-[var(--gr-brd)] bg-[var(--gr-card)] p-4">
        <GrInput v-model="value" class="max-w-[16rem]" />
        <GrButton>Save</GrButton>
        <GrButton variant="outline">Cancel</GrButton>
      </div>
    </GrConfigProvider>

    <p class="text-sm text-[var(--gr-muted-fg)]">
      Активный размер: <code>{{ size }}</code>. Проп <code>size</code> на контролах не задан.
    </p>
  </div>
</template>
