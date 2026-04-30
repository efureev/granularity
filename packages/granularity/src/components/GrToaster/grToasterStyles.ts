export type GrToasterPlacement = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'

// Классы позиционирования контейнера по углам экрана.
// Вынесены в отдельный модуль, чтобы быть единственным источником истины
// для шаблона `GrToaster.vue` и для safelist.
export const PLACEMENT_CLASS: Record<GrToasterPlacement, string> = {
  'top-right': 'right-4 top-4',
  'top-left': 'left-4 top-4',
  'bottom-right': 'right-4 bottom-4',
  'bottom-left': 'left-4 bottom-4',
}
