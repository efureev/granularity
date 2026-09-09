<script setup lang="ts">
/**
 * GrSidebar — боковая панель приложения с опциональным заголовком, кнопкой
 * сворачивания и слотом контента (обычно — список `GrSidebarItem`).
 *
 * - Свёрнутое состояние (`collapsed`, поддерживает `v-model:collapsed`) сужает
 *   панель до иконочной ширины; `GrSidebarItem`'ы через inject показывают только
 *   иконку (или первую букву метки).
 * - Кнопка тогла (`show-toggle-button`) переключает состояние.
 * - Хедер рендерится только если есть `title`/`subtitle` (или кнопка тогла) —
 *   иначе панель начинается сразу с контента.
 * - Слоты `#title` / `#subtitle` имеют приоритет над одноимёнными пропами.
 */
import { computed, provide, ref, watch } from 'vue'

import GrButton from '../GrButton/GrButton.vue'
import GrIcon from '../GrIcon/GrIcon.vue'
import IconChevronLeft from '~icons/lucide/chevron-left'
import IconChevronRight from '~icons/lucide/chevron-right'
import { useModalOverlay } from '../../composables/internal/useModalOverlay'
import { useGranularityTranslations } from '../../internal/granularityI18n'
import IconClose from '~icons/lucide/x'

import {
  contentBase,
  grSidebarCollapseDirection,
  grSidebarRootClass,
  headerBase,
  layerBackdropClass,
  layerPanelEnterFrom,
  layerPanelPositions,
  layerPassThroughClass,
  layerRootClass,
  subtitleClass,
  titleClass,
  type GrSidebarLandmark,
  type GrSidebarPosition,
} from './grSidebarStyles'
import { GR_SIDEBAR_KEY } from './sidebarContext'

export type { GrSidebarLandmark, GrSidebarPosition } from './grSidebarStyles'

export interface GrSidebarProps {
  title?: string
  subtitle?: string
  /** Свёрнутое состояние. Поддерживает `v-model:collapsed`. */
  collapsed?: boolean
  /** Показать кнопку сворачивания/разворачивания в хедере. */
  showToggleButton?: boolean
  /** Ширина в развёрнутом состоянии. */
  width?: string
  /** Ширина в свёрнутом состоянии. */
  collapsedWidth?: string
  /** A11y-лейбл кнопки тогла. Не задан — берётся из локали (`gr.sidebar.*`). */
  toggleLabel?: string
  /** Сторона экрана: граница и направление шеврона зеркалятся. */
  position?: GrSidebarPosition
  /**
   * Лендмарк корня. `complementary` (по умолчанию) — `<aside>`; `navigation` —
   * `<nav>` для панели, которая действительно является навигацией. Вложенный
   * `<nav>` внутрь `<aside>` не заводим: два лендмарка на одну панель засоряют
   * обзор, а панель фильтров навигацией не является вовсе.
   */
  landmark?: GrSidebarLandmark
  /** Имя лендмарка: без него две панели на странице неразличимы. */
  ariaLabel?: string
  /**
   * Панель как модальный слой поверх страницы: подложка, `Esc`, ловушка фокуса,
   * блокировка прокрутки. Для узкого экрана, где колонке места нет.
   *
   * Когда включать — решает приложение: своей системы брейкпоинтов у пакета нет,
   * а спрашивать среду в `setup` нельзя — первый клиентский рендер разошёлся бы
   * с серверным и сломал гидрацию.
   */
  overlay?: boolean
  /** Открыт ли слой. Поддерживает `v-model:open`; без `overlay` не значит ничего. */
  open?: boolean
}

export interface GrSidebarEmits {
  (e: 'update:collapsed', value: boolean): void
  (e: 'update:open', value: boolean): void
}

const props = withDefaults(defineProps<GrSidebarProps>(), {
  title: undefined,
  subtitle: undefined,
  collapsed: false,
  showToggleButton: false,
  width: '240px',
  collapsedWidth: '64px',
  toggleLabel: undefined,
  position: 'left',
  landmark: 'complementary',
  ariaLabel: undefined,
  overlay: false,
  open: false,
})

const { t } = useGranularityTranslations()

