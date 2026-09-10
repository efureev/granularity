import GrAlert from '@feugene/granularity/components/GrAlert'
import GrCheckbox from '@feugene/granularity/components/GrCheckbox'
import GrTable from '@feugene/granularity/components/GrTable'
import type { Component, VNode, VNodeChild } from 'vue'
import { h } from 'vue'

import type {
  GrMdBlock,
  GrMdBlockNode,
  GrMdFootnote,
  GrMdInline,
  GrMdListItem,
  GrMdTableCell,
} from '../../markdown/types'
import { estimateBlockSize } from './estimateBlockSize'
import GrMarkdownCode from './GrMarkdownCode.vue'
import { anchorIconPaths } from './icons'

/**
 * Дерево → VNode. Чистая функция, а не рекурсивный компонент.
 *
 * Компонент создавал бы инстанс на каждый узел: у документа на 100 КБ это
 * десятки тысяч инстансов со своими scope и хуками. У функции этой цены нет
 * вовсе, а её результат можно придержать — на этом стоит кэш блоков.
 *
 * `v-html` здесь нет и не будет: экранирование делает Vue, поэтому санитайзер
 * пакету не нужен.
 */

export interface GrMarkdownRenderers {
  code?: Component
  link?: Component
  image?: Component
  heading?: Component
  table?: Component
  /**
   * Имя типа токена из расширения `marked` — так подключается своя разметка
   * для математики, эмодзи или директив. Ключ совпадает с `name` токена.
   */
  [name: string]: Component | undefined
}

export interface GrMarkdownRenderContext {
  t: (key: string, fallback: string) => string
  components: GrMarkdownRenderers
  anchors: boolean
  headingOffset: number
  linkTarget: string | null
  linkRel: string
  interactiveTasks: boolean
  idPrefix: string
  wrapCode: boolean
  onLinkClick: (event: MouseEvent, href: string | null) => void
  onTaskToggle: (offset: number, checked: boolean) => void
  onCopy: (language: string | null) => void
}

/** Маркер GitHub → тон дизайн-системы. */
const ALERT_TONE = {
  note: 'info',
  tip: 'success',
  important: 'primary',
  warning: 'warning',
  caution: 'danger',
} as const

const ALERT_LABEL_KEY = {
  note: ['grEditor.markdown.alertNote', 'Note'],
  tip: ['grEditor.markdown.alertTip', 'Tip'],
  important: ['grEditor.markdown.alertImportant', 'Important'],
  warning: ['grEditor.markdown.alertWarning', 'Warning'],
  caution: ['grEditor.markdown.alertCaution', 'Caution'],
} as const

function icon(paths: readonly string[]): VNode {
  return h(
    'svg',
    {
      'class': 'gr-md-icon',
      'viewBox': '0 0 24 24',
      'fill': 'none',
      'stroke': 'currentColor',
      'stroke-width': 2,
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round',
      'aria-hidden': 'true',
    },
    paths.map(d => h('path', { d })),
  )
}

function renderInline(nodes: GrMdInline[], ctx: GrMarkdownRenderContext): VNodeChild[] {
  return nodes.map((node): VNodeChild => {
    switch (node.type) {
      case 'text':
        return node.value
      case 'strong':
        return h('strong', renderInline(node.children, ctx))
      case 'em':
        return h('em', renderInline(node.children, ctx))
      case 'del':
        return h('del', renderInline(node.children, ctx))
      case 'codeSpan':
        return h('code', { class: 'gr-md-code-span' }, node.value)
      case 'br':
        return h('br')

      case 'link': {
        const children = renderInline(node.children, ctx)
        // Отброшенный политикой адрес не делает ссылку битой — она становится
        // текстом: показать написанное честнее, чем повести в исполнение скрипта.
        if (!node.href)
          return children

        const props = {
          href: node.href,
          title: node.title ?? undefined,
          target: node.external ? (ctx.linkTarget ?? undefined) : undefined,
          rel: node.external ? ctx.linkRel : undefined,
          class: ['gr-md-link', node.external ? 'gr-md-link-external' : null],
          onClick: (event: MouseEvent) => ctx.onLinkClick(event, node.href),
        }
        return ctx.components.link
          ? h(ctx.components.link, props, () => children)
          : h('a', props, children)
      }

      case 'image': {
        if (!node.src)
          return node.alt
        const props = {
          src: node.src,
          alt: node.alt,
          title: node.title ?? undefined,
          loading: 'lazy' as const,
          decoding: 'async' as const,
          class: 'gr-md-image',
        }
        const img = ctx.components.image ? h(ctx.components.image, props) : h('img', props)
        // Подпись рисуется, только когда автор её написал: `title`, а не `alt`.
        return node.title
          ? h('figure', { class: 'gr-md-figure' }, [img, h('figcaption', node.title)])
          : img
      }

      case 'custom': {
        const renderer = ctx.components[node.name]
        if (!renderer)
          return node.raw
        return h(renderer, { name: node.name, raw: node.raw, ...node.data }, () => renderInline(node.children, ctx))
      }

      case 'footnoteRef':
        return h(
          'sup',
          { class: 'gr-md-fn-ref', id: `${ctx.idPrefix}fnref-${node.label}` },
          h('a', { href: `#${ctx.idPrefix}fn-${node.label}` }, String(node.index)),
        )

      default:
        return null
    }
  })
}

