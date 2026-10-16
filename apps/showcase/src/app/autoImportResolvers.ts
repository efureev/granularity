import { fileURLToPath, URL } from 'node:url'

import { GranularityResolver } from '@feugene/unplugin-granularity'

/**
 * Резолвер `unplugin-vue-components` для авто-импорта компонентов дизайн-системы
 * в шаблонах витрины — один на ядро и все спутники.
 *
 * Компоненты он берёт из `exports` пакетов, которые витрина объявила в своём
 * `package.json`: список вести не нужно, порядок резолверов не важен. Часть
 * составного компонента (`GrDropdownMenuItem`) приезжает из подпути родителя —
 * так её видит селекция granum, и так же лежит `dist`, куда ведёт алиас
 * `vite.config.ts`.
 *
 * `root` задан явно: конфиг исполняют и `vite`, и `vitest`, а рабочий каталог у
 * них не обязан совпадать с каталогом витрины.
 */
export function granularityAutoImportResolvers() {
  return GranularityResolver({
    root: fileURLToPath(new URL('../../', import.meta.url)),
  })
}
