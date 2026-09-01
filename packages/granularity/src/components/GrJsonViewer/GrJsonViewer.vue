<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

import GrButton from '../GrButton/GrButton.vue'
import GrInput from '../GrInput/GrInput.vue'
import GrTree from '../GrTree/GrTree.vue'
import { useAnnouncer } from '../../composables/useAnnouncer'
import { useGranularityTranslations } from '../../internal/granularityI18n'
import { useGrComponentProp, useGrComponentSize } from '../GrConfigProvider/context'

import IconCheck from '~icons/lucide/check'
import IconCopy from '~icons/lucide/copy'

import { branchPaths, jsonToNodes, pathsToDepth, type GrJsonNode } from './jsonToNodes'
import {
  jsonValueClass,
  jsonViewerContentClass,
  jsonViewerCopyClass,
  jsonViewerGroupClass,
  jsonViewerKeyClass,
  jsonViewerMutedClass,
  jsonViewerPunctuationClass,
  jsonViewerRootClass,
  jsonViewerRowClass,
  jsonViewerSearchClass,
  jsonViewerToolbarClass,
  jsonViewerValueClass,
} from './grJsonViewerStyles'

import type { GrComponentSize } from '../shared/sizes'

export type { GrJsonNode, GrJsonNodeKind } from './jsonToNodes'

/**
 * JSON со свёрткой по узлам, поиском по ключу и значению и копированием узла.
 *
 * Дерево, клавиатуру и виртуализацию несёт `GrTree`; здесь — разбор `unknown` в
 * узлы и разметка строки. Плоский текст целиком, который копируют в тикет, —
 * `GrCodeBlock`.
 */
export interface GrJsonViewerProps {
  /** Показываемое значение. `unknown`, потому что приходит из БД или чужого сервиса. */
  value: unknown
  /** Подпись корня. По умолчанию `$` — так адресуют путь JSONPath и dev-tools. */
  rootLabel?: string
  /** Сколько уровней раскрыто изначально. */
  defaultExpandDepth?: number
  /**
   * Длина строкового значения, после которой показ обрезается.
   *
   * Не косметика: запрос к модели с картинкой в base64 — это один лист на
   * сотни тысяч символов, и ни свёртка, ни виртуализация по строкам его не
   * берут. Копирование при этом отдаёт значение целиком.
   */
  maxStringLength?: number
  /** Сколько элементов массива разбирать до заглушки «ещё N». */
  maxArrayItems?: number
  /** Поле поиска над деревом. Выключено — поиск остаётся на `filter()` из `defineExpose`. */
  searchable?: boolean
  /** Кнопка копирования узла в строке. */
  copyable?: boolean
  /** Оставлять в DOM только окно вокруг вьюпорта. Требует `maxHeight`. */
  virtual?: boolean
  /** Высота области просмотра: число — пиксели, строка — как есть. */
  maxHeight?: string | number
  /** Имя области для скринридера. Безымянное дерево объявляется просто «дерево». */
  ariaLabel?: string
  size?: GrComponentSize
}

export interface GrJsonViewerEmits {
  /** Узел скопирован: путь для тикета и полное значение. */
  (e: 'copy', payload: { path: string, value: unknown }): void
}

const props = withDefaults(defineProps<GrJsonViewerProps>(), {
  // Дефолты живут в резолверах ниже: Vue подставил бы свой раньше, чем
  // компонент заглянет в `GrConfigProvider`.
  rootLabel: undefined,
  defaultExpandDepth: undefined,
  maxStringLength: undefined,
  maxArrayItems: undefined,
  searchable: undefined,
  copyable: undefined,
  virtual: false,
  maxHeight: undefined,
  ariaLabel: undefined,
  size: undefined,
})

const emit = defineEmits<GrJsonViewerEmits>()

defineSlots<{
  /** Значение листа: ссылка, дата, денежная сумма — оформление знает приложение. */
  leaf?: (props: { node: GrJsonNode }) => unknown
}>()

const { t } = useGranularityTranslations()
const { announce } = useAnnouncer()

