import { existsSync } from 'node:fs'
import { readdir, readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

/**
 * Реестр покомпонентных токенов ядра.
 *
 * Источник — `src/components/GrX/tokens.json` рядом с кодом компонента (и
 * `src/composables/tokens.json` для того, что ставит композабл). CSS из него не
 * генерируется: `hook`-токены обязаны остаться неприсвоенными, иначе
 * `var(--gr-x, дефолт)` перестанет падать на дефолт, а `inline` и `css`
 * присваивает сам компонент. Реестр нужен для доки и для гейта
 * `src/__tests__/componentTokens.test.ts`.
 *
 * Отсюда генерируются:
 *   src/tokens/generated.ts — `grComponentTokens` для TS-потребителей;
 *   docs/tokens.md          — раздел «Покомпонентные точки кастомизации».
 *
 * Глобальные токены — примитивы, роли, производные — живут в пакете
 * `@feugene/granularity-tokens`; CSS темы для подключения без granum собирает
 * `scripts/theme-css.mjs` на сборке пакета.
 *
 * Запуск: `yarn generate:tokens` (перезаписывает), `--check` — только проверка
 * расхождения (используется тестом `src/__tests__/tokens.generated.test.ts`).
 */

const pkgDir = fileURLToPath(new URL('..', import.meta.url))

const GENERATED_BANNER_TS
  = '// СГЕНЕРИРОВАНО `yarn generate:tokens` из `src/components/*/tokens.json` — правки здесь потеряются.'

async function readJson(path) {
  return JSON.parse(await readFile(path, 'utf8'))
}

/**
 * Реестры покомпонентных токенов. Владелец берётся из файловой системы, как и
 * состав компонентов в `generate-registry.mjs`: новый компонент приносит свой
 * `tokens.json` сам, править общий список не нужно.
 */
async function readComponentRegistries() {
  const componentsDir = resolve(pkgDir, 'src/components')
  const entries = await readdir(componentsDir, { withFileTypes: true })

  const paths = entries
    .filter(entry => entry.isDirectory() && entry.name.startsWith('Gr'))
    .map(entry => resolve(componentsDir, entry.name, 'tokens.json'))
    .concat([resolve(pkgDir, 'src/composables/tokens.json')])
    .filter(path => existsSync(path))

  const registries = await Promise.all(paths.map(readJson))

  // Компоненты по алфавиту, владельцы вне `src/components` — после них.
  const rank = owner => (owner.startsWith('Gr') ? 0 : 1)

  return registries.sort((left, right) =>
    rank(left.owner) - rank(right.owner) || left.owner.localeCompare(right.owner))
}

// --- TS --------------------------------------------------------------------

function renderTs(components) {
  const componentTokens = components.flatMap(registry => registry.tokens.map(token => ({
    owner: registry.owner,
    name: token.name,
    kind: token.kind,
    default: token.default,
    description: token.description,
  })))

  return [
    GENERATED_BANNER_TS,
    '',
    'import type { GrComponentToken } from \'./types\'',
    '',
    `export const grComponentTokens: GrComponentToken[] = ${JSON.stringify(componentTokens, null, 2)}`,
    '',
  ].join('\n')
}

// --- docs ------------------------------------------------------------------

const COMPONENT_KIND_LABEL = {
  theme: 'тема компонента',
  css: 'CSS компонента',
  inline: 'инлайн-стиль',
  hook: 'только хук',
}

function renderDocs(components) {
  const lines = [
    '<!-- СГЕНЕРИРОВАНО `yarn generate:tokens` из `src/components/*/tokens.json` — правки здесь потеряются. -->',
    '',
    '# Токены компонентов',
    '',
    'Глобальные токены — примитивы, роли по режимам и производные состояния —',
    'живут в пакете `@feugene/granularity-tokens`: его `docs/tokens.md` — справочник',
    'со значениями каждой темы, а `@feugene/granularity-tokens` — тот же реестр как',
    'данные. Здесь — то, что принадлежит ядру: переменные его компонентов.',
    '',
    '## Покомпонентные точки кастомизации',
    '',
    'Переменные, которыми перекрашивается и перемеряется отдельный компонент.',
    'Источник — `tokens.json` рядом с кодом компонента; гейт полноты —',
    '`src/__tests__/componentTokens.test.ts`. Это публичный контракт: имена',
    'меняются так же, как имена пропов, — с записью в `CHANGELOG.md`.',
    '',
    'Колонка «откуда» отвечает на вопрос, что произойдёт, если токен не задать:',
    '',
    '| Значение | Что это значит |',
    '| --- | --- |',
    '| тема компонента | объявлен в `components/<Gr…>/themes/<тема>/` (`root.json`, `modes/<режим>.json`), переключается вместе с режимом |',
    '| CSS компонента | объявлен в собственном `<style>` компонента |',
    '| инлайн-стиль | компонент присваивает его сам, обычно от ступени `size` |',
    '| только хук | нигде не присваивается: работает дефолт из `var(--gr-x, дефолт)` |',
    '',
  ]

  for (const registry of components) {
    lines.push(`### ${registry.owner}`, '')
    lines.push('| Токен | Откуда | По умолчанию | Назначение |', '| --- | --- | --- | --- |')

    for (const token of registry.tokens) {
      const kind = COMPONENT_KIND_LABEL[token.kind] ?? token.kind
      lines.push(`| \`${token.name}\` | ${kind} | ${token.default} | ${token.description} |`)
    }

    lines.push('')
  }

  return lines.join('\n')
}

// --- запись ----------------------------------------------------------------

async function main() {
  const check = process.argv.includes('--check')
  const components = await readComponentRegistries()

  const outputs = [
    ['src/tokens/generated.ts', renderTs(components)],
    ['docs/tokens.md', renderDocs(components)],
  ]

  const stale = []

  for (const [relativePath, content] of outputs) {
    const absolutePath = resolve(pkgDir, relativePath)

    if (check) {
      const current = await readFile(absolutePath, 'utf8').catch(() => null)
      if (current !== content)
        stale.push(relativePath)

      continue
    }

    await writeFile(absolutePath, content, 'utf8')
  }

  if (check) {
    if (stale.length > 0) {
      console.error(`[tokens] расходятся с \`src/components/*/tokens.json\`: ${stale.join(', ')}\nЗапусти \`yarn generate:tokens\`.`)
      process.exitCode = 1
      return
    }

    console.log('[tokens] сгенерированные файлы актуальны')
    return
  }

  console.log(`[tokens] обновлено: ${outputs.map(([path]) => path).join(', ')}`)
}

await main()
