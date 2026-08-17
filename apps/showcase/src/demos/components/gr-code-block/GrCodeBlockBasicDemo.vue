<script setup lang="ts">
import { GrCodeBlock } from '@feugene/granularity'

// Ровно та форма, в которой ответ приходит из БД: `unknown` со всеми типами JSON.
const response = {
  id: 'run_01HXQZ8K3M7N2P4R6T8V0W1Y3Z',
  model: 'gpt-4o-mini',
  usage: { prompt_tokens: 1284, completion_tokens: 96, total_tokens: 1380 },
  cached: false,
  finished_at: null,
  choices: [{ index: 0, text: 'Итого по документу: 12 позиций' }],
}
</script>

<template>
  <GrCodeBlock :code="response" max-height="18rem" aria-label="Ответ модели" line-numbers />
</template>
