import { Annotation, Compartment, EditorState, Prec, RangeSet, RangeSetBuilder, StateEffect, StateField, type Extension } from '@codemirror/state'
import { Decoration, EditorView, gutter, GutterMarker, ViewPlugin, keymap, lineNumbers as lineNumbersExt, placeholder as placeholderExt, type DecorationSet, type ViewUpdate } from '@codemirror/view'
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands'
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language'
import { tags } from '@lezer/highlight'

import { classForRole, LEZER_TAGS_BY_ROLE } from '../../highlight/fromLezer'
import type { GrCodeLine, GrCodeRole } from '../../highlight/palette'
import type { GrCodeIssue, MinimalChange } from './editorState'

/** Построчный разбор: единица — строка, потому что мост декорирует окно. */
export type GrCodeLineTokenizer = (text: string) => GrCodeLine

/**
 * **Единственный модуль пакета, знающий CodeMirror.**
 *
 * Импортируется динамически (`await import('./codemirror')`), потому что CM6 —
 * опциональный peer: пакет, взятый ради `GrCodeBlock` или `GrDiff`, не обязан
 * его ставить. Не найдётся — редактор скажет об этом в dev и покажет код без
 * правки, а не уронит приложение.
 */

/** Роли и `Compartment`-ы вынесены наружу: реконфигурация обходится без пересоздания. */
const readonlyCompartment = new Compartment()
const wrapCompartment = new Compartment()
const lineNumbersCompartment = new Compartment()
const languageCompartment = new Compartment()
const attributesCompartment = new Compartment()
const keymapCompartment = new Compartment()
const tokenizerCompartment = new Compartment()
const issueGutterCompartment = new Compartment()

/**
 * Раскладка клавиш.
 *
 * `indentWithTab` — только по явной просьбе: редактор в форме, из которого
 * нельзя выйти по `Tab`, это ловушка клавиатуры. Живёт в `Compartment`, потому
 * что `tabIndents` — обычный проп: сменился он — обязана смениться и раскладка,
 * а пересоздавать ради этого состояние значило бы терять курсор и историю.
 */
function keymapFor(tabIndents: boolean): Extension {
  return keymap.of(tabIndents
    ? [...defaultKeymap, ...historyKeymap, indentWithTab]
    : [...defaultKeymap, ...historyKeymap])
}

/**
 * Мост встроенного разбора в декорации CodeMirror.
 *
 * Нужен там, где грамматики нет: строковый `language` («json») грамматику не
 * несёт, и без моста редактор оставался бы одноцветным рядом с `GrCodeBlock`,
 * который тот же JSON красит. Хуже того, серверная разметка красит его тоже —
 * и цвет пропадал бы ровно в момент гидрации.
 *
 * **Декорируется только видимое окно.** Разбор строчно-локален, поэтому цена
 * не зависит от размера документа: на каждое нажатие разбирается три-четыре
 * десятка строк вьюпорта, а не весь текст. Отсюда же отказ от `doc.toString()`
 * — он сам по себе копирует документ целиком на каждый кадр.
 *
 * Никакого бюджета и порога длины тут поэтому не нужно: работа ограничена
 * окном по построению, а не проверкой.
 */

/** Декорация на роль создаётся один раз: их тысячи на кадр, и каждая — объект. */
const markByRole = new Map<GrCodeRole, Decoration>()

function markFor(role: GrCodeRole): Decoration {
  let mark = markByRole.get(role)

  if (!mark) {
    mark = Decoration.mark({ class: classForRole(role) })
    markByRole.set(role, mark)
  }

  return mark
}

