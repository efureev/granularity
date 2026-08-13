/**
 * Все локали пакета одним списком.
 *
 * Подключается через subpath `@feugene/granularity-dashboard/i18n/all` и
 * уместен там, где размер бандла не важен: витрина, e2e, инструменты
 * локализации. В приложении лучше импортировать нужные языки поимённо из
 * `@feugene/granularity-dashboard/i18n` — тогда лишние отсеет tree-shaking.
 */
import type { LocaleLoaderCollection } from '@feugene/fint-i18n/core'

import { en } from './messages/en'
import { es } from './messages/es'
import { ru } from './messages/ru'

export const all: LocaleLoaderCollection[] = [en, ru, es]

export default all
