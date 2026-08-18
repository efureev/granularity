/**
 * Разбивает строку классов на токены для safelist.
 *
 * Копия утилиты ядра, а не импорт: safelist читается конфигом сборки, а тянуть
 * ради одной функции рантайм ядра в build-time граф незачем.
 */
export function splitClassTokens(value: string): string[] {
  return value.split(/\s+/).filter(Boolean)
}
