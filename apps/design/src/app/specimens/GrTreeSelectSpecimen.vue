<script setup lang="ts">
import { ref } from 'vue'

import type { GrInputSize, GrTreeSelectModelValue } from '@feugene/granularity'

import Specimen from './Specimen.vue'

defineProps<{ preview?: boolean }>()

interface TreeNode {
  id: string
  label: string
  children?: TreeNode[]
}

const folders: TreeNode[] = [
  {
    id: 'projects',
    label: 'Проекты',
    children: [
      {
        id: 'launch',
        label: 'Запуск весной',
        children: [
          { id: 'launch-mockups', label: 'Макеты' },
          { id: 'launch-copy', label: 'Тексты' },
        ],
      },
      { id: 'redesign', label: 'Редизайн сайта' },
    ],
  },
  {
    id: 'finance',
    label: 'Финансы',
    children: [
      { id: 'reports', label: 'Отчёты' },
      { id: 'invoices', label: 'Счета' },
    ],
  },
  { id: 'archive', label: 'Архив' },
]
const folder = ref<GrTreeSelectModelValue>('launch-mockups')

const teams: TreeNode[] = [
  {
    id: 'product',
    label: 'Продукт',
    children: [
      { id: 'design', label: 'Дизайн' },
      { id: 'dev', label: 'Разработка' },
      { id: 'qa', label: 'Тестирование' },
    ],
  },
  {
    id: 'sales',
    label: 'Продажи',
    children: [
      { id: 'sales-msk', label: 'Москва' },
      { id: 'sales-regions', label: 'Регионы' },
    ],
  },
  { id: 'support', label: 'Поддержка' },
]
const access = ref<GrTreeSelectModelValue>(['design', 'support'])
const notify = ref<GrTreeSelectModelValue>(['product'])

const regions: TreeNode[] = [
  {
    id: 'center',
    label: 'Центр',
    children: [
      { id: 'msk', label: 'Москва' },
      { id: 'tula', label: 'Тула' },
    ],
  },
  {
    id: 'north-west',
    label: 'Северо-Запад',
    children: [
      { id: 'spb', label: 'Санкт-Петербург' },
      { id: 'kgd', label: 'Калининград' },
    ],
  },
  {
    id: 'siberia',
    label: 'Сибирь',
    children: [
      { id: 'nsk', label: 'Новосибирск' },
      { id: 'krs', label: 'Красноярск' },
    ],
  },
]
const deliveryRegions = ref<GrTreeSelectModelValue>(['msk', 'spb', 'nsk'])

const category = ref<GrTreeSelectModelValue>('reports')
const reviewFolder = ref<GrTreeSelectModelValue>('redesign')
const targetFolder = ref<GrTreeSelectModelValue>('')

const lockedFolder = ref<GrTreeSelectModelValue>('invoices')
const pending = ref<GrTreeSelectModelValue>('')
const notLoaded: TreeNode[] = []

const SIZES: readonly GrInputSize[] = ['xs', 'sm', 'md', 'lg']
const sizeFolder = ref<GrTreeSelectModelValue>('launch-copy')
</script>