/**
 * Чекбокс задачи — `GrCheckbox` ядра, а не нативный `<input>`.
 *
 * Своя копия визуального контракта разошлась бы с дизайн-системой, и уже
 * расходилась: нативный чекбокс браузер рисует сам, в состоянии `disabled`
 * гасит по-своему и растягивается флексом в неквадрат.
 *
 * `readonly`, а не `disabled`: документ показывает состояние задачи, а не
 * запрещает её. Выключенный чекбокс браузер и дизайн-система гасят приглушённым
 * тоном — здесь гасить нечего, отметка видна в полном цвете.
 */
function renderListItem(item: GrMdListItem, ctx: GrMarkdownRenderContext): VNodeChild {
  const children = renderBlocks(item.children, ctx)
  if (item.checked === null)
    return h('li', children)

  const editable = ctx.interactiveTasks && item.taskOffset !== null

  const box = h(GrCheckbox, {
    'class': 'gr-md-task-box',
    'modelValue': item.checked,
    'readonly': !editable,
    'ariaLabel': ctx.t('grEditor.markdown.task', 'Task'),
    'onUpdate:modelValue': (next: boolean) => {
      if (item.taskOffset !== null)
        ctx.onTaskToggle(item.taskOffset, next)
    },
  })

  return h('li', { class: 'gr-md-task' }, [box, h('span', children)])
}

function renderCells(cells: GrMdTableCell[], tag: 'th' | 'td', ctx: GrMarkdownRenderContext): VNodeChild[] {
  return cells.map(cell => h(
    tag,
    { style: cell.align ? { textAlign: cell.align } : undefined },
    renderInline(cell.children, ctx),
  ))
}

function renderFootnotes(items: GrMdFootnote[], ctx: GrMarkdownRenderContext): VNodeChild {
  return h('section', { 'class': 'gr-md-footnotes', 'role': 'doc-endnotes', 'aria-labelledby': `${ctx.idPrefix}fn-title` }, [
    h('h2', { class: 'gr-md-footnotes-title', id: `${ctx.idPrefix}fn-title` }, ctx.t('grEditor.markdown.footnotes', 'Footnotes')),
    h('ol', items.map(item => h('li', { id: `${ctx.idPrefix}fn-${item.label}`, role: 'doc-footnote' }, [
      ...renderBlocks(item.children, ctx),
      h('a', {
        'href': `#${ctx.idPrefix}fnref-${item.label}`,
        'class': 'gr-md-fn-back',
        'role': 'doc-backlink',
        'aria-label': ctx.t('grEditor.markdown.footnoteBackref', 'Back to content'),
      }, '↩'),
    ]))),
  ])
}

/** Пустой хвост в массив детей не кладём: Vue напечатал бы вместо него комментарий. */
function withTrailing(children: VNodeChild[], trailing?: VNodeChild): VNodeChild[] {
  return trailing ? [...children, trailing] : children
}

/**
 * `trailing` — курсор потока. Он обязан встать **внутрь** последнего
 * инлайнового ряда, а не рядом с блоком: отдельной строкой под текстом он
 * читается как опечатка, а не как «здесь продолжается набор».
 */
