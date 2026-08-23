<script setup lang="ts">
/**
 * GrDialogServiceItem — одно окно императивного сервиса. Внутренний компонент,
 * в шаблонах напрямую не используется.
 *
 * Всё состояние живёт здесь, а не на хосте, ровно потому, что окон может быть
 * несколько: вложенный вызов из `onConfirm` показывается поверх родителя, и
 * общий `loading` с общей ошибкой означали бы, что верхнее окно пишет в нижнее.
 */
import { computed, inject, nextTick, onBeforeUnmount, onMounted, provide, ref, shallowRef } from 'vue'

import GrButton from '../GrButton/GrButton.vue'
import GrConfirmDialog from '../GrConfirmDialog/GrConfirmDialog.vue'
import GrPromptDialog from '../GrPromptDialog/GrPromptDialog.vue'
import {
  coreResponseErrorParsers,
  createResponseErrorClassifier,
  responseErrorParserPresets,
} from '../GrResponseErrorBanner/parsers'
import type { ResponseErrorInfo } from '../GrResponseErrorBanner'

import { GR_CONFIG_KEY, type GrComponentDefaults, type GrConfigContext } from '../GrConfigProvider/context'
import { GRANULARITY_I18N_KEY } from '../../i18n/adapter'
import { resolveGranularityI18n, useGranularityTranslations } from '../../internal/granularityI18n'

import { finishDialogInFlight, removeDialogRequest, settleDialogRequest, startDialogInFlight } from './store'
import type { DialogRequest, DialogServiceState } from './store'
import { GRANULARITY_DIALOG_SERVICE_STATE } from './useDialogService'
import type { DialogCloseAction, DialogConfirmContext, DialogConfirmOptions, DialogPromptOptions } from './types'

const props = defineProps<{
  request: DialogRequest
}>()

// Состояние инстанса приходит через `provide` хоста, а не пропом: окно его
// мутирует (очередь, список заявок в полёте), а мутировать проп — значит писать
// в чужое владение.
const state = inject(GRANULARITY_DIALOG_SERVICE_STATE) as DialogServiceState

// ————— Мост конфига и i18n.
//
// Окно рендерится через `render(vnode, container)` в `document.body`, то есть вне
// дерева компонентов. Vue в этом случае берёт `provides` только из `appContext`,
// куда попадает лишь `app.provide()` — значения от `<GrConfigProvider>` до сюда
// не доходят. Поэтому вызов сервиса захватывает их в `setup` и кладёт в заявку,
// а окно раздаёт вниз конфиг **своей** заявки.
const EMPTY_DEFAULTS: GrComponentDefaults = Object.freeze({})

provide<GrConfigContext>(GR_CONFIG_KEY, {
  size: computed(() => props.request.config?.size.value),
  componentDefaults: computed(() => props.request.config?.componentDefaults.value ?? EMPTY_DEFAULTS),
})

// i18n: тот же приём. Адаптер хоста (из `appContext`) — запасной вариант для
// вызова без захваченного: без него установка через `app.use()` осталась бы
// незамеченной.
const hostI18n = resolveGranularityI18n()

provide(GRANULARITY_I18N_KEY, {
  t: (key: string, params?: Record<string, unknown>) => {
    const adapter = props.request.i18n ?? hostI18n
    // Вернуть сам ключ — принятый в пакете сигнал «перевода нет»: потребитель
    // подставит свой fallback-текст (см. `useGranularityTranslations`).
    return adapter?.t(key, params) ?? key
  },
  get locale() {
    return (props.request.i18n ?? hostI18n)?.locale
  },
})

// Подвал alert-ветки рисуется здесь, поэтому и перевод кнопки достаётся здесь.
// Адаптер берём тот же, что раздан вниз: собственный `provide` компонента его
// же `inject` не видит, и `useGranularityTranslations()` без аргумента ушёл бы
// мимо захваченного вызовом адаптера — в фолбэк из `appContext`.
const alertConfirmText = computed(() => {
  const { t } = useGranularityTranslations(props.request.i18n ?? hostI18n)
  return t('gr.dialog.ok', 'OK')
})

