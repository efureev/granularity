/**
 * Уборщики модульного состояния, которое переживает очистку `body`.
 *
 * Модуль со своим состоянием записывается сюда сам, а `resetGranularityDom`
 * прогоняет всех записавшихся. Направление обратное прямому импорту не ради
 * изящества: подпуть `testing` не обязан тянуть граф сервиса диалогов и всего,
 * что тот рендерит. Не импортирован модуль — нет и состояния, убирать нечего.
 */
const resets = new Set<() => void>()

export function registerDomReset(reset: () => void): void {
  resets.add(reset)
}

export function runDomResets(): void {
  for (const reset of resets) reset()
}
