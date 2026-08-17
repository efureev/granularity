<script setup lang="ts">
import { reactive, ref } from 'vue'

import { GrButton, GrForm, GrFormField, GrFormFile, type GrFormInstance, type GrFormRules } from '@feugene/granularity'

const model = reactive<{ contract: File | null }>({ contract: null })

/**
 * Ограничения объявлены один раз — здесь. У поля остаётся `accept` как фильтр
 * диалога: это подсказка ОС, а не проверка.
 */
const rules: GrFormRules = {
  contract: [{
    required: true,
    file: { accept: '.pdf,application/pdf', maxSizeMb: 1 },
  }],
}

const formRef = ref<GrFormInstance>()
const submitted = ref(false)

function onSubmit() {
  submitted.value = true
}

function reset() {
  formRef.value?.resetFields()
  submitted.value = false
}
</script>

<template>
  <GrForm
    ref="formRef"
    :model="model"
    :rules="rules"
    class="grid max-w-md gap-4"
    @submit="onSubmit"
  >
    <GrFormField name="contract" label="Contract" hint="PDF up to 1 MB">
      <GrFormFile v-model="model.contract" accept=".pdf,application/pdf" />
    </GrFormField>

    <div class="flex gap-2">
      <GrButton type="submit">
        Send
      </GrButton>
      <GrButton variant="secondary" type="button" @click="reset">
        Reset
      </GrButton>
    </div>

    <p v-if="submitted" class="text-sm text-[var(--gr-success)]">
      Submitted — the file passed the form rule.
    </p>
  </GrForm>
</template>
