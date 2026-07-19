<script setup lang="ts">
/**
 * GrDialogServiceHost — внутренний компонент-оркестратор императивного
 * `useDialogService`. Не предназначен для прямого использования в шаблонах.
 *
 * Рендерит «голову» очереди `dialogQueue` (FIFO-сериализация), переиспользуя
 * декларативные `GrConfirmDialog`/`GrPromptDialog`. Управляет состоянием
 * загрузки и ошибок во время async-`onConfirm`, прогоняя «сырые» ответы
 * сервера через цепочку парсеров `GrResponseErrorBanner`.
 */
import { computed, nextTick, onBeforeUnmount, ref, shallowRef, watch } from 'vue'

import GrButton from '../GrButton/GrButton.vue'
import GrConfirmDialog from '../GrConfirmDialog/GrConfirmDialog.vue'
import GrPromptDialog from '../GrPromptDialog/GrPromptDialog.vue'
import {
  coreResponseErrorParsers,
  createResponseErrorClassifier,
  responseErrorParserPresets,
} from '../GrResponseErrorBanner'
import type { ResponseErrorInfo } from '../GrResponseErrorBanner'

import { dialogQueue } from './store'
import type { DialogRequest } from './store'
import type { DialogCloseAction, DialogConfirmContext } from './types'

const active = computed<DialogRequest | null>(() => dialogQueue[0] ?? null)

const open = ref(false)
const loading = ref(false)
const currentError = shallowRef<ResponseErrorInfo | null>(null)
const fieldError = ref<string | null>(null)
const promptValue = ref('')

let controller: AbortController | null = null
let finishing = false
let externalAbortCleanup: (() => void) | null = null

function resetState(): void {
  loading.value = false
  currentError.value = null
  fieldError.value = null
  finishing = false
}

function buildClassifier(req: DialogRequest) {
  const opts = req.options
  const parsers = typeof opts.errorParsers === 'function'
    ? opts.errorParsers(responseErrorParserPresets)
    : opts.errorParsers ?? coreResponseErrorParsers

  return createResponseErrorClassifier({
    parsers,
    texts: opts.errorTexts,
    messageKey: opts.errorMessageKey,
  })
}

watch(
  () => active.value?.id,
  (id) => {
    cleanupExternalAbort()
    resetState()

    const req = active.value
    if (!req || !id) {
      open.value = false
      return
    }

    promptValue.value = req.options && 'value' in req.options
      ? ((req.options as { value?: string }).value ?? '')
      : ''

    controller = new AbortController()

    // Внешний AbortSignal закрывает диалог как `close`.
    const sig = req.options.signal
    if (sig) {
      if (sig.aborted) {
        finish('close')
        return
      }
      const onAbort = () => finish('close')
      sig.addEventListener('abort', onAbort)
      externalAbortCleanup = () => sig.removeEventListener('abort', onAbort)
    }

    void nextTick(() => {
      open.value = true
    })
  },
)

function cleanupExternalAbort(): void {
  externalAbortCleanup?.()
  externalAbortCleanup = null
}

function finish(action: DialogCloseAction, value?: unknown): void {
  const req = active.value
  if (!req || finishing) return
  finishing = true

  open.value = false
  controller?.abort()
  controller = null
  cleanupExternalAbort()

  req.resolve({ action, value })

  // Снимаем «голову» очереди на следующем тике — watch откроет следующий диалог.
  void nextTick(() => {
    const index = dialogQueue.findIndex(item => item.id === req.id)
    if (index >= 0) dialogQueue.splice(index, 1)
  })
}

function buildContext(req: DialogRequest, value: unknown): DialogConfirmContext<any> & { _errorSet: () => boolean } {
  let errorSet = false

  const setError = (message: string | null): void => {
    if (message == null) {
      currentError.value = null
      return
    }
    errorSet = true
    currentError.value = { kind: 'unknown', message, raw: message }
  }

  const setFieldError = (field: string, message: string | null): void => {
    if (message == null) {
      fieldError.value = null
      return
    }
    errorSet = true
    fieldError.value = message
  }

  const clearErrors = (): void => {
    currentError.value = null
    fieldError.value = null
  }

  const setRawError = async (raw: unknown, meta?: Record<string, unknown>): Promise<ResponseErrorInfo | null> => {
    const info = await buildClassifier(req)(raw, meta)
    if (req.kind === 'prompt' && info.fieldErrors?.length) {
      const match = info.fieldErrors.find(f => f.field === 'value') ?? info.fieldErrors[0]
      fieldError.value = match.messages.join(' ')
    }
    currentError.value = info
    errorSet = true
    return info
  }

  return {
    value,
    signal: controller!.signal,
    setError,
    setRawError,
    setFieldError,
    clearErrors,
    setLoading: (v: boolean) => { loading.value = v },
    close: (action: DialogCloseAction = 'close') => finish(action),
    _errorSet: () => errorSet,
  }
}

