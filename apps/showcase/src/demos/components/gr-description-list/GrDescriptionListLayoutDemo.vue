<script setup lang="ts">
import { ref } from 'vue'

import type { GrDescriptionItem, GrDescriptionLayout } from '@feugene/granularity'
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
</script>

<template>
  <div class="grid gap-4">
    <GrSegmented
      v-model="layout"
      :options="[
        { value: 'inline', label: 'inline' },
        { value: 'stacked', label: 'stacked' },
      ]"
      size="sm"
    />

    <!--
      `stackBelow` меряет контейнер, а не вьюпорт: пары живут и в узкой карточке
      на широком экране. Ниже порога `inline` сам переключается на `stacked` —
      фиксированная подпись иначе выжимает значение в букву на строку.
    -->
    <GrDescriptionList :items="items" :layout="layout" :columns="2" :stack-below="420" />
  </div>
</template>
