<script setup lang="ts">
import { computed, ref } from 'vue'

import { GrSwitch } from '@feugene/granularity'

/** Строка лога, которая в колонку не помещается: типичный ответ шлюза. */
const LOG = `2026-08-31T10:12:04.881Z WARN  gateway upstream=orders-api attempt=3 status=502 latency_ms=1841 trace=7f3a91c0b28d4e15 message="upstream returned bad gateway, retrying with backoff"
2026-08-31T10:12:06.204Z INFO  gateway upstream=orders-api attempt=4 status=200 latency_ms=212 trace=7f3a91c0b28d4e15
2026-08-31T10:12:06.205Z INFO  gateway request completed`

const wrap = ref(false)
const copyable = ref(true)
const copies = ref(0)

const wrapLabel = computed(() => wrap.value ? 'Перенос строк' : 'Горизонтальная прокрутка')
const copyLabel = computed(() => copyable.value ? 'Кнопка копирования есть' : 'Кнопка копирования убрана')
</script>

<template>
  <div class="grid gap-4">
    <div class="flex flex-wrap items-center gap-4">
      <GrSwitch v-model="wrap" size="sm">
        {{ wrapLabel }}
      </GrSwitch>
      <GrSwitch v-model="copyable" size="sm">
        {{ copyLabel }}
      </GrSwitch>
    </div>

    <GrCodeBlock
      :code="LOG"
      language="text"
      :wrap="wrap"
      :copyable="copyable"
      aria-label="Лог шлюза"
      line-numbers
      max-height="12rem"
      @copy="copies += 1"
    />

    <p class="showcase-demo-text text-sm">
      Событие <code>copy</code> получено раз: <b>{{ copies }}</b>
    </p>
  </div>
</template>
