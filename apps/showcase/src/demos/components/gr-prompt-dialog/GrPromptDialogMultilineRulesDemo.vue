<script setup lang="ts">
import { ref } from 'vue'

import type { GrFormRule } from '@feugene/granularity'
import { GrBadge, GrButton, GrPromptDialog } from '@feugene/granularity'

const open = ref(false)
const reason = ref('')
const lastSubmitted = ref('')

// Те же правила, что и у `GrForm`: движок один на пакет.
const rules: GrFormRule[] = [
  { min: 15, message: 'Опишите причину подробнее — минимум 15 символов' },
  {
    validator: (value) => {
      const text = String(value).trim().toLowerCase()
      return text === 'нет' || text === 'не хочу'
        ? 'Такая причина не пройдёт проверку у согласующего'
        : true
    },
  },
]
</script>

<template>
  <div class="grid gap-3">
    <GrButton variant="outline" class="justify-self-start" @click="open = true">
      Отклонить заявку
    </GrButton>

    <div class="text-xs text-[var(--gr-muted-fg)]">
      Последняя причина:
      <GrBadge class="ml-1">
        {{ lastSubmitted || '—' }}
      </GrBadge>
    </div>

    <GrPromptDialog
      v-model="open"
      v-model:value="reason"
      title="Причина отказа"
      label="Причина"
      placeholder="Что именно не так с заявкой"
      confirm-text="Отклонить"
      confirm-tone="danger"
      multiline
      :rows="4"
      autosize
      :maxlength="300"
      show-count
      :rules="rules"
      @confirm="lastSubmitted = $event"
    />
  </div>
</template>
