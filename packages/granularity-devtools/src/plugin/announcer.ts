import type { PluginSetupFunction } from '@vue/devtools-kit'

import { announcementsFromMutations } from '../resolve/announcer'

type DevtoolsApi = Parameters<PluginSetupFunction>[0]

const TIMELINE_ID = 'granularity:announcer'

/**
 * Лента объявлений: единственный способ проверить живой регион в браузере, не
 * запуская экранный диктор.
 */
export function registerAnnouncer(api: DevtoolsApi): void {
  api.addTimelineLayer({
    id: TIMELINE_ID,
    label: 'Granularity announcements',
    color: 0x0EA5E9,
  })

  if (typeof MutationObserver === 'undefined')
    return

  const observer = new MutationObserver((mutations) => {
    for (const announcement of announcementsFromMutations(mutations)) {
      api.addTimelineEvent({
        layerId: TIMELINE_ID,
        event: {
          time: api.now(),
          data: announcement,
          title: announcement.text,
          subtitle: `aria-live: ${announcement.politeness}`,
          logType: announcement.politeness === 'assertive' ? 'warning' : 'default',
        },
      })
    }
  })

  // Наблюдаем за документом целиком, а не за самим регионом: хост создаётся
  // лениво, при первом `useAnnouncer()`, и к моменту подключения панели его
  // обычно ещё нет.
  observer.observe(document.body, { subtree: true, childList: true, characterData: true })
}
