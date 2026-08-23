import { Buffer } from 'node:buffer'
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { chromium } from '@playwright/test'

/**
 * Демо-ролик для страницы `GrVideoPlayer`.
 *
 * Витрина обязана работать без сети, а видеофайла в репозитории не было. Ролик
 * рисуется на canvas и записывается `MediaRecorder` прямо в браузере — так он
 * воспроизводим: файл можно пересоздать этой же командой, не таская бинарь из
 * внешнего источника.
 *
 * Запуск: `node scripts/generate-demo-video.mjs`
 */
const OUTPUT = resolve(dirname(fileURLToPath(import.meta.url)), '../public/demo/sample.webm')
const SECONDS = 6

const browser = await chromium.launch()
const page = await browser.newPage()

const base64 = await page.evaluate(async (seconds) => {
  const canvas = Object.assign(document.createElement('canvas'), { width: 640, height: 360 })
  const ctx = canvas.getContext('2d')
  const stream = canvas.captureStream(25)
  // MP4, а не WebM: у записи `MediaRecorder` в WebM нет длительности в
  // заголовке — браузер отдаёт `duration: NaN`, и полоса прогресса с подписью
  // времени остаются пустыми до конца ролика.
  const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' })
  const chunks = []

  recorder.ondataavailable = event => chunks.push(event.data)
  recorder.start()

  const started = performance.now()
  await new Promise((done) => {
    const draw = () => {
      const elapsed = (performance.now() - started) / 1000
      const progress = elapsed / seconds

      ctx.fillStyle = '#0f172a'
      ctx.fillRect(0, 0, 640, 360)

      // Движущийся круг: по нему видно, что ролик идёт, а не завис на кадре.
      ctx.fillStyle = '#38bdf8'
      ctx.beginPath()
      ctx.arc(80 + progress * 480, 180 + Math.sin(progress * Math.PI * 4) * 60, 44, 0, Math.PI * 2)
      ctx.fill()

      ctx.fillStyle = 'rgba(255,255,255,0.85)'
      ctx.font = 'bold 40px sans-serif'
      ctx.fillText(`${elapsed.toFixed(1)} с`, 40, 60)

      ctx.fillStyle = 'rgba(255,255,255,0.25)'
      ctx.fillRect(40, 300, 560, 8)
      ctx.fillStyle = '#f472b6'
      ctx.fillRect(40, 300, 560 * Math.min(1, progress), 8)

      if (elapsed >= seconds) {
        done()

        return
      }

      requestAnimationFrame(draw)
    }

    requestAnimationFrame(draw)
  })

  const blob = await new Promise((resolveBlob) => {
    recorder.onstop = () => resolveBlob(new Blob(chunks, { type: 'video/webm' }))
    recorder.stop()
  })

  const buffer = await blob.arrayBuffer()
  let binary = ''
  for (const byte of new Uint8Array(buffer))
    binary += String.fromCharCode(byte)

  return btoa(binary)
}, SECONDS)

await browser.close()

mkdirSync(dirname(OUTPUT), { recursive: true })
writeFileSync(OUTPUT, Buffer.from(base64, 'base64'))
console.log(`[demo-video] записан ${OUTPUT} (${(Buffer.from(base64, 'base64').length / 1024).toFixed(0)} КБ)`)
