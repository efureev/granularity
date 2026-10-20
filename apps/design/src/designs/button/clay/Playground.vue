<script setup>
import { computed, reactive } from 'vue'

const state = reactive({})

function setState(patch) {
  Object.assign(state, patch)
}

const vals = computed(() => {
  const d = { variant: 'primary', tone: 'neutral', size: 'md', prefix: false, suffix: 'none', loading: false, disabled: false, square: false, block: false, theme: 'light', label: 'Сохранить отчёт', presses: 0, open: false }
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

  const label = String(s.label).trim() || 'Сохранить отчёт'
  const sq = s.square
  const menu = !sq && s.suffix === 'menu'
  const cls = ['gb', `s-${s.size}`, `v-${s.variant}`, `t-${s.tone}`]
  if (sq)
    cls.push('sq')
  if (s.block && !sq)
    cls.push('block')
  if (s.loading)
    cls.push('is-loading')
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
    lines.push('  <GrIcon><IconArrowUp /></GrIcon>')
  }
  else {
    if (s.prefix)
      lines.push('  <template #prefix>\n    <GrIcon><IconPlus /></GrIcon>\n  </template>')
    lines.push(`  ${label}`)
    if (s.suffix === 'menu')
      lines.push('  <template #suffix>\n    <GrIcon><IconChevronDown /></GrIcon>\n  </template>')
    if (s.suffix === 'kbd')
      lines.push('  <template #suffix>\n    <GrKbd keys="mod+S" />\n  </template>')
    if (s.suffix === 'count')
      lines.push('  <template #suffix>\n    <GrBadge>3</GrBadge>\n  </template>')
  }
  lines.push('</GrButton>')

  const a11y = [
    { k: 'элемент', v: '<button type="button">' },
    { k: 'имя', v: label + (!sq && s.suffix === 'count' ? ' 3' : '') + (s.loading ? ' Загрузка…' : '') },
    { k: 'aria-busy', v: s.loading ? 'true' : '—' },
    { k: 'aria-expanded', v: menu ? String(s.open) : '—' },
    { k: 'disabled', v: s.disabled ? 'нативный' : '—' },
    { k: 'курсор', v: s.disabled ? 'not-allowed' : (s.loading ? 'progress' : 'pointer') },
  ]

  return {
    label: s.label,
    onLabel: e => set({ label: e.target.value }),
    variantPills: pills('variant', ['primary', 'secondary', 'outline', 'ghost', 'ghost-border']),
    tonePills: pills('tone', [{ value: 'neutral', label: 'neutral · графит' }, { value: 'primary', label: 'primary · глина' }, 'success', 'warning', 'danger', 'info', 'slate', 'azure']),
    sizePills: pills('size', ['xs', 'sm', 'md', 'lg']),
    suffixPills: pills('suffix', [{ value: 'none', label: 'нет' }, { value: 'menu', label: 'меню' }, { value: 'kbd', label: 'клавиша' }, { value: 'count', label: 'счётчик' }]),
    themePills: pills('theme', [{ value: 'light', label: 'светлая' }, { value: 'dark', label: 'тёмная' }]),
    togglePills: toggles,
    stageCls: `${s.theme === 'dark' ? 'gr-dark' : 'gr-light'} paper`,
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
    preIcon: !sq && s.prefix,
    showLabel: !sq,
    sufMenu: menu,
    sufKbd: !sq && s.suffix === 'kbd',
    sufCount: !sq && s.suffix === 'count',
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
<div class="gr-light doc" style="width: 1280px; min-height: 1000px; padding: 64px 72px; display: flex; flex-direction: column; gap: 28px">

<header style="display: flex; flex-direction: column; gap: 12px">
<span class="eyebrow">Песочница</span>
<h2 class="title" style="font-size: 34px">Соберите свою кнопку</h2>
<p class="lead">Наведение, нажатие и фокус настоящие. В загрузке клики не засчитываются, а по подписи проходит свет.</p>
</header>

<div style="display: grid; grid-template-columns: 380px minmax(0, 1fr); gap: 20px; align-items: start">

<div class="card" style="padding: 24px; display: flex; flex-direction: column; gap: 18px">
<label class="ctl"><span class="colh">Подпись</span><input class="inp" type="text" :value="vals.label" @input="vals.onLabel"></label>
<div class="ctl"><span class="colh">Вес · variant</span><div class="pills" role="group" aria-label="Вес"><template v-for="(p, pIndex) in vals.variantPills" :key="pIndex"><button class="pill" :class="p.on" type="button" :aria-pressed="p.pressed" @click="p.pick">{{ p.label }}</button></template></div></div>
<div class="ctl"><span class="colh">Тон · tone</span><div class="pills" role="group" aria-label="Тон"><template v-for="(p, pIndex) in vals.tonePills" :key="pIndex"><button class="pill" :class="p.on" type="button" :aria-pressed="p.pressed" @click="p.pick">{{ p.label }}</button></template></div></div>
<div class="ctl"><span class="colh">Ступень · size</span><div class="pills" role="group" aria-label="Ступень"><template v-for="(p, pIndex) in vals.sizePills" :key="pIndex"><button class="pill" :class="p.on" type="button" :aria-pressed="p.pressed" @click="p.pick">{{ p.label }}</button></template></div></div>
<div class="ctl"><span class="colh">Суффикс · #suffix</span><div class="pills" role="group" aria-label="Суффикс"><template v-for="(p, pIndex) in vals.suffixPills" :key="pIndex"><button class="pill" :class="p.on" type="button" :aria-pressed="p.pressed" @click="p.pick">{{ p.label }}</button></template></div></div>
<div class="ctl"><span class="colh">Флаги</span><div class="pills" role="group" aria-label="Флаги"><template v-for="(p, pIndex) in vals.togglePills" :key="pIndex"><button class="pill" :class="p.on" type="button" :aria-pressed="p.pressed" @click="p.pick">{{ p.label }}</button></template></div></div>
<div class="ctl"><span class="colh">Тема</span><div class="pills" role="group" aria-label="Тема"><template v-for="(p, pIndex) in vals.themePills" :key="pIndex"><button class="pill" :class="p.on" type="button" :aria-pressed="p.pressed" @click="p.pick">{{ p.label }}</button></template></div></div>
</div>

<div style="display: flex; flex-direction: column; gap: 16px; min-width: 0">
<div :class="vals.stageCls" style="min-height: 300px; padding: 32px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 20px">
<div :class="vals.pvCls">
<button :class="vals.btnCls" type="button" :disabled="vals.disabled" :aria-busy="vals.ariaBusy" :aria-disabled="vals.ariaDisabled" :aria-label="vals.ariaLabel" :aria-haspopup="vals.hasPopup" :aria-expanded="vals.expanded" @click="vals.onPress">
<template v-if="vals.sqIcon"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 19V5"></path><path d="m5 12 7-7 7 7"></path></svg></template>
<template v-if="vals.preIcon"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14"></path><path d="M12 5v14"></path></svg></template>
<template v-if="vals.showLabel"><span class="lbl">{{ vals.label }}</span></template>
<template v-if="vals.sufMenu"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"></path></svg></template>
<template v-if="vals.sufKbd"><span class="kbd" aria-hidden="true">⌘S</span></template>
<template v-if="vals.sufCount"><span class="cnt">3</span></template>
<template v-if="vals.loading"><span style="position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap">Загрузка…</span></template>
</button>
</div>
<span class="cap">засчитано нажатий: <b style="color: var(--fg); font-weight: 500">{{ vals.presses }}</b></span>
</div>

<div style="display: grid; grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr); gap: 16px">
<pre class="mono" style="margin: 0; padding: 18px 20px; border-radius: 12px; background: #1c1b18; color: #edeae2; white-space: pre; overflow: auto; min-height: 200px">{{ vals.code }}</pre>
<div class="card" style="padding: 18px 20px; display: flex; flex-direction: column; gap: 8px">
<span class="colh">что услышит скринридер</span>
<template v-for="(r, rIndex) in vals.a11y" :key="rIndex">
<div class="rule" style="display: grid; grid-template-columns: 120px minmax(0, 1fr); gap: 8px; padding: 6px 0">
<span class="cap">{{ r.k }}</span><span class="mono" style="color: var(--fg); overflow-wrap: anywhere">{{ r.v }}</span>
</div>
</template>
</div>
</div>
</div>

</div>
</div>
</template>
