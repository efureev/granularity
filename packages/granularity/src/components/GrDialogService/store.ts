import { reactive } from 'vue'
import type { Raw } from 'vue'

import type { GrConfigContext } from '../GrConfigProvider/context'
import type { GranularityI18nLike } from '../../internal/granularityI18n'

import type {
  DialogBaseOptions,
  DialogKind,
  DialogOnConfirm,
  DialogResult,
} from './types'

/**
 * Внутреннее описание одного запроса диалога в очереди. Создаётся методами
 * сервиса (`confirm`/`alert`/`prompt`/`open`) и потребляется хостом
 * (`GrDialogServiceHost`), который рендерит «голову» очереди (FIFO).
 */
export interface DialogRequest {
  id: string
  kind: DialogKind
  message: string
  options: DialogBaseOptions
  onConfirm?: DialogOnConfirm<any>
  /** Резолвит промис вызова детальным результатом `{ action, value }`. */
  resolve: (result: DialogResult<any>) => void
  /**
   * Конфиг и i18n, захваченные в месте вызова сервиса (в `setup`, где вызывающий
   * компонент ещё находится внутри дерева провайдера). Хост монтируется в
   * `document.body` вне дерева, поэтому сам их не увидит — см.
   * `SPEC-GrConfig-resolver.md`.
   *
   * Лежат в запросе, а не в модульной переменной: два поддерева с разными
   * провайдерами должны получать каждое свой конфиг.
   *
   * `Raw<…>` обязателен: очередь — `reactive`, а он разворачивает вложенные рефы.
   * Без `markRaw` контекст превратился бы в объект значений, `size.value` стало
   * бы `undefined`, и мост молча перестал бы работать.
   */
  config?: Raw<GrConfigContext> | null
  i18n?: Raw<GranularityI18nLike> | null
}

/**
 * Модульный синглтон очереди диалогов: единый источник правды для всех
 * вызовов сервиса. Хост-компонент рендерит только `queue[0]` — это
 * сериализует диалоги (FIFO) и исключает конкуренцию за фокус-трап.
 */
export const dialogQueue = reactive<DialogRequest[]>([])

let counter = 0

export function makeDialogId(): string {
  counter += 1
  return `gr-dialog-${Date.now()}-${counter}`
}
