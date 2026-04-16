<script setup lang="ts">
import { ref } from 'vue'

import { DsButton } from '@feugene/granularity/components/DsButton'

const clicks = ref(0)
</script>

<template>
  <main class="page">
    <section class="card stack">
      <p class="eyebrow">
        playground-2 / способ 2
      </p>
      <h1 class="title">
        Минимальный JS через component subpath import
      </h1>
      <p class="muted">
        В этом примере компонент импортируется только из `@feugene/granularity/components/DsButton`,
        чтобы в JS не попадал граф остальных компонентов.
      </p>
      <div class="row">
        <DsButton @click="clicks += 1">
          Subpath only
        </DsButton>
        <span class="muted">Кликов: {{ clicks }}</span>
      </div>
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
              <p class="bundle-value">raw ~59.5 kB</p>
              <p class="bundle-subvalue">gzip ~23.6 kB</p>
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
              <p class="bundle-value">raw ~17.3 kB</p>
              <p class="bundle-subvalue">gzip ~3.9 kB</p>
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
              <p class="bundle-value">raw ~3.3 kB</p>
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
