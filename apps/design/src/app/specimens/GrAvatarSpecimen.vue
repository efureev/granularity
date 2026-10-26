<script setup lang="ts">
import IconBot from '~icons/lucide/bot'

import Specimen from './Specimen.vue'
import { portrait } from './support'

defineProps<{ preview?: boolean }>()

const photoAnna = portrait('hsl(24, 62%, 62%)', 'hsl(352, 48%, 46%)')
const photoIvan = portrait('hsl(196, 52%, 58%)', 'hsl(228, 42%, 40%)')
const photoMaria = portrait('hsl(146, 34%, 56%)', 'hsl(174, 44%, 32%)')

// Картинка, которую браузер не сможет разобрать: откат на ошибке без похода в сеть.
const brokenSrc = 'data:image/png;base64,AAAA'

const avatarSteps = ['xs', 'sm', 'md', 'lg'] as const

const team = [
  { name: 'Анна Соколова', src: photoAnna },
  { name: 'Иван Петров', src: photoIvan },
  { name: 'Мария Ким' },
  { name: 'Олег Лис', src: photoMaria },
  { name: 'Дарья Белова' },
]

const colleagues = ['Анна Соколова', 'Иван Петров', 'Мария Ким', 'Олег Лис', 'Дарья Белова', 'Семён Орлов', 'Вера Зуева', 'Анна Соколова']
</script>

<template>
  <!-- Карточка каталога и «Темы рядом»: одно состояние, ничего не открыто. -->
  <div v-if="preview" class="flex w-full flex-col gap-3">
    <div class="flex flex-wrap items-center gap-5">
      <GrAvatar name="Иван Петров" :src="photoIvan" status="online" size="lg" />
      <GrAvatarGroup :max="4" :total="7" aria-label="Участники проекта">
        <GrAvatar v-for="member in team" :key="member.name" :name="member.name" :src="member.src" />
      </GrAvatarGroup>
    </div>
  </div>
  <div v-else class="grid gap-x-8 gap-y-10 lg:grid-cols-2">
    <Specimen title="Ступени, инициалы и фото" note="кегль инициалов — треть диаметра, поэтому работает и произвольный размер">
      <div class="flex flex-wrap items-end gap-4">
        <GrAvatar v-for="step in avatarSteps" :key="step" name="Анна Соколова" :size="step" />
        <GrAvatar name="Анна Соколова" :src="photoAnna" :size="64" />
      </div>
      <p class="text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">
        xs · sm · md · lg · 64px — нет фото, есть инициалы
      </p>
    </Specimen>

    <Specimen title="Статус, форма и группа" note="статус — точкой и словом для диктора; квадрат — для команды; «+N» — остаток ряда">
      <div class="flex flex-wrap items-center gap-4">
        <GrAvatar name="Иван Петров" :src="photoIvan" status="online" />
        <GrAvatar name="Мария Ким" status="busy" />
        <GrAvatar name="Олег Лис" status="away" />
        <GrAvatar name="Дарья Белова" status="offline" />
        <GrAvatar name="Студия Лён" shape="square" />
      </div>
      <div class="flex flex-wrap items-center gap-3">
        <GrAvatarGroup :max="4" :total="7" size="sm" aria-label="Участники проекта">
          <GrAvatar v-for="member in team" :key="member.name" :name="member.name" :src="member.src" />
        </GrAvatarGroup>
        <span class="text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)] text-[var(--gr-muted-fg)]">
          Над проектом работают 7 человек
        </span>
      </div>
    </Specimen>

    <Specimen title="Цвет по имени" note="одно имя — всегда один цвет: человека в списке узнают по пятну раньше, чем по буквам">
      <div class="flex flex-wrap items-center gap-3">
        <GrAvatar v-for="(name, index) in colleagues" :key="`${name}-${index}`" :name="name" auto-color />
      </div>
    </Specimen>

    <Specimen title="Цепочка отката" note="битая ссылка → запасная картинка → инициалы → слот; иконки сломанного изображения нет">
      <div class="flex flex-wrap items-center gap-4">
        <GrAvatar :src="brokenSrc" :fallback-src="photoMaria" name="Мария Ким" size="lg" />
        <GrAvatar :src="brokenSrc" name="Олег Лис" size="lg" />
        <GrAvatar alt="Бот поддержки" size="lg" shape="square">
          <GrIcon><IconBot /></GrIcon>
        </GrAvatar>
      </div>
    </Specimen>
  </div>
</template>
