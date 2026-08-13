import process from 'node:process'
import { fileURLToPath } from 'node:url'

import {
  codegenTargets,
  GranularCodegenError,
  runRegistryCodegen,
} from '@feugene/unocss-preset-granular/codegen'

/**
 * Генерация четырёх реестров компонентов из файловой структуры.
 *
 * Компонент считается публичным, если у него есть и `index.ts`, и `config.ts`
 * в `src/components/GrX/`. Из этого списка генерируются:
 *
 *   src/index.ts                     — root-barrel (`export * from './components/GrX'`);
 *   package.json#exports             — subpath `./components/GrX`;
 *   vite.config.ts                   — entry `components/GrX/index`;
 *   src/granular-provider/shared.ts  — импорт `grXConfig` + запись в реестр.
 *
 * Зачем: списки синхронизировались руками, и пропуск любого из них не даёт
 * ошибки сборки — ломается что-то одно (tree-shaking, subpath-импорт, скан
 * UnoCSS-классов или генерация API-доки витрины), причём молча. К моменту
 * написания генератора списки уже разъехались: в `package.json` порядок
 * `GrTable, GrTabs, GrTabPanels` против `GrTable, GrTabPanels, GrTabs`
 * в трёх остальных.
 *
 * Сама механика живёт в `@feugene/unocss-preset-granular/codegen`: те же
 * реестры ведёт каждый пакет-провайдер, а companion-пакеты — ещё и whitelist
 * резолвера. Здесь остаётся только состав целей и вывод в консоль.
 *
 * Запуск: `yarn generate:registry`, `--check` — только проверка расхождения
 * (используется тестом `src/__tests__/registry.generated.test.ts`).
 */

const packageDir = fileURLToPath(new URL('..', import.meta.url))
const check = process.argv.includes('--check')

const targets = [
  codegenTargets.barrel(),
  codegenTargets.viteEntries(),
  // Своя форма subpath-экспорта: декларации лежат в `dist/types/` без сегмента
  // `src` — `rootDir` в `tsconfig.build.json` указывает на `src`. Дефолт
  // генератора описывает раскладку, которой в репозитории больше нет.
  codegenTargets.packageExports({
    entryFor: component => ({
      types: `./dist/types/components/${component}/index.d.ts`,
      import: `./dist/components/${component}/index.js`,
    }),
  }),
  ...codegenTargets.providerRegistry(),
]

// Целей больше, чем файлов: у провайдера две метки в одном `shared.ts`.
const registryCount = new Set(targets.map(target => target.file)).size

try {
  const { components, stale } = await runRegistryCodegen({ packageDir, targets, check })

  if (check) {
    if (stale.length > 0) {
      console.error(
        `[registry] реестры разошлись с \`src/components/\`: ${stale.join(', ')}\n`
        + 'Запусти `yarn generate:registry`.',
      )
      process.exitCode = 1
    }
    else {
      console.log(`[registry] все ${registryCount} реестра актуальны (${components.length} компонентов)`)
    }
  }
  else {
    console.log(`[registry] синхронизировано ${components.length} компонентов в ${registryCount} реестрах`)
  }
}
catch (error) {
  // Оснастка сломалась, а не реестры разошлись — это разные поводы, и путать
  // их не нужно: `reason` машиночитаем, сообщение уже объясняет, что делать.
  if (error instanceof GranularCodegenError) {
    console.error(`[registry] ${error.reason}: ${error.message}`)
    process.exitCode = 1
  }
  else {
    throw error
  }
}
