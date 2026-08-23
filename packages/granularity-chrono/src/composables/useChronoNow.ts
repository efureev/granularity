import type { ComputedRef, MaybeRefOrGetter, Ref } from 'vue'
import { computed, getCurrentScope, onScopeDispose, ref, shallowRef, toValue, watch } from 'vue'

/**
 * Общее «сейчас» пакета: один таймер на такт, а не на компонент.
 *
 * Сто строк ленты с относительным временем — это сто подписчиков и **один**
 * `setInterval`: экземпляры делят и таймер, и сам `Date`, поэтому пересчёт
 * стоит одного прохода реактивности вместо ста независимых пробуждений.
 *
 * ```ts
 * const now = useChronoNow(30_000)
 * const text = computed(() => formatRelativeTime(locale, selectRelativeAmount(value, now.value)))
 * ```
 *
 * Такт задаётся вызывающим и может быть реактивным: `GrRelativeTime` замедляет
 * его по мере старения значения, подписка переезжает с одного тикера на
 * другой, а осиротевший останавливается.
 */

/** Такт по умолчанию: минута — цена ошибки на глаз для «N минут назад». */
export const GR_CHRONO_TICK_MS = 60_000

interface Ticker {
  now: Ref<Date>
  subscribers: number
  handle: ReturnType<typeof setInterval> | null
}

const tickers = new Map<number, Ticker>()

/**
 * Скрытая вкладка не тикает: читать некому, а таймеры продолжали бы будить
 * процесс — на фоновой вкладке с лентой это единственная работа, которую она
 * делает.
 */
let visibilityBound = false

function documentHidden(): boolean {
  return typeof document !== 'undefined' && document.visibilityState === 'hidden'
}

function stop(ticker: Ticker): void {
  if (ticker.handle === null)
    return

  clearInterval(ticker.handle)
  ticker.handle = null
}

function start(interval: number, ticker: Ticker): void {
  if (ticker.handle !== null || documentHidden())
    return

  ticker.handle = setInterval(() => {
    ticker.now.value = new Date()
  }, interval)
}

function onVisibilityChange(): void {
  for (const [interval, ticker] of tickers) {
    if (documentHidden()) {
      stop(ticker)
      continue
    }

    // Сначала свежее значение, потом такт: за время на фоне текст устарел, и
    // ждать целый интервал значит показать вернувшемуся пользователю вчерашнее.
    ticker.now.value = new Date()
    start(interval, ticker)
  }
}

function subscribe(interval: number): Ticker {
  if (!visibilityBound && typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', onVisibilityChange)
    visibilityBound = true
  }

  let ticker = tickers.get(interval)
  if (!ticker) {
    ticker = { now: ref(new Date()), subscribers: 0, handle: null }
    tickers.set(interval, ticker)
  }

  ticker.subscribers += 1
  start(interval, ticker)

  return ticker
}

function unsubscribe(interval: number): void {
  const ticker = tickers.get(interval)
  if (!ticker)
    return

  ticker.subscribers -= 1
  if (ticker.subscribers > 0)
    return

  stop(ticker)
  tickers.delete(interval)
}

/**
 * Реактивное «сейчас», обновляемое раз в `interval` мс.
 *
 * Такт `0` (и любой неположительный) означает «не тикать»: значение снимается
 * один раз и застывает. Отдельного флага нет намеренно — подписчик, которому
 * тикать не нужно, всё равно обязан считать такт, и одно выражение с нулём
 * честнее пары «интервал плюс `enabled`», которые можно рассогласовать.
 *
 * На сервере значение снимается один раз и не обновляется: таймеры там некому
 * ни видеть, ни останавливать.
 *
 * Отписка вешается на `onScopeDispose`. Вне scope (вызов из стора или обычного
 * `.ts`) композабл работает, но подписка живёт до `resetChronoNow`.
 */
export function useChronoNow(interval: MaybeRefOrGetter<number> = GR_CHRONO_TICK_MS): ComputedRef<Date> {
  const snapshot = new Date()

  if (typeof document === 'undefined')
    return computed(() => snapshot)

  const active = shallowRef<Ticker | null>(null)
  let current: number | null = null

  function release(): void {
    if (current === null)
      return

    unsubscribe(current)
    current = null
    active.value = null
  }

  watch(() => toValue(interval), (next) => {
    if (current === next)
      return

    release()
    if (!(next > 0))
      return

    active.value = subscribe(next)
    current = next
  }, { immediate: true })

  if (getCurrentScope())
    onScopeDispose(release)

  return computed(() => active.value?.now.value ?? snapshot)
}

/** Тестовая/служебная очистка: снимает все таймеры и подписку на видимость. */
export function resetChronoNow(): void {
  for (const ticker of tickers.values()) stop(ticker)
  tickers.clear()

  if (visibilityBound && typeof document !== 'undefined') {
    document.removeEventListener('visibilitychange', onVisibilityChange)
    visibilityBound = false
  }
}

/**
 * Такты живых таймеров. Гейту нужен именно состав, а не счёт: подписка,
 * переехавшая с секундного такта на минутный, оставляет счёт единицей и
 * замену прячет.
 */
export function chronoTickerIntervals(): number[] {
  return [...tickers.keys()].sort((left, right) => left - right)
}
