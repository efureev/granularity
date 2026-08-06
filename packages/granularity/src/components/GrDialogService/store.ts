import { reactive } from 'vue'
import type { AppContext, Raw } from 'vue'

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
 * (`GrDialogServiceHost`), который рендерит видимую часть очереди.
 */
export interface DialogRequest {
  id: string
  kind: DialogKind
  message: string
  options: DialogBaseOptions
  onConfirm?: DialogOnConfirm<any>
  /** Позиция среди ожидающих: больше — раньше. При равенстве порядок FIFO. */
  priority: number
  /**
   * Заявка создана из `onConfirm` уже открытого диалога и показывается **поверх**
   * него, а не за ним. Без этого вложенный вызов вставал бы в очередь за тем,
   * кто его ждёт: внешнее окно висело бы в загрузке, а промис не резолвился бы
   * никогда.
   */
  nested: boolean
  /**
   * Заявка уже завершена. Флаг живёт на самой заявке, а не на хосте: завершить
   * её могут трое (кнопка в окне, `close()` промиса, `closeAll()`), и общее
   * состояние на хосте означало бы, что второй и третий путь про первый не
   * знают.
   */
  settled: boolean
  /** Резолвит промис вызова детальным результатом `{ action, value }`. */
  resolve: (result: DialogResult<any>) => void
  /**
   * Конфиг и i18n, захваченные в месте вызова сервиса (в `setup`, где вызывающий
   * компонент ещё находится внутри дерева провайдера). Хост монтируется в
   * `document.body` вне дерева, поэтому сам их не увидит — см.
   * `SPEC-GrConfig-resolver.md`.
   *
   * Лежат в запросе, а не в состоянии сервиса: два поддерева с разными
   * провайдерами должны получать каждое свой конфиг.
   *
   * `Raw<…>` обязателен: очередь — `reactive`, а он разворачивает вложенные рефы.
   * Без `markRaw` контекст превратился бы в объект значений, `size.value` стало
   * бы `undefined`, и мост молча перестал бы работать.
   */
  config?: Raw<GrConfigContext> | null
  i18n?: Raw<GranularityI18nLike> | null
}

/** Контекст, захваченный вызовом `useDialogService()` внутри `setup`. */
export interface CapturedDialogContext {
  config: Raw<GrConfigContext> | null
  i18n: Raw<GranularityI18nLike> | null
}

/**
 * Состояние одного инстанса сервиса: очередь, смонтированный хост и захваченный
 * контекст приложения. Живёт либо в приложении (через
 * `granularityDialogServicePlugin`), либо в ленивом модульном фолбэке для
 * простых SPA — см. `useDialogService.ts`.
 */
export interface DialogServiceState {
  /** Очередь заявок. Видимую часть выбирает хост, остальные ждут. */
  queue: DialogRequest[]
  mounted: boolean
  container: HTMLElement | null
  appContext: AppContext | null
  lastCapturedContext: CapturedDialogContext | null
  contextlessWarned: boolean
  /**
   * Заявки, чей `onConfirm` сейчас в полёте, от внешней к самой глубокой.
   * По ним определяется вложенность нового вызова.
   */
  inFlight: DialogRequest[]
}

export function createDialogServiceState(): DialogServiceState {
  return {
    queue: reactive<DialogRequest[]>([]),
    mounted: false,
    container: null,
    appContext: null,
    lastCapturedContext: null,
    contextlessWarned: false,
    inFlight: [],
  }
}

let counter = 0

export function makeDialogId(): string {
  counter += 1
  return `gr-dialog-${Date.now()}-${counter}`
}

/**
 * Видимая часть очереди: голова и непрерывный хвост вложенных заявок за ней.
 * Всё остальное ждёт — обычные вызовы по-прежнему идут по одному, чтобы три
 * алерта из цикла не легли стопкой.
 */
export function visibleDialogRequests(state: DialogServiceState): DialogRequest[] {
  const visible: DialogRequest[] = []

  for (const request of state.queue) {
    if (visible.length === 0 || request.nested)
      visible.push(request)
    else
      break
  }

  return visible
}

/**
 * Ставит заявку в очередь. Единственное место, где решается её позиция:
 *
 * - вложенная (создана, пока `onConfirm` другой заявки в полёте) встаёт сразу
 *   за своим родителем и показывается поверх него;
 * - обычная — перед всеми ожидающими с меньшим приоритетом; показанные окна не
 *   трогаются, выдёргивать фокус-ловушку из-под пользователя нельзя.
 */
export function enqueueDialogRequest(state: DialogServiceState, request: DialogRequest): void {
  const parent = state.inFlight[state.inFlight.length - 1]

  if (parent) {
    request.nested = true
    const parentIndex = state.queue.findIndex(item => item.id === parent.id)
    state.queue.splice(parentIndex + 1, 0, request)
    return
  }

  const visibleCount = visibleDialogRequests(state).length
  const insertAt = state.queue.findIndex(
    (item, index) => index >= visibleCount && item.priority < request.priority,
  )

  if (insertAt < 0)
    state.queue.push(request)
  else
    state.queue.splice(insertAt, 0, request)
}

/**
 * Заявка входит в «полёт»: пока её `onConfirm` не вернулся, новые вызовы
 * считаются вложенными в неё.
 */
export function startDialogInFlight(state: DialogServiceState, request: DialogRequest): void {
  state.inFlight.push(request)
}

/** Заявка вышла из полёта (колбэк вернулся или окно размонтировано). */
export function finishDialogInFlight(state: DialogServiceState, request: DialogRequest): void {
  const index = state.inFlight.indexOf(request)
  if (index >= 0)
    state.inFlight.splice(index, 1)
}

/**
 * Единственный способ завершить заявку: идемпотентно резолвит промис и снимает
 * её из очереди.
 *
 * `removeFromQueue: false` нужен окну: оно гасит себя и даёт анимации закрытия
 * доиграть, прежде чем заявка исчезнет из очереди. Корректность от этой
 * отсрочки не зависит: повторное завершение отсекается флагом на заявке.
 */
export function settleDialogRequest(
  state: DialogServiceState,
  request: DialogRequest,
  result: DialogResult<any>,
  { removeFromQueue = true }: { removeFromQueue?: boolean } = {},
): boolean {
  if (request.settled)
    return false

  request.settled = true
  request.resolve(result)

  if (removeFromQueue)
    removeDialogRequest(state, request)

  return true
}

/** Снимает заявку из очереди, если она ещё там. */
export function removeDialogRequest(state: DialogServiceState, request: DialogRequest): void {
  const index = state.queue.findIndex(item => item.id === request.id)
  if (index >= 0)
    state.queue.splice(index, 1)
}
