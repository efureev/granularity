<script setup lang="ts">
import { computed, ref, useId, watch } from 'vue'

import GrButton from '../GrButton/GrButton.vue'
import GrIcon from '../GrIcon/GrIcon.vue'
import { useGrComponentProp } from '../GrConfigProvider/context'
import { useGranularityTranslations } from '../../internal/granularityI18n'
// Модальный слой целиком: стек (Esc верхнему, `inert` нижним модалкам), ловушка
// фокуса, скролл-лок, портал. Немодальная панель регистрируется в стеке как
// обычный dismissible-слой и страницу под собой не трогает.
import { useModalOverlay } from '../../composables/internal/useModalOverlay'
import {
  DEFAULT_GR_DRAWER_BODY_CONFIG,
  DEFAULT_GR_DRAWER_FOOTER_CONFIG,
  DEFAULT_GR_DRAWER_HEADER_CONFIG,
  footerBorderClass,
  grDrawerAxis,
  grDrawerPanelClass,
  grDrawerPanelEnterFrom,
  headerBorderClass,
  overlayClass,
  resolveGrDrawerSectionConfig,
  rootClass,
  rootPassThroughClass,
  srOnlyTitleClass,
  titleClass,
  type GrDrawerSectionConfig,
  type GrDrawerSide,
  type GrDrawerSize,
} from './grDrawerStyles'

import IconClose from '~icons/lucide/x'

import './defaults'

export interface GrDrawerProps {
  /** Контроль открытия через v-model. */
  modelValue: boolean
  /** Заголовок; если передан — покажется в хедере. Можно переопределить слотом `#title`. */
  title?: string
  /**
   * Модальная панель: подложка, блокировка скролла, `inert` остальной странице
   * и ловушка фокуса. `false` — панель живёт рядом со страницей: с ней работают,
   * не закрывая, а Tab уходит наружу.
   */
  modal?: boolean
  /** Закрывать при клике по бэкдропу. В немодальном режиме подложки нет. */
  closeOnBackdrop?: boolean
  /** Закрывать по Esc. */
  closeOnEsc?: boolean
  /**
   * Запрет закрытия «мягкими» способами (бэкдроп, Esc) — на время операции,
   * которую нельзя бросить на полпути. Кнопка закрытия при этом остаётся:
   * панель без единого выхода — ловушка.
   */
  persistent?: boolean
  /** Сторона, с которой выезжает панель. */
  side?: GrDrawerSide
  /** Размер панели по её оси: ширина у боковых, высота у верхней и нижней. */
  size?: GrDrawerSize
  /** Произвольная ширина боковой панели. Число трактуется как пиксели; сильнее `size`. */
  width?: string | number
  /** Произвольная высота верхней или нижней панели. Число трактуется как пиксели. */
  height?: string | number
  /** Рендерить ли хедер (заголовок + кнопка закрытия). */
  showHeader?: boolean
  /** Рендерить ли кнопку закрытия в хедере. */
  showCloseButton?: boolean
  /** Паддинги и рамка секций — как у `GrDialog`. */
  headerConfig?: GrDrawerSectionConfig
  bodyConfig?: GrDrawerSectionConfig
  footerConfig?: GrDrawerSectionConfig
  /** Элемент, получающий фокус при открытии. По умолчанию — сама панель. */
  initialFocus?: HTMLElement | null
  /** i18n-friendly aria-label для кнопки закрытия. */
  closeLabel?: string
}

export interface GrDrawerEmits {
  (e: 'update:modelValue', value: boolean): void
  /** Панель выехала и анимация закончилась. */
  (e: 'opened'): void
  /** Панель уехала и анимация закончилась. */
  (e: 'closed'): void
}

// Дефолты оформления намеренно `undefined`: «настоящий» дефолт живёт в
// `useGrComponentProp`, иначе `GrConfigProvider` не отличит заданный
// пользователем проп от подставленного Vue.
const props = withDefaults(defineProps<GrDrawerProps>(), {
  title: undefined,
  modal: true,
  closeOnBackdrop: true,
  closeOnEsc: true,
  persistent: false,
  side: undefined,
  size: undefined,
  width: undefined,
  height: undefined,
  showHeader: true,
  showCloseButton: true,
  headerConfig: undefined,
  bodyConfig: undefined,
  footerConfig: undefined,
  initialFocus: null,
  closeLabel: undefined,
})

const { t } = useGranularityTranslations()
const resolvedCloseLabel = computed(() => props.closeLabel ?? t('gr.common.close', 'Close'))

