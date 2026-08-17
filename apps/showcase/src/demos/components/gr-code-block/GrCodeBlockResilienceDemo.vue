<script setup lang="ts">
import { computed, ref } from 'vue'

import { GrCodeBlock, GrSegmented } from '@feugene/granularity'

type Case = 'circular' | 'bigint' | 'string' | 'null'

const circular: Record<string, unknown> = { id: 42, kind: 'parsing_run' }
circular.parent = circular

const samples: Record<Case, unknown> = {
  circular,
  bigint: { balance: 9007199254740993n, currency: 'USD' },
  // Строка проходит как есть: это уже готовый текст, а не значение для сериализации.
  string: 'ERROR 2026-08-17 14:02:11  timeout after 30s\n  at Gateway::send()',
  null: null,
}

const active = ref<Case>('circular')
const code = computed(() => samples[active.value])
</script>

<template>
  <div class="grid gap-3">
    <GrSegmented
      v-model="active"
      :options="[
        { value: 'circular', label: 'Цикл' },
        { value: 'bigint', label: 'BigInt' },
        { value: 'string', label: 'Строка' },
        { value: 'null', label: 'null' },
      ]"
      size="sm"
    />

    <!--
      Данные приходят `unknown` из БД. Ни один из этих случаев не имеет права
      уронить страницу: цикл заменяется маркером, `BigInt` печатается суффиксом,
      строка не переформатируется, `null` остаётся литералом.
    -->
    <GrCodeBlock :code="code" :language="active === 'string' ? 'text' : 'json'" aria-label="Устойчивость сериализации" />
  </div>
</template>
