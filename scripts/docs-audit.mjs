import { execFileSync } from 'node:child_process'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { dirname, relative, resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

/**
 * Сверка страниц компонентов с кодом.
 *
 * Гейт `componentDocs` держит **форму** страницы и смысла её утверждений не
 * видит. Этот скрипт закрывает часть разрыва — ту, что поддаётся автоматике:
 *
 *   --check   примеры кода на странице не используют несуществующее API.
 *             Ложных срабатываний нет по построению: проп, которого нет в
 *             `web-types.json`, в примере — однозначный дефект;
 *   --report  рабочий список страниц по риску устаревания. Не гейт: перечни
 *             пропов на страницах запрещены, поэтому «проп не упомянут» —
 *             норма, а не находка;
 *   --card    карточка одного компонента на экран — единица ревью.
 *
 * Чего скрипт принципиально не делает — не сверяет дефолты с генератором:
 * тот их не видит. Значения разрешаются в `useGrComponentProp` из
 * `defaults.ts`, и в сигнатуре пропа стоит `undefined`. Карточка печатает
 * реальные дефолты рядом, но решение остаётся за читателем.
 */

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const PKG = resolve(ROOT, 'packages/granularity')
const DOCS = resolve(PKG, 'docs/components')
const WEB_TYPES = resolve(PKG, 'dist/web-types.json')

/** Обороты-отрицания: имя рядом с ними названо как отсутствующее. */
const NEGATION = /(нет|не\s|вместо|убран|снят|устарел)/i

function camel(name) {
  return name.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())
}

