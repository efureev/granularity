<script setup lang="ts">
import { computed } from 'vue'

import { useFintI18n } from '@feugene/fint-i18n/vue'
import { GrSegmented, type GrSegmentedOption } from '@feugene/granularity'

const i18n = useFintI18n()

const localeOptions = [
  { value: 'ru', label: 'RU' },
  { value: 'en', label: 'EN' },
] satisfies GrSegmentedOption[]

const selectedLocale = computed<'ru' | 'en'>({
  get() {
    return i18n.locale.value === 'ru' ? 'ru' : 'en'
  },
  set(value) {
    if (value !== i18n.locale.value) {
      void i18n.setLocale(value)
    }
  },
})
</script>

<template>
  <GrSegmented
    v-model="selectedLocale"
    class="font-semibold showcase-pill"
    size="sm"
    :options="localeOptions"
    :aria-label="$t('showcase.header.languageLabel')"
  />
</template>