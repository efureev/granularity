<script setup lang="ts">
/**
 * GrConfirmDialog — GR-примитив диалога подтверждения поверх `GrDialog`.
 *
 * Синхронизирован с `GrDialog`/`GrPromptDialog` по набору проп-проксирования:
 * `size`, `closeOnBackdrop`, `closeOnEsc`, `showHeader`, `showCloseButton`,
 * `headerConfig`, `footerConfig`, `bodyConfig`, `closeLabel`.
 *
 * Клик по «Confirm»/«Cancel» эмитит одноимённое событие и закрывает диалог
 * через `update:modelValue`.
 */
import { useGrComponentProp } from '../GrConfigProvider/context'
import { computed, ref, watch } from 'vue'

import GrButton from '../GrButton/GrButton.vue'
import GrDialog from '../GrDialog/GrDialog.vue'
import GrResponseErrorBanner from '../GrResponseErrorBanner/GrResponseErrorBanner.vue'
import { useGranularityTranslations } from '../../internal/granularityI18n'
import type { GrButtonSize, GrButtonTone, GrButtonVariant } from '../GrButton'
import type { GrDialogSectionConfig, GrDialogSize } from '../GrDialog'
import type { ResponseErrorInfo } from '../GrResponseErrorBanner'

/** Какое действие получает фокус при открытии окна. */
export type GrConfirmDialogFocusAction = 'confirm' | 'cancel' | 'none'

export interface GrConfirmDialogProps {
  modelValue: boolean
  title?: string
  description?: string
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
  buttonSize?: GrButtonSize
  confirmText?: string
  cancelText?: string
  confirmVariant?: GrButtonVariant
  confirmTone?: GrButtonTone
  /**
   * Структура ошибки ответа сервера для показа в теле диалога
   * (через `GrResponseErrorBanner`). Используется императивным
   * `useDialogService` для async-`onConfirm`. `null` — блок скрыт.
   */
  error?: ResponseErrorInfo | null
  /** Состояние загрузки кнопки Confirm (async-`onConfirm` in-flight). */
  confirmLoading?: boolean
  /** Принудительно дизейблит кнопку Confirm. */
  confirmDisabled?: boolean
  /**
   * Закрывать ли диалог автоматически по клику Confirm. По умолчанию `true`
   * (историческое поведение). `false` — отдаёт управление закрытием наружу
   * (нужно `useDialogService`, который ждёт результат async-`onConfirm`).
   */
  closeOnConfirm?: boolean
  /**
   * Какое действие получает фокус при открытии. По умолчанию «Отмена»:
   * подтверждение бывает деструктивным, и `Enter` сразу после открытия не
   * должен его запускать. `none` оставляет фокус на панели окна.
   *
   * Имя не `initialFocus` намеренно: у `GrModal`/`GrDrawer` так называется
   * проп с элементом, а здесь выбирается действие.
   */
  focusAction?: GrConfirmDialogFocusAction
  /**
   * Запрет закрытия «мягкими» способами (Esc, клик по бэкдропу), пока идёт
   * подтверждение (`confirmLoading`). Кнопка закрытия и «Отмена» остаются:
   * окно без единого выхода — ловушка.
   */
  persistent?: boolean
}

export interface GrConfirmDialogEmits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'confirm'): void
  (e: 'cancel'): void
}

import './defaults'

const props = withDefaults(defineProps<GrConfirmDialogProps>(), {
  title: undefined,
  description: undefined,
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
  buttonSize: undefined,
  confirmText: undefined,
  cancelText: undefined,
  confirmVariant: 'primary',
  confirmTone: 'primary',
  error: null,
  confirmLoading: false,
  confirmDisabled: false,
  closeOnConfirm: true,
  focusAction: 'cancel',
  persistent: false,
})

// Эффективный размер: локальный проп → `GrConfigProvider` → дефолт компонента.
const resolvedSize = useGrComponentProp('GrConfirmDialog', 'size', () => props.size, 'md')

const emit = defineEmits<GrConfirmDialogEmits>()

