import { renderToString, type SSRContext } from '@vue/server-renderer'
import type { Component } from 'vue'

import { createApp } from './app'
import { resolvePage } from './pages'

export interface SsrResult {
  html: string
  teleports: Record<string, string>
}

/**
 * Серверная точка входа.
 *
 * `ssrContext.teleports` — ключевая деталь: содержимое `<teleport to="body">`
 * не попадает в HTML компонента, оно складывается сюда по целевому селектору.
 * Приложение обязано вставить это в разметку само — Vue за него не вставит
 * (см. `docs/ssr.md`).
 */
/**
 * Рендер по адресу — точка входа dev-сервера.
 *
 * Резолвер один с клиентом (`pages.ts`): отдай сервер одну страницу, а клиент
 * смонтируй другую, и стенд начал бы производить те самые расхождения, ради
 * поиска которых существует.
 */
export function renderPath(pathname: string): Promise<SsrResult> {
  return render(resolvePage(pathname))
}

export async function render(root?: Component): Promise<SsrResult> {
  const app = createApp(root)
  const ssrContext: SSRContext = {}
  const html = await renderToString(app, ssrContext)

  return {
    html,
    teleports: (ssrContext.teleports ?? {}) as Record<string, string>,
  }
}
