import { watchEffect } from 'vue'

/**
 * Предупреждение о пропе, который переименовали.
 *
 * Незнакомый атрибут Vue не отвергает: он уходит в `$attrs` и садится на
 * корневой узел. Значит переименование пропа проходит у потребителя **молча** —
 * не падают ни типы (`vue-tsc` не проверяет лишние атрибуты: принимать их
 * вправе любой компонент), ни рантайм. Компонент просто рисуется дефолтом, и
 * найти это можно только сверкой шаблона со списком пропов.
 *
 * Так и случилось со сменой `variant` на `tone` у `GrBadge` и `GrChip`: у
 * стороннего пакета тихо разъехались десять мест в шести файлах. Причём
 * `variant` в кольце остаётся законным именем у `GrButton`, `GrCard`, `GrAlert`
 * и десятка других — то есть по аналогии не угадать.
 *
 * Предупреждение живёт только в разработке и ничего не чинит за потребителя:
 * подставлять снятое имя значило бы завести алиас, который после 1.0 останется
 * навсегда.
 */
export function warnRenamedProp(
  component: string,
  attrs: Record<string, unknown>,
  renames: Readonly<Record<string, string>>,
): void {
  if (!__GR_DEV__)
    return

  const reported = new Set<string>()

  watchEffect(() => {
    for (const [from, to] of Object.entries(renames)) {
      if (attrs[from] === undefined || reported.has(from))
        continue

      reported.add(from)
      console.warn(
        `[granularity] ${component}: проп \`${from}\` переименован в \`${to}\`. `
        + `Сейчас \`${from}\` уходит в атрибуты корневого узла и на вид компонента не влияет.`,
      )
    }
  })
}
