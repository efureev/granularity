#!/usr/bin/env node
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { resolve } from 'node:path'
import process from 'node:process'

/**
 * Парный гейт к `defineEnvGuardGate` — по собранному `dist`.
 *
 * Юнит-тесты идут с `define: { __GR_DEV__: 'true' }`, поэтому отвалившаяся
 * подстановка на сборке им незаметна: тесты останутся зелёными, а потребитель
 * получит `__GR_DEV__ is not defined` в момент импорта. Проверять это можно
 * только по собранному пакету, отсюда скрипт, а не тест.
 *
 * Живёт в тест-ките бинарём, а не копией в каждом пакете: копии расходятся на
 * первой же правке, а этот скрипт — единственное место, где записано, как
 * выглядит правильно развёрнутый гард.
 *
 * Проверяется три вещи:
 * 1. в `dist` вообще что-то есть — иначе сборка не отработала;
 * 2. имени `__GR_DEV__` не осталось — значит `define` отработал;
 * 3. развёрнутое условие есть — значит оно развернулось во что-то осмысленное,
 *    а не в `true`/`false`, зашитые на нашей стороне.
 */

const distDir = resolve(process.cwd(), process.argv[2] ?? 'dist')

/**
 * Сравнение ищется в обе стороны: минификатор вправе нормализовать форму, и
 * `!(NODE_ENV !== 'production')` он сворачивает в `NODE_ENV === 'production'`.
 * Гейт, знавший только `!==`, объявлял такой пакет несобравшимся.
 */
const GUARD = /process\.env\.NODE_ENV\s*[!=]==\s*['"]production['"]/

function jsFiles(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = resolve(dir, entry.name)
    if (entry.isDirectory())
      return jsFiles(full)
    return entry.name.endsWith('.js') ? [full] : []
  })
}

const files = jsFiles(distDir).filter(file => statSync(file).isFile())

if (files.length === 0) {
  console.error(`[dev-guard] в \`${distDir}\` нет ни одного .js — сборка не отработала`)
  process.exit(1)
}

const leaked = []
let expanded = 0

for (const file of files) {
  const source = readFileSync(file, 'utf8')
  const rel = file.slice(distDir.length + 1)

  if (source.includes('__GR_DEV__'))
    leaked.push(rel)
  if (GUARD.test(source))
    expanded += 1
}

if (leaked.length > 0) {
  console.error(
    '[dev-guard] `__GR_DEV__` уехал в `dist` неразвёрнутым — у потребителя это '
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
