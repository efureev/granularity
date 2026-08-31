export { default } from './GrCodeEditor.vue'
export { default as GrCodeEditor } from './GrCodeEditor.vue'
export { grCodeEditorConfig } from './config'
export type {
  GrCodeEditorEmits,
  GrCodeEditorLanguage,
  GrCodeEditorProps,
  GrCodeIssue,
} from './GrCodeEditor.vue'
export type { MinimalChange } from './editorState'
export { clampIssues, minimalChange } from './editorState'
// Реэкспорт затягивает `defaults.ts` (и его аугментацию реестра) к потребителю.
export type { GrCodeEditorConfigurableProps } from './defaults'
export { grCodeEditorSafelist } from './safelist'
