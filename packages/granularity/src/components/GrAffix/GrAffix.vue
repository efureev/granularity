<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

import {
  type GrAffixAncestor,
  type GrAffixPlacement,
  affixOffsetLength,
  affixRootMargin,
  isAffixStuck,
  scanAffixAncestors,
} from './affixState'
import { affixSentinelClass, grAffixRootClass } from './grAffixStyles'

/**
 * GrAffix — панель, прилипающая к краю при прокрутке: заголовок раздела,
 * оглавление, кнопки «Сохранить/Отмена» под длинной формой.
 *
 * Позиционирует `position: sticky`; наблюдатель нужен только чтобы **узнать**,
 * прилипла ли панель, — от этого зависят фон, тень и содержимое. Отлипшая панель
 * стоит внутри формы и обязана выглядеть её частью, поэтому поверхность
 * включается вместе с состоянием, а не всегда, как у `GrNavbar` и `GrTable`.
 *
 * Корень компонента — сама липкая коробка, а не обёртка вокруг неё: `sticky`
 * зажат своим containing block, и обёртка высотой в коробку не дала бы ей ехать
 * вовсе. Сентинел — сосед коробки, отмечающий её место в потоке.
 */
export interface GrAffixProps {
  /** Край, к которому прилипает панель. */
  placement?: GrAffixPlacement
  /**
   * Отступ от края в прилипшем состоянии. Число — пиксели, строка — как есть
   * (`4rem`, `var(--gr-navbar-height)`, `calc(…)`).
   *
   * Общий отступ для группы панелей задаётся не пропом, а токеном
   * `--gr-affix-offset` на контейнере или на `:root`: наблюдатель читает
   * вычисленный стиль и подхватывает его так же, как значение пропа.
   */
  offset?: number | string
  /**
   * Прилипание выключено: разметка та же, `sticky` не ставится.
   *
   * Именно проп, а не `v-if` снаружи: размонтирование убило бы фокус на кнопке
   * панели и состояние вложенных контролов.
   */
  disabled?: boolean
}

export interface GrAffixEmits {
  (e: 'stickyChange', stuck: boolean): void
}

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<GrAffixProps>(), {
  placement: 'top',
  offset: undefined,
  disabled: false,
})

const emit = defineEmits<GrAffixEmits>()

defineSlots<{
  /** Содержимое панели. `stuck` позволяет менять его в прилипшем виде. */
  default?: (props: { stuck: boolean }) => unknown
}>()

const boxEl = ref<HTMLElement | null>(null)
const sentinelTopEl = ref<HTMLElement | null>(null)
const sentinelBottomEl = ref<HTMLElement | null>(null)

const sentinelEl = computed(() => (
  props.placement === 'top' ? sentinelTopEl.value : sentinelBottomEl.value
))

const stuck = ref(false)

/**
 * Наблюдателя в этой среде нет вовсе (сервер, jsdom, старый движок). Тогда
 * `sticky` продолжает работать — его делает CSS, — но знание о состоянии
 * пропадает, и поверхность включается всегда. Прилипшая прозрачная панель
 * пропускает сквозь себя строки; всегда непрозрачная просто чуть более
 * декоративна, чем нужно. Из двух деградаций выбрана вторая.
 */
const observerMissing = ref(false)

const surfaceOn = computed(() => !props.disabled && (stuck.value || observerMissing.value))

const rootClass = computed(() => grAffixRootClass(props.placement, !props.disabled, surfaceOn.value))

const rootStyle = computed(() => {
  const length = affixOffsetLength(props.offset)

  return length === undefined ? undefined : { '--gr-affix-offset': length }
})

let observer: IntersectionObserver | null = null
let appliedOffsetPx = 0
let warned = false

/**
 * Отступ берётся из вычисленного стиля, а не из пропа, по трём причинам:
 * браузер уже разрешил `4rem`/`var()`/`calc()` в used value, и свой парсер CSS
 * не нужен; отступ может прийти не из пропа вовсе, а из каскада; у `sticky`
 * `getComputedStyle().top` возвращает заданный порог прилипания, а не смещённую
 * позицию, то есть ровно нужное число.
 */
function measureOffsetPx(): number {
  const box = boxEl.value
  if (!box || typeof getComputedStyle !== 'function')
    return 0

  const parsed = Number.parseFloat(getComputedStyle(box)[props.placement])

  return Number.isFinite(parsed) ? Math.max(0, parsed) : 0
}

function describeElement(el: HTMLElement): string {
  const tag = el.tagName.toLowerCase()
  const classes = el.getAttribute('class')?.trim().split(/\s+/).slice(0, 2) ?? []

  return classes.length > 0 ? `<${tag} class="${classes.join(' ')}…">` : `<${tag}>`
}

