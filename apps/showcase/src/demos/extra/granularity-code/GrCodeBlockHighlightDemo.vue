<script setup lang="ts">
import { computed, ref } from 'vue'

import { GrSwitch } from '@feugene/granularity'
import type { GrCodeLine, GrCodeRole, GrCodeTokenizer } from '@feugene/granularity-code'

const SOURCE = `// Разбор конфигурации приложения
export interface AppConfig {
  retries: number
  featureFlags: string[]
}

export function loadConfig(raw: string): AppConfig {
  const parsed = JSON.parse(raw)
  return { retries: parsed.retries ?? 3, featureFlags: parsed.flags ?? [] }
}`

/**
 * Подсветка для демонстрации: настоящий Shiki витрине сюда тащить незачем —
 * важно показать, что подсветка приходит **функцией**, а какой она будет,
 * решает приложение.
 */
const KEYWORDS = new Set(['export', 'interface', 'function', 'const', 'return', 'number', 'string'])

const demoTokenizer: GrCodeTokenizer = code => code.split('\n').map<GrCodeLine>((line) => {
  if (line.trimStart().startsWith('//'))
    return [{ text: line, role: 'comment' }]

  return (line.match(/\w+|\W+/g) ?? []).map((part) => {
    const role: GrCodeRole = KEYWORDS.has(part.trim())
      ? 'keyword'
      : /^\d+$/.test(part.trim())
        ? 'number'
        : 'plain'

    return { text: part, role }
  })
})

const highlighted = ref(true)

/**
 * Подпись говорит **текущее** состояние, а не одно из двух: «Подсветка
 * подключена» рядом с выключенным тумблером — прямая неправда на экране.
 */
const switchLabel = computed(() => highlighted.value
  ? 'Подсветка подключена'
  : 'Подсветка выключена')
</script>

<template>
  <div class="grid gap-4">
    <GrSwitch v-model="highlighted" size="sm">
      {{ switchLabel }}
    </GrSwitch>

    <GrCodeBlock
      :code="SOURCE"
      language="ts"
      :highlighter="highlighted ? demoTokenizer : undefined"
      line-numbers
    />
  </div>
</template>
