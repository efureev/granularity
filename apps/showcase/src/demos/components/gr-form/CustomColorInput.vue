<script setup lang="ts">
import { computed } from 'vue'

import { useGrFormFieldContext } from '@feugene/granularity'

const model = defineModel<string>({ default: '' })

// Кастомный контрол сам подключается к GrFormField через контекст: id (связка с
// label `for`), aria-describedby (hint + error), aria-invalid и aria-required —
// ровно так же, как это делают встроенные GrInput / GrSelect / GrAutocomplete.
const field = useGrFormFieldContext()
const invalid = computed(() => Boolean(field?.invalid.value))
const isHex = computed(() => /^#[0-9a-f]{6}$/i.test(model.value))
</script>

<template>
  <div class="flex items-center gap-2">
    <span
      class="h-9 w-9 shrink-0 rounded-lg border border-[var(--gr-brd)]"
      :style="{ background: isHex ? model : 'transparent' }"
    />
    <input
      :id="field?.id.value"
      v-model="model"
      :aria-describedby="field?.describedById.value"
      :aria-invalid="invalid || undefined"
      :aria-required="field?.required.value || undefined"
      placeholder="#3b82f6"
      class="h-9 w-full rounded-lg border bg-[var(--gr-bg)] px-3 text-sm outline-none focus:ring-2 focus:ring-[var(--gr-primary)]/40"
      :class="invalid ? 'border-[var(--gr-danger)]' : 'border-[var(--gr-brd)]'"
    >
  </div>
</template>
