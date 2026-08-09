<script setup lang="ts">
import { computed } from 'vue'

import GrDialogCloseButton from './GrDialogCloseButton.vue'
import { useGrModalTitle } from '../GrModal/context'
import {
  DEFAULT_GR_DIALOG_HEADER_CONFIG,
  type GrDialogSectionConfig,
  resolveGrDialogSectionConfig,
  resolveGrDialogTitle,
} from './dialogShared'

export interface GrDialogHeaderProps {
  title?: string
  showCloseButton?: boolean
  config?: GrDialogSectionConfig
  /** A11y-лейбл кнопки закрытия (i18n). */
  closeLabel?: string
}

export interface GrDialogHeaderEmits {
  (e: 'close'): void
}

const props = withDefaults(defineProps<GrDialogHeaderProps>(), {
  title: undefined,
  showCloseButton: true,
  config: undefined,
  closeLabel: undefined,
})

const slots = defineSlots<{
  default?: (props: { title?: string }) => any
}>()

defineEmits<GrDialogHeaderEmits>()

const resolvedTitle = computed(() => resolveGrDialogTitle(props.title))

const resolvedConfig = computed(() =>
  resolveGrDialogSectionConfig(props.config, DEFAULT_GR_DIALOG_HEADER_CONFIG),
)

const rootClass = computed(() => [
  resolvedConfig.value.paddingX,
  resolvedConfig.value.paddingY,
  resolvedConfig.value.bordered ? 'border-b border-[var(--gr-brd)]' : '',
  'flex items-center justify-between gap-4',
])

// Видимый заголовок рендерим только когда нет пользовательского слота:
// если слот `#header` задан, a11y-title отдаётся через `GrModal #title`
// на уровне `GrDialog` (см. JSDoc у `GrDialog.vue`).
const showVisibleTitle = computed(() => !slots.default && !!resolvedTitle.value)

// Имя окна: заголовок объявляет себя окну, и `GrModal` ставит на него
// `aria-labelledby`. Вне `GrModal` регистрация — no-op, шапку можно
// использовать и отдельно.
const { titleId } = useGrModalTitle(() => showVisibleTitle.value)
</script>

<template>
  <div data-gr-dialog-header :class="rootClass">
    <template v-if="slots.default">
      <div class="flex-1 min-w-0 flex items-center">
        <slot :title="resolvedTitle" />
      </div>
    </template>
    <div
      v-else-if="showVisibleTitle"
      :id="titleId"
      data-gr-dialog-title
      class="flex-1 min-w-0 text-[length:var(--gr-control-text-md)] font-700"
    >
      {{ resolvedTitle }}
    </div>
    <div v-else class="flex-1 min-w-0" />
    <GrDialogCloseButton
      v-if="showCloseButton"
      :aria-label="closeLabel"
      @click="$emit('close')"
    />
  </div>
</template>
