<script setup lang="ts">
/**
 * GrPromptDialog — GR-примитив диалога ввода значения поверх `GrDialog`.
 *
 * Синхронизирован с `GrDialog` по набору проп-проксирования:
 * `size`, `closeOnBackdrop`, `closeOnEsc`, `showHeader`, `showCloseButton`,
 * `headerConfig`, `footerConfig`, `bodyConfig`, `closeLabel`.
 *
 * Поведение `required=true` (по умолчанию): пустое значение подсвечивается
 * ошибкой только после первого «касания» (blur или попытка confirm),
 * чтобы не шуметь при открытии.
 *
 * Проверки сверх `required` описываются пропом `rules` — тем же движком, что и
 * у `GrForm`: третий частный случай валидации в пакете заводить незачем.
 */
import { computed, nextTick, ref, watch } from 'vue'

import GrButton from '../GrButton/GrButton.vue'
import GrDialog from '../GrDialog/GrDialog.vue'
import GrFormField from '../GrFormField/GrFormField.vue'
import GrInput from '../GrInput/GrInput.vue'
import GrTextarea from '../GrTextarea/GrTextarea.vue'
import GrResponseErrorBanner from '../GrResponseErrorBanner/GrResponseErrorBanner.vue'
import { useGranularityTranslations } from '../../internal/granularityI18n'
// Именованные импорты чистых функций: разметки не тянут, поэтому в
// `config.dependencies` не объявляются (см. правило про зависимости).
import { createGrFormMessageResolver, rulesForTrigger, runFieldRules } from '../GrForm/validation'
import type { GrFormRule, GrFormTrigger } from '../GrForm/validation'
import type { GrButtonSize, GrButtonTone, GrButtonVariant } from '../GrButton'
import type { GrDialogSectionConfig, GrDialogSize } from '../GrDialog'

/**
 * Тип поля выводим из самого `GrInput`, а не заводим ему именованный алиас:
 * алиас в пропе `GrInput` заменил бы в таблице API витрины список допустимых
 * значений на своё имя — документация стала бы беднее ради удобства обёртки.
 */
type GrInputType = NonNullable<InstanceType<typeof GrInput>['$props']['type']>
import type { ResponseErrorInfo } from '../GrResponseErrorBanner'
import type { InputHTMLAttributes } from 'vue'

export interface GrPromptDialogProps {
  modelValue: boolean
  value: string
  title?: string
  description?: string
  label?: string
  placeholder?: string
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
  /** Текст ошибки для пустого значения при `required=true` (i18n). */
  requiredErrorText?: string
  confirmVariant?: GrButtonVariant
  confirmTone?: GrButtonTone
  required?: boolean
  /** Тип однострочного поля. В многострочном режиме не применяется. */
  inputType?: GrInputType
  /** Программная клавиатура на мобильных. */
  inputmode?: InputHTMLAttributes['inputmode']
  /** Ограничение длины; со `showCount` рисуется счётчик. */
  maxlength?: number
  showCount?: boolean
  /** Многострочный ввод: вместо `GrInput` рисуется `GrTextarea`. */
  multiline?: boolean
  /** Высота многострочного поля в строках. */
  rows?: number
  /** Автоподбор высоты многострочного поля под содержимое. */
  autosize?: boolean
  /**
   * Правила проверки значения — те же, что у `GrForm` (`required`, `type`,
   * `min`/`max`/`len`, `pattern`, свой в т.ч. асинхронный `validator`).
   * Прогоняются на blur (после первого касания) и на подтверждении.
   */
  rules?: GrFormRule | GrFormRule[]
  /**
   * Структура ошибки ответа сервера для показа общим блоком в теле диалога
   * (через `GrResponseErrorBanner`). `null` — блок скрыт.
   */
  error?: ResponseErrorInfo | null
  /**
   * Внешняя ошибка поля ввода (например, серверная валидация). Имеет приоритет
   * над встроенной проверкой. `null`/`undefined` — нет внешней ошибки.
   */
  fieldError?: string | null
  /** Состояние загрузки кнопки Confirm (async-`onConfirm` in-flight). */
  confirmLoading?: boolean
  /** Принудительно дизейблит кнопку Confirm. */
  confirmDisabled?: boolean
  /**
   * Закрывать ли диалог автоматически по клику Confirm. По умолчанию `true`.
   * `false` — отдаёт управление закрытием наружу (нужно `useDialogService`).
   */
  closeOnConfirm?: boolean
  /**
   * Запрет закрытия «мягкими» способами (Esc, клик по бэкдропу), пока идёт
   * подтверждение или проверка `rules`. Кнопка закрытия и «Отмена» остаются:
   * окно без единого выхода — ловушка.
   */
  persistent?: boolean
}

