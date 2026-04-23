<script setup lang="ts">
import { computed, useAttrs } from 'vue'

import DsButton from '../DsButton/DsButton.vue'
import IconClose from '~icons/lucide/x'

defineOptions({
  inheritAttrs: false,
})

// A11y-лейбл: берём из атрибутов (родитель прокидывает `:aria-label="closeLabel"`)
// или используем дефолт. Не хардкодим английское "Close" — DS должен быть i18n-friendly.
const attrs = useAttrs()
const ariaLabel = computed(() => (attrs['aria-label'] as string | undefined) ?? 'Close')

defineEmits<{
  (e: 'click'): void
}>()
</script>

<template>
  <DsButton
    v-bind="attrs"
    data-ds-dialog-close
    variant="ghost"
    size="sm"
    square
    :aria-label="ariaLabel"
    @click="$emit('click')"
  >
    <IconClose class="h-4 w-4" aria-hidden="true" />
  </DsButton>
</template>
