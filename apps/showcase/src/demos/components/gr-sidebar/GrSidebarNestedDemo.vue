<script setup lang="ts">
import { ref } from 'vue'

import { GrSidebar, GrSidebarGroup, GrSidebarItem } from '@feugene/granularity'

const collapsed = ref(false)
const current = ref('billing.invoices')

function go(key: string) {
  current.value = key
}
</script>

<template>
  <div class="flex min-h-[22rem] gap-4">
    <GrSidebar
      v-model:collapsed="collapsed"
      landmark="navigation"
      aria-label="Разделы настроек"
      show-toggle-button
      title="Настройки"
    >
      <GrSidebarGroup label="Организация">
        <GrSidebarItem label="Обзор" icon="i-lucide-home" :active="current === 'overview'" @click="go('overview')" />

        <GrSidebarItem label="Оплата" icon="i-lucide-credit-card" default-expanded>
          <GrSidebarItem label="Счета" :active="current === 'billing.invoices'" @click="go('billing.invoices')" />
          <GrSidebarItem label="Тариф" :active="current === 'billing.plan'" @click="go('billing.plan')" />

          <GrSidebarItem label="Способы оплаты">
            <GrSidebarItem label="Карты" :active="current === 'billing.cards'" @click="go('billing.cards')" />
            <GrSidebarItem label="Счёт" :active="current === 'billing.bank'" @click="go('billing.bank')" />
          </GrSidebarItem>
        </GrSidebarItem>

        <GrSidebarItem label="Команда" icon="i-lucide-users" badge="12">
          <GrSidebarItem label="Участники" :active="current === 'team.members'" @click="go('team.members')" />
          <GrSidebarItem label="Приглашения" :active="current === 'team.invites'" @click="go('team.invites')" />
        </GrSidebarItem>
      </GrSidebarGroup>
    </GrSidebar>

    <div class="flex-1 text-sm text-[var(--gr-muted-fg)]">
      Открыт раздел <code>{{ current }}</code>. Ветка раскрывается нажатием, глубина
      считается разметкой. Сверните панель — подпункты уйдут: в рейл они не влезают,
      а нажатие на ветку сперва вернёт панели ширину.
    </div>
  </div>
</template>
