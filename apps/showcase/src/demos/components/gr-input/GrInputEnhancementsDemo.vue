<script setup lang="ts">
import { ref } from 'vue'

import { GrFormField, GrInput } from '@feugene/granularity'
import { useFintI18n } from '@feugene/fint-i18n/vue'

const { t } = useFintI18n()
const search = ref('Granularity')
const bio = ref('Design-system engineer')
const password = ref('s3cr3t-pass')
const token = ref('sk-live-4f2a90e2f')
</script>

<template>
  <div class="grid gap-4 lg:grid-cols-2">
    <GrFormField :label="t('components.GrInput.enhancements.clearableLabel')">
      <GrInput v-model="search" clearable :placeholder="t('components.GrInput.enhancements.clearablePlaceholder')" />
    </GrFormField>

    <GrFormField :label="t('components.GrInput.enhancements.passwordLabel')">
      <GrInput v-model="password" type="password" password-toggle />
    </GrFormField>

    <GrFormField :label="t('components.GrInput.enhancements.countLabel')">
      <GrInput v-model="bio" :maxlength="60" show-count clearable />
    </GrFormField>

    <GrFormField :label="t('components.GrInput.enhancements.readonlyLabel')">
      <GrInput v-model="token" readonly />
    </GrFormField>
  </div>
</template>
