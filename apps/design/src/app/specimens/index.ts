import { type Component, defineAsyncComponent } from 'vue'

/**
 * Образцы компонентов каталога: файл `Gr<X>Specimen.vue` на компонент. Суффикс
 * обязателен: в файле `GrInput.vue` тег `<GrInput>` — ссылка SFC на самого
 * себя, и образец рекурсивно рендерил бы сам себя. С `preview` —
 * одно состояние для карточки каталога и «Тем рядом», без него — все состояния
 * и поведение для «Обзора». Полноту держит `src/__tests__/catalog.test.ts`.
 */
const files = import.meta.glob<Component>('./Gr*Specimen.vue', { import: 'default' })
const loaded = new Map<string, Component>()

export const specimenNames: readonly string[] = Object.keys(files).map(path => path.slice('./'.length, -'Specimen.vue'.length))

export function specimenOf(name: string): Component | undefined {
  const load = files[`./${name}Specimen.vue`]
  if (!load)
    return undefined
  if (!loaded.has(name))
    loaded.set(name, defineAsyncComponent(load))
  return loaded.get(name)
}
