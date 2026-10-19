<script setup>
import { computed } from 'vue'

const vals = computed(() => {
  const tones = [
    { key: 'primary', verb: 'Сохранить' },
    { key: 'neutral', verb: 'Продолжить' },
    { key: 'success', verb: 'Принять' },
    { key: 'warning', verb: 'Продолжить' },
    { key: 'danger', verb: 'Удалить' },
    { key: 'info', verb: 'Подробнее' },
    { key: 'slate', verb: 'В архив' },
    { key: 'azure', verb: 'Открыть' },
  ]
  const variants = ['primary', 'secondary', 'outline', 'ghost', 'ghost-border']
  const configs = [
    { v: 'primary', t: 'primary', verb: 'Сохранить' },
    { v: 'primary', t: 'neutral', verb: 'Продолжить' },
    { v: 'secondary', t: 'neutral', verb: 'Отмена' },
    { v: 'outline', t: 'primary', verb: 'Экспорт' },
  ]
  const states = [
    { extra: '' },
    { extra: ' is-hover' },
    { extra: ' is-active' },
    { extra: ' is-focus' },
    { extra: ' is-loading ov', loading: true },
    { extra: ' is-disabled', ariaDisabled: 'true' },
  ]
  return {
    rows: tones.map(t => ({
      key: t.key,
      cells: variants.map(v => ({ cls: `gb s-md v-${v} t-${t.key}`, verb: t.verb })),
    })),
    stateRows: configs.map(c => ({
      label: `${c.v} · ${c.t}`,
      cells: states.map(s => ({
        cls: `gb s-md v-${c.v} t-${c.t}${s.extra}`,
        verb: c.verb,
        loading: Boolean(s.loading),
        plain: !s.loading,
        ariaDisabled: s.ariaDisabled,
      })),
    })),
  }
})
</script>

<template>
<div class="gr-dark doc" style="width: 1280px; min-height: 1400px; padding: 56px 64px; display: flex; flex-direction: column; gap: 28px">

<header style="display: flex; flex-direction: column; gap: 12px">
<span class="eyebrow">05 · Тёмная тема</span>
<h2 class="h1" style="font-size: 32px; line-height: 40px">В темноте кнопка светится</h2>
<p class="lead">Тень тона здесь сильнее — 62 % заливки, и главное действие мягко подсвечивает фон под собой. Нейтральная primary инвертируется: светлая кнопка с тёмной подписью.</p>
</header>

<div class="panel" style="overflow: hidden">
<div style="display: grid; grid-template-columns: 160px repeat(5, minmax(0, 1fr)); align-items: end; padding: 14px 24px; background: var(--bg)">
<span class="colh">тон \ вес</span>
<span class="colh" style="color: var(--fg)">primary</span>
<span class="colh" style="color: var(--fg)">secondary</span>
<span class="colh" style="color: var(--fg)">outline</span>
<span class="colh" style="color: var(--fg)">ghost</span>
<span class="colh" style="color: var(--fg)">ghost-border</span>
</div>
<template v-for="(row, rowIndex) in vals.rows" :key="rowIndex">
<div style="display: grid; grid-template-columns: 160px repeat(5, minmax(0, 1fr)); align-items: center; min-height: 64px; padding: 0 24px; border-top: 1px solid var(--brd)">
<span class="mono" style="font-weight: 600; color: var(--fg)">{{ row.key }}</span>
<template v-for="(c, cIndex) in row.cells" :key="cIndex">
<div><button :class="c.cls" type="button">{{ c.verb }}</button></div>
</template>
</div>
</template>
</div>

<div class="panel" style="overflow: hidden">
<div style="display: grid; grid-template-columns: 160px repeat(6, minmax(0, 1fr)); align-items: end; padding: 14px 24px; background: var(--bg)">
<span class="colh">вес · тон</span>
<span class="colh" style="color: var(--fg)">покой</span>
<span class="colh" style="color: var(--fg)">наведение</span>
<span class="colh" style="color: var(--fg)">нажатие</span>
<span class="colh" style="color: var(--fg)">фокус</span>
<span class="colh" style="color: var(--fg)">загрузка</span>
<span class="colh" style="color: var(--fg)">disabled</span>
</div>
<template v-for="(row, rowIndex) in vals.stateRows" :key="rowIndex">
<div style="display: grid; grid-template-columns: 160px repeat(6, minmax(0, 1fr)); align-items: center; min-height: 76px; padding: 0 24px; border-top: 1px solid var(--brd)">
<span class="mono" style="font-weight: 600; color: var(--fg)">{{ row.label }}</span>
<template v-for="(c, cIndex) in row.cells" :key="cIndex">
<div>
<template v-if="c.plain">
<button :class="c.cls" type="button" :aria-disabled="c.ariaDisabled">{{ c.verb }}</button>
</template>
<template v-if="c.loading">
<button :class="c.cls" type="button" aria-busy="true" aria-disabled="true"><span class="lbl">{{ c.verb }}</span><span class="ov-spin" aria-hidden="true"><svg class="spin" viewBox="0 0 24 24"><circle class="trk" cx="12" cy="12" r="9"></circle><path d="M21 12a9 9 0 0 0-9-9"></path></svg></span></button>
</template>
</div>
</template>
</div>
</template>
</div>

<div style="display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px">
<div class="panel" style="padding: 24px; display: flex; flex-direction: column; gap: 10px">
<h3 class="h3">Свечение, а не тень</h3>
<p class="body">Серая тень на тёмном фоне не читается. Тень цвета заливки работает как подсветка: главное действие видно издалека.</p>
</div>
<div class="panel" style="padding: 24px; display: flex; flex-direction: column; gap: 10px">
<h3 class="h3">Пластина темнее, кромка светлее</h3>
<p class="body">Secondary — тонированная пластина с линией света 6 % по верху: объём без белых бликов, которые в темноте режут глаз.</p>
</div>
<div class="panel" style="padding: 24px; display: flex; flex-direction: column; gap: 10px">
<h3 class="h3">Контраст подписи</h3>
<p class="body">Подпись solid — <span class="code">--gr-{tone}-solid-fg</span>, не ниже 4.5:1 на всех тонах. Блик гаснет к 60 % высоты — под подписью его почти нет, и контраст остаётся прежним.</p>
</div>
</div>

</div>
</template>
