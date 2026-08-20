<script setup lang="ts">
/**
 * Повторяемая секция: массив объектов из схемы.
 *
 * Отдельным компонентом, а не пропом поля, потому что у него своя поверхность —
 * добавить, удалить, переставить, дублировать, свои слоты строки и свои
 * границы длины. И самостоятельный сценарий: форма своя, а повторитель нужен
 * по схеме.
 *
 * Три вещи здесь сделаны не так, как кажется естественным, и каждая — обход
 * поведения ядра:
 *
 * 1. **Ключ строки берётся из `WeakMap`, а не из данных.** `__id` внутри
 *    элемента уехал бы на сервер и попал в отпечаток `isDirty`.
 * 2. **Ключ поля — инстанс-путь.** `GrFormField` регистрируется в форме один
 *    раз, в `onMounted`, и смену `name` не отслеживает: после перестановки
 *    строк живое поле осталось бы в реестре под старым именем.
 * 3. **Валидация хвоста чистится до `splice`.** Ядро не убирает сообщения при
 *    дерегистрации поля, и «обязательно» от удалённой третьей строки повисло бы
 *    на новой третьей.
 */
import { computed, nextTick, ref } from 'vue'

import GrButton from '@feugene/granularity/components/GrButton'
import GrFormSection from '@feugene/granularity/components/GrFormSection'
import { useAnnouncer } from '@feugene/granularity/composables/useAnnouncer'

import { useTranslations } from '../../internal/i18n'
import type { GrSchemaArrayNode, GrSchemaFieldInstance } from '../../model'
import { createInitialItem, joinPath } from '../../model'
import type { GrUiArrayOptions, GrUiColumns } from '../../ui-schema'

import { useSchemaForm } from './context'
import GrSchemaField from './GrSchemaField.vue'
import GrSchemaUnionField from './GrSchemaUnionField.vue'
import SchemaObjectNode from './SchemaObjectNode.vue'
import {
  columnsToClass,
  schemaArrayEmptyClass,
  schemaArrayListClass,
  schemaRowActionsClass,
  schemaRowClass,
  schemaRowLabelClass,
} from './grSchemaFormStyles'

export interface GrSchemaArrayFieldProps {
  /** Узел-массив. Не задан — берётся из контекста формы по `path`. */
  node?: GrSchemaArrayNode
  path?: string
  /** Инстанс-путь массива: `order.items`. */
  name?: string
  indices?: number[]

  ui?: GrUiArrayOptions
  columns?: GrUiColumns

  min?: number
  max?: number
  sortable?: boolean
  duplicable?: boolean

  title?: string
  description?: string
  headingLevel?: 2 | 3 | 4 | 5 | 6

  addLabel?: string
  removeLabel?: string
  emptyText?: string
  itemLabel?: string | ((item: unknown, index: number) => string)

  disabled?: boolean
  readonly?: boolean
}

export interface GrSchemaArrayFieldEmits {
  (e: 'add', item: unknown, index: number): void
  (e: 'remove', item: unknown, index: number): void
  (e: 'move', from: number, to: number): void
}

const props = withDefaults(defineProps<GrSchemaArrayFieldProps>(), {
  node: undefined,
  path: undefined,
  name: undefined,
  indices: undefined,
  ui: undefined,
  columns: undefined,
  min: undefined,
  max: undefined,
  sortable: undefined,
  duplicable: undefined,
  title: undefined,
  description: undefined,
  headingLevel: 3,
  addLabel: undefined,
  removeLabel: undefined,
  emptyText: undefined,
  itemLabel: undefined,
  disabled: false,
  readonly: false,
})

const emit = defineEmits<GrSchemaArrayFieldEmits>()

const form = useSchemaForm()
const { t } = useTranslations()
const announcer = useAnnouncer()

const rootEl = ref<HTMLElement | null>(null)
const addButtonEl = ref<{ $el?: HTMLElement } | null>(null)

const templatePath = computed(() => props.path ?? props.name ?? '')
const arrayName = computed(() => props.name ?? props.path ?? '')

const node = computed(() => props.node ?? (form?.nodeAt(templatePath.value) as GrSchemaArrayNode | undefined))

const rows = computed<unknown[]>(() => {
  const value = form?.valueAt(arrayName.value)
  return Array.isArray(value) ? value : []
})

const minItems = computed(() => props.min ?? props.ui?.min ?? node.value?.constraints.min)
const maxItems = computed(() => props.max ?? props.ui?.max ?? node.value?.constraints.max)