function buildDecorations(view: EditorView, tokenize: GrCodeLineTokenizer): DecorationSet {
  const builder = new RangeSetBuilder<Decoration>()

  for (const { from, to } of view.visibleRanges) {
    let position = from

    while (position <= to) {
      const line = view.state.doc.lineAt(position)

      let offset = line.from

      for (const token of tokenize(line.text)) {
        const end = offset + token.text.length

        // `plain` не красится вовсе: пустая декорация — это лишний диапазон в
        // наборе и лишний `<span>` в DOM на каждый пробел.
        if (token.role !== 'plain' && end > offset)
          builder.add(offset, Math.min(end, line.to), markFor(token.role))

        offset = end

        // Токенизатор, потерявший символ, сдвинул бы всю строку. Разойдись
        // длины — выходим, а не красим соседние токены чужой ролью.
        if (offset >= line.to)
          break
      }

      if (line.to >= view.state.doc.length)
        break

      position = line.to + 1
    }
  }

  return builder.finish()
}

/**
 * Плагин пересчитывает окно на правке и на прокрутке — и только на них.
 *
 * Смена выделения или фокуса разметку не меняет, а пересборка набора на каждое
 * движение каретки была бы работой впустую.
 */
function tokenizerHighlighting(tokenize: GrCodeLineTokenizer): Extension {
  return ViewPlugin.define(
    view => ({
      decorations: buildDecorations(view, tokenize),
      update(update: ViewUpdate) {
        if (update.docChanged || update.viewportChanged)
          this.decorations = buildDecorations(update.view, tokenize)
      },
    }),
    { decorations: plugin => plugin.decorations },
  )
}

/** Расширение моста или пустое, если встроенного разбора для языка нет. */
export function tokenizerExtension(tokenize: GrCodeLineTokenizer | null): Extension {
  return tokenize ? tokenizerHighlighting(tokenize) : []
}

// ── Замечания ───────────────────────────────────────────────────────────────

/**
 * Замечания `validate` в самом тексте: волнистое подчёркивание на диапазоне и
 * метка в жёлобе на строке. Список под полем остаётся — он связан с полем
 * через `aria-describedby` и доступен без зрения; подчёркивание и метка
 * показывают зрячему, **где** именно.
 *
 * Замечания приходят эффектом, а не пересозданием состояния: асинхронный
 * `validate` отвечает позже правки, и курсор с историей терять нельзя.
 */
const setIssuesEffect = StateEffect.define<readonly GrCodeIssue[]>()

const SEVERITY_RANK: Record<GrCodeIssue['severity'], number> = { error: 3, warning: 2, info: 1 }

/**
 * Диапазон, который можно подчеркнуть: пустой расширяется до символа.
 *
 * Валидатор указывает на точку («ожидалась запятая»), а декорация нулевой
 * длины не рисует ничего — замечание было бы только в списке.
 */
function markRange(issue: GrCodeIssue, length: number): { from: number, to: number } | null {
  if (length === 0)
    return null
  if (issue.to > issue.from)
    return { from: issue.from, to: issue.to }

  return issue.from < length ? { from: issue.from, to: issue.from + 1 } : { from: length - 1, to: length }
}

function issueDecorations(issues: readonly GrCodeIssue[], length: number): DecorationSet {
  const ranges = issues
    .map((issue) => {
      const range = markRange(issue, length)

      return range && Decoration.mark({
        class: `gr-code-issue gr-code-issue-${issue.severity}`,
        attributes: { title: issue.message },
        issue,
      }).range(range.from, range.to)
    })
    .filter((range): range is NonNullable<typeof range> => range !== null)

  return Decoration.set(ranges, true)
}

const issuesField = StateField.define<DecorationSet>({
  create: () => Decoration.none,
  update(decorations, tr) {
    let next = decorations.map(tr.changes)

    for (const effect of tr.effects) {
      if (effect.is(setIssuesEffect))
        next = issueDecorations(effect.value, tr.state.doc.length)
    }

    return next
  },
  provide: field => EditorView.decorations.from(field),
})

class IssueMarker extends GutterMarker {
  constructor(readonly severity: GrCodeIssue['severity'], readonly messages: readonly string[]) {
    super()
  }

