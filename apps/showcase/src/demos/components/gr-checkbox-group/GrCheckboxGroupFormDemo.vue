<script setup lang="ts">
import { reactive, ref } from 'vue'

import { GrButton, GrCheckbox, GrCheckboxGroup, GrForm, GrFormField, type GrFormRules } from '@feugene/granularity'

const options = [
  { value: 'incidents', label: 'Incidents' },
  { value: 'releases', label: 'Releases' },
  { value: 'digest', label: 'Weekly digest' },
]

const model = reactive({ scopes: [] as string[], terms: false })

// `required` пустым считает `null`/`''`/`[]`, но не `false`: снятый чекбокс —
// это законное значение поля. «Согласие обязательно» — это `validator`.
const rules: GrFormRules = {
  scopes: [{ required: true, message: 'Pick at least one subscription' }],
  terms: [{ validator: value => value === true || 'Accept the policy to continue' }],
}

const submitted = ref(false)
</script>

<template>
  <GrForm
    :model="model"
    :rules="rules"
    class="grid max-w-md gap-4"
    @submit="submitted = true"
  >
    <GrFormField name="scopes" label="Subscriptions">
      <GrCheckboxGroup v-model="model.scopes" name="scopes" :options="options" required />
    </GrFormField>

    <GrFormField name="terms" label="Policy">
      <GrCheckbox v-model="model.terms" required>
        I accept the notification policy
      </GrCheckbox>
    </GrFormField>

    <div class="flex gap-2">
      <GrButton type="submit" size="sm">
        Save preferences
      </GrButton>
    </div>

    <p v-if="submitted" class="text-sm text-[var(--gr-success-text)]">
      Saved — the form is valid.
    </p>
  </GrForm>
</template>
