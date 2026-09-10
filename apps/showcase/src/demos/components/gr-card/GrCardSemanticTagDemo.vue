<script setup lang="ts">
import { GrCard, GrDescriptionList } from '@feugene/granularity'

const items = [
  { label: 'Gross', value: '$26,100' },
  { label: 'Refunds', value: '$1,355' },
  { label: 'Net', value: '$24,745' },
]
</script>

<template>
  <div class="grid gap-4">
    <!--
      Две карточки неотличимы — и в этом весь смысл: `as` со строковым тегом
      меняет разметку, а не поведение. Ни подсветки под курсором, ни кольца
      фокуса неинтерактивный тег не получает.
    -->
    <div class="grid gap-4 sm:grid-cols-2">
      <GrCard title="Revenue" description="Корень — div" variant="outlined" padding="md">
        <GrDescriptionList :items="items" label-width="7rem" />
      </GrCard>

      <GrCard as="section" title="Revenue" description="Корень — section" variant="outlined" padding="md">
        <GrDescriptionList :items="items" label-width="7rem" />
      </GrCard>
    </div>

    <!--
      Имя превращает секцию в лендмарк, поэтому оно даётся по явной просьбе:
      страница из десяти карточек-регионов делает их обзор бесполезным.
    -->
    <GrCard
      as="section"
      region-label="Продажи за август"
      title="Sales"
      description="role=&quot;region&quot; и имя — только по просьбе"
      variant="outlined"
      padding="md"
    >
      <GrDescriptionList :items="items" layout="flow" />
    </GrCard>
  </div>
</template>
