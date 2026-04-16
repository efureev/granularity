function parseAccept(accept: string | undefined): string[] {
  if (!accept) return []

  return accept
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)
}

export function matchAccept(file: File, accept: string | undefined): boolean {
  const tokens = parseAccept(accept)
  if (!tokens.length) return true

  const fileName = file.name.toLowerCase()
  const fileType = (file.type || '').toLowerCase()

  for (const rawToken of tokens) {
    const token = rawToken.toLowerCase()

    // Extension match, e.g. ".png".
    if (token.startsWith('.')) {
      if (fileName.endsWith(token)) return true
      continue
    }

    // Mime group match, e.g. "image/*".
    if (token.endsWith('/*')) {
      if (!fileType) continue
      const prefix = token.slice(0, -1) // keep trailing '/'
      if (fileType.startsWith(prefix)) return true
      continue
    }

    // Exact mime match, e.g. "image/png".
    if (!fileType) continue
    if (fileType === token) return true
  }

  return false
}