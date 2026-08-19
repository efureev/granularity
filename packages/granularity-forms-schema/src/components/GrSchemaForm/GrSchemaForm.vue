<script setup lang="ts" generic="TModel extends Record<string, unknown> = Record<string, unknown>">
/**
 * Форма из схемы.
 *
 * Пакет ничего не рисует сам, кроме сетки колонок: `GrForm` даёт оркестрацию,
 * `GrFormField` — обвязку и a11y, `GrFormSection` — разделы, контролы ядра —
 * ввод. Здесь только маппинг «узел схемы → поле» и то, чего у ядра нет:
 * компиляция правил, серверные ошибки и раскладка.
 *
 * Два порядковых требования, без которых форма ведёт себя неверно:
 *
 * 1. **Модель заполняется до монтирования `GrForm`.** Родительский `setup`
 *    отрабатывает раньше, поэтому снимок ядра увидит уже готовую модель, и
 *    `resetFields` вернёт «как при загрузке», а не пустоту.
 * 2. **Массивы и объекты схемы существуют в модели заранее** (`ensureShape`):
 *    писатель ядра создаёт промежуточные узлы объектами, и путь `items.0.name`
 *    иначе превратил бы список в `{ '0': … }`.
 */
import type { GrFormInstance, GrFormRules } from '@feugene/granularity'
import GrAlert from '@feugene/granularity/components/GrAlert'
import GrForm from '@feugene/granularity/components/GrForm'
import { computed, onMounted, ref, watch } from 'vue'

import type { GrSchemaAdapter, GrSchemaFieldInstance, GrSchemaIssue, GrSchemaModel, GrSchemaNode, GrSchemaParseOptions, GrSchemaWarning } from '../../model'
import {
  createInitialModel,
  ensureShape,
  expandFields,
  getAtPath,
  setAtPath,
} from '../../model'
import type { GrSchemaRenderer, GrSchemaRendererRegistry } from '../../renderers'
import { coreRenderers, createSchemaRendererRegistry } from '../../renderers'
import { useServerFieldErrors } from '../../server-errors'
import type { GrUiColumns, GrUiSchema, GrUiSection } from '../../ui-schema'
import { applyOrder, evaluateCondition, createConditionContext } from '../../ui-schema'
import type { GrSchemaRuleCompilerOptions } from '../../validation'
import { compileRules, includesTier } from '../../validation'
import { useTranslations } from '../../internal/i18n'

import { useGrComponentProp } from '@feugene/granularity/composables/useGrComponentConfig'

import { provideSchemaForm } from './context'
import GrSchemaArrayField from './GrSchemaArrayField.vue'
import GrSchemaField from './GrSchemaField.vue'
import SchemaObjectNode from './SchemaObjectNode.vue'
import {
  columnsToClass,
  schemaFormErrorsClass,
  schemaGridClass,
  schemaSectionsClass,
} from './grSchemaFormStyles'

export interface GrSchemaFormProps<T extends Record<string, unknown> = Record<string, unknown>> {
  /** Чужая схема: JSON Schema, zod-объект. Адаптер подбирается по `supports()`. */
  schema?: unknown
  /** Готовая нейтральная модель — сильнее `schema`. */
  schemaModel?: GrSchemaModel
  /** Явные адаптеры. Без них разбор возможен только из `schemaModel`. */
  adapters?: GrSchemaAdapter[]
  parseOptions?: GrSchemaParseOptions

  /** Данные формы. Не заданы — собираются из умолчаний схемы. */
  modelValue?: T

  uiSchema?: GrUiSchema
  /** Реестр или набор записей поверх дефолтного. */
  renderers?: GrSchemaRendererRegistry | readonly GrSchemaRenderer[]

  /** Правила поверх скомпилированных: ключ — инстанс-путь. */
  rules?: GrFormRules
  validation?: GrSchemaRuleCompilerOptions

  /** Ответ сервера: сырой, разобранный или карта `{ путь: сообщения }`. */
  serverErrors?: unknown

  validateOnBlur?: boolean
  validateOnChange?: boolean
  scrollToError?: boolean
  disabled?: boolean
  readonly?: boolean

