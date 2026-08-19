/**
 * Перенос виджета из каталога в сетку.
 *
 * Источник и приёмник — не родственники: `GrDashboardPalette` стоит **вне**
 * `<GrDashboard>` и стоять внутри не может (корень сетки — CSS Grid, любой
 * прямой ребёнок становится ячейкой). Поэтому канал не `provide`/`inject`, а
 * модель уровня модуля — тем же приёмом, каким ядро держит стек оверлеев:
 * связь, которую дерево компонентов не выражает, живёт рядом с деревом.
 *
 * **На сервере в эту модель не пишется ничего.** Приёмники регистрируются из
 * `onMounted`, сессия заводится из обработчика `pointerdown` — и то, и другое
 * бывает только в браузере, поэтому обычная беда модульного состояния (утечка
 * между запросами) здесь не возникает.
 *
 * Пакет, оказавшийся в дереве зависимостей дважды, получит две такие модели, и
 * перенос между их сетками не поедет. Оговорка та же, что у стека оверлеев
 * ядра.
 */
import type { ComputedRef, ShallowRef } from 'vue'
import { computed, onScopeDispose, shallowRef } from 'vue'

import { useDragGesture } from '@feugene/granularity/composables/useDragGesture'

import type { GrDashboardSpan } from '../layout'

/**
 * Что несут.
 *
 * Тип не про каталог: тащить в сетку вправе любой источник, поэтому здесь
 * только то, без чего нельзя выбрать место, — размер и границы.
 */
export interface GrDashboardTransfer {
  /** Идентификатор будущего виджета. */
  id: string
  /** Имя для призрака. Скринридеру не адресуется: призрак `aria-hidden`. */
  title?: string
  /** Размер в ячейках, с которым виджет встаёт в сетку. */
  size: GrDashboardSpan
  minW?: number
  minH?: number
  maxW?: number
  maxH?: number
  /** Откуда несут. Набор открыт: перенос между дашбордами добавит своё значение. */
  source: 'palette'
  /** Полезная нагрузка приложения: возвращается в эмите сетки нетронутой. */
  payload?: unknown
}

/** Указатель во вьюпорте. */
export interface GrDashboardTransferPoint {
  x: number
  y: number
}

/** Сетка-приёмник. Регистрируется на монтировании, снимается на размонтировании. */
export interface GrDashboardTransferTarget {
  /** Прямоугольник сетки во вьюпорте. Читается раз в кадр: страница прокручивается. */
  rect: () => DOMRect | null
  /** Готова ли принимать прямо сейчас. */
  enabled: () => boolean
  /** Указатель над сеткой. */
  over: (transfer: GrDashboardTransfer, point: GrDashboardTransferPoint) => void
  /** Указатель ушёл с сетки или сессия кончилась. */
  leave: () => void
  /** Отпускание над этой сеткой. Зовётся до `leave`, пока цель ещё знает ячейку. */
  drop: (transfer: GrDashboardTransfer) => void
}

export interface UseDashboardTransferReturn {
  /** Что несут прямо сейчас. `null` — переноса нет либо порог ещё не пройден. */
  transfer: Readonly<ShallowRef<GrDashboardTransfer | null>>
  /** Координаты указателя. Отдельным ref, чтобы кадр не пересоздавал сессию. */
  point: Readonly<ShallowRef<GrDashboardTransferPoint>>
  isTransferring: ComputedRef<boolean>
  /** Начать перенос с `pointerdown`. До порога сессии нет — это ещё нажатие. */
  start: (transfer: GrDashboardTransfer, event: PointerEvent) => void
  cancel: () => void
  registerTarget: (target: GrDashboardTransferTarget) => () => void
}

/**
 * Сдвиг, после которого нажатие становится переносом.
 *
 * Плитка каталога — не ручка: нажатие на неё само по себе ничего не значит, и
 * без порога любой клик с дрожанием запускал бы перенос. Число то же, что у
 * `useDragSort` ядра: два разных порога в одном репозитории пришлось бы
 * объяснять, а объяснения нет.
 */
export const GR_DASHBOARD_TRANSFER_THRESHOLD = 4

const transfer = shallowRef<GrDashboardTransfer | null>(null)
const point = shallowRef<GrDashboardTransferPoint>({ x: 0, y: 0 })
const targets = new Set<GrDashboardTransferTarget>()

