<script setup lang="ts">
/**
 * Свободные ключи объекта: `additionalProperties` со схемой значения.
 *
 * Приписка к объекту, а не поле среди полей: у пары «ключ — значение» нет места
 * в схеме, а значит нет ни шаблонного пути, ни записи в `uiSchema`, ни порядка
 * среди объявленных полей. Поэтому компонент рисуется хвостом
 * `SchemaObjectNode`, а не через развилку по виду узла.
 *
 * Идентичность строки живёт в локальном черновике, а не в самом ключе.
 * Переименование меняет ключ в данных, и строка с `:key="ключ"` перемонтировалась
 * бы посреди правки — поле теряло бы фокус на каждой букве. Черновик правится
 * **до** записи в модель: иначе наблюдатель увидел бы ключ исчезнувшим и
 * дописал бы его заново в конец, переставив строки.
 */
import { computed, nextTick, ref, watch } from 'vue'

import GrButton from '@feugene/granularity/components/GrButton'
import GrInput from '@feugene/granularity/components/GrInput'
import { useAnnouncer } from '@feugene/granularity/composables/useAnnouncer'

import { useTranslations } from '../../internal/i18n'
import type { GrSchemaNode, GrSchemaObjectNode } from '../../model'
import { createInitialItem, joinPath } from '../../model'

import { useSchemaForm } from './context'
import GrSchemaField from './GrSchemaField.vue'
import {
  schemaAdditionalHeaderClass,
  schemaAdditionalKeyClass,
  schemaAdditionalRowClass,
  schemaAdditionalValueClass,
  schemaArrayEmptyClass,
  schemaArrayListClass,
  schemaRowLabelClass,
} from './grSchemaFormStyles'

const props = withDefaults(defineProps<{
  /** Объектный узел, у которого разрешены свободные ключи. */
  node: GrSchemaObjectNode
  /** Шаблонный путь объекта. */
  path: string
  /** Инстанс-путь объекта: `settings`, `items.0.meta`. */
  name: string
  indices?: number[]
  disabled?: boolean
  readonly?: boolean
}>(), {
  indices: undefined,
  disabled: false,
  readonly: false,
})

const form = useSchemaForm()
const { t } = useTranslations()
const announcer = useAnnouncer()

const rootEl = ref<HTMLElement | null>(null)

/** Схема значения. Нет — вводить нечего, и компонент не рисуется вовсе. */
const valueNode = computed<GrSchemaNode | undefined>(() => props.node.additionalValue)
const valuePath = computed(() => joinPath(props.path, '*'))

const declared = computed(() => new Set(props.node.fields.map(field => field.key)))

const object = computed<Record<string, unknown>>(() => {
  const value = props.name === '' ? form?.model.value : form?.valueAt(props.name)
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {}
})

const freeKeys = computed(() => Object.keys(object.value).filter(key => !declared.value.has(key)))

const canEdit = computed(() => !props.readonly && !props.disabled
  && !(form?.readonly.value ?? false) && !(form?.disabled.value ?? false))

interface DraftRow { id: number, key: string }

const rows = ref<DraftRow[]>([])
let seq = 0

watch(freeKeys, (keys) => {
  rows.value = rows.value.filter(row => keys.includes(row.key))

  for (const key of keys) {
    if (!rows.value.some(row => row.key === key)) {
      seq += 1
      rows.value.push({ id: seq, key })
    }
  }
}, { immediate: true, deep: true })

function nameOf(key: string): string {
  return joinPath(props.name, key)
}

function writeObject(next: Record<string, unknown>): void {
  if (props.name !== '') {
    form?.setValueAt(props.name, next)
    return
  }

  // Корень приходит из `v-model` — заменить его целиком нельзя, только привести
  // к `next` на месте. Переписывается хвост от первого расхождения: иначе
  // переименованный ключ уехал бы в конец, и порядок в отправляемом JSON
  // разошёлся бы с порядком строк на экране.
  const current = Object.keys(object.value)
  const target = Object.keys(next)
  const diverges = current.findIndex((key, index) => key !== target[index])
  const from = diverges === -1 ? Math.min(current.length, target.length) : diverges

  for (const key of current.slice(from)) form?.deleteValueAt(key)
  for (const key of target.slice(from)) form?.setValueAt(key, next[key])
}

