import type { GrComponentSize } from '../shared/sizes'

import type { GrCodeTokenKind } from './tokenizeJson'

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

// Позиционирование нужно кнопке копирования: она лежит поверх блока, а не в шапке.
export const codeBlockRootClass = 'relative'

export const codeBlockSurfaceClass = 'm-0 rounded-[var(--gr-radius-md)] bg-[var(--gr-code-block-bg,var(--gr-muted))] text-[var(--gr-code-block-fg,var(--gr-fg))]'

/** Скроллер обязан показывать фокус: он стоит в таб-порядке. */
export const codeBlockScrollClass = 'overflow-auto focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gr-ring)]'

export const codeBlockWrapClass = 'whitespace-pre-wrap break-words'
export const codeBlockNowrapClass = 'whitespace-pre'

/** Кнопка копирования: правый верхний угол, поверх содержимого. */
export const codeBlockCopyClass = 'absolute right-1 top-1 z-[1]'

export const codeBlockPaddings: Record<GrComponentSize, string> = {
  xs: 'p-2',
  sm: 'p-2.5',
  md: 'p-3',
  lg: 'p-4',
}

export const codeBlockTextSizes: Record<GrComponentSize, string> = {
  xs: 'text-[length:var(--gr-control-text-3xs)]',
  sm: 'text-[length:var(--gr-control-text-2xs)]',
  md: 'text-[length:var(--gr-control-text-xs)]',
  lg: 'text-[length:var(--gr-control-text-sm)]',
}

/**
 * Роли подсветки. Дефолты — ссылки на `-text`-роли темы: они переключаются
 * вместе с ней, поэтому подсветка работает в обеих без своего theme-слоя.
 *
 * Число взято от `azure`, а не от `info`: `info` — синий в двух шагах от индиго
 * `primary`, и пара «ключ ↔ число» давала ΔE 9.4 в светлой теме и 7.8 в тёмной.
 * В `{"count": 42}` эти два цвета стоят через двоеточие и читались бы как один.
 * С `azure` расстояние 53.8 и 16.6. Гейт — `grCodeBlockContrast.test.ts`.
 */
export const codeTokenClass: Record<GrCodeTokenKind, string> = {
  key: 'text-[var(--gr-code-block-key,var(--gr-primary-text))]',
  string: 'text-[var(--gr-code-block-string,var(--gr-success-text))]',
  number: 'text-[var(--gr-code-block-number,var(--gr-azure-text))]',
  literal: 'text-[var(--gr-code-block-literal,var(--gr-warning-text))]',
  punctuation: 'text-[var(--gr-code-block-fg,var(--gr-fg))]',
  plain: '',
}
