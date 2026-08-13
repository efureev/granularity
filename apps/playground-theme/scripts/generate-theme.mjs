import { readFile, writeFile } from 'node:fs/promises'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

import { ocean } from '../theme.config.mjs'

/**
 * Сборка темы приложения в CSS.
 *
 * Тема описана данными (`theme.config.mjs`), а в браузер уезжает обычным
 * файлом: ни рантайм-цены, ни зависимости от порядка загрузки модулей. Так же
 * это работает и у потребителя пакета — шаг сборки, а не магия.
 *
 * `--check` ничего не пишет, а падает, если файл разошёлся с конфигом: тема
 * собрана из данных пакета, и после его обновления файл может отстать.
 */

const target = fileURLToPath(new URL('../src/styles/theme-ocean.css', import.meta.url))
const check = process.argv.includes('--check')

const current = await readFile(target, 'utf8').catch(() => null)

if (current === ocean.css) {
  if (!check) console.log('[theme] без изменений')
  process.exit(0)
}

if (check) {
  console.error('[theme] `src/styles/theme-ocean.css` разошёлся с `theme.config.mjs` — запустите `yarn generate:theme`')
  process.exit(1)
}

await writeFile(target, ocean.css)
console.log(`[theme] обновлено: src/styles/theme-ocean.css (${Object.keys(ocean.tokens).length} ролей)`)
