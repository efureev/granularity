import type { InjectionKey } from 'vue'

import type { GrCodeTokenizer } from './palette'

/**
 * Подсветка на уровень приложения.
 *
 * Форма и `null` в типе — с `GRANULARITY_I18N_KEY` ядра: `null` значит «не
 * подключён», и это нормальный режим, а не деградация. Без провайдера страница
 * с двадцатью блоками кода требовала бы двадцати одинаковых пропов.
 *
 * `Symbol.for`, а не `Symbol()`: две копии пакета в дереве зависимостей должны
 * видеть один ключ, иначе провайдер одной из них станет невидим другой.
 */
export const GR_CODE_HIGHLIGHTER_KEY: InjectionKey<GrCodeTokenizer | null>
  = Symbol.for('@feugene/granularity-code:highlighter')
