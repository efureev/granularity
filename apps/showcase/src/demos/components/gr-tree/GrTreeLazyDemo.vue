<script setup lang="ts">
import { GrTree, type GrTreeNode } from '@feugene/granularity'

type Folder = { id: string, label: string, isLeaf?: boolean, children?: Folder[] }

// Корень приходит с сервера сразу, ветки — по раскрытию.
const roots: Folder[] = [
  { id: 'src', label: 'src' },
  { id: 'docs', label: 'docs' },
  { id: 'README.md', label: 'README.md', isLeaf: true },
]

function loadChildren(node: GrTreeNode<Folder>, resolve: (children: Folder[]) => void): void {
  window.setTimeout(() => {
    resolve([
      { id: `${node.key}/index.ts`, label: 'index.ts', isLeaf: true },
      { id: `${node.key}/nested`, label: 'nested' },
    ])
  }, 600)
}
</script>

<template>
  <GrTree
    :data="roots"
    node-key="id"
    lazy
    :load="loadChildren"
  />
</template>
