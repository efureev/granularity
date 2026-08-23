import type { InjectionKey } from 'vue'
import { inject, onScopeDispose, provide, watch } from 'vue'

export interface GrModalContext {
  /** Id, который обязан оказаться на элементе заголовка окна. */
  titleId: string
  /** Id, который обязан оказаться на элементе описания окна. */
  descriptionId: string
  /** «Заголовок отрисован» — окно ставит `aria-labelledby`. Возвращает отказ от заявки. */
  claimTitle: () => () => void
  /** То же для описания и `aria-describedby`. */
  claimDescription: () => () => void
}

export const GR_MODAL_CONTEXT_KEY: InjectionKey<GrModalContext> = Symbol('GrModalContext')

export function provideGrModalContext(context: GrModalContext): void {
  provide(GR_MODAL_CONTEXT_KEY, context)
}

/**
 * Контекст окна для его частей.
 *
 * Именно контекст, а не проп: заголовок рисует `GrDialogHeader` — внук
 * `GrModal` через слот, — а `aria-labelledby` стоит на корне окна.
 *
 * **Id принадлежит окну, а не заголовку.** Заголовок только сообщает, что
 * отрисовался. Обратный порядок (id рождается у потомка и уезжает наверх)
 * означает мутацию состояния окна во время его собственного патча: Vue уходит
 * в рекурсивный ре-рендер и монтирует заголовок заново, пока не упрётся в
 * лимит. Стабильный id этого класса ошибок не допускает по построению.
 *
 * `null` вне окна — законное состояние: `GrDialogHeader` используют и отдельно.
 */
export function useGrModalContext(): GrModalContext | null {
  return inject(GR_MODAL_CONTEXT_KEY, null)
}

/**
 * Объявляет элемент заголовком окна, пока `active` истинно.
 *
 * Возвращает id для элемента — или `undefined` вне окна: тогда заголовок просто
 * рисуется без связи.
 */
export function useGrModalTitle(active: () => boolean): { titleId: string | undefined } {
  const context = useGrModalContext()
  if (!context)
    return { titleId: undefined }

  let release: (() => void) | undefined

  watch(
    active,
    (isActive) => {
      release?.()
      release = isActive ? context.claimTitle() : undefined
    },
    // `post`: заявка меняет состояние окна, а заголовок — его потомок, и в
    // `pre`-фазе мутация пришлась бы на патч самого окна.
    { immediate: true, flush: 'post' },
  )

  onScopeDispose(() => release?.())

  return { titleId: context.titleId }
}
