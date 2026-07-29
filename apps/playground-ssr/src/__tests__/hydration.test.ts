// @vitest-environment jsdom

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { afterEach, describe, expect, it, vi } from 'vitest'

import { createApp } from '../app'
import TeleportPage from '../TeleportPage.vue'

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
) as { app: SsrSnapshot, teleport: SsrSnapshot }

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
  options: { root?: typeof TeleportPage, injectTeleports?: boolean } = {},
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

  it('панель приезжает в body после гидрации — ровно одна', async () => {
    // На сервере панель пришла НА МЕСТЕ, внутри компонента.
    expect(snapshots.app.html).toMatch(/data-gr-select-panel/)

    await hydrate(snapshots.app)

    const panels = document.querySelectorAll('[data-gr-select-panel]')
    expect(panels).toHaveLength(1)
    // После монтирования телепорт включился и увёз панель в `body`.
    expect(panels[0].closest('#app')).toBeNull()
  })
})

/**
 * Регрессионный гейт к ANALYSIS §60 (починен 2026-07-29).
 *
 * `TeleportPage.vue` — сжатый набор из одних телепортирующих компонентов.
 * До починки он давал `Hydration node mismatch`, дубль панели в DOM и — в
 * браузере — исчезающую страницу. Теперь обязан гидрироваться начисто.
 *
 * Контракт, который это держит: телепорт включается в `onMounted`
 * (`useTeleportEnabled`), поэтому первый клиентский рендер повторяет серверный.
 */
describe('гидрация телепортирующих компонентов (регрессия §60)', () => {
  it('проходит без расхождений', async () => {
    const problems = hydrationProblems(await hydrate(snapshots.teleport, { root: TeleportPage }))

    expect(problems, problems.join('\n')).toEqual([])
  })

  it('не оставляет дублей панелей', async () => {
    await hydrate(snapshots.teleport, { root: TeleportPage })

    expect(document.querySelectorAll('[data-gr-select-panel]')).toHaveLength(1)
    expect(document.querySelectorAll('[data-gr-dropdown-panel]')).toHaveLength(1)
  })

  /**
   * Раньше сервер складывал панели в `ssrContext.teleports`, и приложению
   * приходилось вставлять их в разметку, чтобы уменьшить число расхождений.
   * Теперь вставлять нечего — и это правильный признак починки.
   */
  it('серверу нечего класть в ssrContext.teleports, кроме якорей', async () => {
    const content = Object.values(snapshots.teleport.teleports)
      .join('')
      .replace(/<!--[\s\S]*?-->/g, '')
      .trim()

    expect(content, 'содержимое панелей должно приходить на месте').toBe('')

    const problems = hydrationProblems(
      await hydrate(snapshots.teleport, { root: TeleportPage, injectTeleports: false }),
    )

    expect(problems, problems.join('\n')).toEqual([])
  })
})
