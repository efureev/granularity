import { grIconClassTokens } from './grIconStyles'

// Классы тона и вращения живут строковыми литералами в `grIconStyles.ts` —
// на сборке он уезжает в общий dist-чанк, вне области скана компонента
// (docs/gotchas.md §2).
export const grIconSafelist = [...new Set(grIconClassTokens)]
