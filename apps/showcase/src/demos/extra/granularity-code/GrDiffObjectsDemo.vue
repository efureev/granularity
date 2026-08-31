<script setup lang="ts">
import { computed, ref } from 'vue'

import { GrSwitch } from '@feugene/granularity'

/**
 * Ревизии записи приходят объектами, и порядок ключей у них разный: одна
 * пришла из API, другая собрана в форме.
 */
const PREVIOUS = { id: 41, title: 'Договор поставки', status: 'draft', amount: 120000, signed: false }
const CURRENT = { status: 'signed', title: 'Договор поставки № 41', id: 41, signed: true, amount: 120000 }

/**
 * Та же запись, ключи переставлены.
 *
 * Именно этим и проверяется устойчивая сериализация: сравнение обязано сказать
 * «изменений нет». Копия с тем же порядком ключей не доказывала бы ничего —
 * с ней совпал бы и наивный `JSON.stringify`.
 */
const REORDERED = { signed: false, amount: 120000, status: 'draft', title: 'Договор поставки', id: 41 }

const compareRevisions = ref(true)

const rightSide = computed(() => compareRevisions.value
  ? 'ревизия из API'
  : 'та же запись, ключи переставлены')
</script>

<template>
  <div class="grid gap-4">
    <GrSwitch v-model="compareRevisions" size="sm">
      Сравнивать с новой ревизией
    </GrSwitch>

    <GrDiff :before="PREVIOUS" :after="compareRevisions ? CURRENT : REORDERED" />

    <p class="showcase-demo-text text-sm">
      Справа: <b>{{ rightSide }}</b>
    </p>
  </div>
</template>
