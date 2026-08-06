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
import { computed, nextTick, onBeforeUnmount, provide, ref, shallowRef, watch } from 'vue'

import GrButton from '../GrButton/GrButton.vue'
import GrConfirmDialog from '../GrConfirmDialog/GrConfirmDialog.vue'
import GrPromptDialog from '../GrPromptDialog/GrPromptDialog.vue'
import {
  coreResponseErrorParsers,
  createResponseErrorClassifier,
  responseErrorParserPresets,
} from '../GrResponseErrorBanner'
import type { ResponseErrorInfo } from '../GrResponseErrorBanner'

import { GR_CONFIG_KEY, type GrComponentDefaults, type GrConfigContext } from '../GrConfigProvider/context'
import { GRANULARITY_I18N_KEY } from '../../i18n/adapter'
import { resolveGranularityI18n, useGranularityTranslations } from '../../internal/granularityI18n'

import { dialogQueue, removeDialogRequest, settleDialogRequest } from './store'
import type { DialogRequest } from './store'
import type { DialogCloseAction, DialogConfirmContext, DialogConfirmOptions, DialogPromptOptions } from './types'

const active = computed<DialogRequest | null>(() => dialogQueue[0] ?? null)

// ————— Мост конфига и i18n.
//
// Хост рендерится через `render(vnode, container)` в `document.body`, то есть вне
// дерева компонентов. Vue в этом случае берёт `provides` только из `appContext`,
// куда попадает лишь `app.provide()` — значения от `<GrConfigProvider>` до сюда
// не доходят. Поэтому вызов сервиса захватывает их в `setup` и кладёт в запрос, а
// хост раздаёт вниз конфиг **активного** запроса.
//
// Раздаём производный контекст, а не захваченный объект: хост один на всё
// приложение и живёт между вызовами, а запросы приходят из разных поддеревьев с
// разными провайдерами. Реактивность при этом сохраняется — внутри лежат те же
// рефы, что и у исходного провайдера.
const EMPTY_DEFAULTS: GrComponentDefaults = Object.freeze({})

provide<GrConfigContext>(GR_CONFIG_KEY, {
  size: computed(() => active.value?.config?.size.value),
  componentDefaults: computed(() => active.value?.config?.componentDefaults.value ?? EMPTY_DEFAULTS),
})

// i18n: тот же приём. Адаптер хоста (из `appContext`) остаётся запасным вариантом,
// если вызов пришёл без захваченного — так установка через `app.use()` продолжает
// работать как раньше.
const hostI18n = resolveGranularityI18n()

provide(GRANULARITY_I18N_KEY, {
  t: (key: string, params?: Record<string, unknown>) => {
    const adapter = active.value?.i18n ?? hostI18n
    // Вернуть сам ключ — принятый в пакете сигнал «перевода нет»: потребитель
    // подставит свой fallback-текст (см. `useGranularityTranslations`).
    return adapter?.t(key, params) ?? key
  },
  get locale() {
    return (active.value?.i18n ?? hostI18n)?.locale
  },
})

