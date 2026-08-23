import { ensurePortalRoot } from './internal/portalRoot'

/**
 * Общий живой регион пакета: один канал `aria-live` на документ.
 *
 * До него каждый компонент строил свой `role="status"`, а сообщить что-то
 * скринридеру из кода приложения («скопировано», «строка удалена», «найдено N»)
 * было нечем вовсе. Регион виджета остаётся правильным решением, когда он
 * рендерит **состояние** этого виджета (счётчик символов, «загружается»,
 * «ничего не найдено»); объявитель — для **события**, которое произошло и
 * прошло, и своего места в разметке не имеет.
 *
 * ```ts
 * const { announce } = useAnnouncer()
 * announce('Ссылка скопирована')
 * announce('Не удалось сохранить', { politeness: 'assertive' })
 * ```
 *
 * Композабл не требует setup-контекста: его можно звать из обычного `.ts` —
 * из стора, обработчика, перехватчика запросов.
 */

export type GrAnnouncerPoliteness = 'polite' | 'assertive'

export interface GrAnnounceOptions {
  /**
   * `assertive` перебивает текущую речь и уместен только для того, что нельзя
   * пропустить (отказ операции, потеря соединения). По умолчанию `polite` —
   * диктор дочитает начатое.
   */
  politeness?: GrAnnouncerPoliteness
  /**
   * Через сколько мс стереть текст. `0` — не стирать.
   *
   * Регион остаётся в DOM, и пользователь виртуального курсора наткнётся на
   * его содержимое при обходе страницы — через минуту после события это уже
   * дезинформация. По умолчанию `7000`.
   */
  clearAfterMs?: number
}

export interface GrAnnouncer {
  announce: (message: string, options?: GrAnnounceOptions) => void
  /** Стирает текст региона. Без аргумента — обоих. */
  clear: (politeness?: GrAnnouncerPoliteness) => void
}

const HOST_ID = 'gr-announcer'
const DEFAULT_CLEAR_AFTER_MS = 7000

/**
 * Визуальное скрытие — инлайновым стилем, а не классом `sr-only`.
 *
 * Узлы создаются императивно и в скан UnoCSS не попадают ни при каком safelist:
 * пресет сканирует `dist/components/**`, а этого класса там нет — CSS к нему не
 * сгенерируется, и регион окажется видимой строкой посреди страницы.
 *
 * Ни `display: none`, ни `visibility: hidden`: их содержимое AT не читает.
 */
const VISUALLY_HIDDEN = [
  'position:absolute',
  'width:1px',
  'height:1px',
  'margin:-1px',
  'padding:0',
  'overflow:hidden',
  'clip:rect(0 0 0 0)',
  'clip-path:inset(50%)',
  'white-space:nowrap',
  'border:0',
].join(';')

interface AnnouncerHost {
  polite: HTMLElement
  assertive: HTMLElement
}

let host: AnnouncerHost | null = null
const writeTimers = new Map<HTMLElement, ReturnType<typeof setTimeout>>()
const clearTimers = new Map<HTMLElement, ReturnType<typeof setTimeout>>()

function createRegion(politeness: GrAnnouncerPoliteness): HTMLElement {
  const region = document.createElement('div')
  // `role` подразумевает нужную вежливость, но объявляем и её: связка
  // «роль + aria-live» — то же, что делают регионы компонентов пакета.
  region.setAttribute('role', politeness === 'assertive' ? 'alert' : 'status')
  region.setAttribute('aria-live', politeness)
  region.setAttribute('aria-atomic', 'true')
  region.setAttribute('data-gr-announcer-region', politeness)
  region.setAttribute('style', VISUALLY_HIDDEN)
  return region
}

/**
 * Создаёт хост при первом обращении. `null` на сервере.
 *
 * Узлы обязаны появиться в документе **раньше** текста: регион, который
 * возникает сразу с содержимым, часть AT не объявляет вовсе. Поэтому хост
 * ставится в момент `useAnnouncer()`, а текст пишется отложенно.
 */
function ensureHost(): AnnouncerHost | null {
  if (typeof document === 'undefined')
    return null
  if (host?.polite.isConnected)
    return host

  const existing = document.getElementById(HOST_ID)
  existing?.remove()

  const container = document.createElement('div')
  container.id = HOST_ID
  // Пропуск для `inertableOutside`: под открытой модалкой хост обязан остаться
  // объявляемым, иначе объявитель молча замолкает ровно там, где нужнее всего.
  container.setAttribute('data-gr-live-region', '')

  const polite = createRegion('polite')
  const assertive = createRegion('assertive')
  container.append(polite, assertive)

  ;(ensurePortalRoot() ?? document.body).appendChild(container)

  host = { polite, assertive }
  return host
}

function cancel(map: Map<HTMLElement, ReturnType<typeof setTimeout>>, region: HTMLElement): void {
  const handle = map.get(region)
  if (handle === undefined)
    return
  clearTimeout(handle)
  map.delete(region)
}

export function useAnnouncer(): GrAnnouncer {
  const resolved = ensureHost()

  function regionFor(politeness: GrAnnouncerPoliteness): HTMLElement | null {
    return politeness === 'assertive' ? resolved?.assertive ?? null : resolved?.polite ?? null
  }

  function clear(politeness?: GrAnnouncerPoliteness): void {
    const targets = politeness ? [regionFor(politeness)] : [regionFor('polite'), regionFor('assertive')]

    for (const region of targets) {
      if (!region)
        continue
      cancel(writeTimers, region)
      cancel(clearTimers, region)
      region.textContent = ''
    }
  }

  function announce(message: string, options: GrAnnounceOptions = {}): void {
    const region = regionFor(options.politeness ?? 'polite')
    if (!region || !message)
      return

    cancel(writeTimers, region)
    cancel(clearTimers, region)

    // Очищаем сейчас, пишем следующим тиком: без пустой фазы повтор того же
    // текста («Тег удалён» дважды подряд) не даёт мутации и не читается.
    region.textContent = ''

    writeTimers.set(region, setTimeout(() => {
      writeTimers.delete(region)
      region.textContent = message

      const clearAfterMs = options.clearAfterMs ?? DEFAULT_CLEAR_AFTER_MS
      if (clearAfterMs <= 0)
        return

      clearTimers.set(region, setTimeout(() => {
        clearTimers.delete(region)
        region.textContent = ''
      }, clearAfterMs))
    }, 0))
  }

  return { announce, clear }
}

/** Тестовая/служебная очистка: снимает хост и все отложенные записи. */
export function resetAnnouncer(): void {
  for (const map of [writeTimers, clearTimers]) {
    for (const handle of map.values()) clearTimeout(handle)
    map.clear()
  }

  if (typeof document !== 'undefined')
    document.getElementById(HOST_ID)?.remove()

  host = null
}
