<script setup lang="ts">
import { GrTree } from '@feugene/granularity'

// Плоский справочник на 10 000 узлов: в DOM остаётся только окно вокруг
// вьюпорта, поэтому раскрытие такого дерева не стоит ничего.
const data = Array.from({ length: 10000 }, (_, index) => ({
  id: index + 1,
  label: `Node ${index + 1}`,
}))
</script>

<template>
  <GrTree
    :data="data"
    node-key="id"
    virtual
    :max-height="320"
  />
</template>
