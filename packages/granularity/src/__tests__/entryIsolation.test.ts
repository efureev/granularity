import { describe, expect, it } from 'vitest'

import {
  componentEntries,
  dependencyClosure,
  inspectEntry,
  isReexportOnly,
  isVirtualOnly,
  markupOwners,
// @ts-expect-error — скрипт сборки на .mjs, типов у него нет и не нужно.
} from '../../scripts/entryIsolation.mjs'

/**
 * Правила гейта изоляции проверяются здесь, а не на собранном пакете: гейт
 * зелен ровно тогда, когда утечки нет, и на зелёном `dist` ни одно из правил
 * не исполняется ни разу. Ошибись любое — гейт молчал бы всегда.
 */
describe('markupOwners', () => {
  it('чужой компонент опознаётся по `.vue` в карте', () => {
    expect(markupOwners(JSON.stringify({
      sources: ['../../src/components/GrModal/GrModal.vue'],
    }))).toEqual(['GrModal'])
  })

  it('чужой `.ts` разметкой не считается — это общая среда пакета', () => {
    expect(markupOwners(JSON.stringify({
      sources: [
        '../../src/components/GrConfigProvider/context.ts',
        '../../src/components/shared/tones.ts',
      ],
    }))).toEqual([])
  })

  it('битая карта обход не роняет', () => {
    expect(markupOwners('не json')).toEqual([])
  })
})

describe('isReexportOnly', () => {
  it('переходник своего кода не несёт', () => {
    expect(isReexportOnly(
      'import { t as GrButton } from "./chunks/GrButton-CS4TqMtG.js";\n'
      + 'export { GrButton as default, GrButton };',
    )).toBe(true)
  })

  it('файл со своим кодом переходником не считается', () => {
    expect(isReexportOnly('import { ref } from "vue";\nconst state = ref(0);')).toBe(false)
  })

  it('точка с запятой внутри строки за конец импорта не принимается', () => {
    expect(isReexportOnly('import x from "./a;b.js";')).toBe(true)
  })
})

describe('isVirtualOnly', () => {
  it('модуль сборки без исходника на диске прозрачен', () => {
    expect(isVirtualOnly(
      '//#region \\0plugin-vue:export-helper\nvar helper = (sfc) => sfc;\n//#endregion',
    )).toBe(true)
  })

  it('настоящий модуль рядом с виртуальным прозрачным его не делает', () => {
    expect(isVirtualOnly(
      '//#region \\0plugin-vue:export-helper\nvar helper = (sfc) => sfc;\n'
      + '//#region src/components/GrModal/GrModal.vue\nvar GrModal = {};',
    )).toBe(false)
  })

  it('файл без заголовков модулей прозрачным не объявляется', () => {
    expect(isVirtualOnly('var x = 1;')).toBe(false)
  })
})

describe('dependencyClosure', () => {
  const declared: Record<string, string[]> = {
    GrDialogService: ['GrConfirmDialog'],
    GrConfirmDialog: ['GrDialog'],
    GrDialog: ['GrModal'],
    GrModal: [],
  }

  it('транзитивное входит: пакет объявляет только прямое ребро', () => {
    expect([...dependencyClosure('GrDialogService', (c: string) => declared[c] ?? [])].sort())
      .toEqual(['GrConfirmDialog', 'GrDialog', 'GrModal'])
  })

  it('цикл не зацикливает обход', () => {
    const cyclic: Record<string, string[]> = { GrA: ['GrB'], GrB: ['GrA'] }

    expect([...dependencyClosure('GrA', (c: string) => cyclic[c] ?? [])].sort()).toEqual(['GrA', 'GrB'])
  })
})

describe('componentEntries', () => {
  /**
   * `./components/GrDialogHeader` ведёт на entry `GrDialog`: у части своей
   * сборки нет. Считай гейт её отдельной entry — он потребовал бы от неё
   * объявить зависимости родителя, которых у части нет и быть не может.
   */
  it('псевдонимы частей схлопываются в владельца', () => {
    expect(componentEntries({
      '.': { import: './dist/index.js' },
      './components/GrDialog': { import: './dist/components/GrDialog/index.js' },
      './components/GrDialogHeader': { import: './dist/components/GrDialog/index.js' },
      './components/GrModal': { import: './dist/components/GrModal/index.js' },
      './styles.css': './dist/styles.css',
    }, '/pkg').map((entry: { owner: string }) => entry.owner)).toEqual(['GrDialog', 'GrModal'])
  })
})

describe('inspectEntry', () => {
  const tree: Record<string, string> = {
    '/pkg/dist/components/GrDialog/index.js': 'import "../../chunks/a.js";',
    '/pkg/dist/components/GrDialog/index.js.map': JSON.stringify({ sources: ['../../src/components/GrDialog/GrDialog.vue'] }),
    '/pkg/dist/chunks/a.js': 'import "./b.js";',
    '/pkg/dist/chunks/a.js.map': JSON.stringify({ sources: ['../../src/components/GrModal/GrModal.vue'] }),
    '/pkg/dist/chunks/b.js': 'var own = 1;',
  }

  const read = (path: string): string => tree[path]
  const exists = (path: string): boolean => path in tree

  it('собирает разметку по всему графу, а не по одному entry', () => {
    expect(inspectEntry(Object.keys(tree).filter(p => p.endsWith('.js')), read, exists).reached)
      .toEqual(['GrDialog', 'GrModal'])
  })

  it('чанк без карты и со своим кодом объявляется слепой зоной, а не чистым', () => {
    expect(inspectEntry(['/pkg/dist/chunks/b.js'], read, exists).blind).toEqual(['/pkg/dist/chunks/b.js'])
  })

  it('CSS в атрибуцию не идёт: разметку несёт только JS', () => {
    expect(inspectEntry(['/pkg/dist/components/GrDialog/styles.css'], read, exists))
      .toEqual({ reached: [], blind: [] })
  })
})
