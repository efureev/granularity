import { defineGranumComponent } from '@feugene/granum/contract'

import { grDiffSafelist } from './safelist'

/**
 * Зависимостей нет — и это заявленное свойство пакета: чтение диффа частотнее
 * правки конфига, и платить за редактор оно не должно. Проверяет это гейт
 * изоляции: разметка `GrCodeEditor` в entry диффа не пройдёт.
 *
 * Класс-мапу ролей подсветки дифф берёт из общего с блоком модуля, но самого
 * блока не рендерит — ребра нет, есть общий `.ts`, и его классы granum
 * извлекает по графу бандла.
 */
export const grDiffConfig = defineGranumComponent(import.meta.url, {
  name: 'GrDiff',
  safelist: grDiffSafelist,
})
