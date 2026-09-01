import { mount } from '@vue/test-utils'
import { defineComponent, h, markRaw, nextTick } from 'vue'
import { describe, expect, it, vi } from 'vitest'

// `vi.mock` поднимается компилятором в начало файла, поэтому пути пишутся
// литералами: в цикле замыкание до подъёма не доживает.
vi.mock('~icons/lucide/file', () => ({
  default: defineComponent({ name: 'IconFile', render: () => h('svg', { 'data-icon': 'file' }) }),
}))
vi.mock('~icons/lucide/file-archive', () => ({
  default: defineComponent({ name: 'IconFileArchive', render: () => h('svg', { 'data-icon': 'file-archive' }) }),
}))
vi.mock('~icons/lucide/file-spreadsheet', () => ({
  default: defineComponent({ name: 'IconFileSpreadsheet', render: () => h('svg', { 'data-icon': 'file-spreadsheet' }) }),
}))
vi.mock('~icons/lucide/file-text', () => ({
  default: defineComponent({ name: 'IconFileText', render: () => h('svg', { 'data-icon': 'file-text' }) }),
}))
vi.mock('~icons/lucide/file-type', () => ({
  default: defineComponent({ name: 'IconFileType', render: () => h('svg', { 'data-icon': 'file-type' }) }),
}))
vi.mock('~icons/lucide/image-off', () => ({
  default: defineComponent({ name: 'IconImageOff', render: () => h('svg', { 'data-icon': 'image-off' }) }),
}))

import GrConfigProvider from '../../GrConfigProvider/GrConfigProvider.vue'
import GrFilePreview from '../GrFilePreview.vue'

const IMAGE = 'https://cdn.invalid/receipt.png'

/** Заглушка компонента-ссылки: так устроены `Link` от Inertia и `RouterLink`. */
const StubLink = markRaw(defineComponent({
  name: 'StubLink',
  props: { href: { type: String, default: undefined } },
  template: '<a :href="href"><slot /></a>',
}))

describe('GrFilePreview — что показывается', () => {
  it('image/* рисует картинку', () => {
    const wrapper = mount(GrFilePreview, { props: { src: IMAGE, mime: 'image/png' } })

    expect(wrapper.get('[data-gr-file-preview-image]').attributes('src')).toBe(IMAGE)
    expect(wrapper.find('[data-gr-file-preview-fallback]').exists()).toBe(false)
  })

  // Тот самый дефект у потребителя: `<img>` на PDF рисует битую иконку.
  it('application/pdf не рендерит img вовсе', () => {
    const wrapper = mount(GrFilePreview, { props: { src: IMAGE, mime: 'application/pdf' } })

    expect(wrapper.find('img').exists()).toBe(false)
    expect(wrapper.find('svg[data-icon="file-text"]').exists()).toBe(true)
  })

  it.each([
    ['application/vnd.ms-excel', 'file-spreadsheet'],
    ['application/zip', 'file-archive'],
    ['application/msword', 'file-type'],
    ['application/octet-stream', 'file'],
  ])('%s даёт иконку %s', (mime, icon) => {
    const wrapper = mount(GrFilePreview, { props: { src: IMAGE, mime } })

    expect(wrapper.find(`svg[data-icon="${icon}"]`).exists()).toBe(true)
  })

  // Контроллер отдаёт варианты файла без типа сплошь и рядом.
  it.each([
    ['null', null],
    ['undefined', undefined],
    ['пустая строка', ''],
  ])('mime=%s даёт заглушку, а не пустоту', (_name, mime) => {
    const wrapper = mount(GrFilePreview, { props: { src: IMAGE, mime } })

    expect(wrapper.find('img').exists()).toBe(false)
    expect(wrapper.find('[data-gr-file-preview-fallback]').exists()).toBe(true)
    expect(wrapper.attributes('data-kind')).toBe('unknown')
  })

  it('без src картинки нет даже у image/*', () => {
    const wrapper = mount(GrFilePreview, { props: { mime: 'image/png' } })

    expect(wrapper.find('img').exists()).toBe(false)
    expect(wrapper.find('[data-gr-file-preview-fallback]').exists()).toBe(true)
  })

  // Превью исчезает с диска, и «сломанная картинка» не информативнее иконки.
  it('сорвавшаяся загрузка деградирует в заглушку', async () => {
    const wrapper = mount(GrFilePreview, { props: { src: IMAGE, mime: 'image/png' } })

    await wrapper.get('[data-gr-file-preview-image]').trigger('error')

    expect(wrapper.find('img').exists()).toBe(false)
    // Значок другой: «изображение не открылось», а не «это файл».
    expect(wrapper.find('svg[data-icon="image-off"]').exists()).toBe(true)
  })

  it('новая ссылка не наследует ошибку прошлой', async () => {
    const wrapper = mount(GrFilePreview, { props: { src: IMAGE, mime: 'image/png' } })
    await wrapper.get('[data-gr-file-preview-image]').trigger('error')
    expect(wrapper.find('img').exists()).toBe(false)

    await wrapper.setProps({ src: 'https://cdn.invalid/other.png' })
    await nextTick()

    expect(wrapper.find('[data-gr-file-preview-image]').exists()).toBe(true)
  })
})

