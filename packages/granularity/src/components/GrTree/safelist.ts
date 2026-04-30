// Только динамические значения иконок-пропов (`expandIcon`/`collapseIcon`/`dragHandleIcon`).
// Литералы шаблона (`py-2`, `px-2`, `ml-6`, ...) не дублируем — UnoCSS находит их сканом.
export const grTreeSafelist = [
  'i-lucide-chevron-right',
  'i-lucide-grip-vertical',
] as const