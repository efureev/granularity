<script setup lang="ts">
import { ref } from 'vue'

import { GrNavbar } from '@feugene/granularity'

const isMenuOpen = ref(false)
const navItems = ['Overview', 'Deployments', 'Billing', 'Settings']
</script>

<template>
  <!--
    Граница применения: кнопка-гамбургер (`show-menu-button`) нужна ТОЛЬКО в
    компактном/мобильном режиме, когда постоянный `GrSidebar` скрыт. Событие `menu`
    открывает off-canvas панель навигации. На десктопе кнопку прячут (`sm:hidden`),
    а разделы живут в боковой панели.
  -->
  <div class="relative overflow-hidden rounded-2xl border border-[var(--gr-brd)] bg-[var(--gr-bg)] shadow-[var(--gr-shadow-1)]">
    <GrNavbar
      title="Mobile shell"
      show-menu-button
      @menu="isMenuOpen = !isMenuOpen"
    />

    <div class="relative min-h-[160px]">
      <!-- Off-canvas панель навигации, которую открывает кнопка меню -->
      <transition
        enter-active-class="transition-transform duration-200 ease-out"
        enter-from-class="-translate-x-full"
        leave-active-class="transition-transform duration-150 ease-in"
        leave-to-class="-translate-x-full"
      >
        <nav
          v-if="isMenuOpen"
          class="absolute inset-y-0 left-0 z-10 w-52 border-r border-[var(--gr-brd)] bg-[var(--gr-card)] p-3"
        >
          <button
            v-for="item in navItems"
            :key="item"
            type="button"
            class="block w-full rounded-lg px-3 py-2 text-left text-sm text-[var(--gr-fg)] transition-colors hover:bg-[var(--gr-muted)]"
            @click="isMenuOpen = false"
          >
            {{ item }}
          </button>
        </nav>
      </transition>

      <div class="p-5 text-sm text-[var(--gr-muted-fg)]">
        {{ isMenuOpen ? 'Navigation drawer is open — pick a section.' : 'Tap the hamburger to open the navigation drawer.' }}
      </div>
    </div>
  </div>
</template>
