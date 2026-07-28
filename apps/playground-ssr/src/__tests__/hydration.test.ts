// @vitest-environment jsdom

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { afterEach, describe, expect, it, vi } from 'vitest'

import { createApp } from '../app'
import ProblemPage from '../ProblemPage.vue'

/**
 * Гидрация настоящего серверного HTML в jsdom.
 *
 * HTML берётся из снимка, снятого в `test/ssr-snapshot.ts` — то есть в чистом
 * Node. Рендерить прямо здесь нельзя: в jsdom существует `window`, гарды
 * `typeof window === 'undefined'` считают себя клиентом, и получается разметка,
 * которой настоящий сервер никогда не отдаст. Первая версия стенда попалась
 * ровно в эту ловушку.
 *
 * Расхождения Vue сообщает только на гидрации и только в dev-сборке — консоль
 * здесь и есть результат измерения.
 */

interface SsrSnapshot {
  html: string
  teleports: Record<string, string>
}

// В jsdom `import.meta.url` не file-scheme, поэтому путь — от cwd приложения.
const snapshots = JSON.parse(
  readFileSync(resolve(process.cwd(), 'node_modules/.cache/ssr-snapshot.json'), 'utf8'),
) as { app: SsrSnapshot, problem: SsrSnapshot }

function captureConsole(): string[] {
  const messages: string[] = []
  const collect = (...args: unknown[]) => {
    messages.push(args.map(arg => String(arg)).join(' '))
  }

  vi.spyOn(console, 'warn').mockImplementation(collect)
  vi.spyOn(console, 'error').mockImplementation(collect)

  return messages
}

function hydrationProblems(messages: readonly string[]): string[] {
  return messages.filter(message => /hydration|mismatch/i.test(message))
}

async function hydrate(
  snapshot: SsrSnapshot,
  options: { root?: typeof ProblemPage, injectTeleports?: boolean } = {},
): Promise<string[]> {
  document.body.innerHTML = `<div id="app">${snapshot.html}</div>`

  if (options.injectTeleports ?? true) {
    for (const [target, content] of Object.entries(snapshot.teleports)) {
      // Ключ — целевой селектор телепорта; для `to="body"` Vue отдаёт `body`.
      const container = target === 'body' ? document.body : document.querySelector(target)
      container?.insertAdjacentHTML('beforeend', content)
    }
  }

  const messages = captureConsole()

  createApp(options.root).mount(document.querySelector('#app')!)
  await new Promise(resolve => setTimeout(resolve, 0))

  return messages
}

afterEach(() => {
  vi.restoreAllMocks()
  document.body.innerHTML = ''
})

describe('гидрация страницы приложения', () => {
  it('проходит без единого расхождения', async () => {
    const problems = hydrationProblems(await hydrate(snapshots.app))

    expect(problems, problems.join('\n')).toEqual([])
  })

  it('переиспользует серверный DOM, а не перерисовывает его', async () => {
    await hydrate(snapshots.app)

    const input = document.querySelector<HTMLInputElement>('#app input[type="text"]')
    expect(input?.value).toBe('SSR')
    expect(document.querySelector('[data-testid="isomorphic-alert"]')).not.toBeNull()
  })

  it('client-only секция появляется после монтирования', async () => {
    // На сервере её нет вовсе — в этом и смысл обхода.
    expect(snapshots.app.html).not.toMatch(/data-gr-select-panel/)
    expect(snapshots.app.html).toContain('Здесь на сервере намеренно пусто')

    await hydrate(snapshots.app)

    expect(document.querySelector('[data-gr-select-panel]')).not.toBeNull()
  })
})

/**
 * Доказательная база под ANALYSIS §60 — воспроизведение, а не рассуждение.
 *
 * `ProblemPage.vue` использует те же компоненты БЕЗ обёртки `ClientOnly`.
 * Когда дефект починят, эти тесты упадут — и это правильный сигнал: тогда
 * ожидания меняются на «расхождений нет», обход из `App.vue` убирается, а
 * `docs/ssr.md` обновляется следом.
 */
describe('гидрация без client-only (улика §60)', () => {
  it('телепорт без гарда даёт hydration mismatch', async () => {
    const problems = hydrationProblems(await hydrate(snapshots.problem, { root: ProblemPage }))

    expect(problems.join('\n')).toMatch(/Hydration node mismatch/)
  })

  it('вставка teleports смягчает, но не устраняет расхождение', async () => {
    const withTeleports = hydrationProblems(
      await hydrate(snapshots.problem, { root: ProblemPage, injectTeleports: true }),
    )
    const withoutTeleports = hydrationProblems(
      await hydrate(snapshots.problem, { root: ProblemPage, injectTeleports: false }),
    )

    // Абсолютные числа зависят от версии Vue, поэтому проверяем соотношение:
    // вставлять `ssrContext.teleports` всё равно надо, но проблему это не решает.
    expect(withTeleports.length).toBeGreaterThan(0)
    expect(withTeleports.length).toBeLessThan(withoutTeleports.length)
  })

  it('серверная панель остаётся в DOM сиротой — появляется дубль', async () => {
    await hydrate(snapshots.problem, { root: ProblemPage })

    // Vue не переиспользовал серверную панель, а создал свою: в DOM их две.
    // Обе скрыты, поэтому пользователь дубля не видит — но это мёртвый DOM и
    // прямое доказательство, что расхождение не «косметическое».
    expect(document.querySelectorAll('[data-gr-select-panel]').length).toBe(2)
  })
})
