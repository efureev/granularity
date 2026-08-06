/**
 * Единая точка монтирования оверлеев.
 *
 * До неё каждый оверлей телепортировался в `body` сам по себе, и правило
 * `inert` держалось на договорённости «все оверлеи лежат ровно на один уровень
 * ниже `body`». Один контейнер даёт управляемую точку монтирования (своё
 * приложение в контейнере, микрофронтенд, shadow DOM), одну точку очистки и
 * порядок, совпадающий с порядком открытия.
 *
 * **У корня не должно быть ни стилей, ни классов.** `transform`, `filter`,
 * `contain`, `perspective` и `will-change` создают containing block для
 * `position: fixed`, и тогда панели `useFloating` начинают позиционироваться
 * относительно портала, а не вьюпорта — с виду это «панель прилипла не туда»,
 * и ищется такое долго.
 */

export const GR_PORTAL_ID = 'gr-portal'

/**
 * Создаёт корень портала при первом обращении и возвращает его.
 *
 * `null` на сервере: DOM там трогать нечем, а телепорт всё равно выключен до
 * монтирования (см. `useTeleportEnabled`).
 */
export function ensurePortalRoot(): HTMLElement | null {
  if (typeof document === 'undefined') return null

  const existing = document.getElementById(GR_PORTAL_ID)
  if (existing) return existing

  const root = document.createElement('div')
  root.id = GR_PORTAL_ID
  root.setAttribute('data-gr-portal', '')
  document.body.appendChild(root)

  return root
}

/** Текущий корень портала, если он уже создан. */
export function getPortalRoot(): HTMLElement | null {
  if (typeof document === 'undefined') return null
  return document.getElementById(GR_PORTAL_ID)
}

/** Тестовая/служебная очистка: убирает корень из документа. */
export function resetPortalRoot(): void {
  getPortalRoot()?.remove()
}
