import process from 'node:process'
import { fileURLToPath } from 'node:url'

import {
  codegenTargets,
  GranularCodegenError,
  runRegistryCodegen,
} from '@feugene/unocss-preset-granular/codegen'

/**
 * Генерация реестров компонентов из файловой структуры.
 *
 * Компонент считается публичным, если у него есть и `index.ts`, и `config.ts`
 * в `src/components/GrX/`. Из этого списка генерируются:
 *
 *   src/index.ts                     — root-barrel (`export * from './components/GrX'`);
 *   package.json#exports             — subpath `./components/GrX`;
 *   vite.config.ts                   — entry `components/GrX/index`;
 *   src/granular-provider/shared.ts  — импорт `grXConfig` + запись в реестр;
 *   src/componentNames.ts            — список имён для резолвера и раскладки чанков.
 *
 * Пропуск любого не даёт ошибки сборки: ломается что-то одно — tree-shaking,
 * subpath-импорт, авто-импорт или скан UnoCSS-классов, — и молча. Механика
 * общая для всех пакетов-провайдеров и живёт в
 * `@feugene/unocss-preset-granular/codegen`; здесь только состав целей.
 *
 * Запуск: `yarn generate:registry`, `--check` — только проверка расхождения.
 */

const packageDir = fileURLToPath(new URL('..', import.meta.url))
const check = process.argv.includes('--check')

const targets = [
  codegenTargets.barrel(),
  codegenTargets.viteEntries(),
  // Своя форма subpath-экспорта: декларации этого пакета лежат в
  // `dist/types/` без сегмента `src` — `rootDir` в `tsconfig.build.json`
  // указывает на `src`. Дефолт генератора описывает раскладку ядра, где
  // паразитный `src` в пути типов остался с самого начала.
  codegenTargets.packageExports({
    subcomponents: true,
    entryFor: component => ({
      types: `./dist/types/components/${component}/index.d.ts`,
      import: `./dist/components/${component}/index.js`,
    }),
  }),
  ...codegenTargets.providerRegistry(),
  // Своя цель: список имён, который читают резолвер и конфиг сборки.
  codegenTargets.markedBlock({
    file: 'src/componentNames.ts',
    lines: components => components.map(component => `'${component}',`),
  }),
]

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
  // Оснастка сломалась, а не реестры разошлись — разные поводы, путать не нужно.
  if (error instanceof GranularCodegenError) {
    console.error(`[registry] ${error.reason}: ${error.message}`)
    process.exitCode = 1
  }
  else {
    throw error
  }
}
