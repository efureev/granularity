import { createServer as createHttpServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { fileURLToPath, URL } from 'node:url'

import { createServer as createViteServer } from 'vite'

/**
 * Минимальный SSR-сервер (dev): Vite в middleware-режиме + `renderToString`.
 *
 * Единственная неочевидная часть — `teleports`. Содержимое `<teleport to="body">`
 * Vue кладёт не в HTML компонента, а в `ssrContext.teleports` по ключу целевого
 * селектора. Если приложение не вставит это в разметку само, панель просто не
 * приедет с сервера. Здесь вставляем — чтобы поведение было видно.
 */

const port = Number(process.env.PORT ?? 5210)
const root = fileURLToPath(new URL('./', import.meta.url))

const vite = await createViteServer({
  root,
  base: '/',
  server: { middlewareMode: true },
  appType: 'custom',
})

function renderTeleports(teleports) {
  return Object.entries(teleports)
    // `#target` — ключ вида селектора; для `to="body"` Vue отдаёт `#body`.
    .map(([target, html]) => `<!-- teleport ${target} -->\n${html}`)
    .join('\n')
}

const server = createHttpServer((request, response) => {
  vite.middlewares(request, response, async () => {
    try {
      const template = await vite.transformIndexHtml(
        request.url ?? '/',
        await readFile(new URL('./index.html', import.meta.url), 'utf8'),
      )

      const { render } = await vite.ssrLoadModule('/src/entry-server.ts')
      const { html, teleports } = await render()

      const page = template
        .replace('<!--app-html-->', html)
        .replace('<!--app-teleports-->', renderTeleports(teleports))

      response.statusCode = 200
      response.setHeader('Content-Type', 'text/html')
      response.end(page)
    }
    catch (error) {
      vite.ssrFixStacktrace(error)
      response.statusCode = 500
      response.end(error.stack)
    }
  })
})

server.listen(port, () => {
  console.log(`playground-ssr: http://localhost:${port}/`)
  console.log('Смотрите ИСХОДНЫЙ HTML страницы, а не DOM в инспекторе.')
})
