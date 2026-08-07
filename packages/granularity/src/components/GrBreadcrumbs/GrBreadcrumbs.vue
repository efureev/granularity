<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'

import GrLink from '../GrLink/GrLink.vue'
import { useGrComponentProp, useGrComponentSize } from '../GrConfigProvider/context'
import { useGranularityTranslations } from '../../internal/granularityI18n'

import {
  breadcrumbsCurrentClass,
  breadcrumbsEllipsisClass,
  breadcrumbsItemIconClass,
  breadcrumbsLabelClass,
  breadcrumbsListClass,
  breadcrumbsRootClass,
  breadcrumbsSeparatorClass,
  breadcrumbsSizeClassBySize,
  type GrBreadcrumbItem,
  type GrBreadcrumbsLinkComponent,
  type GrBreadcrumbsSize,
  resolveBreadcrumbsLayout,
} from './grBreadcrumbsStyles'

export type { GrBreadcrumbItem, GrBreadcrumbsSize } from './grBreadcrumbsStyles'

/**
 * Путь до текущей страницы (WAI-ARIA breadcrumb): `<nav>` с именем, внутри
 * упорядоченный список ссылок, последний пункт — текущая страница.
 *
 * Ссылки рисует `GrLink`, поэтому роутер подключается тем же способом, что и
 * везде в пакете: `as` + `to`.
 */
export interface GrBreadcrumbsProps {
  /** Путь от корня к текущей странице. Последний пункт — текущая страница. */
  items: GrBreadcrumbItem[]
  /** Компонент ссылки для всех пунктов: `RouterLink`, `NuxtLink`, `Link` Inertia. */
  as?: GrBreadcrumbsLinkComponent
  /** Разделитель между пунктами. Декоративен: диктору не читается. */
  separator?: string
  size?: GrBreadcrumbsSize
  /**
   * С какого числа пунктов схлопывать середину в «…». `0`/не задано — показывать
   * путь целиком.
   */
  maxItems?: number
  /** Сколько пунктов оставить в начале при схлопывании. */
  itemsBeforeCollapse?: number
  /** Сколько пунктов оставить в конце при схлопывании. */
  itemsAfterCollapse?: number
  /** Имя лендмарка. Не задано — берётся из локали. */
  ariaLabel?: string
  /** Последний пункт остаётся ссылкой (текущая страница кликабельна). */
  linkCurrent?: boolean
  /** i18n-метка кнопки раскрытия схлопнутого пути. */
  expandLabel?: string
}

const props = withDefaults(defineProps<GrBreadcrumbsProps>(), {
  as: undefined,
  separator: undefined,
  size: undefined,
  maxItems: undefined,
  itemsBeforeCollapse: 1,
  itemsAfterCollapse: 1,
  ariaLabel: undefined,
  linkCurrent: false,
  expandLabel: undefined,
})

defineSlots<{
  /** Содержимое пункта целиком (иконка и подпись). */
  item?: (props: { item: GrBreadcrumbItem, index: number, isCurrent: boolean }) => unknown
  /** Разделитель между пунктами. */
  separator?: () => unknown
  /** Кнопка раскрытия схлопнутой середины. */
  ellipsis?: (props: { hiddenCount: number, expand: () => void }) => unknown
}>()

const { t } = useGranularityTranslations()

const resolvedSize = useGrComponentSize(() => props.size, { component: 'GrBreadcrumbs' })
const resolvedSeparator = useGrComponentProp('GrBreadcrumbs', 'separator', () => props.separator, '/')

const resolvedAriaLabel = computed(() => props.ariaLabel ?? t('gr.breadcrumbs.label', 'Breadcrumb'))
const resolvedExpandLabel = computed(() => props.expandLabel ?? t('gr.breadcrumbs.expand', 'Show hidden path'))

const rootEl = ref<HTMLElement | null>(null)
const expanded = ref(false)

// Новый путь — новая страница: раскрытая середина прошлого пути к ней отношения
// не имеет.
watch(() => props.items, () => {
  expanded.value = false
})

const lastIndex = computed(() => props.items.length - 1)

const entries = computed(() => resolveBreadcrumbsLayout({
  items: props.items,
  maxItems: props.maxItems,
  itemsBeforeCollapse: props.itemsBeforeCollapse,
  itemsAfterCollapse: props.itemsAfterCollapse,
  expanded: expanded.value,
}))

