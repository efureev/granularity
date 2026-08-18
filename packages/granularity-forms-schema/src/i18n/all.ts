import type { LocaleLoaderCollection } from '@feugene/fint-i18n/core'

import { en } from './messages/en'
import { es } from './messages/es'
import { ru } from './messages/ru'

/**
 * Агрегат всех локалей — только для демо, e2e и тулинга.
 *
 * Из `messages/index.ts` не реэкспортируется намеренно: иначе импорт одной
 * локали затянул бы остальные, и tree-shaking по языкам сломался бы.
 */
export const all: LocaleLoaderCollection[] = [en, ru, es]

export default all
