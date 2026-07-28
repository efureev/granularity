<script setup lang="ts">
import { ref } from 'vue'

import { GrButton, GrConfigProvider } from '@feugene/granularity'

import DialogCaller from './DialogCaller.vue'

const size = ref<'sm' | 'lg'>('sm')
const lastAnswer = ref<string | null>(null)
</script>

<template>
  <div class="grid gap-4">
    <div class="flex items-center gap-3">
      <span class="text-sm font-medium">Размер в провайдере:</span>
      <GrButton
        v-for="s in (['sm', 'lg'] as const)"
        :key="s"
        size="sm"
        :variant="size === s ? 'primary' : 'outline'"
        @click="size = s"
      >
        {{ s }}
      </GrButton>
    </div>

    <!-- Вызывающий компонент внутри провайдера — значит и диалог унаследует конфиг. -->
    <GrConfigProvider :size="size">
      <DialogCaller @answer="lastAnswer = $event" />
    </GrConfigProvider>

    <p class="text-sm text-[var(--gr-muted-fg)]">
      Диалог монтируется в <code>body</code>, вне дерева провайдера, но кнопки в нём
      приходят того же размера, что и контролы вокруг. Последний ответ:
      <code>{{ lastAnswer ?? '—' }}</code>
    </p>
  </div>
</template>
