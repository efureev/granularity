<script setup lang="ts" generic="TModel extends object = Record<string, unknown>">
import { computed, onBeforeUnmount, provide, ref, watch } from 'vue'

import { useGranularityTranslations } from '../../internal/granularityI18n'
import { GR_FORM_KEY } from './context'
import { cloneModelValue, modelFingerprint } from './modelSnapshot'
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
  GrFormFileRule,
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
export interface GrFormProps<TModel extends object = Record<string, unknown>> {
  /**
   * Реактивный объект данных формы. Поля адресуются по `name` (`GrFormField`),
   * в т.ч. dot-path.
   *
   * Тип дженерик, а не `Record<string, unknown>`: моделью бывает объект чужой
   * библиотеки (`useForm` Inertia, стор), у которого рядом с полями лежат
   * собственные методы. Под словарь он не подходит, и потребителю пришлось бы
   * приводить его через `as unknown as` в каждой форме.
   */
  model: TModel
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

export interface GrFormEmits<TModel extends object = Record<string, unknown>> {
  /** Форма прошла валидацию по submit. Отдаёт `model`. */
  (e: 'submit', model: TModel): void
  /** Результат валидации одного поля. */
  (e: 'validate', name: string, valid: boolean, message: string | undefined): void
  /**
   * Submit не прошёл валидацию. Без этого события «форма невалидна» и «ничего
   * не произошло» выглядят для потребителя одинаково.
   */
  (e: 'invalid', errors: Record<string, string>): void
}

const props = withDefaults(
  defineProps<GrFormProps<TModel>>(),
  {
    rules: undefined,
    validateOnBlur: true,
    validateOnChange: false,
    scrollToError: true,
    scrollBehavior: 'smooth',
    disabled: false,
  },
)

const emit = defineEmits<GrFormEmits<TModel>>()

const { t } = useGranularityTranslations()

/**
 * Модель наружу дженерик, а адресация полей внутри работает по строковому пути.
 * Приведение безопасно: форма читает и пишет только по именам, объявленным
 * полями (`GrFormField name`), а не по всему объекту.
 */
const modelRecord = computed(() => props.model as Record<string, unknown>)

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
  return getByPath(modelRecord.value, name)
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
// Счётчик поколений на имя поля: перекрывающиеся асинхронные прогоны пишут
// результат в порядке РАЗРЕШЕНИЯ промисов, и без него медленный ответ про
// старое значение затирал бы свежий (приём — `searchSeq` в GrAutocomplete).
const validationSeq = new Map<string, number>()
// Последний стартовавший прогон поля: вытесненному нечего сказать о текущем
// значении, и он отдаёт вердикт того, кто его вытеснил, — иначе `validate()`
// собрал бы «валидно» из карты ошибок, куда новый прогон ещё не записал.
const validationRuns = new Map<string, { seq: number, promise: Promise<boolean> }>()

async function validateField(name: string, trigger?: GrFormTrigger): Promise<boolean> {
  if (trigger === 'blur' && !props.validateOnBlur) return !errors.value[name]

  const rules = rulesForTrigger(effectiveRules(name), trigger)
  if (!rules.length) return !errors.value[name]

  const seq = (validationSeq.get(name) ?? 0) + 1
  validationSeq.set(name, seq)

  const run = runValidation(name, seq, rules)
  validationRuns.set(name, { seq, promise: run })
  return run
}

async function runValidation(name: string, seq: number, rules: GrFormRule[]): Promise<boolean> {
  // Признак «идёт проверка» нужен именно асинхронным правилам: без него поле
  // молчит до ответа сервера, и пользователь не знает, что что-то происходит.
  validatingSet.value = new Set(validatingSet.value).add(name)
  try {
    const message = await runFieldRules(getValue(name), rules, modelRecord.value, resolveMessage)

    // Устаревший прогон: его результат — про прежнее значение, не применять.
    if (validationSeq.get(name) !== seq) {
      const current = validationRuns.get(name)
      // Цепочка конечна: каждый следующий прогон новее предыдущего. Своего
      // прогона в реестре нет только после `clearValidate` — там проверять
      // нечего, форма уже чиста.
      return current && current.seq !== seq ? current.promise : !errors.value[name]
    }

    errors.value = { ...errors.value, [name]: message }
    emit('validate', name, !message, message)
    return !message
  }
  finally {
    if (validationSeq.get(name) === seq) {
      const next = new Set(validatingSet.value)
      next.delete(name)
      validatingSet.value = next
    }
  }
}

async function validate(): Promise<boolean> {
  const results = await Promise.all(validatedNames.value.map(name => validateField(name)))
  const valid = results.every(Boolean)
  if (!valid && props.scrollToError) scrollToFirstError()
  return valid
}

/**
 * Отменить летящие проверки: их ответ относится к состоянию до сброса, и
 * записать его в очищенную форму значило бы вернуть пользователю ошибку,
 * которую он только что убрал. Заодно снимаем «проверяем» — ждать сервер,
 * чтобы погасить индикатор на сброшенном поле, не за чем.
 */
function invalidateValidation(names?: string[]): void {
  const list = names ?? [...validationSeq.keys()]
  if (!list.length) return

  const nextValidating = new Set(validatingSet.value)
  for (const name of list) {
    validationSeq.set(name, (validationSeq.get(name) ?? 0) + 1)
    validationRuns.delete(name)
    nextValidating.delete(name)
  }
  validatingSet.value = nextValidating
}

function clearValidate(names?: string | string[]): void {
  if (!names) {
    invalidateValidation()
    errors.value = {}
    return
  }
  const list = Array.isArray(names) ? names : [names]
  invalidateValidation(list)
  const next = { ...errors.value }
  for (const name of list) delete next[name]
  errors.value = next
}

const initialSnapshot = ref<Record<string, unknown>>(cloneModelValue(modelRecord.value))

/**
 * Переснять «исходное» состояние. Нужен формам редактирования: модель там
 * наполняется после ответа сервера, а снимок в `setup` фиксировал пустой
 * объект — и `resetFields()` возвращал не «как было при загрузке», а пустоту.
 */
function setSnapshot(model?: Record<string, unknown>): void {
  initialSnapshot.value = cloneModelValue((model ?? props.model) as Record<string, unknown>)
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
  const model = modelRecord.value
  const list = names ? (Array.isArray(names) ? names : [names]) : undefined

  // Ключи объединяем: поле, появившееся после снимка, надо **удалить**, а не
  // выставить в `undefined` — иначе «сброс» оставляет за собой мусор.
  const keys = list ?? [...new Set([...Object.keys(model), ...Object.keys(snapshot)])]

  // Метод не удаляем, даже если его нет в снимке. Снимок строится клоном, а клон
  // отбрасывает функции — то есть для внешней модели (`useForm` Inertia, стор)
  // «нет в снимке» означает «это её метод», и сброс снёс бы саму модель.
  for (const key of keys) {
    if (key in snapshot) setByPath(model, key, cloneModelValue(snapshot[key]))
    else if (typeof model[key] !== 'function') removeKey(model, key)
  }

  clearValidate(list)
}

/** Модель отличается от снимка. Файлы сравниваются отпечатком, а не ссылкой. */
const isDirty = computed(() => modelFingerprint(modelRecord.value) !== modelFingerprint(initialSnapshot.value))

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
      // Иначе счётчики поколений копятся на динамических именах
      // (`items.417.email`) до размонтирования формы.
      validationSeq.delete(name)
      validationRuns.delete(name)
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

defineSlots<{
  /**
   * Поля формы. Слот-пропы повторяют публичный API инстанса: форма в шаблоне
   * доступна без `ref`, а значит и без `nextTick` после монтирования.
   */
  default?: (props: {
    validate: () => Promise<boolean>
    errors: Record<string, string | undefined>
    isDirty: boolean
    isValid: boolean
    validatingFields: Set<string>
    resetFields: (names?: string | string[]) => void
    setSnapshot: (model?: Record<string, unknown>) => void
  }) => any
}>()

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
