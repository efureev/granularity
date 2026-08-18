import { readdirSync, readFileSync, statSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * Гейт на dev-гард: в исходниках он один и записывается одним символом.
 *
 * `__GR_DEV__` разворачивается в `typeof process !== 'undefined' &&
 * process.env.NODE_ENV !== 'production'` на сборке пакета (`define` в
 * `vite.config.ts`), в тестах равен `true` (`vitest.config.ts`). Гейт следит,
 * чтобы вместо него не появилось написанное руками условие — а появлялось оно
 * трижды и в трёх разных диалектах:
 *
 * - **голое `process.env.NODE_ENV`** — в окружении, где `process` не определён
 *   (воркер, edge-рантайм, ESM без бандлера), это `ReferenceError` в момент
 *   setup: компонент падает там, где собирался напечатать подсказку;
 * - **`import.meta.env?.DEV`** — не падает, но вне Vite тихо `undefined`, и
 *   предупреждение исчезает без следа вместе с дефектом, ради которого писалось;
 * - **гард со страховкой, но написанный руками** — работает, однако форм у него
 *   две (`&&` под условием, `||` перед ранним `return`), и перепутанная форма
 *   отправляет предупреждение в прод вместо того, чтобы его погасить.
 *
 * Рантайм-хелпера вместо константы быть не может: межмодульного инлайна
 * бандлеры не делают. Замер на esbuild — `isDev()` сворачивается в
 * `typeof process<"u"&&!1`, но вызов остаётся, и в прод-бандл потребителя
 * уезжают и текст предупреждения, и дедуп-состояние. Подстановка на сборке
 * даёт ровно тот же результат, что и написанный руками инлайн.
 */

const srcDir = resolve(process.cwd(), 'src')

function sourceFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = resolve(dir, entry.name)
    if (entry.isDirectory()) return entry.name === '__tests__' ? [] : sourceFiles(full)
    return /\.(?:ts|vue)$/.test(entry.name) && !entry.name.includes('.test.') ? [full] : []
  })
}

/**
 * Проза содержит те же слова, что и код: гейт объясняет запрещённые формы,
 * цитируя их. Без вычистки комментариев он ловил бы собственное обоснование.
 */
function isComment(line: string): boolean {
  const trimmed = line.trim()

  return trimmed.startsWith('//')
    || trimmed.startsWith('*')
    || trimmed.startsWith('/*')
    || trimmed.startsWith('<!--')
}

function grep(pattern: RegExp): string[] {
  return sourceFiles(srcDir)
    .filter(file => statSync(file).isFile())
    .flatMap((file) => {
      const rel = file.slice(srcDir.length + 1)
      return readFileSync(file, 'utf8')
        .split('\n')
        .map((line, i) => ({ line, n: i + 1 }))
        .filter(({ line }) => !isComment(line) && pattern.test(line))
        .map(({ n }) => `${rel}:${n}`)
    })
}

describe('dev-гард', () => {
  it('в исходниках нет ни одной проверки окружения мимо `__GR_DEV__`', () => {
    const offenders = grep(/process\.env\.NODE_ENV|import\.meta\.env/)

    expect(
      offenders,
      `${offenders.join('\n')}\n\nпиши \`__GR_DEV__\` (или \`!__GR_DEV__\` перед ранним return) — форма разворачивается на сборке`,
    ).toEqual([])
  })

  it('гейт видит код, а не пустоту', () => {
    // Страховка от немоты: утверждение выше пройдёт и на пустом наборе файлов —
    // например, если обход сломается на новой раскладке `src`.
    expect(sourceFiles(srcDir).length, 'обход `src` ничего не нашёл').toBeGreaterThan(300)
    expect(grep(/__GR_DEV__/).length, 'ни одного dev-гарда не осталось').toBeGreaterThan(15)
  })

  it('константа существует только в исходниках: в рантайме её нет', () => {
    // Здесь проверяется только тестовая подстановка. Отвалившийся `define` на
    // сборке этим тестом не поймать — он бы и дальше зеленел на `true`, пока
    // потребитель получал бы `__GR_DEV__ is not defined`. Парный гейт по
    // собранному пакету — `scripts/check-dist-dev-guard.mjs`, он висит на
    // `yarn build`.
    expect(__GR_DEV__).toBe(true)
  })
})
