<script setup lang="ts" generic="T extends Record<string, any> = any">
import { computed, ref, watchEffect } from 'vue'

import GrTree from '../GrTree/GrTree.vue'
import type { GrTreeKey, GrTreeNode } from '../GrTree/grTreeTypes'
import type { GrTreeBranchLine, GrTreeDataProps, GrTreePropsMap } from '../GrTree/grTreeProps'
import type { GrComponentSize } from '../shared/sizes'
import { createGrTreeDataAdapter } from '../../composables/internal/treeAdapter'

import {
  treeSectionsCountClass,
  treeSectionsGroupClass,
  treeSectionsHeadClass,
  treeSectionsRootClass,
} from './grTreeSectionsStyles'

/**
 * GrTreeSections — дерево, у которого верхний уровень стал рубрикой.
 *
 * Внутри это не одно дерево с заголовками между строк, а **несколько деревьев**:
 * `role="tree"` требует, чтобы его детьми были `treeitem`, и заголовок посреди
 * них либо ломал бы паттерн, либо врал диктору, оставаясь строкой. Заголовки
 * между отдельными деревьями законны, и каждая группа объявляется сама собой.
 *
 * Отсюда же граница: клавиатурное кольцо у каждой группы своё, `Tab` переходит
 * между ними. Это верно по существу — группы независимы.
 */
export interface GrTreeSectionsProps<TData extends object = any> {
  /** Данные обычного дерева. Корни становятся заголовками, их дети — деревьями. */
  data: TData[]
  nodeKey?: GrTreeDataProps<TData>['nodeKey']
  props?: GrTreePropsMap
  size?: GrComponentSize
  /** Уровень заголовка группы под структуру страницы. */
  headingLevel?: 2 | 3 | 4 | 5 | 6
  /** Показывать число узлов первого уровня в группе. */
  showCount?: boolean
  showCheckbox?: boolean
  checkStrictly?: boolean
  branchLine?: boolean | GrTreeBranchLine
  indent?: number
  defaultExpandedKeys?: GrTreeKey[]
  currentKey?: GrTreeKey
  checkedKeys?: GrTreeKey[]
}

export interface GrTreeSectionsEmits {
  (e: 'update:currentKey', key: GrTreeKey | undefined): void
  (e: 'update:checkedKeys', keys: GrTreeKey[]): void
  (e: 'nodeClick', data: any, node: GrTreeNode<any>): void
}

const props = withDefaults(defineProps<GrTreeSectionsProps<T>>(), {
  nodeKey: 'id' as never,
  props: undefined,
  size: undefined,
  headingLevel: 3,
  showCount: false,
  showCheckbox: false,
  checkStrictly: false,
  branchLine: undefined,
  indent: 0,
  defaultExpandedKeys: () => [],
  currentKey: undefined,
  checkedKeys: undefined,
})

const emit = defineEmits<GrTreeSectionsEmits>()

defineSlots<{
  /** Заголовок группы целиком — вместо подписи корневого узла. */
  heading?: (props: { data: T, label: string, count: number }) => unknown
  /** Строка внутри группы, как у `GrTree`. */
  default?: (props: { node: GrTreeNode<T>, data: T }) => unknown
}>()

const adapter = createGrTreeDataAdapter<T>(props)

/** Ключ группы: у корня он либо объявлен данными, либо выводится по позиции. */
function groupKey(data: T, index: number): GrTreeKey {
  return adapter.getNodeKey(data, index, undefined)
}

/**
 * Группы — корни исходных данных. Собственные данные группы — её дети: сам
 * корень строкой уже не рендерится, он стал заголовком.
 */
const groups = computed(() => (Array.isArray(props.data) ? props.data : []).map((data, index) => {
  const children = (adapter.getChildren(data) ?? []) as T[]

  return {
    key: groupKey(data, index),
    label: adapter.getLabel(data),
    data,
    children,
    count: children.length,
  }
}))

const localCurrent = ref<GrTreeKey | undefined>(props.currentKey)

watchEffect(() => {
  localCurrent.value = props.currentKey
})

function onCurrentChange(key: GrTreeKey | undefined): void {
  // Ключи уникальны на всё дерево, поэтому подсветится ровно одна группа:
  // остальные получат чужой ключ и просто не найдут его у себя.
  localCurrent.value = key
  emit('update:currentKey', key)
}

/**
 * Отметки собираются объединением: группы — независимые деревья, и наследование
 * внутри каждой считается своё. Свести их в один список можно без потерь именно
 * потому, что общего родителя у групп нет.
 */
function onCheckedChange(groupKey: GrTreeKey, keys: GrTreeKey[]): void {
  const own = new Set(groups.value.find(group => group.key === groupKey)?.children.flatMap(collectKeys) ?? [])
  const rest = (props.checkedKeys ?? []).filter(key => !own.has(key))

  emit('update:checkedKeys', [...rest, ...keys])
}

function collectKeys(data: T): GrTreeKey[] {
  const children = (adapter.getChildren(data) ?? []) as T[]

  return [adapter.getExplicitNodeKey(data), ...children.flatMap(collectKeys)]
    .filter((key): key is GrTreeKey => key !== undefined)
}

if (__GR_DEV__) {
  watchEffect(() => {
    if (!Array.isArray(props.data)) {
      console.warn(
        `[granularity] GrTreeSections: обязательный проп \`data\` должен быть массивом — получено ${String(props.data)}.`,
      )
    }
  })
}
</script>

<template>
  <div data-gr-tree-sections :class="treeSectionsRootClass">
    <section
      v-for="group in groups"
      :key="String(group.key)"
      data-gr-tree-sections-group
      :class="treeSectionsGroupClass"
    >
      <component :is="`h${headingLevel}`" :class="treeSectionsHeadClass">
        <slot name="heading" :data="group.data" :label="group.label" :count="group.count">
          {{ group.label }}
        </slot>
        <span v-if="showCount" :class="treeSectionsCountClass">{{ group.count }}</span>
      </component>

      <GrTree
        :data="group.children"
        :node-key="nodeKey"
        :props="props.props"
        :size="size"
        :show-checkbox="showCheckbox"
        :check-strictly="checkStrictly"
        :branch-line="branchLine"
        :indent="indent"
        :default-expanded-keys="defaultExpandedKeys"
        :current-key="localCurrent"
        :checked-keys="checkedKeys"
        :aria-label="group.label"
        @update:current-key="onCurrentChange"
        @update:checked-keys="keys => onCheckedChange(group.key, keys)"
        @node-click="(data, node) => emit('nodeClick', data, node)"
      >
        <template v-if="$slots.default" #default="slotProps">
          <slot v-bind="slotProps" />
        </template>
      </GrTree>
    </section>
  </div>
</template>
