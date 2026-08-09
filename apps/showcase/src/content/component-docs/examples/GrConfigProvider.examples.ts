import type { ShowcaseComponentExampleDoc } from '../types'

export const grConfigProviderExamples: ShowcaseComponentExampleDoc[] = [
  {
    id: 'config-provider-size',
    title: 'Default size for nested controls',
    description: '`GrConfigProvider` задаёт дефолтный `size` для всех вложенных контролов, которые его поддерживают (сейчас — `GrButton` и `GrInput`). У самих контролов проп `size` не указан — он приходит из провайдера. Локальный `size` на компоненте всегда побеждает.',
    status: 'ready',
    previewKey: 'gr-config-provider-size',    note: 'Провайдер рендерится прозрачно (`display: contents`) и не влияет на layout. Поддержку конфига компонент включает через `useGrComponentSize()` / `useGrConfig()`.',
  },
  {
    id: 'config-provider-nested',
    title: 'Nested providers merge',
    description: 'Провайдеры можно вкладывать: дочерний мержится поверх родительского. Здесь внешний задаёт `size="lg"`, а внутренний переопределяет его на `sm` только для своего поддерева — остальные значения (`componentDefaults`, i18n) наследуются.',
    status: 'ready',
    previewKey: 'gr-config-provider-nested',  },
  {
    id: 'config-provider-defaults',
    title: 'Default props per component',
    description: '`componentDefaults` задаёт дефолтные пропсы по имени компонента: оформление всего поддерева описывается одним объектом, а у самих компонентов пропы не указаны. Локальный проп всегда побеждает конфиг. Набор настраиваемых пропов закрытый (`GrButton` — `variant`/`tone`/`size`/`square`, `GrInput` — `size`/`clearable`, `GrBadge` — `tone`/`size`/`radius`): через конфиг настраивается оформление, но не `modelValue` и не обработчики.',
    status: 'ready',
    previewKey: 'gr-config-provider-defaults',    note: 'Чтобы компонент умел читать конфиг, его настраиваемый проп обязан иметь дефолт `undefined`, а «настоящий» дефолт — жить в резолвере `useGrComponentProp`. Иначе Vue подставит дефолт раньше, чем компонент заглянет в конфиг, и отличить «пользователь передал значение» от «сработал дефолт» будет невозможно.',
  },
  {
    id: 'config-provider-dialog',
    title: 'Imperative dialogs inherit the config',
    description: '`useDialogService` монтирует хост в `body`, вне дерева компонентов, — обычный `inject` туда не дотягивается. Пакет закрывает это сам: сервис захватывает конфиг в момент вызова `useDialogService()`, и диалог получает те же дефолты, что и контролы вокруг. От приложения ничего не требуется.',
    status: 'ready',
    previewKey: 'gr-config-provider-dialog',    note: 'Захват происходит в `useDialogService()`, а не при вызове `confirm()`. Поэтому сервис нужно получать в `setup` компонента, находящегося внутри провайдера: сервис-синглтон из модуля или стора дерева не видит и откатится на дефолты компонентов. Приоритет внутри диалога: опции вызова → `useDialogService(defaults)` → провайдер → дефолты компонентов.',
  },
  {
    id: 'config-provider-read',
    title: 'Read the config in your own component',
    description: 'Любой компонент читает конфиг ближайшего провайдера через `useGrConfig()` — так подключаются собственные контролы. Провайдер отдаёт `size` и `componentDefaults` (per-component дефолтные пропсы); вне провайдера всё разрешается в fallback-значения.',
    status: 'ready',
    previewKey: 'gr-config-provider-read',    note: 'Провайдер также принимает проп `i18n` — адаптер переводов прокидывается вложенным компонентам через общий inject-ключ (иначе приложение инжектит его вручную).',
  },
  {
    id: 'config-provider-theme-island',
    title: 'Theme island (including teleported panels)',
    description: 'Проп `theme` кладёт `data-theme` на обёртку провайдера — тёмный остров внутри светлой страницы работает без дополнительных стилей, потому что темы объявлены атрибутным селектором. Панели селекта и дропдауна телепортируются в `body`, вне обёртки, и всё равно остаются тёмными: в дереве компонентов они внутри, поэтому тему берут из контекста и ставят себе сами.',
    status: 'ready',
    previewKey: 'gr-config-provider-theme-island',  },
]
