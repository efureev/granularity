/**
 * Руководства по выбору компонента для `dist/component-guides.json`.
 *
 * `docs/` в опубликованный пакет не входит, а потребителю вне репозитория
 * (MCP-коннектору, IDE-плагину) нужна не страница целиком, а места, по которым
 * компонент выбирают: абзац назначения и три секции из `docs/components.md`
 * §«Страница компонента». Относительные ссылки снимаются: вне репозитория они
 * ведут в никуда, а текст ссылки и так называет цель.
 */

export const GUIDE_SECTIONS = {
  when: 'Когда брать',
  instead: 'Когда взять другое',
  limits: 'Границы',
}

export function stripRelativeLinks(markdown) {
  return markdown
    .replace(/!\[[^\]]*\]\((?!https?:)[^)]*\)/g, '')
    .replace(/\[([^\]]*)\]\((?!https?:)[^)]*\)/g, '$1')
}

function leadParagraph(lines) {
  const start = lines.findIndex(line => line.startsWith('# '))
  const paragraph = []

  if (start === -1)
    return undefined

  for (const line of lines.slice(start + 1)) {
    if (!line.trim()) {
      if (paragraph.length)
        break

      continue
    }

    if (!paragraph.length && /^(?:#|```|\|)/.test(line))
      return undefined

    paragraph.push(line.trim())
  }

  return paragraph.join(' ') || undefined
}

function sections(lines) {
  const found = new Map()
  let current
  let insideFence = false

  for (const line of lines) {
    if (line.startsWith('```'))
      insideFence = !insideFence

    const title = insideFence ? undefined : /^## (.+)$/.exec(line)?.[1]?.trim()

    if (title) {
      current = []
      found.set(title, current)
      continue
    }

    current?.push(line)
  }

  return found
}

/** `{ summary, when, instead, limits }`; отсутствующее место остаётся `undefined`. */
export function parseComponentGuide(markdown) {
  const lines = stripRelativeLinks(markdown).split('\n')
  const bySection = sections(lines)
  const guide = { summary: leadParagraph(lines) }

  for (const [key, title] of Object.entries(GUIDE_SECTIONS))
    guide[key] = bySection.get(title)?.join('\n').trim() || undefined

  return guide
}