const emit = defineEmits<GrDrawerEmits>()

const slots = defineSlots<{
  default?: () => any
  title?: () => any
  /** Своя шапка целиком: заголовок, кнопка закрытия и всё, что нужно рядом. */
  header?: (props: { title?: string, close: () => void }) => any
  footer?: () => any
}>()

const titleId = useId()

const size = useGrComponentProp('GrDrawer', 'size', () => props.size, 'md')
const side = useGrComponentProp('GrDrawer', 'side', () => props.side, 'right')

const axis = computed(() => grDrawerAxis(side.value))

// Пустой/пробельный заголовок считается отсутствующим — иначе хедер занимал бы
// место ради строки-заглушки.
const resolvedTitle = computed(() => props.title?.trim() || undefined)
const hasTitle = computed(() => Boolean(resolvedTitle.value) || Boolean(slots.title))
const hasCustomHeader = computed(() => Boolean(slots.header))
const hasHeader = computed(() =>
  props.showHeader && (hasCustomHeader.value || hasTitle.value || props.showCloseButton),
)

/**
 * Видимый заголовок рисуется только в стандартной шапке. Со своей шапкой и без
 * шапки вовсе заголовок всё равно нужен — но скрытым: имя слоя обязано остаться
 * осмысленным, а не свалиться на обобщённое «Drawer» из локали.
 */
const showVisibleTitle = computed(() =>
  props.showHeader && !hasCustomHeader.value && hasTitle.value,
)
const showSrOnlyTitle = computed(() => hasTitle.value && !showVisibleTitle.value)

// Имя модального слоя обязательно: без него axe роняет `aria-dialog-name`.
// Есть заголовок — связываем `aria-labelledby`, иначе даём `aria-label` из i18n.
const labelledBy = computed(() => (hasTitle.value ? titleId : undefined))
const ariaLabel = computed(() => (labelledBy.value ? undefined : t('gr.drawer.title', 'Drawer')))

const panelEl = ref<HTMLElement | null>(null)

/** Произвольный размер — только по оси панели: у боковой ширина, у нижней высота. */
const customLength = computed(() => (axis.value === 'horizontal' ? props.width : props.height))

const panelClass = computed(() => grDrawerPanelClass({
  side: side.value,
  size: size.value,
  hasCustomLength: customLength.value !== undefined,
}))

const panelStyle = computed(() => {
  const length = customLength.value
  if (length === undefined) return undefined

  const value = typeof length === 'number' ? `${length}px` : length
  return axis.value === 'horizontal' ? { width: value } : { height: value }
})

// Проп не своей оси молча не работал бы — а выглядит это как баг компонента.
if (__GR_DEV__) {
  watch(
    [axis, () => props.width, () => props.height],
    ([currentAxis, width, height]) => {
      const ignored = currentAxis === 'horizontal' ? 'height' : 'width'
      const value = currentAxis === 'horizontal' ? height : width
      if (value === undefined) return

      console.warn(
        `[GrDrawer] Проп \`${ignored}\` не применяется к стороне "${side.value}": `
        + `панель по этой оси растянута. Задайте \`${ignored === 'height' ? 'width' : 'height'}\`.`,
      )
    },
    { immediate: true },
  )
}

const panelEnterFrom = computed(() => grDrawerPanelEnterFrom(side.value))

const headerSection = computed(() => resolveGrDrawerSectionConfig(props.headerConfig, DEFAULT_GR_DRAWER_HEADER_CONFIG))
const bodySection = computed(() => resolveGrDrawerSectionConfig(props.bodyConfig, DEFAULT_GR_DRAWER_BODY_CONFIG))
const footerSection = computed(() => resolveGrDrawerSectionConfig(props.footerConfig, DEFAULT_GR_DRAWER_FOOTER_CONFIG))

function sectionClass(
  section: { paddingX: string, paddingY: string, bordered: boolean },
  borderClass: string,
): string[] {
  return [section.paddingX, section.paddingY, section.bordered ? borderClass : '']
}

function close(): void {
  emit('update:modelValue', false)
}

/** Закрытие «мягким» способом: бэкдроп или Esc. `persistent` их и запрещает. */
function closeSoftly(): void {
  if (props.persistent)
    return

  close()
}

const rootClasses = computed(() => [rootClass, props.modal ? '' : rootPassThroughClass].filter(Boolean))

