<script setup lang="ts">
import { computed, onBeforeUnmount, provide, ref, watch } from 'vue'

import { useGranularityTranslations } from '../../internal/granularityI18n'
import { GR_FORM_KEY } from './context'
import {
  getByPath,
  createGrFormMessageResolver,
  rulesForTrigger,
  rulesRequired,
  runFieldRules,
  setByPath,
  toRuleArray,
  type GrFormRule,
  type GrFormRules,
  type GrFormTrigger,
} from './validation'

export type {
  GrFormRule,
  GrFormRules,
  GrFormTrigger,
  GrFormValidatorResult,
} from './validation'

/**
 * Публичный GR-примитив «Form» — оркестрация валидации над `GrFormField`.
 *
 * Модель формы (`v-model`-объект приложения) + декларативные `rules` по имени поля.
 * Форма прогоняет правила, раскладывает ошибки по контексту, скроллит к первой
 * ошибке и эмитит `submit` только при валидной форме. Императивный API — через
 * template ref (`validate` / `validateField` / `clearValidate` / `resetFields` /
 * `scrollToField`).
 */
export interface GrFormProps {
  /** Реактивный объект данных формы. Поля адресуются по `name` (`GrFormField`), в т.ч. dot-path. */
  model: Record<string, unknown>
  /** Правила валидации по имени поля: `{ email: [{ required: true, type: 'email' }] }`. */
  rules?: GrFormRules
  /** Валидировать поле при потере фокуса. */
  validateOnBlur?: boolean
  /** Валидировать поле при каждом изменении значения. */
  validateOnChange?: boolean
  /** Скроллить к первому невалидному полю после `validate()`. */
  scrollToError?: boolean
  scrollBehavior?: ScrollBehavior
  /**
   * Выключить форму целиком — типично на время отправки. Доезжает до контролов
   * через контекст поля, поэтому обходить их по одному не нужно.
   */
  disabled?: boolean
}

const props = withDefaults(
  defineProps<GrFormProps>(),
  {
    rules: undefined,
    validateOnBlur: true,
    validateOnChange: false,
    scrollToError: true,
    scrollBehavior: 'smooth',
    disabled: false,
  },
)

const emit = defineEmits<{
  /** Форма прошла валидацию по submit. Отдаёт `model`. */
  (e: 'submit', model: Record<string, unknown>): void
  /** Результат валидации одного поля. */
  (e: 'validate', name: string, valid: boolean, message: string | undefined): void
  /**
   * Submit не прошёл валидацию. Без этого события «форма невалидна» и «ничего
   * не произошло» выглядят для потребителя одинаково.
   */
  (e: 'invalid', errors: Record<string, string>): void
}>()

const { t } = useGranularityTranslations()

// ————— Ошибки и реестр полей.
const errors = ref<Record<string, string | undefined>>({})
const fieldRegistry = new Map<string, () => HTMLElement | null>()

/**
 * Поля, объявившие себя обязательными собственным пропом `required` — без
 * правила в `rules`. До этого они рисовали звёздочку, но submit пропускал их
 * пустыми: обязательность и валидация жили в разных местах.
 */
const selfRequiredFields = ref<Set<string>>(new Set())

/** Поля с идущей асинхронной проверкой. */
const validatingSet = ref<Set<string>>(new Set())
const validatingFields = computed(() => validatingSet.value)

function getRules(name: string): GrFormRule[] {
  return toRuleArray(props.rules?.[name])
}

function getValue(name: string): unknown {
  return getByPath(props.model, name)
}

const requiredFields = computed(() => {
  const set = new Set<string>(selfRequiredFields.value)
  for (const name of Object.keys(props.rules ?? {})) {
    if (rulesRequired(getRules(name))) set.add(name)
  }
  return set
})

/** Все поля, которые форма обязана проверить: с правилами и обязательные без них. */
const validatedNames = computed(() => [
  ...new Set([...Object.keys(props.rules ?? {}), ...selfRequiredFields.value]),
])

