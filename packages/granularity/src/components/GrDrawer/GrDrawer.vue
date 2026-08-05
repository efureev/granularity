<script setup lang="ts">
import { computed, onBeforeUnmount, ref, useId, watch } from 'vue'

import { useTeleportEnabled } from '../../composables/internal/useTeleportEnabled'
import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue'

import GrButton from '../GrButton/GrButton.vue'
import GrIcon from '../GrIcon/GrIcon.vue'
import { useGrComponentProp } from '../GrConfigProvider/context'
import { useGranularityTranslations } from '../../internal/granularityI18n'
// Единый стек слоёв: Esc верхнему, `inert` нижним модалкам. Drawer — модальный
// класс (бэкдроп + scroll-lock), поэтому регистрируется как `modal`.
import { useOverlayLayer } from '../../composables/useOverlayLayer'
import { useScrollLock } from '../../composables/internal/useScrollLock'
import {
  DEFAULT_GR_DRAWER_BODY_CONFIG,
  DEFAULT_GR_DRAWER_FOOTER_CONFIG,
  DEFAULT_GR_DRAWER_HEADER_CONFIG,
  footerBorderClass,
  grDrawerPanelClass,
  grDrawerPanelEnterFrom,
  headerBorderClass,
  overlayClass,
  resolveGrDrawerSectionConfig,
  rootClass,
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
  /** Закрывать при клике по бэкдропу / через HeadlessUI close. */
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
  /** Размер панели. Не задан — берётся из `GrConfigProvider`, иначе `md`. */
  size?: GrDrawerSize
  /** Произвольная ширина панели. Число трактуется как пиксели; сильнее `size`. */
  width?: string | number
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

// Дефолты оформления намеренно `undefined`: «настоящий» дефолт живёт в
// `useGrComponentProp`, иначе `GrConfigProvider` не отличит заданный
// пользователем проп от подставленного Vue.
const props = withDefaults(defineProps<GrDrawerProps>(), {
  title: undefined,
  closeOnBackdrop: true,
  closeOnEsc: true,
  persistent: false,
  side: undefined,
  size: undefined,
  width: undefined,
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

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  /** Панель выехала и анимация закончилась. */
  (e: 'opened'): void
  /** Панель уехала и анимация закончилась. */
  (e: 'closed'): void
}>()

const slots = defineSlots<{
  default?: () => any
  title?: () => any
  footer?: () => any
}>()

const titleId = useId()

const size = useGrComponentProp('GrDrawer', 'size', () => props.size, 'md')
const side = useGrComponentProp('GrDrawer', 'side', () => props.side, 'right')

// Пустой/пробельный заголовок считается отсутствующим — иначе хедер занимал бы
// место ради строки-заглушки. Раньше на его месте появлялось слово «Drawer».
const resolvedTitle = computed(() => props.title?.trim() || undefined)
const hasTitle = computed(() => Boolean(resolvedTitle.value) || Boolean(slots.title))
const hasHeader = computed(() => props.showHeader && (hasTitle.value || props.showCloseButton))

// Имя модального слоя обязательно: без него axe роняет `aria-dialog-name`.
// Есть заголовок — связываем `aria-labelledby`, иначе даём `aria-label` из i18n.
const labelledBy = computed(() => (hasHeader.value && hasTitle.value ? titleId : undefined))
const ariaLabel = computed(() => (labelledBy.value ? undefined : t('gr.drawer.title', 'Drawer')))

// SSR-guard: на сервере `document.body` недоступен — отключаем teleport
// (в клиенте включаем после маунта). Раньше `<teleport to="body">` без
// `:disabled` падал при SSR — расхождение с GrModal.
// Телепорт включается только ПОСЛЕ монтирования: иначе первый клиентский
// рендер не совпадает с серверным и ломается гидрация (см. композабл).
const teleportEnabled = useTeleportEnabled()

const panelEl = ref<HTMLElement | null>(null)

const panelClass = computed(() => grDrawerPanelClass({
  side: side.value,
  size: size.value,
  width: props.width,
}))

const panelStyle = computed(() => {
  if (props.width === undefined)
    return undefined

  return { width: typeof props.width === 'number' ? `${props.width}px` : props.width }
})

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

function onDialogClose(): void {
  if (!props.closeOnBackdrop) return
  closeSoftly()
}

function onOverlayClick(): void {
  if (!props.closeOnBackdrop) return
  closeSoftly()
}

// ————— Esc через общий стек оверлеев + scroll-lock, синхронно с открытием.
const { lock: lockBodyScroll, unlock: unlockBodyScroll } = useScrollLock()

const isTopmost = ref(true)
// Нижние модальные слои уходят в `inert`, освобождая фокус верхнему.
const inertAttr = computed(() => (props.modelValue && !isTopmost.value ? '' : undefined))

useOverlayLayer(
  computed(() => props.modelValue),
  closeSoftly,
  {
    modal: true,
    closeOnEscape: () => props.closeOnEsc && !props.persistent,
    onTopmostChange: (value) => { isTopmost.value = value },
    restoreFocus: false,
  },
)

watch(
  () => props.modelValue,
  (value) => {
    if (value) {
      lockBodyScroll()
    }
    else {
      unlockBodyScroll()
    }
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  unlockBodyScroll()
})

defineExpose({
  /** Закрыть панель (эквивалент `v-model = false`), минуя `persistent`. */
  close,
  /** Вернуть фокус на панель — например после операции, уведшей его наружу. */
  focus: () => panelEl.value?.focus(),
})
</script>

<template>
  <teleport to="body" :disabled="!teleportEnabled">
    <TransitionRoot
      :show="modelValue"
      as="template"
      @after-enter="emit('opened')"
      @after-leave="emit('closed')"
    >
      <Dialog
        as="div"
        data-gr-drawer
        :class="rootClass"
        :static="true"
        :inert="inertAttr"
        :initial-focus="initialFocus ?? undefined"
        :aria-labelledby="labelledBy"
        :aria-label="ariaLabel"
        @close="onDialogClose"
      >
        <div class="fixed inset-0">
          <TransitionChild
            as="template"
            enter="duration-200 ease-out"
            enter-from="opacity-0"
            enter-to="opacity-100"
            leave="duration-150 ease-in"
            leave-from="opacity-100"
            leave-to="opacity-0"
          >
            <div
              data-gr-drawer-overlay
              :class="overlayClass"
              aria-hidden="true"
              @click="onOverlayClick"
            />
          </TransitionChild>

          <TransitionChild
            as="template"
            enter="duration-200 ease-out"
            :enter-from="panelEnterFrom"
            enter-to="translate-x-0"
            leave="duration-150 ease-in"
            leave-from="translate-x-0"
            :leave-to="panelEnterFrom"
          >
            <DialogPanel
              ref="panelEl"
              data-gr-drawer-panel
              tabindex="-1"
              class="fixed inset-y-0 flex flex-col"
              :class="panelClass"
              :style="panelStyle"
            >
              <div
                v-if="hasHeader"
                data-gr-drawer-header
                class="flex items-center justify-between gap-4"
                :class="sectionClass(headerSection, headerBorderClass)"
              >
                <DialogTitle
                  v-if="hasTitle"
                  :id="titleId"
                  as="div"
                  data-gr-drawer-title
                  :class="titleClass"
                >
                  <slot name="title">
                    {{ resolvedTitle }}
                  </slot>
                </DialogTitle>
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
                  <GrIcon size="sm" aria-hidden="true">
                    <IconClose />
                  </GrIcon>
                </GrButton>
              </div>

              <div data-gr-drawer-body class="flex-1 overflow-y-auto">
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
            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </TransitionRoot>
  </teleport>
</template>
