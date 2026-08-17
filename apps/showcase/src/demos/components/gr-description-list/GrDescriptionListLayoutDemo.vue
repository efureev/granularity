<script setup lang="ts">
import { ref } from 'vue'

import type { GrDescriptionItem, GrDescriptionColumns, GrDescriptionLayout } from '@feugene/granularity'
import { GrDescriptionList, GrSegmented } from '@feugene/granularity'

const items: GrDescriptionItem[] = [
  { label: 'Plan', value: 'Business' },
  { label: 'Seats', value: 48 },
  { label: 'MIME', value: 'application/pdf' },
  { label: 'Size', value: '2.4 MB' },
  { label: 'Checksum', value: 'sha256:9f2b1c…' },
  { label: 'Retention', value: '90 days' },
]

const layout = ref<GrDescriptionLayout>('inline')
const columns = ref<GrDescriptionColumns>(2)
</script>

<template>
  <div class="grid gap-4">
    <GrSegmented
      v-model="layout"
      :options="[
        { value: 'inline', label: 'inline' },
        { value: 'stacked', label: 'stacked' },
        { value: 'flow', label: 'flow' },
      ]"
      size="sm"
    />

    <!--
      Колонки принадлежат сетке, поэтому в `flow` переключатель не у дел:
      строка раскладывает пары по ширине и переносит их сама.
    -->
    <GrSegmented
      v-model="columns"
      :options="[
        { value: 1, label: '1' },
        { value: 2, label: '2' },
        { value: 3, label: '3' },
        { value: 4, label: '4' },
      ]"
      :disabled="layout === 'flow'"
      size="sm"
    />

    <!--
      `stackBelow` меряет контейнер, а не вьюпорт: пары живут и в узкой карточке
      на широком экране. Ниже порога `inline` сам переключается на `stacked` —
      фиксированная подпись иначе выжимает значение в букву на строку.
    -->
    <GrDescriptionList :items="items" :layout="layout" :columns="columns" :stack-below="420" />
  </div>
</template>
