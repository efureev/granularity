<script setup lang="ts">
import { ref } from 'vue'

import { GrButton, GrPopover, GrSegmented } from '@feugene/granularity'

/**
 * Чем открывается панель и что считается триггером.
 *
 * Второй пример здесь важнее первого: он показывает не возможность, а границу.
 * Триггером считается элемент с `triggerProps`, а не весь слот, — и увидеть это
 * можно только рядом с соседней кнопкой, которая панель не открывает.
 */
const mode = ref<'click' | 'hover'>('click')

const modeOptions = [
  { value: 'click', label: 'По клику' },
  { value: 'hover', label: 'По наведению' },
]

const saved = ref(0)
</script>

<template>
  <div class="grid gap-5">
    <div class="grid gap-2">
      <label class="grid gap-1 text-[length:var(--gr-control-text-sm)]">
        <span class="showcase-demo-text">Чем открывается</span>
        <GrSegmented v-model="mode" :options="modeOptions" size="sm" />
      </label>

      <div>
        <GrPopover
          :key="mode"
          :trigger="mode"
          :open-delay="120"
          :close-delay="160"
          placement="bottom-start"
          aria-label="Режим открытия"
          size="sm"
        >
          <template #trigger="{ triggerProps }">
            <GrButton variant="outline" v-bind="triggerProps">
              {{ mode === 'hover' ? 'Наведите курсор' : 'Нажмите' }}
            </GrButton>
          </template>

          <template #content>
            <div class="w-56 text-[var(--gr-fg)]">
              Панель держится, пока курсор на ней: задержка закрытия даёт перейти
              с триггера через зазор.
            </div>
          </template>
        </GrPopover>
      </div>

      <p class="showcase-demo-text text-sm">
        <code>openDelay</code> и <code>closeDelay</code> нужны обе: без первой панель выпрыгивает на
        любое пересечение курсором, без второй её не удержать при переходе с триггера на панель —
        между ними зазор <code>offsetPx</code>. Клик в режиме наведения продолжает работать: с
        клавиатуры и с тачскрина наведения не бывает.
      </p>
    </div>

    <div class="grid gap-2">
      <span class="showcase-demo-text text-[length:var(--gr-control-text-sm)]">
        Триггер — элемент с <code>triggerProps</code>, а не весь слот
      </span>

      <GrPopover placement="bottom-start" aria-label="Что считается триггером" size="sm">
        <template #trigger="{ triggerProps }">
          <div class="flex items-center gap-2">
            <GrButton variant="outline" v-bind="triggerProps">Открыть панель</GrButton>
            <GrButton variant="ghost" @click="saved += 1">Сохранить</GrButton>
          </div>
        </template>

        <template #content>
          <div class="w-56 text-[var(--gr-fg)]">Открыла только левая кнопка.</div>
        </template>
      </GrPopover>

      <p class="showcase-demo-text text-sm">
        Обе кнопки лежат внутри слота <code>#trigger</code>, но панель открывает только левая.
        «Сохранить» делает своё дело — счётчик: <b>{{ saved }}</b> — и панели не касается.
        Клик живёт в <code>triggerProps</code>, а не на обёртке слота: иначе кнопка рядом,
        ссылка в карточке-триггере или крестик на чипе открывали бы панель мимо намерения.
      </p>

      <p class="showcase-demo-text text-sm">
        Слот без <code>v-bind="triggerProps"</code> по-прежнему открывается кликом по обёртке —
        так работало раньше, и это не отняли. Но такой триггер остаётся без клавиатуры и без
        <code>aria-haspopup</code>/<code>aria-expanded</code>, поэтому в dev-сборке компонент
        предупреждает о нём в консоли.
      </p>
    </div>
  </div>
</template>
