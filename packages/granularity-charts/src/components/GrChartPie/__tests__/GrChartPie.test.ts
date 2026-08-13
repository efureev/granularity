import { announced, granularityGlobal, i18nAdapter, keydown, mockRect, pointer } from '@feugene/granularity/testing'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { nextTick } from 'vue'

import GrChartPie from '../GrChartPie.vue'

const data = [
  { label: 'Chrome', value: 60 },
  { label: 'Safari', value: 20 },
  { label: 'Firefox', value: 15 },
  { label: 'Edge', value: 5 },
]

/**
 * Раскладка при `axes: false`: отступы 4/8/8/4 от объявленных 640×256, то есть
 * центр в (318, 130) и внешний радиус 120. Тесты попадания опираются на эти
 * числа — иначе «клик по доле» проверял бы сам себя.
 */
const CENTER = { x: 318, y: 130 }

function factory(props: Record<string, unknown> = {}, options: Record<string, unknown> = {}) {
  const wrapper = mount(GrChartPie, {
    props: { data, ...props },
    global: granularityGlobal(options),
    attachTo: document.body,
  })

  const surface = wrapper.find('[data-gr-chart-surface]')

  if (surface.exists())
    mockRect(surface.element, { left: 0, top: 0, width: 640, height: 256 })

  return wrapper
}

function slices(wrapper: ReturnType<typeof factory>) {
  return wrapper.findAll('[data-gr-chart-pie-slice]')
}

/**
 * Движение указателя адресуется поверхности напрямую: `trigger` собирает
 * `MouseEvent` с координатами через присваивание, а они там только на чтение.
 */
async function hover(wrapper: ReturnType<typeof factory>, x: number, y: number): Promise<void> {
  wrapper.find('[data-gr-chart-surface]').element
    .dispatchEvent(pointer('pointermove', { clientX: x, clientY: y }))

  await nextTick()
}

/** Внешний радиус круга — из самой дуги: он зависит от того, включены ли подписи. */
function outerRadius(wrapper: ReturnType<typeof factory>): number {
  return Number(/A ([\d.]+) /.exec(slices(wrapper)[0]!.attributes('d')!)![1])
}

