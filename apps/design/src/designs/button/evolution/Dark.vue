<script setup>
import { computed } from 'vue'

const vals = computed(() => {
  const tones = [
    { key: 'primary', verb: 'Сохранить' },
    { key: 'neutral', verb: 'Отмена' },
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
<span class="eyebrow">06 · Тёмная тема</span>
<h2 class="h1" style="font-size: 32px; line-height: 40px">Насыщенная кнопка на тёмном фоне</h2>
<p class="lead">Глобальные тоны здесь пастельные — под тёмный текст. Кнопка берёт роль <span class="code">--gr-{tone}-solid</span> и остаётся насыщенной со светлой подписью; мягкие заливки и рамки считаются от фона.</p>
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
<div style="display: grid; grid-template-columns: 160px repeat(5, minmax(0, 1fr)); align-items: center; min-height: 58px; padding: 0 24px; border-top: 1px solid var(--brd)">
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
<div style="display: grid; grid-template-columns: 160px repeat(6, minmax(0, 1fr)); align-items: center; min-height: 68px; padding: 0 24px; border-top: 1px solid var(--brd)">
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

<div style="display: grid; grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr); gap: 16px">

<div class="panel" style="padding: 24px; display: flex; flex-direction: column; gap: 16px">
<div style="display: flex; align-items: center; justify-content: space-between"><h3 class="h3">Наведение светлеет, а не темнеет</h3><span class="tag tag-new">изменение 09</span></div>
<div style="display: grid; grid-template-columns: 70px repeat(2, minmax(0, 1fr)); gap: 12px 16px; align-items: center">
<span></span><span class="colh">покой</span><span class="colh">наведение</span>
<span class="cap">1.1</span>
<div><button class="gb s-md" type="button" style="background: #6a2522; border-color: #f87171; color: #fca5a5">Удалить</button></div>
<div style="display: flex; align-items: center; gap: 10px"><button class="gb s-md" type="button" style="background: #3e2938; border-color: #f87c7c; color: #fca5a5">Удалить</button><span class="mono" style="color: var(--red)">темнее, серее</span></div>
<span class="cap">1.2</span>
<div><button class="gb s-md v-secondary t-danger" type="button">Удалить</button></div>
<div style="display: flex; align-items: center; gap: 10px"><button class="gb s-md v-secondary t-danger is-hover" type="button">Удалить</button><span class="mono" style="color: var(--ok)">светлее</span></div>
</div>
<p class="body">В 1.1 покой — <span class="code">--gr-danger-light</span>, а наведение — 20 % тона в фоне; в тёмной теме второе темнее первого. В 1.2 тон подмешивается в саму soft-заливку, и порядок покой → наведение → нажатие одинаков в обеих темах.</p>
</div>

<div class="panel" style="padding: 24px; display: flex; flex-direction: column; gap: 12px">
<h3 class="h3">Что держит тёмную тему</h3>
<ul style="display: flex; flex-direction: column; gap: 10px">
<li class="body">Подпись solid — <span class="code">--gr-{tone}-solid-fg</span>, контраст ≥ 4.5:1 на всех восьми тонах.</li>
<li class="body">Кольцо фокуса — <span class="code">#818cf8</span>, отступ залит фоном: на индиго-заливке кольцо отделено полосой фона.</li>
<li class="body">Тень xs темнее и плотнее: на тёмном фоне светлая тень не читается.</li>
<li class="body">Недоступная — <span class="code">--gr-disabled-*</span> тёмной темы, без прозрачности.</li>
</ul>
</div>

</div>

</div>
</template>
