import { readdirSync, readFileSync, statSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

/**
 * Парный гейт к `src/__tests__/envGuard.test.ts` — по собранному `dist`.
 *
 * Юнит-тесты идут с `define: { __GR_DEV__: 'true' }`, поэтому отвалившаяся
 * подстановка на сборке им незаметна: тесты останутся зелёными, а потребитель
 * получит `__GR_DEV__ is not defined` в момент импорта. Проверять это можно
 * только по собранному пакету, отсюда скрипт, а не тест.
 *
 * Проверяется две вещи:
 * 1. имени `__GR_DEV__` в `dist` не осталось — значит `define` отработал;
 * 2. развёрнутое условие в `dist` есть — значит оно развернулось во что-то
 *    осмысленное, а не в `true`/`false`, зашитые на нашей стороне.
 */

const distDir = fileURLToPath(new URL('../dist', import.meta.url))

const GUARD = 'process.env.NODE_ENV !== \'production\''
const GUARD_DOUBLE = 'process.env.NODE_ENV !== "production"'

function jsFiles(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = resolve(dir, entry.name)
    if (entry.isDirectory()) return jsFiles(full)
    return entry.name.endsWith('.js') ? [full] : []
  })
}

const files = jsFiles(distDir).filter(file => statSync(file).isFile())

if (files.length === 0) {
  console.error('[dev-guard] в `dist` нет ни одного .js — сборка не отработала')
  process.exit(1)
}

const leaked = []
let expanded = 0

for (const file of files) {
  const source = readFileSync(file, 'utf8')
  const rel = file.slice(distDir.length + 1)

  if (source.includes('__GR_DEV__')) leaked.push(rel)
  if (source.includes(GUARD) || source.includes(GUARD_DOUBLE)) expanded += 1
}

if (leaked.length > 0) {
  console.error(
    `[dev-guard] \`__GR_DEV__\` уехал в \`dist\` неразвёрнутым — у потребителя это `
    + `ReferenceError на импорте. Проверь \`define\` в \`vite.config.ts\`:\n  ${leaked.join('\n  ')}`,
  )
  process.exit(1)
}

if (expanded === 0) {
  console.error(
    '[dev-guard] в `dist` не нашлось ни одного развёрнутого гарда. Либо `define` '
    + 'подставил константу вместо условия, либо dev-предупреждений в пакете больше нет.',
  )
  process.exit(1)
}

console.log(`[dev-guard] OK — гард развёрнут в ${expanded} файлах, неразвёрнутых имён в dist нет.`)