  columns?: GrUiColumns
  labelPosition?: 'top' | 'start'
  labelWidth?: string | number
  headingLevel?: 2 | 3 | 4 | 5 | 6

  /** Сводка ошибок формы и осиротевших серверных сообщений. */
  showFormErrors?: boolean
}

export interface GrSchemaFormEmits<T extends Record<string, unknown> = Record<string, unknown>> {
  (e: 'update:modelValue', model: T): void
  (e: 'submit', model: T): void
  (e: 'invalid', errors: Record<string, string>): void
  /** Схема разобрана; `warnings` — то, чего адаптер не понял. */
  (e: 'parsed', model: GrSchemaModel, warnings: GrSchemaWarning[]): void
  (e: 'unresolved', node: GrSchemaNode, name: string): void
  (e: 'rowChange', path: string, action: 'add' | 'remove' | 'move', index: number): void
}

const props = withDefaults(defineProps<GrSchemaFormProps<TModel>>(), {
  schema: undefined,
  schemaModel: undefined,
  adapters: undefined,
  parseOptions: undefined,
  modelValue: undefined,
  uiSchema: undefined,
  renderers: undefined,
  rules: undefined,
  validation: undefined,
  serverErrors: undefined,
  validateOnBlur: true,
  validateOnChange: false,
  scrollToError: true,
  disabled: false,
  readonly: false,
  columns: undefined,
  labelPosition: undefined,
  labelWidth: undefined,
  headingLevel: undefined,
  showFormErrors: true,
})

const emit = defineEmits<GrSchemaFormEmits<TModel>>()

const { t } = useTranslations()
const formRef = ref<GrFormInstance | null>(null)

/** Разбор схемы: `schemaModel` сильнее — её могли разобрать заранее или на сервере. */
const parsed = computed<GrSchemaModel | undefined>(() => {
  if (props.schemaModel) return props.schemaModel
  if (!props.schema) return undefined

  const adapter = props.adapters?.find(item => item.supports(props.schema))
  if (!adapter) return undefined

  return adapter.parse(props.schema, props.parseOptions)
})

watch(parsed, (model) => {
  if (model) emit('parsed', model, model.warnings)
}, { immediate: true })

const root = computed(() => parsed.value?.root)

/** Модель ведётся здесь: без `v-model` форма всё равно должна работать. */
const internalModel = ref<Record<string, unknown>>({})

const model = computed<Record<string, unknown>>(() =>
  (props.modelValue as Record<string, unknown> | undefined) ?? internalModel.value)

function syncModel(next: Record<string, unknown>): void {
  if (props.modelValue === undefined) internalModel.value = next
  emit('update:modelValue', next as TModel)
}

function initialiseModel(): void {
  if (!root.value) return

  const base = createInitialModel(root.value, model.value)
  ensureShape(base, root.value)

  if (props.modelValue === undefined) internalModel.value = base
  else {
    // Чужую модель не подменяем — дополняем на месте: она может быть стором.
    for (const [key, value] of Object.entries(base)) {
      if ((props.modelValue as Record<string, unknown>)[key] === undefined)
        setAtPath(props.modelValue as Record<string, unknown>, key, value)
    }
    ensureShape(props.modelValue as Record<string, unknown>, root.value)
  }
}

watch(root, initialiseModel, { immediate: true })
onMounted(() => {
  // Снимок берётся после того, как модель обрела форму схемы, — иначе сброс
  // вернул бы её в состояние «до заполнения умолчаниями».
  void formRef.value?.setSnapshot()
})

const registry = computed<GrSchemaRendererRegistry>(() => {
  if (!props.renderers) return createSchemaRendererRegistry(coreRenderers)
  if (Array.isArray(props.renderers))
    return createSchemaRendererRegistry(coreRenderers).register(...props.renderers)

  return props.renderers as GrSchemaRendererRegistry
})

const ui = computed<GrUiSchema>(() => props.uiSchema ?? {})

