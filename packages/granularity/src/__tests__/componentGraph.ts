import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { resolve } from 'node:path'

// @ts-expect-error — скрипт сборки на .mjs, типов у него нет и не нужно.
import { readDeclaredDependencies as readDeclared } from '../../scripts/declaredDependencies.mjs'

// В jsdom `import.meta.url` не file-scheme — пути от cwd пакета, как в `cssContrast.ts`.
const pkgDir = process.cwd()
const componentsDir = resolve(pkgDir, 'src/components')

/** Почему зависимость обязательна: что именно утекает в чужую директорию сборки. */
export type DependencyKind
  /** Модуль импортирует компонент соседа — статически или через `import()`. */
  = | 'component'
    /** Модуль подмешивает себе safelist или строки классов соседа. */
    | 'styles'

export interface DependencyUsage {
  dependency: string
  kind: DependencyKind
  /** Путь относительно `src/components/` — чтобы сообщение теста было адресным. */
  source: string
}

export const publicComponents: readonly string[] = readdirSync(componentsDir, { withFileTypes: true })
  .filter(entry => entry.isDirectory() && entry.name.startsWith('Gr'))
  .map(entry => entry.name)
  .filter(name => (
    existsSync(resolve(componentsDir, name, 'index.ts'))
    && existsSync(resolve(componentsDir, name, 'config.ts'))
  ))

const knownComponents = new Set(publicComponents)

/**
 * Комментарии выбрасываются до разбора: закомментированный импорт соседа
 * иначе попадёт в граф и потребует зависимости, которой в сборке нет.
 */
function stripComments(source: string): string {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/(^|[^:])\/\/[^\n]*/g, '$1')
}

/**
 * Исходники компонента: всё дерево его директории, кроме тестов.
 *
 * Экспортируется, потому что «что считается исходником компонента» обязано
 * быть определено один раз: тем же обходом пользуется гейт safelist, и
 * разойдись они — один гейт видел бы вложенные `composables/*.ts`, а другой нет.
 */
export function componentSourceFiles(dir: string, acc: string[] = []): string[] {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = resolve(dir, entry.name)
    if (entry.isDirectory()) {
      if (entry.name !== '__tests__')
        componentSourceFiles(path, acc)
    }
    else if (/\.(?:vue|ts)$/.test(entry.name) && !entry.name.endsWith('.test.ts')) {
      acc.push(path)
    }
  }
  return acc
}

/**
 * Импорт компонента: либо дефолтный из бочки соседа с именем `GrX`, либо
 * прямо из его `.vue`. Именованные импорты из бочки (`GR_RADIO_GROUP_CONTEXT`)
 * компонентом не являются — они не тянут разметку.
 */
const DEFAULT_IMPORT = /import\s+(type\s+)?([A-Za-z_$][\w$]*)\s*(?:,\s*\{[^}]*\})?\s*from\s+['"]\.\.\/(Gr[A-Za-z0-9]+)(?:\/([^'"]+))?['"]/g
const NAMED_IMPORT = /import\s+(type\s+)?\{([^}]*)\}\s*from\s+['"]\.\.\/(Gr[A-Za-z0-9]+)\/([^'"]+)['"]/g
/** Ленивый компонент — такое же ребро, как статический импорт (SPEC §4.1). */
const DYNAMIC_IMPORT = /import\(\s*['"]\.\.\/(Gr[A-Za-z0-9]+)(?:\/([^'"]+))?['"]\s*\)/g

/**
 * Зависимости компонента, выведенные из исходников.
 *
 * Это НИЖНЯЯ граница `config.dependencies`: всё перечисленное здесь при сборке
 * уезжает в `dist/components/<Сосед>/`, куда пресет заглядывает, только если
 * зависимость объявлена.
 *
 * Граница именно нижняя, а не точная: увидеть отсюда можно лишь то, что
 * записано в исходниках. Рёбра, которые появляются на сборке (общий чанк
 * `dist/chunks/*`, `groups/<g>/shared/*`), видит только `yarn doctor` — он
 * читает `dist`. Обратное тоже верно: доктор не умеет находить ЛИШНИЕ
 * объявления, потому что в `dist` их следа нет. Гейты дополняют друг друга,
 * а не дублируют.
 */
export function collectRequiredDependencies(component: string): DependencyUsage[] {
  const usages = new Map<string, DependencyUsage>()

  for (const file of componentSourceFiles(resolve(componentsDir, component))) {
    const source = file.slice(componentsDir.length + 1)

    for (const { dependency, kind } of parseDependencyUsages(readFileSync(file, 'utf8'))) {
      if (dependency === component || !knownComponents.has(dependency))
        continue
      // `component` сильнее `styles`: разметка тянет за собой и классы.
      if (kind === 'component' || !usages.has(dependency))
        usages.set(dependency, { dependency, kind, source })
    }
  }

  return [...usages.values()].sort((a, b) => a.dependency.localeCompare(b.dependency))
}

/**
 * Разбор одного файла — без FS, чтобы правила распознавания ребра можно было
 * проверить прямо, а не подбирая компонент, который случайно их покрывает.
 */
export function parseDependencyUsages(
  fileContent: string,
): Array<{ dependency: string, kind: DependencyKind }> {
  const found: Array<{ dependency: string, kind: DependencyKind }> = []
  const code = stripComments(fileContent)

  for (const [, typeOnly, local, dependency, subpath] of code.matchAll(DEFAULT_IMPORT)) {
    if (typeOnly)
      continue
    const isComponent = subpath === undefined
      ? /^Gr[A-Z]/.test(local)
      : subpath.endsWith('.vue')
    if (isComponent)
      found.push({ dependency, kind: 'component' })
  }

  for (const [, typeOnly, clause, dependency, subpath] of code.matchAll(NAMED_IMPORT)) {
    if (typeOnly || !/safelist|Styles/i.test(subpath))
      continue
    const hasValue = clause.split(',').some(name => name.trim() && !name.trim().startsWith('type '))
    if (hasValue)
      found.push({ dependency, kind: 'styles' })
  }

  for (const [, dependency, subpath] of code.matchAll(DYNAMIC_IMPORT)) {
    // Бочка соседа или его SFC; `import('../GrX/context')` ничего не рендерит.
    if (subpath === undefined || subpath.endsWith('.vue'))
      found.push({ dependency, kind: 'component' })
  }

  return found
}

/**
 * Объявленные зависимости. Разбор живёт в `scripts/declaredDependencies.mjs`:
 * тот же `config.dependencies` читает гейт изоляции от `dist`, и разойдись
 * разборы — гейты начали бы спорить о том, что компонент объявил.
 */
export function readDeclaredDependencies(component: string): string[] {
  return readDeclared(componentsDir, component)
}

export function isComponentDir(name: string): boolean {
  const path = resolve(componentsDir, name)
  return existsSync(path) && statSync(path).isDirectory()
}
