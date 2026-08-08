<script setup lang="ts">
/**
 * GrDialog — GR-примитив диалога поверх `GrModal`.
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
 *   `GrModal` корректно проставил `aria-labelledby` на корень окна.
 * - `aria-label` вниз уходит всегда: `GrModal` иначе не отличил бы «заголовок
 *   рисует `GrDialogHeader`» от «имени нет вовсе» и подставил бы обобщённое.
 */
import { useGrComponentProp } from '../GrConfigProvider/context'
import { computed } from 'vue'

import GrModal from '../GrModal/GrModal.vue'
import type { GrModalScrollBehavior } from '../GrModal/grModalStyles'
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
  /**
   * Доступное имя окна, когда заголовка нет вовсе: `showHeader: false` без
   * `title` и без слота `#header` оставил бы окно безымянным.
   */
  ariaLabel?: string
  /**
   * Кто скроллится при длинном содержимом. При `inside` шапка и подвал
   * закреплены, а едет только тело.
   */
  scrollBehavior?: GrModalScrollBehavior
  /**
   * Элемент, получающий фокус при открытии. По умолчанию — панель окна.
   * Элемент **из самого диалога** сюда передавать нельзя: проп, возвращающий
   * наверх то, что рождено внутри поддерева, замыкает рендер в цикл. Фокус на
   * своём содержимом ставится из содержимого — так это сделано в
   * `GrPromptDialog`.
   */
  initialFocus?: HTMLElement | null
}

import './defaults'

const props = withDefaults(defineProps<GrDialogProps>(), {
  title: undefined,
  closeOnBackdrop: true,
  closeOnEsc: true,
  showHeader: true,
  showCloseButton: true,
  // Дефолт `size` живёт в резолвере ниже, а не здесь: Vue подставил бы его
  // до того, как компонент заглянет в `GrConfigProvider`.
  size: undefined,
  headerConfig: undefined,
  footerConfig: undefined,
  bodyConfig: undefined,
  closeLabel: undefined,
  ariaLabel: undefined,
  scrollBehavior: 'outside',
  initialFocus: null,
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  /** Окно открылось и анимация закончилась. */
  (e: 'opened'): void
  /** Окно закрылось и анимация закончилась — содержимое можно размонтировать. */
  (e: 'closed'): void
}>()

const slots = defineSlots<{
  default?: () => any
  header?: (props: { title?: string }) => any
  footer?: () => any
}>()

// Эффективный размер: локальный проп → `GrConfigProvider` → дефолт компонента.
// Резолвим здесь, а не полагаемся на `GrModal`: иначе дефолт диалога затенил бы
// конфиг раньше, чем примитив успел бы в него заглянуть.
const resolvedSize = useGrComponentProp('GrDialog', 'size', () => props.size, 'md')

const resolvedTitle = computed(() => resolveGrDialogTitle(props.title))

const bodyClass = computed(() => {
  const cfg = resolveGrDialogSectionConfig(props.bodyConfig, DEFAULT_GR_DIALOG_BODY_CONFIG)
  return [cfg.paddingX, cfg.paddingY]
})

// Нужен ли sr-only title через `GrModal #title`:
// - `!showHeader` — вообще нет заголовка в разметке;
// - `showHeader && $slots.header` — кастомный хедер не обязан содержать DialogTitle.
// В обоих случаях даём окну a11y-title, не дублируя его визуально.
const useModalSrOnlyTitle = computed(
  () => !!resolvedTitle.value && (!props.showHeader || !!slots.header),
)

function open(): void {
  emit('update:modelValue', true)
}

function close(): void {
  emit('update:modelValue', false)
}

function toggle(): void {
  emit('update:modelValue', !props.modelValue)
}

defineExpose({ open, close, toggle })
</script>

<template>
  <GrModal
    :model-value="modelValue"
    :size="resolvedSize"
    :scroll-behavior="scrollBehavior"
    :initial-focus="initialFocus"
    :close-on-backdrop="closeOnBackdrop"
    :close-on-esc="closeOnEsc"
    :aria-label="ariaLabel ?? resolvedTitle"
    @update:model-value="emit('update:modelValue', $event)"
    @opened="emit('opened')"
    @closed="emit('closed')"
  >
    <template v-if="useModalSrOnlyTitle" #title>
      <span class="sr-only">{{ resolvedTitle }}</span>
    </template>

    <!-- Шапка и подвал уходят в layout-слоты `GrModal`: при `inside` они
         остаются вне скроллящегося тела. -->
    <template v-if="showHeader" #header>
      <GrDialogHeader
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
    </template>

    <div :class="bodyClass">
      <slot />
    </div>

    <template v-if="slots.footer" #footer>
      <GrDialogFooter :config="footerConfig">
        <slot name="footer" />
      </GrDialogFooter>
    </template>
  </GrModal>
</template>
