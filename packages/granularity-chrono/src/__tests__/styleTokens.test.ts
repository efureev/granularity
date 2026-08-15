import { defineStyleTokensGate } from '@feugene/granularity-test-kit/gates'

/**
 * Кегли, радиусы, длительности и кривые объявлены токенами и ровно поэтому
 * выглядят настраиваемыми. Пиксельный литерал или утилита `duration-150` этого
 * обещания не держат: тема их не видит. Отсутствие гейта в предшественнике
 * (`granularity-datepicker`) стоило пакету жизни с `text-[14px]`.
 */
defineStyleTokensGate()
