/**
 * Тип публичного API компонента — то, что он отдал через `defineExpose`.
 *
 * Зачем свой, а не `InstanceType<typeof GrX>`: у компонентов с
 * `<script setup generic>` (`GrSelect`, `GrTree`, `GrDataTable`, …) `InstanceType`
 * не работает вовсе — такой компонент компилируется не в класс, а в функцию.
 *
 * Зачем выводом, а не руками: написанный руками тип — копия `defineExpose`,
 * которая расходится с оригиналом молча. Здесь разойтись не с чем.
 *
 * Определение — из `vue-component-type-helpers` (MIT). Скопировано, а не
 * подключено зависимостью: пакет публикуемый, и тащить потребителю целый
 * пакет ради одного условного типа несоразмерно.
 */
export type ComponentExposed<T> = T extends new (...args: any) => infer E
  ? E
  : T extends (props: any, ctx: any, expose: (exposed: infer E) => any, ...args: any) => any
    ? NonNullable<E>
    : Record<string, never>
