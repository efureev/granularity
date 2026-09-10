import type { VNodeChild } from 'vue'

/**
 * Функциональный компонент, печатающий готовый массив VNode.
 *
 * Нужен потому, что шаблон массив узлов отрисовать не умеет, а весь смысл
 * рендерера — отдать **те же самые** объекты VNode для неизменившихся блоков:
 * `patch` в Vue замыкается на `n1 === n2` и не трогает их DOM вовсе. Пропусти
 * мы этот слой и собери разметку шаблоном — кэш перестал бы что-либо давать.
 */
export function GrMarkdownBody(props: { nodes: VNodeChild[] }): VNodeChild {
  return props.nodes
}

GrMarkdownBody.props = { nodes: { type: Array, required: true } }
