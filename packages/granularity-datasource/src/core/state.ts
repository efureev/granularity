/**
 * Состояние списка — без Vue и без сети.
 *
 * Модуль чистый намеренно: правила «что сбрасывает страницу» и «изменилось ли
 * что-нибудь» проверяются без монтирования, а композабл остаётся тонким. Тот же
 * приём, что у `GrForm/validation.ts` в ядре.
 */

export type SortDir = 'asc' | 'desc'

export interface DataSourceSort {
  key: string
  dir: SortDir
}

/** Значение фильтра. Всё, что переживает сериализацию в адресную строку. */
export type FilterValue = string | number | boolean | null | ReadonlyArray<string | number>

export interface DataSourceState {
  page: number
  perPage: number
  /** `null` — порядок задаёт источник, а не пользователь. */
  sort: DataSourceSort | null
  filters: Readonly<Record<string, FilterValue>>
  search: string
}

export interface DataSourceDefaults {
  page?: number
  perPage?: number
  sort?: DataSourceSort | null
  filters?: Readonly<Record<string, FilterValue>>
  search?: string
}

export const FIRST_PAGE = 1

export function createState(defaults: DataSourceDefaults = {}): DataSourceState {
  return {
    page: Math.max(FIRST_PAGE, Math.trunc(defaults.page ?? FIRST_PAGE)),
    perPage: Math.max(1, Math.trunc(defaults.perPage ?? 20)),
    sort: defaults.sort ?? null,
    filters: { ...defaults.filters },
    search: defaults.search ?? '',
  }
}

/**
 * Правки, после которых прежний номер страницы теряет смысл.
 *
 * Отфильтровал список, стоя на пятой странице, — и попал на пустую: результатов
 * оказалось на две. Выглядит это как «ничего не нашлось», хотя нашлось. То же с
 * поиском и со сменой размера страницы; сортировка страницу не сбрасывает —
 * набор тот же, изменился только порядок.
 */
const PAGE_RESETTING: ReadonlyArray<keyof DataSourceState> = ['filters', 'search', 'perPage']

/**
 * Применить правку. Возвращается **новое** состояние: старое остаётся целым,
 * и сравнение «изменилось ли что-то» работает по значению, а не по ссылке.
 */
export function applyPatch(state: DataSourceState, patch: Partial<DataSourceState>): DataSourceState {
  const next: DataSourceState = {
    ...state,
    ...patch,
    filters: patch.filters ? { ...patch.filters } : state.filters,
  }

  const resets = PAGE_RESETTING.some(key => key in patch && !sameField(state, next, key))

  return resets && patch.page === undefined ? { ...next, page: FIRST_PAGE } : next
}

function sameField(a: DataSourceState, b: DataSourceState, key: keyof DataSourceState): boolean {
  return key === 'filters' ? sameFilters(a.filters, b.filters) : Object.is(a[key], b[key])
}

export function sameFilters(
  a: Readonly<Record<string, FilterValue>>,
  b: Readonly<Record<string, FilterValue>>,
): boolean {
  const keys = new Set([...Object.keys(a), ...Object.keys(b)])

  for (const key of keys) {
    if (!sameValue(a[key], b[key]))
      return false
  }

  return true
}

function sameValue(a: FilterValue | undefined, b: FilterValue | undefined): boolean {
  // Снятый фильтр приходит четырьмя видами — `undefined`, `null`, `''` и `[]`,
  // — и все они значат одно. Сравнивай их по значению, и очистка поля дважды
  // подряд слала бы второй запрос за тем же самым ответом.
  if (isEmptyFilter(a) && isEmptyFilter(b))
    return true

  if (Array.isArray(a) && Array.isArray(b)) {
    return a.length === b.length && a.every((item, index) => Object.is(item, b[index]))
  }

  return Object.is(a, b)
}

/**
 * Равны ли состояния. Нужно перед запросом: правка, ничего не изменившая
 * (тот же фильтр выбрали повторно), не повод идти на сервер.
 */
export function sameState(a: DataSourceState, b: DataSourceState): boolean {
  return a.page === b.page
    && a.perPage === b.perPage
    && a.search === b.search
    && sameSort(a.sort, b.sort)
    && sameFilters(a.filters, b.filters)
}

export function sameSort(a: DataSourceSort | null, b: DataSourceSort | null): boolean {
  if (a === null || b === null)
    return a === b

  return a.key === b.key && a.dir === b.dir
}

/** Пустой фильтр — это отсутствие фильтра: `''`, `null` и пустой список. */
export function isEmptyFilter(value: FilterValue | undefined): boolean {
  if (value === undefined || value === null || value === '')
    return true

  return Array.isArray(value) && value.length === 0
}
