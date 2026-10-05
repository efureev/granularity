// Всё, что рисует поле, лежит в коде целыми литералами: шаблон, карты
// `grTextareaStyles.ts` и общий `shared/controlState.ts`. granum извлекает их сам
// из чанков компонента, включая общие, а собранных в рантайме классов у поля
// нет — объявлять нечего.
export const grTextareaSafelist: string[] = []