function renderNode(node: GrMdBlockNode, ctx: GrMarkdownRenderContext, trailing?: VNodeChild): VNodeChild {
  switch (node.type) {
    case 'heading': {
      const level = Math.min(6, Math.max(1, node.depth + ctx.headingOffset))
      const children = renderInline(node.children, ctx)
      if (ctx.components.heading)
        return h(ctx.components.heading, { level, id: node.id, text: node.text }, () => children)

      // Якорь есть в DOM всегда: появляющийся по наведению с клавиатуры недостижим.
      const anchor = ctx.anchors
        ? h('a', {
            'class': 'gr-md-anchor',
            'href': `#${node.id}`,
            'aria-label': `${ctx.t('grEditor.markdown.anchor', 'Link to section')}: ${node.text}`,
          }, icon(anchorIconPaths))
        : null

      const tag = `h${level}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
      // Курсор — перед якорем: якорь невидим, но занимает место, и текст с
      // курсором разошлись бы ровно на его ширину.
      const inner: VNodeChild[] = [...children]
      if (trailing)
        inner.push(trailing)
      inner.push(anchor)
      return h(tag, { id: node.id, class: 'gr-md-heading' }, inner)
    }

    case 'paragraph':
      return h('p', withTrailing(renderInline(node.children, ctx), trailing))

    case 'inline':
      // Фрагментом, без обёртки: пункт тесного списка тем и отличается, что
      // лишнего блочного узла — а с ним и отступа — вокруг него нет.
      return withTrailing(renderInline(node.children, ctx), trailing)

    case 'code': {
      const props = { code: node.text, language: node.lang, wrap: ctx.wrapCode, onCopy: ctx.onCopy }
      return h(ctx.components.code ?? (GrMarkdownCode as Component), props)
    }

    case 'blockquote':
      return h('blockquote', { class: 'gr-md-quote' }, renderBlocks(node.children, ctx))

    case 'alert': {
      const [key, fallback] = ALERT_LABEL_KEY[node.tone]
      // `live="off"` снимает роль живого региона: это часть документа, а не
      // оповещение, и диктор не должен перебивать им чтение. Заголовок тона
      // несёт смысл текстом, а не только цветом.
      // `variant` не навязывается: вид сообщения — контракт дизайн-системы, и
      // он приходит из `GrConfigProvider`. Своё значение здесь означало бы, что
      // алерт в документе выглядит иначе, чем такой же алерт на странице рядом.
      return h(GrAlert, {
        class: 'gr-md-alert',
        tone: ALERT_TONE[node.tone],
        live: 'off',
        title: ctx.t(key, fallback),
      }, () => renderBlocks(node.children, ctx))
    }

    case 'list':
      return h(
        node.ordered ? 'ol' : 'ul',
        { class: ['gr-md-list', node.tight ? 'gr-md-list-tight' : null], start: node.ordered && node.start !== 1 ? node.start : undefined },
        node.items.map(item => renderListItem(item, ctx)),
      )

    case 'table': {
      if (ctx.components.table)
        return h(ctx.components.table, { header: node.header, rows: node.rows })

      // `GrTable` объявлен «тонким контейнером»: он владеет скролл-областью,
      // её именем и достижимостью с клавиатуры, а разметку строк отдаёт слотам.
      // Отступы ячеек он оставляет потребителю — они остаются в `styles.css`.
      return h(GrTable, {
        class: 'gr-md-table',
        regionLabel: ctx.t('grEditor.markdown.tableRegion', 'Table'),
      }, {
        header: () => h('tr', renderCells(node.header, 'th', ctx)),
        default: () => node.rows.map(row => h('tr', renderCells(row, 'td', ctx))),
      })
    }

    case 'hr':
      return h('hr', { class: 'gr-md-hr' })

    case 'html':
      // Текстом, не разметкой. Третьего пути в этом пакете нет.
      return h('pre', { class: 'gr-md-raw-html' }, node.value)

    case 'footnotes':
      return renderFootnotes(node.items, ctx)

    case 'custom': {
      // Нет компонента под это имя — печатаем исходник текстом. Молча терять
      // содержимое нельзя: автор его написал.
      const renderer = ctx.components[node.name]
      if (!renderer)
        return h('p', node.raw)
      return h(renderer, { name: node.name, raw: node.raw, ...node.data }, () => renderBlocks(node.children, ctx))
    }
  }
}

export function renderBlocks(nodes: GrMdBlockNode[], ctx: GrMarkdownRenderContext): VNodeChild[] {
  return nodes.map(node => renderNode(node, ctx))
}

/**
 * Блок верхнего уровня.
 *
 * От вложенного отличается тремя вещами: классом, на котором висит
 * `content-visibility`, подсказкой о собственной высоте и **ключом**.
 *
 * Ключ здесь несущий, а не косметический. Без него Vue сличает детей по
 * позиции, и вставка абзаца в начало документа сдвинула бы все остальные —
 * каждый попал бы на чужое место и перепатчился, обнулив весь смысл кэша. С
 * ключом неизменившийся блок узнаётся на новой позиции, а `patch` замыкается
 * на `n1 === n2` и не трогает его DOM.
 */
export function renderTopBlock(
  block: GrMdBlock,
  ctx: GrMarkdownRenderContext,
  key: string,
  trailing?: VNodeChild,
): VNodeChild {
  return h(
    'div',
    {
      key,
      'class': 'gr-md-block',
      'style': { '--gr-markdown-block-size': estimateBlockSize(block.node) },
      'data-gr-markdown-block': key,
    },
    [renderNode(block.node, ctx, trailing)],
  )
}