/** Свободный ключ по умолчанию: `key`, `key2`, `key3` — лишь бы не занят. */
function freeName(): string {
  const base = t('grForms.additional.newKey', 'key')
  if (!(base in object.value))
    return base

  let index = 2
  while (`${base}${index}` in object.value) index += 1

  return `${base}${index}`
}

function add(): void {
  if (!canEdit.value || !valueNode.value)
    return

  const key = freeName()
  writeObject({ ...object.value, [key]: createInitialItem(valueNode.value) })

  void nextTick(() => {
    const inputs = rootEl.value?.querySelectorAll<HTMLElement>('[data-gr-schema-additional-key] input')
    inputs?.[inputs.length - 1]?.focus()
    announcer.announce(t('grForms.additional.added', 'Field {key} added', { key }))
  })
}

function remove(row: DraftRow): void {
  if (!canEdit.value)
    return

  // Порядок обязателен: ядро не чистит сообщения при дерегистрации поля.
  form?.clearValidate([nameOf(row.key)])

  const next = { ...object.value }
  delete next[row.key]
  rows.value = rows.value.filter(item => item.id !== row.id)
  writeObject(next)

  void nextTick(() => {
    announcer.announce(t('grForms.additional.removed', 'Field {key} removed', { key: row.key }))
  })
}

/**
 * Переименование сохраняет значение и порядок ключей: пересборка объекта, а не
 * `delete` с дописыванием в конец, — иначе строка прыгала бы вниз на каждой правке.
 */
function rename(row: DraftRow, raw: unknown): void {
  const next = String(raw ?? '').trim()
  if (!canEdit.value || next === row.key)
    return

  // Занятое имя откатываем: две строки с одним ключом писали бы поверх друг друга.
  if (next === '' || next in object.value) {
    rows.value = [...rows.value]
    return
  }

  form?.clearValidate([nameOf(row.key)])

  const rebuilt: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(object.value)) rebuilt[key === row.key ? next : key] = value

  row.key = next
  writeObject(rebuilt)
}

defineExpose({ add, remove, count: computed(() => rows.value.length) })
</script>

<template>
  <div
    v-if="valueNode && node.additional"
    ref="rootEl"
    data-gr-schema-additional
    :data-path="name"
  >
    <div :class="schemaAdditionalHeaderClass">
      <span :class="schemaRowLabelClass">{{ t('grForms.additional.title', 'Extra fields') }}</span>

      <GrButton
        size="sm"
        variant="outline"
        :disabled="!canEdit"
        data-gr-schema-additional-add
        @click="add()"
      >
        {{ t('grForms.additional.add', 'Add field') }}
      </GrButton>
    </div>

    <div v-if="rows.length === 0" :class="schemaArrayEmptyClass" data-gr-schema-additional-empty>
      {{ t('grForms.additional.empty', 'No extra fields') }}
    </div>

    <div v-else :class="schemaArrayListClass">
      <div
        v-for="row in rows"
        :key="row.id"
        :class="schemaAdditionalRowClass"
        data-gr-schema-additional-row
      >
        <div :class="schemaAdditionalKeyClass" data-gr-schema-additional-key>
          <GrInput
            :model-value="row.key"
            :disabled="!canEdit"
            :aria-label="t('grForms.additional.keyLabel', 'Field name')"
            @change="rename(row, $event)"
          />
        </div>

        <!-- Подпись пары рисует поле ключа слева, поэтому у значения видимой
             подписи нет — имя ему даёт сам ключ. Без этого контрол остаётся
             безымянным: `GrFormField` без `label` имени не даёт. -->
        <GrSchemaField
          :class="schemaAdditionalValueClass"
          :aria-label="t('grForms.additional.valueLabel', 'Value of {key}', { key: row.key })"
          :node="valueNode"
          :path="valuePath"
          :name="nameOf(row.key)"
          :indices="indices"
          :disabled="disabled"
          :readonly="readonly"
        />

        <!-- Имя кнопки несёт ключ: в списке из десяти «Удалить» неразличимы. -->
        <GrButton
          size="xs"
          variant="ghost"
          tone="danger"
          data-gr-schema-additional-remove
          :disabled="!canEdit"
          :aria-label="t('grForms.additional.removeAt', 'Remove field {key}', { key: row.key })"
          @click="remove(row)"
        >
          ✕
        </GrButton>
      </div>
    </div>
  </div>
</template>