// Дефолты берём из общего i18n-блока пакета (fallback — англ.), а не хардкодим.
const { t } = useGranularityTranslations()
const resolvedTitle = computed(() => props.title ?? t('gr.dialog.confirm.title', 'Confirm'))
const resolvedCloseLabel = computed(() => props.closeLabel ?? t('gr.common.close', 'Close'))
const resolvedConfirmText = computed(() => props.confirmText ?? t('gr.common.confirm', 'Confirm'))
const resolvedCancelText = computed(() => props.cancelText ?? t('gr.common.cancel', 'Cancel'))

const open = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value),
})

const confirmButtonRef = ref<InstanceType<typeof GrButton> | null>(null)
const cancelButtonRef = ref<InstanceType<typeof GrButton> | null>(null)

// Пока подтверждение в полёте, случайное движение не должно оборвать операцию.
const softCloseBlocked = computed(() => props.persistent && props.confirmLoading)
const resolvedCloseOnBackdrop = computed(() => (softCloseBlocked.value ? false : props.closeOnBackdrop))
const resolvedCloseOnEsc = computed(() => (softCloseBlocked.value ? false : props.closeOnEsc))

/**
 * Фокус ставит содержимое после отрисовки, а не проп `initialFocus` у
 * `GrModal`: кнопка рождается внутри поддерева диалога, и возврат её же пропом
 * наверх замыкает рендер в цикл (проверено на `GrPromptDialog`).
 *
 * Молчит, когда фокусировать нечего: со своим слотом `#footer` кнопок с
 * рефами в DOM нет, и фокус остаётся на панели — это корректный исход, а не
 * повод падать.
 */
function focusAction(): void {
  if (props.focusAction === 'confirm')
    confirmButtonRef.value?.focus()
  else if (props.focusAction === 'cancel')
    cancelButtonRef.value?.focus()
}

// Источник — не только `modelValue`, но и сами кнопки: содержимое панели
// появляется на такт позже открытия, и фокус по фиксированному `nextTick`
// приходился на момент, когда фокусировать ещё нечего.
watch(
  [() => props.modelValue, cancelButtonRef, confirmButtonRef],
  () => {
    if (!props.modelValue || props.focusAction === 'none')
      return
    focusAction()
  },
  // `immediate`: окно могут смонтировать уже открытым — смены пропа тогда нет.
  { immediate: true, flush: 'post' },
)

function onCancel(): void {
  emit('cancel')
  emit('update:modelValue', false)
}

function onConfirm(): void {
  emit('confirm')
  if (props.closeOnConfirm)
    emit('update:modelValue', false)
}

defineSlots<{
  /** Содержимое диалога вместо пропа `message`. */
  default?: () => any
  /** Разбор ошибки вместо встроенного баннера. */
  error?: (props: { error: ResponseErrorInfo | null }) => any
  /** Кнопки диалога вместо пары «отмена и подтверждение». */
  footer?: () => any
}>()
</script>

<template>
  <GrDialog
    v-model="open"
    :title="resolvedTitle"
    :size="resolvedSize"
    :close-on-backdrop="resolvedCloseOnBackdrop"
    :close-on-esc="resolvedCloseOnEsc"
    :show-header="showHeader"
    :show-close-button="showCloseButton"
    :header-config="headerConfig"
    :footer-config="footerConfig"
    :body-config="bodyConfig"
    :close-label="resolvedCloseLabel"
  >
    <div class="grid gap-4">
      <slot>
        <div v-if="description" class="text-[length:var(--gr-control-text-md)] leading-[var(--gr-control-leading-md)] text-[var(--gr-muted-fg)]">
          {{ description }}
        </div>
      </slot>

      <slot name="error" :error="error">
        <GrResponseErrorBanner v-if="error" :error="error" :can-dismiss="false" />
      </slot>
    </div>

    <template #footer>
      <slot name="footer">
        <div class="flex items-center justify-end gap-3">
          <GrButton ref="cancelButtonRef" data-testid="gr-confirm-cancel" variant="outline" :size="buttonSize" @click="onCancel">
            {{ resolvedCancelText }}
          </GrButton>
          <GrButton
            ref="confirmButtonRef"
            data-testid="gr-confirm-confirm"
            :variant="confirmVariant"
            :tone="confirmTone"
            :size="buttonSize"
            :loading="confirmLoading"
            :disabled="confirmDisabled"
            @click="onConfirm"
          >
            {{ resolvedConfirmText }}
          </GrButton>
        </div>
      </slot>
    </template>
  </GrDialog>
</template>