const canAdd = computed(() => !props.readonly && !props.disabled
  && (maxItems.value === undefined || rows.value.length < maxItems.value))
const canRemove = computed(() => !props.readonly && !props.disabled
  && (minItems.value === undefined || rows.value.length > minItems.value))

/**
 * Идентичность строки живёт вне данных.
 *
 * Ключ нужен, чтобы DOM строки переезжал при перестановке вместе с ней, — но
 * положить его внутрь элемента нельзя: он уехал бы на сервер.
 */
const rowIds = new WeakMap<object, string>()
let rowSeq = 0

function rowKey(item: unknown, index: number): string {
  if (item === null || typeof item !== 'object') return `index-${index}`

  let key = rowIds.get(item)
  if (!key) {
    rowSeq += 1
    key = `row-${rowSeq}`
    rowIds.set(item, key)
  }

  return key
}

function rowFields(index: number): GrSchemaFieldInstance[] {
  if (!node.value) return []

  return form?.fieldsOf(
    joinPath(arrayName.value, index),
    joinPath(templatePath.value, '*'),
    [...(props.indices ?? []), index],
  ) ?? []
}

function labelOf(item: unknown, index: number): string {
  const template = props.itemLabel ?? props.ui?.itemLabel
  if (typeof template === 'function') return template(item, index)
  if (typeof template === 'string') return template.replace('{index}', String(index + 1))

  return t('grForms.array.itemLabel', 'Item {index}', { index: index + 1 })
}

/** Пути полей строк, начиная с указанной: их валидацию надо снять до сдвига. */
function pathsFrom(index: number): string[] {
  const paths: string[] = []

  for (let i = index; i < rows.value.length; i += 1) {
    paths.push(joinPath(arrayName.value, i))
    for (const field of rowFields(i)) paths.push(field.name)
  }

  return paths
}

function writeRows(next: unknown[]): void {
  form?.setValueAt(arrayName.value, next)
}

function add(item?: unknown, at?: number): void {
  if (!canAdd.value || !node.value) return

  const value = item
    ?? (typeof props.ui?.itemDefault === 'function' ? (props.ui.itemDefault as () => unknown)() : props.ui?.itemDefault)
    ?? createInitialItem(node.value.item)

  const index = at ?? rows.value.length
  const next = [...rows.value]
  next.splice(index, 0, value)

  form?.clearValidate(pathsFrom(index))
  writeRows(next)
  form?.notifyRows(arrayName.value, 'add', index)
  emit('add', value, index)

  void nextTick(() => {
    focusRow(index)
    announcer.announce(t('grForms.array.added', 'Row {index} added, {count} total', {
      index: index + 1,
      count: next.length,
    }))
  })
}

function remove(index: number): void {
  if (!canRemove.value) return

  const item = rows.value[index]

  // Порядок обязателен: ядро не чистит сообщения при дерегистрации поля.
  form?.clearValidate(pathsFrom(index))

  const next = [...rows.value]
  next.splice(index, 1)
  writeRows(next)
  form?.notifyRows(arrayName.value, 'remove', index)
  emit('remove', item, index)

  void nextTick(() => {
    const target = rootEl.value?.querySelectorAll<HTMLElement>('[data-gr-schema-row-remove]')[Math.min(index, next.length - 1)]
    ;(target ?? addButtonEl.value?.$el as HTMLElement | undefined)?.focus?.()

    announcer.announce(t('grForms.array.removed', 'Row {index} removed, {count} left', {
      index: index + 1,
      count: next.length,
    }))
  })
}

function move(from: number, to: number): void {
  if (props.readonly || props.disabled) return
  if (to < 0 || to >= rows.value.length || from === to) return

  form?.clearValidate(pathsFrom(Math.min(from, to)))

  const next = [...rows.value]
  const [item] = next.splice(from, 1)
  next.splice(to, 0, item)
  writeRows(next)
  form?.notifyRows(arrayName.value, 'move', to)
  emit('move', from, to)

  void nextTick(() => {
    announcer.announce(t('grForms.array.moved', 'Row {from} moved to position {to}', {
      from: from + 1,
      to: to + 1,
    }))
  })
}

function duplicate(index: number): void {
  const item = rows.value[index]
  add(item === null || typeof item !== 'object' ? item : JSON.parse(JSON.stringify(item)), index + 1)
}

