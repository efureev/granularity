import type { GrCodeRole } from '../../highlight/palette'
import { codeSurfacePaddings, codeSurfaceTextSizes } from '../../internal/codeSurface'

/**
 * Классы `GrCodeBlock`.
 *
 * Роли подсветки перечислены целиком, по литералу на ветку: UnoCSS сканирует
 * исходный текст файла, и собранное шаблонной строкой имя уехало бы в CSS как
 * литерал.
 */

/**
 * Зацепка собственного CSS компонента (номера строк). Не утилита: CSS она не
 * порождает, поэтому в `safelist` не идёт — там гейт справедливо считает такую
 * запись мёртвой.
 */
export const codeBlockHookClass = 'gr-code-block'

/** Включает колонку номеров. Тоже зацепка, не утилита. */
export const codeBlockNumberedClass = 'gr-code-block--numbered'

/**
 * Поверхность держит корень, а не `<pre>`: кнопка копирования стоит рядом со
 * скроллером, и жёлоб под неё обязан быть частью блока, а не полем страницы.
 */
/**
 * `min-w-0` — не украшение.
 *
 * Поверхность кода прокручивает длинные строки сама, но у грид- и флекс-элемента
 * `min-width` по умолчанию `auto`: элемент раздувается под содержимое, вместо
 * того чтобы включить свою прокрутку, и вылезает за родителя вместе с кнопкой
 * копирования. Лог с длинной строкой — обычный вход, а не край.
 */
export const codeBlockRootClass = 'relative min-w-0 rounded-[var(--gr-radius-md)] bg-[var(--gr-code-block-bg,var(--gr-muted))] text-[var(--gr-code-block-fg,var(--gr-fg))]'

/**
 * Полоса под кнопку: 28 px самой кнопки плюс отбивка `right-1`.
 *
 * Кнопка не может висеть поверх `<pre>`: полосу прокрутки браузер рисует у
 * правого края скроллера, в тех же 8–15 px, и накрытую кнопкой её не ухватить
 * мышью. Отступами это не лечится — их пришлось бы взять больше ширины самой
 * кнопки, и «угол» перестал бы быть углом. Витринный `doc/CodeBlock.vue` решает
 * то же самое шапкой; у пакетного блока шапки нет, поэтому место отдаётся
 * жёлобом.
 */
export const codeBlockGutterClass = 'pr-9'

/** Браузерный отступ `<pre>`: фон и радиус живут на корне, полю здесь не место. */
export const codeBlockSurfaceClass = 'm-0'

/** Скроллер обязан показывать фокус: он стоит в таб-порядке. */
export const codeBlockScrollClass = 'overflow-auto focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gr-ring)]'

export const codeBlockWrapClass = 'whitespace-pre-wrap break-words'
export const codeBlockNowrapClass = 'whitespace-pre'

/** Кнопка копирования: правый верхний угол, внутри жёлоба. */
export const codeBlockCopyClass = 'absolute right-1 top-1 z-[1]'

// Общая шкала поверхности кода — одна на блок, дифф и редактор.
export const codeBlockPaddings = codeSurfacePaddings

export const codeBlockTextSizes = codeSurfaceTextSizes

/**
 * Роли подсветки — одиннадцать, общие на весь пакет. Дефолты — ссылки на
 * `-text`-роли темы: они переключаются вместе с ней, поэтому подсветка работает
 * в обеих без своего theme-слоя.
 *
 * Число взято от `azure`, а не от `info`: `info` — синий в двух шагах от индиго
 * `primary`, и пара «ключ ↔ число» давала ΔE 9.4 в светлой теме и 7.8 в тёмной.
 * В `{"count": 42}` эти два цвета стоят через двоеточие и читались бы как один.
 * С `azure` расстояние 53.8 и 16.6.
 *
 * Пять ролей сверх шести ядерных встроенный токенизатор не производит — их
 * даёт подключённая подсветка (Shiki, CodeMirror). Цвета им нужны всё равно:
 * без них TypeScript в блоке был бы одноцветной простынёй.
 *
 * **Цветов семь, а ролей одиннадцать — и это дизайн, а не нехватка.** Тема даёт
 * восемь хорошо различимых `-text`-ролей (`info` стоит в двух шагах от
 * `primary`, `invalid` — тот же цвет, что `danger`, `slate` в 11.6 от
 * `muted-fg`). Изобретать девятый оттенок формулой значило бы завести цвет,
 * которого тема не знает и переопределить не может.
 *
 * Поэтому роли сведены в смысловые группы:
 *
 * - **имена объявленного** — ключ, функция, тип: один цвет. `obj.field`,
 *   `obj.method()` и `Foo` в разметке различаются позицией, а не оттенком;
 * - **значения** — строка, число, литерал: каждому свой;
 * - **ключевое слово** — акцент;
 * - **комментарий** — приглушённо;
 * - **пунктуация и переменная** — обычный текст.
 *
 * Совпадения объявлены списком в `grCodeBlockContrast.test.ts`: роль, случайно
 * совпавшая с чужой, краснеет, пока совпадение не объяснят.
 */
export const codeTokenClass: Record<GrCodeRole, string> = {
  key: 'text-[var(--gr-code-block-key,var(--gr-primary-text))]',
  string: 'text-[var(--gr-code-block-string,var(--gr-success-text))]',
  number: 'text-[var(--gr-code-block-number,var(--gr-azure-text))]',
  literal: 'text-[var(--gr-code-block-literal,var(--gr-warning-text))]',
  punctuation: 'text-[var(--gr-code-block-punctuation,var(--gr-fg))]',
  keyword: 'text-[var(--gr-code-block-keyword,var(--gr-danger-text))]',
  comment: 'text-[var(--gr-code-block-comment,var(--gr-muted-fg))]',
  type: 'text-[var(--gr-code-block-type,var(--gr-primary-text))]',
  function: 'text-[var(--gr-code-block-function,var(--gr-primary-text))]',
  variable: 'text-[var(--gr-code-block-variable,var(--gr-fg))]',
  plain: '',
}
