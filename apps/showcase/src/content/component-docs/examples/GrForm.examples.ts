import type { ShowcaseComponentExampleDoc } from '../types'

export const grFormExamples: ShowcaseComponentExampleDoc[] = [
  {
    id: 'form-validation',
    title: 'Declarative validation & submit',
    description: 'Модель формы (`:model`) + декларативные `rules` по имени поля. `GrFormField` с `name` сам подтягивает ошибку и маркер обязательности из формы, а `submit` эмитится только если форма валидна. Контролы (`GrInput`) не меняются — они уже читают `invalid`/`id`/`aria-describedby` из контекста поля.',
    status: 'ready',
    previewKey: 'gr-form-validation',
    code: `<script setup lang="ts">
import { reactive, ref } from 'vue'

import { GrButton, GrForm, GrFormField, GrInput, type GrFormRules } from '@feugene/granularity'

const model = reactive({ name: '', email: '', password: '' })

const rules: GrFormRules = {
  name: [{ required: true }],
  email: [{ required: true, type: 'email' }],
  password: [{ required: true, min: 8 }],
}

const formRef = ref<InstanceType<typeof GrForm>>()

function onSubmit() {
  // вызывается только при валидной форме
}
</script>

<template>
  <GrForm ref="formRef" :model="model" :rules="rules" class="grid gap-4" @submit="onSubmit">
    <GrFormField name="name" label="Name">
      <GrInput v-model="model.name" />
    </GrFormField>
    <GrFormField name="email" label="Email">
      <GrInput v-model="model.email" type="email" />
    </GrFormField>
    <GrFormField name="password" label="Password" hint="At least 8 characters">
      <GrInput v-model="model.password" type="password" />
    </GrFormField>

    <div class="flex gap-2">
      <GrButton type="submit">Sign up</GrButton>
      <GrButton variant="default" type="button" @click="formRef?.resetFields()">Reset</GrButton>
    </div>
  </GrForm>
</template>`,
    note: 'Ошибка снимается по мере исправления поля; `resetFields()` возвращает начальные значения. Императивный API — через template ref: `validate()` / `validateField()` / `clearValidate()` / `scrollToField()`.',
  },
  {
    id: 'form-mixed-controls',
    title: 'Any control + custom / async rules',
    description: 'Ключевой архитектурный смысл: `GrSelect`, `GrAutocomplete`, `GrInput` валидируются одинаково — через `GrFormField name`, без правок самих контролов. Кастомный (в т.ч. async) `validator` получает значение и весь `model` (проверка совпадения паролей). `validate()` скроллит к первому невалидному полю.',
    status: 'ready',
    previewKey: 'gr-form-mixed-controls',
    code: `<script setup lang="ts">
import { reactive, ref } from 'vue'

import { GrAutocomplete, GrForm, GrFormField, GrInput, GrSelect, type GrFormRules } from '@feugene/granularity'

const model = reactive({ country: '', framework: '', password: '', confirm: '' })

const rules: GrFormRules = {
  country: [{ required: true }],
  framework: [{ required: true }],
  password: [{ required: true, min: 8 }],
  confirm: [
    { required: true },
    { validator: value => value === model.password || 'Passwords do not match' },
  ],
}

const formRef = ref<InstanceType<typeof GrForm>>()
</script>

<template>
  <GrForm ref="formRef" :model="model" :rules="rules" class="grid gap-4">
    <GrFormField name="country" label="Country">
      <GrSelect v-model="model.country" :options="countries" />
    </GrFormField>
    <GrFormField name="framework" label="Framework">
      <GrAutocomplete v-model="model.framework" :options="frameworks" />
    </GrFormField>
    <GrFormField name="confirm" label="Confirm password">
      <GrInput v-model="model.confirm" type="password" />
    </GrFormField>
  </GrForm>
</template>`,
    note: 'Правило может иметь `trigger: "blur" | "change" | "submit"`; правило без триггера срабатывает на любом. Дефолтные сообщения (`gr.form.*`) локализованы (en/ru/es) и перекрываются `rule.message`.',
  },
]
