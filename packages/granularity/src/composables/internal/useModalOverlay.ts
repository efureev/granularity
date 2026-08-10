import type { ComputedRef, Ref } from 'vue'
import { computed, onBeforeUnmount, ref, watch } from 'vue'

import { useGrThemeAttrs } from '../../components/GrConfigProvider/context'
import { useFocusTrap } from '../useFocusTrap'
import { useOverlayLayer } from '../useOverlayLayer'
import { usePortalTarget } from '../usePortalTarget'
import { useInertOthers } from './useInertOthers'
import { useOverlayPresence } from './useOverlayPresence'
import { useScrollLock } from './useScrollLock'

/**
 * Модальный слой целиком: одна сборка на весь пакет.
 *
 * Модальность собиралась вручную в трёх компонентах (`GrModal`, `GrDrawer`,
 * `GrImageViewer`) из шести примитивов, и сборка повторялась дословно. Дело не
 * в объёме: в этой проводке сидят инварианты, каждый из которых при пропуске
 * даёт тихий баг доступности, а не заметную поломку. Здесь они собраны в одном
 * месте — забыть часть модального слоя больше нельзя.
 *
 * Что именно неочевидно:
 *
 *  - **`restoreFocus: false` у ловушки.** Возврат фокуса принадлежит стеку
 *    слоёв: у него правило строже — вернуть, только если на момент закрытия
 *    фокус ещё был внутри слоя. Две системы возврата подрались бы за фокус.
 *  - **`containers: layer.rootsAbove`.** Панель селекта, открытого ВНУТРИ окна,
 *    телепортирована в `body` и лежит вне поддерева панели. Без этого списка
 *    ловушка считала бы её «снаружи» и отбирала фокус.
 *  - **Ловушка и `inert` работают, только пока слой верхний.** Иначе нижнее
 *    окно ворует фокус у открытого поверх него, а `inert` гасит собственную
 *    панель вместе со страницей.
 *  - **Клик по подложке считается только тот, что на ней и начался.** Иначе
 *    выделение текста мышью или перетаскивание, отпущенное за пределами панели,
 *    закрывает слой.
 *
 * Чего композабл НЕ делает: не рисует разметку. Корневой `div`, подложка и
 * панель у трёх компонентов различаются по существу (обёртки скролла у окна,
 * сквозные клики у немодальной панели, слои хрома у просмотрщика), а классами
 * общий модуль владеть не вправе — пресет гранулярности подмешивает safelist
 * только по директориям выбранных компонентов.
 */
export interface UseModalOverlayOptions {
  /**
   * Модальный ли слой: блокирует страницу, держит фокус, гасит нижние окна.
   * Геттером — там, где модальность включается пропом (`GrDrawer`).
   */
  modal?: boolean | (() => boolean)
  /** Закрывать ли по Esc. Геттер — проп компонента реактивен. */
  closeOnEscape?: () => boolean
  /** Закрывать ли по клику в подложку; читается обработчиками `backdrop`. */
  closeOnBackdrop?: () => boolean
  /** Панель слоя: контейнер ловушки фокуса и её запасной приёмник. */
  panel: Ref<HTMLElement | null>
  /**
   * Кому отдать фокус при открытии. Не задан — первому фокусируемому внутри
   * панели (правило `useFocusTrap`): просмотрщику нужна именно кнопка тулбара,
   * а окну — сама панель, и оно передаёт её явно.
   */
  initialFocus?: () => HTMLElement | null | undefined
  /**
   * Блокировать ли скролл страницы. По умолчанию — пока слой открыт и модален:
   * немодальная панель существует ровно ради работы со страницей под ней.
   */
  lockScroll?: () => boolean
}

