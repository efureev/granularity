import { renderToString, type SSRContext } from '@vue/server-renderer'
import type { Component } from 'vue'

import { themeFromCookie, themeRootAttributes } from '@feugene/granum/runtime'
import { GR_THEME_STORAGE_KEY } from '@feugene/granularity'
import themeManifest from 'virtual:granum/themes'

import { createApp } from './app'
import { resolvePage } from './pages'

export interface SsrResult {
  html: string
  teleports: Record<string, string>
  /**
   * Атрибуты `<html>`: пара режима из cookie запроса. Без cookie пусто —
   * решать за пользователя по системной схеме сервер не может, это делает
   * скрипт в `<head>`.
   */
  htmlAttrs: Record<string, string>
}

export interface SsrRequest {
  /** Заголовок `Cookie` запроса. */
  cookie?: string
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
export function renderPath(pathname: string, request: SsrRequest = {}): Promise<SsrResult> {
  return render(resolvePage(pathname), request)
}

export async function render(root?: Component, request: SsrRequest = {}): Promise<SsrResult> {
  const selection = themeFromCookie(themeManifest, request.cookie, GR_THEME_STORAGE_KEY)
  const app = createApp(root, selection === undefined ? {} : { theme: { theme: selection.theme.id, mode: selection.mode.name } })
  const ssrContext: SSRContext = {}
  const html = await renderToString(app, ssrContext)

  return {
    html,
    teleports: (ssrContext.teleports ?? {}) as Record<string, string>,
    htmlAttrs: selection === undefined ? {} : themeRootAttributes(themeManifest, { theme: selection.theme.id, mode: selection.mode.name }),
  }
}
