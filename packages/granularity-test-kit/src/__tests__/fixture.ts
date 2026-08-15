import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, resolve } from 'node:path'

/** Пакет-фикстура на диске: гейты читают файловую систему, моком её не заменить. */
export function createFixturePackage(files: Record<string, string>): { dir: string, cleanup: () => void } {
  const dir = mkdtempSync(resolve(tmpdir(), 'gr-test-kit-'))

  for (const [path, content] of Object.entries(files)) {
    const full = resolve(dir, path)
    mkdirSync(dirname(full), { recursive: true })
    writeFileSync(full, content, 'utf8')
  }

  return { dir, cleanup: () => rmSync(dir, { recursive: true, force: true }) }
}
