/**
 * `granular doctor --strict` минус систематический ложняк `token-undefined`.
 *
 * Диагностика находит токен, который компонент потребляет, а granular не задаёт
 * ни одним слоем. В приложении это дефект: `var(--x)` без запасного значения —
 * валидный CSS, который молча не красит. В библиотеке — наоборот норма: токен
 * выставляет сам компонент инлайновым стилем (`grAlertStyles.ts`,
 * `grSegmentedStyles.ts`, `GrSwitch.vue`), и granular о нём знать не обязан.
 * На ядре так выглядят все 33 находки до единой, поэтому `--strict` роняет CI
 * на конвенции. Потребление с запасным значением пресет перестал считать
 * находкой в 0.14.1 — до него тот же список был вчетверо длиннее.
 *
 * Отбор идёт по реестру: токен, объявленный `tokens.json` любого пакета
 * монорепо, — заявленная точка расширения и находкой не считается; токен,
 * которого не объявляет никто, — опечатка в имени либо расширение, забытое в
 * реестре, и роняет гейт. Реестр берётся общий на монорепо, а не пакетный:
 * пакеты потребляют токены друг друга, и пакетный реестр ругался бы на это.
 * Плата — опечатка, случайно совпавшая с чужим токеном, пройдёт; она дешевле
 * постоянного шума.
 *
 * Остальные диагностики роняют гейт как раньше, включая `error`.
 */
import { readFile, readdir } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { pathToFileURL } from 'node:url'

import { countDoctorDiagnostics, formatDoctorReport, granularDoctor } from '@feugene/unocss-preset-granular/node'

const REPO = path.resolve(import.meta.dirname, '..')
const EXEMPT = 'token-undefined'

async function jsonOrNull(file) {
  try {
    return JSON.parse(await readFile(file, 'utf8'))
  }
  catch {
    return null
  }
}

async function entriesIn(root, pick) {
  try {
    return (await readdir(root, { withFileTypes: true })).filter(pick).map(e => e.name)
  }
  catch {
    return []
  }
}

const dirsIn = root => entriesIn(root, e => e.isDirectory())
const filesIn = root => entriesIn(root, e => e.isFile() && e.name.endsWith('.json'))

/**
 * Имена токенов из всех реестров монорепо — с префиксом `--`, как в отчёте.
 *
 * Форм две: покомпонентная (`{ tokens: [...] }`) и базовая (`{ groups: [{ tokens }] }`).
 * Обход идёт по всем `tokens.json` внутри `src`, а не только по `components/*`:
 * `--gr-floating-available-height` объявлен композаблом (`src/composables`),
 * и обход одних компонентов принял бы его за опечатку.
 */
async function declaredTokens() {
  const names = new Set()
  const collect = (payload) => {
    const lists = [payload?.tokens ?? [], ...(payload?.groups ?? []).map(group => group?.tokens ?? [])]
    for (const token of lists.flat())
      if (token?.name)
        names.add(token.name)
  }

  for (const pkg of await dirsIn(path.join(REPO, 'packages'))) {
    for (const file of await registriesIn(path.join(REPO, 'packages', pkg, 'src')))
      collect(await jsonOrNull(file))
    for (const file of await filesIn(path.join(REPO, 'packages', pkg, 'tokens')))
      collect(await jsonOrNull(path.join(REPO, 'packages', pkg, 'tokens', file)))
  }

  return names
}

/** Рекурсивный поиск `tokens.json` — реестры лежат и у компонентов, и у композаблов. */
async function registriesIn(root) {
  const found = []
  for (const entry of await entriesIn(root, () => true)) {
    const full = path.join(root, entry)
    if (entry === 'tokens.json')
      found.push(full)
    else if (!entry.includes('.'))
      found.push(...await registriesIn(full))
  }
  return found
}

const optionsPath = process.argv[2]
if (!optionsPath) {
  console.error('usage: node scripts/granular-doctor.mjs <granular.options.mjs>')
  process.exit(2)
}

const options = (await import(pathToFileURL(path.resolve(optionsPath)).href)).default
const report = granularDoctor(options)
console.log(formatDoctorReport(report))

const known = await declaredTokens()
const blocking = report.diagnostics.filter(d => d.level === 'error'
  || d.code !== EXEMPT
  || !known.has(`--${d.subject.split(':').pop()}`))

const { errors, warnings } = countDoctorDiagnostics(report)
const exempted = report.diagnostics.length - blocking.length
console.log(`\nСтрогий гейт: ${blocking.length} блокирующих из ${errors + warnings}`
  + ` (${exempted} × ${EXEMPT} на объявленных токенах пропущено).`)

for (const d of blocking)
  console.log(`  ✗ [${d.code}] ${d.subject} — ${d.message}`)

process.exit(blocking.length ? 1 : 0)
