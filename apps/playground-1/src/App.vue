<script setup lang="ts">
import {ref} from 'vue'

import {DsButton, DsInput} from '@feugene/granularity'

const title = ref('Granularity')
const clicks = ref(0)
</script>

<template>
  <main class="page">
    <section class="card stack p-4">
      <p class="eyebrow m-0 mb-2">
        playground-1 / способ 1
      </p>
      <h1 class="title m-0">
        Root import + foundation layers + styles.css
      </h1>
      <p class="muted m-0 p-2 surface-note">
        Приложение импортирует компоненты из общего entrypoint `@feugene/granularity` и подключает
        общий utility CSS пакета.
      </p>
    </section>

    <section class="card stack p-4">
      <label class="stack field p-2 surface-field">
        <span class="label">Текст кнопки</span>
        <DsInput v-model="title" placeholder="Например: Granularity"/>
      </label>

      <div class="row p-2 surface-row">
        <DsButton @click="clicks += 1">
          {{ title }}
        </DsButton>
        <span class="muted m-0">Кликов: {{ clicks }}</span>
      </div>
    </section>

    <section class="card stack p-4 bundle-summary">
      <div class="bundle-heading">
        <p class="eyebrow m-0">
          Примерный размер bundle
        </p>
        <h2 class="bundle-title">
          Размеры основных чанков
        </h2>
        <p class="muted m-0">
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
              <p class="bundle-value">raw ~59.6 kB</p>
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
              <p class="bundle-value">raw ~7.0 kB</p>
              <p class="bundle-subvalue">gzip ~2.6 kB</p>
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
              <p class="bundle-value">raw ~3.6 kB</p>
              <p class="bundle-subvalue">gzip ~1.5 kB</p>
            </div>
            <div class="bundle-row">
              <span class="bundle-label">CSS</span>
              <p class="bundle-value">raw ~2.4 kB</p>
              <p class="bundle-subvalue">gzip ~0.8 kB</p>
            </div>
          </div>
        </article>
      </div>
    </section>
  </main>
</template>