describe('GrChartPie', () => {
  it('рисует по доле на каждое положительное значение', () => {
    const wrapper = factory()

    expect(slices(wrapper)).toHaveLength(4)
    expect(slices(wrapper)[0]!.attributes('d')).toContain('A ')
  })

  it('пропуски, нули и отрицательные значения долей не дают', () => {
    const wrapper = factory({
      data: [
        { label: 'a', value: 10 },
        { label: 'b', value: null },
        { label: 'c', value: 0 },
        { label: 'd', value: -5 },
      ],
    })

    expect(slices(wrapper)).toHaveLength(1)
  })

  it('единственная доля рисуется полным кругом, а не исчезает', () => {
    // Дуга в 360° начинается там же, где кончается, и рендерер не рисует ничего.
    const wrapper = factory({ data: [{ label: 'Всё', value: 42 }] })
    const d = slices(wrapper)[0]!.attributes('d')!

    expect(d.match(/A /g)).toHaveLength(2)
    expect(d).not.toContain('NaN')
  })

  it('голый ряд чисел получает порядковые подписи', () => {
    const wrapper = factory({ data: [3, 1] })

    expect(wrapper.find('[data-gr-chart-pie-legend]').text()).toContain('1')
    expect(slices(wrapper)).toHaveLength(2)
  })

  it('ряд, начинающийся с пропуска, остаётся рядом чисел, а не списком долей', () => {
    expect(() => factory({ data: [null, null, 5, 7] })).not.toThrow()
  })

  it('доли за пределами палитры различаются текстурой, а не только цветом', () => {
    const wrapper = factory({
      data: Array.from({ length: 7 }, (_, index) => ({ label: `s${index}`, value: 1 })),
    })
    const fills = slices(wrapper).map(node => node.attributes('fill'))

    // Шестая и седьмая доли повторяют цвет первой и второй — и обязаны прийти
    // с заливкой-текстурой, иначе на круге они читаются как те же самые.
    expect(fills.slice(0, 5).every(fill => fill!.startsWith('var('))).toBe(true)
    expect(fills[5]).toContain('url(#')
    expect(fills[6]).toContain('url(#')
    expect(wrapper.findAll('pattern')).toHaveLength(2)
  })

  it('свой цвет отменяет текстуру: выбор потребителя сильнее', () => {
    const wrapper = factory({
      data: Array.from({ length: 6 }, (_, index) => ({
        label: `s${index}`,
        value: 1,
        ...(index === 5 ? { color: '#123456' } : {}),
      })),
    })

    expect(slices(wrapper)[5]!.attributes('fill')).toBe('#123456')
  })

  it('попадание указателя угловое, а не по абсциссе', async () => {
    const wrapper = factory()

    // Вверх от центра — первая доля. Вправо — тоже она: 60 % занимают 216°, и
    // здесь декартово правило рамы разошлось бы с рисунком.
    await hover(wrapper, CENTER.x, CENTER.y - 60)
    expect(wrapper.emitted('update:activeIndex')?.at(-1)).toEqual([0])

    await hover(wrapper, CENTER.x + 60, CENTER.y)
    expect(wrapper.emitted('update:activeIndex')?.at(-1)).toEqual([0])

    // Влево-вниз — вторая доля: круг читается по часовой от двенадцати.
    await hover(wrapper, CENTER.x - 57, CENTER.y + 18)
    expect(wrapper.emitted('update:activeIndex')?.at(-1)).toEqual([1])
  })

  it('за пределами круга попадания нет', async () => {
    const wrapper = factory()

    await hover(wrapper, CENTER.x, CENTER.y - 60)
    await hover(wrapper, CENTER.x + 200, CENTER.y)

    expect(wrapper.emitted('update:activeIndex')?.at(-1)).toEqual([null])
  })

  it('в дырке бублика попадания нет', async () => {
    const wrapper = factory({ variant: 'donut' })

    await hover(wrapper, CENTER.x, CENTER.y - 10)

    expect(wrapper.emitted('update:activeIndex')?.at(-1) ?? [null]).toEqual([null])
  })

  it('активная доля вырастает наружу, остальные приглушаются', async () => {
    const wrapper = factory()
    const resting = outerRadius(wrapper)

    await hover(wrapper, CENTER.x, CENTER.y - 60)

    const [active, ...rest] = slices(wrapper)

    expect(active!.attributes('fill-opacity')).toBeUndefined()
    expect(Number(/A ([\d.]+) /.exec(active!.attributes('d')!)![1])).toBeGreaterThan(resting)
    expect(rest.every(node => node.attributes('fill-opacity')?.includes('--gr-chart-pie-dim'))).toBe(true)
  })

  it('зона попадания шире нарисованного круга: иначе выступ мигал бы на своей же границе', async () => {
    const wrapper = factory()
    const radius = outerRadius(wrapper)

    await hover(wrapper, CENTER.x, CENTER.y - (radius + 2))

    expect(wrapper.emitted('update:activeIndex')?.at(-1)).toEqual([0])
  })

  it('вертикали у круга нет: активна доля, а не абсцисса', async () => {
    const wrapper = factory()

    await hover(wrapper, CENTER.x, CENTER.y - 60)

    expect(wrapper.find('[data-gr-chart-crosshair]').exists()).toBe(false)
  })

  it('стрелки двигают долю и объявляют её вместе с процентом', async () => {
    const wrapper = factory({}, { i18n: i18nAdapter({}) })

    keydown(wrapper.find('[data-gr-chart-surface]').element, 'ArrowRight')
    await nextTick()

    expect(wrapper.emitted('update:activeIndex')?.at(-1)).toEqual([0])

    const message = await announced()

    expect(message).toContain('Chrome')
    expect(message).toContain('60')
    expect(message).toContain('%')
  })

  it('у круга ровно одна остановка Tab', () => {
    expect(factory().findAll('[tabindex="0"]')).toHaveLength(1)
  })

  it('таблица круга — доли, а не ряд по оси', () => {
    const wrapper = factory()
    const table = wrapper.find('[data-gr-chart-table]')

    expect(table.classes()).toContain('sr-only')
    expect(table.findAll('thead th')).toHaveLength(3)

    const rows = table.findAll('tbody tr')

    expect(rows).toHaveLength(4)
    expect(rows[0]!.text()).toContain('Chrome')
    expect(rows[0]!.text()).toContain('60')
    expect(rows[0]!.text()).toContain('%')
  })

  it('доля, которой нет на рисунке, остаётся в таблице с прочерком', () => {
    // Промолчать о переданном значении значило бы показать читающему без зрения
    // другие данные, чем видит зрячий сосед.
    const wrapper = factory({ data: [{ label: 'a', value: 10 }, { label: 'b', value: 0 }] })
    const rows = wrapper.find('[data-gr-chart-table]').findAll('tbody tr')

    expect(rows).toHaveLength(2)
    expect(rows[1]!.text()).toContain('—')
  })

  it('легенда — ключ, а не переключатель: доли не прячутся', () => {
    const wrapper = factory()
    const legend = wrapper.find('[data-gr-chart-pie-legend]')

    expect(legend.findAll('li')).toHaveLength(4)
    expect(legend.findAll('button')).toHaveLength(0)
    expect(legend.text()).toContain('Chrome')
    expect(legend.text()).toContain('%')
  })

  it('бублик показывает итог в середине, круг — нет', () => {
    expect(factory({ variant: 'donut' }).find('[data-gr-chart-pie-center]').text()).toContain('100')
    expect(factory().find('[data-gr-chart-pie-center]').exists()).toBe(false)
  })

  it('подписи снаружи кольца и только у заметных долей', () => {
    const wrapper = factory({ labels: 'share', labelMinShare: 0.1 })
    const texts = wrapper.findAll('[data-gr-chart-pie-body] text')

    // Доля в 5 % ниже порога — подписи у неё нет.
    expect(texts).toHaveLength(3)

    const first = texts[0]!
    const distance = Math.hypot(
      Number(first.attributes('x')) - CENTER.x,
      Number(first.attributes('y')) - CENTER.y,
    )

    // Подпись стоит за внешним радиусом: на насыщенной заливке текст не проходит AA.
    expect(distance).toBeGreaterThan(outerRadius(wrapper))
    expect(first.attributes('fill')).toContain('--gr-chart-pie-label')
  })

  it('круг из нулей — то же пустое состояние, что и отсутствие данных', () => {
    expect(factory({ data: [] }).text()).toContain('No data')
    expect(factory({ data: [0, 0] }).text()).toContain('No data')
  })

  it('клик по доле отдаёт долю, а не точку графика', async () => {
    const wrapper = factory()

    await hover(wrapper, CENTER.x, CENTER.y - 60)
    await wrapper.find('[data-gr-chart-surface]').trigger('click')

    expect(wrapper.emitted('sliceClick')?.at(-1)).toEqual([{
      index: 0,
      label: 'Chrome',
      value: 60,
      share: 0.6,
      color: 'var(--gr-chart-1)',
    }])
  })

  it('неинтерактивный режим отдаёт картинку с именем, а не приложение', () => {
    const wrapper = factory({ interactive: false })
    const svg = wrapper.find('svg')

    expect(wrapper.find('[data-gr-chart-surface]').exists()).toBe(false)
    expect(svg.attributes('role')).toBe('img')
    expect(svg.attributes('aria-label')).toContain('4')
  })

  it('размер приезжает из GrConfigProvider', () => {
    const fontOf = (size: string) => factory(
      { labels: 'share' },
      { componentDefaults: { GrChartPie: { size } } },
    ).find('[data-gr-chart-pie-body] text').attributes('font-size')

    expect(fontOf('xs')).not.toBe(fontOf('lg'))
  })

  it('оформление приезжает из GrConfigProvider', () => {
    const wrapper = factory({}, { componentDefaults: { GrChartPie: { variant: 'donut' } } })

    expect(wrapper.find('[data-gr-chart-pie-center]').exists()).toBe(true)
  })
})