function focusRow(index: number): void {
  const row = rootEl.value?.querySelectorAll<HTMLElement>('[data-gr-schema-row]')[index]
  row?.querySelector<HTMLElement>('input, select, textarea, [tabindex]:not([tabindex="-1"])')?.focus()
}

const isSortable = computed(() => (props.sortable ?? props.ui?.sortable ?? true) && rows.value.length > 1)
const isDuplicable = computed(() => props.duplicable ?? props.ui?.duplicable ?? false)
const gridClass = computed(() => columnsToClass(props.columns ?? props.ui?.columns))

defineExpose({ add, remove, move, duplicate, focusRow, count: computed(() => rows.value.length) })
</script>

<template>
  <div ref="rootEl" data-gr-schema-array :data-path="arrayName">
    <GrFormSection
      :title="title ?? node?.title"
      :description="description ?? node?.description"
      :heading-level="headingLevel"
    >
      <template #actions>
        <GrButton
          ref="addButtonEl"
          size="sm"
          variant="outline"
          :disabled="!canAdd"
          data-gr-schema-row-add
          @click="add()"
        >
          {{ addLabel ?? ui?.addLabel ?? t('grForms.array.add', 'Add') }}
        </GrButton>
      </template>

      <div v-if="rows.length === 0" :class="schemaArrayEmptyClass" data-gr-schema-array-empty>
        <slot name="empty" :add="add">
          {{ emptyText ?? ui?.emptyText ?? t('grForms.array.empty', 'Nothing added yet') }}
        </slot>
      </div>

      <div v-else :class="schemaArrayListClass">
        <div
          v-for="(item, index) in rows"
          :key="rowKey(item, index)"
          data-gr-schema-row
          role="group"
          :aria-label="t('grForms.array.rowGroup', 'Position {index} of {count}', { index: index + 1, count: rows.length })"
          :class="[schemaRowClass, gridClass]"
        >
          <div class="col-span-full flex items-center justify-between gap-2">
            <span :class="schemaRowLabelClass">{{ labelOf(item, index) }}</span>

            <div :class="schemaRowActionsClass">
              <template v-if="isSortable">
                <GrButton
                  size="xs"
                  variant="ghost"
                  :disabled="index === 0 || disabled || readonly"
                  :aria-label="t('grForms.array.moveUp', 'Move position {index} up', { index: index + 1 })"
                  @click="move(index, index - 1)"
                >
                  ↑
                </GrButton>
                <GrButton
                  size="xs"
                  variant="ghost"
                  :disabled="index === rows.length - 1 || disabled || readonly"
                  :aria-label="t('grForms.array.moveDown', 'Move position {index} down', { index: index + 1 })"
                  @click="move(index, index + 1)"
                >
                  ↓
                </GrButton>
              </template>

              <GrButton
                v-if="isDuplicable"
                size="xs"
                variant="ghost"
                :disabled="!canAdd"
                :aria-label="t('grForms.array.duplicate', 'Duplicate position {index}', { index: index + 1 })"
                @click="duplicate(index)"
              >
                ⧉
              </GrButton>

              <!--
                Имя кнопки несёт номер: в списке из десяти строк десять кнопок
                «Удалить» для диктора неразличимы.
              -->
              <GrButton
                size="xs"
                variant="ghost"
                tone="danger"
                data-gr-schema-row-remove
                :disabled="!canRemove"
                :aria-label="t('grForms.array.removeAt', 'Remove position {index}', { index: index + 1 })"
                @click="remove(index)"
              >
                ✕
              </GrButton>
            </div>
          </div>

          <slot name="row" :index="index" :item="item" :path="joinPath(arrayName, index)" :fields="rowFields(index)">
            <template v-for="field in rowFields(index)" :key="field.name">
              <GrSchemaUnionField
                v-if="field.node.kind === 'union'"
                :node="field.node"
                :path="field.templatePath"
                :name="field.name"
                :indices="field.indices"
                :columns="columns ?? ui?.columns"
              />
              <SchemaObjectNode
                v-else-if="field.node.kind === 'object'"
                :node="field.node"
                :path="field.templatePath"
                :name="field.name"
                :indices="field.indices"
                :columns="columns ?? ui?.columns"
              />
              <GrSchemaField
                v-else
                :node="field.node"
                :path="field.templatePath"
                :name="field.name"
                :indices="field.indices"
                :disabled="disabled"
                :readonly="readonly"
              />
            </template>
          </slot>
        </div>
      </div>
    </GrFormSection>
  </div>
</template>
