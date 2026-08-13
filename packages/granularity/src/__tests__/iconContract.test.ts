import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative, resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * Гейт контракта иконок — обратная сторона `presetUtilities.test.ts`.
 *
 * Там правило «класс обязан генерироваться связкой, которую собирает
 * потребитель», здесь — «иконочного класса в разметке пакета быть не должно
 * вовсе». `i-lucide-*` превращает в CSS не пакет, а `presetIcons` в конфиге
 * приложения: `presetGranular` его не подмешивает, и у потребителя без этого
 * пресета место под иконку остаётся пустым — сборка зелёная, типы целы, видит
 * это только тот, кто открыл страницу.
 *
 * Свои иконки пакет рисует компонентами `~icons/lucide/*`: `unplugin-icons`
 * вкомпилирует их в `dist` на сборке, и конфиг потребителя на них не влияет.
 * Класс остаётся законным ровно в одном месте — в значении пропа `icon`,
 * который **передал потребитель**: его генерирует его же сборка.
 */

const componentsDir = resolve(process.cwd(), 'src/components')

/** `i-<коллекция>-<имя>`: форма иконочной утилиты любого пресета, не только lucide. */
const ICON_CLASS = /\bi-[a-z][a-z0-9]*-[a-z0-9][a-z0-9-]*/g

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry)

    if (statSync(full).isDirectory())
      return entry === '__tests__' ? [] : sourceFiles(full)

    return /\.(?:vue|ts)$/.test(entry) ? [full] : []
  })
}

/** Комментарии — не разметка: `i-lucide-heart` в JSDoc это пример для потребителя. */
function stripComments(source: string): string {
  return source
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/(^|[^:])\/\/[^\n]*/g, '$1 ')
}

describe('контракт иконок', () => {
  it('пакет не рисует свои иконки классами — только компонентами', () => {
    const offenders = sourceFiles(componentsDir).flatMap((file) => {
      const found = stripComments(readFileSync(file, 'utf8')).match(ICON_CLASS)

      return found ? [`${relative(process.cwd(), file)}: ${[...new Set(found)].join(', ')}`] : []
    })

    expect(offenders, offenders.join('\n')).toEqual([])
  })
})
