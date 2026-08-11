<script setup lang="ts">
import { reactive, ref } from 'vue'

import { GrButton, GrColorPicker, GrForm, GrFormField, GrInput, type GrFormRules } from '@feugene/granularity'

const model = reactive({ name: '', accent: '#22c55e' })

const rules: GrFormRules = {
  name: [{ required: true }],
  accent: [{ required: true, pattern: /^#[0-9a-f]{6}$/i, message: 'Only a six-digit hex is allowed' }],
}

const saved = ref('')
</script>

<template>
  <GrForm :model="model" :rules="rules" class="grid max-w-sm gap-4" @submit="saved = model.accent">
    <GrFormField name="name" label="Theme name">
      <GrInput v-model="model.name" placeholder="Midnight" />
    </GrFormField>

    <GrFormField name="accent" label="Accent" hint="Goes to the --gr-primary token">
      <GrColorPicker v-model="model.accent" name="accent" />
    </GrFormField>

    <GrButton type="submit" class="w-fit">
      Save theme
    </GrButton>

    <p v-if="saved" class="text-sm text-[var(--gr-success-text)]">
      Saved: {{ saved }}
    </p>
  </GrForm>
</template>
