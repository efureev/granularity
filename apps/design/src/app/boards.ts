import type { Component } from 'vue'

const components = import.meta.glob<{ default: Component }>('../designs/*/*/*.vue')
const styles = import.meta.glob<string>('../designs/*/*/*.css', { query: '?inline', import: 'default' })

export interface LoadedBoard {
  component: Component
  /** CSS версии и CSS макета одной строкой — для таблицы стилей shadow root. */
  css: string
}

function loadCss(path: string): Promise<string> {
  const load = styles[path]
  return load ? load() : Promise.resolve('')
}

export async function loadBoard(componentId: string, versionId: string, file: string): Promise<LoadedBoard> {
  const base = `../designs/${componentId}/${versionId}`
  const loadComponent = components[`${base}/${file}.vue`]
  if (!loadComponent)
    throw new Error(`Нет макета ${base}/${file}.vue`)

  const [module, conceptCss, boardCss] = await Promise.all([
    loadComponent(),
    loadCss(`${base}/concept.css`),
    loadCss(`${base}/${file}.css`),
  ])

  return { component: module.default, css: `${conceptCss}\n${boardCss}` }
}
