<script setup>
import { computed, reactive } from 'vue'

const state = reactive({})

function setState(patch) {
  Object.assign(state, patch)
}

const vals = computed(() => {
  const d = { variant: 'primary', tone: 'primary', size: 'md', prefix: false, suffix: 'arrow', loading: false, disabled: false, square: false, block: false, shape: 'rounded', theme: 'light', label: 'Начать проект', presses: 0, open: false }
  const s = Object.assign({}, d, state || {})
  const set = patch => setState(patch)
  const pills = (key, items) => items.map((it) => {
    const value = typeof it === 'string' ? it : it.value
    const text = typeof it === 'string' ? it : it.label
    const on = s[key] === value
    return { label: text, on: on ? 'on' : '', pressed: on ? 'true' : 'false', pick: () => set({ [key]: value }) }
  })
  const toggles = [
    { key: 'prefix', label: 'иконка слева' },
    { key: 'loading', label: 'loading' },
    { key: 'disabled', label: 'disabled' },
    { key: 'square', label: 'square' },
    { key: 'block', label: 'block' },
  ].map(t => ({ label: t.label, on: s[t.key] ? 'on' : '', pressed: s[t.key] ? 'true' : 'false', pick: () => set({ [t.key]: !s[t.key] }) }))

  const label = String(s.label).trim() || 'Начать проект'
  const sq = s.square
  const ov = s.loading && (sq || !s.prefix)
  const menu = !sq && s.suffix === 'chevron'
  const cls = ['gb', `s-${s.size}`, `v-${s.variant}`, `t-${s.tone}`]
  if (!sq && s.prefix)
    cls.push('pre')
  if (!sq && s.suffix !== 'none')
    cls.push('suf')
  if (sq)
    cls.push('sq')
  if (s.block && !sq)
    cls.push('block')
  if (s.loading)
    cls.push('is-loading')
  if (ov)
    cls.push('ov')
  if (s.disabled)
    cls.push('is-disabled')

  const attrs = []
  if (s.variant !== 'primary')
    attrs.push(`variant="${s.variant}"`)
  if (s.tone !== 'primary')
    attrs.push(`tone="${s.tone}"`)
  if (s.size !== 'md')
    attrs.push(`size="${s.size}"`)
  if (sq)
    attrs.push('square', `aria-label="${label}"`)
  if (s.block && !sq)
    attrs.push('block')
  if (s.loading)
    attrs.push(':loading="saving"')
  if (s.disabled)
    attrs.push('disabled')
  const lines = [attrs.length > 2 ? `<GrButton\n  ${attrs.join('\n  ')}\n>` : `<GrButton${attrs.length ? ` ${attrs.join(' ')}` : ''}>`]
  if (sq) {
    lines.push('  <GrIcon><IconPlus /></GrIcon>')
  }
  else {
    if (s.prefix)
      lines.push('  <template #prefix>\n    <GrIcon><IconPlus /></GrIcon>\n  </template>')
    lines.push(`  ${label}`)
    if (s.suffix === 'arrow')
      lines.push('  <template #suffix>\n    <GrIcon><IconArrowRight /></GrIcon>\n  </template>')
    if (s.suffix === 'chevron')
      lines.push('  <template #suffix>\n    <GrIcon><IconChevronDown /></GrIcon>\n  </template>')
    if (s.suffix === 'kbd')
      lines.push('  <template #suffix>\n    <GrKbd keys="mod+S" />\n  </template>')
  }
  lines.push('</GrButton>')

  const a11y = [
    { k: 'элемент', v: '<button type="button">' },
    { k: 'имя', v: label + (s.loading ? ' Загрузка…' : '') },
    { k: 'aria-busy', v: s.loading ? 'true' : '—' },
    { k: 'aria-expanded', v: menu ? String(s.open) : '—' },
    { k: 'disabled', v: s.disabled ? 'нативный' : '—' },
    { k: 'курсор', v: s.disabled ? 'not-allowed' : (s.loading ? 'progress' : 'pointer') },
  ]

  return {
    label: s.label,
    onLabel: e => set({ label: e.target.value }),
    variantPills: pills('variant', ['primary', 'secondary', 'outline', 'ghost', 'ghost-border']),
    tonePills: pills('tone', ['primary', 'neutral', 'success', 'warning', 'danger', 'info', 'slate', 'azure']),
    sizePills: pills('size', ['xs', 'sm', 'md', 'lg']),
    suffixPills: pills('suffix', [{ value: 'none', label: 'нет' }, { value: 'arrow', label: 'стрелка' }, { value: 'chevron', label: 'меню' }, { value: 'kbd', label: 'клавиша' }]),
    shapePills: pills('shape', [{ value: 'rounded', label: 'скруглённая' }, { value: 'capsule', label: 'капсула' }]),
    themePills: pills('theme', [{ value: 'light', label: 'светлая' }, { value: 'dark', label: 'тёмная' }]),
    togglePills: toggles,
    stageCls: `${s.theme === 'dark' ? 'gr-dark' : 'gr-light'} stage${s.shape === 'capsule' ? ' shape-capsule' : ''}`,
    pvCls: `pv${s.block && !sq ? ' is-block' : ''}`,
    btnCls: cls.join(' '),
    disabled: s.disabled,
    loading: s.loading,
    ariaBusy: s.loading ? 'true' : undefined,
    ariaDisabled: s.loading ? 'true' : undefined,
    ariaLabel: sq ? label : undefined,
    hasPopup: menu ? 'menu' : undefined,
    expanded: menu ? (s.open ? 'true' : 'false') : undefined,
    sqIcon: sq,
    preIcon: !sq && s.prefix && !s.loading,
    preSpin: !sq && s.prefix && s.loading,
    showLabel: !sq,
    sufArrow: !sq && s.suffix === 'arrow',
    sufChevron: menu,
    sufKbd: !sq && s.suffix === 'kbd',
    ovSpin: ov,
    presses: s.presses,
    onPress: () => {
      if (s.loading || s.disabled)
        return
      set(menu ? { presses: s.presses + 1, open: !s.open } : { presses: s.presses + 1 })
    },
    code: lines.join('\n'),
    a11y,
  }
})
</script>

