import { computed } from 'vue'

import {useFintI18n, useI18nScope} from '@feugene/fint-i18n/vue'

import {
    featuredComponentTitles,
    featuredDirectiveTitles,
    featuredUtilityTitles,
    showcaseComponentEntities,
    showcaseComposableEntities,
    showcaseDirectiveEntities,
    showcaseUtilityEntities,
} from './showcaseEntities.ts'
import {
    showcasePages,
} from './showcasePages.ts'
import type {
    ShowcasePage,
    ShowcasePageName,
    ShowcaseSection,
} from './showcaseModel.ts'
import type {
    ShowcaseEntityRegistryItem,
    ShowcaseExampleMeta,
} from '../content/model.ts'

const showcaseStaticPageRecord = Object.fromEntries(
    showcasePages.map(page => [page.name, page]),
) as Record<ShowcasePageName, ShowcasePage>

const componentGroupTranslationKeys: Record<string, string> = {
    actions: 'actions',
    feedback: 'feedback',
    navigation: 'navigation',
    overlays: 'overlays',
    forms: 'forms',
    data: 'data',
    misc: 'misc',
}

const packageGroupTranslationKeys: Record<string, string> = {
    overlays: 'overlays',
    feedback: 'feedback',
    runtime: 'runtime',
    validation: 'validation',
    ungrouped: 'general',
}

function normalizeLabel(value: string) {
    return value
        .replace(/[-_]+/g, ' ')
        .replace(/\b\w/g, char => char.toUpperCase())
}

export function useShowcasePageI18n() {
    const i18n = useFintI18n()
    const { t } = i18n

    // Значения, которые подставляются в динамические буллеты секций (списки
    // featured-сущностей и их счётчики). Соединительный союз локале-зависим,
    // поэтому список из 2+ элементов склеивается через локализованный разделитель.
    const sectionParams = computed(() => {
        const conjunction = i18n.locale.value === 'ru' ? ' и ' : ' and '

        return {
            componentTitles: featuredComponentTitles.join(', '),
            directiveTitles: featuredDirectiveTitles.join(conjunction),
            utilityTitles: featuredUtilityTitles.join(conjunction),
            componentCount: showcaseComponentEntities.length,
            directiveList: showcaseDirectiveEntities.map(entity => entity.title).join(', '),
            composableList: showcaseComposableEntities.map(entity => entity.title).join(conjunction),
            utilityCount: showcaseUtilityEntities.length,
        }
    })

    function translateWithFallback(key: string, fallback: string, params?: Record<string, unknown>) {
        const result = t(key, params)
        return result === key ? fallback : result
    }

    function localizeSection(pageName: ShowcasePageName, section: ShowcaseSection): ShowcaseSection {
        const baseKey = `showcase.pages.${pageName}.sections.${section.id}`
        const params = sectionParams.value

        return {
            ...section,
            title: translateWithFallback(`${baseKey}.title`, section.title),
            description: translateWithFallback(`${baseKey}.description`, section.description),
            bullets: section.bullets.map((bullet, index) => {
                return translateWithFallback(`${baseKey}.bullets.${index}`, bullet, params)
            }),
        }
    }

    function localizeSections(pageName: ShowcasePageName, sections: ShowcaseSection[]) {
        return sections.map(section => localizeSection(pageName, section))
    }

    function localizePage(page: ShowcasePage): ShowcasePage {
        const baseKey = `showcase.pages.${page.name}`

        return {
            ...page,
            title: translateWithFallback(`${baseKey}.title`, page.title),
            shortTitle: translateWithFallback(`${baseKey}.shortTitle`, page.shortTitle),
            eyebrow: translateWithFallback(`${baseKey}.eyebrow`, page.eyebrow),
            description: translateWithFallback(`${baseKey}.description`, page.description),
            sections: localizeSections(page.name, page.sections),
        }
    }

    function localizePageByName(pageName: ShowcasePageName) {
        return localizePage(showcaseStaticPageRecord[pageName])
    }

    // Сводки и example-метаданные сущностей задаются в `content/handAuthored.ts`
    // как fallback (базовая локаль en). Переводы живут в блоке `showcase`
    // (`showcase.entitySummaries.<kind>.<name>` и
    // `showcase.entityExamples.<kind>.<name>.<exampleId>.{title,description}`) и
    // накладываются на реестр в момент рендера — так же, как это уже сделано для
    // страниц/секций и example-карточек компонентов.
    function localizeEntitySummary(entity: ShowcaseEntityRegistryItem): string {
        return translateWithFallback(
            `showcase.entitySummaries.${entity.kind}.${entity.name}`,
            entity.summary,
        )
    }

    function localizeEntityExamples(entity: ShowcaseEntityRegistryItem): ShowcaseExampleMeta[] {
        return entity.examples.map((example) => {
            // Планируемый example генерируется динамически в `applyHandAuthoredEntityMetadata`
            // (id `<name>-planned-primary`), поэтому у него нет собственного ключа —
            // используем общий параметризованный ключ с подстановкой имени сущности.
            const isPlanned = example.id === `${entity.name}-planned-primary`
            const baseKey = `showcase.entityExamples.${entity.kind}.${entity.name}.${example.id}`

            return {
                ...example,
                title: isPlanned
                    ? translateWithFallback('showcase.entityExamples.plannedTitle', example.title)
                    : translateWithFallback(`${baseKey}.title`, example.title),
                description: isPlanned
                    ? translateWithFallback('showcase.entityExamples.plannedDescription', example.description, { name: entity.title })
                    : translateWithFallback(`${baseKey}.description`, example.description),
            }
        })
    }

    function localizeEntity(entity: ShowcaseEntityRegistryItem): ShowcaseEntityRegistryItem {
        return {
            ...entity,
            summary: localizeEntitySummary(entity),
            examples: localizeEntityExamples(entity),
        }
    }

    function getEntityGroupLabel(pageName: ShowcasePageName, group: string) {
        const translationKey = pageName === 'components'
            ? componentGroupTranslationKeys[group]
            : packageGroupTranslationKeys[group]

        if (!translationKey) {
            return normalizeLabel(group)
        }

        return translateWithFallback(`showcase.groups.${translationKey}`, normalizeLabel(group))
    }

    return {
        localizePage,
        localizePageByName,
        localizeSections,
        localizeEntity,
        localizeEntitySummary,
        localizeEntityExamples,
        getEntityGroupLabel,
        useI18nScope,
    }
}
