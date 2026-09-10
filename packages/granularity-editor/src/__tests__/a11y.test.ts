import { axeViolations } from '@feugene/granularity-test-kit/a11y'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import GrMarkdown from '../components/GrMarkdown/GrMarkdown.vue'

/**
 * Пакетного a11y-гейта здесь не было, хотя `axe-core` в devDependencies лежал,
 * а правило спутников его называет. Заводится вместе с первым компонентом,
 * который рисует документ целиком: иерархия заголовков, имена прокручиваемых
 * областей и контраст алертов проверяются не глазами.
 */

const DOCUMENT = `# Заголовок документа

Абзац со [ссылкой](https://example.com) и \`кодом\`.

## Раздел

- пункт
- [ ] задача

> [!NOTE]
> Полезно знать.

| Колонка | Значение |
| --- | --: |
| Одна | 1 |

\`\`\`ts
const x = 1
\`\`\`

Сноска[^a].

[^a]: Пояснение.
`

describe('доступность GrMarkdown', () => {
  it('документ целиком проходит axe начисто', async () => {
    const wrapper = mount(GrMarkdown, {
      props: { source: DOCUMENT, ariaLabel: 'Описание релиза' },
      attachTo: document.body,
    })

    expect(await axeViolations(wrapper.element as Element)).toEqual([])
    wrapper.unmount()
  })

  it('сдвинутые заголовки не рвут иерархию', async () => {
    const wrapper = mount(GrMarkdown, {
      props: { source: '# Раз\n\n## Два\n\n### Три\n', headingOffset: 1 },
      attachTo: document.body,
    })

    expect(await axeViolations(wrapper.element as Element)).toEqual([])
    wrapper.unmount()
  })
})
