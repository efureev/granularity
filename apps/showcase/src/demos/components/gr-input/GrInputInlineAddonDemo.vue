<script setup lang="ts">
import { ref } from 'vue'

import { GrFormField, GrIcon, GrInput } from '@feugene/granularity'

const query = ref('')
const price = ref('1 290')
</script>

<template>
  <div class="grid gap-4 lg:grid-cols-2">
    <!--
      Украшение внутри рамки: у поисковой строки лупа обязана читаться как часть
      поля. Сегмент отрезал бы её рамкой, и строка выглядела бы полем с
      приклеенной кнопкой.
    -->
    <GrFormField label="Поиск">
      <GrInput v-model="query" addon="inline" placeholder="Название или артикул">
        <template #prefix>
          <GrIcon size="sm">
            <span class="i-lucide-search" />
          </GrIcon>
        </template>
      </GrInput>
    </GrFormField>

    <GrFormField label="Цена">
      <GrInput v-model="price" addon="inline" placeholder="0">
        <template #suffix>₽</template>
      </GrInput>
    </GrFormField>

    <!-- Тот же слот в режиме по умолчанию — для сравнения. -->
    <GrFormField label="Цена сегментом" hint="addon=&quot;segment&quot; — режим по умолчанию">
      <GrInput v-model="price" placeholder="0">
        <template #suffix>₽</template>
      </GrInput>
    </GrFormField>
  </div>
</template>
