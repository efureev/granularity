# GrConfigProvider

## What it is

A provider of global defaults for nested GR components: control size, per-component
default props and the i18n adapter. Set them once instead of repeating `size` or
`variant` on every call.

It renders transparently (`display: contents`) and works through `provide`/`inject`.
Providers nest — a child merges over its parent down to the individual prop.

```vue
<GrConfigProvider
  size="sm"
  :component-defaults="{ GrButton: { variant: 'outline' }, GrInput: { clearable: true } }"
>
  <GrButton>Save</GrButton>
</GrConfigProvider>
```

## Props

| Prop | Type | Description |
| --- | --- | --- |
| `size` | `'xs' \| 'sm' \| 'md' \| 'lg'` | Default size for nested controls. |
| `componentDefaults` | `GrComponentDefaults` | Default props keyed by component name. |
| `i18n` | `GranularityI18nAdapter \| null` | Translation adapter. Provided only when set, so it never shadows an adapter installed higher up. |
| `tag` | `string` (default `'div'`) | Wrapper tag. |

## Resolution order

```
local prop → componentDefaults[Component][prop] → provider `size` → the component's own default
```

A local prop always wins. A per-component default beats the global `size`, so
`componentDefaults` can be used as an exception to a global rule.

Without a provider everything resolves to the component's own defaults — the
component behaves exactly as it did before the provider existed.

## Configurable props

The set is closed on purpose: the config shapes appearance only, never a
`modelValue` or an event handler.

| Component | Props |
| --- | --- |
| `GrButton` | `variant`, `tone`, `size`, `square` |
| `GrInput` | `size`, `clearable` |
| `GrBadge` | `tone`, `size`, `radius` |

## Where the contract lives

This provider knows nothing about concrete components. `context.ts` declares an
empty, open registry; every component augments it **from its own folder**:

```ts
// GrButton/defaults.ts
export interface GrButtonConfigurableProps { variant: GrButtonVariant, /* … */ }

declare module '../GrConfigProvider/context' {
  interface GrComponentDefaultsRegistry { GrButton: GrButtonConfigurableProps }
}
```

Consequence for consumers: `componentDefaults` is typed with exactly the components
they imported. Pull in only `GrButton` and `GrBadge`'s types never enter the project.

## Making a component configurable

1. `GrX/defaults.ts` — the props interface plus the `declare module` augmentation.
   Take value types from `*Styles.ts`; those modules do not import the context, so
   there is no cycle. Never take them from `.vue` — that is a cycle.
2. `GrX/index.ts` — `export type { GrXConfigurableProps } from './defaults'`.
   **Required**: this re-export is what delivers the augmentation to the consumer.
3. In the component — `default: undefined` in `withDefaults` plus a resolver:
   `useGrComponentProp('GrX', 'variant', () => props.variant, 'primary')`, or
   `useGrComponentSize(() => props.size, { component: 'GrX', supported })` for size.
4. Make sure the prop is no longer read directly (`props.variant`) anywhere.

Step 3 is not optional: Vue substitutes a declared default before the component can
look at the config, and from the inside "the user passed `primary`" is
indistinguishable from "the default fired". The real default has to live in the
resolver.

`supported` declares the size scale a component actually implements — `GrSlider`,
`GrRating`, `GrSwitch`, `GrLink` and `GrStatistic` have no `xs`. A size from the
config outside that list is ignored in favour of the component's own default, with a
dev-only console warning, instead of silently rendering an element with no size
classes.

## Exports

`GrConfigProvider`, `useGrConfig`, `useGrComponentSize`, `useGrComponentProp`,
`useGrComponentDefaults`, `GR_CONFIG_KEY`, `GR_COMPONENT_SIZES` and the
`GrComponentDefaults` / `GrComponentDefaultsRegistry` / `GrConfigurableComponent` /
`GrComponentSize` / `GrConfigContext` types.

## Notes

- Configurable props read from the outside (via a template ref or a wrapper) are
  `undefined` until passed explicitly — their defaults now live in the resolvers.
- `display: contents` keeps layout intact, but the wrapper is still a DOM node:
  `.parent > .child` and `:nth-child` selectors on direct children will shift. Use
  `tag` if that matters.
- With an empty registry (no configurable component imported) `GrComponentDefaults`
  degrades to `{}`, which TypeScript lets any object literal satisfy. Key checking
  starts with the first imported configurable component.
- The contract is verified end-to-end by `apps/playground-config`.
