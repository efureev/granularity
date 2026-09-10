<script setup lang="ts">
import { computed, markRaw, useId, useSlots, watch, type Component } from 'vue'

import { useGrComponentProp } from '../GrConfigProvider/context'

import {
  headerActionsClass,
  headerRowClass,
  cardDescriptionClass,
  cardTitleClass,
  grCardRootClass,
  ownHeaderPaddingClass,
  paddingClass,
  sectionDividerBottomClass,
  sectionDividerTopClass,
  type GrCardHeadingLevel,
  type GrCardPadding,
  type GrCardVariant,
} from './grCardStyles'

export type { GrCardHeadingLevel, GrCardPadding, GrCardVariant } from './grCardStyles'

export interface GrCardProps {
  /**
   * Внутренние отступы. По умолчанию `none`: карточка — поверхность, а её
   * содержимое (`GrCollapse`, `GrList`) само знает про свои отступы.
   */
  padding?: GrCardPadding
  /** `elevated` — рамка, фон и тень; `outlined` — без тени; `ghost` — без рамки. */
  variant?: GrCardVariant
  /**
   * Свой корневой тег: компонент-ссылка (`RouterLink`, `Link` от Inertia) или
   * семантический тег страницы (`section`, `article`, `aside`). Сильнее `href`.
   * Неинтерактивный тег — только замена `div`: ни подсветки, ни кольца фокуса.
   */
  as?: string | Component
  /** Карточка-ссылка. */
  href?: string
  /**
   * Имя карточки как области страницы: `role="region"` плюс `aria-label`.
   * Безымянная `<section>` для скринридера — обычный контейнер, и это норма:
   * именованных областей на страницу нужно немного, иначе их обзор перестаёт
   * помогать. Интерактивной карточке не даётся — `role="region"` на `<button>`
   * невалиден.
   */
  regionLabel?: string
  /** Карточка-кнопка: интерактивна вся поверхность. */
  clickable?: boolean
  /** Подсветка при наведении без интерактивности. */
  hoverable?: boolean
  /** Классы обёртки тела — она появляется вместе с секциями. */
  bodyClass?: string
  /**
   * Заголовок карточки — настоящий `h2`…`h6`, а не жирная строка: отчёт из
   * шести карточек иначе не обойти по структуре, после `h1` страницы в нём
   * нет ни одного заголовка.
   */
  title?: string
  /** Пояснение под заголовком. */
  description?: string
  /** Уровень заголовка под структуру страницы. Не задан — из `GrConfigProvider`, иначе `3`. */
  headingLevel?: GrCardHeadingLevel
}

export interface GrCardEmits {
  (e: 'click', event: MouseEvent): void
}

const props = withDefaults(defineProps<GrCardProps>(), {
  // Настраивается через `GrConfigProvider`; дефолты — в резолверах ниже.
  padding: undefined,
  variant: undefined,
  as: undefined,
  href: undefined,
  regionLabel: undefined,
  clickable: false,
  hoverable: false,
  bodyClass: undefined,
  title: undefined,
  description: undefined,
  headingLevel: undefined,
})

const emit = defineEmits<GrCardEmits>()

const slots = useSlots()

const resolvedPadding = useGrComponentProp('GrCard', 'padding', () => props.padding, 'none')
const resolvedVariant = useGrComponentProp('GrCard', 'variant', () => props.variant, 'elevated')

const rootTag = computed<string | Component>(() => {
  if (props.as)
    return typeof props.as === 'string' ? props.as : markRaw(props.as)

  if (props.href)
    return 'a'

  return props.clickable ? 'button' : 'div'
})

/**
 * Интерактивность даёт разрешённый тег, а не сам факт `as`: `as="section"` —
 * замена `div` ради семантики страницы, и карточка обязана остаться такой же
 * поверхностью. Компонент-ссылка (`RouterLink`, `Link` от Inertia) рендерит
 * `<a>` сам, но узнать это до рендера нельзя — его считаем интерактивным.
 */
