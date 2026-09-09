<script setup lang="ts">
/**
 * GrSidebarItem — пункт навигации боковой панели `GrSidebar`.
 *
 * Контракт:
 * - развёрнутая панель — `[иконка] метка [бейдж]`;
 * - свёрнутая панель — только иконка; если иконки нет, показывается ПЕРВАЯ БУКВА
 *   метки (uppercase). Имя пункту даёт `aria-label`, а подпись показывает
 *   `GrTooltip`: нативный `title` появлялся только по наведению, то есть с
 *   клавиатуры свёрнутую панель было не прочесть.
 *
 * Корневой тег: `as` → `<a href>` → `<button>` (в этом порядке).
 */
import { computed, inject, markRaw, provide, ref, useId, watch, type Component } from 'vue'

import GrTooltip from '../GrTooltip/GrTooltip.vue'

import IconChevronRight from '~icons/lucide/chevron-right'

import {
  grSidebarItemClass,
  itemBadgeClass,
  itemChevronClass,
  itemChevronExpandedClass,
  itemChildrenClass,
  itemLetterClass,
  itemNestClass,
  itemNestIndent,
} from './grSidebarStyles'
import { GR_SIDEBAR_KEY, GR_SIDEBAR_LEVEL_KEY } from './sidebarContext'

export interface GrSidebarItemProps {
  label: string
  /** Иконка: класс UnoCSS-иконки (`'i-lucide-home'`) или Vue-компонент. */
  icon?: string | Component
  href?: string
  as?: string | Component
  active?: boolean
  disabled?: boolean
  badge?: string | number
  /**
   * Раскрыто ли поддерево. Поддерживает `v-model:expanded`; без пропа пункт
   * ведёт себя сам.
   */
  expanded?: boolean
  /** Начальное состояние поддерева, когда `expanded` не контролируется. */
  defaultExpanded?: boolean
}

export interface GrSidebarItemEmits {
  (e: 'update:expanded', value: boolean): void
}

const props = withDefaults(defineProps<GrSidebarItemProps>(), {
  icon: undefined,
  href: undefined,
  as: undefined,
  active: false,
  disabled: false,
  badge: undefined,
  expanded: undefined,
  defaultExpanded: false,
})

const emit = defineEmits<GrSidebarItemEmits>()

const slots = defineSlots<{
  /**
   * Вложенные пункты. Их наличие превращает пункт в раскрывающийся: он теряет
   * роль ссылки и становится переключателем поддерева.
   */
  default?: () => unknown
}>()

const sidebar = inject(GR_SIDEBAR_KEY, null)
const collapsed = computed(() => sidebar?.collapsed.value ?? false)

/**
 * Подсказка уходит **от** панели: у левой — вправо, у правой — влево. Иначе
 * она легла бы поверх самой панели и закрыла соседние пункты.
 */
const tooltipPlacement = computed(() => (sidebar?.position.value === 'right' ? 'left' : 'right'))

/*
 * Обёртка тултипом появляется только в свёрнутом виде: в развёрнутом подпись
 * видна текстом, и лишний узел в разметке ни к чему.
 *
 * В шаблоне это `v-if`/`v-else`, и комментарию там не место: узел-комментарий
 * перед корнем делает компонент многокорневым, а у такого не работает проброс
 * атрибутов и `wrapper.element` указывает не туда.
 *
 * `describe-trigger="false"` обязателен — имя пункту уже даёт `aria-label` с
 * той же подписью, и описание тем же текстом диктор прочитал бы дважды.
 * `block` — потому что пункт тянется на всю ширину рейла, а обёртка по
 * умолчанию `inline-flex` схлопнула бы его вместе с подсветкой и кольцом
 * фокуса.
 */

// ————— Вложенность.

const level = inject(GR_SIDEBAR_LEVEL_KEY, 0)
provide(GR_SIDEBAR_LEVEL_KEY, level + 1)

const hasChildren = computed(() => Boolean(slots.default))
const childrenId = useId()

/**
 * Раскрытие живёт локально, пока проп не задан: панель навигации чаще всего
 * управляет собой сама, и требовать `v-model` на каждую ветку значило бы
 * заставить потребителя держать дерево состояний ради поведения по умолчанию.
 */
const uncontrolledExpanded = ref(props.defaultExpanded)
const isExpanded = computed(() => props.expanded ?? uncontrolledExpanded.value)

function toggleChildren(): void {
  const next = !isExpanded.value

  uncontrolledExpanded.value = next
  emit('update:expanded', next)
}

/**
 * Нажатие на ветку в свёрнутом рейле сперва возвращает панели ширину: показать
 * подпункты в шестидесяти четырёх пикселях негде, и без этого кнопка ничего бы
 * не делала.
 */
function onCollapsedActivate(): void {
  if (!hasChildren.value)
    return

  sidebar?.expand()

  if (!isExpanded.value)
    toggleChildren()
}

/*
 * `href` вместе с подпунктами — противоречие: одно нажатие не может и увести на
 * страницу, и раскрыть ветку. Побеждают подпункты, потому что иначе раскрыть
 * ветку было бы нечем вовсе, — но молчать об этом нельзя: тихо снятая
 * навигация по поведению неотличима от забытой.
 */
if (__GR_DEV__) {
  watch(
    () => hasChildren.value && (props.href !== undefined || props.as !== undefined),
    (conflict) => {
      if (conflict) {
        console.warn(
          `[GrSidebarItem] У пункта "${props.label}" есть подпункты, поэтому он стал переключателем ветки: `
          + '`href` и `as` не используются. Ссылкой сделайте отдельный подпункт.',
        )
      }
    },
    { immediate: true },
  )
}

