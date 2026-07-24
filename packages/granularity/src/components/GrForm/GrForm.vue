<script setup lang="ts">
import { computed, onBeforeUnmount, provide, ref, watch } from 'vue'

import { useGranularityTranslations } from '../../internal/granularityI18n'
import { GR_FORM_KEY } from './context'
import {
  getByPath,
  rulesForTrigger,
  rulesRequired,
  runFieldRules,
  setByPath,
  toRuleArray,
  type GrFormMessageResolver,
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
}

const props = withDefaults(
  defineProps<GrFormProps>(),
  {
    rules: undefined,
    validateOnBlur: true,
    validateOnChange: false,
    scrollToError: true,
    scrollBehavior: 'smooth',
  },
)

const emit = defineEmits<{
  /** Форма прошла валидацию по submit. Отдаёт `model`. */
  (e: 'submit', model: Record<string, unknown>): void
  /** Результат валидации одного поля. */
  (e: 'validate', name: string, valid: boolean, message: string | undefined): void
}>()

const { t } = useGranularityTranslations()

// ————— Ошибки и реестр полей.
const errors = ref<Record<string, string | undefined>>({})
const fieldRegistry = new Map<string, () => HTMLElement | null>()

function getRules(name: string): GrFormRule[] {
  return toRuleArray(props.rules?.[name])
}

function getValue(name: string): unknown {
  return getByPath(props.model, name)
}

const requiredFields = computed(() => {
  const set = new Set<string>()
  for (const name of Object.keys(props.rules ?? {})) {
    if (rulesRequired(getRules(name))) set.add(name)
  }
  return set
})

// Дефолтные i18n-сообщения (перекрываются `rule.message`).
const resolveMessage: GrFormMessageResolver = (kind, rule, params) => {
  if (rule.message) return rule.message
  const fallback: Record<string, string> = {
    required: 'This field is required',
    min: 'Minimum is {min}',
    max: 'Maximum is {max}',
    len: 'Length must be {len}',
    pattern: 'Invalid format',
    email: 'Enter a valid email',
    url: 'Enter a valid URL',
    invalid: 'Invalid value',
  }
  return t(`gr.form.${kind}`, fallback[kind], params)
}

// ————— Валидация.
async function validateField(name: string, trigger?: GrFormTrigger): Promise<boolean> {
  if (trigger === 'blur' && !props.validateOnBlur) return !errors.value[name]

  const rules = rulesForTrigger(getRules(name), trigger)
  if (!rules.length) return !errors.value[name]

  const message = await runFieldRules(getValue(name), rules, props.model, resolveMessage)
  errors.value = { ...errors.value, [name]: message }
  emit('validate', name, !message, message)
  return !message
}

async function validate(): Promise<boolean> {
  const names = Object.keys(props.rules ?? {})
  const results = await Promise.all(names.map(name => validateField(name)))
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

function resetFields(): void {
  const snapshot = initialSnapshot.value
  for (const key of Object.keys(props.model)) {
    setByPath(props.model, key, cloneData(snapshot[key]))
  }
  clearValidate()
}

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
  () => Object.keys(props.rules ?? {}),
  (names) => {
    stopWatchers.forEach(stop => stop())
    stopWatchers = names.map(name =>
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
  hasField: (name: string) => getRules(name).length > 0,
  registerField: (name, getEl) => {
    fieldRegistry.set(name, getEl)
    return () => fieldRegistry.delete(name)
  },
  validateField,
})

function onSubmit(): void {
  void validate().then((valid) => {
    if (valid) emit('submit', props.model)
  })
}

defineExpose({
  validate,
  validateField,
  clearValidate,
  resetFields,
  scrollToField,
})
</script>

<template>
  <form data-gr-form novalidate @submit.prevent="onSubmit">
    <slot :validate="validate" :errors="errors" />
  </form>
</template>
