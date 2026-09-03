<script setup lang="ts">
import { computed, ref, watchEffect } from 'vue'

import { useGranularityTranslations } from '../../internal/granularityI18n'
import { useScrollSpy } from '../../composables/useScrollSpy'

import type { GrScrollSpySection } from './scrollSpyItems'
import { anchorClickHandled, ancestorSectionIds, scrollSpyOffsetLength } from './scrollSpyItems'
import { grScrollSpyItemClass, scrollSpyListClass, scrollSpyRootClass } from './grScrollSpyStyles'

/**
 * GrScrollSpy — оглавление длинной страницы, которое знает, до какого раздела
 * дочитали: активный пункт подсвечивается по прокрутке, клик по пункту ведёт к
 * разделу.
 *
 * Логика положения живёт в композабле `useScrollSpy` и доступна отдельно — этот
 * компонент добавляет к ней разметку, `aria-current` и всё, что следует из того,
 * что пункт является ссылкой.
 */
export interface GrScrollSpyProps {
  /** Разделы в порядке их следования на странице. */
  sections: GrScrollSpySection[]
  /**
   * Отступ линии активации от верха скроллпорта. Число — пиксели, строка — как
   * есть. Почти всегда равен отступу липкой шапки (`--gr-affix-offset`).
   */
  offset?: number | string
  /** Скроллпорт: элемент или селектор. Не задан — ищется от первого раздела. */
  scroller?: HTMLElement | string | null
  ariaLabel?: string
  /** Обновлять `#hash` адреса при переходе. */
  updateHash?: boolean
  /** Плавность прокрутки. Под `prefers-reduced-motion` всегда мгновенная. */
  behavior?: ScrollBehavior
  /** Переносить фокус на раздел, как это делает переход по якорю. */
  focusTarget?: boolean
  disabled?: boolean
}

export interface GrScrollSpyEmits {
  (e: 'activeChange', id: string | null): void
  (e: 'select', id: string, event: MouseEvent): void
}

const props = withDefaults(defineProps<GrScrollSpyProps>(), {
  offset: undefined,
  scroller: undefined,
  ariaLabel: undefined,
  updateHash: true,
  behavior: undefined,
  focusTarget: true,
  disabled: false,
})

const emit = defineEmits<GrScrollSpyEmits>()

defineSlots<{
  /** Пункт целиком. `activate` повторяет клик по нему. */
  item?: (props: {
    section: GrScrollSpySection
    active: boolean
    ancestor: boolean
    activate: () => void
  }) => unknown
}>()

const { t } = useGranularityTranslations()

const rootEl = ref<HTMLElement | null>(null)

const label = computed(() => props.ariaLabel ?? t('gr.scrollSpy.label', 'On this page'))

const rootStyle = computed(() => {
  const length = scrollSpyOffsetLength(props.offset)

  return length === undefined ? undefined : { '--gr-scroll-spy-offset': length }
})

/**
 * Отступ берётся из вычисленного стиля, а не из пропа: браузер уже разрешил
 * `4rem`, `var(...)` и `calc(...)` в used value, и свой парсер CSS не нужен.
 * Заодно работает отступ, заданный каскадом, — а он и есть общий дефолт группы.
 *
 * Носитель — `scroll-margin-top` на корне: вычисленное значение этого свойства
 * всегда абсолютная длина, а на само оглавление оно влияет ровно там, где нужно,
 * и в ту же сторону — отодвигает его от края при переходе по якорю.
 */
function measureOffsetPx(): number {
  const el = rootEl.value

  if (!el || typeof getComputedStyle !== 'function')
    return 0

  const parsed = Number.parseFloat(getComputedStyle(el).scrollMarginTop)

  return Number.isFinite(parsed) ? Math.max(0, parsed) : 0
}

function resolveScroller(): HTMLElement | null {
  const value = props.scroller

  if (typeof value === 'string')
    return typeof document === 'undefined' ? null : document.querySelector<HTMLElement>(value)

  return value ?? null
}

