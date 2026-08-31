import { defineGranularComponent } from '@feugene/unocss-preset-granular/contract'

import { grDiffSafelist } from './safelist'

/**
 * Зависимостей нет — и это заявленное свойство пакета: чтение диффа частотнее
 * правки конфига, и платить за редактор оно не должно. Проверяет это гейт
 * изоляции: разметка `GrCodeEditor` в entry диффа не пройдёт.
 *
 * Класс-мапу ролей подсветки дифф берёт из общего с блоком модуля, но самого
 * блока не рендерит — ребра нет, есть общий `.ts`, и его классы объявлены в
 * собственном safelist.
 */
export const grDiffConfig = defineGranularComponent(import.meta.url, {
  name: 'GrDiff',
  safelist: grDiffSafelist,
})
