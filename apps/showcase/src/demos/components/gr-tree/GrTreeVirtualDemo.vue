<script setup lang="ts">
import { GrTree } from '@feugene/granularity'

// Настоящее дерево на три уровня: 100 регионов × 10 площадок × 10 линий = 10 000
// листьев (плюс 1100 ветвей). Виртуализация работает по раскрытым строкам, а не по
// корням, поэтому раскрытие ветки в таком дереве стоит столько же, сколько в малом.
const data = Array.from({ length: 100 }, (_, region) => ({
  id: `r${region + 1}`,
  label: `Region ${region + 1}`,
  children: Array.from({ length: 10 }, (_, site) => ({
    id: `r${region + 1}-s${site + 1}`,
    label: `Site ${region + 1}.${site + 1}`,
    children: Array.from({ length: 10 }, (_, line) => ({
      id: `r${region + 1}-s${site + 1}-l${line + 1}`,
      label: `Line ${region + 1}.${site + 1}.${line + 1}`,
    })),
  })),
}))

// Пара раскрытых ветвей на старте: видно и вложенность, и направляющие уровней.
const defaultExpandedKeys = ['r1', 'r1-s1', 'r2']
</script>

<template>
  <GrTree
    :data="data"
    node-key="id"
    :default-expanded-keys="defaultExpandedKeys"
    branch-line
    virtual
    :max-height="320"
  />
</template>
