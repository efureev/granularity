<script setup>
import { computed } from 'vue'

const vals = computed(() => {
  const tones = [
    { key: 'neutral', verb: 'Сохранить' },
    { key: 'primary', verb: 'Отправить' },
    { key: 'success', verb: 'Принять' },
    { key: 'warning', verb: 'Продолжить' },
    { key: 'danger', verb: 'Удалить' },
    { key: 'info', verb: 'Подробнее' },
    { key: 'slate', verb: 'В архив' },
    { key: 'azure', verb: 'Открыть' },
  ]
  const variants = ['primary', 'secondary', 'outline', 'ghost', 'ghost-border']
  const configs = [
    { v: 'primary', t: 'neutral', verb: 'Сохранить' },
    { v: 'primary', t: 'primary', verb: 'Отправить' },
    { v: 'secondary', t: 'neutral', verb: 'Отмена' },
    { v: 'outline', t: 'neutral', verb: 'Экспорт' },
  ]
  const states = [
    { extra: '' },
    { extra: ' is-hover' },
    { extra: ' is-active' },
    { extra: ' is-focus' },
    { extra: ' is-loading', busy: 'true' },
    { extra: ' is-disabled', ariaDisabled: 'true' },
  ]
  return {
    rows: tones.map(t => ({
      key: t.key,
      cells: variants.map(v => ({ cls: `gb s-md v-${v} t-${t.key}`, verb: t.verb })),
    })),
    stateRows: configs.map(c => ({
      label: `${c.v} · ${c.t}`,
      cells: states.map(st => ({
        cls: `gb s-md v-${c.v} t-${c.t}${st.extra}`,
        verb: c.verb,
        busy: st.busy,
        ariaDisabled: st.busy || st.ariaDisabled,
      })),
    })),
  }
})
</script>

<template>
<div class="gr-dark doc" style="width: 1280px; min-height: 1400px; padding: 64px 72px; display: flex; flex-direction: column; gap: 28px">

<header style="display: flex; flex-direction: column; gap: 12px">
<span class="eyebrow">Тёмная тема</span>
<h2 class="title" style="font-size: 34px">Тёплый графит вместо синей ночи</h2>
<p class="lead">Фон — тёплый серый 800, поверхности — 750, подпись — слоновая кость. Главная кнопка инвертируется: светлая бумага с графитовой подписью. Глина остаётся глиной и по-прежнему несёт тёмную подпись.</p>
</header>

<div class="card" style="overflow: hidden">
<div style="display: grid; grid-template-columns: 160px repeat(5, minmax(0, 1fr)); align-items: end; padding: 12px 24px; background: var(--bg)">
<span class="colh">тон \ вес</span><span class="colh">primary</span><span class="colh">secondary</span><span class="colh">outline</span><span class="colh">ghost</span><span class="colh">ghost-border</span>
</div>
<template v-for="(row, rowIndex) in vals.rows" :key="rowIndex">
<div class="rule" style="display: grid; grid-template-columns: 160px repeat(5, minmax(0, 1fr)); align-items: center; min-height: 60px; padding: 0 24px">
<span class="h3" style="font-size: 13px">{{ row.key }}</span>
<template v-for="(c, cIndex) in row.cells" :key="cIndex">
<div><button :class="c.cls" type="button">{{ c.verb }}</button></div>
</template>
</div>
</template>
</div>

<div class="card" style="overflow: hidden">
<div style="display: grid; grid-template-columns: 160px repeat(6, minmax(0, 1fr)); align-items: end; padding: 12px 24px; background: var(--bg)">
<span class="colh">вес · тон</span><span class="colh">покой</span><span class="colh">наведение</span><span class="colh">нажатие</span><span class="colh">фокус</span><span class="colh">загрузка</span><span class="colh">disabled</span>
</div>
<template v-for="(row, rowIndex) in vals.stateRows" :key="rowIndex">
<div class="rule" style="display: grid; grid-template-columns: 160px repeat(6, minmax(0, 1fr)); align-items: center; min-height: 70px; padding: 0 24px">
<span class="h3" style="font-size: 13px">{{ row.label }}</span>
<template v-for="(c, cIndex) in row.cells" :key="cIndex">
<div><button :class="c.cls" type="button" :aria-busy="c.busy" :aria-disabled="c.ariaDisabled"><span class="lbl">{{ c.verb }}</span></button></div>
</template>
</div>
</template>
</div>

<div style="display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px">
<div class="card" style="padding: 22px; display: flex; flex-direction: column; gap: 8px">
<h3 class="heading" style="font-size: 19px">Главная — светлая</h3>
<p class="body">Графит на графитовом фоне не виден, поэтому главная кнопка переворачивается: слоновая кость с тёмной подписью. Она остаётся самым контрастным пятном на экране.</p>
</div>
<div class="card" style="padding: 22px; display: flex; flex-direction: column; gap: 8px">
<h3 class="heading" style="font-size: 19px">Тени бумаги — светом</h3>
<p class="body">Наведение у прозрачных кнопок — не тень, а 8 % слоновой кости поверх фона. Рамки — та же кость на 14 % и 28 %.</p>
</div>
<div class="card" style="padding: 22px; display: flex; flex-direction: column; gap: 8px">
<h3 class="heading" style="font-size: 19px">Фокус светлее</h3>
<p class="body">Синий контур поднят до #6fa2e2, чтобы держать 3:1 на тёмном фоне. Это по-прежнему единственный холодный цвет на экране.</p>
</div>
</div>

</div>
</template>
