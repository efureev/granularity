<script setup lang="ts">
import { reactive } from 'vue'

import { GrForm } from '@feugene/granularity/components/GrForm'
import { GrFormField } from '@feugene/granularity/components/GrFormField'
import { GrInput } from '@feugene/granularity/components/GrInput'

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