/**
 * Правила поля с учётом неявной обязательности: `<GrFormField required>` без
 * записи в `rules` проверяется тем же `required`-правилом и тем же сообщением,
 * что и явное.
 */
const IMPLICIT_REQUIRED_RULE: GrFormRule = { required: true }

function effectiveRules(name: string): GrFormRule[] {
  const rules = getRules(name)
  if (rules.length) return rules
  return selfRequiredFields.value.has(name) ? [IMPLICIT_REQUIRED_RULE] : []
}

// Дефолтные i18n-сообщения (перекрываются `rule.message`) — общие с любым
// потребителем движка правил, не только с формой.
const resolveMessage = createGrFormMessageResolver(t)

// ————— Валидация.
async function validateField(name: string, trigger?: GrFormTrigger): Promise<boolean> {
  if (trigger === 'blur' && !props.validateOnBlur) return !errors.value[name]

  const rules = rulesForTrigger(effectiveRules(name), trigger)
  if (!rules.length) return !errors.value[name]

  // Признак «идёт проверка» нужен именно асинхронным правилам: без него поле
  // молчит до ответа сервера, и пользователь не знает, что что-то происходит.
  validatingSet.value = new Set(validatingSet.value).add(name)
  try {
    const message = await runFieldRules(getValue(name), rules, props.model, resolveMessage)
    errors.value = { ...errors.value, [name]: message }
    emit('validate', name, !message, message)
    return !message
  }
  finally {
    const next = new Set(validatingSet.value)
    next.delete(name)
    validatingSet.value = next
  }
}

async function validate(): Promise<boolean> {
  const results = await Promise.all(validatedNames.value.map(name => validateField(name)))
  const valid = results.every(Boolean)
  if (!valid && props.scrollToError) scrollToFirstError()
  return valid
}

function clearValidate(names?: string | string[]): void {
  if (!names) {
    errors.value = {}
    return
  }
  const list = Array.isArray(names) ? names : [names]
  const next = { ...errors.value }
  for (const name of list) delete next[name]
  errors.value = next
}

// Снимок начальных значений для `resetFields`. JSON-клон читает «сквозь» reactive-
// прокси и даёт простой снимок (модель формы — JSON-данные); `structuredClone` на
// прокси падает с DataCloneError.
function cloneData<T>(value: T): T {
  return value === undefined ? value : (JSON.parse(JSON.stringify(value)) as T)
}

const initialSnapshot = ref<Record<string, unknown>>(cloneData(props.model))

/**
 * Переснять «исходное» состояние. Нужен формам редактирования: модель там
 * наполняется после ответа сервера, а снимок в `setup` фиксировал пустой
 * объект — и `resetFields()` возвращал не «как было при загрузке», а пустоту.
 */
function setSnapshot(model?: Record<string, unknown>): void {
  initialSnapshot.value = cloneData(model ?? props.model)
}

/**
 * Удаление ключа модели. Вынесено в функцию не ради красоты: модель — проп, и
 * прямое `delete props.model[key]` линтер справедливо считает мутацией пропа.
 * Мутируем мы при этом по контракту — `model` у формы и есть общий объект
 * данных приложения, ради которого форма и существует.
 */
function removeKey(model: Record<string, unknown>, key: string): void {
  delete model[key]
}

function resetFields(names?: string | string[]): void {
  const snapshot = initialSnapshot.value
  const list = names ? (Array.isArray(names) ? names : [names]) : undefined

  // Ключи объединяем: поле, появившееся после снимка, надо **удалить**, а не
  // выставить в `undefined` — иначе «сброс» оставляет за собой мусор.
  const keys = list ?? [...new Set([...Object.keys(props.model), ...Object.keys(snapshot)])]

  for (const key of keys) {
    if (key in snapshot) setByPath(props.model, key, cloneData(snapshot[key]))
    else removeKey(props.model, key)
  }

  clearValidate(list)
}

