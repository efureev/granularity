import { existsSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

import { catalog } from '../app/catalog'
import { comparisonTable, componentDoc, designDoc } from '../app/docs'

const designsDir = fileURLToPath(new URL('../designs/', import.meta.url))

describe('каталог макетов', () => {
  for (const component of catalog) {
    describe(component.name, () => {
      it('ровно одна реализованная версия', () => {
        expect(component.versions.filter(version => version.status === 'implemented')).toHaveLength(1)
      })

      it('id версий и макетов уникальны', () => {
        const versionIds = component.versions.map(version => version.id)
        expect(new Set(versionIds).size).toBe(versionIds.length)

        for (const version of component.versions) {
          const boardIds = version.boards.map(board => board.id)
          expect(new Set(boardIds).size, version.id).toBe(boardIds.length)
        }
      })

      it('каталог и файлы на диске совпадают', () => {
        const onDisk = readdirSync(`${designsDir}${component.id}`).sort()
        expect(onDisk).toEqual(component.versions.map(version => version.id).sort())

        for (const version of component.versions) {
          const dir = `${designsDir}${component.id}/${version.id}`
          const boards = readdirSync(dir).filter(file => file.endsWith('.vue')).map(file => file.replace(/\.vue$/, ''))

          expect(boards.sort(), version.id).toEqual(version.boards.map(board => board.file).sort())
          expect(existsSync(`${dir}/concept.css`), `${version.id}/concept.css`).toBe(true)
        }
      })

      it('у каждой версии есть раздел в docs/design', () => {
        const doc = designDoc(component.id)
        expect(doc).toBeDefined()

        for (const version of component.versions)
          expect(doc!.sections.has(version.docHeading), version.docHeading).toBe(true)
      })

      it('сравнение версий знает каждую версию', () => {
        const table = comparisonTable(designDoc(component.id)!)
        expect(table?.columns).toEqual(component.versions.map(version => version.title))
      })

      it('страница компонента даёт «Когда брать» и «Когда взять другое»', () => {
        const doc = componentDoc(component.id)
        expect(doc?.sections.has('Когда брать')).toBe(true)
        expect(doc?.sections.has('Когда взять другое')).toBe(true)
      })
    })
  }
})
