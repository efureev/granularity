import { grComponentTokens, type GrComponentToken } from '@feugene/granularity/tokens'

interface TokenRegistryFile {
  owner?: string
  tokens: Omit<GrComponentToken, 'owner'>[]
}

/**
 * Токены компонентов всей экосистемы. Ядро отдаёт реестр подпутём
 * (`@feugene/granularity/tokens`), спутники — нет: их реестр — `tokens.json`
 * рядом с компонентом, и приложение читает его из исходников сборкой, как тексты
 * документации (`docs.ts`). Владелец — поле `owner` файла, иначе папка компонента.
 */
const satelliteRegistries = import.meta.glob<TokenRegistryFile>(
  '../../../../packages/granularity-*/src/components/Gr*/tokens.json',
  { import: 'default', eager: true },
)

function folderOf(path: string): string {
  const parts = path.split('/')
  return parts[parts.length - 2]
}

export const componentTokens: readonly GrComponentToken[] = [
  ...grComponentTokens,
  ...Object.entries(satelliteRegistries).flatMap(([path, registry]) =>
    registry.tokens.map(token => ({ ...token, owner: registry.owner ?? folderOf(path) }))),
]
