import { componentSheet, lookElement } from '@feugene/granularity-test-kit/vue'
import { describe, expect, it } from 'vitest'

import { reticleClass } from '../components/GrCodeScanner/grCodeScannerStyles'
import { circleMaskClass, rectGuideClass } from '../components/GrImageCrop/grImageCropStyles'
import { buttonClass, controlsClass, playedClass } from '../components/GrVideoPlayer/grVideoPlayerStyles'

/**
 * Вид медиа решает тема: дорожка и подложка панели плеера, кольцо фокуса на
 * тёмном видео, прицел сканера — сплошной или уголками, рамка кадра — с отступом от
 * края окна. Значения сверяет гейт тем каталога; здесь — что компонент читает
 * именно их, без запасного значения.
 */
describe('медиа — вид у темы', () => {
  it('плеер: дорожка, подложка панели и кольцо фокуса', () => {
    expect(playedClass).toContain('bg-[var(--gr-video-player-progress)]')
    expect(controlsClass).toContain('[background:var(--gr-video-player-panel-bg)]')
    expect(buttonClass).toContain('focus-visible:ring-[var(--gr-video-player-ring)]')
  })

  it('прицел: цвет, толщина и скругление, уголки — маской длиной из темы', () => {
    expect(reticleClass).toContain('border-[var(--gr-code-scanner-reticle)]')
    expect(reticleClass).toContain('[border-width:var(--gr-code-scanner-reticle-width)]')
    expect(reticleClass).toContain('rounded-[var(--gr-code-scanner-reticle-radius)]')

    const look = componentSheet('GrCodeScanner/GrCodeScanner.vue').look(lookElement('div', { 'data-gr-code-scanner-reticle': '' }))
    expect(look['mask-size']).toBe('var(--gr-code-scanner-reticle-corner) var(--gr-code-scanner-reticle-corner)')
    expect(look['mask-position']).toBe('left top, right top, left bottom, right bottom')
  })

  it.each([['прямоугольник', rectGuideClass], ['круг', circleMaskClass]])('кадр (%s): отступ, направляющая и затемнение', (_name, className) => {
    expect(className).toContain('inset-[var(--gr-image-crop-inset)]')
    expect(className).toContain('border-[var(--gr-image-crop-guide)]')
    expect(className).toContain('shadow-[0_0_0_9999px_var(--gr-image-crop-mask)]')
  })
})
