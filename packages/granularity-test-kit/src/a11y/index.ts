/**
 * axe в jsdom — `@feugene/granularity-test-kit/a11y`.
 *
 * Отдельным подпутём, а не внутри `./vue`: статический импорт `axe-core` в
 * общем модуле сделал бы его обязательным для каждого, кто взял оттуда хоть
 * одну функцию. У ядра `axe-core` нет, а `./vue` оно берёт на общих правах.
 */
export { axeViolations, type AxeViolationsOptions, BLOCKING_IMPACTS } from './axe'