const open = ref(false)
const loading = ref(false)
const currentError = shallowRef<ResponseErrorInfo | null>(null)
/**
 * Ошибки по именам полей. Карта, а не одна строка: `setFieldError(field, …)`
 * обещает адресность, и обещание должно быть правдой ещё до того, как в
 * диалоге появится второе поле.
 */
const fieldErrors = ref<Record<string, string>>({})
const promptValue = ref(
  props.request.options && 'value' in props.request.options
    ? ((props.request.options as { value?: string }).value ?? '')
    : '',
)

/** Единственное поле `GrPromptDialog` называется `value`. */
const PROMPT_FIELD = 'value'

// Одна запись — её и показываем: адрес не важен, когда адресат один.
const promptFieldError = computed<string | null>(() => {
  const own = fieldErrors.value[PROMPT_FIELD]
  if (own != null)
    return own

  const entries = Object.values(fieldErrors.value)
  return entries.length === 1 ? entries[0] : null
})

const hasFieldError = computed(() => Object.keys(fieldErrors.value).length > 0)

const controller = new AbortController()
let externalAbortCleanup: (() => void) | null = null

function buildClassifier() {
  const opts = props.request.options
  const parsers = typeof opts.errorParsers === 'function'
    ? opts.errorParsers(responseErrorParserPresets)
    : opts.errorParsers ?? coreResponseErrorParsers

  return createResponseErrorClassifier({
    parsers,
    texts: opts.errorTexts,
    messageKey: opts.errorMessageKey,
  })
}

onMounted(() => {
  // Внешний AbortSignal закрывает диалог как `close`.
  const sig = props.request.options.signal
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
})

onBeforeUnmount(() => {
  // Снимаем всё, что заведено под заявку: подписку на внешний сигнал и свой
  // контроллер. Размонтирование — единственная точка, которую видят все три
  // пути завершения (кнопка, `close()` промиса, `closeAll()`), поэтому обрыв
  // in-flight `onConfirm` живёт именно здесь.
  externalAbortCleanup?.()
  externalAbortCleanup = null
  controller.abort()

  finishDialogInFlight(state, props.request)
})

function finish(action: DialogCloseAction, value?: unknown): void {
  // Снятие заявки из очереди откладываем на тик: окно должно успеть закрыться
  // до того, как исчезнет из разметки.
  if (!settleDialogRequest(state, props.request, { action, value }, { removeFromQueue: false }))
    return

  open.value = false
  void nextTick(() => removeDialogRequest(state, props.request))
}

function buildContext(value: unknown): DialogConfirmContext<any> & { _errorSet: () => boolean } {
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
    const next = { ...fieldErrors.value }
    if (message == null) {
      delete next[field]
      fieldErrors.value = next
      return
    }
    errorSet = true
    next[field] = message
    fieldErrors.value = next
  }

  const clearErrors = (): void => {
    currentError.value = null
    fieldErrors.value = {}
  }

  const setRawError = async (raw: unknown, meta?: Record<string, unknown>): Promise<ResponseErrorInfo | null> => {
    const info = await buildClassifier()(raw, meta)
    if (info.fieldErrors?.length) {
      const next = { ...fieldErrors.value }
      for (const entry of info.fieldErrors)
        next[entry.field] = entry.messages.join(' ')
      fieldErrors.value = next
    }
    currentError.value = info
    errorSet = true
    return info
  }

  return {
    value,
    signal: controller.signal,
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
  const req = props.request
  const value = req.kind === 'prompt' ? promptValue.value : undefined

  if (!req.onConfirm) {
    finish('confirm', value)
    return
  }

  currentError.value = null
  fieldErrors.value = {}
  loading.value = true

  const ctx = buildContext(value)

  // Пока колбэк в полёте, заявка считается родителем для новых вызовов: диалог,
  // открытый изнутри `onConfirm`, показывается поверх, а не встаёт в очередь за
  // тем, кто его ждёт.
  startDialogInFlight(state, req)

  try {
    const result = await req.onConfirm(ctx)
    // Сначала проверка «диалог ещё жив», потом запись состояния: за время
    // `await` заявку мог завершить `ctx.close()` или `closeAll()`.
    if (req.settled)
      return
    loading.value = false
    if (result === false)
      return // оставить открытым без ошибки
    if (currentError.value || hasFieldError.value || ctx._errorSet())
      return // есть ошибка — не закрывать
    finish('confirm', value)
  }
  catch (error) {
    if (req.settled)
      return
    loading.value = false
    if (!ctx._errorSet())
      await ctx.setRawError(error)
    // оставить диалог открытым с показанной ошибкой
  }
  finally {
    finishDialogInFlight(state, req)
  }
}

