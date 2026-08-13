import { readFile, writeFile } from 'node:fs/promises'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

import { contrast, ocean } from '../theme.config.mjs'

/**
 * Сборка тем приложения в CSS.
 *
 * Темы описаны данными (`theme.config.mjs`), а в браузер уезжают обычными
 * файлами: ни рантайм-цены, ни зависимости от порядка загрузки модулей. Так же
 * это работает и у потребителя пакета — шаг сборки, а не магия.
 *
 * `--check` ничего не пишет, а падает, если файл разошёлся с конфигом: темы
 * собраны из данных пакета, и после его обновления файл может отстать. Для
 * темы без базы (`contrast`) это единственный способ узнать, что пакет завёл
 * новую роль, — там сборка упадёт ещё раньше, на самом `createTheme`.
 */

const themes = [
  { theme: ocean, file: 'src/styles/theme-ocean.css' },
  { theme: contrast, file: 'src/styles/theme-contrast.css' },
]

const check = process.argv.includes('--check')
let changed = 0

for (const { theme, file } of themes) {
  const target = fileURLToPath(new URL(`../${file}`, import.meta.url))
  const current = await readFile(target, 'utf8').catch(() => null)

  if (current === theme.css) continue

  if (check) {
    console.error(`[theme] \`${file}\` разошёлся с \`theme.config.mjs\` — запустите \`yarn generate:theme\``)
    process.exit(1)
  }

  await writeFile(target, theme.css)
  console.log(`[theme] обновлено: ${file} (${Object.keys(theme.tokens).length} ролей)`)
  changed += 1
}

if (changed === 0 && !check) console.log('[theme] без изменений')
