<script setup lang="ts">
import { ref } from 'vue'

import { GrFormField } from '@feugene/granularity'
import { GrRichText } from '@feugene/granularity-editor'

/**
 * Companion-пакет `@feugene/granularity-editor` на сервере.
 *
 * Страница проверяет ровно одно, зато то, ради чего компонент устроен именно
 * так: **ProseMirror требует DOM**, поэтому редактор поднимается в `onMounted`,
 * а на сервере области ввода не существует вовсе. Инициализируй его в `setup` —
 * и серверный рендер упал бы на первом же обращении к `document`.
 *
 * Отсюда и `data-allow-mismatch` внутри компонента: содержимое появляется
 * только на клиенте, и это расхождение ожидаемое. Гейт обязан оставаться
 * зелёным — если он покраснеет, значит редактор снова полез в DOM раньше
 * времени.
 */
const description = ref('<p>Текст, сохранённый ранее.</p>')
const empty = ref('')
</script>

<template>
  <section>
    <h2>GrRichText</h2>

    <GrFormField label="Описание" hint="Значение приходит с сервера, редактор поднимается на клиенте">
      <GrRichText v-model="description" schema="article" />
    </GrFormField>

    <GrFormField label="Пустое поле">
      <GrRichText v-model="empty" placeholder="Начните печатать" toolbar="both" />
    </GrFormField>
  </section>
</template>
