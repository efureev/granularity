// Вид кнопки — лист компонента по атрибутам (`<style>` в `GrButton.vue`), а не
// утилиты: собранных классов у неё нет. Немногие утилиты шаблона (`animate-spin`,
// `sr-only`) лежат литералами, и granum извлекает их из чанка сам.
export const grButtonSafelist: string[] = []
