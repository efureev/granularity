import { mkdirSync, renameSync, rmSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { chromium } from '@playwright/test'

/**
 * Демо-ролик для страницы `GrVideoPlayer`.
 *
 * Витрина обязана работать без сети, а видеофайла в репозитории не было. Ролик
 * рисуется анимацией на странице и записывается **встроенной записью
 * Playwright** — у неё внутри свой ffmpeg, поэтому в файле есть длительность и
 * индекс, то есть полосу перемотки можно тащить.
 *
 * Запись `MediaRecorder` для этого не годится: она не пишет длительность в
 * заголовок WebM (баг Chromium 642012), браузер отдаёт такому файлу
 * `duration: NaN`, и плеер честно показывает одно текущее время без полосы.
 *
 * В самом кадре нет ничего похожего на полосу прогресса: рядом, под кадром,
 * стоит настоящая — и две полосы читались бы как одна. Ход времени показывают
 * счётчик и движение шара.
 *
 * Запуск: `node scripts/generate-demo-video.mjs`
 */
const HERE = dirname(fileURLToPath(import.meta.url))
const OUTPUT = resolve(HERE, '../public/demo/sample.webm')
const TEMP_DIR = resolve(HERE, '../.video-tmp')
const SECONDS = 6

const PAGE = `
<!doctype html>
<meta charset="utf-8">
<style>
  html, body { margin: 0; height: 100%; background: #0f172a; overflow: hidden }
  .stage { position: relative; width: 100%; height: 100%; font: 700 40px system-ui, sans-serif; color: #f8fafc }
  .ball { position: absolute; width: 96px; height: 96px; border-radius: 50%; background: #38bdf8;
          animation: ride ${SECONDS}s linear forwards }
  .clock { position: absolute; top: 24px; left: 32px }
  @keyframes ride { from { left: 40px; top: 40% } 50% { top: 12% } to { left: calc(100% - 136px); top: 40% } }
</style>
<div class="stage">
  <div class="clock" id="clock">0.0 с</div>
  <div class="ball"></div>
</div>
<script>
  const started = performance.now()
  const clock = document.getElementById('clock')
  const tick = () => {
    clock.textContent = ((performance.now() - started) / 1000).toFixed(1) + ' с'
    requestAnimationFrame(tick)
  }
  requestAnimationFrame(tick)
</script>
`

rmSync(TEMP_DIR, { recursive: true, force: true })

const browser = await chromium.launch()
const context = await browser.newContext({
  viewport: { width: 640, height: 360 },
  recordVideo: { dir: TEMP_DIR, size: { width: 640, height: 360 } },
})
const page = await context.newPage()
await page.setContent(PAGE)
await page.waitForTimeout(SECONDS * 1000)

const video = page.video()
await context.close()
await browser.close()

const recorded = await video.path()
mkdirSync(dirname(OUTPUT), { recursive: true })
rmSync(OUTPUT, { force: true })
renameSync(recorded, OUTPUT)
rmSync(TEMP_DIR, { recursive: true, force: true })

console.log(`[demo-video] записан ${OUTPUT}`)
