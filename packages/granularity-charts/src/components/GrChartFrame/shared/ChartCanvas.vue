<script setup lang="ts">
/**
 * Тело графика на холсте — второй рендерер рядом с SVG.
 *
 * Заведён не ради «canvas быстрее вообще», а по замеру: цена SVG растёт линейно
 * с числом **нарисованных вершин** (около 0,8 мс на ряд из 2400), и на двадцати
 * рядах кадр перестаёт помещаться в бюджет. У холста та же работа почти
 * бесплатна: он не заводит DOM-узлов и не собирает строку `d` ни разу.
 *
 * Рисует **и сетку тоже**. Холст лежит под `<svg>` — иначе оверлей, оси и
 * активная точка оказались бы под ним, — а сетка обязана остаться под рядами.
 * Оставить её в SVG значило бы положить поверх данных; заводить вторую обёртку
 * ради десятка прямых дороже, чем нарисовать их здесь.
 *
 * **Цвета приходят как `var(--gr-*)`, а холст их не понимает.** Значение
 * резолвится через сам элемент: браузер вычисляет `var()` в контексте темы, а
 * результат кешируется до её смены — иначе каждый ряд стоил бы пересчёта стилей.
 */
import { computed, onMounted, ref, watch } from 'vue'

import { useGrConfig } from '@feugene/granularity/composables/useGrComponentConfig'

import type { Rect } from '../../../chart/chartLayout'
import type { DrawCommand } from '../../../chart/chartPath'
import type { ChartTick } from '../../../composables/useChartTicks'
import { gridStroke } from '../chartFrameStyles'

/** Ряд в том виде, в каком его рисует холст: числа и цвета, без разметки. */
export interface CanvasSeries {
  key: string
  commands: readonly DrawCommand[]
  color: string
  width: number
  /** Штрих в единицах SVG `stroke-dasharray`; пусто — сплошная линия. */
  dash?: string
  /** Заливка под линией: свои команды и своя прозрачность. */
  fill?: { commands: readonly DrawCommand[], color: string, opacity: number }
}

const props = withDefaults(defineProps<{
  plot: Rect
  width: number
  height: number
  series: readonly CanvasSeries[]
  xTicks?: readonly ChartTick[]
  yTicks?: readonly ChartTick[]
  showGrid?: 'both' | 'x' | 'y' | 'none'
}>(), {
  xTicks: () => [],
  yTicks: () => [],
  showGrid: 'both',
})

const canvasEl = ref<HTMLCanvasElement | null>(null)
const config = useGrConfig()

/** Кеш резолва цветов. Сбрасывается сменой темы: та же переменная даёт другой цвет. */
let colors = new Map<string, string>()

watch(() => config.theme?.value, () => {
  colors = new Map()
  draw()
})

function resolveColor(value: string): string {
  const cached = colors.get(value)
  if (cached !== undefined) return cached

  const element = canvasEl.value
  if (!element) return value

  // Резолв через сам холст: `var()` вычисляется в контексте его темы.
  const previous = element.style.color
  element.style.color = value
  const resolved = getComputedStyle(element).color || value
  element.style.color = previous

  colors.set(value, resolved)

  return resolved
}

/** `stroke-dasharray` — строка SVG; холсту нужен массив чисел. */
function dashOf(dash: string | undefined): number[] {
  if (!dash) return []

  return dash.split(/[\s,]+/).map(Number).filter(Number.isFinite)
}

function apply(ctx: CanvasRenderingContext2D, commands: readonly DrawCommand[]): void {
  ctx.beginPath()

  for (const command of commands) {
    if (command.op === 'move') ctx.moveTo(command.x, command.y)
    else if (command.op === 'line') ctx.lineTo(command.x, command.y)
    else if (command.op === 'close') ctx.closePath()
    else ctx.bezierCurveTo(command.x1, command.y1, command.x2, command.y2, command.x, command.y)
  }
}

function drawGrid(ctx: CanvasRenderingContext2D): void {
  const show = props.showGrid
  if (show === 'none') return

  ctx.save()
  ctx.strokeStyle = resolveColor(gridStroke)
  ctx.lineWidth = 1

  const lines: [number, number, number, number][] = [
    ...(show === 'both' || show === 'y' ? props.yTicks : [])
      .map((tick): [number, number, number, number] => [props.plot.x, tick.position, props.plot.x + props.plot.width, tick.position]),
    ...(show === 'both' || show === 'x' ? props.xTicks : [])
      .map((tick): [number, number, number, number] => [tick.position, props.plot.y, tick.position, props.plot.y + props.plot.height]),
  ]

  for (const [x1, y1, x2, y2] of lines) {
    ctx.beginPath()
    // Полупиксельный сдвиг: линия в целой координате размазывается на два пикселя.
    ctx.moveTo(Math.round(x1) + 0.5, Math.round(y1) + 0.5)
    ctx.lineTo(Math.round(x2) + 0.5, Math.round(y2) + 0.5)
    ctx.stroke()
  }

  ctx.restore()
}

function draw(): void {
  const element = canvasEl.value
  // В jsdom `getContext` нет вовсе: компонент обязан пережить это молча — тем
  // же правилом, каким пакет переживает отсутствие `ResizeObserver`.
  const ctx = element?.getContext?.('2d')
  if (!element || !ctx) return

  const ratio = Math.max(1, globalThis.devicePixelRatio || 1)
  const pixelWidth = Math.round(props.width * ratio)
  const pixelHeight = Math.round(props.height * ratio)

  // Присваивание размера очищает холст, поэтому только при настоящей смене.
  if (element.width !== pixelWidth || element.height !== pixelHeight) {
    element.width = pixelWidth
    element.height = pixelHeight
  }

  ctx.setTransform(ratio, 0, 0, ratio, 0, 0)
  ctx.clearRect(0, 0, props.width, props.height)

  drawGrid(ctx)

  ctx.save()
  ctx.beginPath()
  ctx.rect(props.plot.x, props.plot.y, props.plot.width, props.plot.height)
  ctx.clip()

  for (const item of props.series) {
    if (item.fill) {
      apply(ctx, item.fill.commands)
      ctx.globalAlpha = item.fill.opacity
      ctx.fillStyle = resolveColor(item.fill.color)
      ctx.fill()
      ctx.globalAlpha = 1
    }

    if (item.commands.length === 0) continue

    apply(ctx, item.commands)
    ctx.strokeStyle = resolveColor(item.color)
    ctx.lineWidth = item.width
    ctx.lineJoin = 'round'
    ctx.lineCap = 'round'
    ctx.setLineDash(dashOf(item.dash))
    ctx.stroke()
  }

  ctx.restore()
}

const style = computed(() => ({ width: `${props.width}px`, height: `${props.height}px` }))

watch(() => [props.series, props.plot, props.width, props.height, props.xTicks, props.yTicks, props.showGrid], draw, { deep: true })
onMounted(draw)

defineExpose({ draw })
</script>

<template>
  <canvas
    ref="canvasEl"
    data-gr-chart-canvas
    aria-hidden="true"
    class="pointer-events-none absolute left-0 top-0"
    :style="style"
  />
</template>
