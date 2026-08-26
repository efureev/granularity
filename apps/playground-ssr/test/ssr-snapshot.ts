import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'

import { ALL_PAGES } from '../src/pages'
import { render, type SsrResult } from '../src/entry-server'

/**
 * `globalSetup` витеста выполняется в НАСТОЯЩЕМ Node — без jsdom.
 *
 * Это принципиально: компоненты определяют серверное окружение через
 * `typeof window === 'undefined'`. Если рендерить внутри теста с
 * `environment: 'jsdom'`, `window` существует, гарды считают себя клиентом, и
 * получается HTML, которого настоящий сервер никогда не отдаст. Первая версия
 * этого стенда попалась ровно в эту ловушку.
 *
 * Поэтому серверный HTML снимается здесь и кладётся на диск, а тест гидрации
 * (jsdom) читает уже готовый снимок.
 *
 * Снимаются **все** страницы разом — и тематические, и по одной на компонент.
 * Ключ снимка — адрес страницы: перечислять их именами, как было при восьми,
 * на сотне уже нельзя, да и любая новая страница тогда молча оставалась бы
 * неснятой.
 */

export const SSR_SNAPSHOT_PATH = resolve(process.cwd(), 'node_modules/.cache/ssr-snapshot.json')

export type SsrSnapshots = Record<string, SsrResult & { error?: string }>

export default async function setup(): Promise<void> {
  const entries = await Promise.all(ALL_PAGES.map(async (page) => {
    try {
      return [page.path, await render(page.component)] as const
    }
    catch (error) {
      // Падение одной страницы не должно уносить снимок целиком: иначе первый
      // же компонент, роняющий серверный рендер, скрывает состояние остальных
      // ста. Ошибка едет в снимок и предъявляется тестом этой страницы.
      return [page.path, { html: '', teleports: {}, error: String(error) }] as const
    }
  }))

  await mkdir(dirname(SSR_SNAPSHOT_PATH), { recursive: true })
  await writeFile(SSR_SNAPSHOT_PATH, JSON.stringify(Object.fromEntries(entries)), 'utf8')
}
