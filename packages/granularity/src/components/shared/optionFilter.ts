/**
 * Подстрочный поиск по опциям — один на пакет.
 *
 * Тот же предикат был написан трижды, и у каждой копии был свой контракт
 * нормализации: `GrSelect` лоукейсил запрос в вызывающем коде, `GrAutocomplete`
 * внутри матчера, `GrCommandPalette` — внутри своего. Расхождение такого рода
 * не видно на глаз и всплывает как «в одном компоненте регистр учитывается, в
 * другом нет».
 *
 * Нормализация здесь ровно одна (`normalizeOptionQuery`), а компонент выбирает,
 * что ему нужно: готовый плоский список (`filterOptions`) или голый предикат
 * (`matchesOptionQuery`) — `GrSelect` фильтрует внутри обхода групп и списка не
 * имеет.
 */

/** Запрос в сравнимом виде: без краевых пробелов и в нижнем регистре. */
export function normalizeOptionQuery(raw: string): string {
  return raw.trim().toLowerCase()
}

/**
 * Ядро матча: подстрока в любом из полей. `undefined` в наборе пропускается —
 * у команды палитры может не быть ни описания, ни группы.
 *
 * `needle` ожидается уже нормализованным: нормализовать на каждый элемент
 * списка значило бы делать одну и ту же работу n раз.
 */
export function matchesQueryParts(parts: readonly (string | undefined)[], needle: string): boolean {
  if (!needle) return true

  return parts.some(part => part !== undefined && part.toLowerCase().includes(needle))
}

/** Опция в терминах поиска: метка видна пользователю, значение — то, что он мог запомнить. */
export interface OptionLike {
  label: string
  value: unknown
}

/** Матчер по умолчанию: метка и значение опции. */
export function matchesOptionQuery(option: OptionLike, needle: string): boolean {
  return matchesQueryParts([option.label, String(option.value)], needle)
}

/**
 * Плоская фильтрация списка опций.
 *
 * Пустой запрос отдаёт **тот же массив** и матчер не зовёт вовсе: свой `filter`
 * потребителя не должен решать, что показывать «без запроса», а копия на
 * каждый пересчёт била бы по виртуализированным спискам на тысячи опций.
 *
 * Пользовательскому матчеру уходит **сырой** запрос (только `trim`), а не
 * нормализованный: это публичный контракт пропа `filter` у `GrAutocomplete`,
 * и чужая реализация вправе смотреть на регистр.
 */
export function filterOptions<TOption extends OptionLike>(
  options: TOption[],
  rawQuery: string,
  filter?: (option: TOption, query: string) => boolean,
): TOption[] {
  const query = rawQuery.trim()
  if (!query) return options

  if (filter) return options.filter(option => filter(option, query))

  const needle = query.toLowerCase()
  return options.filter(option => matchesOptionQuery(option, needle))
}

/**
 * Значения выбора — в опции для чипов.
 *
 * Значение, которого нет среди опций, показывается как есть: так выглядит
 * произвольное значение (`allowCustomValue`) и значение, пришедшее из модели
 * раньше, чем подгрузились опции. Прятать его нельзя — пользователь видел бы
 * пустое место вместо своего выбора.
 *
 * Сравнение идёт через ключ, а не `===`: объектные значения приходят в модель
 * отдельной копией, и ссылочное равенство не нашло бы ничего.
 */
export function resolveSelectedOptions<TValue, TOption extends { label: string, value: TValue }>(
  values: readonly TValue[],
  options: readonly TOption[],
  keyOf: (value: TValue) => string = value => String(value),
): (TOption | { value: TValue, label: string })[] {
  const byKey = new Map<string, TOption>()

  // Первый выигрывает: одно и то же значение в двух группах — это одна опция,
  // и подпись чипа не должна зависеть от порядка обхода.
  for (const option of options) {
    const key = keyOf(option.value)
    if (!byKey.has(key)) byKey.set(key, option)
  }

  return values.map((value) => {
    const key = keyOf(value)
    return byKey.get(key) ?? { value, label: key }
  })
}