const isInteractive = computed(() => {
  const tag = rootTag.value

  return typeof tag === 'string' ? isFocusableTag(tag) : true
})

/** Теги, попадающие в таб-порядок сами. `<a>` — только со ссылкой. */
function isFocusableTag(tag: string): boolean {
  return tag === 'button' || (tag === 'a' && !!props.href)
}

if (__GR_DEV__) {
  watch(
    () => [props.as, isInteractive.value] as const,
    ([as, interactive]) => {
      if (interactive || typeof as !== 'string' || !(props.clickable || props.href))
        return

      console.warn(
        `[GrCard] as="${as}" не попадает в таб-порядок: карточка кликается мышью, `
        + 'но не с клавиатуры. Возьмите тег, умеющий фокус (`button`, `a` со ссылкой), '
        + 'или компонент роутера — либо снимите `clickable`/`href`.',
      )
    },
    { immediate: true },
  )
}

/**
 * Компонент-ссылка (`Link` от Inertia, `RouterLink`) рендерит `<a>` сам, и без
 * `href` он ведёт в никуда. Строковый тег, кроме `a`, атрибут не понимает —
 * там он и гасится.
 */
const rootHref = computed(() => (
  typeof rootTag.value === 'string' && rootTag.value !== 'a' ? undefined : props.href
))

const headingLevel = useGrComponentProp('GrCard', 'headingLevel', () => props.headingLevel, 3)

/**
 * Заголовок внутри `<button>` невалиден: контент-модель кнопки — phrasing
 * content. Кликабельная карточка печатает подпись `<span>`, а структура
 * страницы в этом случае собирается ссылкой в заголовке рядом с `hoverable`.
 */
let headingInButtonWarned = false

const headingTag = computed(() => {
  if (rootTag.value !== 'button')
    return `h${headingLevel.value}`

  if (!headingInButtonWarned && __GR_DEV__) {
    headingInButtonWarned = true
    console.warn(
      '[GrCard] `title` внутри `clickable` печатается `<span>`: заголовок в '
      + '`<button>` невалиден по HTML. Нужен заголовок в структуре страницы — '
      + 'замените `clickable` на `hoverable` и поставьте ссылку в сам заголовок.',
    )
  }

  return 'span'
})

const titleId = useId()
const descriptionId = useId()

// `#header` сильнее пропов: нестандартная шапка не обязана объяснять, почему
// она не `title`.
const hasOwnHeader = computed(() => Boolean(slots.header))
const hasTitle = computed(() => !hasOwnHeader.value && Boolean(props.title))
const hasDescription = computed(() => !hasOwnHeader.value && Boolean(props.description))
/**
 * Действия рисуются в **собственной** шапке карточки и включают её наравне с
 * заголовком. Без этого слота карточке с кнопкой приходилось забирать `#header`
 * целиком — а вместе с ним заново писать заголовок, его уровень и отступы. К
 * этому обходу независимо пришли `GrDashboardItem` в этом же кольце и обёртки
 * потребителей; оба теряли настоящий `h2…h6` и шкалу отступов.
 */
const hasActions = computed(() => !hasOwnHeader.value && Boolean(slots.actions))
const hasHeadingBlock = computed(() => hasTitle.value || hasDescription.value || hasActions.value)

/**
 * Обёртки появляются, только когда их попросили: карточка без секций остаётся
 * одним `<div>` со слотом внутри — ровно тем, что рендерили `GrCollapse` и
 * `GrList` до появления пропов.
 */
const hasSections = computed(() => Boolean(
  slots.header || slots.footer || slots.actions || props.bodyClass || hasHeadingBlock.value,
))

/**
 * Имя карточки-ссылки. Без него доступным именем становится всё содержимое
 * подряд — заголовок, описание и тело одной строкой.
 */
const rootLabelledBy = computed(() => (isInteractive.value && hasTitle.value ? titleId : undefined))
const rootDescribedBy = computed(() => (isInteractive.value && hasDescription.value ? descriptionId : undefined))

/**
 * У интерактивной карточки имя уже есть — заголовок через `aria-labelledby`, и
 * `aria-label` его бы перебил. Роль области поверх `<button>` вдобавок
 * невалидна.
 */
