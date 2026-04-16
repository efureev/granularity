<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'

const props = defineProps<{
  eyebrow: string
  title: string
  groups: {
    id: string
    title: string
    items: {
      id: string
      label: string
      to?: string
      href?: string
    }[]
  }[]
}>()

const route = useRoute()

function isActiveSidebarItem(item: { to?: string }) {
  if (!item.to)
    return false

  if (item.to === '/')
    return route.path === item.to

  return route.path === item.to || route.path.startsWith(`${item.to}/`)
}

function getSidebarItemClass(item: { to?: string }) {
  if (isActiveSidebarItem(item))
    return 'showcase-sidebar-item-active'

  return 'showcase-sidebar-item-inactive'
}

const hasGroups = computed(() => props.groups.length > 0)
</script>

<template>
  <aside class="sticky top-28 hidden h-[calc(100vh-8rem)] lg:block">
    <div class="showcase-panel h-full overflow-hidden rounded-[28px] border">
      <div class="h-full overflow-y-auto p-5">
        <div class="space-y-2">
          <p class="showcase-kicker text-xs font-semibold tracking-[0.18em]">
            {{ eyebrow }}
          </p>
          <h2 class="text-lg font-semibold">
            {{ title }}
          </h2>
        </div>

        <div v-if="hasGroups" class="mt-6 space-y-5">
          <section
            v-for="group in groups"
            :key="group.id"
            class="space-y-2"
          >
            <p class="showcase-kicker px-1 text-xs font-semibold">
              {{ group.title }}
            </p>
            <div class="grid gap-1.5">
              <template v-for="item in group.items" :key="item.id">
                <RouterLink
                  v-if="item.to"
                  :to="item.to"
                  class="rounded-2xl border px-4 py-1.5 text-sm font-500 transition-colors"
                  :class="getSidebarItemClass(item)"
                >
                  {{ item.label }}
                </RouterLink>
                <a
                  v-else-if="item.href"
                  :href="item.href"
                  class="showcase-sidebar-item-inactive rounded-2xl border border-transparent px-4 py-3 text-sm font-semibold transition-colors"
                >
                  {{ item.label }}
                </a>
              </template>
            </div>
          </section>
        </div>
      </div>
    </div>
  </aside>
</template>