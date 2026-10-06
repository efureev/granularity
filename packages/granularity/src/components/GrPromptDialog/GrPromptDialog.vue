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
import { useGrComponentProp } from '../shared/configContext'
import { computed, ref, watch } from 'vue'

import GrButton from '../GrButton/GrButton.vue'
import GrDialog from '../GrDialog/GrDialog.vue'
import GrFormField from '../GrFormField/GrFormField.vue'
import GrInput from '../GrInput/GrInput.vue'
import GrTextarea from '../GrTextarea/GrTextarea.vue'
import GrResponseErrorBanner from '../GrResponseErrorBanner/GrResponseErrorBanner.vue'
import { useGranularityTranslations } from '../../internal/granularityI18n'
// Именованные импорты чистых функций: разметки не тянут, поэтому в
// `config.dependencies` не объявляются (см. правило про зависимости).
import { createGrFormMessageResolver, rulesForTrigger, runFieldRules } from '../shared/formValidation'
import type { GrFormRule, GrFormTrigger } from '../shared/formValidation'
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
  /** Открыто ли окно (`v-model`). Отмена закрывает его всегда, подтверждение — при `closeOnConfirm`. */
  modelValue: boolean
  /** Значение поля (`v-model:value`). Между открытиями окно его не сбрасывает. */
  value: string
  /** Заголовок окна, он же его доступное имя. Не задан — берётся из локали. */
  title?: string
  /** Пояснение над полем. Слот `default` его заменяет. */
  description?: string
  /** Подпись поля, она же его доступное имя. Не задана — берётся из локали. */
  label?: string
  /** Подсказка в пустом поле. */
  placeholder?: string
  /**
   * Закрывать по клику на подложку. По умолчанию `true`; при `persistent` на время подтверждения
   * или проверки `rules` выключается.
   */
  closeOnBackdrop?: boolean
  /**
   * Закрывать по Esc. По умолчанию `true`; при `persistent` на время подтверждения или проверки
   * `rules` выключается.
   */
  closeOnEsc?: boolean
  /** Показывать шапку с заголовком и кнопкой закрытия. По умолчанию `true`. */
  showHeader?: boolean
  /** Кнопка закрытия в шапке. По умолчанию `true`; при `persistent` тоже остаётся. */
  showCloseButton?: boolean
  /** Ширина окна по шкале `GrDialog`: от `sm` до `xl`, `full` — во весь экран. По умолчанию `md`. */
  size?: GrDialogSize
  /** Поля и линия шапки: `paddingX`, `paddingY`, `bordered`. */
  headerConfig?: GrDialogSectionConfig
  /** Поля и линия подвала с кнопками. */
  footerConfig?: GrDialogSectionConfig
  /** Поля тела окна. `bordered` у тела не применяется. */
  bodyConfig?: GrDialogSectionConfig
  /** A11y-лейбл кнопки закрытия (i18n). */
  closeLabel?: string
  /** Размер обеих кнопок подвала. Не задан — кнопки берут размер из `GrConfigProvider`. */
  buttonSize?: GrButtonSize
  /** Подпись кнопки подтверждения. Не задана — берётся из локали. */
  confirmText?: string
  /** Подпись кнопки отмены. Не задана — берётся из локали. */
  cancelText?: string
  /** Текст ошибки для пустого значения при `required=true` (i18n). */
  requiredErrorText?: string
  /** Вес кнопки подтверждения. По умолчанию `primary`. */
  confirmVariant?: GrButtonVariant
  /** Тон кнопки подтверждения: `danger` — для необратимого действия. По умолчанию `primary`. */
  confirmTone?: GrButtonTone
  /**
   * Пустое значение не подтверждается; ошибка видна после первого ухода из поля или попытки
   * подтвердить. По умолчанию `true`.
   */
  required?: boolean
  /** Тип однострочного поля. В многострочном режиме не применяется. */
  inputType?: GrInputType
  /** Программная клавиатура на мобильных. */
  inputmode?: InputHTMLAttributes['inputmode']
  /** Ограничение длины; со `showCount` рисуется счётчик. */
  maxlength?: number
  /** Счётчик символов под полем; с `maxlength` — в виде `len/maxlength`. */
  showCount?: boolean
  /**
   * Что у человека спрашивают — для браузера и менеджера паролей
   * (`current-password`, `new-password`, `one-time-code`, `off`).
   *
   * Из `inputType` не выводится: у одного и того же `password` три разных
   * правильных значения, и окно не знает, спрашивают у него старый пароль,
   * новый или одноразовый код. Значение выбирает потребитель.
   */
  autocomplete?: string
  /**
   * Имя поля. В наборе не за компанию: менеджеры паролей опираются и на него, а
   * сохранение значения без имени у части из них просто не срабатывает.
   */
  name?: string
  /**
   * Автозаглавная у программной клавиатуры. Пара к `autocomplete="off"` для
   * секретов, которые вводят руками: резервный код 2FA сверяется байт в байт, а
   * клавиатура поднимает первую букву.
   */
  autocapitalize?: 'off' | 'none' | 'on' | 'sentences' | 'words' | 'characters'
  /** Проверка орфографии. Вторая половина той же пары. */
  spellcheck?: boolean
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

