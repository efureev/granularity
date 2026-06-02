import { reactive } from 'vue'

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
