/**
 * Компоненты, у которых есть страница: песочница и спецификация на настоящих
 * компонентах пакета, вид в каждой теме каталога и значения токенов темы.
 * Тексты — из `docs/components/<GrX>.md` и `docs/design/<GrX>.md` пакета
 * (`docs.ts`); согласие с ними держит тест `src/__tests__/catalog.test.ts`.
 */

export interface CatalogComponent {
  id: string
  name: string
  /** Компоненты пакета, которые описывает страница: их токены — на вкладке «Токены». */
  exports: string[]
  importPath: string
  summary: string
}

export const catalog: CatalogComponent[] = [
  {
    id: 'button',
    name: 'Button',
    exports: ['GrButton', 'GrButtonGroup'],
    importPath: '@feugene/granularity/components/GrButton',
    summary: 'Запускает действие, которое меняет состояние: сохранить, удалить, отправить. Переход по адресу — ссылка или кнопка с href.',
  },
]

export function findComponent(id: string): CatalogComponent | undefined {
  return catalog.find(item => item.id === id)
}
