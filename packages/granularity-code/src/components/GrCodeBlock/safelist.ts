// Всё, что рисует блок, лежит в коде целыми литералами — в шаблоне, в
// `shared/grCodeBlockStyles.ts` и в общей поверхности
// `internal/codeSurface.ts`; роли подсветки — мапа `codeTokenClass`, по
// литералу на роль. granum извлекает их сам из чанков компонента, общие
// включительно. Зацепки собственного CSS (`codeBlockHookClass`,
// `codeBlockNumberedClass`) не утилиты, и safelist им не нужен.
export const grCodeBlockSafelist: string[] = []
