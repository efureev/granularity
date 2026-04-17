<script setup lang="ts">
import { ref } from 'vue'

// ВАЖНО: здесь нет ни одного `import { DsButton } from ...`.
// Теги <DsButton /> и <DsInput /> ниже автоматически резолвятся
// `unplugin-vue-components` в sub-path импорты пакета granularity,
// а вместе с ними подтягиваются только их CSS-файлы.

const draft = ref('')
const items = ref<string[]>([])

function add() {
  const v = draft.value.trim()
  if (!v) return
  items.value.push(v)
  draft.value = ''
}
</script>

<template>
  <main class="page">
    <section class="card">
      <p class="eyebrow">playground-8 / способ «авто-импорт»</p>
      <h1 class="title">unplugin-vue-components + granularity</h1>
      <p class="muted">
        Компоненты <code>DsButton</code> и <code>DsInput</code> нигде вручную
        не импортируются — их подставляет резолвер на этапе сборки, ровно
        по факту использования в шаблоне.
      </p>
    </section>

    <section class="card">
      <label class="field">
        <span class="label">Что добавить в список (Enter — добавить)</span>
        <DsInput
          v-model="draft"
          placeholder="Например: молоко"
          v-hotkey="{ Enter: { handler: add, allowInEditable: true } }"
        />
      </label>

      <div class="row">
        <DsButton @click="add">Добавить</DsButton>
        <span class="muted">Всего: {{ items.length }}</span>
      </div>

      <ul v-if="items.length" class="items">
        <li v-for="(it, i) in items" :key="i">{{ it }}</li>
      </ul>
    </section>
  </main>
</template>
