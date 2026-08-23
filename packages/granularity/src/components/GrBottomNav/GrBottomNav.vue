<script setup lang="ts">
import { computed, markRaw, type Component } from 'vue'

import type { GrComponentSize } from '../shared/sizes'

import { useGrComponentSize } from '../GrConfigProvider/context'
import { useGranularityTranslations } from '../../internal/granularityI18n'

import {
  grBottomNavIconClass,
  grBottomNavItemClass,
  grBottomNavListClass,
  grBottomNavRootClass,
  itemBadgeClass,
  itemLabelClass,
  type GrBottomNavHideAbove,
  type GrBottomNavPosition,
} from './grBottomNavStyles'

import './defaults'

export type { GrBottomNavHideAbove, GrBottomNavPosition } from './grBottomNavStyles'

/** Пункт нижней навигации. Кроме подписи и значения всё опционально. */
export type GrBottomNavItem = {
  label: string
  value: string
  /** Иконка: класс UnoCSS-иконки (`'i-lucide-home'`) или Vue-компонент. Декоративна. */
  icon?: string | Component
  /** Счётчик поверх пункта. Число озвучивается словами, строка — как есть. */
  badge?: string | number
  /** Подпись счётчика для скринридера, сильнее локали. */
  badgeLabel?: string
  disabled?: boolean
  href?: string
  /** Цель роутерной ссылки: уезжает в компонент из `as`. */
  to?: unknown
  /** Доступное имя пункта, когда подписи недостаточно. */
  ariaLabel?: string
}

/**
 * GrBottomNav — нижняя навигация приложения: ряд разделов, прижатый к нижней
 * кромке экрана.
 *
 * Активный пункт объявлен `aria-current="page"` и отличается не только цветом:
 * подложкой и весом подписи тоже.
 */
export interface GrBottomNavProps {
  modelValue: string
  items: GrBottomNavItem[]
  /** Компонент ссылки для пунктов с `to`: `RouterLink`, `NuxtLink`, `Link` Inertia. */
  as?: string | Component
  /** Брейкпоинт, начиная с которого панель скрывается. `none` — видна всегда. */
  hideAbove?: GrBottomNavHideAbove
  /** `static` вынимает панель из фиксированного слоя — для встраивания в макет. */
  position?: GrBottomNavPosition
  /** Имя лендмарка. Не задано — берётся из локали. */
  ariaLabel?: string
  /**
   * Ступень размера: высота полосы, глиф и кегль подписи. Тач-таргет пункта
   * остаётся 44×44 на любой ступени.
   */
  size?: GrComponentSize
}

export interface GrBottomNavEmits {
  (e: 'update:modelValue', value: string): void
}

const props = withDefaults(defineProps<GrBottomNavProps>(), {
  as: undefined,
  hideAbove: 'sm',
  position: 'fixed',
  ariaLabel: undefined,
  // `undefined`: «настоящий» дефолт живёт в `useGrComponentSize`, иначе
  // `GrConfigProvider` не отличит заданное значение от подставленного Vue.
  size: undefined,
})

const emit = defineEmits<GrBottomNavEmits>()

defineSlots<{
  /**
   * Содержимое пункта вместо иконки, подписи и счётчика. Корень пункта —
   * тег, `aria-current`, `aria-disabled` и клик — остаётся за компонентом.
   */
  item?: (props: {
    item: GrBottomNavItem
    active: boolean
    disabled: boolean
    badgeLabel: string | undefined
  }) => any
}>()

const { t } = useGranularityTranslations()

const resolvedAriaLabel = computed(() => props.ariaLabel ?? t('gr.bottomNav.label', 'Bottom navigation'))

const resolvedSize = useGrComponentSize(() => props.size, { component: 'GrBottomNav' })

const rootClass = computed(() => grBottomNavRootClass({
  position: props.position,
  hideAbove: props.hideAbove,
}))

const linkComponent = computed(() => (props.as && typeof props.as !== 'string' ? markRaw(props.as) : props.as))

function itemTag(item: GrBottomNavItem): string | Component {
  if (item.disabled)
    return 'span'
  if (item.to !== undefined && linkComponent.value)
    return linkComponent.value
  return item.href ? 'a' : 'button'
}

/**
 * Счётчик рисуется декоративно, а рядом идёт скрытая подпись: голое «3» без
 * единицы измерения диктору ничего не сообщает.
 */
function badgeLabel(item: GrBottomNavItem): string | undefined {
  if (item.badge == null || item.badge === '')
    return undefined
  if (item.badgeLabel)
    return item.badgeLabel
  if (typeof item.badge === 'number') {
    return t('gr.bottomNav.badge', '{count} new', { count: item.badge, n: item.badge })
  }
  return String(item.badge)
}

function select(item: GrBottomNavItem): void {
  if (item.disabled)
    return
  emit('update:modelValue', item.value)
}
</script>

<template>
  <nav :class="rootClass" :aria-label="resolvedAriaLabel">
    <div :class="grBottomNavListClass(resolvedSize)">
      <component
        :is="itemTag(item)"
        v-for="item in items"
        :key="item.value"
        data-gr-bottom-nav-item
        :type="itemTag(item) === 'button' ? 'button' : undefined"
        :href="itemTag(item) === 'a' ? item.href : undefined"
        :to="item.to !== undefined && linkComponent ? item.to : undefined"
        :aria-current="item.value === modelValue ? 'page' : undefined"
        :aria-disabled="item.disabled ? 'true' : undefined"
        :aria-label="item.ariaLabel"
        :class="grBottomNavItemClass({ active: item.value === modelValue, disabled: item.disabled ?? false, size: resolvedSize })"
        @click="select(item)"
      >
        <slot
          name="item"
          :item="item"
          :active="item.value === modelValue"
          :disabled="item.disabled ?? false"
          :badge-label="badgeLabel(item)"
        >
          <component :is="item.icon" v-if="item.icon && typeof item.icon !== 'string'" :class="grBottomNavIconClass(resolvedSize)" aria-hidden="true" />
          <span v-else-if="item.icon" :class="[item.icon, grBottomNavIconClass(resolvedSize)]" aria-hidden="true" />

          <span :class="itemLabelClass">{{ item.label }}</span>

          <template v-if="item.badge != null && item.badge !== ''">
            <span data-gr-bottom-nav-badge :class="itemBadgeClass" aria-hidden="true">{{ item.badge }}</span>
            <span data-gr-bottom-nav-badge-label class="sr-only">{{ badgeLabel(item) }}</span>
          </template>
        </slot>
      </component>
    </div>
  </nav>
</template>
