<script setup lang="ts">
import {ref} from 'vue'

import {DsButton} from '@feugene/granularity/components/DsButton'

const ready = ref(false)
</script>

<template>
  <main class="mx-auto flex min-h-screen max-w-3xl flex-col gap-6 px-6 py-10 text-slate-900">
    <section class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <p class="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-indigo-500">
        playground-5 / способ 5
      </p>
      <h1 class="text-3xl font-semibold leading-tight">
        `UnoCSS` + `presetGranularityNode`
      </h1>
      <p class="mt-3 text-sm leading-6 text-slate-600">
        Стили кнопки и foundation CSS добавляются автоматически через node-only preset пакета.
      </p>
    </section>

    <section class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div class="flex flex-wrap items-center gap-3">
        <DsButton variant="secondary" tone="success" @click="ready = !ready">
          {{ ready ? 'Готово' : 'Проверить preset' }}
        </DsButton>
        <span class="text-sm text-slate-500">
          Состояние: {{ ready ? 'uno-node подключён' : 'ожидает клика' }}
        </span>
      </div>
    </section>

    <section class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div class="flex flex-col gap-2">
        <p class="text-xs font-semibold uppercase tracking-[0.16em] text-indigo-500">
          Примерный размер bundle
        </p>
        <h2 class="text-xl font-semibold text-slate-950">
          Размеры основных чанков
        </h2>
        <p class="text-sm leading-6 text-slate-600">
          Ориентир после production build: JS и CSS разложены по отдельным группам `vue`, `granularity`,
          `reset` и `app`.
        </p>
      </div>

      <div class="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <article class="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4" data-bundle-group="vue">
          <p class="text-xs font-semibold uppercase tracking-[0.12em] text-indigo-500">
            vue
          </p>
          <div class="mt-3 flex flex-col gap-3">
            <div class="flex flex-col gap-1">
              <span class="text-[11px] uppercase tracking-[0.12em] text-slate-400">JS</span>
              <p class="text-sm font-semibold text-slate-900">raw ~59.5 kB</p>
              <p class="text-xs text-slate-500">gzip ~23.6 kB</p>
            </div>
            <div class="flex flex-col gap-1">
              <span class="text-[11px] uppercase tracking-[0.12em] text-slate-400">CSS</span>
              <p class="text-sm font-semibold text-slate-900">raw ~0 kB</p>
              <p class="text-xs text-slate-500">gzip ~0 kB</p>
            </div>
          </div>
        </article>

        <article class="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4" data-bundle-group="granularity">
          <p class="text-xs font-semibold uppercase tracking-[0.12em] text-indigo-500">
            granularity
          </p>
          <div class="mt-3 flex flex-col gap-3">
            <div class="flex flex-col gap-1">
              <span class="text-[11px] uppercase tracking-[0.12em] text-slate-400">JS</span>
              <p class="text-sm font-semibold text-slate-900">raw ~3.0 kB</p>
              <p class="text-xs text-slate-500">gzip ~1.3 kB</p>
            </div>
            <div class="flex flex-col gap-1">
              <span class="text-[11px] uppercase tracking-[0.12em] text-slate-400">CSS</span>
              <p class="text-sm font-semibold text-slate-900">raw ~5.1 kB</p>
              <p class="text-xs text-slate-500">gzip ~1.6 kB</p>
            </div>
          </div>
        </article>

        <article class="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4" data-bundle-group="reset">
          <p class="text-xs font-semibold uppercase tracking-[0.12em] text-indigo-500">
            reset
          </p>
          <div class="mt-3 flex flex-col gap-3">
            <div class="flex flex-col gap-1">
              <span class="text-[11px] uppercase tracking-[0.12em] text-slate-400">JS</span>
              <p class="text-sm font-semibold text-slate-900">raw ~0 kB</p>
              <p class="text-xs text-slate-500">gzip ~0 kB</p>
            </div>
            <div class="flex flex-col gap-1">
              <span class="text-[11px] uppercase tracking-[0.12em] text-slate-400">CSS</span>
              <p class="text-sm font-semibold text-slate-900">raw ~2.3 kB</p>
              <p class="text-xs text-slate-500">gzip ~1.0 kB</p>
            </div>
          </div>
        </article>

        <article class="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4" data-bundle-group="app">
          <p class="text-xs font-semibold uppercase tracking-[0.12em] text-indigo-500">
            app
          </p>
          <div class="mt-3 flex flex-col gap-3">
            <div class="flex flex-col gap-1">
              <span class="text-[11px] uppercase tracking-[0.12em] text-slate-400">JS</span>
              <p class="text-sm font-semibold text-slate-900">raw ~6.9 kB</p>
              <p class="text-xs text-slate-500">gzip ~2.3 kB</p>
            </div>
            <div class="flex flex-col gap-1">
              <span class="text-[11px] uppercase tracking-[0.12em] text-slate-400">CSS</span>
              <p class="text-sm font-semibold text-slate-900">raw ~5.5 kB</p>
              <p class="text-xs text-slate-500">gzip ~1.6 kB</p>
            </div>
          </div>
        </article>
      </div>
    </section>
  </main>
</template>
