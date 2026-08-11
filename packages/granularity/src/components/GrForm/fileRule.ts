/**
 * Файловое правило `GrForm` — мост между декларативными `rules` и валидаторами
 * из `src/fileValidation`.
 *
 * Своих проверок здесь нет ни одной: правило собирает те же валидаторы, которые
 * `GrFormFile` и `v-dropzone` запускают на выборе и на drop. Поэтому ограничение,
 * переехавшее из пропов поля в правило формы, не меняет ни поведения, ни текста
 * ошибки — меняется только момент проверки и то, кто о ней сообщает.
 *
 * Модуль чистый (без Vue): его гоняют юнит-тесты без монтирования.
 */

import {
  acceptValidator,
  allowedExtensionsValidator,
  allowedMimeTypesValidator,
  maxCountValidator,
  maxFileSize,
  maxTotalSizeBytesValidator,
  runFileValidators,
  type FileValidationIssue,
  type FileValidator,
} from '../../fileValidation'

export interface GrFormFileRule {
  /** W3C `accept`: `'image/*,.pdf'`. */
  accept?: string
  /** Белый список расширений (с точкой или без). */
  extensions?: string[]
  /** Белый список MIME-типов. */
  mimeTypes?: string[]
  /** Предел размера одного файла в мегабайтах. */
  maxSizeMb?: number
  /** Предел размера одного файла в байтах. Задан вместе с `maxSizeMb` — берётся меньший. */
  maxSizeBytes?: number
  /** Максимум файлов в наборе. */
  maxCount?: number
  /** Суммарный размер набора в мегабайтах. */
  maxTotalSizeMb?: number
  /** Свои валидаторы — тот же тип, что у `GrFormFile` и `v-dropzone`. Идут после встроенных. */
  validators?: FileValidator[]
}

const BYTES_IN_MB = 1024 * 1024

function mbToBytes(mb: number | undefined): number | undefined {
  return typeof mb === 'number' && Number.isFinite(mb) ? mb * BYTES_IN_MB : undefined
}

function isFile(value: unknown): value is File {
  return typeof File !== 'undefined' && value instanceof File
}

/**
 * Значение поля как набор файлов. Всё, что файлами не является, даёт пустой
 * набор: правило молчит, а пустоту разбирает `required` движка.
 */
export function fileRuleFiles(value: unknown): File[] {
  if (isFile(value)) return [value]
  if (Array.isArray(value)) return value.filter(isFile)
  return []
}

/** Порядок повторяет `GrFormFile`: встроенные проверки, затем валидаторы потребителя. */
export function fileRuleValidators(rule: GrFormFileRule): FileValidator[] {
  return [
    acceptValidator(rule.accept),
    ...(rule.extensions ? [allowedExtensionsValidator(rule.extensions)] : []),
    ...(rule.mimeTypes ? [allowedMimeTypesValidator(rule.mimeTypes)] : []),
    maxFileSize({ bytes: rule.maxSizeBytes, mb: rule.maxSizeMb }),
    maxCountValidator(rule.maxCount),
    maxTotalSizeBytesValidator(mbToBytes(rule.maxTotalSizeMb)),
    ...(rule.validators ?? []),
  ]
}

/**
 * Первая проблема набора или `undefined`. Первая, а не все: у поля формы одна
 * строка ошибки, и файлы тут не исключение — подробный разбор по каждому файлу
 * остаётся за `GrFormFile`.
 */
export async function runFileRule(
  value: unknown,
  rule: GrFormFileRule,
): Promise<FileValidationIssue | undefined> {
  const files = fileRuleFiles(value)
  if (!files.length) return undefined

  const { issues } = await runFileValidators(files, fileRuleValidators(rule), {
    source: 'form',
    multiple: Array.isArray(value),
    accept: rule.accept,
  })

  return issues[0]
}