  override eq(other: IssueMarker): boolean {
    return other.severity === this.severity && other.messages.join('\n') === this.messages.join('\n')
  }

  override toDOM(): Node {
    const marker = document.createElement('span')

    marker.className = `gr-code-issue-marker gr-code-issue-marker-${this.severity}`
    marker.textContent = '●'
    marker.title = this.messages.join('\n')
    marker.setAttribute('aria-label', this.messages.join('; '))

    return marker
  }
}

/** Пустая метка той же ширины — резерв колонки, пока замечаний нет. */
const spacerMarker = new IssueMarker('info', [])

function issueMarkers(state: EditorState): RangeSet<GutterMarker> {
  const byLine = new Map<number, { from: number, severity: GrCodeIssue['severity'], messages: string[] }>()
  const cursor = state.field(issuesField).iter()

  for (; cursor.value; cursor.next()) {
    const issue = (cursor.value.spec as { issue: GrCodeIssue }).issue
    const line = state.doc.lineAt(cursor.from)
    const entry = byLine.get(line.number) ?? { from: line.from, severity: issue.severity, messages: [] }

    if (SEVERITY_RANK[issue.severity] > SEVERITY_RANK[entry.severity])
      entry.severity = issue.severity

    entry.messages.push(issue.message)
    byLine.set(line.number, entry)
  }

  return RangeSet.of(
    [...byLine.values()].map(entry => new IssueMarker(entry.severity, entry.messages).range(entry.from)),
    true,
  )
}

/**
 * Колонка меток. Ставится, когда задан `validate`, и тогда держит ширину и без
 * замечаний: появись она только с первым замечанием — текст прыгал бы вбок на
 * каждой смене вердикта.
 */
function issueGutter(enabled: boolean): Extension {
  return enabled
    ? gutter({ class: 'gr-code-issue-gutter', markers: view => issueMarkers(view.state), initialSpacer: () => spacerMarker })
    : []
}

/** Новые замечания — эффектом в живое состояние. */
export function setIssues(view: unknown, issues: readonly GrCodeIssue[]): void {
  (view as EditorView).dispatch({ effects: setIssuesEffect.of(issues) })
}

/** Метка транзакции, рождённой самим редактором. */
const fromEditor = Annotation.define<boolean>()

/**
 * Подсветка: теги Lezer на наши классы ролей.
 *
 * Готовые темы CodeMirror не берутся ни в каком виде — они принесут свою
 * палитру, и редактор станет единственным элементом страницы, не слушающимся
 * темы приложения. Цвет приходит из тех же токенов, что у блока и диффа.
 */
function buildHighlightStyle(): Extension {
  const spec: Array<{ tag: unknown, class: string }> = []
  const registry = tags as unknown as Record<string, unknown>

  for (const [role, tagNames] of Object.entries(LEZER_TAGS_BY_ROLE)) {
    for (const name of tagNames) {
      // `function(variableName)` — модификатор поверх тега: у `tags` он лежит
      // функцией, и разворачивается только так.
      const modifier = /^(\w+)\((\w+)\)$/.exec(name)
      const tag = modifier
        ? (registry[modifier[1]!] as ((inner: unknown) => unknown) | undefined)?.(registry[modifier[2]!])
        : registry[name]

      if (tag)
        spec.push({ tag, class: classForRole(role as GrCodeRole) })
    }
  }

  // `fallback` — штатный способ CodeMirror сказать «это умолчание»: наш стиль
  // применяется, только если потребитель не дал своего. Без него тема, переданная
  // через `extensions`, проигрывала бы нашей — то есть не подключалась бы вовсе.
  return syntaxHighlighting(HighlightStyle.define(spec as never), { fallback: true })
}

/**
 * Тема редактора из наших токенов.
 *
 * Фон и текст — те же переменные, что у блока: редактор и блок стоят рядом, и
 * разойдись они — семейство рассыпается.
 */