function components() {
  const dir = resolve(PKG, 'src/components')

  return readdirSync(dir, { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .map(entry => entry.name)
    .filter(name => existsSync(resolve(dir, name, 'index.ts')) && existsSync(resolve(dir, name, 'config.ts')))
    .sort()
}

/**
 * Публичная поверхность из `dist/web-types.json`: пропы и слоты.
 *
 * Эмитов в этом файле нет — IDE читает их из типов, — поэтому события примера
 * сверяются с пропами `onX` и с `update:*` от `v-model`, а не с отдельным
 * списком.
 */
function surface() {
  if (!existsSync(WEB_TYPES))
    return null

  const json = JSON.parse(readFileSync(WEB_TYPES, 'utf8'))
  const tags = json?.contributions?.html?.['vue-components'] ?? []
  const byComponent = new Map()

  for (const tag of tags) {
    const props = new Set((tag.props ?? []).map(prop => camel(prop.name)))

    byComponent.set(tag.name, {
      props,
      slots: new Set((tag.slots ?? []).map(slot => slot.name)),
      // `v-model:x` порождает и проп `x`, и эмит `update:x`; отдельного
      // перечня эмитов web-types не содержит.
      events: new Set([...props].map(prop => `update:${prop}`)),
    })
  }

  return byComponent
}

/**
 * Пропы, навешенные в примерах **на сам компонент**.
 *
 * Границей служит его собственный тег: в примере рядом стоят `GrFormField`,
 * `GrConfigProvider`, суб-компоненты и голый HTML, и их атрибуты к API
 * страницы отношения не имеют. Без этого сужения проверка даёт сотни ложных
 * срабатываний и перестаёт быть гейтом.
 *
 * Слоты и события не проверяются: `web-types.json` не содержит эмитов вовсе,
 * а слот в примере пишется внутри тела компонента, где рядом живут чужие
 * шаблоны. Ловить их эвристикой значило бы вернуть те же ложные срабатывания.
 */
function usedInExamples(markdown, component) {
  const props = new Set()
  const tag = new RegExp(`<${component}(\\s[^>]*?)?/?>`, 'g')

  for (const block of markdown.matchAll(/```(?:vue|html)\n([\s\S]*?)```/g)) {
    for (const element of (block[1] ?? '').matchAll(tag)) {
      const attributes = element[1] ?? ''

      // `as` подменяет корневой тег, и дальше атрибуты принадлежат уже ему
      // (`:as="RouterLink" :to="…"`). Чей это API, скрипт знать не может.
      if (/(?:^|\s):?as=/.test(attributes))
        continue

      for (const match of attributes.matchAll(/v-model:([a-z][\w-]*)/gi))
        props.add(camel(match[1] ?? ''))

      for (const match of attributes.matchAll(/(?:^|\s)(?::|v-bind:)?([a-z][\w-]*)=/gi)) {
        const raw = match[1] ?? ''

        // Директивы (`v-if`, `v-for`) и обработчики пропами не являются.
        if (/^v-/.test(raw))
          continue

        props.add(camel(raw))
      }
    }
  }

  props.delete('modelValue')
  props.delete('ref')
  props.delete('key')
  props.delete('class')
  props.delete('style')
  props.delete('id')

  return props
}

/** Идентификаторы в бэктиках вне блоков кода — упоминания в прозе. */
function mentioned(markdown) {
  const prose = markdown.replace(/```[\s\S]*?```/g, '')
  const names = new Map()

  for (const line of prose.split('\n')) {
    for (const match of line.matchAll(/`([a-z][a-zA-Z0-9]*)`/g)) {
      const name = match[1] ?? ''

      if (!names.has(name))
        names.set(name, NEGATION.test(line))
    }
  }

  return names
}

/**
 * Весь текст исходников компонента — знаменатель для «мёртвых упоминаний».
 *
 * Проверять упоминание только против списка пропов бессмысленно: страница
 * законно называет композаблы, события, литералы объединений и внутренние
 * функции, и все они попали бы в отчёт. Имя подозрительно тогда, когда его нет
 * **нигде** в директории компонента — это переименование или удаление.
 */
function sourceText(component) {
  const dir = resolve(PKG, 'src/components', component)
  let text = ''

  const walk = (path) => {
    for (const entry of readdirSync(path, { withFileTypes: true })) {
      const child = resolve(path, entry.name)

      if (entry.isDirectory())
        walk(child)
      else if (/\.(?:vue|ts|json|css)$/.test(entry.name))
        text += readFileSync(child, 'utf8')
    }
  }

  walk(dir)

  return text
}

function commitsAfterDoc(component) {
  const run = args => execFileSync('git', args, { cwd: ROOT, encoding: 'utf8' }).trim()

  const docCommit = run(['log', '-1', '--format=%H', '--', `packages/granularity/docs/components/${component}.md`])

  if (!docCommit)
    return 0

  const since = run([
    'log',
    '--oneline',
    `${docCommit}..HEAD`,
    '--',
    `packages/granularity/src/components/${component}/`,
  ])

  return since ? since.split('\n').length : 0
}

/**
 * Дефолты, которых не видит генератор.
 *
 * В сигнатуре пропа у них стоит `undefined`, а настоящее значение —
 * последний аргумент `useGrComponentProp` / `useGrComponentSize`: оно
 * разрешается через `GrConfigProvider` в рантайме. Именно на этих пропах
 * страница обычно правее `componentApi.generated.json`.
 */
function resolvedDefaults(component) {
  const path = resolve(PKG, 'src/components', component, `${component}.vue`)

  if (!existsSync(path))
    return []

  const source = readFileSync(path, 'utf8')
  const found = []

  for (const match of source.matchAll(/useGrComponentProp\(\s*'[^']+',\s*'([^']+)',[^,]+,\s*([^)]+?)\s*\)/g))
    found.push(`${match[1]}: ${match[2]}`)

  for (const match of source.matchAll(/useGrComponentSize<[^>]*>\(\s*\(\)\s*=>\s*[^,]+,\s*\{([^}]*)\}/g)) {
    const fallback = /fallback:\s*'([^']+)'/.exec(match[1] ?? '')

    if (fallback)
      found.push(`size: '${fallback[1]}'`)
  }

  return found
}

