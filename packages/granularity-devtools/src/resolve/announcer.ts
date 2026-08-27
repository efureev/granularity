/**
 * Объявления живого региона — то, что услышал бы экранный диктор.
 *
 * Ядро держит один канал `aria-live` на документ и помечает его узлы атрибутом
 * `data-gr-announcer-region`. Этого достаточно, чтобы наблюдать за ним снаружи:
 * правок в ядре раздел не требует.
 */

export const ANNOUNCER_SELECTOR = '[data-gr-announcer-region]'

export interface GrAnnouncement {
  politeness: string
  text: string
}

/**
 * Объявления из пачки мутаций.
 *
 * Регион очищается через семь секунд после объявления, и очистка приходит такой
 * же мутацией — пустой текст в ленту не идёт: диктор в этот момент молчит.
 */
export function announcementsFromMutations(mutations: readonly MutationRecord[]): GrAnnouncement[] {
  const announcements: GrAnnouncement[] = []

  for (const mutation of mutations) {
    const target = mutation.target as Node & { parentElement?: HTMLElement | null }
    const element = target instanceof Element ? target : target.parentElement ?? null
    const region = element?.closest?.(ANNOUNCER_SELECTOR) ?? null
    if (!region)
      continue

    const text = region.textContent?.trim() ?? ''
    if (!text)
      continue

    const politeness = region.getAttribute('data-gr-announcer-region') ?? 'polite'
    const last = announcements[announcements.length - 1]
    // Vue пишет текст одной операцией, но браузер вправе прислать её несколькими
    // мутациями: одинаковые подряд — это одно объявление, а не повтор.
    if (last?.text === text && last.politeness === politeness)
      continue

    announcements.push({ politeness, text })
  }

  return announcements
}
