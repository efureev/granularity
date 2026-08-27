/**
 * Опции панели.
 *
 * Их немного намеренно: панель должна работать без настройки, а каждая опция —
 * это ещё одна ветка поведения, которую нужно держать в голове при отладке.
 */
export interface GranularityDevtoolsOptions {
  /**
   * Проверки, которые панель делает сама на обходе дерева компонентов.
   *
   * `'off'` выключает поиск недостающих обязательных пропов. Обход идёт по
   * каждому узлу дерева — на витрине это четыре с лишним сотни компонентов, —
   * и хотя проверка дешёвая, выключатель дешевле завести до того, как она
   * подорожает, а не после.
   */
  checks?: 'all' | 'off'
  /**
   * Сколько событий канала держать в буфере ядра. По умолчанию 50 — хватает на
   * сценарий «открыл окно, поработал, полез в панель».
   */
  eventLimit?: number
}

export interface ResolvedDevtoolsOptions {
  checks: 'all' | 'off'
  eventLimit: number | null
}

export function resolveOptions(options: GranularityDevtoolsOptions = {}): ResolvedDevtoolsOptions {
  return {
    checks: options.checks ?? 'all',
    // `null` — «не трогать»: ядро оставит свою глубину. Ноль и отрицательные
    // значения буфер обессмысливают, поэтому их не пропускаем.
    eventLimit: typeof options.eventLimit === 'number' && options.eventLimit > 0
      ? Math.trunc(options.eventLimit)
      : null,
  }
}