/**
 * Раскладка приходит из трёх мест, и порядок здесь ровно тот, что у остальных
 * настраиваемых пропов пакета: локальный проп сильнее `uiSchema`, `uiSchema`
 * сильнее приложения, приложение сильнее встроенного дефолта.
 *
 * До этой правки все четыре ключа были объявлены в `defaults.ts`, но не читались
 * ни разу: `<GrConfigProvider :component-defaults="{ GrSchemaForm: … }">` не
 * влиял ни на что, и узнать об этом было неоткуда — гейт проверял только адрес
 * аугментации.
 */
const resolvedColumns = useGrComponentProp(
  'GrSchemaForm',
  'columns',
  () => props.columns ?? ui.value.layout?.columns,
  undefined as unknown as GrUiColumns,
)
const resolvedLabelPosition = useGrComponentProp('GrSchemaForm', 'labelPosition', () => props.labelPosition, 'top')
const resolvedLabelWidth = useGrComponentProp(
  'GrSchemaForm',
  'labelWidth',
  () => props.labelWidth,
  undefined as unknown as string | number,
)
const resolvedHeadingLevel = useGrComponentProp('GrSchemaForm', 'headingLevel', () => props.headingLevel, 3)

/** Все поля по текущим данным; скрытые условиями отсеиваются здесь же. */
const allFields = computed<GrSchemaFieldInstance[]>(() => {
  if (!root.value) return []

  return expandFields(root.value, model.value, {
    include: (node, name) => {
      const templatePath = node.path
      const options = ui.value.fields?.[templatePath]
      if (ui.value.hidden?.includes(templatePath) || options?.hidden) return false
      if (!options?.when) return true

      return evaluateCondition(options.when, createConditionContext(model.value, name, []))
    },
  })
})

const visibleFields = computed(() => allFields.value.filter(field => field.leaf))

const serverErrors = useServerFieldErrors({
  knownPaths: () => visibleFields.value.map(field => field.name),
})

watch(() => props.serverErrors, (source) => {
  if (source === undefined) serverErrors.clear()
  else serverErrors.set(source)
}, { immediate: true, deep: true })

/**
 * Замечания самой схемы — отдельным каналом от серверных.
 *
 * Жизненный цикл у них разный: серверные живут до следующей отправки, а эти
 * пересчитываются на каждой. Один канал с двумя писателями означал бы, что проп
 * потребителя затирает внутреннее состояние в непредсказуемый момент.
 */
const schemaErrors = useServerFieldErrors({
  knownPaths: () => visibleFields.value.map(field => field.name),
})

/**
 * Есть ли правило, которое компилятор выразить не смог, — и не на листе.
 *
 * `refine` на поле помечает `residual` само поле, и правило до него доходит.
 * `refine` на объекте помечает контейнер, а контейнеры правил не несут — до
 * `passwordAgain` объявлением поля не дотянуться, потому что путь ошибки схема
 * сообщает только в момент проверки. Такие правила и остаются на отправку.
 */
const hasContainerResidual = computed(() =>
  // Корень проверяется отдельно: `expandFields` раскрывает только листья, и
  // сам объект в список инстансов не попадает вовсе — а `refine` на схеме
  // помечает именно его.
  root.value?.residual === true
  || allFields.value.some(field => !field.leaf && field.node.residual === true))

/** Поля верхнего уровня — их рисует форма; вложенные рисуют контейнеры. */
const rootFields = computed(() =>
  applyOrder(allFields.value.filter(field => field.parent === ''), ui.value.order))

const sections = computed<GrUiSection[]>(() => ui.value.layout?.sections ?? [])

function sectionFields(section: GrUiSection): GrSchemaFieldInstance[] {
  const explicit = section.fields.filter(key => key !== '*')
  const claimed = new Set(sections.value.flatMap(item => item.fields).filter(key => key !== '*'))

  if (section.fields.includes('*'))
    return rootFields.value.filter(field => !claimed.has(field.templatePath) || explicit.includes(field.templatePath))

  return explicit
    .map(key => rootFields.value.find(field => field.templatePath === key))
    .filter((field): field is GrSchemaFieldInstance => Boolean(field))
}

