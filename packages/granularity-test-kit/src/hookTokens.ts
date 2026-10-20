import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

interface HookedComponent {
  readonly name: string
  readonly group?: string
  readonly hookTokens?: readonly string[]
}

/**
 * Хуки реестра — в дескрипторы провайдера на сборке пакета.
 *
 * Токен `kind: "hook"` в `tokens.json` компонента — точка кастомизации:
 * компонент читает его через `var(--x, запасное)`, а тема намеренно не задаёт.
 * granum с 3.7 называет такой токен находкой `token-fallback-only`, если
 * дескриптор не объявил его в `hookTokens`: незаданный токен, который всегда
 * рисует запасное значение, обычно означает переименование. Природу токена знает
 * только реестр, поэтому `hookTokens` выводятся из него здесь, а не повторяются
 * в `config.ts`: свои хуки компонента и хуки его группы (`group` — общий SFC).
 * Хук чужого компонента дескриптор объявляет сам — эти записи сохраняются.
 *
 * Вызывается в `vite.config.ts` пакета перед `granumProvider`: в рантайм-чанки
 * компонентов реестр не попадает.
 */
export function withRegistryHookTokens<P extends { readonly components: readonly HookedComponent[] }>(provider: P, srcDir: string): P {
  const componentsDir = resolve(srcDir, 'components')
  const hooksOf = (owner: string): string[] => {
    const file = resolve(componentsDir, owner, 'tokens.json')
    if (!existsSync(file))
      return []
    const registry = JSON.parse(readFileSync(file, 'utf8')) as { tokens: readonly { name: string, kind: string }[] }
    return registry.tokens.filter(token => token.kind === 'hook').map(token => token.name)
  }

  return {
    ...provider,
    components: provider.components.map((component) => {
      const hooks = [...new Set([
        ...(component.hookTokens ?? []),
        ...hooksOf(component.name),
        ...(component.group ? hooksOf(component.group) : []),
      ])]
      return hooks.length > 0 ? { ...component, hookTokens: hooks } : component
    }),
  }
}
