<script setup lang="ts">
import { reactive, ref } from 'vue'

import { GrButton, GrForm, GrFormField, GrInput, type GrFormRules } from '@feugene/granularity'

const model = reactive({ name: '', email: '', password: '' })

const rules: GrFormRules = {
  name: [{ required: true }],
  email: [{ required: true, type: 'email' }],
  password: [{ required: true, min: 8 }],
}

const formRef = ref<InstanceType<typeof GrForm>>()
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
    class="grid max-w-sm gap-4"
    @submit="onSubmit"
  >
    <GrFormField name="name" label="Name">
      <GrInput v-model="model.name" placeholder="Ada Lovelace" />
    </GrFormField>

    <GrFormField name="email" label="Email">
      <GrInput v-model="model.email" type="email" placeholder="ada@example.com" />
    </GrFormField>

    <GrFormField name="password" label="Password" hint="At least 8 characters">
      <GrInput v-model="model.password" type="password" />
    </GrFormField>

    <div class="flex gap-2">
      <GrButton type="submit">
        Sign up
      </GrButton>
      <GrButton variant="default" type="button" @click="reset">
        Reset
      </GrButton>
    </div>

    <p v-if="submitted" class="text-sm text-[var(--gr-success)]">
      Submitted — form is valid.
    </p>
  </GrForm>
</template>
