<script setup lang="ts">
/**
 * DsDialog — DS-примитив диалога поверх `DsModal`.
 *
 * Архитектурно:
 * - ширина/радиус/скролл-лок/Esc/бэкдроп — ответственность `DsModal`;
 * - заголовок/подвал/кнопка закрытия/паддинги секций — ответственность `DsDialog`.
 *
 * A11y: ровно один `DialogTitle` на открытое окно.
 * - Если хедер отображается без слота `#header` — видимый `DialogTitle` рендерит
 *   `DsDialogHeader`.
 * - В остальных случаях (`!showHeader`, либо `showHeader` со слотом `#header`)
 *   `DsDialog` отдаёт sr-only title в слот `#title` у `DsModal`, чтобы
 *   HeadlessUI корректно проставил `aria-labelledby` на панель.
 */
import { computed } from 'vue'

import DsModal from '../DsModal/DsModal.vue'
import DsDialogFooter from './DsDialogFooter.vue'
import DsDialogHeader from './DsDialogHeader.vue'
import {
  DEFAULT_DS_DIALOG_BODY_CONFIG,
  type DsDialogSectionConfig,
  type DsDialogSize,
  resolveDsDialogSectionConfig,
  resolveDsDialogTitle,
} from './dialogShared'

export interface DsDialogProps {
  modelValue: boolean
  title?: string
  closeOnBackdrop?: boolean
  closeOnEsc?: boolean
  showHeader?: boolean
  showCloseButton?: boolean
  size?: DsDialogSize
  headerConfig?: DsDialogSectionConfig
  footerConfig?: DsDialogSectionConfig
  bodyConfig?: DsDialogSectionConfig
  /** A11y-лейбл кнопки закрытия (i18n). */
  closeLabel?: string
}

const props = withDefaults(defineProps<DsDialogProps>(), {
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

const resolvedTitle = computed(() => resolveDsDialogTitle(props.title))

const bodyClass = computed(() => {
  const cfg = resolveDsDialogSectionConfig(props.bodyConfig, DEFAULT_DS_DIALOG_BODY_CONFIG)
  return [cfg.paddingX, cfg.paddingY]
})

// Нужен ли sr-only title через `DsModal #title`:
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
  <DsModal
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
      <DsDialogHeader
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
      </DsDialogHeader>

      <div :class="bodyClass">
        <slot />
      </div>

      <DsDialogFooter v-if="slots.footer" :config="footerConfig">
        <slot name="footer" />
      </DsDialogFooter>
    </div>
  </DsModal>
</template>
