import { readdirSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * Гейт нейминга эмитов.
 *
 * В пакете сосуществовали два регистра: 7 эмитов camelCase (`visibleChange`,
 * `nodeClick`, `stateChange`, …) и один kebab-case (`sort-change`). В шаблоне
 * это разные события для читателя, а IDE не подсказывает.
 *
 * Канон — camelCase, и не только по большинству. Проверено поведением Vue:
 * шаблонный `@sort-change` компилируется в проп `onSortChange`, который
 * находят **оба** объявления, а `onSort-change` — только kebab-объявление.
 * То есть camelCase строго шире: он принимает и `@sort-change`, и `@sortChange`.
 *
 * Побочный вывод: «переходный период с двойным эмитом» здесь навредил бы —
 * оба имени резолвятся в один и тот же `onSortChange`, и обработчик
 * потребителя вызвался бы дважды.
 *
 * `update:*` — отдельный случай (`v-model`), двоеточие в них обязательно.
 */

const componentsDir = resolve(process.cwd(), 'src/components')

/** Имя эмита из `defineEmits<{ (e: 'name', …): void }>()`. */
const EMIT_NAME = /\(\s*e(?:vent)?\s*:\s*'([^']+)'/g

function emitNames(): { path: string, name: string }[] {
  return readdirSync(componentsDir, { withFileTypes: true })
    .filter(entry => entry.isDirectory() && entry.name.startsWith('Gr'))
    .flatMap(entry => readdirSync(resolve(componentsDir, entry.name))
      .filter(file => file.endsWith('.vue') && !file.includes('.test.'))
      .flatMap((file) => {
        const source = readFileSync(resolve(componentsDir, entry.name, file), 'utf8')
        return [...source.matchAll(EMIT_NAME)].map(match => ({
          path: `${entry.name}/${file}`,
          name: match[1],
        }))
      }))
}

describe('нейминг эмитов', () => {
  it('ни один эмит не объявлен в kebab-case', () => {
    const offenders = emitNames()
      .filter(({ name }) => !name.startsWith('update:') && name.includes('-'))
      .map(({ path, name }) => `${path}: '${name}'`)

    expect(offenders, offenders.join('\n')).toEqual([])
  })

  it('составные имена — camelCase, а не PascalCase и не snake_case', () => {
    const offenders = emitNames()
      .filter(({ name }) => !name.startsWith('update:'))
      .filter(({ name }) => /^[A-Z]/.test(name) || name.includes('_'))
      .map(({ path, name }) => `${path}: '${name}'`)

    expect(offenders, offenders.join('\n')).toEqual([])
  })
})
