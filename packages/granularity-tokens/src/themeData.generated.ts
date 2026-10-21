// СГЕНЕРИРОВАНО `yarn workspace @feugene/granularity-tokens generate` — правки здесь потеряются.

import type { GrThemeData } from './types'

/** Загрузчики данных тем каталога — по чанку на тему: страница тянет только свою. */
export const grThemeDataLoaders: Readonly<Record<string, () => Promise<{ default: GrThemeData }>>> = {
  clay: () => import('./theme-data/clay.generated'),
  slate: () => import('./theme-data/slate.generated'),
}