defineOptions({
  // Корень компонента — обёртка слоя, а она в обычном режиме `display: contents`
  // и из раскладки исчезает: класс потребителя, севший на неё, не сделал бы
  // ничего. Атрибуты уходят на саму панель явным `v-bind`.
  inheritAttrs: false,
})

const emit = defineEmits<GrSidebarEmits>()

// Локальное состояние с синхронизацией из пропа — поддерживает и controlled
// (`v-model:collapsed`), и uncontrolled (панель сама помнит состояние).
const collapsedState = ref(props.collapsed)
watch(() => props.collapsed, value => (collapsedState.value = value))

function toggle(): void {
  collapsedState.value = !collapsedState.value
  emit('update:collapsed', collapsedState.value)
}

function expand(): void {
  if (!collapsedState.value)
    return

  collapsedState.value = false
  emit('update:collapsed', false)
}

// ————— Модальный слой (узкий экран).

const panelEl = ref<HTMLElement | null>(null)

const openState = ref(props.open)
watch(() => props.open, value => (openState.value = value))

function closeOverlay(): void {
  openState.value = false
  emit('update:open', false)
}

/**
 * Слой активен только вместе с `overlay`: композабл зовётся всегда — условным
 * его сделать нельзя, — но при выключенном режиме открытым не бывает никогда, и
 * ни портал, ни ловушка фокуса не включаются.
 */
const layerOpen = computed(() => props.overlay && openState.value)

const {
  rootEl,
  isMounted,
  isVisible,
  inertAttr,
  layerZIndex,
  portalTarget,
  teleportEnabled,
  themeAttrs,
  backdrop,
  onPanelAfterLeave,
} = useModalOverlay(layerOpen, closeOverlay, { panel: panelEl })

/**
 * Портал включается только под слой. В обычном режиме панель обязана остаться
 * там, где её поставил потребитель: она часть его раскладки, а не всплывающий
 * элемент.
 *
 * До монтирования слой не рисуется вовсе — ни панели, ни подложки. Иначе первый
 * клиентский рендер показал бы модальную панель прямо в потоке страницы: телепорт
 * включается только после монтирования, чтобы совпасть с серверным рендером.
 *
 * `isMounted` здесь обязателен: корень слоя растянут на весь экран, и оставь мы
 * его при закрытой панели, страница получила бы невидимую плёнку, перехватывающую
 * все клики.
 */
const layerActive = computed(() => props.overlay && teleportEnabled.value && isMounted.value)

/**
 * В слое панель показывается целиком: рейл шириной в иконку внутри модального
 * окна — это половина экрана, потраченная на пустоту. Поэтому свёрнутость там
 * игнорируется.
 */
const effectiveCollapsed = computed(() => collapsedState.value && !props.overlay)

/**
 * Кнопка в шапке меняет смысл вместе с режимом: в колонке она сворачивает
 * панель, в слое — закрывает его. Сворачивать там нечего, а закрыть иначе можно
 * только `Esc` или подложкой.
 */
function onHeaderButton(): void {
  if (props.overlay)
    closeOverlay()
  else toggle()
}

// Даём `GrSidebarItem`'ам знать про свёрнутость.
provide(GR_SIDEBAR_KEY, {
  collapsed: effectiveCollapsed,
  position: computed(() => props.position),
  expand,
})

const hasTitle = computed(() => Boolean(props.title))
const hasSubtitle = computed(() => Boolean(props.subtitle))
const showHeader = computed(() => Boolean(hasTitle.value || hasSubtitle.value || props.showToggleButton))

const asideStyle = computed(() => ({
  width: collapsedState.value ? props.collapsedWidth : props.width,
}))

const resolvedToggleLabel = computed(() => props.toggleLabel ?? (collapsedState.value
  ? t('gr.sidebar.expand', 'Expand sidebar')
  : t('gr.sidebar.collapse', 'Collapse sidebar')))

const rootTag = computed(() => (props.landmark === 'navigation' ? 'nav' : 'aside'))
const rootClass = computed(() => grSidebarRootClass(props.position))

const collapseDirection = computed(() => grSidebarCollapseDirection(props.position, collapsedState.value))
const collapseIcon = computed(() => (collapseDirection.value === 'right' ? IconChevronRight : IconChevronLeft))

