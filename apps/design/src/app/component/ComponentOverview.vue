<script setup lang="ts">
import { computed } from 'vue'

import { componentDoc } from '../docs'
import DocSection from '../parts/DocSection.vue'
import MarkdownBlock from '../parts/MarkdownBlock.vue'
import { specimenOf } from '../specimens'
import { useCatalogComponent } from './views'

const component = useCatalogComponent()
const doc = computed(() => componentDoc(component.value.exports[0]!))
const specimen = computed(() => specimenOf(component.value.exports[0]!))
</script>

<template>
  <div class="flex flex-col gap-12">
    <div v-if="doc" class="grid gap-8 xl:grid-cols-2">
      <DocSection v-if="doc.sections.get('Когда брать')" title="Когда брать">
        <MarkdownBlock :source="doc.sections.get('Когда брать')!" />
      </DocSection>
      <DocSection v-if="doc.sections.get('Когда взять другое')" title="Когда взять другое">
        <MarkdownBlock :source="doc.sections.get('Когда взять другое')!" />
      </DocSection>
    </div>

    <DocSection title="Состояния и поведение" lead="Настоящий компонент в теме адреса: наведите, нажмите, откройте. Сменить тему — карточкой выше или переключателем в шапке.">
      <!-- Слои образцов (липкие шапки, стрелки карусели) — внутри сцены, под вкладками страницы. -->
      <div class="isolate">
        <component :is="specimen" v-if="specimen" />
      </div>
    </DocSection>
  </div>
</template>