const grTheme = EditorView.theme({
  '&': {
    backgroundColor: 'var(--gr-code-block-bg, var(--gr-muted))',
    color: 'var(--gr-code-block-fg, var(--gr-fg))',
  },
  '&.cm-focused': { outline: 'none' },
  '.cm-content': { caretColor: 'var(--gr-code-editor-cursor, var(--gr-fg))' },
  '.cm-cursor, .cm-dropCursor': { borderLeftColor: 'var(--gr-code-editor-cursor, var(--gr-fg))' },
  '&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection': {
    backgroundColor: 'var(--gr-code-editor-selection, var(--gr-info-light))',
  },
  '.cm-activeLine': { backgroundColor: 'var(--gr-code-editor-active-line, transparent)' },
  // Свой цвет обязателен: дефолтный `#888` CodeMirror даёт 3.2:1 на светлой
  // подложке и 2.9:1 на тёмной — ниже AA в обеих темах.
  '.cm-placeholder': { color: 'var(--gr-code-editor-placeholder, var(--gr-muted-fg))' },
  '.cm-gutters': {
    backgroundColor: 'transparent',
    color: 'var(--gr-code-block-line-number, var(--gr-muted-fg))',
    border: 'none',
  },
  // Волна — вторым признаком к цвету: подчёркивание видно и тому, кто тон не
  // различает. Цвета — роли текста тонов, как у списка замечаний под полем.
  '.gr-code-issue': {
    textDecorationLine: 'underline',
    textDecorationStyle: 'wavy',
    textDecorationSkipInk: 'none',
    textUnderlineOffset: '3px',
  },
  '.gr-code-issue-error': { textDecorationColor: 'var(--gr-code-editor-issue-error, var(--gr-invalid-text))' },
  '.gr-code-issue-warning': { textDecorationColor: 'var(--gr-code-editor-issue-warning, var(--gr-warning-text))' },
  '.gr-code-issue-info': { textDecorationColor: 'var(--gr-code-editor-issue-info, var(--gr-info-text))' },
  '.gr-code-issue-gutter .cm-gutterElement': { padding: '0 2px 0 4px' },
  '.gr-code-issue-marker': { fontSize: '0.75em', lineHeight: 'inherit' },
  '.gr-code-issue-marker-error': { color: 'var(--gr-code-editor-issue-error, var(--gr-invalid-text))' },
  '.gr-code-issue-marker-warning': { color: 'var(--gr-code-editor-issue-warning, var(--gr-warning-text))' },
  '.gr-code-issue-marker-info': { color: 'var(--gr-code-editor-issue-info, var(--gr-info-text))' },
})

export interface CreateEditorOptions {
  parent: HTMLElement
  doc: string
  language: unknown
  extensions?: readonly unknown[]
  placeholder?: string
  readonly: boolean
  tabIndents: boolean
  lineNumbers: boolean
  wrap: boolean
  /**
   * ARIA-атрибуты **редактируемого узла**, а не обёртки.
   *
   * Роль `textbox` CodeMirror вешает на `.cm-content`, и имя обязано быть там
   * же: `aria-label` на родителе доступного имени виджету не даёт, и axe
   * справедливо считает поле безымянным.
   */
  contentAttributes: Record<string, string>
  /**
   * Построчный разбор на случай, когда грамматики нет. `null` — грамматика
   * есть или встроенного разбора для языка не существует: тогда плагин не
   * ставится вовсе.
   */
  tokenizeLine: GrCodeLineTokenizer | null
  /** Замечания на момент создания; дальше — `setIssues`. */
  issues: readonly GrCodeIssue[]
  /** Колонка меток замечаний — когда задан `validate`. */
  issueGutter: boolean
  onChange: (value: string) => void
  onFocus: (event: FocusEvent) => void
  onBlur: (event: FocusEvent) => void
}

/**
 * Язык из пропа в расширение.
 *
 * Строка — только имя для серверной разметки, грамматики за ней нет: языковые
 * пакеты CodeMirror в наш манифест не входят, их подключает потребитель.
 */
