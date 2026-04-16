import { fileURLToPath } from 'node:url'

import { assertNoTestArtifacts } from './distArtifacts.mjs'

assertNoTestArtifacts(fileURLToPath(new URL('../dist', import.meta.url)))