/** Модель отличается от снимка. Сравнение JSON-ом — тем же, что и снимок. */
const isDirty = computed(() => JSON.stringify(cloneData(props.model)) !== JSON.stringify(initialSnapshot.value))

/**
 * Известных ошибок нет. Это не «валидация прошла»: до первого `validate()`
 * ошибок нет просто потому, что никто не проверял.
 */
const isValid = computed(() => Object.values(errors.value).every(message => !message))

// ————— Scroll-to-error.
function scrollToField(name: string): void {
  const el = fieldRegistry.get(name)?.()
  if (!el) return
  el.scrollIntoView({ behavior: props.scrollBehavior, block: 'center' })
  const focusable = el.querySelector<HTMLElement>('input, select, textarea, button, [tabindex]:not([tabindex="-1"])')
  focusable?.focus?.()
}

function scrollToFirstError(): void {
  const elements = [...fieldRegistry.entries()]
    .filter(([name]) => errors.value[name])
    .map(([, getEl]) => getEl())
    .filter((el): el is HTMLElement => Boolean(el))

  // Первое по порядку в DOM — «самое верхнее» невалидное поле на экране.
  elements.sort((a, b) =>
    (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING) ? -1 : 1,
  )

  const first = elements[0]
  if (!first) return
  first.scrollIntoView({ behavior: props.scrollBehavior, block: 'center' })
  first.querySelector<HTMLElement>('input, select, textarea, button, [tabindex]:not([tabindex="-1"])')?.focus?.()
}

// ————— «Умный» change: чистим ошибку по мере исправления; валидируем при validateOnChange.
let stopWatchers: Array<() => void> = []
watch(
  // Ключ — строка имён, а не массив: идентичность массива меняется на каждый
  // пересчёт геттера, и все пер-полевые watcher'ы пересоздавались впустую.
  () => validatedNames.value.join(' '),
  () => {
    stopWatchers.forEach(stop => stop())
    stopWatchers = validatedNames.value.map(name =>
      watch(
        () => getValue(name),
        () => {
          if (props.validateOnChange) void validateField(name, 'change')
          else if (errors.value[name]) void validateField(name) // ре-валидация, чтобы снять ошибку
        },
        { deep: true },
      ),
    )
  },
  { immediate: true },
)

onBeforeUnmount(() => stopWatchers.forEach(stop => stop()))

// ————— Контекст для `GrFormField`.
provide(GR_FORM_KEY, {
  errors,
  requiredFields,
  validatingFields,
  disabled: computed(() => props.disabled),
  hasField: (name: string) => effectiveRules(name).length > 0,
  registerField: (name, getEl, registration) => {
    fieldRegistry.set(name, getEl)

    const stopRequired = registration?.required
      ? watch(
          registration.required,
          (required) => {
            const next = new Set(selfRequiredFields.value)
            if (required) next.add(name)
            else next.delete(name)
            selfRequiredFields.value = next
          },
          { immediate: true },
        )
      : undefined

    return () => {
      fieldRegistry.delete(name)
      stopRequired?.()
      const next = new Set(selfRequiredFields.value)
      next.delete(name)
      selfRequiredFields.value = next
    }
  },
  validateField,
})

function onSubmit(): void {
  void validate().then((valid) => {
    if (valid) {
      emit('submit', props.model)
      return
    }

    const failed: Record<string, string> = {}
    for (const [name, message] of Object.entries(errors.value)) {
      if (message) failed[name] = message
    }
    emit('invalid', failed)
  })
}

defineExpose({
  validate,
  validateField,
  clearValidate,
  resetFields,
  scrollToField,
  setSnapshot,
  isDirty,
  isValid,
  validatingFields,
})
</script>

<template>
  <form data-gr-form novalidate @submit.prevent="onSubmit">
    <slot
      :validate="validate"
      :errors="errors"
      :is-dirty="isDirty"
      :is-valid="isValid"
      :validating-fields="validatingFields"
      :reset-fields="resetFields"
      :set-snapshot="setSnapshot"
    />
  </form>
</template>
