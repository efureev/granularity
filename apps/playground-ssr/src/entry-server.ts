import { renderToString, type SSRContext } from '@vue/server-renderer'
import type { Component } from 'vue'

import { createApp } from './app'

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
export async function render(root?: Component): Promise<SsrResult> {
  const app = createApp(root)
  const ssrContext: SSRContext = {}
  const html = await renderToString(app, ssrContext)

  return {
    html,
    teleports: (ssrContext.teleports ?? {}) as Record<string, string>,
  }
}
