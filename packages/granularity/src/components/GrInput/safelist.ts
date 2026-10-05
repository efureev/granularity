// Всё, что рисует поле, лежит в коде целыми литералами: шаблон, карты
// `grInputStyles.ts`, общие `shared/controlShape.ts` и `shared/controlState.ts`.
// granum извлекает их сам из чанков компонента, включая общие, а собранных в
// рантайме классов у поля нет — объявлять нечего.
export const grInputSafelist: string[] = []
