<script setup lang="ts">
import { reactive, ref } from 'vue'

import { GrButton, GrForm, GrFormField, GrInput, type GrFormInstance, type GrFormRules } from '@feugene/granularity'

import CustomColorInput from './CustomColorInput.vue'

const model = reactive({ label: '', brandColor: '' })

// Свой валидатор: возвращает true (ок) или строку с текстом ошибки.
function isHexColor(value: unknown) {
  return /^#[0-9a-f]{6}$/i.test(String(value)) || 'Use a 6-digit hex color, e.g. #3b82f6'
}

const rules: GrFormRules = {
  label: [{ required: true, min: 2 }],
  brandColor: [{ required: true }, { validator: isHexColor }],
}

const formRef = ref<GrFormInstance>()
const saved = ref('')

function onSubmit() {
  saved.value = `Saved “${model.label}” · ${model.brandColor}`
}
</script>

<template>
  <GrForm
    ref="formRef"
    :model="model"
    :rules="rules"
    class="grid max-w-sm gap-4"
    @submit="onSubmit"
  >
    <GrFormField name="label" label="Label">
      <GrInput v-model="model.label" placeholder="Primary brand" />
    </GrFormField>

    <GrFormField name="brandColor" label="Brand color" hint="Custom control — validated like any GrInput">
      <CustomColorInput v-model="model.brandColor" />
    </GrFormField>

    <div class="flex gap-2">
      <GrButton type="submit">
        Save
      </GrButton>
      <GrButton variant="secondary" type="button" @click="formRef?.resetFields()">
        Reset
      </GrButton>
    </div>

    <p v-if="saved" class="text-sm text-[var(--gr-success)]">
      {{ saved }}
    </p>
  </GrForm>
</template>