export interface ModalOverlay {
  /** Корень слоя: цель `ref` в шаблоне, хозяин `inert` и корень для стека слоёв. */
  rootEl: Ref<HTMLElement | null>
  /** Смонтировано ли поддерево: держится до конца leave-анимации панели. */
  isMounted: Ref<boolean>
  /** Показан ли слой: этим переключаются `<Transition>` внутри. */
  isVisible: Ref<boolean>
  /** Верхний ли это слой сейчас. */
  isTopmost: Ref<boolean>
  /** Значение атрибута `inert` для корня: слой перестал быть верхним. */
  inertAttr: ComputedRef<true | undefined>
  portalTarget: ComputedRef<string | HTMLElement>
  teleportEnabled: ComputedRef<boolean>
  /** `data-theme` на телепортированный корень: в DOM он вне обёртки провайдера. */
  themeAttrs: ComputedRef<{ 'data-theme'?: string }>
  /** Для `@after-leave` панели. Компонент оборачивает, если ему нужен эмит `closed`. */
  onPanelAfterLeave: () => void
  /**
   * Обработчики подложки вместе с guard'ом «клик начался на ней». Имена — под
   * `v-on="backdrop"`: объектный синтаксис ждёт имена событий, а не пропов.
   */
  backdrop: {
    mousedown: (event: MouseEvent) => void
    click: (event: MouseEvent) => void
  }
}

export function useModalOverlay(
  open: Ref<boolean>,
  onDismiss: () => void,
  options: UseModalOverlayOptions,
): ModalOverlay {
  const isModal = (): boolean =>
    typeof options.modal === 'function' ? options.modal() : options.modal ?? true

  const rootEl = ref<HTMLElement | null>(null)
  const isTopmost = ref(true)

  const inertAttr = computed(() => (open.value && isModal() && !isTopmost.value ? true : undefined))

  // Телепорт включается только ПОСЛЕ монтирования: иначе первый клиентский
  // рендер не совпадёт с серверным и сломается гидрация.
  const { target: portalTarget, enabled: teleportEnabled } = usePortalTarget()

  // Панель уезжает в `body`, то есть вне обёртки провайдера, и `data-theme` с
  // неё не наследуется. В дереве компонентов слой остаётся внутри — `inject`
  // доходит, и тему он ставит себе сам.
  const themeAttrs = useGrThemeAttrs()

  const { mounted: isMounted, visible: isVisible, onPanelAfterLeave } = useOverlayPresence(open)

  const layer = useOverlayLayer(open, onDismiss, {
    modal: isModal,
    closeOnEscape: options.closeOnEscape,
    onTopmostChange: (value) => { isTopmost.value = value },
    root: rootEl,
  })

  useFocusTrap(options.panel, {
    active: () => open.value && isModal() && isTopmost.value,
    initialFocus: options.initialFocus,
    fallbackFocus: () => options.panel.value,
    containers: layer.rootsAbove,
    restoreFocus: false,
  })

  useInertOthers(rootEl, () => open.value && isModal() && isTopmost.value)

  // Общий reference-counted lock: несколько открытых оверлеев снимают блокировку
  // независимо от порядка закрытия, ширина скроллбара компенсируется.
  const { lock, unlock } = useScrollLock()

  watch(
    () => options.lockScroll?.() ?? (open.value && isModal()),
    (locked) => {
      if (locked) lock()
      else unlock()
    },
    { immediate: true },
  )

  onBeforeUnmount(unlock)

  let pointerDownOnBackdrop = false

  return {
    rootEl,
    isMounted,
    isVisible,
    isTopmost,
    inertAttr,
    portalTarget,
    teleportEnabled,
    themeAttrs,
    onPanelAfterLeave,
    backdrop: {
      mousedown(event: MouseEvent): void {
        pointerDownOnBackdrop = event.target === event.currentTarget
      },
      click(event: MouseEvent): void {
        const startedHere = pointerDownOnBackdrop
        pointerDownOnBackdrop = false

        if (!startedHere || event.target !== event.currentTarget) return
        if (options.closeOnBackdrop?.() === false) return

        onDismiss()
      },
    },
  }
}
