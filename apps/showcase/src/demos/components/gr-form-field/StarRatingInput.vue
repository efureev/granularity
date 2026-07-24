<script setup lang="ts">
import { computed } from 'vue'

import { useGrFormFieldContext } from '@feugene/granularity'

const model = defineModel<number>({ default: 0 })

// Даже без GrForm кастомный контрол читает контекст GrFormField, чтобы получить
// id (label `for`), aria-describedby (hint + error) и aria-invalid.
const field = useGrFormFieldContext()
const invalid = computed(() => Boolean(field?.invalid.value))
const stars = [1, 2, 3, 4, 5]
</script>

<template>
  <div
    :id="field?.id.value"
    role="radiogroup"
    :aria-describedby="field?.describedById.value"
    :aria-invalid="invalid || undefined"
    :aria-required="field?.required.value || undefined"
    class="flex gap-1"
  >
    <button
      v-for="star in stars"
      :key="star"
      type="button"
      role="radio"
      :aria-checked="model === star"
      :aria-label="`${star} stars`"
      class="text-2xl leading-none transition-transform hover:scale-110"
      :class="star <= model ? 'text-[var(--gr-warning)]' : 'text-[var(--gr-muted-fg)]'"
      @click="model = star"
    >
      ★
    </button>
  </div>
</template>