<template>
<div class="gr-light doc" style="width: 1280px; min-height: 1000px; padding: 56px 64px; display: flex; flex-direction: column; gap: 28px">

<header style="display: flex; flex-direction: column; gap: 12px">
<span class="eyebrow">07 · Песочница</span>
<h2 class="h1" style="font-size: 32px; line-height: 40px">Потрогайте кнопку</h2>
<p class="lead">Наведите, нажмите и отпустите, пройдите Tab — движение здесь настоящее. В загрузке клики не засчитываются.</p>
</header>

<div style="display: grid; grid-template-columns: 380px minmax(0, 1fr); gap: 20px; align-items: start">

<div class="panel" style="padding: 24px; display: flex; flex-direction: column; gap: 20px">
<label class="ctl"><span class="colh">Подпись</span><input class="inp" type="text" :value="vals.label" @input="vals.onLabel"></label>
<div class="ctl"><span class="colh">Вес · variant</span><div class="pills" role="group" aria-label="Вес"><template v-for="(p, pIndex) in vals.variantPills" :key="pIndex"><button class="pill" :class="p.on" type="button" :aria-pressed="p.pressed" @click="p.pick">{{ p.label }}</button></template></div></div>
<div class="ctl"><span class="colh">Тон · tone</span><div class="pills" role="group" aria-label="Тон"><template v-for="(p, pIndex) in vals.tonePills" :key="pIndex"><button class="pill" :class="p.on" type="button" :aria-pressed="p.pressed" @click="p.pick">{{ p.label }}</button></template></div></div>
<div class="ctl"><span class="colh">Ступень · size</span><div class="pills" role="group" aria-label="Ступень"><template v-for="(p, pIndex) in vals.sizePills" :key="pIndex"><button class="pill" :class="p.on" type="button" :aria-pressed="p.pressed" @click="p.pick">{{ p.label }}</button></template></div></div>
<div class="ctl"><span class="colh">Суффикс · #suffix</span><div class="pills" role="group" aria-label="Суффикс"><template v-for="(p, pIndex) in vals.suffixPills" :key="pIndex"><button class="pill" :class="p.on" type="button" :aria-pressed="p.pressed" @click="p.pick">{{ p.label }}</button></template></div></div>
<div class="ctl"><span class="colh">Флаги</span><div class="pills" role="group" aria-label="Флаги"><template v-for="(p, pIndex) in vals.togglePills" :key="pIndex"><button class="pill" :class="p.on" type="button" :aria-pressed="p.pressed" @click="p.pick">{{ p.label }}</button></template></div></div>
<div class="ctl"><span class="colh">Форма и тема</span><div class="pills" role="group" aria-label="Форма и тема"><template v-for="(p, pIndex) in vals.shapePills" :key="pIndex"><button class="pill" :class="p.on" type="button" :aria-pressed="p.pressed" @click="p.pick">{{ p.label }}</button></template><template v-for="(p, pIndex) in vals.themePills" :key="pIndex"><button class="pill" :class="p.on" type="button" :aria-pressed="p.pressed" @click="p.pick">{{ p.label }}</button></template></div></div>
</div>

