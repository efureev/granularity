import { readdirSync } from 'node:fs'
import { relative, resolve, sep } from 'node:path'

const TEST_SEGMENT_NAMES = new Set(['__tests__', 'test', 'tests'])
const TEST_FILE_RE = /(?:^|\/)[^/]+\.(?:test|spec)\.[^/]+$/i

function normalizePath(path) {
  return path.split(sep).join('/')
}

export function isTestArtifactPath(path) {
  const normalizedPath = normalizePath(path)
  const segments = normalizedPath.split('/')

  return segments.some(segment => TEST_SEGMENT_NAMES.has(segment))
    || TEST_FILE_RE.test(normalizedPath)
}

export function collectTestArtifactPaths(rootDir) {
  const absoluteRootDir = resolve(rootDir)
  const testArtifactPaths = []
  const pendingPaths = [absoluteRootDir]

  while (pendingPaths.length > 0) {
    const currentDir = pendingPaths.pop()

    for (const entry of readdirSync(currentDir, { withFileTypes: true })) {
      const absoluteEntryPath = resolve(currentDir, entry.name)
      const relativeEntryPath = normalizePath(relative(absoluteRootDir, absoluteEntryPath))

      if (entry.isDirectory()) {
        if (isTestArtifactPath(relativeEntryPath)) {
          testArtifactPaths.push(relativeEntryPath)
          continue
        }

        pendingPaths.push(absoluteEntryPath)
        continue
      }

      if (entry.isFile() && isTestArtifactPath(relativeEntryPath))
        testArtifactPaths.push(relativeEntryPath)
    }
  }

  return testArtifactPaths.sort((left, right) => left.localeCompare(right))
}

export function assertNoTestArtifacts(rootDir) {
  const testArtifactPaths = collectTestArtifactPaths(rootDir)

  if (testArtifactPaths.length === 0)
    return

  const formattedPaths = testArtifactPaths.map(path => ` - ${path}`).join('\n')

  throw new Error(
    `Build output must not contain test files or directories:\n${formattedPaths}`,
  )
}