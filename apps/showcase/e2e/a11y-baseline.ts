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
 * С 2026-07-28 (ANALYSIS §53) снят главный пункт долга — `nested-interactive`:
 * с 14 компонентов до одного. Корень был в паттерне «элемент с виджет-ролью +
 * вложенный скрытый native input»: роль объявляет потомков презентационными, поэтому
 * вложенный контрол ломал виджет. `GrRadio`/`GrSegmented` перешли на
 * `input[type="hidden"]`, у `GrCheckbox` роль сужена до самого контрола, а подпись
 * (вместе с её ссылками и кнопками) вынесена наружу и связана `aria-labelledby`.
 *
 * Что стоит за оставшимися пунктами:
 *  - `nested-interactive` у `GrFileUpload` — drop-zone `role="button"` с нативным
 *    `<input type="file">` внутри. Лечится тем же приёмом, что и остальные, но у
 *    file-input своя механика открытия диалога — нужна отдельная правка.
 *  - `button-name` / `select-name` / `label` — точечные icon-only кнопки и нативные
 *    контролы без доступного имени в отдельных компонентах/демо.
 *  - `scrollable-region-focusable` — скролл-контейнер без доступа с клавиатуры.
 *
 * Чем проверять, не протух ли список: `A11Y_AUDIT=1` в прогоне `test:a11y` игнорирует
 * baseline и печатает весь долг — обычный гейт про регрессии и на долге молчит.
 *
 * ВНИМАНИЕ: список сознательно НЕ содержит `GrSlider`, `GrAutocomplete`, `GrTabs`,
 * `GrTree`, `GrDropdown`, `GrModal` и др. — они проходят гейт начисто.
 */
export const a11yKnownIssues: Record<string, string[]> = {
  GrDataTable: ['button-name'],
  GrFileUpload: ['nested-interactive'],
  GrInputTag: ['label'],
  GrList: ['button-name'],
  GrRadioGroup: ['select-name'],
  GrResponseErrorBanner: ['select-name'],
  GrSegmented: ['button-name', 'select-name'],
  GrToaster: ['scrollable-region-focusable'],
}

export function knownIssuesFor(componentName: string): string[] {
  return a11yKnownIssues[componentName] ?? []
}
