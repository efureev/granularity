import type { GrAnnouncerPoliteness } from '../composables/useAnnouncer'

/**
 * Текст живого региона.
 *
 * Ждать здесь обязательно: `announce` пишет в регион **отложенным** макротаском,
 * и это не деталь реализации, а условие работы. Регион, в котором текст
 * появился в том же кадре, что и сам регион, часть AT не объявляет вовсе;
 * поэтому синхронное чтение сразу после действия покажет пустую строку.
 */
export async function announced(politeness: GrAnnouncerPoliteness = 'polite'): Promise<string> {
  await new Promise(resolve => setTimeout(resolve, 2))

  return document.querySelector(`[data-gr-announcer-region="${politeness}"]`)?.textContent ?? ''
}
