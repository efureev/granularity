import { plainLines, type GrCodeLine, type GrCodeRole, type GrCodeTokenizer } from './palette'
import { GR_CODE_SHIKI_THEME, roleForMarker } from './shikiTheme'

/**
 * Адаптер к Shiki — единственное место в пакете, знающее его форму.
 *
 * Типизуется **структурно, по одному методу**, который вызывает: `shiki` не
 * появляется ни в зависимостях пакета, ни в импортах типов. Переименуй Shiki
 * этот метод в следующем мажоре — сломается этот файл, и только он; контракт
 * `GrCodeTokenizer` не сломается никогда, а потребитель в худшем случае
 * напишет свои пять строк адаптера вместо наших.
 */
export interface ShikiLike {
  codeToTokensBase: (
    code: string,
    options: { lang: string, theme: unknown },
  ) => Array<Array<{ content: string, color?: string }>>
}

/**
 * Токенизатор поверх экземпляра Shiki, созданного потребителем.
 *
 * Какие грамматики загружены и какой движок регулярок собран — WASM или JS —
 * решает он. Мы не выбираем за него и не тащим грамматик, которых он не просил.
 *
 * Роль извлекается **темой-меткой** (`shikiTheme.ts`): токены Shiki несут цвет,
 * а не смысл, а семантические scope'ы доступны только с `includeExplanation`,
 * документированным как дорогой.
 *
 * Язык, которого в экземпляре нет, Shiki роняет исключением. Здесь оно ловится:
 * блок обязан показать текст, а не пустоту, — подсветки нет, содержимое есть.
 */
export function createShikiTokenizer(highlighter: ShikiLike): GrCodeTokenizer {
  const warned = new Set<string>()

  return (code, language) => {
    let raw: Array<Array<{ content: string, color?: string }>>

    try {
      raw = highlighter.codeToTokensBase(code, { lang: language, theme: GR_CODE_SHIKI_THEME })
    }
    catch (error) {
      if (__GR_DEV__ && !warned.has(language)) {
        warned.add(language)
        console.warn(
          `[granularity-code] Shiki не разобрал язык \`${language}\`, показан обычный текст. `
          + 'Скорее всего грамматика не загружена в экземпляр хайлайтера.',
          error,
        )
      }

      return plainLines(code)
    }

    return raw.map(line => line.map(token => ({
      text: token.content,
      role: roleForMarker(token.color),
    })))
  }
}

export type { GrCodeLine, GrCodeRole }