describe('GrFilePreview — пока картинка едет', () => {
  it('место держит скелет, а картинка ждёт невидимой', () => {
    const wrapper = mount(GrFilePreview, { props: { src: IMAGE, mime: 'image/png' } })

    expect(wrapper.find('[data-gr-skeleton]').exists()).toBe(true)
    // Картинка обязана быть в дереве: без неё браузер не начнёт качать, и
    // `load` не придёт никогда.
    expect(wrapper.get('[data-gr-file-preview-image]').classes()).toContain('invisible')
  })

  it('после load скелет уходит, картинка возвращается в поток', async () => {
    const wrapper = mount(GrFilePreview, { props: { src: IMAGE, mime: 'image/png' } })

    await wrapper.get('[data-gr-file-preview-image]').trigger('load')

    expect(wrapper.find('[data-gr-skeleton]').exists()).toBe(false)
    expect(wrapper.get('[data-gr-file-preview-image]').classes()).not.toContain('invisible')
  })

  it('сорвавшаяся загрузка скелет снимает', async () => {
    const wrapper = mount(GrFilePreview, { props: { src: IMAGE, mime: 'image/png' } })

    await wrapper.get('[data-gr-file-preview-image]').trigger('error')

    expect(wrapper.find('[data-gr-skeleton]').exists()).toBe(false)
    expect(wrapper.find('[data-gr-file-preview-fallback]').exists()).toBe(true)
  })

  it('у не-картинки скелета нет вовсе', () => {
    const wrapper = mount(GrFilePreview, { props: { src: IMAGE, mime: 'application/pdf' } })

    expect(wrapper.find('[data-gr-skeleton]').exists()).toBe(false)
  })

  it('новая ссылка возвращает состояние в загрузку', async () => {
    const wrapper = mount(GrFilePreview, { props: { src: IMAGE, mime: 'image/png' } })
    await wrapper.get('[data-gr-file-preview-image]').trigger('load')
    expect(wrapper.find('[data-gr-skeleton]').exists()).toBe(false)

    await wrapper.setProps({ src: 'https://cdn.invalid/other.png' })
    await nextTick()

    expect(wrapper.find('[data-gr-skeleton]').exists()).toBe(true)
  })
})

describe('GrFilePreview — доступное имя', () => {
  it('name становится alt', () => {
    const wrapper = mount(GrFilePreview, { props: { src: IMAGE, mime: 'image/png', name: 'Чек №42.png' } })

    expect(wrapper.get('[data-gr-file-preview-image]').attributes('alt')).toBe('Чек №42.png')
  })

  // Придуманный компонентом alt хуже пустого: диктор прочитает выдумку как факт.
  it('без name картинка декоративна', () => {
    const wrapper = mount(GrFilePreview, { props: { src: IMAGE, mime: 'image/png' } })

    expect(wrapper.get('[data-gr-file-preview-image]').attributes('alt')).toBe('')
  })

  it('в заглушке name становится подписью, иконка скрыта от диктора', () => {
    const wrapper = mount(GrFilePreview, { props: { mime: 'application/pdf', name: 'Договор.pdf' } })

    expect(wrapper.get('[data-gr-file-preview-label]').text()).toBe('Договор.pdf')
    expect(wrapper.find('svg[data-icon="file-text"]').attributes('aria-hidden')).toBe('true')
  })

  it('ariaLabel именует интерактивную плитку', () => {
    const wrapper = mount(GrFilePreview, {
      props: { src: IMAGE, mime: 'image/png', clickable: true, ariaLabel: 'Открыть чек' },
    })

    expect(wrapper.attributes('aria-label')).toBe('Открыть чек')
  })
})