defineSlots<{
  /** Содержимое панели: навигация, группы, произвольная разметка. */
  default?: () => any
  /** Заголовок шапки вместо пропа `title`. */
  title?: () => any
  /** Подзаголовок под заголовком. */
  subtitle?: () => any
}>()
</script>

<template>
  <teleport :to="portalTarget" :disabled="!layerActive">
    <!--
      Обёртка слоя рисуется всегда, но вне режима `overlay` она `display:
      contents` и из раскладки исчезает. Так панель со своей шапкой описана один
      раз на оба режима: продублируй мы её, две копии разошлись бы молча.
    -->
    <div
      ref="rootEl"
      :data-gr-sidebar-layer="layerActive ? '' : undefined"
      :data-gr-overlay-root="layerActive ? '' : undefined"
      :role="layerActive ? 'dialog' : undefined"
      :aria-modal="layerActive ? 'true' : undefined"
      :aria-label="layerActive ? ariaLabel : undefined"
      :class="layerActive ? layerRootClass : layerPassThroughClass"
      :style="layerActive ? { zIndex: layerZIndex } : undefined"
      :inert="inertAttr"
    >
      <Transition
        enter-active-class="transition-opacity duration-[var(--gr-duration-base)] ease-[var(--gr-ease-out)]"
        enter-from-class="opacity-0"
        leave-active-class="transition-opacity duration-[var(--gr-duration-fast)] ease-[var(--gr-ease-in)]"
        leave-to-class="opacity-0"
      >
        <div
          v-if="layerActive && isVisible"
          data-gr-sidebar-backdrop
          :class="layerBackdropClass"
          aria-hidden="true"
          v-on="backdrop"
        />
      </Transition>

      <Transition
        enter-active-class="transition-transform duration-[var(--gr-duration-base)] ease-[var(--gr-ease-out)]"
        :enter-from-class="layerPanelEnterFrom[position]"
        leave-active-class="transition-transform duration-[var(--gr-duration-fast)] ease-[var(--gr-ease-in)]"
        :leave-to-class="layerPanelEnterFrom[position]"
        @after-leave="onPanelAfterLeave"
      >
        <component
          :is="rootTag"
          v-if="overlay ? (layerActive && isVisible) : true"
          ref="panelEl"
          v-bind="{ ...$attrs, ...(layerActive ? themeAttrs : {}) }"
          data-gr-sidebar
          :data-collapsed="effectiveCollapsed ? 'true' : undefined"
          :data-position="position"
          :aria-label="ariaLabel"
          :class="[rootClass, layerActive ? layerPanelPositions[position] : '']"
          :style="asideStyle"
        >
    <div
      v-if="showHeader"
      data-gr-sidebar-header
      :class="[headerBase, collapsedState ? 'justify-center' : 'justify-between']"
    >
      <div
        v-if="!collapsedState && (hasTitle || hasSubtitle || $slots.title || $slots.subtitle)"
        class="min-w-0"
      >
        <div
          v-if="$slots.subtitle || hasSubtitle"
          data-gr-sidebar-subtitle
          :class="subtitleClass"
        >
          <slot name="subtitle">
            {{ subtitle }}
          </slot>
        </div>
        <div
          v-if="$slots.title || hasTitle"
          data-gr-sidebar-title
          :class="titleClass"
        >
          <slot name="title">
            {{ title }}
          </slot>
        </div>
      </div>

      <GrButton
        v-if="showToggleButton"
        data-gr-sidebar-toggle
        variant="ghost"
        size="sm"
        square
        :aria-label="resolvedToggleLabel"
        :aria-expanded="overlay ? undefined : (collapsedState ? 'false' : 'true')"
        :data-direction="overlay ? undefined : collapseDirection"
        @click="onHeaderButton"
      >
        <GrIcon :size="16">
          <component :is="overlay ? IconClose : collapseIcon" />
        </GrIcon>
      </GrButton>
    </div>

        <div
          data-gr-sidebar-content
          tabindex="0"
          :class="[contentBase, effectiveCollapsed ? 'p-2' : 'p-3']"
        >
          <slot />
        </div>
        </component>
      </Transition>
    </div>
  </teleport>
</template>
