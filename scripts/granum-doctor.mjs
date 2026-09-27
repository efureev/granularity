/**
 * `granum doctor --strict` минус систематический ложняк `token-undefined`.
 *
 * Диагностика находит токен, который компонент потребляет, а ни один слой не
 * задаёт. В приложении это дефект: `var(--x)` без запасного значения — валидный
 * CSS, который молча не красит. В библиотеке — наоборот норма: токен выставляет
 * сам компонент инлайновым стилем (`grAlertStyles.ts`, `grSegmentedStyles.ts`,
 * `GrSwitch.vue`), и конвейер о нём знать не обязан. На ядре так выглядят почти
 * все находки этого кода, поэтому `--strict` роняет CI на конвенции.
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
 *
 * Использование: node scripts/granum-doctor.mjs <granum.config.mjs>
 */
import { readFile, readdir } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

import { countDoctorDiagnostics, formatDoctorReport, granumDoctor, loadGranumConfigFile, prepareApp } from '@feugene/granum/node'

const REPO = path.resolve(import.meta.dirname, '..')

/**
 * Код, находки которого гасятся по реестру токенов, а не числом: токен,
 * объявленный любым `tokens.json` монорепо, — заявленная точка расширения.
 */
const EXEMPT = 'token-undefined'

/**
 * Коды, признанные долгом: гейт их не роняет, но считает и печатает.
 *
 *   safelist-redundant — запись safelist дублирует статически извлечённый класс.
 *     На CSS не влияет (класс и так в списке), но раздувает манифест. Чистка
 *     тянет за собой правку тысяч записей и вынесена отдельной работой.
 *   important-in-provider-css — `!important` внутри каскадного слоя переворачивает
 *     порядок слоёв. Лечится правкой стиля компонента.
 *   safelist-dead — запись, для которой у движка нет правила: она не даёт CSS.
 *
 * Числового потолка здесь намеренно нет. Потолок обязан быть пакетным: у ядра
 * этих находок десятки, у спутника единицы, и общая константа либо ничего не
 * ловит, либо роняет не тот пакет. Завести пакетные числа — отдельная работа,
 * а до неё рост виден по строке со счётчиками, которую гейт печатает всегда.
 */
const DEBT_CODES = new Set([
  'safelist-redundant',
  'important-in-provider-css',
  'safelist-dead',
])

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

const configPath = process.argv[2]
if (!configPath) {
  console.error('usage: node scripts/granum-doctor.mjs <granum.config.mjs>')
  process.exit(2)
}

// Конфиг загружается тем же кодом, что и в CLI: у приложения и у пакета он один
// и тот же файл, и читать его двумя способами значит однажды разойтись.
const { config, root } = await loadGranumConfigFile(configPath, process.cwd())
const report = await granumDoctor(await prepareApp(config, root))
console.log(formatDoctorReport(report))

const known = await declaredTokens()

/** Имя токена из субъекта диагностики: `<provider>:<Component>:--gr-x` → `--gr-x`. */
const tokenOf = subject => {
  const last = subject.split(':').pop() ?? ''
  return last.startsWith('--') ? last : `--${last}`
}

/**
 * Имя собрано в рантайме: статический анализ увидел только префикс.
 *
 * `var(--gr-z-${'{'}name${'}'})` даёт в скане `--gr-z-`, а `--gr-avatar-N-bg` —
 * шаблон с подставляемым номером. Такие имена не токены и объявить их некому;
 * признак — имя является строгим префиксом хотя бы одного зарегистрированного
 * токена (`--gr-z-` → `--gr-z-modal`).
 *
 * Правильное место для этого знания — `dynamicTokens` компонента: granum с
 * версии, следующей за 0.2.0, исключает их из находок сам. Пока в репозитории
 * стоит 0.2.0, гейт гасит их здесь; после обновления это правило снимается, а
 * компоненты объявляют свои динамические токены явно.
 */
const composedAtRuntime = (token) => {
  if (known.has(token))
    return false
  for (const name of known) {
    if (name.length > token.length && name.startsWith(token))
      return true
  }
  return false
}

const afterTokenExemption = report.diagnostics.filter(d => d.level === 'error'
  || d.code !== EXEMPT
  || !(known.has(tokenOf(d.subject)) || composedAtRuntime(tokenOf(d.subject))))

// Долги считаются после реестра: сначала гасим объяснимое поимённо, потом
// откладываем известные коды.
const counted = {}
const blocking = []
for (const d of afterTokenExemption) {
  if (d.level !== 'error' && DEBT_CODES.has(d.code)) {
    counted[d.code] = (counted[d.code] ?? 0) + 1
    continue
  }
  blocking.push(d)
}

const { errors, warnings } = countDoctorDiagnostics(report)
const exemptedByRegistry = report.diagnostics.length - afterTokenExemption.length
const debt = Object.entries(counted).map(([code, n]) => `${n} × ${code}`).join(', ') || 'нет'
console.log(`\nСтрогий гейт: ${blocking.length} блокирующих из ${errors + warnings}`
  + ` (${exemptedByRegistry} × ${EXEMPT} на объявленных токенах).`)
console.log(`Отложенный долг: ${debt}.`)

for (const d of blocking)
  console.log(`  ✗ [${d.code}] ${d.subject} — ${d.message}`)

process.exit(blocking.length ? 1 : 0)
