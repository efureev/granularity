// Составных классов у поповера нет: поле и кегль (`panelSizes`/`panelSizesFlush`),
// `origin-*` по стороне раскрытия (`overlayOriginClass` выбирает из карты
// `shared/overlayOrigin.ts`), поверхность и набор перехода из `shared/` — целые
// литералы, а обёртка триггера приезжает тернарником из двух литералов. granum
// извлекает их сам из всех чанков компонента, включая общие.
export const grPopoverSafelist: string[] = []
