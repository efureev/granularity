<script setup lang="ts">
import { computed } from 'vue'

import { DsBadge, DsCard } from '@feugene/granularity'

import CodeBlock from '../components/doc/CodeBlock.vue'
import ShowcasePageHero from '../components/showcase/ShowcasePageHero.vue'
import { useShowcasePageI18n } from '../app/useShowcasePageI18n'

const { localizePageByName } = useShowcasePageI18n()
const page = computed(() => localizePageByName('integration'))

// Note: `.vue` specifiers are split via interpolation so Vite/rolldown's
// dependency scanner does not treat these documentation snippets as real imports.
const appVueSpecifier = `.${'/App.vue'}`
const vuePluginCode = `import { createApp } from 'vue'
import { DsButton, DsInput } from '@feugene/granularity'
import { createGranularity } from '@feugene/granularity/vue'
import { vHotkey } from '@feugene/granularity/directives'

import App from '${appVueSpecifier}'

createApp(App)
  .use(createGranularity({
    components: [DsButton, DsInput],
    directives: [{ name: 'hotkey', directive: vHotkey }],
    provides: [{ key: Symbol.for('app.theme'), value: { mode: 'light' } }],
    globalProperties: { $appVersion: '0.2.0' },
  }))
  .mount('#app')`

const unpluginCode = `// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import Components from 'unplugin-vue-components/vite'
import { GranularityResolver } from '@feugene/unplugin-granularity'

export default defineConfig({
  plugins: [
    vue(),
    Components({
      resolvers: [GranularityResolver({
        prefix: 'Ds',
        importStyle: true,
        directives: true,
      })],
    }),
  ],
})`

const unpluginTemplateCode = `<template>
  <DsInput v-model="value" v-hotkey.enter="submit" />
  <DsButton @click="submit">Go</DsButton>
</template>`

const sectionCodeSamples: Record<string, Array<{ code: string, language: string, title?: string }>> = {
  'vue-plugin': [
    {
      code: vuePluginCode,
      language: 'ts',
      title: 'main.ts',
    },
  ],
  'unplugin': [
    {
      code: unpluginCode,
      language: 'ts',
      title: 'vite.config.ts',
    },
    {
      code: unpluginTemplateCode,
      language: 'vue',
      title: 'App.vue',
    },
  ],
}
</script>

<template>
  <div class="space-y-8">
    <ShowcasePageHero
      :eyebrow="page.eyebrow"
      :title="page.title"
      :description="page.description"
    >
      <template #actions>
        <DsBadge>@feugene/granularity/vue</DsBadge>
        <DsBadge>@feugene/unplugin-granularity</DsBadge>
      </template>
    </ShowcasePageHero>

    <section
      v-for="section in page.sections"
      :id="section.id"
      :key="section.id"
      class="space-y-5 scroll-mt-28"
    >
      <DsCard class="showcase-panel rounded-3xl border p-6 lg:p-7">
        <div class="space-y-5">
          <div class="space-y-2">
            <h2 class="text-2xl font-semibold">
              {{ section.title }}
            </h2>
            <p class="showcase-text-muted text-base leading-7">
              {{ section.description }}
            </p>
          </div>

          <ul class="list-disc space-y-2 pl-5 text-base leading-7">
            <li v-for="(bullet, index) in section.bullets" :key="index">
              {{ bullet }}
            </li>
          </ul>

          <div
            v-if="sectionCodeSamples[section.id]"
            class="space-y-4"
          >
            <CodeBlock
              v-for="sample in sectionCodeSamples[section.id]"
              :key="sample.title ?? sample.language"
              :code="sample.code"
              :language="sample.language"
              :title="sample.title"
            />
          </div>
        </div>
      </DsCard>
    </section>
  </div>
</template>
