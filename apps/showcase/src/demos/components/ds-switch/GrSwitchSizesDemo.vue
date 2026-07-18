<script setup lang="ts">
import { ref } from 'vue'

import { GrSwitch } from '@feugene/granularity'
import { useFintI18n } from '@feugene/fint-i18n/vue'

const { t } = useFintI18n()
const smValue = ref(false)
const mdValue = ref(true)
const lgValue = ref(true)
</script>

<template>
  <div class="flex flex-wrap items-center gap-6">
    <GrSwitch v-model="smValue" size="sm">{{ t('components.GrSwitch.sizes.small') }}</GrSwitch>
    <GrSwitch v-model="mdValue" size="md">{{ t('components.GrSwitch.sizes.medium') }}</GrSwitch>
    <GrSwitch v-model="lgValue" size="lg">{{ t('components.GrSwitch.sizes.large') }}</GrSwitch>
  </div>
</template>