<template>
  <!-- Карточка каталога и «Темы рядом»: одно состояние, ничего не открыто. -->
  <div v-if="preview" class="flex w-full flex-col gap-3">
    <GrFormField label="Папка">
      <GrTreeSelect
        v-model="folder"
        :data="folders"
        :default-expanded-keys="['projects', 'launch']"
        value-display="path"
        placeholder="Выберите папку"
      />
    </GrFormField>
  </div>
  <div v-else class="grid gap-x-8 gap-y-10 lg:grid-cols-2">
    <Specimen title="Путь до узла" note="Выбранное видно вместе с ветками; поиск сужает дерево, стрелки из поля уводят в него.">
      <GrFormField label="Папка">
        <GrTreeSelect
          v-model="folder"
          :data="folders"
          :default-expanded-keys="['projects', 'launch']"
          value-display="path"
          filterable
          clearable
          filter-placeholder="Найти папку"
          placeholder="Выберите папку"
        />
      </GrFormField>
    </Specimen>

    <Specimen title="Отметки по дереву" note="Родитель отмечает всё поддерево, частичный выбор — «mixed»; хвост тегов сворачивается в «+N».">
      <GrFormField label="Доступ">
        <GrTreeSelect
          v-model="access"
          :data="teams"
          :default-expanded-keys="['product']"
          multiple
          show-checkbox
          tags
          :max-tag-count="2"
          placeholder="Кому открыть"
        />
      </GrFormField>
    </Specimen>

    <Specimen title="Узлы без каскада" note="check-strictly отвязывает родителя от детей: отмеченный отдел не тянет за собой каждую команду.">
      <GrFormField label="Кого уведомить">
        <GrTreeSelect
          v-model="notify"
          :data="teams"
          :default-expanded-keys="['product', 'sales']"
          multiple
          show-checkbox
          check-strictly
          tags
          :max-tag-count="2"
          placeholder="Отделы и команды"
        />
      </GrFormField>
    </Specimen>

    <Specimen title="Несколько строкой" note="Без тегов выбранное — первой меткой и счётчиком: строка не растёт и не двигает форму.">
      <GrFormField label="Регионы доставки">
        <GrTreeSelect
          v-model="deliveryRegions"
          :data="regions"
          :default-expanded-keys="['center', 'north-west', 'siberia']"
          multiple
          filterable
          filter-placeholder="Найти регион"
          placeholder="Куда везём"
        />
      </GrFormField>
    </Specimen>

    <Specimen title="Подсветка и ошибка" note="Успех и предупреждение несут иконку и скрытую подпись — смысл не держится на одном цвете; ошибка объявляет aria-invalid.">
      <div class="grid gap-4 sm:grid-cols-2">
        <GrFormField label="Раздел" hint="Отчёты увидит вся команда">
          <GrTreeSelect v-model="category" :data="folders" :default-expanded-keys="['finance']" state="success" />
        </GrFormField>
        <GrFormField label="На проверку" hint="Папку правят прямо сейчас">
          <GrTreeSelect v-model="reviewFolder" :data="folders" :default-expanded-keys="['projects']" state="warning" />
        </GrFormField>
        <GrFormField label="Куда переместить" error="Без папки файл не сохранить" required>
          <GrTreeSelect v-model="targetFolder" :data="folders" invalid placeholder="Выберите папку" />
        </GrFormField>
      </div>
    </Specimen>

    <Specimen title="Недоступно, только чтение, загрузка" note="Выключенное гасится фоном, а не прозрачностью; пока дерево грузится, панель показывает индикатор, а не «Нет данных».">
      <div class="grid gap-4 sm:grid-cols-2">
        <GrFormField label="Папка · выключено" disabled>
          <GrTreeSelect v-model="lockedFolder" :data="folders" value-display="path" />
        </GrFormField>
        <GrFormField label="Папка · только чтение" readonly>
          <GrTreeSelect v-model="lockedFolder" :data="folders" value-display="path" readonly />
        </GrFormField>
        <GrFormField label="Папка · загрузка">
          <GrTreeSelect v-model="pending" :data="notLoaded" loading placeholder="Откройте — дерево ещё грузится" />
        </GrFormField>
      </div>
    </Specimen>

    <Specimen title="Ступени" note="xs · sm · md · lg по шкале контролов — тот же кегль уезжает в дерево панели." wide>
      <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div v-for="size in SIZES" :key="size" class="flex flex-col gap-1.5">
          <code class="font-[var(--gr-font-mono)] text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">{{ size }}</code>
          <GrTreeSelect
            v-model="sizeFolder"
            :data="folders"
            :default-expanded-keys="['projects', 'launch']"
            :size="size"
            :aria-label="`Папка, ступень ${size}`"
          />
        </div>
      </div>
    </Specimen>
  </div>
</template>
