// Иконки-пропы (`expandIcon`/`collapseIcon`/`dragHandleIcon`) приходят от
// потребителя: их классы генерирует его сборка, а не наша. Встроенные иконки
// компилируются в `dist` и CSS не требуют.
// Литералы шаблона (`py-2`, `px-2`, `ml-6`, ...) не дублируем — UnoCSS находит их сканом.
export const grTreeSafelist = [] as const
