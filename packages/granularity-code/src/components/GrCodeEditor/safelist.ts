// Всё, что рисует редактор поверх CodeMirror, лежит в коде целыми литералами —
// в шаблоне, в `grCodeEditorStyles.ts`, в общей поверхности
// `internal/codeSurface.ts` и в карте ролей `codeTokenClass` для статичного
// превью. granum извлекает их сам из чанков компонента, общие включительно.
// Классы `gr-code-<role>`, которые CodeMirror вешает в рантайме, — зацепки
// собственного CSS, а не утилиты: их цвет объявлен в `<style>` компонента.
export const grCodeEditorSafelist: string[] = []