function isCurrent(index: number): boolean {
  return index === lastIndex.value
}

/** Ссылкой пункт становится, только если ведёт куда-то и не выключен. */
function isLink(item: GrBreadcrumbItem, index: number): boolean {
  if (item.disabled) return false
  if (isCurrent(index) && !props.linkCurrent) return false
  return item.href !== undefined || item.to !== undefined || props.as !== undefined
}

async function expand(): Promise<void> {
  expanded.value = true

  // Кнопка исчезает вместе со схлопыванием, и фокус ушёл бы на `<body>`.
  // Переводим его на первый раскрытый пункт — там, где кнопка и стояла. Пункты
  // без ссылки держат `tabindex="-1"` именно ради этого случая.
  await nextTick()
  const before = Math.max(0, Math.min(props.itemsBeforeCollapse, props.items.length))
  const revealed = rootEl.value?.querySelectorAll<HTMLElement>('[data-gr-breadcrumbs-item]')
  revealed?.[before]?.focus()
}
</script>

<template>
  <nav
    ref="rootEl"
    data-gr-breadcrumbs
    :class="[breadcrumbsRootClass, breadcrumbsSizeClassBySize[resolvedSize]]"
    :aria-label="resolvedAriaLabel"
  >
    <ol data-gr-breadcrumbs-list :class="breadcrumbsListClass">
      <template v-for="(entry, position) in entries" :key="entry.kind === 'item' ? `item-${entry.index}` : 'ellipsis'">
        <!--
          Разделитель — отдельный элемент списка и помечен `aria-hidden`:
          структуру пути диктору сообщает сам список, а «/» он бы читал вслух.
        -->
        <li
          v-if="position > 0"
          data-gr-breadcrumbs-separator
          :class="breadcrumbsSeparatorClass"
          aria-hidden="true"
        >
          <slot name="separator">
            {{ resolvedSeparator }}
          </slot>
        </li>

        <li v-if="entry.kind === 'ellipsis'" data-gr-breadcrumbs-ellipsis-item class="min-w-0">
          <slot name="ellipsis" :hidden-count="entry.hiddenCount" :expand="expand">
            <button
              type="button"
              data-gr-breadcrumbs-ellipsis
              data-testid="gr-breadcrumbs-ellipsis"
              :class="breadcrumbsEllipsisClass"
              :aria-label="resolvedExpandLabel"
              @click="expand"
            >
              …
            </button>
          </slot>
        </li>

        <li v-else data-gr-breadcrumbs-item-wrap class="min-w-0">
          <GrLink
            v-if="isLink(entry.item, entry.index)"
            :key="`link-${entry.index}`"
            data-gr-breadcrumbs-item
            :as="as"
            :href="entry.item.href"
            :to="entry.item.to"
            :size="resolvedSize"
            :variant="isCurrent(entry.index) ? 'default' : 'muted'"
            :aria-label="entry.item.ariaLabel"
            :aria-current="isCurrent(entry.index) ? 'page' : undefined"
          >
            <slot name="item" :item="entry.item" :index="entry.index" :is-current="isCurrent(entry.index)">
              <span v-if="entry.item.icon" :class="[breadcrumbsItemIconClass, entry.item.icon]" aria-hidden="true" />
              <span :class="breadcrumbsLabelClass">{{ entry.item.label }}</span>
            </slot>
          </GrLink>

          <!--
            Текущая страница и выключенный пункт — не ссылки. `aria-current`
            остаётся на текущем: именно он отвечает на вопрос «где я».
          -->
          <span
            v-else
            data-gr-breadcrumbs-item
            :class="breadcrumbsCurrentClass"
            :aria-label="entry.item.ariaLabel"
            :aria-current="isCurrent(entry.index) ? 'page' : undefined"
            :aria-disabled="entry.item.disabled ? 'true' : undefined"
            tabindex="-1"
          >
            <slot name="item" :item="entry.item" :index="entry.index" :is-current="isCurrent(entry.index)">
              <span v-if="entry.item.icon" :class="[breadcrumbsItemIconClass, entry.item.icon]" aria-hidden="true" />
              <span :class="breadcrumbsLabelClass">{{ entry.item.label }}</span>
            </slot>
          </span>
        </li>
      </template>
    </ol>
  </nav>
</template>