const spy = useScrollSpy({
  sections: () => (Array.isArray(props.sections) ? props.sections.map(section => section.id) : []),
  scroller: resolveScroller,
  offset: measureOffsetPx,
  disabled: () => props.disabled,
  onChange: id => emit('activeChange', id),
})

const ancestors = computed(() => ancestorSectionIds(props.sections ?? [], spy.active.value))

function itemState(id: string): 'active' | 'ancestor' | 'idle' {
  if (spy.active.value === id)
    return 'active'

  return ancestors.value.has(id) ? 'ancestor' : 'idle'
}

/**
 * `preventDefault()` отнимает у ссылки то, что браузер делает сам при переходе
 * по якорю, — перенос точки последовательной навигации. Без компенсации
 * клавиатурный пользователь после активации пункта продолжает `Tab` внутри
 * оглавления, а не с начала раздела.
 *
 * `preventScroll` обязателен: иначе фокус телепортирует прокрутку и подерётся с
 * плавной. Временный `tabindex` снимается по `blur` — чужой DOM остаётся чужим.
 */
function focusSection(id: string): void {
  const el = typeof document === 'undefined' ? null : document.getElementById(id)

  if (!el)
    return

  if (!el.hasAttribute('tabindex')) {
    el.setAttribute('tabindex', '-1')
    el.addEventListener('blur', () => el.removeAttribute('tabindex'), { once: true })
  }

  el.focus({ preventScroll: true })
}

function activate(id: string, event?: MouseEvent): void {
  spy.scrollTo(id, props.behavior === undefined ? undefined : { behavior: props.behavior })

  if (props.updateHash && typeof history !== 'undefined') {
    // `replaceState`, а не `pushState`: запись истории на каждый пункт
    // превратила бы «Назад» в отмену прокрутки вместо возврата на страницу.
    history.replaceState(null, '', `#${id}`)
  }

  if (props.focusTarget)
    focusSection(id)

  if (event)
    emit('select', id, event)
}

function onItemClick(id: string, event: MouseEvent): void {
  if (!anchorClickHandled(event))
    return

  event.preventDefault()
  activate(id, event)
}

defineExpose({
  active: spy.active,
  scrollTo: spy.scrollTo,
  refresh: spy.refresh,
})

if (__GR_DEV__) {
  watchEffect(() => {
    if (!Array.isArray(props.sections)) {
      console.warn(
        `[granularity] GrScrollSpy: обязательный проп \`sections\` должен быть массивом — получено ${String(props.sections)}.`,
      )
    }
  })
}
</script>

<template>
  <!--
    Пустой список не рендерит ничего: пустой лендмарк `navigation` шумит в
    списке ориентиров у диктора, не давая взамен ни одной цели.
  -->
  <nav
    v-if="Array.isArray(sections) && sections.length > 0"
    ref="rootEl"
    data-gr-scroll-spy
    :aria-label="label"
    :class="scrollSpyRootClass"
    :style="rootStyle"
  >
    <!--
      `role="list"` обязателен: снятый `list-style` отнимает у списка роль в
      WebKit, и оглавление перестаёт объявляться списком.
    -->
    <ul role="list" :class="scrollSpyListClass">
      <li
        v-for="section in sections"
        :key="section.id"
        :aria-level="section.level ?? 1"
        :data-level="section.level ?? 1"
        :style="{ paddingInlineStart: `calc(var(--gr-scroll-spy-indent, 0.75rem) * ${(section.level ?? 1) - 1})` }"
      >
        <slot
          name="item"
          :section="section"
          :active="spy.active.value === section.id"
          :ancestor="ancestors.has(section.id)"
          :activate="() => activate(section.id)"
        >
          <a
            :href="`#${section.id}`"
            data-gr-scroll-spy-item
            :data-active="spy.active.value === section.id ? 'true' : undefined"
            :data-ancestor="ancestors.has(section.id) ? 'true' : undefined"
            :aria-current="spy.active.value === section.id ? 'location' : undefined"
            :class="grScrollSpyItemClass(itemState(section.id))"
            @click="onItemClick(section.id, $event)"
          >
            {{ section.label }}
          </a>
        </slot>
      </li>
    </ul>
  </nav>
</template>
