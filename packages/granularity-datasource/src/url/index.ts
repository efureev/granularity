/**
 * Адаптеры адресной строки.
 *
 * Роутер не зависимость пакета: приложений на Vue Router много, но не все, а
 * тянуть его в `dependencies` ради двух вызовов значит навязать роутер тем, у
 * кого его нет. Интерфейс ниже — вся точка сопряжения; рецепт для Vue Router
 * лежит в `docs/url.md` и умещается в десять строк.
 */

export interface DataSourceUrlAdapter {
  /** Текущая строка запроса, включая `?`. */
  read: () => string
  /** Записать строку запроса. `replace` — не плодить запись в истории. */
  write: (search: string, options: { replace: boolean }) => void
  /** Подписка на внешнюю смену адреса: «назад», «вперёд», чужая навигация. */
  subscribe: (listener: () => void) => () => void
}

/**
 * Адаптер на History API — то, что работает без роутера вообще.
 *
 * Пишет через `replaceState`: перелистывание страниц и правка фильтров — не
 * навигация. Забей ими историю, и кнопка «назад» перестанет уводить со
 * страницы, а начнёт отматывать чужие клики по сортировке.
 */
export function historyUrlAdapter(): DataSourceUrlAdapter {
  return {
    read: () => (typeof window === 'undefined' ? '' : window.location.search),

    write: (search, { replace }) => {
      if (typeof window === 'undefined')
        return

      const next = `${window.location.pathname}${search}${window.location.hash}`

      if (replace)
        window.history.replaceState(window.history.state, '', next)
      else window.history.pushState(null, '', next)
    },

    subscribe: (listener) => {
      if (typeof window === 'undefined')
        return () => {}

      window.addEventListener('popstate', listener)

      return () => window.removeEventListener('popstate', listener)
    },
  }
}
