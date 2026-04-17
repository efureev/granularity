<script setup lang="ts">
import { ref } from 'vue'

const draft = ref('')
const items = ref<string[]>([])

function add() {
  const v = draft.value.trim()
  if (!v) return
  items.value.push(v)
  draft.value = ''
}

// Регистрация компонентов и директивы сделана глобально через createGranularity
// в main.ts — поэтому в шаблоне используем просто <DsInput/>, <DsButton/> и v-hotkey.
</script>

<template>
  <main class="page">
    <section class="card">
      <p class="eyebrow">playground-7 / способ «фабрика»</p>
      <h1 class="title">createGranularity + sub-path imports</h1>
      <p class="muted">
        Глобально зарегистрированы только <code>DsButton</code>, <code>DsInput</code> и
        директива <code>v-hotkey</code>. Всё остальное из пакета
        <code>@feugene/granularity</code> в итоговый бандл не попадает.
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
