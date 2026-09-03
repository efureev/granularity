<script setup lang="ts">
import { ref } from 'vue'

import { GrTreeSections } from '@feugene/granularity'
import type { GrTreeKey } from '@feugene/granularity'

type Item = { id: string, label: string, children?: Item[] }

const catalog: Item[] = [
  { id: 'access', label: 'Доступы', children: [
    { id: 'roles', label: 'Роли', children: [
      { id: 'admin', label: 'Администратор' },
      { id: 'operator', label: 'Оператор' },
    ] },
    { id: 'tokens', label: 'Токены' },
  ] },
  { id: 'billing', label: 'Биллинг', children: [
    { id: 'invoices', label: 'Счета' },
    { id: 'disputes', label: 'Споры' },
  ] },
  { id: 'ops', label: 'Операции', children: [
    { id: 'escalations', label: 'Эскалации' },
    { id: 'runbooks', label: 'Регламенты' },
  ] },
]

const current = ref<GrTreeKey | undefined>('operator')
</script>

<template>
  <!--
    Корни данных стали заголовками, их дети — отдельными деревьями. Внутри это не
    одно дерево с заголовками между строк: `role="tree"` требует, чтобы его
    детьми были `treeitem`, а заголовки между деревьями законны.
  -->
  <div class="w-full max-w-md">
    <GrTreeSections
      v-model:current-key="current"
      :data="catalog"
      node-key="id"
      show-count
      :default-expanded-keys="['roles']"
    />
  </div>
</template>