async function resolveLanguage(language: unknown): Promise<Extension[]> {
  if (!language || typeof language === 'string')
    return []

  if (typeof language === 'function') {
    const resolved = await (language as () => Promise<unknown>)()

    return resolved ? [resolved as Extension] : []
  }

  return Array.isArray(language) ? language as Extension[] : [language as Extension]
}

export async function createEditor(options: CreateEditorOptions): Promise<EditorView> {
  const language = await resolveLanguage(options.language)

  const extensions: Extension[] = [
    // Своя тема — с наименьшим приоритетом: она умолчание, а не диктат.
    // Тема потребителя из `extensions` обязана её перекрывать.
    Prec.lowest(grTheme),
    buildHighlightStyle(),
    history(),
    keymapCompartment.of(keymapFor(options.tabIndents)),
    tokenizerCompartment.of(tokenizerExtension(options.tokenizeLine)),
    issuesField,
    issueGutterCompartment.of(issueGutter(options.issueGutter)),
    languageCompartment.of(language),
    readonlyCompartment.of(EditorState.readOnly.of(options.readonly)),
    wrapCompartment.of(options.wrap ? EditorView.lineWrapping : []),
    lineNumbersCompartment.of(options.lineNumbers ? lineNumbersExt() : []),
    attributesCompartment.of(EditorView.contentAttributes.of(options.contentAttributes)),
    EditorView.updateListener.of((update) => {
      if (!update.docChanged)
        return

      // Транзакция, рождённая применением пропа, обратно не эмитится: иначе
      // получилась бы эхо-петля на каждой букве.
      if (update.transactions.some(tr => tr.annotation(fromEditor) === false))
        return

      options.onChange(update.state.doc.toString())
    }),
    EditorView.domEventHandlers({
      focus: (event) => {
        options.onFocus(event)
        return false
      },
      blur: (event) => {
        options.onBlur(event)
        return false
      },
    }),
    ...(options.placeholder ? [placeholderExt(options.placeholder)] : []),
    ...((options.extensions ?? []) as Extension[]),
  ]

  const view = new EditorView({
    state: EditorState.create({ doc: options.doc, extensions }),
    parent: options.parent,
  })

  if (options.issues.length > 0)
    setIssues(view, options.issues)

  return view
}

export function docOf(view: unknown): string {
  return (view as EditorView).state.doc.toString()
}

/** Точечная транзакция вместо пересоздания документа — курсор и история целы. */
export function applyChange(view: unknown, change: MinimalChange): void {
  (view as EditorView).dispatch({
    changes: change,
    annotations: fromEditor.of(false),
  })
}

export function reconfigure(
  view: unknown,
  options: {
    readonly: boolean
    wrap: boolean
    lineNumbers: boolean
    tabIndents: boolean
    contentAttributes: Record<string, string>
    tokenizeLine: GrCodeLineTokenizer | null
    issueGutter: boolean
  },
): void {
  (view as EditorView).dispatch({
    effects: [
      readonlyCompartment.reconfigure(EditorState.readOnly.of(options.readonly)),
      wrapCompartment.reconfigure(options.wrap ? EditorView.lineWrapping : []),
      lineNumbersCompartment.reconfigure(options.lineNumbers ? lineNumbersExt() : []),
      attributesCompartment.reconfigure(EditorView.contentAttributes.of(options.contentAttributes)),
      keymapCompartment.reconfigure(keymapFor(options.tabIndents)),
      tokenizerCompartment.reconfigure(tokenizerExtension(options.tokenizeLine)),
      issueGutterCompartment.reconfigure(issueGutter(options.issueGutter)),
    ],
  })
}

export function focusEditor(view: unknown): void {
  (view as EditorView).focus()
}

export function blurEditor(view: unknown): void {
  (view as EditorView).contentDOM.blur()
}