let pending: GrDashboardTransfer | null = null
let originX = 0
let originY = 0
let activeTarget: GrDashboardTransferTarget | null = null
let frame: number | null = null
let stopActive: ((commit: boolean) => void) | null = null
let escapeAttached = false

function onWindowKeydown(event: KeyboardEvent): void {
  if (event.key !== 'Escape' || !transfer.value) return

  event.preventDefault()
  stopActive?.(false)
}

/** `Esc` слушаем сами: браузер `pointercancel` на него не шлёт, а бросить начатое пользователь вправе. */
function attachEscape(): void {
  if (escapeAttached || typeof window === 'undefined') return

  escapeAttached = true
  window.addEventListener('keydown', onWindowKeydown, true)
}

function detachEscape(): void {
  if (!escapeAttached) return

  escapeAttached = false
  window.removeEventListener('keydown', onWindowKeydown, true)
}

/**
 * Приёмник под точкой. Перекрылись — побеждает зарегистрированный последним:
 * вложенные дашборды пакетом исключены, а перекрытие означает оверлей поверх
 * страницы.
 */
function targetAt(x: number, y: number): GrDashboardTransferTarget | null {
  let found: GrDashboardTransferTarget | null = null

  for (const target of targets) {
    if (!target.enabled()) continue

    const rect = target.rect()
    if (!rect || rect.width <= 0 || rect.height <= 0) continue
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) continue

    found = target
  }

  return found
}

function flush(): void {
  frame = null
  const current = transfer.value
  if (!current) return

  const next = targetAt(point.value.x, point.value.y)

  if (next !== activeTarget) {
    activeTarget?.leave()
    activeTarget = next
  }

  activeTarget?.over(current, point.value)
}

function reset(): void {
  if (frame !== null) {
    cancelAnimationFrame(frame)
    frame = null
  }

  activeTarget?.leave()
  activeTarget = null
  pending = null
  transfer.value = null
  stopActive = null
  detachEscape()
}

function finish(commit: boolean): void {
  // Отложенный кадр доигрывается, а не отменяется: движение и отпускание могут
  // прийти внутри одного кадра, и отменённый кадр потерял бы последний сдвиг.
  if (frame !== null) {
    cancelAnimationFrame(frame)
    frame = null
    flush()
  }

  const current = transfer.value
  const target = activeTarget

  if (commit && current && target) target.drop(current)

  reset()
}

function onMove(event: PointerEvent): void {
  point.value = { x: event.clientX, y: event.clientY }

  if (pending) {
    if (Math.hypot(event.clientX - originX, event.clientY - originY) < GR_DASHBOARD_TRANSFER_THRESHOLD) return

    transfer.value = pending
    pending = null
    attachEscape()
  }

  // Примитив `preventDefault` не зовёт осознанно; здесь гасится выделение
  // текста под курсором во время переноса.
  event.preventDefault()
  frame ??= requestAnimationFrame(flush)
}

export function useDashboardTransfer(): UseDashboardTransferReturn {
  const gesture = useDragGesture({
    onMove,
    onEnd: () => finish(true),
    onCancel: () => finish(false),
  })

  const stop = (commit: boolean): void => gesture.stop(commit)

  function start(value: GrDashboardTransfer, event: PointerEvent): void {
    if (transfer.value || pending) return
    // Пальцем каталог прокручивают, а не таскают: отобрать вертикальную ось у
    // скроллера ради жеста, у которого есть работающий эквивалент (кнопка), —
    // плохой обмен.
    if (event.pointerType === 'touch') return

    pending = value
    originX = event.clientX
    originY = event.clientY
    point.value = { x: event.clientX, y: event.clientY }
    stopActive = stop

    gesture.start(event)

    // Примитив отсеивает не основную кнопку молча: без этой проверки нажатие
    // правой оставило бы висеть `pending`.
    if (!gesture.isDragging.value) {
      pending = null
      stopActive = null
    }
  }

  function registerTarget(target: GrDashboardTransferTarget): () => void {
    targets.add(target)

    return () => {
      targets.delete(target)
      if (activeTarget === target) activeTarget = null
    }
  }

  // Примитив при смерти области снимает слушатели, но `onCancel` не зовёт:
  // сессия повисла бы, спрячь приложение каталог на старте переноса.
  onScopeDispose(() => {
    if (stopActive === stop) reset()
  })

  return {
    transfer,
    point,
    isTransferring: computed(() => transfer.value !== null),
    start,
    cancel: () => stopActive?.(false),
    registerTarget,
  }
}
