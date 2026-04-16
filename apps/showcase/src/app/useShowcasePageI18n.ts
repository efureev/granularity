import {useFintI18n, useI18nScope} from '@feugene/fint-i18n/vue'

import {
    showcasePages,
} from './showcasePages.ts'
import type {
    ShowcasePage,
    ShowcasePageName,
    ShowcaseSection,
} from './showcaseModel.ts'

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
    const { t } = useFintI18n()

    function translateWithFallback(key: string, fallback: string) {
        const result = t(key)
        return result === key ? fallback : result
    }

    function localizeSection(pageName: ShowcasePageName, section: ShowcaseSection): ShowcaseSection {
        const baseKey = `showcase.pages.${pageName}.sections.${section.id}`

        return {
            ...section,
            title: translateWithFallback(`${baseKey}.title`, section.title),
            description: translateWithFallback(`${baseKey}.description`, section.description),
            bullets: section.bullets.map((bullet, index) => {
                return translateWithFallback(`${baseKey}.bullets.${index}`, bullet)
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
        getEntityGroupLabel,
        useI18nScope,
    }
}