async function handleConfirm(): Promise<void> {
  const req = active.value
  if (!req) return

  const value = req.kind === 'prompt' ? promptValue.value : undefined

  if (!req.onConfirm) {
    finish('confirm', value)
    return
  }

  currentError.value = null
  fieldError.value = null
  loading.value = true

  const ctx = buildContext(req, value)

  try {
    const result = await req.onConfirm(ctx)
    loading.value = false
    if (finishing) return // ctx.close уже завершил диалог
    if (result === false) return // оставить открытым без ошибки
    if (currentError.value || fieldError.value || ctx._errorSet()) return // есть ошибка — не закрывать
    finish('confirm', value)
  }
  catch (error) {
    loading.value = false
    if (finishing) return
    if (!ctx._errorSet()) await ctx.setRawError(error)
    // оставить диалог открытым с показанной ошибкой
  }
}

function handleCancel(): void {
  finish('cancel')
}

function handleModelUpdate(value: boolean): void {
  if (!value) finish('close')
}

onBeforeUnmount(() => {
  cleanupExternalAbort()
  controller?.abort()
})

// Прокидываемые в дочерний диалог общие пропы.
const sharedProps = computed(() => {
  const o = active.value?.options ?? {}
  return {
    title: o.title,
    size: o.size,
    closeOnBackdrop: o.closeOnBackdrop,
    closeOnEsc: o.closeOnEsc,
    showHeader: o.showHeader,
    showCloseButton: o.showCloseButton,
    headerConfig: o.headerConfig,
    footerConfig: o.footerConfig,
    bodyConfig: o.bodyConfig,
    closeLabel: o.closeLabel,
    buttonSize: o.buttonSize,
    confirmText: o.confirmText,
    confirmVariant: o.confirmVariant,
    confirmTone: o.confirmTone,
  }
})
</script>

<template>
  <template v-if="active">
    <!-- prompt -->
    <GrPromptDialog
      v-if="active.kind === 'prompt'"
      v-bind="sharedProps"
      v-model:value="promptValue"
      :model-value="open"
      :description="active.options.message ?? active.options.description"
      :label="(active.options as any).label"
      :placeholder="(active.options as any).placeholder"
      :required="(active.options as any).required ?? false"
      :required-error-text="(active.options as any).requiredErrorText"
      :cancel-text="(active.options as any).cancelText"
      :error="currentError"
      :field-error="fieldError"
      :confirm-loading="loading"
      :close-on-confirm="false"
      @update:model-value="handleModelUpdate"
      @confirm="handleConfirm"
      @cancel="handleCancel"
    />

    <!-- alert: confirm-диалог без кнопки Cancel -->
    <GrConfirmDialog
      v-else-if="active.kind === 'alert'"
      :model-value="open"
      v-bind="sharedProps"
      :description="active.options.message ?? active.options.description"
      :error="currentError"
      :confirm-loading="loading"
      :close-on-confirm="false"
      @update:model-value="handleModelUpdate"
      @confirm="handleConfirm"
    >
      <template #footer>
        <div class="flex items-center justify-end gap-3">
          <GrButton
            data-testid="gr-alert-confirm"
            :variant="sharedProps.confirmVariant ?? 'primary'"
            :tone="sharedProps.confirmTone ?? 'primary'"
            :size="sharedProps.buttonSize"
            :loading="loading"
            @click="handleConfirm"
          >
            {{ sharedProps.confirmText ?? 'OK' }}
          </GrButton>
        </div>
      </template>
    </GrConfirmDialog>

    <!-- confirm -->
    <GrConfirmDialog
      v-else
      :model-value="open"
      v-bind="sharedProps"
      :description="active.options.message ?? active.options.description"
      :cancel-text="(active.options as any).cancelText"
      :error="currentError"
      :confirm-loading="loading"
      :close-on-confirm="false"
      @update:model-value="handleModelUpdate"
      @confirm="handleConfirm"
      @cancel="handleCancel"
    />
  </template>
</template>