describe('GrFilePreview — интерактивность', () => {
  // Плитка без действия — картинка, а не контрол: пустая остановка `Tab` хуже
  // её отсутствия.
  it('по умолчанию это div вне таб-порядка', () => {
    const wrapper = mount(GrFilePreview, { props: { src: IMAGE, mime: 'image/png' } })

    expect(wrapper.element.tagName).toBe('DIV')
    expect(wrapper.attributes('tabindex')).toBeUndefined()
    expect(wrapper.classes()).not.toContain('cursor-pointer')
  })

  it('clickable даёт кнопку и эмитит click', async () => {
    const wrapper = mount(GrFilePreview, { props: { src: IMAGE, mime: 'image/png', clickable: true } })

    expect(wrapper.element.tagName).toBe('BUTTON')
    expect(wrapper.attributes('type')).toBe('button')

    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toHaveLength(1)
  })

  it('href делает плитку ссылкой', () => {
    const wrapper = mount(GrFilePreview, { props: { mime: 'application/pdf', href: '/files/42.pdf' } })

    expect(wrapper.element.tagName).toBe('A')
    expect(wrapper.attributes('href')).toBe('/files/42.pdf')
  })

  // Тот же класс дефекта, что чинили в GrCard, GrSidebarItem и GrStatistic.
  it('as-компонент получает href', () => {
    const wrapper = mount(GrFilePreview, {
      props: { mime: 'application/pdf', as: StubLink, href: '/files/42.pdf' },
    })

    expect(wrapper.getComponent(StubLink).props('href')).toBe('/files/42.pdf')
  })

  it('строковый as, кроме a, href не получает', () => {
    const wrapper = mount(GrFilePreview, {
      props: { mime: 'application/pdf', as: 'article', href: '/files/42.pdf' },
    })

    expect(wrapper.attributes('href')).toBeUndefined()
  })
})

describe('GrFilePreview — размер и загрузка', () => {
  it('ступень задаёт ширину, число — произвольную', () => {
    const step = mount(GrFilePreview, { props: { src: IMAGE, mime: 'image/png', tileSize: 'lg' } })
    expect(step.classes()).toContain('w-32')

    const exact = mount(GrFilePreview, { props: { src: IMAGE, mime: 'image/png', tileSize: 96 } })
    expect(exact.attributes('style')).toContain('width: 96px')
    expect(exact.classes().some(cls => /^w-\d/.test(cls))).toBe(false)
  })

  it('соотношение сторон держит место до загрузки', () => {
    const wrapper = mount(GrFilePreview, { props: { src: IMAGE, mime: 'image/png', ratio: '16:9' } })

    expect(wrapper.classes()).toContain('aspect-[16/9]')
  })

  // Плиток на странице бывает десяток.
  it('загрузка ленивая по умолчанию', () => {
    const lazy = mount(GrFilePreview, { props: { src: IMAGE, mime: 'image/png' } })
    expect(lazy.get('[data-gr-file-preview-image]').attributes('loading')).toBe('lazy')

    const eager = mount(GrFilePreview, { props: { src: IMAGE, mime: 'image/png', loading: 'eager' } })
    expect(eager.get('[data-gr-file-preview-image]').attributes('loading')).toBe('eager')
  })

  it('оформление читается из GrConfigProvider', () => {
    const Harness = defineComponent({
      components: { GrConfigProvider, GrFilePreview },
      template: `
        <GrConfigProvider :component-defaults="{ GrFilePreview: { tileSize: 'sm', ratio: '4:3', loading: 'eager' } }">
          <GrFilePreview src="${IMAGE}" mime="image/png" />
        </GrConfigProvider>
      `,
    })

    const tile = mount(Harness).get('[data-gr-file-preview]')
    expect(tile.classes()).toContain('w-16')
    expect(tile.classes()).toContain('aspect-[4/3]')
    expect(tile.get('[data-gr-file-preview-image]').attributes('loading')).toBe('eager')
  })
})

