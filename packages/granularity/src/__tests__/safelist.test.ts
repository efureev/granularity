import { readdirSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { createGenerator, presetMini } from 'unocss'
import { presetGranular } from '@feugene/unocss-preset-granular'
import { describe, expect, it } from 'vitest'

/**
 * Гейт safelist-контракта.
 *
 * Пресет сканирует ровно `<packageBaseUrl>/components/<Name>/**`, а любой
 * `.ts`-хелпер компонента бандлер волен вынести в общий `dist/chunks/` —
 * достаточно, чтобы на модуль сослались из двух мест (например, из `.vue` и
 * из `safelist.ts`). После выноса классы, живущие в нём строковыми литералами,
 * не видит ни скан, ни safelist: у изолированного потребителя компонент
 * рендерится без цветов, теней и фокус-колец, а в витрине дефект маскируется
 * соседями по странице, которые генерируют те же утилиты.
 *
 * Поэтому правило сформулировано от исходников, а не от `dist`: класс из
 * `.ts`-хелпера обязан быть в safelist независимо от того, куда его положила
 * текущая раскладка чанков. Гейт от `dist` зеленел бы ровно до следующего
 * изменения чанкинга.
 *
 * Литералы из `.vue` под правило не подпадают: шаблон и `<script setup>`
 * компилируются в чанк самого компонента, то есть всегда лежат в области скана.
 */

const componentsDir = resolve(process.cwd(), 'src/components')

/** Файлы компонента, которые не являются style-хелперами. */
const NOT_A_HELPER = /^(?:index|config|safelist|defaults)\.ts$/

function stripComments(source: string): string {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/(^|[^:])\/\/[^\n]*/g, '$1 ')
}

function stringLiterals(source: string): string[] {
  const literals: string[] = []
  const re = /'([^'\\\n]*(?:\\.[^'\\\n]*)*)'|"([^"\\\n]*(?:\\.[^"\\\n]*)*)"|`([^`\\]*(?:\\.[^`\\]*)*)`/g

  for (let match = re.exec(source); match !== null; match = re.exec(source))
    literals.push(match[1] ?? match[2] ?? match[3] ?? '')

  return literals
}

/**
 * Отсекает строки, которые классами быть не могут: значения пропов и энумов
 * (`'outline'`, `'horizontal'`), ключи событий, id. Одиночное слово считаем
 * классом только при маркере утилиты — иначе `variant: 'outline'` требовал бы
 * safelist наравне с настоящей утилитой `outline`.
 */
function looksLikeClassList(literal: string): boolean {
  const tokens = literal.split(/\s+/).filter(Boolean)

  if (tokens.length === 0) return false
  if (tokens.length > 1) return true

  return /[-:[\]/]/.test(tokens[0])
}

function helperFiles(component: string): string[] {
  return readdirSync(resolve(componentsDir, component))
    .filter(file => file.endsWith('.ts') && !NOT_A_HELPER.test(file) && !file.includes('.test.'))
}

function componentNames(): string[] {
  return readdirSync(componentsDir, { withFileTypes: true })
    .filter(entry => entry.isDirectory() && entry.name.startsWith('Gr'))
    .map(entry => entry.name)
    .sort()
}

async function declaredSafelist(component: string): Promise<Set<string>> {
  const module = await import(`../components/${component}/config.ts`)
  const config = Object.values(module)[0] as { safelist?: string[] } | undefined

  return new Set(config?.safelist ?? [])
}

describe('safelist-контракт', () => {
  it('классы из `.ts`-хелперов компонента объявлены в его safelist', async () => {
    // Оракул «это вообще утилита?» — ровно та связка, которую собирает
    // потребитель: `presetMini` плюс утилиты, которые `presetGranular` добирает
    // из `@feugene/unocss-mini-extra-rules` (`animate-*`, `divide-*`, `sr-only`…).
    // На чистом `presetMini` такой токен считался бы «не утилитой», а значит
    // safelist ему не требовался — и у изолированного потребителя класс молча
    // не сгенерировался бы. Токен, из которого CSS не делает никто, классом
    // по-прежнему не считается.
    const uno = await createGenerator({
      presets: [presetMini(), presetGranular({ providers: [], components: [] })],
    })
    const isUtility = new Map<string, boolean>()

    const violations: string[] = []

    for (const component of componentNames()) {
      const files = helperFiles(component)
      if (files.length === 0) continue

      const safelist = await declaredSafelist(component)
      const candidates = new Set<string>()

      for (const file of files) {
        const source = stripComments(readFileSync(resolve(componentsDir, component, file), 'utf8'))

        for (const literal of stringLiterals(source)) {
          if (!looksLikeClassList(literal)) continue

          for (const token of literal.split(/\s+/).filter(Boolean)) {
            if (!safelist.has(token)) candidates.add(token)
          }
        }
      }

      const missing: string[] = []

      for (const token of candidates) {
        if (!isUtility.has(token)) {
          const { matched } = await uno.generate(token, { preflights: false })
          isUtility.set(token, matched.size > 0)
        }

        if (isUtility.get(token)) missing.push(token)
      }

      if (missing.length > 0)
        violations.push(`${component} [${files.join(', ')}]: ${missing.sort().join(' ')}`)
    }

    expect(violations).toEqual([])
  })
})
