// @vitest-environment jsdom

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { afterEach, describe, expect, it, vi } from 'vitest'

import { createApp } from '../app'
import ChronoPage from '../ChronoPage.vue'
import OverlayStackPage from '../OverlayStackPage.vue'
import RiskyPage from '../RiskyPage.vue'
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
) as {
  app: SsrSnapshot
  teleport: SsrSnapshot
  risky: SsrSnapshot
  overlayStack: SsrSnapshot
  chrono: SsrSnapshot
}

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

/**
 * Гейт к трём дефектам, которые телепорт не покрывает: браузерный API в setup,
 * `navigator` в первом рендере и авто-id из сквозного счётчика инстансов.
 */
describe('гидрация страницы с браузерными API и авто-id', () => {
  it('проходит без единого расхождения', async () => {
    const problems = hydrationProblems(await hydrate(snapshots.risky, { root: RiskyPage }))

    expect(problems, problems.join('\n')).toEqual([])
  })

  /**
   * Платформа определяется после монтирования, поэтому на macOS гидрация обязана
   * пройти чисто, а подсказка — стать `⌘` уже на клиенте.
   *
   * Оговорка о силе этого теста: сама модалка на сервер ничего не отдаёт
   * (см. `ssr.test.ts`), так что расхождения тут не было бы и со старым кодом.
   * Тест закрепляет клиентское поведение и подстраховывает на случай, если
   * содержимое оверлеев когда-нибудь начнёт рендериться сервером.
   */
  it('на macOS подсказка хоткея появляется после монтирования', async () => {
    const platform = Object.getOwnPropertyDescriptor(globalThis.navigator, 'platform')
    Object.defineProperty(globalThis.navigator, 'platform', { value: 'MacIntel', configurable: true })

    try {
      const problems = hydrationProblems(await hydrate(snapshots.risky, { root: RiskyPage }))

      expect(problems, problems.join('\n')).toEqual([])
      expect(document.body.textContent).toContain('⌘')
    }
    finally {
      if (platform) Object.defineProperty(globalThis.navigator, 'platform', platform)
    }
  })

  it('id секций совпадают с серверными, а не перегенерируются', async () => {
    const serverIds = [...snapshots.risky.html.matchAll(/gr-collapse-header-([\w-]+)/g)].map(m => m[1])

    await hydrate(snapshots.risky, { root: RiskyPage })

    const clientIds = [...document.querySelectorAll('[id^="gr-collapse-header-"]')]
      .map(element => element.id.replace('gr-collapse-header-', ''))

    expect(clientIds).toEqual([...new Set(serverIds)])
  })
})

describe('гидрация страницы с двумя открытыми оверлеями', () => {
  /**
   * Страница появилась вместе с гардом стека слоёв: на сервере слой теперь не
   * регистрируется, и надо было убедиться, что клиент от этого не разъезжается.
   * Расхождения тут нет и не могло быть — `GrModal` рендерится только при
   * включённом телепорте, то есть после монтирования, — но проверяется это
   * теперь тестом, а не рассуждением.
   */
  it('проходит без единого расхождения', async () => {
    const problems = hydrationProblems(await hydrate(snapshots.overlayStack, { root: OverlayStackPage }))

    expect(problems, problems.join('\n')).toEqual([])
  })

  it('после монтирования оба слоя на месте, а нижний — `inert`', async () => {
    await hydrate(snapshots.overlayStack, { root: OverlayStackPage })

    const overlays = document.querySelectorAll('[data-gr-overlay-root]')
    expect(overlays).toHaveLength(2)

    // Стек на клиенте продолжает работать: верхний слой гасит нижний.
    const inert = [...overlays].filter(element => element.hasAttribute('inert'))
    expect(inert).toHaveLength(1)
  })
})

/**
 * Companion-пакет `@feugene/granularity-chrono`.
 *
 * Календарь читает часы, когда не задан ни `today`, ни `viewDate`, — и это
 * единственное место пакета, где серверный рендер вправе разойтись с
 * клиентским. Помечено оно точечно, `data-allow-mismatch` на своём корне,
 * поэтому гейт обязан оставаться чистым: всё остальное — сетка, поля, ленивые
 * панели в портале и живой регион `useAnnouncer` — совпадать обязано.
 */
describe('гидрация companion-пакета chrono', () => {
  it('проходит без единого расхождения', async () => {
    const problems = hydrationProblems(await hydrate(snapshots.chrono, { root: ChronoPage }))

    expect(problems, problems.join('\n')).toEqual([])
  })

  it('серверный HTML содержит сетку и поля, а не пустые обёртки', () => {
    expect(snapshots.chrono.html).toMatch(/data-gr-calendar-grid/)
    expect(snapshots.chrono.html).toMatch(/data-gr-date-picker-field/)
    expect(snapshots.chrono.html).toMatch(/data-gr-time-picker-field/)
  })

  it('панели закрытых пикеров на сервере не рендерятся', () => {
    // Ленивое монтирование: до первого открытия панели нет ни в разметке, ни в
    // портале — иначе каждая форма отдавала бы сетку на 42 ячейки на пикер.
    // Единственная панель в разметке — у `inline`-пикера, она и есть его вид.
    const panels = snapshots.chrono.html.match(/data-gr-date-picker-panel/g) ?? []

    expect(panels).toHaveLength(1)
    expect(snapshots.chrono.html).not.toMatch(/data-gr-time-picker-panel/)
    expect(Object.values(snapshots.chrono.teleports).join('')).not.toMatch(/data-gr-popover-panel/)
  })

  /**
   * Метка проверяется не наличием в разметке, а действием: сервер и клиент
   * здесь стоят в одной зоне и в одну секунду, поэтому настоящего расхождения
   * часов не случается. Подменяем заголовок в серверном HTML — это ровно то,
   * что увидел бы браузер в другой зоне, — и смотрим, молчит ли гидрация.
   */
  function distortTitle(html: string, index: number): string {
    let seen = -1

    return html.replace(/(data-gr-calendar-title[^>]*>)([^<]*)/g, (match, open: string, text: string) => {
      seen += 1
      return seen === index ? `${open}Совсем другой месяц` : match
    })
  }

  it('расхождение часов не роняет гидрацию там, где оно помечено', async () => {
    const distorted = { ...snapshots.chrono, html: distortTitle(snapshots.chrono.html, 1) }
    const problems = hydrationProblems(await hydrate(distorted, { root: ChronoPage }))

    expect(problems, problems.join('\n')).toEqual([])
  })

  it('а без метки — роняет: гейт умеет видеть расхождения', async () => {
    // Обратная половина: без неё предыдущий тест зеленел бы и на сломанном
    // измерении — например если бы гидрация вообще не доходила до заголовка.
    const distorted = { ...snapshots.chrono, html: distortTitle(snapshots.chrono.html, 0) }
    const problems = hydrationProblems(await hydrate(distorted, { root: ChronoPage }))

    expect(problems.length).toBeGreaterThan(0)
  })

  it('часы помечены как ожидаемое расхождение только там, где они читаются', () => {
    const markers = snapshots.chrono.html.match(/data-allow-mismatch/g) ?? []

    // Ровно один календарь на странице оставлен без `today` — он и помечен.
    expect(markers).toHaveLength(1)
  })
})
