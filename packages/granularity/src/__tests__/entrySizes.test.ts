import { describe, expect, it } from 'vitest'

// @ts-expect-error — скрипт сборки на .mjs, типов у него нет и не нужно.
import { collectEntryFiles, componentEntries, entriesFromExports, entryOwner, formatReport, measureSet, parseImports } from '../../../../scripts/entrySizes.mjs'

/**
 * Замер веса гранулярного импорта.
 *
 * Ценность отчёта целиком в обходе графа: entry компонента почти пуст, весь код
 * лежит в общих чанках. Ошибись обход — и число станет вдвое меньше правды, а
 * заметить это в сводке нельзя.
 */
describe('parseImports', () => {
  it('берёт относительные импорты и реэкспорты, а внешние пакеты пропускает', () => {
    const source = [
      'import { ref } from "vue"',
      'import x from "./chunks/a.js"',
      'export * from "../shared/b.js"',
      'export { c } from "./c.js"',
      'import "./styles.css"',
    ].join('\n')

    expect(parseImports(source)).toEqual([
      './chunks/a.js',
      '../shared/b.js',
      './c.js',
      './styles.css',
    ])
  })

  it('строка, похожая на импорт, за импорт не считается', () => {
    expect(parseImports('const hint = "import x from \'./nope.js\'"')).toEqual([])
  })
})

describe('collectEntryFiles', () => {
  const tree: Record<string, string> = {
    '/pkg/dist/components/GrX/index.js': 'export * from "../../chunks/shared.js"\nimport "./styles.css"',
    '/pkg/dist/chunks/shared.js': 'import { a } from "./deep.js"\nimport { ref } from "vue"',
    '/pkg/dist/chunks/deep.js': 'export const a = 1',
    '/pkg/dist/components/GrX/styles.css': '.gr {}',
  }

  const readFile = (path: string): string => {
    const source = tree[path]
    if (source === undefined)
      throw new Error(`нет файла ${path}`)

    return source
  }

  it('обходит граф транзитивно, а не только сам entry', () => {
    expect(collectEntryFiles('/pkg/dist/components/GrX/index.js', readFile).sort()).toEqual([
      '/pkg/dist/chunks/deep.js',
      '/pkg/dist/chunks/shared.js',
      '/pkg/dist/components/GrX/index.js',
      '/pkg/dist/components/GrX/styles.css',
    ])
  })

  it('цикл импортов не зацикливает обход', () => {
    const cyclic: Record<string, string> = {
      '/pkg/a.js': 'import "./b.js"',
      '/pkg/b.js': 'import "./a.js"',
    }

    expect(collectEntryFiles('/pkg/a.js', (path: string) => cyclic[path] ?? '').length).toBe(2)
  })

  it('специфер в никуда обход не роняет', () => {
    expect(collectEntryFiles('/pkg/dist/chunks/shared.js', (path: string) => {
      if (path === '/pkg/dist/chunks/shared.js')
        return 'import "./missing.js"'
      throw new Error('нет файла')
    })).toEqual(['/pkg/dist/chunks/shared.js'])
  })
})

describe('entriesFromExports', () => {
  it('берёт ESM-подпути и пропускает всё остальное', () => {
    expect(entriesFromExports({
      '.': { types: './dist/types/index.d.ts', import: './dist/index.js' },
      './components/GrX': { import: './dist/components/GrX/index.js' },
      './styles.css': './dist/styles.css',
      './tokens': { types: './dist/types/tokens.d.ts' },
    })).toEqual([
      { name: '.', file: './dist/index.js' },
      { name: './components/GrX', file: './dist/components/GrX/index.js' },
    ])
  })
})

describe('formatReport', () => {
  const rows = [
    { entry: './components/GrA', gzip: 1024, files: 2 },
    { entry: './components/GrB', gzip: 4096, files: 9 },
    { entry: './components/GrC', gzip: 2048, files: 5 },
  ]

  it('сортирует по убыванию веса и режет по пределу', () => {
    const report = formatReport(rows, { limit: 2 })

    expect(report).toContain('| `./components/GrB` | 4.0 kB | 9 |')
    expect(report).toContain('| `./components/GrC` | 2.0 kB | 5 |')
    expect(report).not.toContain('GrA')
    // Урезание объявляется: молча показанный хвост читался бы как весь список.
    expect(report).toContain('из 3')
  })
})

describe('entryOwner', () => {
  it('часть составного компонента принадлежит родителю, а не себе', () => {
    expect(entryOwner('./dist/components/GrDialog/index.js')).toBe('GrDialog')
  })

  it('подпуть вне компонентов владельца не имеет', () => {
    expect(entryOwner('./dist/composables/index.js')).toBe(null)
  })
})

describe('measureSet', () => {
  const tree: Record<string, string> = {
    '/pkg/dist/components/GrA/index.js': 'import "../../chunks/shared.js"',
    '/pkg/dist/components/GrB/index.js': 'import "../../chunks/shared.js"',
    '/pkg/dist/chunks/shared.js': 'export const a = 1',
  }

  /**
   * Общий чанк оплачивается один раз, а поэнтрийный отчёт считает его в каждой
   * строке заново — на пяти тяжёлых компонентах ядра это завышение вдвое.
   */
  it('общий файл двух компонентов считается один раз', () => {
    const files = measureSet('/pkg', [
      { file: './dist/components/GrA/index.js' },
      { file: './dist/components/GrB/index.js' },
    ], (path: string) => tree[path] ?? '', () => new Uint8Array())

    expect(files.files).toBe(3)
  })
})

describe('componentEntries', () => {
  /**
   * Пять подпутей `forms-schema` ведут на одну entry: пять одинаковых строк
   * читались бы как пять компонентов, каждый в свой вес.
   */
  it('псевдонимы частей схлопываются в одну строку', () => {
    const rows = componentEntries('/pkg', {
      '.': { import: './dist/index.js' },
      './components/GrDialog': { import: './dist/components/GrDialog/index.js' },
      './components/GrDialogHeader': { import: './dist/components/GrDialog/index.js' },
      './styles.css': './dist/styles.css',
    }, () => '', () => new Uint8Array())

    expect(rows.map((row: { owner: string }) => row.owner)).toEqual(['GrDialog'])
  })
})
