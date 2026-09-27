import process from 'node:process'
import { fileURLToPath } from 'node:url'

import {
  codegenTargets,
  GranumCodegenError,
  runRegistryCodegen,
} from '@feugene/granum/codegen'

/**
 * Генерация реестров компонентов из файловой структуры.
 *
 * Компонент считается публичным, если у него есть и `index.ts`, и `config.ts`
 * в `src/components/GrX/`. Из этого списка генерируются:
 *
 *   src/index.ts                     — root-barrel (`export * from './components/GrX'`);
 *   package.json#exports             — subpath `./components/GrX`;
 *   package.json#exports             — экспорт `./granum.manifest.json`;
 *   src/granular-provider/shared.ts  — импорт `grXConfig` + запись в реестр;
 *   src/componentNames.ts            — список имён для резолвера и раскладки чанков.
 *
 * Пропуск любого не даёт ошибки сборки: ломается что-то одно — tree-shaking,
 * subpath-импорт, авто-импорт или скан UnoCSS-классов, — и молча. Механика
 * общая для всех пакетов-провайдеров и живёт в
 * `@feugene/granum/codegen`; здесь только состав целей.
 *
 * Запуск: `yarn generate:registry`, `--check` — только проверка расхождения.
 */

const packageDir = fileURLToPath(new URL('..', import.meta.url))
const check = process.argv.includes('--check')

// Метки в файлах исторически именованы по пакету, а не по генератору.
const NAMESPACE = 'granularity:components'
const PROVIDER_REGISTRY_FILE = 'src/granular-provider/shared.ts'

const targets = [
  codegenTargets.barrel(),
  // Без `./granum.manifest.json` приложение не найдёт манифест через `exports`,
  // и сборка провайдера упадёт с `PackageExportsError`.
  codegenTargets.manifestExport(),
  // Своя форма subpath-экспорта: декларации этого пакета лежат в
  // `dist/types/` без сегмента `src` — `rootDir` в `tsconfig.build.json`
  // указывает на `src`. Дефолт генератора описывает раскладку ядра, где
  // паразитный `src` в пути типов остался с самого начала.
  // `subcomponents` добавляет алиасы на части составных компонентов
  // (`GrSchemaField` → модуль `GrSchemaForm`): своей entry у них нет и не
  // должно быть, а импортировать их гранулярно обязано быть можно.
  codegenTargets.packageExports({
    subcomponents: true,
    entryFor: component => ({
      types: `./dist/types/components/${component}/index.d.ts`,
      import: `./dist/components/${component}/index.js`,
    }),
  }),
  // Реестр провайдера — своими метками, а не `providerRegistry()`: у пакета он
  // именованная карта (`GrX: grXConfig`), а granum рендерит массив дескрипторов.
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
  // Своя цель: список имён, который читают резолвер и конфиг сборки.
  codegenTargets.markedBlock({
    file: 'src/componentNames.ts',
    lines: components => components.map(component => `'${component}',`),
  }),
  // Части составных компонентов — отдельным списком, а не в общем: конфиг
  // сборки раскладывает по первому CSS-ассеты, а своей директории в `dist` у
  // части нет. Резолверу же нужны оба: имя пишется в шаблоне как обычное.
  codegenTargets.markedBlock({
    file: 'src/componentNames.ts',
    blockId: 'subcomponents',
    lines: (_components, context) => Object.keys(context.subcomponents)
      .sort()
      .map(name => `'${name}',`),
  }),
]

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
  // Оснастка сломалась, а не реестры разошлись — разные поводы, путать не нужно.
  if (error instanceof GranumCodegenError) {
    console.error(`[registry] ${error.reason}: ${error.message}`)
    process.exitCode = 1
  }
  else {
    throw error
  }
}