const resolvedSize = useGrComponentSize(() => props.size, { component: 'GrJsonViewer' })
const resolvedDepth = useGrComponentProp('GrJsonViewer', 'defaultExpandDepth', () => props.defaultExpandDepth, 1)
const resolvedMaxString = useGrComponentProp('GrJsonViewer', 'maxStringLength', () => props.maxStringLength, 200)
const resolvedMaxArray = useGrComponentProp('GrJsonViewer', 'maxArrayItems', () => props.maxArrayItems, 100)
const resolvedSearchable = useGrComponentProp('GrJsonViewer', 'searchable', () => props.searchable, true)
const resolvedCopyable = useGrComponentProp('GrJsonViewer', 'copyable', () => props.copyable, true)

const nodes = computed(() => jsonToNodes(props.value, {
  rootLabel: props.rootLabel,
  maxStringLength: resolvedMaxString.value,
  maxArrayItems: resolvedMaxArray.value,
}))

/**
 * Раскрытие ведётся подстановкой набора путей.
 *
 * Контролируемого `expandedKeys` у `GrTree` нет, но `defaultExpandedKeys` —
 * не «начальное значение»: дерево следит за пропом и заменяет набор целиком.
 * Значит набор обязан быть зеркалом того, что открыто, а не только того, что
 * открыли кнопки: разойдись они — первое же обновление данных вернуло бы дерево
 * к памяти просмотрщика, то есть закрыло бы раскрытое руками.
 */
const expandedPaths = ref<string[]>([])

/** Глубина по умолчанию раскладывается один раз — на первом дереве с ветками. */
let depthApplied = false

/**
 * Обновление данных раскрытие не сбрасывает.
 *
 * Ответ сервиса опрашивают раз в N секунд, и объект каждый раз новый; сброс на
 * каждую смену складывал бы дерево под руками. Из набора выпадают только
 * исчезнувшие ветки, а глубина применяется заново лишь тогда, когда изменилась
 * она сама.
 */
watch(
  [nodes, resolvedDepth],
  ([list, depth], previous) => {
    const branches = branchPaths(list)
    const depthChanged = previous !== undefined && previous[1] !== depth

    if (depthChanged || (!depthApplied && branches.length > 0)) {
      depthApplied = branches.length > 0
      expandedPaths.value = pathsToDepth(list, depth)
      return
    }

    const alive = new Set(branches)
    expandedPaths.value = expandedPaths.value.filter(path => alive.has(path))
  },
  { immediate: true },
)

/** Дерево держит раскрытие у себя и сообщает о нём событиями — слушаем оба. */
function rememberExpanded(node: GrJsonNode): void {
  if (!expandedPaths.value.includes(node.path))
    expandedPaths.value = [...expandedPaths.value, node.path]
}

function forgetExpanded(node: GrJsonNode): void {
  expandedPaths.value = expandedPaths.value.filter(path => path !== node.path)
}

function expandAll(): void {
  expandedPaths.value = branchPaths(nodes.value)
}

function collapseAll(): void {
  expandedPaths.value = []
}

const query = ref('')
const treeRef = ref<{ filter: (value: string) => void } | null>(null)

watch(query, (value) => {
  treeRef.value?.filter(value)
})

function filter(value: string): void {
  query.value = value
}

/** Поиск идёт и по ключу, и по значению: в чужом ответе ищут то одно, то другое. */
function matchKeyOrValue(value: string, data: GrJsonNode): boolean {
  if (!value)
    return true

  const needle = value.toLowerCase()

  return data.label.toLowerCase().includes(needle) || data.preview.toLowerCase().includes(needle)
}

/**
 * Наличие буфера уточняется после монтирования: `navigator` в теле `setup` либо
 * роняет серверный рендер, либо расходится с ним. До этого момента кнопки нет —
 * ровно то же, что отдаёт сервер, поэтому гидрация совпадает.
 */
const canCopy = ref(false)

onMounted(() => {
  canCopy.value = typeof navigator !== 'undefined' && typeof navigator.clipboard?.writeText === 'function'

  if (props.virtual && props.maxHeight === undefined && __GR_DEV__) {
    console.warn('[GrJsonViewer] `virtual` без `maxHeight` не включает виртуализацию: окно считается от высоты области.')
  }
})