/**
 * Цепочка предков до `<body>`, не включая его.
 *
 * Верхняя граница выбрана не по вкусу: `useScrollLock` вешает
 * `overflow: hidden` на `body` на всё время открытой модалки, и дойди обход
 * туда — каждый аффикс внутри `GrModal` объявлялся бы сломанным, причём только
 * в этом состоянии, то есть через раз.
 */
function collectAncestors(box: HTMLElement): { el: HTMLElement, info: GrAffixAncestor }[] {
  const chain: { el: HTMLElement, info: GrAffixAncestor }[] = []

  if (typeof getComputedStyle !== 'function')
    return chain

  let current = box.parentElement

  while (current && current !== document.body) {
    chain.push({
      el: current,
      info: { overflowY: getComputedStyle(current).overflowY, label: describeElement(current) },
    })
    current = current.parentElement
  }

  return chain
}

function detach(): void {
  observer?.disconnect()
  observer = null
}

function attach(): void {
  detach()

  if (props.disabled) {
    stuck.value = false
    return
  }

  if (typeof IntersectionObserver === 'undefined') {
    observerMissing.value = true
    return
  }

  const box = boxEl.value
  const sentinel = sentinelEl.value
  if (!box || !sentinel)
    return

  const chain = collectAncestors(box)
  const scan = scanAffixAncestors(chain.map(item => item.info))

  // `null`, а не `document.documentElement`: по спецификации это разные корни,
  // и Safari исторически расходился на втором.
  const root = scan.scrollerIndex >= 0 ? chain[scan.scrollerIndex].el : null

  appliedOffsetPx = measureOffsetPx()

  observer = new IntersectionObserver(handle, {
    root,
    rootMargin: affixRootMargin(props.placement, appliedOffsetPx),
    // Сентинел высотой в пиксель пересекает границу целиком — промежуточных
    // долей у него не бывает, и второй порог дал бы вдвое больше вызовов без
    // единой новой развилки.
    threshold: 0,
  })
  observer.observe(sentinel)

  if (__GR_DEV__ && !warned && scan.clipperLabel) {
    warned = true
    console.warn(
      `[granularity] GrAffix: предок ${scan.clipperLabel} задаёт \`overflow\`, отличный от `
      + '`visible`, и прокручивать его нечем — он становится скроллпортом, внутри которого '
      + '`position: sticky` не двигается. Снимите `overflow` с этого предка либо сделайте его '
      + 'настоящим скроллером (`overflow-y: auto` плюс ограничение высоты).',
    )
  }
}

function handle(entries: IntersectionObserverEntry[]): void {
  const entry = entries[entries.length - 1]
  if (!entry)
    return

  const next = isAffixStuck(entry, props.placement, stuck.value)

  // Дедуп по предыдущему булеву — единственная защита от дребезга у границы:
  // гистерезиса нет намеренно, любой эпсилон разошёлся бы с CSS, у которого его
  // нет, и дал бы кадр, где `data-stuck` уже стоит, а панель ещё едет.
  if (next !== stuck.value) {
    stuck.value = next
    emit('stickyChange', next)
  }

  // Самоизлечение: в dev-режиме UnoCSS отдаёт правила по требованию, и в момент
  // монтирования `top` мог ещё не разрешиться — тогда `rootMargin` собран из
  // нуля. Пересобираем наблюдателя, как только замер разошёлся с применённым;
  // повторный вызов даст то же число и цикла не будет.
  if (measureOffsetPx() !== appliedOffsetPx)
    attach()
}

/** Перечитать отступ и пересобрать наблюдателя: `vh` после ресайза, смена высоты шапки. */
function remeasure(): void {
  attach()
}

onMounted(attach)
onBeforeUnmount(detach)

// `flush: 'post'` обязателен: при смене края сентинел переезжает на другую
// сторону коробки, и до обновления DOM ссылка вела бы на снятый узел.
watch(() => [props.placement, props.offset, props.disabled] as const, attach, { flush: 'post' })

defineExpose({ stuck, remeasure })
</script>

<template>
  <div
    v-if="!disabled && placement === 'top'"
    ref="sentinelTopEl"
    data-gr-affix-sentinel
    aria-hidden="true"
    :class="affixSentinelClass.top"
  />

  <div
    ref="boxEl"
    data-gr-affix
    :data-placement="placement"
    :data-stuck="stuck ? 'true' : undefined"
    :class="rootClass"
    :style="rootStyle"
    v-bind="$attrs"
  >
    <slot :stuck="stuck" />
  </div>

  <div
    v-if="!disabled && placement === 'bottom'"
    ref="sentinelBottomEl"
    data-gr-affix-sentinel
    aria-hidden="true"
    :class="affixSentinelClass.bottom"
  />
</template>