<div style="display: flex; flex-direction: column; gap: 16px; min-width: 0">
<div :class="vals.stageCls" style="min-height: 320px; padding: 32px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 20px">
<div :class="vals.pvCls">
<button :class="vals.btnCls" type="button" :disabled="vals.disabled" :aria-busy="vals.ariaBusy" :aria-disabled="vals.ariaDisabled" :aria-label="vals.ariaLabel" :aria-haspopup="vals.hasPopup" :aria-expanded="vals.expanded" @click="vals.onPress">
<template v-if="vals.sqIcon"><svg class="pop" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14"></path><path d="M12 5v14"></path></svg></template>
<template v-if="vals.preIcon"><svg class="pop" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14"></path><path d="M12 5v14"></path></svg></template>
<template v-if="vals.preSpin"><svg class="spin" viewBox="0 0 24 24" aria-hidden="true"><circle class="trk" cx="12" cy="12" r="9"></circle><path d="M21 12a9 9 0 0 0-9-9"></path></svg></template>
<template v-if="vals.showLabel"><span class="lbl">{{ vals.label }}</span></template>
<template v-if="vals.sufArrow"><svg class="nudge" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg></template>
<template v-if="vals.sufChevron"><svg class="chev" viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"></path></svg></template>
<template v-if="vals.sufKbd"><span class="kbd" aria-hidden="true">⌘S</span></template>
<template v-if="vals.ovSpin"><span class="ov-spin" aria-hidden="true"><svg class="spin" viewBox="0 0 24 24"><circle class="trk" cx="12" cy="12" r="9"></circle><path d="M21 12a9 9 0 0 0-9-9"></path></svg></span></template>
<template v-if="vals.loading"><span style="position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap">Загрузка…</span></template>
</button>
</div>
<span class="cap">Засчитано нажатий: <b style="color: var(--fg)">{{ vals.presses }}</b></span>
</div>

<div style="display: grid; grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr); gap: 16px">
<pre class="mono" style="margin: 0; padding: 18px 20px; border-radius: 14px; background: #0f172a; color: #e2e8f0; white-space: pre; overflow: auto; min-height: 200px">{{ vals.code }}</pre>
<div class="panel" style="padding: 18px 20px; display: flex; flex-direction: column; gap: 8px">
<span class="colh">что услышит скринридер</span>
<template v-for="(r, rIndex) in vals.a11y" :key="rIndex">
<div style="display: grid; grid-template-columns: 120px minmax(0, 1fr); gap: 8px; padding: 6px 0; border-top: 1px solid var(--brd)">
<span class="cap">{{ r.k }}</span><span class="mono" style="color: var(--fg); overflow-wrap: anywhere">{{ r.v }}</span>
</div>
</template>
</div>
</div>
</div>

</div>
</div>
</template>