function handleCancel(): void {
  finish('cancel')
}

function handleModelUpdate(value: boolean): void {
  if (!value)
    finish('close')
}

// Опции веток читаются типизированно, без `as any` в шаблоне.
const promptOptions = computed<DialogPromptOptions>(() => props.request.options as DialogPromptOptions)
const confirmOptions = computed<DialogConfirmOptions>(() => props.request.options as DialogConfirmOptions)

// Прокидываемые в дочерний диалог общие пропы.
const sharedProps = computed(() => {
  const o = props.request.options
  return {
    title: o.title,
    size: o.size,
    closeOnBackdrop: o.closeOnBackdrop,
    closeOnEsc: o.closeOnEsc,
    // Подавление «мягкого» закрытия на время `onConfirm` считает сам диалог по
    // `confirmLoading` — здесь только включаем режим, чтобы механизм жил в
    // одном месте, а не дублировался сервисом.
    persistent: true,
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
  <!-- prompt -->
  <GrPromptDialog
    v-if="request.kind === 'prompt'"
    v-bind="sharedProps"
    v-model:value="promptValue"
    :model-value="open"
    :description="request.options.message ?? request.options.description"
    :label="promptOptions.label"
    :placeholder="promptOptions.placeholder"
    :required="promptOptions.required ?? false"
    :required-error-text="promptOptions.requiredErrorText"
    :cancel-text="promptOptions.cancelText"
    :input-type="promptOptions.inputType"
    :inputmode="promptOptions.inputmode"
    :maxlength="promptOptions.maxlength"
    :show-count="promptOptions.showCount"
    :multiline="promptOptions.multiline"
    :rows="promptOptions.rows"
    :autosize="promptOptions.autosize"
    :rules="promptOptions.rules"
    :error="currentError"
    :field-error="promptFieldError"
    :confirm-loading="loading"
    :close-on-confirm="false"
    @update:model-value="handleModelUpdate"
    @confirm="handleConfirm"
    @cancel="handleCancel"
  />

  <!-- alert: confirm-диалог без кнопки Cancel -->
  <GrConfirmDialog
    v-else-if="request.kind === 'alert'"
    :model-value="open"
    v-bind="sharedProps"
    :description="request.options.message ?? request.options.description"
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
          {{ sharedProps.confirmText ?? alertConfirmText }}
        </GrButton>
      </div>
    </template>
  </GrConfirmDialog>

  <!-- confirm -->
  <GrConfirmDialog
    v-else
    :model-value="open"
    v-bind="sharedProps"
    :description="request.options.message ?? request.options.description"
    :cancel-text="confirmOptions.cancelText"
    :error="currentError"
    :confirm-loading="loading"
    :close-on-confirm="false"
    @update:model-value="handleModelUpdate"
    @confirm="handleConfirm"
    @cancel="handleCancel"
  />
</template>
