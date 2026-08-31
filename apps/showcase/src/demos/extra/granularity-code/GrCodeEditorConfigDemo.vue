<script setup lang="ts">
import { computed, ref } from 'vue'

import { GrButton, GrFormField, GrSwitch } from '@feugene/granularity'
import type { GrCodeIssue } from '@feugene/granularity-code'

const config = ref(`{
  "retries": 3,
  "timeoutMs": 3000,
  "features": ["billing", "reports"]
}`)

const tabIndents = ref(false)

/** Подпись говорит, что клавиша делает **сейчас**, а не одно из двух. */
const tabLabel = computed(() => tabIndents.value ? 'Tab делает отступ' : 'Tab уводит фокус')

/**
 * Валидация — обычный проп, а не линтер CodeMirror: тем же контрактом сюда
 * отдаётся схема YAML или ответ серверной проверки.
 */
function validateJson(value: string): GrCodeIssue[] {
  try {
    JSON.parse(value)
    return []
  }
  catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    const position = /position (\d+)/.exec(message)
    const from = position ? Number(position[1]) : 0

    return [{ from, to: Math.min(from + 1, value.length), severity: 'error', message }]
  }
}

const saved = ref<string | null>(null)
</script>

<template>
  <div class="grid gap-4">
    <GrSwitch v-model="tabIndents" size="sm">
      {{ tabLabel }}
    </GrSwitch>

    <GrFormField label="Конфигурация сервиса" hint="JSON: проверяется на лету">
      <GrCodeEditor
        v-model="config"
        language="json"
        :validate="validateJson"
        :tab-indents="tabIndents"
        max-height="16rem"
      />
    </GrFormField>

    <div class="flex items-center gap-3">
      <GrButton size="sm" @click="saved = config">
        Сохранить
      </GrButton>
      <span v-if="saved" class="showcase-demo-text text-sm">Сохранено {{ saved.length }} символов</span>
    </div>
  </div>
</template>
