/**
 * Реестр ИЗВЕСТНЫХ (pre-existing) axe-нарушений по компонентам — «долг доступности»,
 * зафиксированный при внедрении a11y-слоя.
 *
 * Зачем baseline, а не «зелёный любой ценой»: внедрять axe на существующую кодовую
 * базу принято через фиксацию текущего состояния и гейт на *регрессии* — новые
 * нарушения (и любой НОВЫЙ компонент) падают сразу, а накопленный долг виден списком
 * и выжигается со временем (удаляем строки по мере починки). Пустой список для
 * компонента = он обязан быть чистым.
 *
 * Правило `color-contrast` с 2026-07-28 ВКЛЮЧЕНО (ANALYSIS §54) и в baseline не
 * занесено ни для одного компонента: контраст обязан быть чистым везде. Токен
 * `--gr-muted-fg`, из-за которого правило раньше было выключено, исправлен в
 * обеих темах.
 *
 * Что стоит за оставшимися пунктами:
 *  - `nested-interactive` — паттерн `GrRadio` в button/segmented-режиме
 *    (`<div role="radio">` + вложенный native `<input>`); тиражирован в builder-демо
 *    витрины как переключатели пропсов. Чинится централизованно в `GrRadio`.
 *  - `button-name` / `select-name` / `label` — точечные icon-only кнопки и нативные
 *    контролы без доступного имени в отдельных компонентах/демо.
 *  - `scrollable-region-focusable` — скролл-контейнер без доступа с клавиатуры.
 *
 * ВНИМАНИЕ: список сознательно НЕ содержит `GrSlider`, `GrAutocomplete`, `GrTabs`,
 * `GrTree`, `GrDropdown`, `GrModal` и др. — они проходят гейт начисто.
 */
export const a11yKnownIssues: Record<string, string[]> = {
  GrBadge: ['nested-interactive'],
  GrButton: ['nested-interactive'],
  GrCheckbox: ['nested-interactive', 'scrollable-region-focusable'],
  GrDataTable: ['button-name'],
  GrFileUpload: ['nested-interactive'],
  GrFormField: ['nested-interactive'],
  GrFormSection: ['nested-interactive'],
  GrInput: ['nested-interactive'],
  GrInputTag: ['label'],
  GrLink: ['nested-interactive'],
  GrList: ['button-name'],
  GrNumberInput: ['nested-interactive'],
  GrRadio: ['nested-interactive'],
  GrRadioGroup: ['nested-interactive', 'select-name'],
  GrResponseErrorBanner: ['select-name'],
  GrSegmented: ['nested-interactive', 'button-name', 'select-name'],
  GrSelect: ['nested-interactive'],
  GrSwitch: ['nested-interactive'],
  GrToaster: ['nested-interactive', 'scrollable-region-focusable'],
}

export function knownIssuesFor(componentName: string): string[] {
  return a11yKnownIssues[componentName] ?? []
}