function isSectionVisible(section: GrUiSection): boolean {
  if (!section.when) return true
  return evaluateCondition(section.when, createConditionContext(model.value, '', []))
}

/**
 * Правила формы: скомпилированные из схемы плюс заданные потребителем.
 *
 * Свои правила побеждают по ключу целиком — «дополнить» набор поля значило бы
 * гадать, какое из двух `min` он имел в виду.
 */
/**
 * Правила считаются по **всем** узлам, а не только по листьям: у массива свои
 * границы длины, и правило садится на него самого.
 */
const rules = computed<GrFormRules>(() => ({
  ...compileRules(allFields.value, {
    t,
    ...props.validation,
  }),
  ...props.rules,
}))

const formErrors = computed(() => [...serverErrors.formErrors.value, ...schemaErrors.formErrors.value])

provideSchemaForm({
  root,
  model,
  ui,
  renderers: registry,
  disabled: computed(() => props.disabled),
  readonly: computed(() => props.readonly),

  serverErrorAt: (name) => {
    const messages = [...(serverErrors.get(name) ?? []), ...(schemaErrors.get(name) ?? [])]

    return messages.length > 0 ? messages : undefined
  },
  dismissServerError: (name) => {
    serverErrors.dismiss(name)
    schemaErrors.dismiss(name)
  },

  nodeAt: (templatePath) => {
    if (!root.value) return undefined
    return allFields.value.find(field => field.templatePath === templatePath)?.node
  },

  valueAt: name => getAtPath(model.value, name),

  setValueAt: (name, value) => {
    setAtPath(model.value, name, value)
    syncModel(model.value)
  },

  fieldsOf: (name, templatePath, indices) =>
    allFields.value.filter(field =>
      field.parent === name
      && field.templatePath.startsWith(templatePath === '' ? '' : `${templatePath}.`)
      && field.indices.length >= indices.length),

  notifyRows: (path, action, index) => {
    syncModel(model.value)
    emit('rowChange', path, action, index)
  },

  clearValidate: (names) => {
    if (names.length > 0) formRef.value?.clearValidate(names)
  },
})

async function validate(): Promise<boolean> {
  const valid = (await formRef.value?.validate()) ?? true

  if (!valid) return false

  if (needsSchemaCheck() && applySchemaIssues(await parsed.value!.validate!(model.value)))
    return false

  return Object.keys(serverErrors.errors.value).length === 0
}

/**
 * Нужна ли вообще полная проверка схемой.
 *
 * Проверка стоит прохода по всей схеме, поэтому спрашивается заранее и дёшево:
 * схема умеет проверять себя целиком, в ней есть правило, не выразимое узлом, и
 * ярус не выключен. Форме без кросс-полевых правил всё это не стоит ничего —
 * включая асинхронность: `submit` у неё эмитится ровно так же, как раньше.
 */
function needsSchemaCheck(): boolean {
  return Boolean(parsed.value?.validate)
    && hasContainerResidual.value
    && includesTier(props.validation, 'residual')
}

/**
 * Замечания схемы — по полям, тем же каналом, что и ответ сервера.
 *
 * Путь совпал с полем — сообщение на поле, не совпал или пуст — в сводку.
 * Работа та же самая, и делать её вторым способом было бы странно.
 */
function applySchemaIssues(issues: readonly GrSchemaIssue[]): boolean {
  if (issues.length === 0) return false

  const byPath = new Map<string, string[]>()

  for (const issue of issues)
    byPath.set(issue.path, [...(byPath.get(issue.path) ?? []), issue.message])

  for (const [path, messages] of byPath)
    schemaErrors.setField(path, messages)

  return true
}

/**
 * Контракт «либо `submit`, либо `invalid`» обязан пережить и этот отказ:
 * молчание после нажатия читается как поломка формы.
 */
function finishSubmit(rejected: boolean): void {
  if (!rejected) {
    emit('submit', model.value as TModel)

    return
  }

  emit('invalid', Object.fromEntries(
    Object.entries(schemaErrors.errors.value).map(([path, messages]) => [path, messages[0] ?? '']),
  ))
}

