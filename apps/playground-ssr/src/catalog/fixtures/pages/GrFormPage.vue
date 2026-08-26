<script setup lang="ts">
import { reactive } from 'vue'

import { GrForm, GrFormField, GrInput } from '@feugene/granularity'

const model = reactive({ name: 'Ада' })
const rules = { name: [{ required: true, message: 'Укажите имя' }] }
</script>

<template>
  <GrForm :model="model" :rules="rules">
    <GrFormField name="name" label="Имя">
      <GrInput v-model="model.name" />
    </GrFormField>
  </GrForm>
</template>
