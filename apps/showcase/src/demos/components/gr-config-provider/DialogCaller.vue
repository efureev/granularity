<script setup lang="ts">
import { GrButton, useDialogService } from '@feugene/granularity'

/**
 * Отдельный компонент здесь по существу, а не для красоты: `useDialogService()`
 * захватывает конфиг в `setup`, поэтому вызывать его нужно там, где компонент
 * уже находится внутри `GrConfigProvider`.
 */
const emit = defineEmits<{ (e: 'answer', value: string): void }>()

const dialogs = useDialogService()

async function ask(): Promise<void> {
  const confirmed = await dialogs.confirm('Удалить черновик? Действие необратимо.')
  emit('answer', confirmed ? 'подтвердил' : 'отменил')
}
</script>

<template>
  <div class="flex flex-wrap items-center gap-3 rounded-xl border border-[var(--gr-brd)] bg-[var(--gr-card)] p-4">
    <GrButton @click="ask">
      Открыть диалог
    </GrButton>
    <span class="text-sm text-[var(--gr-muted-fg)]">
      кнопка снаружи — для сравнения размеров
    </span>
  </div>
</template>