function onSubmit(): void {
  // Ошибки прошлой отправки снимаются в начале следующей — и серверные, и свои.
  serverErrors.clear()
  schemaErrors.clear()

  if (!needsSchemaCheck()) {
    finishSubmit(false)

    return
  }

  const issues = parsed.value!.validate!(model.value)

  // Синхронный ответ — синхронный `submit`: zod отвечает сразу, и сдвигать ему
  // эмит на микрозадачу незачем. Ждём только ту проверку, что правда ждёт.
  if (Array.isArray(issues)) {
    finishSubmit(applySchemaIssues(issues))

    return
  }

  void issues.then(resolved => finishSubmit(applySchemaIssues(resolved)))
}

function onInvalid(errors: Record<string, string>): void {
  emit('invalid', errors)
}

const gridClass = computed(() => [schemaGridClass, columnsToClass(resolvedColumns.value)])

defineExpose({
  validate,
  validateField: (name: string) => formRef.value?.validateField(name),
  clearValidate: (names?: string | string[]) => formRef.value?.clearValidate(names),
  resetFields: (names?: string | string[]) => formRef.value?.resetFields(names),
  scrollToField: (name: string) => formRef.value?.scrollToField(name),
  setSnapshot: () => formRef.value?.setSnapshot(),
  setServerErrors: (source: unknown) => serverErrors.set(source),
  clearServerErrors: (paths?: string | string[]) => serverErrors.clear(paths),
  schemaModel: parsed,
  compiledRules: rules,
  fieldPaths: computed(() => visibleFields.value.map(field => field.name)),
  form: formRef,
})
</script>

<template>
  <GrForm
    ref="formRef"
    data-gr-schema-form
    :model="model"
    :rules="rules"
    :validate-on-blur="validateOnBlur"
    :validate-on-change="validateOnChange"
    :scroll-to-error="scrollToError"
    :disabled="disabled"
    @submit="onSubmit"
    @invalid="onInvalid"
  >
    <slot name="formErrors" :errors="formErrors">
      <GrAlert
        v-if="showFormErrors && formErrors.length > 0"
        state="danger"
        role="alert"
        :class="schemaFormErrorsClass"
        data-gr-schema-form-errors
      >
        <ul>
          <li v-for="message in formErrors" :key="message">
            {{ message }}
          </li>
        </ul>
      </GrAlert>
    </slot>

    <slot :fields="visibleFields" :model="model">
      <div v-if="sections.length > 0" :class="schemaSectionsClass">
        <template v-for="section in sections" :key="section.id">
          <SchemaObjectNode
            v-if="isSectionVisible(section)"
            :node="{ ...root!, title: section.title, description: section.description, fields: sectionFields(section).map(field => field.node) }"
            path=""
            name=""
            :columns="section.columns ?? resolvedColumns"
            :heading-level="section.headingLevel ?? resolvedHeadingLevel"
          />
        </template>
      </div>

      <div v-else :class="gridClass">
        <template v-for="field in rootFields" :key="field.name">
          <GrSchemaArrayField
            v-if="field.node.kind === 'array' && field.node.item.kind === 'object'"
            :node="field.node"
            :path="field.templatePath"
            :name="field.name"
            :indices="field.indices"
            :ui="ui.fields?.[field.templatePath]?.array"
            :heading-level="resolvedHeadingLevel"
            :disabled="disabled"
            :readonly="readonly"
            class="col-span-full"
          />
          <SchemaObjectNode
            v-else-if="field.node.kind === 'object'"
            :node="field.node"
            :path="field.templatePath"
            :name="field.name"
            :indices="field.indices"
            :columns="resolvedColumns"
            :heading-level="resolvedHeadingLevel"
            class="col-span-full"
          />
          <GrSchemaField
            v-else-if="field.leaf"
            :node="field.node"
            :path="field.templatePath"
            :name="field.name"
            :indices="field.indices"
            :label-position="resolvedLabelPosition"
            :label-width="resolvedLabelWidth"
            @unresolved="(node, name) => emit('unresolved', node, name)"
          />
        </template>
      </div>
    </slot>

    <slot name="actions" />
  </GrForm>
</template>
