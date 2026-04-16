<script setup lang="ts">
import InlineRichText from '../content/InlineRichText.vue'

import type { ShowcaseApiItemMeta } from '../../content/model'

defineProps<{
  title: string
  items: ShowcaseApiItemMeta[]
  emptyLabel: string
}>()
</script>

<template>
  <div class="showcase-panel overflow-hidden rounded-3xl border">
    <div class="showcase-border-strong border-b px-5 py-4">
      <h3 class="text-lg font-semibold">
        {{ title }}
      </h3>
    </div>

    <div v-if="items.length === 0" class="showcase-text-subtle px-5 py-6 text-sm leading-6">
      {{ emptyLabel }}
    </div>

    <div v-else class="overflow-x-auto">
      <table class="min-w-full border-collapse text-left text-sm">
        <thead class="showcase-table-head">
          <tr>
            <th class="px-5 py-3 font-semibold">Name</th>
            <th class="px-5 py-3 font-semibold">Type</th>
            <th class="px-5 py-3 font-semibold">Details</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="item in items"
            :key="item.name"
            class="showcase-border-strong border-t align-top"
          >
            <td class="px-5 py-4 font-semibold">
              {{ item.name }}
            </td>
            <td class="showcase-text-muted px-5 py-4">
              {{ item.type || item.signature || '—' }}
            </td>
            <td class="showcase-text-muted px-5 py-4">
              <div class="space-y-1">
                <p v-if="item.description">
                  <InlineRichText :text="item.description" />
                </p>
                <p v-if="typeof item.required === 'boolean'" class="showcase-kicker text-xs">
                  {{ item.required ? 'required' : 'optional' }}
                </p>
                <p v-if="item.default" class="showcase-text-subtle text-xs">
                  <InlineRichText :text="`default: ${item.default}`" />
                </p>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>