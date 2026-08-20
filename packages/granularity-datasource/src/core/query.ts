import type { DataSourceSort, DataSourceState, FilterValue, SortDir } from './state'
import { FIRST_PAGE, isEmptyFilter, sameFilters, sameSort } from './state'

/**
 * Состояние списка ↔ строка запроса.
 *
 * Формат выбран так, чтобы ссылку можно было прочитать глазами и поправить
 * руками: `?page=3&perPage=50&sort=-created&q=иванов&f.role=admin&f.role=owner`.
 *
 * Направление сортировки — ведущим минусом (`-created`), как в JSON:API и в
 * большинстве бэкендов. Списки — повторяющимся параметром, а не через запятую:
 * запятая внутри самого значения превратила бы один фильтр в два, и всплыло бы
 * это на первом же названии компании с запятой.
 *
 * **Пустое не пишется.** Значение, равное умолчанию, из адреса исчезает: ссылка
 * на список по умолчанию обязана выглядеть как адрес страницы, а не как список
 * из шести параметров, ни один из которых ничего не меняет.
 */

export interface QueryKeys {
  page: string
  perPage: string
  sort: string
  search: string
  /** Префикс имени фильтра: `f.` либо `<prefix>.f.`. */
  filter: string
}

/**
 * Имена параметров. Префикс разводит два списка на одной странице:
 * `?users.page=2&orders.page=1`.
 */
export function queryKeys(prefix?: string): QueryKeys {
  const head = prefix ? `${prefix}.` : ''

  return {
    page: `${head}page`,
    perPage: `${head}perPage`,
    sort: `${head}sort`,
    search: `${head}q`,
    filter: `${head}f.`,
  }
}

export interface QueryCodecOptions {
  prefix?: string
  /** Умолчания: всё, что им равно, в адрес не пишется. */
  defaults: DataSourceState
}

function formatSort(sort: DataSourceSort): string {
  return sort.dir === 'desc' ? `-${sort.key}` : sort.key
}

function parseSort(raw: string): DataSourceSort | null {
  const key = raw.startsWith('-') ? raw.slice(1) : raw
  if (!key) return null

  const dir: SortDir = raw.startsWith('-') ? 'desc' : 'asc'

  return { key, dir }
}

/**
 * Записать состояние в строку запроса, **сохранив чужие параметры**.
 *
 * Список живёт на странице не один: рядом бывает вкладка, режим показа и всё,
 * что положил туда потребитель. Затирать их своим состоянием нельзя, поэтому
 * трогаются только собственные ключи.
 */
export function writeStateToQuery(search: string, state: DataSourceState, options: QueryCodecOptions): string {
  const keys = queryKeys(options.prefix)
  const params = new URLSearchParams(search)
  const { defaults } = options

  for (const name of [...params.keys()]) {
    if (name === keys.page || name === keys.perPage || name === keys.sort || name === keys.search) params.delete(name)
    else if (name.startsWith(keys.filter)) params.delete(name)
  }

  if (state.page !== defaults.page) params.set(keys.page, String(state.page))
  if (state.perPage !== defaults.perPage) params.set(keys.perPage, String(state.perPage))
  if (state.search !== defaults.search) params.set(keys.search, state.search)

  if (!sameSort(state.sort, defaults.sort)) {
    // Снятая сортировка при непустом умолчании — тоже состояние, и пустая
    // строка её выражает: иначе адрес вернул бы умолчание при перезагрузке.
    params.set(keys.sort, state.sort ? formatSort(state.sort) : '')
  }

  if (!sameFilters(state.filters, defaults.filters)) writeFilters(params, keys, state.filters, defaults.filters)

  const query = params.toString()

  return query ? `?${query}` : ''
}

function writeFilters(
  params: URLSearchParams,
  keys: QueryKeys,
  filters: Readonly<Record<string, FilterValue>>,
  defaults: Readonly<Record<string, FilterValue>>,
): void {
  for (const [name, value] of Object.entries(filters)) {
    if (isEmptyFilter(value)) {
      // Снятый фильтр при непустом умолчании обязан остаться в адресе пустым
      // значением — иначе перезагрузка вернёт умолчание, которое сняли.
      if (!isEmptyFilter(defaults[name])) params.set(`${keys.filter}${name}`, '')
      continue
    }

    const key = `${keys.filter}${name}`

    if (Array.isArray(value)) {
      for (const item of value) params.append(key, String(item))
      continue
    }

    params.set(key, String(value))
  }
}

/**
 * Прочитать состояние из строки запроса.
 *
 * Разбор **терпим**: неизвестные параметры не трогаются, битые игнорируются, и
 * вместо них берётся умолчание. Адрес приходит снаружи — из закладки, из чужого
 * письма, из руки пользователя, — и падать на нём нельзя.
 *
 * Тип фильтра восстанавливается по умолчанию с тем же именем: строка `"2"` при
 * числовом умолчании станет числом, а при списочном — списком из одного
 * элемента. Без умолчания значение остаётся строкой — угадывать тип по виду
 * значения значило бы превратить артикул `0012` в число `12`.
 */
export function readStateFromQuery(search: string, options: QueryCodecOptions): DataSourceState {
  const keys = queryKeys(options.prefix)
  const params = new URLSearchParams(search)
  const { defaults } = options

  const sortRaw = params.get(keys.sort)

  return {
    page: readInt(params.get(keys.page), defaults.page, FIRST_PAGE),
    perPage: readInt(params.get(keys.perPage), defaults.perPage, 1),
    sort: sortRaw === null ? defaults.sort : parseSort(sortRaw),
    search: params.get(keys.search) ?? defaults.search,
    filters: readFilters(params, keys, defaults.filters),
  }
}

function readInt(raw: string | null, fallback: number, min: number): number {
  if (raw === null) return fallback

  const value = Number(raw)

  return Number.isInteger(value) && value >= min ? value : fallback
}

function readFilters(
  params: URLSearchParams,
  keys: QueryKeys,
  defaults: Readonly<Record<string, FilterValue>>,
): Record<string, FilterValue> {
  const filters: Record<string, FilterValue> = { ...defaults }

  for (const name of new Set([...params.keys()].filter(key => key.startsWith(keys.filter)))) {
    const field = name.slice(keys.filter.length)
    if (!field) continue

    const raw = params.getAll(name)
    filters[field] = coerce(raw, defaults[field])
  }

  return filters
}

function coerce(raw: string[], sample: FilterValue | undefined): FilterValue {
  if (Array.isArray(sample)) {
    return raw.filter(item => item !== '').map(item => (typeof sample[0] === 'number' ? Number(item) : item))
  }

  const value = raw[0] ?? ''
  // Пустое значение — это снятый фильтр, а не ноль и не `false`: у числового
  // поля ноль пришлось бы отличать от «не задано», и отличить не вышло бы.
  if (value === '') return null

  if (typeof sample === 'number') {
    const parsed = Number(value)

    return Number.isFinite(parsed) ? parsed : sample
  }

  if (typeof sample === 'boolean') return value === 'true' || value === '1'

  return value
}
