<script setup lang="ts">
import { ref } from 'vue'

import { DsButton } from '@feugene/granularity/components/DsButton'

const status = ref('pure/browser-safe preset')
</script>

<template>
  <main class="mx-auto flex min-h-screen max-w-3xl flex-col gap-6 px-6 py-10 text-[var(--fg)]">
    <section class="rounded-3xl border border-[var(--brd)] bg-white/80 p-6 shadow-sm backdrop-blur">
      <p class="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-pink-600">
        playground-6 / способ 6
      </p>
      <h1 class="text-3xl font-semibold leading-tight">
        Pure preset через `@feugene/granularity/uno`
      </h1>
      <p class="mt-3 text-sm leading-6 text-slate-700">
        В этом варианте preset остаётся browser-safe и получает нужные CSS preflight-строки вручную,
        без чтения файлов с диска.
      </p>
    </section>

    <section class="rounded-3xl border border-[var(--brd)] bg-white/80 p-6 shadow-sm backdrop-blur">
      <div class="flex flex-wrap items-center gap-3">
        <DsButton @click="status = 'preflights применены вручную'">
          Pink preset
        </DsButton>
        <span class="text-sm text-slate-600">
          {{ status }}
        </span>
      </div>
    </section>

    <section class="rounded-3xl border border-[var(--brd)] bg-white/80 p-6 shadow-sm backdrop-blur">
      <div class="flex flex-col gap-2">
        <p class="text-xs font-semibold uppercase tracking-[0.16em] text-pink-600">
          Примерный размер bundle
        </p>
        <h2 class="text-xl font-semibold text-[var(--fg)]">
          Размеры основных чанков
        </h2>
        <p class="text-sm leading-6 text-slate-700">
          Ориентир после production build: JS и CSS разложены по отдельным группам `vue`, `granularity`,
          `reset` и `app`.
        </p>
      </div>

      <div class="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <article class="rounded-2xl border border-[var(--brd)] bg-white/70 p-4" data-bundle-group="vue">
          <p class="text-xs font-semibold uppercase tracking-[0.12em] text-pink-600">
            vue
          </p>
          <div class="mt-3 flex flex-col gap-3">
            <div class="flex flex-col gap-1">
              <span class="text-[11px] uppercase tracking-[0.12em] text-slate-400">JS</span>
              <p class="text-sm font-semibold text-[var(--fg)]">raw ~59.5 kB</p>
              <p class="text-xs text-slate-500">gzip ~23.6 kB</p>
            </div>
            <div class="flex flex-col gap-1">
              <span class="text-[11px] uppercase tracking-[0.12em] text-slate-400">CSS</span>
              <p class="text-sm font-semibold text-[var(--fg)]">raw ~0 kB</p>
              <p class="text-xs text-slate-500">gzip ~0 kB</p>
            </div>
          </div>
        </article>

        <article class="rounded-2xl border border-[var(--brd)] bg-white/70 p-4" data-bundle-group="granularity">
          <p class="text-xs font-semibold uppercase tracking-[0.12em] text-pink-600">
            granularity
          </p>
          <div class="mt-3 flex flex-col gap-3">
            <div class="flex flex-col gap-1">
              <span class="text-[11px] uppercase tracking-[0.12em] text-slate-400">JS</span>
              <p class="text-sm font-semibold text-[var(--fg)]">raw ~3.0 kB</p>
              <p class="text-xs text-slate-500">gzip ~1.3 kB</p>
            </div>
            <div class="flex flex-col gap-1">
              <span class="text-[11px] uppercase tracking-[0.12em] text-slate-400">CSS</span>
              <p class="text-sm font-semibold text-[var(--fg)]">raw ~0.7 kB</p>
              <p class="text-xs text-slate-500">gzip ~0.4 kB</p>
            </div>
          </div>
        </article>

        <article class="rounded-2xl border border-[var(--brd)] bg-white/70 p-4" data-bundle-group="reset">
          <p class="text-xs font-semibold uppercase tracking-[0.12em] text-pink-600">
            reset
          </p>
          <div class="mt-3 flex flex-col gap-3">
            <div class="flex flex-col gap-1">
              <span class="text-[11px] uppercase tracking-[0.12em] text-slate-400">JS</span>
              <p class="text-sm font-semibold text-[var(--fg)]">raw ~0 kB</p>
              <p class="text-xs text-slate-500">gzip ~0 kB</p>
            </div>
            <div class="flex flex-col gap-1">
              <span class="text-[11px] uppercase tracking-[0.12em] text-slate-400">CSS</span>
              <p class="text-sm font-semibold text-[var(--fg)]">raw ~2.3 kB</p>
              <p class="text-xs text-slate-500">gzip ~1.0 kB</p>
            </div>
          </div>
        </article>

        <article class="rounded-2xl border border-[var(--brd)] bg-white/70 p-4" data-bundle-group="app">
          <p class="text-xs font-semibold uppercase tracking-[0.12em] text-pink-600">
            app
          </p>
          <div class="mt-3 flex flex-col gap-3">
            <div class="flex flex-col gap-1">
              <span class="text-[11px] uppercase tracking-[0.12em] text-slate-400">JS</span>
              <p class="text-sm font-semibold text-[var(--fg)]">raw ~7.1 kB</p>
              <p class="text-xs text-slate-500">gzip ~2.3 kB</p>
            </div>
            <div class="flex flex-col gap-1">
              <span class="text-[11px] uppercase tracking-[0.12em] text-slate-400">CSS</span>
              <p class="text-sm font-semibold text-[var(--fg)]">raw ~5.3 kB</p>
              <p class="text-xs text-slate-500">gzip ~1.5 kB</p>
            </div>
          </div>
        </article>
      </div>
    </section>
  </main>
</template>
