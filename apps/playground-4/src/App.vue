<script setup lang="ts">
import { computed, ref } from 'vue'

import { DsButton } from '@feugene/granularity/components/DsButton'
import { DsInput } from '@feugene/granularity/components/DsInput'

const draft = ref('Демо через общий CSS пакета')
const preview = computed(() => draft.value.trim() || 'Пустое значение')
</script>

<template>
  <main class="page">
    <section class="card stack">
      <p class="eyebrow">
        playground-4 / способ 4
      </p>
      <h1 class="title">
        Granular JS + общий `styles.css`
      </h1>
      <p class="muted">
        JS остаётся granular за счёт subpath import-ов, но CSS подключается одним общим entrypoint-ом,
        чтобы было проще постепенно добавлять новые компоненты.
      </p>
    </section>

    <section class="card stack">
      <label class="stack field">
        <span class="label">Текст кнопки</span>
        <DsInput v-model="draft" placeholder="Введите подпись" />
      </label>

      <div class="row">
        <DsButton>{{ preview }}</DsButton>
        <DsButton variant="outline">Вторичная</DsButton>
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
              <p class="bundle-value">raw ~3.7 kB</p>
              <p class="bundle-subvalue">gzip ~1.6 kB</p>
            </div>
            <div class="bundle-row">
              <span class="bundle-label">CSS</span>
              <p class="bundle-value">raw ~1.8 kB</p>
              <p class="bundle-subvalue">gzip ~0.7 kB</p>
            </div>
          </div>
        </article>
      </div>
    </section>
  </main>
</template>
