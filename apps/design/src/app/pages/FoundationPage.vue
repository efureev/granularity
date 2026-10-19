<script setup lang="ts">
import { computed, defineAsyncComponent } from 'vue'
import { useRoute } from 'vue-router'

import { findFoundation } from '../foundations'
import PageHeader from '../parts/PageHeader.vue'
import NotFoundPage from './NotFoundPage.vue'

const route = useRoute()

const foundation = computed(() => findFoundation(String(route.params.foundation)))
const body = computed(() => (foundation.value ? defineAsyncComponent(foundation.value.load) : undefined))
</script>

<template>
  <NotFoundPage v-if="!foundation" />

  <div v-else class="mx-auto flex max-w-[1360px] flex-col gap-10 px-4 py-10 lg:px-10">
    <PageHeader eyebrow="Основы" :title="foundation.title" :lead="foundation.summary" />
    <component :is="body" :key="foundation.id" />
  </div>
</template>
