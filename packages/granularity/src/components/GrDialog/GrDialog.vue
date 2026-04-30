<script setup lang="ts">
/**
 * GrDialog — DS-примитив диалога поверх `GrModal`.
 *
 * Архитектурно:
 * - ширина/радиус/скролл-лок/Esc/бэкдроп — ответственность `GrModal`;
 * - заголовок/подвал/кнопка закрытия/паддинги секций — ответственность `GrDialog`.
 *
 * A11y: ровно один `DialogTitle` на открытое окно.
 * - Если хедер отображается без слота `#header` — видимый `DialogTitle` рендерит
 *   `GrDialogHeader`.
 * - В остальных случаях (`!showHeader`, либо `showHeader` со слотом `#header`)
 *   `GrDialog` отдаёт sr-only title в слот `#title` у `GrModal`, чтобы
 *   HeadlessUI корректно проставил `aria-labelledby` на панель.
 */
import { computed } from 'vue'

import GrModal from '../GrModal/GrModal.vue'
import GrDialogFooter from './GrDialogFooter.vue'
import GrDialogHeader from './GrDialogHeader.vue'
import {
  DEFAULT_GR_DIALOG_BODY_CONFIG,
  type GrDialogSectionConfig,
  type GrDialogSize,
  resolveGrDialogSectionConfig,
  resolveGrDialogTitle,
} from './dialogShared'

export interface GrDialogProps {
  modelValue: boolean
  title?: string
  closeOnBackdrop?: boolean
  closeOnEsc?: boolean
  showHeader?: boolean
  showCloseButton?: boolean
  size?: GrDialogSize
  headerConfig?: GrDialogSectionConfig
  footerConfig?: GrDialogSectionConfig
  bodyConfig?: GrDialogSectionConfig
  /** A11y-лейбл кнопки закрытия (i18n). */
  closeLabel?: string
}

const props = withDefaults(defineProps<GrDialogProps>(), {
  title: undefined,
  closeOnBackdrop: true,
  closeOnEsc: true,
  showHeader: true,
  showCloseButton: true,
  size: 'md',
  headerConfig: undefined,
  footerConfig: undefined,
  bodyConfig: undefined,
  closeLabel: 'Close',
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

const slots = defineSlots<{
  default?: () => any
  header?: (props: { title?: string }) => any
  footer?: () => any
}>()

const resolvedTitle = computed(() => resolveGrDialogTitle(props.title))

const bodyClass = computed(() => {
  const cfg = resolveGrDialogSectionConfig(props.bodyConfig, DEFAULT_GR_DIALOG_BODY_CONFIG)
  return [cfg.paddingX, cfg.paddingY]
})

// Нужен ли sr-only title через `GrModal #title`:
// - `!showHeader` — вообще нет заголовка в разметке;
// - `showHeader && $slots.header` — кастомный хедер не обязан содержать DialogTitle.
// В обоих случаях даём HeadlessUI a11y-title, не дублируя его визуально.
const useModalSrOnlyTitle = computed(
  () => !!resolvedTitle.value && (!props.showHeader || !!slots.header),
)

function close(): void {
  emit('update:modelValue', false)
}
</script>

<template>
  <GrModal
    :model-value="modelValue"
    :size="size"
    :close-on-backdrop="closeOnBackdrop"
    :close-on-esc="closeOnEsc"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <template v-if="useModalSrOnlyTitle" #title>
      <span class="sr-only">{{ resolvedTitle }}</span>
    </template>

    <div class="overflow-hidden rounded-[inherit]">
      <GrDialogHeader
        v-if="showHeader"
        :title="resolvedTitle"
        :show-close-button="showCloseButton"
        :config="headerConfig"
        :close-label="closeLabel"
        @close="close"
      >
        <template v-if="slots.header" #default="slotProps">
          <slot name="header" v-bind="slotProps" />
        </template>
      </GrDialogHeader>

      <div :class="bodyClass">
        <slot />
      </div>

      <GrDialogFooter v-if="slots.footer" :config="footerConfig">
        <slot name="footer" />
      </GrDialogFooter>
    </div>
  </GrModal>
</template>
