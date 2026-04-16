<script setup lang="ts">
import { ref } from 'vue'

import { DsButton } from '@feugene/granularity/components/DsButton'

const variants = ['primary', 'secondary', 'outline'] as const
const selected = ref('primary')
</script>

<template>
  <main class="page">
    <section class="card stack">
      <p class="eyebrow">
        playground-3 / способ 3
      </p>
      <h1 class="title">
        Точечное подключение CSS только для `DsButton`
      </h1>
      <p class="muted">
        Пример импортирует только subpath JS и `components/DsButton/styles.css`, чтобы минимизировать и JS,
        и CSS bundle для одного компонента.
      </p>

      <div class="row">
        <DsButton
          v-for="variant in variants"
          :key="variant"
          :variant="variant"
          @click="selected = variant"
        >
          {{ variant }}
        </DsButton>
      </div>

      <p class="muted">
        Активный вариант: {{ selected }}
      </p>
    </section>

    <section class="card stack bundle-summary">
      <div class="bundle-heading">
        <p class="eyebrow">
          Примерный размер bundle
        </p>
        <h2 class="bundle-title">
          Размеры основных чанков
        </h2>
        <p class="muted">
          Ориентир после production build: для групп `vue`, `granularity`, `reset` и `app`
          показаны `raw` и `gzip` размеры JS и CSS. `reset` здесь физически входит в общий
          app CSS, но посчитан отдельно для наглядности.
        </p>
      </div>

      <div class="bundle-grid">
        <article class="bundle-item" data-bundle-group="vue">
          <p class="bundle-name">
            vue
          </p>
          <div class="bundle-list">
            <div class="bundle-row">
              <span class="bundle-label">JS</span>
              <p class="bundle-value">raw ~60.0 kB</p>
              <p class="bundle-subvalue">gzip ~23.8 kB</p>
            </div>
            <div class="bundle-row">
              <span class="bundle-label">CSS</span>
              <p class="bundle-value">raw ~0 kB</p>
              <p class="bundle-subvalue">gzip ~0 kB</p>
            </div>
          </div>
        </article>

        <article class="bundle-item" data-bundle-group="granularity">
          <p class="bundle-name">
            granularity
          </p>
          <div class="bundle-list">
            <div class="bundle-row">
              <span class="bundle-label">JS</span>
              <p class="bundle-value">raw ~3.0 kB</p>
              <p class="bundle-subvalue">gzip ~1.3 kB</p>
            </div>
            <div class="bundle-row">
              <span class="bundle-label">CSS</span>
              <p class="bundle-value">raw ~8.7 kB</p>
              <p class="bundle-subvalue">gzip ~2.5 kB</p>
            </div>
          </div>
        </article>

        <article class="bundle-item" data-bundle-group="reset">
          <p class="bundle-name">
            reset
          </p>
          <div class="bundle-list">
            <div class="bundle-row">
              <span class="bundle-label">JS</span>
              <p class="bundle-value">raw ~0 kB</p>
              <p class="bundle-subvalue">gzip ~0 kB</p>
            </div>
            <div class="bundle-row">
              <span class="bundle-label">CSS</span>
              <p class="bundle-value">raw ~2.3 kB</p>
              <p class="bundle-subvalue">gzip ~1.0 kB</p>
            </div>
          </div>
        </article>

        <article class="bundle-item" data-bundle-group="app">
          <p class="bundle-name">
            app
          </p>
          <div class="bundle-list">
            <div class="bundle-row">
              <span class="bundle-label">JS</span>
              <p class="bundle-value">raw ~3.4 kB</p>
              <p class="bundle-subvalue">gzip ~1.4 kB</p>
            </div>
            <div class="bundle-row">
              <span class="bundle-label">CSS</span>
              <p class="bundle-value">raw ~1.7 kB</p>
              <p class="bundle-subvalue">gzip ~0.6 kB</p>
            </div>
          </div>
        </article>
      </div>
    </section>
  </main>
</template>