const isStringIcon = computed(() => typeof props.icon === 'string')
const iconComponent = computed(() => (props.icon && typeof props.icon !== 'string' ? markRaw(props.icon as Component) : null))
const firstLetter = computed(() => props.label.trim().charAt(0).toUpperCase() || '•')

const rootTag = computed<string | Component>(() => {
  if (props.disabled)
    return 'span'
  // Пункт с подпунктами — переключатель, а кнопка это и есть переключатель.
  if (hasChildren.value)
    return 'button'
  if (props.as)
    return typeof props.as === 'string' ? props.as : markRaw(props.as)
  return props.href ? 'a' : 'button'
})

/**
 * Компонент-ссылка (`Link` от Inertia, `RouterLink`) рендерит `<a>` сам, и без
 * `href` он ведёт в никуда. Строковый тег, кроме `a`, атрибут не понимает —
 * там он и гасится.
 */
const rootHref = computed(() => (
  typeof rootTag.value === 'string' && rootTag.value !== 'a' ? undefined : props.href
))

const rootClass = computed(() => grSidebarItemClass({
  collapsed: collapsed.value,
  disabled: props.disabled,
  active: props.active,
}))

/**
 * Отступ уровня — в свёрнутом рейле его нет: там строка шириной с иконку, и
 * сдвигать её некуда.
 */
const rootStyle = computed(() => {
  const indent = collapsed.value ? undefined : itemNestIndent(level)

  return indent ? { paddingInlineStart: indent } : undefined
})

/**
 * Поддерево исчезает из DOM, а не прячется: невидимая ветка ловила бы `Tab` и
 * читалась бы диктором вопреки `aria-expanded="false"`.
 *
 * Свёрнутость здесь не проверяется — её перехватывает `v-if="collapsed"` раньше:
 * в рейле пункт рисуется иконкой с подсказкой, и до ветки дело не доходит.
 */
const showChildren = computed(() => hasChildren.value && isExpanded.value)
</script>

<template>
  <GrTooltip
    v-if="collapsed"
    :text="label"
    :placement="tooltipPlacement"
    block
    :describe-trigger="false"
    data-gr-sidebar-item-tooltip
  >
    <component
      :is="rootTag"
      data-gr-sidebar-item
      :type="rootTag === 'button' ? 'button' : undefined"
      :href="rootHref"
      :aria-current="active ? 'page' : undefined"
      :aria-disabled="disabled ? 'true' : undefined"
      :aria-label="label"
      :aria-expanded="hasChildren ? 'false' : undefined"
      :class="rootClass"
      @click="onCollapsedActivate"
    >
      <span class="flex h-5 w-5 shrink-0 items-center justify-center">
        <component :is="iconComponent" v-if="iconComponent" class="h-5 w-5" aria-hidden="true" />
        <span v-else-if="isStringIcon" :class="icon" class="block h-5 w-5" aria-hidden="true" />
        <span v-else :class="itemLetterClass" aria-hidden="true">{{ firstLetter }}</span>
      </span>
    </component>
  </GrTooltip>

  <div v-else-if="hasChildren" data-gr-sidebar-item-nest :class="itemNestClass">
    <button
      data-gr-sidebar-item
      type="button"
      :aria-current="active ? 'page' : undefined"
      :aria-disabled="disabled ? 'true' : undefined"
      :aria-expanded="isExpanded ? 'true' : 'false'"
      :aria-controls="showChildren ? childrenId : undefined"
      :class="rootClass"
      :style="rootStyle"
      @click="toggleChildren"
    >
      <span class="flex h-5 w-5 shrink-0 items-center justify-center">
        <component :is="iconComponent" v-if="iconComponent" class="h-5 w-5" aria-hidden="true" />
        <span v-else-if="isStringIcon" :class="icon" class="block h-5 w-5" aria-hidden="true" />
      </span>

      <span class="min-w-0 flex-1 truncate text-left">{{ label }}</span>
      <span v-if="badge != null" :class="itemBadgeClass">{{ badge }}</span>

      <!-- Состояние ветки несёт `aria-expanded`; шеврон говорит то же самое глазам. -->
      <IconChevronRight
        aria-hidden="true"
        :class="[itemChevronClass, isExpanded ? itemChevronExpandedClass : '']"
      />
    </button>

    <div v-if="showChildren" :id="childrenId" data-gr-sidebar-item-children :class="itemChildrenClass">
      <slot />
    </div>
  </div>

  <component
    :is="rootTag"
    v-else
    data-gr-sidebar-item
    :type="rootTag === 'button' ? 'button' : undefined"
    :href="rootHref"
    :aria-current="active ? 'page' : undefined"
    :aria-disabled="disabled ? 'true' : undefined"
    :class="rootClass"
    :style="rootStyle"
  >
    <span class="flex h-5 w-5 shrink-0 items-center justify-center">
      <component :is="iconComponent" v-if="iconComponent" class="h-5 w-5" aria-hidden="true" />
      <span v-else-if="isStringIcon" :class="icon" class="block h-5 w-5" aria-hidden="true" />
    </span>

    <span class="min-w-0 flex-1 truncate text-left">{{ label }}</span>
    <span v-if="badge != null" :class="itemBadgeClass">{{ badge }}</span>
  </component>
</template>