function checkExamples() {
  const api = surface()

  if (!api) {
    console.error(`✖ нет ${relative(ROOT, WEB_TYPES)} — собери ядро: yarn build:granularity`)
    process.exit(1)
  }

  const problems = []

  for (const component of components()) {
    const page = resolve(DOCS, `${component}.md`)

    if (!existsSync(page))
      continue

    const known = api.get(component)

    if (!known)
      continue

    if (!known.props.size)
      continue

    for (const prop of usedInExamples(readFileSync(page, 'utf8'), component)) {
      if (!known.props.has(prop))
        problems.push(`${component}: проп \`${prop}\` в примере, но не в API`)
    }
  }

  if (problems.length) {
    console.error('✖ примеры на страницах используют несуществующее API:\n')
    problems.forEach(problem => console.error(`  ${problem}`))
    process.exit(1)
  }

  console.log('примеры на страницах согласованы с API')
}

function report() {
  const api = surface()
  const rows = []

  for (const component of components()) {
    const page = resolve(DOCS, `${component}.md`)

    if (!existsSync(page))
      continue

    const markdown = readFileSync(page, 'utf8')
    const known = api?.get(component)
    const names = mentioned(markdown)

    const source = sourceText(component)
    const dead = [...names]
      .filter(([name, negated]) => !negated && !source.includes(name))
      .map(([name]) => name)

    const behind = commitsAfterDoc(component)
    const size = known ? known.props.size : 0
    const coverage = size ? [...known.props].filter(prop => names.has(prop)).length / size : 1

    rows.push({
      component,
      behind,
      dead,
      score: behind + dead.length * 2 + (coverage < 0.2 && size > 10 ? 3 : 0),
      note: `API ${size} проп · упомянуто ${Math.round(coverage * 100)} % · src +${behind} коммитов после доки`,
    })
  }

  rows.sort((a, b) => b.score - a.score || a.component.localeCompare(b.component))

  console.log('Риск устаревания. Сигнал, а не приговор: перечень пропов на странице')
  console.log('запрещён, поэтому низкое покрытие — норма.\n')

  for (const row of rows.slice(0, 25)) {
    console.log(`${row.component.padEnd(24)} риск ${String(row.score).padStart(2)}  ${row.note}`)

    if (row.dead.length)
      console.log(`${' '.repeat(24)} мёртвые упоминания: ${row.dead.join(', ')}`)
  }
}

function card(component) {
  const page = resolve(DOCS, `${component}.md`)

  if (!existsSync(page)) {
    console.error(`✖ нет страницы ${relative(ROOT, page)}`)
    process.exit(1)
  }

  const markdown = readFileSync(page, 'utf8')
  const known = surface()?.get(component)
  const dir = resolve(PKG, 'src/components', component)

  console.log(`# ${component}\n`)
  console.log(`страница: ${relative(ROOT, page)}`)
  console.log(`исходники: ${relative(ROOT, dir)}`)
  console.log(`коммитов в src после правки доки: ${commitsAfterDoc(component)}\n`)

  console.log('## Заголовки страницы')
  markdown.split('\n').filter(line => line.startsWith('## ')).forEach(line => console.log(`  ${line.slice(3)}`))

  if (known) {
    console.log(`\n## API (из dist/web-types.json)`)
    console.log(`  пропы:   ${[...known.props].sort().join(', ') || '—'}`)
    console.log(`  события: ${[...known.events].sort().join(', ') || '—'}`)
    console.log(`  слоты:   ${[...known.slots].sort().join(', ') || '—'}`)
  }
  else {
    console.log('\n## API — нет данных: собери ядро (yarn build:granularity)')
  }

  const defaults = resolvedDefaults(component)

  if (defaults.length) {
    console.log('\n## Дефолты из резолверов — генератор их не видит')
    defaults.forEach(line => console.log(`  ${line}`))
  }

  const sub = readdirSync(dir).filter(name => name.endsWith('.vue') && name !== `${component}.vue`)

  if (sub.length)
    console.log(`\n## Суб-компоненты (своей страницы не имеют): ${sub.join(', ')}`)
}

const mode = process.argv[2]

if (mode === '--check')
  checkExamples()
else if (mode === '--report')
  report()
else if (mode === '--card' && process.argv[3])
  card(process.argv[3])
else
  console.error('использование: docs-audit.mjs --check | --report | --card GrX')