// Подвал alert-ветки хост рисует сам, поэтому и перевод кнопки достаёт сам.
// Адаптер берём тот же, что раздан вниз: собственный `provide` компонента его
// же `inject` не видит, и `useGranularityTranslations()` без аргумента ушёл бы
// мимо захваченного вызовом адаптера — в фолбэк из `appContext`.
const alertConfirmText = computed(() => {
  const { t } = useGranularityTranslations(active.value?.i18n ?? hostI18n)
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
const promptValue = ref('')

/** Единственное поле `GrPromptDialog` называется `value`. */
const PROMPT_FIELD = 'value'

// Одна запись — её и показываем: адрес не важен, когда адресат один.
const promptFieldError = computed<string | null>(() => {
  const own = fieldErrors.value[PROMPT_FIELD]
  if (own != null) return own

  const entries = Object.values(fieldErrors.value)
  return entries.length === 1 ? entries[0] : null
})

const hasFieldError = computed(() => Object.keys(fieldErrors.value).length > 0)

let controller: AbortController | null = null
let externalAbortCleanup: (() => void) | null = null

function resetState(): void {
  loading.value = false
  currentError.value = null
  fieldErrors.value = {}
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
    // Демонтаж предыдущей заявки — здесь, и только здесь: смену головы видит
    // ровно этот watcher, кем бы заявка ни была завершена. Раньше `abort()`
    // висел внутри `finish()`, и закрытие через `close()` промиса оставляло
    // in-flight `onConfirm` работать дальше.
    teardownActiveRequest()
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

/** Снимает всё, что заведено под текущую заявку: подписку на внешний сигнал и свой контроллер. */
function teardownActiveRequest(): void {
  cleanupExternalAbort()
  controller?.abort()
  controller = null
}

function finish(action: DialogCloseAction, value?: unknown, request?: DialogRequest): void {
  // Заявку берём аргументом, если вызывающий её уже держит: между началом
  // асинхронного `onConfirm` и его концом голова очереди могла смениться, и
  // завершать тогда надо свою заявку, а не чужую.
  const req = request ?? active.value
  if (!req) return

  // Снятие головы откладываем на тик: окно должно успеть закрыться до того,
  // как в панели окажется следующий диалог.
  if (!settleDialogRequest(req, { action, value }, { removeFromQueue: false }))
    return

  open.value = false
  void nextTick(() => removeDialogRequest(req))
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
    const info = await buildClassifier(req)(raw, meta)
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
    signal: controller!.signal,
    setError,
    setRawError,
    setFieldError,
    clearErrors,
    setLoading: (v: boolean) => { loading.value = v },
    close: (action: DialogCloseAction = 'close') => finish(action, undefined, req),
    _errorSet: () => errorSet,
  }
}

async function handleConfirm(): Promise<void> {
  const req = active.value
  if (!req) return

  const value = req.kind === 'prompt' ? promptValue.value : undefined

  if (!req.onConfirm) {
    finish('confirm', value, req)
    return
  }

  currentError.value = null
  fieldErrors.value = {}
  loading.value = true

  const ctx = buildContext(req, value)

  try {
    const result = await req.onConfirm(ctx)
    // Сначала проверка «диалог ещё мой», потом запись состояния: за время
    // `await` заявку мог завершить `ctx.close()` или `closeAll()`, и тогда
    // `loading` уехал бы уже в состояние следующего диалога.
    if (req.settled) return
    loading.value = false
    if (result === false) return // оставить открытым без ошибки
    if (currentError.value || hasFieldError.value || ctx._errorSet()) return // есть ошибка — не закрывать
    finish('confirm', value, req)
  }
  catch (error) {
    if (req.settled) return
    loading.value = false
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

onBeforeUnmount(teardownActiveRequest)

// Опции веток читаются типизированно, без `as any` в шаблоне.
const promptOptions = computed<DialogPromptOptions>(() => (active.value?.options ?? {}) as DialogPromptOptions)
const confirmOptions = computed<DialogConfirmOptions>(() => (active.value?.options ?? {}) as DialogConfirmOptions)

// Прокидываемые в дочерний диалог общие пропы.
const sharedProps = computed(() => {
  const o = active.value?.options ?? {}
  return {
    title: o.title,
    size: o.size,
    closeOnBackdrop: o.closeOnBackdrop,
    closeOnEsc: o.closeOnEsc,
    // Подавление «мягкого» закрытия на время `onConfirm` считает сам диалог по
    // `confirmLoading` — здесь только включаем режим, чтобы механизм жил в
    // одном месте, а не дублировался хостом.
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
  <template v-if="active">
    <!-- prompt -->
    <GrPromptDialog
      v-if="active.kind === 'prompt'"
      v-bind="sharedProps"
      v-model:value="promptValue"
      :model-value="open"
      :description="active.options.message ?? active.options.description"
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
      :description="active.options.message ?? active.options.description"
      :cancel-text="confirmOptions.cancelText"
      :error="currentError"
      :confirm-loading="loading"
      :close-on-confirm="false"
      @update:model-value="handleModelUpdate"
      @confirm="handleConfirm"
      @cancel="handleCancel"
    />
  </template>
</template>
