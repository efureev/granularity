<script setup lang="ts">
import { computed, useAttrs } from 'vue'

import GrButton from '../GrButton/GrButton.vue'
import IconClose from '~icons/lucide/x'
import { useGranularityTranslations } from '../../internal/granularityI18n'

export interface GrDialogCloseButtonEmits {
  (e: 'click'): void
}

defineOptions({
  inheritAttrs: false,
})

const { t } = useGranularityTranslations()

// A11y-лейбл: берём из атрибутов (родитель прокидывает `:aria-label="closeLabel"`)
// или используем i18n-дефолт. Не хардкодим английское "Close" — GR должен быть i18n-friendly.
const attrs = useAttrs()
const ariaLabel = computed(() => (attrs['aria-label'] as string | undefined) ?? t('gr.common.close', 'Close'))

defineEmits<GrDialogCloseButtonEmits>()
</script>

<template>
  <GrButton
    v-bind="attrs"
    data-gr-dialog-close
    variant="ghost"
    size="sm"
    square
    :aria-label="ariaLabel"
    @click="$emit('click')"
  >
    <IconClose class="h-4 w-4" aria-hidden="true" />
  </GrButton>
</template>
