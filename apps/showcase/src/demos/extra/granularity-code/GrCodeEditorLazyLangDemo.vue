<script setup lang="ts">
import { computed, ref, shallowRef } from 'vue'

import { GrButton } from '@feugene/granularity'

const template = ref(`Здравствуйте, {{ name }}!

Заказ {{ order.id }} отправлен. Трек-номер: {{ order.track }}.
Ожидаемая доставка — {{ order.eta }}.`)

/**
 * Язык подключает **потребитель**: у CodeMirror каждый язык — отдельный
 * npm-пакет, и встроенный набор тащил бы в бандл языки, которых приложению не
 * нужно.
 *
 * Здесь грамматика собирается на месте — подсветка подстановок `{{ … }}` в
 * шаблоне письма. Важен не сам разбор, а граница: динамический `import`
 * принадлежит приложению, и до его разрешения редактор уже работает.
 */
const language = shallowRef<string | (() => Promise<unknown>)>('text')
const loading = ref(false)
const loaded = ref(false)

async function loadLanguage() {
  loading.value = true

  const { StreamLanguage } = await import('@codemirror/language')

  language.value = () => Promise.resolve(StreamLanguage.define({
    token(stream) {
      if (stream.match('{{')) {
        while (!stream.eol() && !stream.match('}}', false))
          stream.next()

        stream.match('}}')

        // Имена токенов у `StreamLanguage` — старые, из CodeMirror 5:
        // таблица переводит их в теги Lezer, а современные имена в ней не
        // значатся и остались бы без цвета. `property` — это `propertyName`,
        // то есть роль `key`: подстановка в шаблоне и есть обращение к полю.
        return 'property'
      }

      stream.next()

      return null
    },
  }))

  loading.value = false
  loaded.value = true
}

const status = computed(() => loaded.value
  ? 'Грамматика приехала — подстановки подсвечены'
  : 'Редактор рисуется сразу, подсветка приезжает следом')
</script>

<template>
  <div class="grid gap-4">
    <div class="flex items-center gap-3">
      <GrButton size="sm" :loading="loading" :disabled="loaded" @click="loadLanguage">
        {{ loaded ? 'Грамматика подключена' : 'Подключить грамматику' }}
      </GrButton>
      <span class="showcase-demo-text text-sm">{{ status }}</span>
    </div>

    <GrCodeEditor v-model="template" :language="language" max-height="14rem" />
  </div>
</template>
