<script setup lang="ts">
/**
 * Оболочка страницы компонента: заголовок и ровно один компонент под ним.
 *
 * Своей логики у неё нет намеренно. Всё, что она добавит в DOM, попадёт в
 * снимок и в гидрацию каждой из ста страниц — то есть станет общим фоном, на
 * котором ищут расхождение. Поэтому здесь только статическая разметка.
 */
defineProps<{ name: string, about: string }>()
</script>

<template>
  <main class="playground-component-page">
    <header>
      <h1 data-testid="component-page-name">
        {{ name }}
      </h1>
      <p>{{ about }}</p>
    </header>

    <div data-testid="component-page-body">
      <slot />
    </div>
  </main>
</template>