const props = withDefaults(defineProps<GrPromptDialogProps>(), {
  title: undefined,
  description: undefined,
  label: undefined,
  placeholder: undefined,
  closeOnBackdrop: true,
  closeOnEsc: true,
  showHeader: true,
  showCloseButton: true,
  size: 'md',
  headerConfig: undefined,
  footerConfig: undefined,
  bodyConfig: undefined,
  closeLabel: undefined,
  buttonSize: undefined,
  confirmText: undefined,
  cancelText: undefined,
  requiredErrorText: undefined,
  confirmVariant: 'primary',
  confirmTone: 'primary',
  required: true,
  inputType: 'text',
  inputmode: undefined,
  maxlength: undefined,
  showCount: false,
  multiline: false,
  rows: undefined,
  autosize: false,
  rules: undefined,
  error: null,
  fieldError: null,
  confirmLoading: false,
  confirmDisabled: false,
  closeOnConfirm: true,
  persistent: false,
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'update:value', value: string): void
  (e: 'confirm', value: string): void
  (e: 'cancel'): void
}>()

// Дефолты берём из общего i18n-блока пакета (fallback — англ.), а не хардкодим.
const { t } = useGranularityTranslations()
const resolvedTitle = computed(() => props.title ?? t('gr.dialog.prompt.title', 'Prompt'))
const resolvedLabel = computed(() => props.label ?? t('gr.dialog.prompt.label', 'Value'))
const resolvedRequiredErrorText = computed(() => props.requiredErrorText ?? t('gr.dialog.prompt.required', 'Enter a value.'))
const resolvedCloseLabel = computed(() => props.closeLabel ?? t('gr.common.close', 'Close'))
const resolvedConfirmText = computed(() => props.confirmText ?? t('gr.common.confirm', 'Confirm'))
const resolvedCancelText = computed(() => props.cancelText ?? t('gr.common.cancel', 'Cancel'))

const open = computed({
  get: () => props.modelValue,
  set: (v: boolean) => emit('update:modelValue', v),
})

const valueModel = computed({
  get: () => props.value,
  set: (v: string) => emit('update:value', v),
})

const touched = ref(false)
const inputRef = ref<InstanceType<typeof GrInput> | null>(null)
const textareaRef = ref<InstanceType<typeof GrTextarea> | null>(null)

/** Ошибка последнего прогона `rules`; `required` считается отдельно и мгновенно. */
const ruleError = ref<string | undefined>(undefined)
const validating = ref(false)

// Сторож устаревших прогонов: асинхронное правило может ответить после того,
// как значение уже сменилось, и дописать чужую ошибку.
let validationRun = 0

watch(
  () => props.modelValue,
  (isOpen) => {
    if (!isOpen) return

    touched.value = false
    ruleError.value = undefined
    validationRun += 1
  },
)

const resolveMessage = createGrFormMessageResolver(t)

const normalizedRules = computed<GrFormRule[]>(() => {
  if (!props.rules) return []
  return Array.isArray(props.rules) ? props.rules : [props.rules]
})

const requiredError = computed(() => {
  if (!props.required) return undefined
  return valueModel.value.trim().length > 0 ? undefined : resolvedRequiredErrorText.value
})

const canConfirm = computed(() => !requiredError.value)

const validationError = computed(() => {
  if (!touched.value) return undefined
  return requiredError.value ?? ruleError.value
})

// Внешняя ошибка поля (серверная валидация) имеет приоритет над встроенной.
const fieldErrorMessage = computed(() => props.fieldError ?? validationError.value ?? undefined)

/**
 * Прогоняет `rules` для триггера. Возвращает сообщение или `undefined`.
 * `required` здесь не участвует: он синхронный и считается отдельно, чтобы
 * пустое поле блокировало кнопку без похода в асинхронный движок.
 */
async function runRules(trigger: GrFormTrigger): Promise<string | undefined> {
  const rules = rulesForTrigger(normalizedRules.value, trigger)
  if (!rules.length) return undefined

  const run = ++validationRun
  validating.value = true
  try {
    const message = await runFieldRules(valueModel.value, rules, { value: valueModel.value }, resolveMessage)
    // Ответ устарел — значение или сам диалог успели смениться.
    if (run !== validationRun) return undefined

    ruleError.value = message
    return message
  }
  finally {
    if (run === validationRun) validating.value = false
  }
}

