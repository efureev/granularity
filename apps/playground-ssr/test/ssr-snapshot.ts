import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'

import ProblemPage from '../src/ProblemPage.vue'
import { render } from '../src/entry-server'

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
 */

export const SSR_SNAPSHOT_PATH = resolve(process.cwd(), 'node_modules/.cache/ssr-snapshot.json')

export default async function setup(): Promise<void> {
  // `app` — страница приложения (обход через `ClientOnly`),
  // `problem` — те же компоненты без обхода, как улика для теста гидрации.
  const [app, problem] = await Promise.all([render(), render(ProblemPage)])

  await mkdir(dirname(SSR_SNAPSHOT_PATH), { recursive: true })
  await writeFile(SSR_SNAPSHOT_PATH, JSON.stringify({ app, problem }), 'utf8')
}
