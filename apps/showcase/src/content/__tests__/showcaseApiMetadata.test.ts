import { describe, expect, it } from 'vitest'

import { showcaseComponentEntities } from '../../app/showcase'
import generatedComponentApiMetadata from '../generated/componentApi.generated.json'

describe('showcase generated component API metadata', () => {
  it('создаёт build-time metadata для каждого компонента из registry', () => {
    expect(Object.keys(generatedComponentApiMetadata).length).toBe(showcaseComponentEntities.length)
  })

  it('извлекает реальные props и slots как минимум для GrButton', () => {
    const buttonMetadata = generatedComponentApiMetadata.GrButton
    const propsSection = buttonMetadata.sections.find(section => section.key === 'props')
    const slotsSection = buttonMetadata.sections.find(section => section.key === 'slots')

    expect(propsSection?.items.some(item => item.name === 'variant')).toBe(true)
    expect(propsSection?.items.some(item => item.name === 'loading')).toBe(true)
    expect(slotsSection?.items.some(item => item.name === 'default')).toBe(true)
  })

  it('подмешивает fallback-описания для слотов там, где auto extraction не даёт достаточного описания', () => {
    const buttonEntity = showcaseComponentEntities.find(entity => entity.name === 'GrButton')
    const slotsSection = buttonEntity?.apiSections.find(section => section.key === 'slots')

    expect(slotsSection?.origin).toBe('generated')
    expect(slotsSection?.items.find(item => item.name === 'default')?.description).toContain('Текст кнопки')
  })

  it('раскрывает literal union значения для tone, tone и size у GrButton и GrLink в API showcase', () => {
    const buttonEntity = showcaseComponentEntities.find(entity => entity.name === 'GrButton')
    const linkEntity = showcaseComponentEntities.find(entity => entity.name === 'GrLink')

    const buttonProps = buttonEntity?.apiSections.find(section => section.key === 'props')
    const linkProps = linkEntity?.apiSections.find(section => section.key === 'props')

    expect(buttonProps?.items.find(item => item.name === 'variant')?.type).toBe(
      'GrButtonVariant: "primary" | "secondary" | "outline" | "ghost" | "ghost-border"',
    )
    expect(buttonProps?.items.find(item => item.name === 'tone')?.type).toBe(
      'GrButtonTone: "primary" | "neutral" | "success" | "warning" | "danger" | "info"',
    )
    expect(buttonProps?.items.find(item => item.name === 'size')?.type).toBe(
      'GrButtonSize: "xs" | "sm" | "md" | "lg"',
    )
    expect(linkProps?.items.find(item => item.name === 'variant')?.type).toBe(
      'GrLinkVariant: "primary" | "default" | "muted" | "danger"',
    )
    expect(linkProps?.items.find(item => item.name === 'size')?.type).toBe(
      'GrLinkSize: "sm" | "md" | "lg"',
    )
  })
})