export interface GrPromptDialogEmits {
  /** Окно закрыто (`v-model`): кнопкой, крестиком, Esc или кликом по подложке. */
  (e: 'update:modelValue', value: boolean): void
  /** Значение поля изменилось при вводе (`v-model:value`). */
  (e: 'update:value', value: string): void
  /**
   * Значение подтверждено — кнопкой или `Enter` в однострочном поле — и прошло `required` и
   * `rules`. Окно закрывается следом, если не выключен `closeOnConfirm`.
   */
  (e: 'confirm', value: string): void
  /** Нажата кнопка отмены. Крестик, Esc и подложка закрывают окно без этого события. */
  (e: 'cancel'): void
}

import './defaults'

const props = withDefaults(defineProps<GrPromptDialogProps>(), {
  title: undefined,
  description: undefined,
  label: undefined,
  placeholder: undefined,
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
  requiredErrorText: undefined,
  confirmVariant: 'primary',
  confirmTone: 'primary',
  required: true,
  inputType: 'text',
  inputmode: undefined,
  maxlength: undefined,
  showCount: false,
  autocomplete: undefined,
  name: undefined,
  autocapitalize: undefined,
  spellcheck: undefined,
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

// Эффективный размер: локальный проп → `GrConfigProvider` → дефолт компонента.
const resolvedSize = useGrComponentProp('GrPromptDialog', 'size', () => props.size, 'md')

const emit = defineEmits<GrPromptDialogEmits>()

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
    if (!isOpen)
      return

    touched.value = false
    ruleError.value = undefined
    validationRun += 1
  },
)

const resolveMessage = createGrFormMessageResolver(t)

const normalizedRules = computed<GrFormRule[]>(() => {
  if (!props.rules)
    return []
  return Array.isArray(props.rules) ? props.rules : [props.rules]
})

const requiredError = computed(() => {
  if (!props.required)
    return undefined
  return valueModel.value.trim().length > 0 ? undefined : resolvedRequiredErrorText.value
})

const canConfirm = computed(() => !requiredError.value)

const validationError = computed(() => {
  if (!touched.value)
    return undefined
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
  if (!rules.length)
    return undefined

  const run = ++validationRun
  validating.value = true
  try {
    const message = await runFieldRules(valueModel.value, rules, { value: valueModel.value }, resolveMessage)
    // Ответ устарел — значение или сам диалог успели смениться.
    if (run !== validationRun)
      return undefined

    ruleError.value = message
    return message
  }
  finally {
    if (run === validationRun)
      validating.value = false
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
  if (props.multiline)
    textareaRef.value?.focus()
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
// ловушка фокуса `GrModal` переводит фокус на панель.
// Источник — не только `modelValue`, но и само поле: содержимое панели
// появляется на такт позже открытия, и фокус по фиксированному `nextTick`
// приходился на момент, когда фокусировать ещё нечего.
watch(
  [() => props.modelValue, inputRef, textareaRef],
  () => {
    if (!props.modelValue)
      return
    focusField()
  },
  // `immediate`: окно могут смонтировать уже открытым — тогда смены пропа не
  // будет вовсе, и без этого фокус остался бы на панели.
  { immediate: true, flush: 'post' },
)

defineSlots<{
  /** Содержимое диалога вместо текста из пропа `description`. */
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
          :autocomplete="autocomplete"
          :name="name"
          :autocapitalize="autocapitalize"
          :spellcheck="spellcheck"
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
          :autocomplete="autocomplete"
          :name="name"
          :autocapitalize="autocapitalize"
          :spellcheck="spellcheck"
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