function onBlur(): void {
  touched.value = true
  void runRules('blur')
}

// Пока подтверждение или проверка в полёте, случайное движение не должно
// оборвать операцию.
const softCloseBlocked = computed(() => props.persistent && (props.confirmLoading || validating.value))
const resolvedCloseOnBackdrop = computed(() => (softCloseBlocked.value ? false : props.closeOnBackdrop))
const resolvedCloseOnEsc = computed(() => (softCloseBlocked.value ? false : props.closeOnEsc))

function onCancel(): void {
  emit('cancel')
  emit('update:modelValue', false)
}

function focusField(): void {
  if (props.multiline) textareaRef.value?.focus()
  else inputRef.value?.focus()
}

async function onConfirm(): Promise<void> {
  touched.value = true

  if (!canConfirm.value) {
    focusField()
    return
  }

  if (await runRules('submit')) {
    focusField()
    return
  }

  emit('confirm', valueModel.value)
  if (props.closeOnConfirm)
    emit('update:modelValue', false)
}

/**
 * `Enter` подтверждает — базовое ожидание от окна, единственный смысл которого
 * ввести одно значение. В многострочном режиме `Enter` остаётся переводом
 * строки, поэтому обработчик висит только на однострочном поле.
 */
function onEnter(): void {
  void onConfirm()
}

// Фокус в поле, а не на панель: диалог существует ровно ради ввода.
//
// Через `initialFocus` у `GrModal` это не решается: элемент рождается внутри
// поддерева диалога, и возврат его же пропом наверх замыкает рендер в цикл
// («Maximum recursive updates» — проверено). Поэтому фокус ставит содержимое,
// после отрисовки (`flush: 'post'` + кадр), то есть заведомо позже, чем
// фокус-ловушка HeadlessUI переводит фокус на панель.
watch(
  () => props.modelValue,
  async (isOpen) => {
    if (!isOpen) return

    await nextTick()
    focusField()
  },
  // `immediate`: окно могут смонтировать уже открытым — тогда смены пропа не
  // будет вовсе, и без этого фокус остался бы на панели.
  { immediate: true, flush: 'post' },
)
</script>

<template>
  <GrDialog
    v-model="open"
    :title="resolvedTitle"
    :size="size"
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
        <div v-if="description" class="text-[14px] text-[var(--gr-muted-fg)]">
          {{ description }}
        </div>
      </slot>

      <!-- `id` полю не задаём: `GrFormField` генерирует его сам, а поле читает
           из контекста. Литеральный id ломал два открытых диалога сразу. -->
      <GrFormField :label="resolvedLabel" :error="fieldErrorMessage">
        <GrTextarea
          v-if="multiline"
          ref="textareaRef"
          v-model="valueModel"
          data-testid="gr-prompt-input"
          :placeholder="placeholder"
          :rows="rows"
          :autosize="autosize"
          :maxlength="maxlength"
          :show-count="showCount"
          :invalid="!!fieldErrorMessage"
          @blur="onBlur"
        />
        <GrInput
          v-else
          ref="inputRef"
          v-model="valueModel"
          data-testid="gr-prompt-input"
          :type="inputType"
          :inputmode="inputmode"
          :placeholder="placeholder"
          :maxlength="maxlength"
          :show-count="showCount"
          :invalid="!!fieldErrorMessage"
          @blur="onBlur"
          @keydown.enter="onEnter"
        />
      </GrFormField>

      <slot name="error" :error="error">
        <GrResponseErrorBanner v-if="error" :error="error" :can-dismiss="false" />
      </slot>
    </div>

    <template #footer>
      <slot name="footer">
        <div class="flex items-center justify-end gap-3">
          <GrButton data-testid="gr-prompt-cancel" variant="outline" :size="buttonSize" @click="onCancel">
            {{ resolvedCancelText }}
          </GrButton>
          <GrButton
            data-testid="gr-prompt-confirm"
            :variant="confirmVariant"
            :tone="confirmTone"
            :size="buttonSize"
            :loading="confirmLoading || validating"
            :disabled="confirmDisabled || (touched && !canConfirm)"
            @click="onConfirm"
          >
            {{ resolvedConfirmText }}
          </GrButton>
        </div>
      </slot>
    </template>
  </GrDialog>
</template>
