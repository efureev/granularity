import { readFileSync, readdirSync } from 'node:fs'
import { resolve } from 'node:path'
import process from 'node:process'

import { describe, expect, it } from 'vitest'

/**
 * Имена эмитов — camelCase, параметр `e`, без kebab.
 *
 * Гейт домена, а не фабрика: у каждого пакета свой набор компонентов, а правило
 * общее — потребитель пишет `@row-change` в шаблоне и `onRowChange` в JSX,
 * и обе формы обязаны выводиться из одного имени.
 */
const componentsDir = resolve(process.cwd(), 'src/components')

function sfcFiles(): { file: string, source: string }[] {
  return readdirSync(componentsDir, { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .flatMap(entry => readdirSync(resolve(componentsDir, entry.name))
      .filter(file => file.endsWith('.vue'))
      .map(file => ({
        file: `${entry.name}/${file}`,
        source: readFileSync(resolve(componentsDir, entry.name, file), 'utf8'),
      })))
}

describe('именование эмитов', () => {
  const emitDeclaration = /\(e: '([^']+)'/g

  it('нашёл компоненты', () => {
    expect(sfcFiles().length).toBeGreaterThan(0)
  })

  it('имена в camelCase, без kebab и без двоеточий кроме `update:`', () => {
    const offenders: string[] = []

    for (const { file, source } of sfcFiles()) {
      for (const match of source.matchAll(emitDeclaration)) {
        const name = match[1]!
        if (name.startsWith('update:')) continue
        if (!/^[a-z][a-zA-Z0-9]*$/.test(name)) offenders.push(`${file}: ${name}`)
      }
    }

    expect(offenders, offenders.join('\n')).toEqual([])
  })
})
