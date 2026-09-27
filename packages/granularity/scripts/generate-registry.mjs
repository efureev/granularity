import process from 'node:process'
import { fileURLToPath } from 'node:url'

import {
  codegenTargets,
  GranumCodegenError,
  runRegistryCodegen,
} from '@feugene/granum/codegen'

/**
 * Генерация трёх реестров компонентов из файловой структуры.
 *
 * Компонент считается публичным, если у него есть и `index.ts`, и `config.ts`
 * в `src/components/GrX/`. Из этого списка генерируются:
 *
 *   src/index.ts                     — root-barrel (`export * from './components/GrX'`);
 *   package.json#exports             — subpath `./components/GrX`, алиасы на
 *                                      подкомпоненты (`./components/GrTimelineItem`)
 *                                      и экспорт `./granum.manifest.json`;
 *   src/granular-provider/shared.ts  — импорт `grXConfig` + запись в реестр.
 *
 * Entry `components/GrX/index` в `vite.config.ts` реестром больше не является:
 * их строит `granumProvider()` из того же реестра провайдера (B-4).
 *
 * Зачем: списки синхронизировались руками, и пропуск любого из них не даёт
 * ошибки сборки — ломается что-то одно (tree-shaking, subpath-импорт, скан
 * UnoCSS-классов или генерация API-доки витрины), причём молча. К моменту
 * написания генератора списки уже разъехались: в `package.json` порядок
 * `GrTable, GrTabs, GrTabPanels` против `GrTable, GrTabPanels, GrTabs`
 * в трёх остальных.
 *
 * Сама механика живёт в `@feugene/granum/codegen`: те же реестры ведёт каждый
 * пакет-провайдер, а companion-пакеты — ещё и whitelist резолвера. Здесь
 * остаётся только состав целей и вывод в консоль.
 *
 * Запуск: `yarn generate:registry`, `--check` — только проверка расхождения
 * (используется тестом `src/__tests__/registry.generated.test.ts`).
 */

const packageDir = fileURLToPath(new URL('..', import.meta.url))
const check = process.argv.includes('--check')

// Метки в файлах исторически именованы по пакету, а не по генератору: менять
// их значит трогать все реестры разом ради косметики.
const NAMESPACE = 'granularity:components'
const PROVIDER_REGISTRY_FILE = 'src/granular-provider/shared.ts'

const targets = [
  codegenTargets.barrel(),
  // Без `./granum.manifest.json` приложение не найдёт манифест через `exports`,
  // и сборка провайдера упадёт с `PackageExportsError` (M-6, INV-LAY-2).
  codegenTargets.manifestExport(),
  // Своя форма subpath-экспорта: декларации лежат в `dist/types/` без сегмента
  // `src` — `rootDir` в `tsconfig.build.json` указывает на `src`. Дефолт
  // генератора описывает раскладку, которой в репозитории больше нет.
  //
  // `subcomponents` добавляет алиасы на части составных компонентов
  // (`GrTimelineItem` → модуль `GrTimeline`): своей entry у них нет и не должно
  // быть, а вот импортировать их гранулярно обязано быть можно.
  codegenTargets.packageExports({
    subcomponents: true,
    entryFor: component => ({
      types: `./dist/types/components/${component}/index.d.ts`,
      import: `./dist/components/${component}/index.js`,
    }),
  }),
  // Реестр провайдера — своими метками, а не `providerRegistry()`: у пакета он
  // именованная карта (`GrX: grXConfig`), из которой растут subpath-экспорты и
  // тип `GranularityComponentName`, а granum рендерит массив дескрипторов для
  // `components: [ … ]`. Импорты — без расширения, как во всём пакете.
  codegenTargets.markedBlock({
    file: PROVIDER_REGISTRY_FILE,
    blockId: 'imports',
    lines: (components, context) => components.map(component => (
      `import { ${context.configExportName(component)} } from '../components/${context.componentPath(component)}/config'`
    )),
  }),
  codegenTargets.markedBlock({
    file: PROVIDER_REGISTRY_FILE,
    blockId: 'registry',
    lines: (components, context) => components.map(component => (
      `${component}: ${context.configExportName(component)},`
    )),
  }),
]

// Целей больше, чем файлов: у провайдера две метки в одном `shared.ts`,
// а у `package.json` — subpath-ряд и экспорт манифеста.
const registryCount = new Set(targets.map(target => target.file)).size

try {
  const { components, stale } = await runRegistryCodegen({ packageDir, targets, check, namespace: NAMESPACE })

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
  if (error instanceof GranumCodegenError) {
    console.error(`[registry] ${error.reason}: ${error.message}`)
    process.exitCode = 1
  }
  else {
    throw error
  }
}