// Немодальная панель остаётся в очереди Esc, но модалки под собой в `inert` не
// отправляет и скролл не блокирует: она существует ровно ради работы со
// страницей под ней, и Tab обязан уводить фокус туда.
const {
  rootEl,
  isMounted,
  isVisible,
  inertAttr,
  portalTarget,
  teleportEnabled,
  themeAttrs,
  onPanelAfterLeave: releasePresence,
  backdrop,
} = useModalOverlay(computed(() => props.modelValue), closeSoftly, {
  panel: panelEl,
  modal: () => props.modal,
  closeOnEscape: () => props.closeOnEsc && !props.persistent,
  closeOnBackdrop: () => props.closeOnBackdrop,
  initialFocus: () => props.initialFocus ?? panelEl.value,
})

function onPanelAfterLeave(): void {
  releasePresence()
  emit('closed')
}

defineExpose({
  /** Закрыть панель (эквивалент `v-model = false`), минуя `persistent`. */
  close,
  /** Вернуть фокус на панель — например после операции, уведшей его наружу. */
  focus: () => panelEl.value?.focus(),
})
</script>

<template>
  <teleport :to="portalTarget" :disabled="!teleportEnabled">
    <div
      v-if="teleportEnabled && isMounted"
      ref="rootEl"
      data-gr-drawer
      data-gr-overlay-root
      role="dialog"
      :aria-modal="modal ? 'true' : undefined"
      :class="rootClasses"
      :inert="inertAttr"
      :aria-labelledby="labelledBy"
      :aria-label="ariaLabel"
    >
      <Transition
        appear
        enter-active-class="duration-[var(--gr-duration-base)] ease-[var(--gr-ease-out)]"
        enter-from-class="opacity-0"
        leave-active-class="duration-[var(--gr-duration-fast)] ease-[var(--gr-ease-in)]"
        leave-to-class="opacity-0"
      >
        <div
          v-if="isVisible && modal"
          data-gr-drawer-overlay
          :class="overlayClass"
          aria-hidden="true"
          v-on="backdrop"
        />
      </Transition>

      <Transition
        appear
        enter-active-class="duration-[var(--gr-duration-base)] ease-[var(--gr-ease-out)]"
        :enter-from-class="panelEnterFrom"
        leave-active-class="duration-[var(--gr-duration-fast)] ease-[var(--gr-ease-in)]"
        :leave-to-class="panelEnterFrom"
        @after-enter="emit('opened')"
        @after-leave="onPanelAfterLeave"
      >
        <div
          v-if="isVisible"
          ref="panelEl"
          v-bind="themeAttrs"
          data-gr-drawer-panel
          tabindex="-1"
          :class="panelClass"
          :style="panelStyle"
        >
          <!-- Заголовок без видимой шапки: имя слоя обязано остаться своим. -->
          <div
            v-if="showSrOnlyTitle"
            :id="titleId"
            data-gr-drawer-title
            :class="srOnlyTitleClass"
          >
            <slot name="title">
              {{ resolvedTitle }}
            </slot>
          </div>

          <div
            v-if="hasHeader"
            data-gr-drawer-header
            :class="[hasCustomHeader ? '' : 'flex items-center justify-between gap-4', sectionClass(headerSection, headerBorderClass)]"
          >
            <slot name="header" :title="resolvedTitle" :close="close">
              <div
                v-if="showVisibleTitle"
                :id="titleId"
                data-gr-drawer-title
                :class="titleClass"
              >
                <slot name="title">
                  {{ resolvedTitle }}
                </slot>
              </div>
              <div v-else class="min-w-0 flex-1" />

              <GrButton
                v-if="showCloseButton"
                variant="ghost"
                size="sm"
                square
                data-gr-drawer-close
                :aria-label="resolvedCloseLabel"
                @click="close"
              >
                <GrIcon size="sm">
                  <IconClose />
                </GrIcon>
              </GrButton>
            </slot>
          </div>

          <!-- Тело скроллится, поэтому обязано попадать в таб-порядок: длинный
               текст без единого фокусируемого элемента иначе не прокрутить с
               клавиатуры (axe: `scrollable-region-focusable`). -->
          <div
            data-gr-drawer-body
            tabindex="0"
            class="min-h-0 flex-1 overflow-y-auto"
          >
            <div :class="sectionClass(bodySection, '')">
              <slot />
            </div>
          </div>

          <div
            v-if="$slots.footer"
            data-gr-drawer-footer
            :class="sectionClass(footerSection, footerBorderClass)"
          >
            <slot name="footer" />
          </div>
        </div>
      </Transition>
    </div>
  </teleport>
</template>