const showCopy = computed(() => resolvedCopyable.value && canCopy.value)

const copiedPath = ref<string | null>(null)
let copiedTimer: number | null = null

function resetCopiedTimer(): void {
  if (copiedTimer !== null) {
    clearTimeout(copiedTimer)
    copiedTimer = null
  }
}

onBeforeUnmount(resetCopiedTimer)

/**
 * В буфер уходит **полное** значение узла, а не то, что видно: обрезка
 * принадлежит показу, и вставить её обратно нельзя.
 */
async function copyNode(node: GrJsonNode): Promise<void> {
  const text = typeof node.value === 'string' ? node.value : JSON.stringify(node.value, null, 2) ?? String(node.value)

  try {
    await navigator.clipboard.writeText(text)
  }
  catch {
    announce(t('gr.jsonViewer.copyFailed', 'Could not copy value'))
    return
  }

  copiedPath.value = node.path
  resetCopiedTimer()
  copiedTimer = window.setTimeout(() => {
    copiedPath.value = null
    copiedTimer = null
  }, 1200)

  announce(t('gr.jsonViewer.copied', 'Value copied'))
  emit('copy', { path: node.path, value: node.value })
}

defineExpose({ filter, expandAll, collapseAll })
</script>

<template>
  <div data-gr-json-viewer :class="jsonViewerRootClass">
    <div v-if="resolvedSearchable" data-gr-json-viewer-toolbar :class="jsonViewerToolbarClass">
      <GrInput
        v-model="query"
        :class="jsonViewerSearchClass"
        :size="resolvedSize"
        clearable
        :placeholder="t('gr.jsonViewer.search', 'Search key or value')"
        :aria-label="t('gr.jsonViewer.search', 'Search key or value')"
      />

      <GrButton variant="ghost" :size="resolvedSize" @click="expandAll">
        {{ t('gr.jsonViewer.expandAll', 'Expand all') }}
      </GrButton>
      <GrButton variant="ghost" :size="resolvedSize" @click="collapseAll">
        {{ t('gr.jsonViewer.collapseAll', 'Collapse all') }}
      </GrButton>
    </div>

    <GrTree
      ref="treeRef"
      :data="nodes"
      node-key="path"
      :props="{ children: 'children', label: 'label', isLeaf: 'isLeaf' }"
      :default-expanded-keys="expandedPaths"
      :filter-node-method="matchKeyOrValue"
      :content-class="jsonViewerContentClass"
      :virtual="virtual"
      :max-height="maxHeight"
      :size="resolvedSize"
      :aria-label="ariaLabel"
      @node-expand="rememberExpanded"
      @node-collapse="forgetExpanded"
    >
      <template #default="{ data }">
        <span data-gr-json-viewer-row :class="[jsonViewerRowClass, jsonViewerGroupClass]">
          <span data-gr-json-viewer-key :class="jsonViewerKeyClass">{{ data.label }}</span>
          <span :class="jsonViewerPunctuationClass">:</span>

          <span
            data-gr-json-viewer-value
            :class="[jsonViewerValueClass, jsonValueClass[(data as GrJsonNode).kind]]"
          >
            <slot name="leaf" :node="data as GrJsonNode">{{ (data as GrJsonNode).preview }}</slot>
          </span>

          <span
            v-if="(data as GrJsonNode).kind === 'truncation'"
            :class="jsonViewerMutedClass"
          >{{ t('gr.jsonViewer.moreItems', 'more') }}</span>

          <GrButton
            v-if="showCopy && (data as GrJsonNode).kind !== 'truncation'"
            data-gr-json-viewer-copy
            variant="ghost"
            size="xs"
            square
            :class="jsonViewerCopyClass"
            :aria-label="t('gr.jsonViewer.copy', 'Copy value')"
            :title="t('gr.jsonViewer.copy', 'Copy value')"
            @click.stop="copyNode(data as GrJsonNode)"
          >
            <component
              :is="copiedPath === (data as GrJsonNode).path ? IconCheck : IconCopy"
              class="h-3.5 w-3.5"
              aria-hidden="true"
            />
          </GrButton>
        </span>
      </template>
    </GrTree>
  </div>
</template>
