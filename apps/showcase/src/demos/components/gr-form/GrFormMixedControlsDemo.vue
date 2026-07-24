<script setup lang="ts">
import { reactive, ref } from 'vue'

import {
  GrAutocomplete,
  GrButton,
  GrForm,
  GrFormField,
  GrInput,
  GrSelect,
  type GrFormRules,
} from '@feugene/granularity'

const model = reactive({ username: '', country: '', framework: '', password: '', confirm: '' })

const countries = [
  { value: 'us', label: 'United States' },
  { value: 'de', label: 'Germany' },
  { value: 'jp', label: 'Japan' },
]

const frameworks = [
  { value: 'vue', label: 'Vue' },
  { value: 'react', label: 'React' },
  { value: 'svelte', label: 'Svelte' },
]

const rules: GrFormRules = {
  username: [{ required: true, min: 3, trigger: 'blur' }],
  country: [{ required: true }],
  framework: [{ required: true }],
  password: [{ required: true, min: 8 }],
  confirm: [
    { required: true },
    { validator: value => value === model.password || 'Passwords do not match' },
  ],
}

const formRef = ref<InstanceType<typeof GrForm>>()
const result = ref('')

async function checkValidity() {
  const valid = await formRef.value?.validate()
  result.value = valid ? 'All fields valid ✓' : 'Fix the highlighted fields'
}
</script>

<template>
  <GrForm ref="formRef" :model="model" :rules="rules" class="grid max-w-md gap-4">
    <GrFormField name="username" label="Username">
      <GrInput v-model="model.username" placeholder="ada" />
    </GrFormField>

    <div class="grid gap-4 sm:grid-cols-2">
      <GrFormField name="country" label="Country">
        <GrSelect v-model="model.country" :options="countries" placeholder="Select…" aria-label="Country" />
      </GrFormField>

      <GrFormField name="framework" label="Framework">
        <GrAutocomplete v-model="model.framework" :options="frameworks" placeholder="Search…" aria-label="Framework" />
      </GrFormField>
    </div>

    <GrFormField name="password" label="Password" hint="At least 8 characters">
      <GrInput v-model="model.password" type="password" />
    </GrFormField>

    <GrFormField name="confirm" label="Confirm password">
      <GrInput v-model="model.confirm" type="password" />
    </GrFormField>

    <div class="flex items-center gap-3">
      <GrButton type="button" @click="checkValidity">
        Validate
      </GrButton>
      <span class="text-sm text-[var(--gr-muted-fg)]">{{ result }}</span>
    </div>
  </GrForm>
</template>
