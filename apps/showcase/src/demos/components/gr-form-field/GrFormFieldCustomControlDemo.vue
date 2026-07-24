<script setup lang="ts">
import { computed, ref } from 'vue'

import { GrButton, GrFormField } from '@feugene/granularity'

import StarRatingInput from './StarRatingInput.vue'

const rating = ref(0)
const touched = ref(false)

// Кастомное правило без GrForm: валидируем сами и отдаём текст в `:error`.
function validateRating(value: number): string | undefined {
  if (value < 1)
    return 'Please pick a rating.'
  if (value < 3)
    return 'We would love at least 3 stars 🙂'
  return undefined
}

const error = computed(() => (touched.value ? validateRating(rating.value) : undefined))

function submit() {
  touched.value = true
}
</script>

<template>
  <div class="grid max-w-sm gap-4">
    <GrFormField
      label="Satisfaction"
      required
      hint="Custom control + custom rule, without GrForm."
      :error="error"
    >
      <StarRatingInput v-model="rating" />
    </GrFormField>

    <div>
      <GrButton type="button" @click="submit">
        Send feedback
      </GrButton>
    </div>
  </div>
</template>
