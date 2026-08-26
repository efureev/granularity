// @vitest-environment jsdom

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { afterEach, describe, expect, it, vi } from 'vitest'

import { createApp } from '../app'
import { ALL_FIXTURES, componentPath, FIXTURE_PACKAGES } from '../catalog/fixtures'
import { ALL_PAGES, COMPONENT_PAGES, resolvePage } from '../pages'

/**
 * Полнота стенда: каждый компонент экосистемы поднимается на сервере в
 * одиночку и гидрируется начисто.
 *
 * Почему по компоненту на адрес, а не общей страницей: на общей падение одного
 * компонента уносит рендер всей, и остальные сто перестают проверяться разом.
 * Плюс расхождение в общей куче не указывает на виновника — а указать обязано,
 * иначе гейт сообщает «где-то сломалось» и им никто не пользуется.
 *
 * Разметка снимается в чистом Node (`test/ssr-snapshot.ts`) и читается отсюда:
 * рендерить в jsdom нельзя — там есть `window`, гарды считают себя клиентом, и
 * получается HTML, которого настоящий сервер никогда не отдаст.
 */

interface SsrSnapshot {
  html: string
  teleports: Record<string, string>
  /** Страница уронила серверный рендер; снимок сохраняет ошибку, а не падает целиком. */
  error?: string
}

const snapshots = JSON.parse(
  readFileSync(resolve(process.cwd(), 'node_modules/.cache/ssr-snapshot.json'), 'utf8'),
) as Record<string, SsrSnapshot>

const BODY = '[data-testid="component-page-body"]'

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

async function hydrate(path: string, html: string, teleports: Record<string, string>): Promise<string[]> {
  document.body.innerHTML = `<div id="app">${html}</div>`

  for (const [target, content] of Object.entries(teleports)) {
    const container = target === 'body' ? document.body : document.querySelector(target)
    container?.insertAdjacentHTML('beforeend', content)
  }

  const messages = captureConsole()

  createApp(resolvePage(path)).mount(document.querySelector('#app')!)
  await new Promise(resolve => setTimeout(resolve, 0))

  return messages
}

/** Содержимое слота страницы — без обёртки, без шапки: только сам компонент. */
function renderedBody(html: string): string {
  document.body.innerHTML = html
  const body = document.querySelector(BODY)
  const inner = body?.innerHTML ?? ''
  document.body.innerHTML = ''

  // Пустой слот Vue отдаёт якорем-комментарием — содержимым это не считается.
  return inner.replace(/<!--[\s\S]*?-->/g, '').trim()
}

afterEach(() => {
  vi.restoreAllMocks()
  document.body.innerHTML = ''
})

describe.each(ALL_FIXTURES.map(fixture => [fixture.name, fixture] as const))('%s', (name, fixture) => {
  const path = componentPath(name)
  const snapshot = snapshots[path]

  it('серверный рендер проходит без исключения', () => {
    expect(snapshot, `нет снимка для ${path}`).toBeDefined()
    expect(snapshot!.error, snapshot!.error).toBeUndefined()
  })

  it(fixture.emptyOnServer
    ? 'на сервер содержимого не отдаёт — так и задумано'
    : 'отдаёт разметку с сервера, а не пустую оболочку', () => {
    const body = renderedBody(snapshot!.html)

    if (fixture.emptyOnServer)
      expect(body).toBe('')
    else
      expect(body.length, 'слот страницы пуст: проверять гидрацией нечего').toBeGreaterThan(0)
  })

  it('гидрируется без единого расхождения', async () => {
    const problems = hydrationProblems(await hydrate(path, snapshot!.html, snapshot!.teleports))

    expect(problems, problems.join('\n')).toEqual([])
  })
})

/**
 * Полнота — двусторонняя.
 *
 * Реестр `granular-provider` того же пакета: по нему пресет собирает safelist,
 * а витрина строит обход axe. Второй список руками разошёлся бы с ним молча —
 * ровно так `GrPagination` и оказался вне стенда, пока его дефект искали
 * глазами в чужом приложении.
 */
describe.each(FIXTURE_PACKAGES.map(pkg => [pkg.title, pkg] as const))('полнота: %s', (_title, pkg) => {
  const covered = new Set(pkg.fixtures.map(fixture => fixture.name))

  it('у каждого компонента реестра есть страница', () => {
    expect(pkg.registry.filter(name => !covered.has(name))).toEqual([])
  })

  it('у каждой страницы есть компонент в реестре', () => {
    // Обратная половина: ловит переименование, после которого страница
    // осиротела бы, а первая проверка продолжала зеленеть.
    const known = new Set(pkg.registry)

    expect([...covered].filter(name => !known.has(name))).toEqual([])
  })
})

describe('маршруты страниц компонентов', () => {
  it('адреса не повторяются', () => {
    const paths = ALL_PAGES.map(page => page.path)

    expect(new Set(paths).size).toBe(paths.length)
  })

  it('каждый адрес резолвится в свою страницу', () => {
    for (const page of COMPONENT_PAGES)
      expect(resolvePage(page.path)).toBe(page.component)
  })
})

/**
 * Обратная половина измерения.
 *
 * Без неё «ноль расхождений» на ста страницах зеленело бы и на гидрации,
 * которая до компонента вовсе не доходит, — а отличить это от исправной
 * проверки по зелёному прогону нельзя.
 */
describe('гейт умеет видеть расхождение', () => {
  it('порченая разметка страницы компонента его роняет', async () => {
    const path = componentPath('GrPagination')
    const distorted = snapshots[path]!.html.replace(
      /(data-gr-pagination-pages[^>]*>)/,
      '$1<li>сбито</li>',
    )

    expect(distorted, 'разметка не изменилась — тест мерил бы не то').not.toBe(snapshots[path]!.html)

    const problems = hydrationProblems(await hydrate(path, distorted, snapshots[path]!.teleports))

    expect(problems.length).toBeGreaterThan(0)
  })
})
