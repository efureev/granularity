<script setup lang="ts">
import { ref } from 'vue'

/**
 * Схема — она же санитайзер.
 *
 * Одно и то же значение в двух схемах: слева «минимум», справа «статья».
 * Вставка одинаковая, результат разный — и это не фильтр поверх, а разбор.
 */
const DIRTY = '<h2>Заголовок</h2><p>Текст с <strong>форматом</strong>.</p>'
  + '<blockquote><p>Цитата</p></blockquote>'
  + '<script>alert(1)<\/script><iframe src="https://example.com"></iframe>'

const minimal = ref(DIRTY)
const article = ref(DIRTY)
</script>

<template>
  <div class="grid gap-4">
    <div class="grid gap-4 lg:grid-cols-2">
      <div class="grid gap-2">
        <span class="showcase-demo-text text-sm font-semibold">minimal</span>
        <GrRichText v-model="minimal" schema="minimal" aria-label="Минимальная схема" />
      </div>

      <div class="grid gap-2">
        <span class="showcase-demo-text text-sm font-semibold">article</span>
        <GrRichText v-model="article" schema="article" aria-label="Схема статьи" />
      </div>
    </div>

    <p class="showcase-demo-text text-sm">
      В оба поля пришло одно и то же значение — с заголовком, цитатой, <code>&lt;script&gt;</code> и
      <code>&lt;iframe&gt;</code>. Слева осталась только строчная разметка, справа — ещё заголовок и
      цитата. Скрипта и фрейма нет нигде: <strong>узлы вне схемы не переживают разбора</strong>.
    </p>

    <p class="showcase-demo-text text-sm">
      Отдельного санитайзера в пакете поэтому нет. Разбор идёт по схеме, а на выход документ
      сериализуется из того же дерева — очистка получается тем же механизмом, ради которого редактор
      и выбран. Обратная сторона: чего нет в схеме, того не будет и в значении.
    </p>
  </div>
</template>
