/**
 * Dev-канал ядра: наружу отдаётся то, чего иначе не увидеть — состояние
 * приватных синглтонов пакета.
 *
 * Первый и пока единственный поставщик — стек слоёв
 * (`composables/internal/overlayStack.ts`). Он приватен намеренно: один список
 * отвечает сразу на три вопроса (кому Esc, кто под `inert`, чья высота), и
 * публичный доступ к нему означал бы обязательство держать эту форму. Канал
 * снимает противоречие: снаружи видно картину, но не рычаги.
 *
 * Существует только под `__GR_DEV__` — вызывающие обязаны обернуть эмит гардом,
 * тогда у потребителя ветка выкидывается вместе с этим модулем.
 *
 * Хук нарочно «глупый»: голые `events` и `listeners` вместо методов. Создать
 * такой объект умеет и слушатель (панель подключается раньше или позже ядра —
 * порядок не гарантирован), а логика эмита при этом живёт в одном месте, здесь.
 */

/** Фокус вокруг слоя: то, чего не видно ни в DOM, ни в браузерном инспекторе. */
export interface GrLayerFocus {
  /** Фокус сейчас внутри слоя. */
  inside: boolean
  /**
   * Вернётся ли фокус при закрытии. Правило нетривиальное — «только если на
   * момент закрытия фокус ещё внутри слоя», — и снаружи непроверяемо.
   */
  willRestore: boolean
  /** Куда вернётся: описание элемента, а не ссылка (буфер не должен держать DOM). */
  restoreTo: string | null
}

/** Слой оверлея в том виде, в каком его видит наблюдатель. */
export interface GrOverlaySnapshot {
  id: number
  /** Компонент, открывший слой: `GrSelect`, `GrModal`. `null` — слой заведён вне компонента. */
  owner: string | null
  focus: GrLayerFocus | null
  modal: boolean
  /** Верхний слой любого рода: ему адресован Esc. */
  topmostForEscape: boolean
  /** Модальный слой ниже последнего модального — тот, что уходит в `inert`. */
  inert: boolean
  /** Позиция среди модальных, от нуля. У немодальных глубины нет. */
  depth: number | null
  /** Закроется ли слой по Esc прямо сейчас (`closeOnEsc` реактивен). */
  closesOnEscape: boolean
}

export type GrDevEvent
  = | { type: 'overlay:sync', layers: GrOverlaySnapshot[] }
    | { type: 'overlay:push', id: number, modal: boolean, owner: string | null }
    | { type: 'overlay:remove', id: number }
    | { type: 'overlay:escape', id: number, closed: boolean }

/**
 * Окно виртуализатора глазами наблюдателя.
 *
 * Число узлов в DOM браузер покажет и сам; невидимо другое — какие индексы
 * отрисованы, сколько всего элементов и насколько оценка высоты разошлась с
 * замером. Расхождение и есть тихий дефект: список начинает прыгать, а узлов
 * по-прежнему «правильные десятки».
 */
export interface GrVirtualListSnapshot {
  /** Компонент, которому принадлежит список. */
  owner: string | null
  /** `uid` инстанса: панель связывает снимок с выбранным компонентом. */
  uid: number | null
  total: number
  rendered: number
  range: { start: number, end: number }
  /** Оценка высоты элемента, с которой список считает окно. */
  estimated: number
  /** Средний фактический замер; `null` — пока ничего не измерено. */
  measured: number | null
}

export interface GrDevHook {
  /** Последние события — чтобы подключившийся позже не начинал с пустого экрана. */
  events: GrDevEvent[]
  listeners: Set<(event: GrDevEvent) => void>
  /**
   * Живые виртуализаторы. Реестр, а не событие: окно меняется на каждый кадр
   * прокрутки, и слать его лентой значило бы залить канал.
   */
  virtualLists?: Set<() => GrVirtualListSnapshot>
  /**
   * Свежий снимок стека по требованию.
   *
   * События дают картину на момент изменения стека, а часть состояния меняется
   * между ними: фокус уходит из слоя от обычного клика, и ни одного события при
   * этом не случается. Наблюдателю нужно спросить «как сейчас», а не «как было
   * при последнем push».
   */
  readLayers?: () => GrOverlaySnapshot[]
}

type GlobalWithDevHook = typeof globalThis & { __GR_DEV_HOOK__?: GrDevHook }

/**
 * Глубина буфера. Полсотни событий покрывают сценарий «открыл окно, поработал,
 * полез в панель» и не превращают буфер в утечку на долгой сессии.
 */
const BUFFER_LIMIT = 50

function ensureHook(): GrDevHook {
  const target = globalThis as GlobalWithDevHook
  const existing = target.__GR_DEV_HOOK__
  if (existing)
    return existing

  const hook: GrDevHook = { events: [], listeners: new Set() }
  target.__GR_DEV_HOOK__ = hook
  return hook
}

/**
 * Регистрирует виртуализатор в реестре наблюдателя. Возвращает снятие —
 * список обязан исчезнуть вместе с компонентом.
 */
export function registerGrVirtualList(read: () => GrVirtualListSnapshot): () => void {
  const hook = ensureHook()
  hook.virtualLists ??= new Set()
  hook.virtualLists.add(read)

  return () => {
    hook.virtualLists?.delete(read)
  }
}

/** Ядро отдаёт наблюдателю читалку стека. Вызывается один раз, из стека слоёв. */
export function provideGrDevLayers(read: () => GrOverlaySnapshot[]): void {
  ensureHook().readLayers = read
}

export function emitGrDevEvent(event: GrDevEvent): void {
  const hook = ensureHook()

  hook.events.push(event)
  if (hook.events.length > BUFFER_LIMIT)
    hook.events.splice(0, hook.events.length - BUFFER_LIMIT)

  for (const listener of hook.listeners) {
    // Слушатель — чужой код, и его исключение не должно ронять то, за чем он
    // наблюдает: канал обязан быть незаметен для поведения пакета.
    try {
      listener(event)
    }
    catch {
      // ignore
    }
  }
}

/** Сброс канала между тестами: буфер и подписчики живут в `globalThis`. */
export function resetGrDevHook(): void {
  const target = globalThis as GlobalWithDevHook
  target.__GR_DEV_HOOK__ = undefined
}
