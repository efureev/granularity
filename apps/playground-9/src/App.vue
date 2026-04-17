<script setup lang="ts">
import {ref} from 'vue'

// Единственный «клиентский» компонент этого playground'а — композитный
// `XgQuickForm` из нового пакета `@feugene/extra-granularity`. Внутри себя он
// использует ровно три примитива granularity: `DsFormField`, `DsInput`,
// `DsButton`. Больше в бандле ничего из рантайм-пакета быть не должно — это
// и будет служить доказательством tree-shaking.
import {XgQuickForm} from '@feugene/extra-granularity/components/XgQuickForm'
import {DsButton, DsCard} from "@feugene/granularity";

const items = ref<string[]>([])
const error = ref<string | undefined>(undefined)

function onSubmit(value: string) {
  if (!value) {
    error.value = 'Поле не может быть пустым'
    return
  }
  error.value = undefined
  items.value.unshift(value)
}
</script>

<template>
  <main class="mx-auto flex min-h-screen max-w-3xl flex-col gap-6 px-6 py-10 text-slate-900">
    <section class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <p class="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-indigo-500">
        playground-9 / composite via `@feugene/extra-granularity`
      </p>
      <h1 class="text-3xl font-semibold leading-tight">
        `XgQuickForm` = `DsFormField` + `DsInput` + `DsButton`
      </h1>
      <p class="mt-3 text-sm leading-6 text-slate-600">
        Композитный компонент из отдельного пакета <code>@feugene/extra-granularity</code>
        собран из трёх примитивов granularity. В чанке <code>granularity</code>
        сборки должны встретиться ровно эти три имени и ничего больше.
      </p>
    </section>

    <section class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <XgQuickForm
          label="Добавить задачу"
          placeholder="Введите текст и нажмите Enter…"
          submit-label="Добавить"
          :error="error"
          @submit="onSubmit"
      />
    </section>

    <section v-if="items.length" class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 class="mb-3 text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">
        Добавлено ({{ items.length }})
      </h2>
      <ul class="flex flex-col gap-2 text-sm text-slate-700">
        <li v-for="(item, index) in items" :key="index" class="rounded-lg bg-slate-50 px-3 py-2">
          {{ item }}
        </li>
      </ul>
    </section>
    <DsCard class="p-4">
      <DsButton>test</DsButton>
    </DsCard>
  </main>
</template>