/**
 * Ссылка, открытая в новой вкладке, отдаёт странице-получателю `window.opener`,
 * если её не закрыть `rel`. Правило пакета — подставлять защиту по факту
 * `_blank`, а не по отдельному пропу (`GrLink`, `GrButton`); плитка до этого
 * `target` вовсе не объявляла, и он уезжал на `<a>` мимо компонента.
 */
describe('GrFilePreview: ссылка в новой вкладке', () => {
  it('`_blank` получает защитный `rel` без спроса', () => {
    const wrapper = mount(GrFilePreview, {
      props: { href: 'https://example.test/f.pdf', mime: 'application/pdf', target: '_blank' },
    })

    expect(wrapper.get('[data-gr-file-preview]').attributes('rel')).toBe('noopener noreferrer')
  })

  it('своё значение `rel` сильнее автоподстановки', () => {
    const wrapper = mount(GrFilePreview, {
      props: { href: 'https://example.test/f.pdf', target: '_blank', rel: 'nofollow' },
    })

    expect(wrapper.get('[data-gr-file-preview]').attributes('rel')).toBe('nofollow')
  })

  it('без `_blank` защита не навязывается', () => {
    const wrapper = mount(GrFilePreview, { props: { href: '/f.pdf' } })

    expect(wrapper.get('[data-gr-file-preview]').attributes('rel')).toBeUndefined()
  })

  it('на кнопке ссылочных атрибутов нет вовсе', () => {
    const wrapper = mount(GrFilePreview, { props: { clickable: true, target: '_blank' } })
    const root = wrapper.get('[data-gr-file-preview]')

    expect(root.element.tagName).toBe('BUTTON')
    expect(root.attributes('target')).toBeUndefined()
    expect(root.attributes('rel')).toBeUndefined()
  })
})

/**
 * Имя интерактивной плитке даёт содержимое: `alt` картинки или подпись заглушки,
 * и то и другое из `name`. Без него кнопка выходила с пустым `alt`, а ссылка —
 * пустой: axe зовёт это `button-name` и `link-name`, а скринридер не зовёт никак.
 */
describe('GrFilePreview: интерактивная плитка всегда названа', () => {
  const label = (props: Record<string, unknown>) =>
    mount(GrFilePreview, { props }).get('[data-gr-file-preview]').attributes('aria-label')

  it('кнопка с картинкой и без `name` получает родовое имя', () => {
    expect(label({ clickable: true, src: '/x.png', mime: 'image/png' })).toBeTruthy()
  })

  it('кнопка без картинки и без `name` — тоже', () => {
    expect(label({ clickable: true, mime: 'application/pdf' })).toBeTruthy()
  })

  it('ссылка без `name` — тоже', () => {
    expect(label({ href: '/f.pdf', mime: 'application/pdf' })).toBeTruthy()
  })

  it('`name` даёт имя содержимым, и родовое не навязывается', () => {
    expect(label({ clickable: true, src: '/x.png', mime: 'image/png', name: 'счёт.png' })).toBeUndefined()
  })

  it('`ariaLabel` сильнее всего', () => {
    expect(label({ clickable: true, name: 'счёт.png', ariaLabel: 'Открыть счёт' })).toBe('Открыть счёт')
  })

  it('неинтерактивной плитке имя не навязывается — она не контрол', () => {
    expect(label({ src: '/x.png', mime: 'image/png' })).toBeUndefined()
  })

  it('о промахе потребителю говорят вслух', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

    mount(GrFilePreview, { props: { clickable: true, src: '/x.png' } })

    expect(warn.mock.calls.map(call => String(call[0])).join('\n')).toContain('GrFilePreview')

    warn.mockRestore()
  })
})