const rootRegionLabel = computed(() => (isInteractive.value ? undefined : props.regionLabel))

if (__GR_DEV__) {
  watch(
    () => [props.regionLabel, isInteractive.value] as const,
    ([regionLabel, interactive]) => {
      if (!regionLabel || !interactive)
        return

      console.warn(
        '[GrCard] `regionLabel` на интерактивной карточке игнорируется: '
        + '`role="region"` поверх `<button>`/`<a>` невалиден, а имя ссылке даёт '
        + 'заголовок. Область страницы — неинтерактивная карточка (`as=\"section\"`).',
      )
    },
    { immediate: true },
  )
}

const rootClass = computed(() => grCardRootClass({
  variant: resolvedVariant.value,
  // С секциями отступ принадлежит каждой из них, а не поверхности целиком.
  padding: hasSections.value ? 'none' : resolvedPadding.value,
  interactive: isInteractive.value,
  hoverable: props.hoverable,
}))

const sectionPaddingClass = computed(() => paddingClass[resolvedPadding.value])

/**
 * Карточка отбивает то, что рисует сама. Шапка из `title` — её собственная, и
 * отступ ей полагается независимо от `padding`. Слот `#header` сильнее пропов и
 * заменяет шапку целиком: там отступы принадлежат тому, кто её наполнил, —
 * иначе потребитель со своими отступами внутри слота получил бы двойные.
 */
const headerClass = computed(() => [
  hasOwnHeader.value ? sectionPaddingClass.value : ownHeaderPaddingClass,
  sectionDividerBottomClass,
].filter(Boolean).join(' '))
const footerClass = computed(() => [sectionPaddingClass.value, sectionDividerTopClass].filter(Boolean).join(' '))
const bodySectionClass = computed(() => [sectionPaddingClass.value, props.bodyClass].filter(Boolean).join(' '))

function onClick(event: MouseEvent): void {
  emit('click', event)
}

defineSlots<{
  /** Содержимое карточки. */
  default?: () => any
  /** Шапка вместо пропов `title` и `description`. */
  header?: () => any
  /**
   * Действия справа в собственной шапке карточки: «⋯», «Обновить»,
   * переключатель периода. Включают шапку так же, как `title`.
   *
   * Со слотом `#header` не сочетается: тот заменяет шапку целиком, и всё, что в
   * ней есть, рисует потребитель.
   */
  actions?: () => any
  /** Подвал: действия, сводка, пагинация. */
  footer?: () => any
}>()
</script>

<template>
  <component
    :is="rootTag"
    data-gr-card
    :type="rootTag === 'button' ? 'button' : undefined"
    :href="rootHref"
    :class="rootClass"
    :role="rootRegionLabel ? 'region' : undefined"
    :aria-label="rootRegionLabel"
    :aria-labelledby="rootLabelledBy"
    :aria-describedby="rootDescribedBy"
    @click="onClick"
  >
    <template v-if="hasSections">
      <div v-if="hasOwnHeader || hasHeadingBlock" data-gr-card-header :class="headerClass">
        <slot name="header">
          <div :class="hasActions ? headerRowClass : undefined">
            <div class="min-w-0">
              <component
                :is="headingTag"
                v-if="hasTitle"
                :id="titleId"
                data-gr-card-title
                :class="cardTitleClass"
              >
                {{ title }}
              </component>

              <p
                v-if="hasDescription"
                :id="descriptionId"
                data-gr-card-description
                :class="cardDescriptionClass"
              >
                {{ description }}
              </p>
            </div>

            <div v-if="hasActions" data-gr-card-actions :class="headerActionsClass">
              <slot name="actions" />
            </div>
          </div>
        </slot>
      </div>

      <div data-gr-card-body :class="bodySectionClass">
        <slot />
      </div>

      <div v-if="$slots.footer" data-gr-card-footer :class="footerClass">
        <slot name="footer" />
      </div>
    </template>

    <slot v-else />
  </component>
</template>
