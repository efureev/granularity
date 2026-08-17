import type {
  ShowcaseEntityMetadataOverride,
  ShowcaseEntityRegistryItem,
} from './model.ts'

const componentGroups = {
  actions: ['GrButton', 'GrButtonGroup', 'GrLink'],
  feedback: ['GrAlert', 'GrBadge', 'GrBadgeWrap', 'GrEmptyState', 'GrLoading', 'GrProgressBar', 'GrProgressCircle', 'GrResponseErrorBanner', 'GrSkeleton', 'GrToaster'],
  navigation: ['GrBottomNav', 'GrBreadcrumbs', 'GrCommandPalette', 'GrNavbar', 'GrPagination', 'GrSidebar', 'GrTabs', 'GrTabPanels', 'GrTooltip'],
  overlays: ['GrCollapse', 'GrConfirmDialog', 'GrDialog', 'GrDrawer', 'GrDropdown', 'GrDropdownMenu', 'GrImageViewer', 'GrModal', 'GrPopover', 'GrPromptDialog'],
  forms: ['GrAutocomplete', 'GrCheckbox', 'GrCheckboxGroup', 'GrColorPicker', 'GrFileUpload', 'GrForm', 'GrFormFile', 'GrFormField', 'GrFormSection', 'GrInput', 'GrNumberInput', 'GrInputTag', 'GrRadio', 'GrRadioGroup', 'GrRating', 'GrSegmented', 'GrSelect', 'GrSlider', 'GrSwitch', 'GrTextarea', 'GrTreeSelect'],
  data: ['GrAvatar', 'GrCard', 'GrCodeBlock', 'GrFilePreview', 'GrDataTable', 'GrDelta', 'GrDescriptionList', 'GrDivider', 'GrIcon', 'GrJsonViewer', 'GrKbd', 'GrList', 'GrSortableList', 'GrStatistic', 'GrTable', 'GrTimeline', 'GrTree', 'GrValue'],
  utilities: ['GrConfigProvider', 'GrSplitter'],
} as const satisfies Record<string, readonly string[]>

export const componentGroupOrder: readonly string[] = [...Object.keys(componentGroups), 'misc']

// Fallback-сводки компонентов (базовая локаль en). Переводы — в блоке `showcase`
// (`showcase.entitySummaries.component.<name>`), накладываются при рендере через
// `useShowcasePageI18n().localizeEntity` / `localizeEntitySummary`.
const componentSummaryOverrides = {
  GrAlert: 'Shows an important message, warning or action status.',
  GrAutocomplete: 'A combobox with type-ahead search over options, async loading and multi-select chips.',
  GrAvatar: 'Displays a user photo, or initials / a fallback when it is missing.',
  GrBadge: 'A short label for a status, category or counter.',
  GrBadgeWrap: 'Adds a status or count badge on top of an element.',
  GrBottomNav: 'Bottom navigation for the key sections of a mobile interface.',
  GrBreadcrumbs: 'Shows where the user is and lets them step back up the path.',
  GrButton: 'Triggers the primary action in a form, dialog or panel.',
  GrButtonGroup: 'Groups related buttons into a compact action cluster.',
  GrCard: 'A container for a meaningful block of content and actions.',
  GrColorPicker: 'Picks a color for theme and branding settings: hue, saturation, lightness and opacity sliders, a hex field and a palette.',
  GrConfigProvider: 'Provides global defaults (control size, per-component props, i18n) to nested components — imperative dialogs included.',
  GrDivider: 'Separates content with a line, optionally with a centered label.',
  GrKbd: 'Displays a keyboard key or shortcut in a `<kbd>` element.',
  GrTabPanels: 'Renders tab panels linked to `GrTabs` by ARIA for accessible tabs.',
  GrCheckbox: 'Lets you toggle independent options and select multiple items.',
  GrCheckboxGroup: 'Collects checkboxes into one multi-select field with a shared model and states.',
  GrCollapse: 'Collapses and expands additional content on demand.',
  GrConfirmDialog: 'Asks to confirm a potentially important or dangerous action.',
  GrDataTable: 'A table for large data sets with sorting and filtering.',
  GrDialog: 'A dialog for confirmations, forms and focused scenarios.',
  GrDrawer: 'A sliding panel for secondary content and quick actions.',
  GrDropdown: 'Opens a floating list of actions or options next to the trigger.',
  GrDropdownMenu: 'A ready-made actions menu for a button, link or context invocation.',
  GrEmptyState: 'Explains an empty state and suggests the user’s next step.',
  GrFileUpload: 'Accepts files via selection or drag-and-drop and shows their state.',
  GrFormFile: 'Binds file uploads to a form field and validation.',
  GrForm: 'Orchestrates form validation via declarative rules and the GrFormField context.',
  GrFormField: 'Combines label, control, hint and error into a single field.',
  GrFormSection: 'Groups related form fields into a clear, meaningful section.',
  GrIcon: 'Renders an icon as a standalone interface element.',
  GrImageViewer: 'Opens an image in a convenient viewing and zooming mode.',
  GrInput: 'A single-line field for text, search and short values.',
  GrInputTag: 'Lets you enter and edit a list of tags or values.',
  GrLink: 'A navigation link for moving between pages and resources.',
  GrList: 'Displays a vertical list of uniform items or actions.',
  GrTimeline: 'Shows a chronological feed of events with an axis, markers and day headings.',
  GrLoading: 'Indicates that a section or action is currently loading.',
  GrModal: 'A modal window for an important scenario that temporarily blocks the background.',
  GrNavbar: 'Top navigation for the main sections and global actions.',
  GrNumberInput: 'A number field with stepper controls and range constraints.',
  GrPagination: 'Splits a long list into pages and manages navigation between them.',
  GrPopover: 'An anchored panel for a short form, settings or a confirmation right next to the trigger.',
  GrProgressBar: 'Shows the progress of a task or a loading process.',
  GrProgressCircle: 'Shows progress as a ring or a gauge, with the value in the middle.',
  GrPromptDialog: 'Requests a short text input from the user in a dialog.',
  GrRadio: 'A single choice within a group of mutually exclusive options.',
  GrRadioGroup: 'Combines radio options into a single-choice selection flow.',
  GrResponseErrorBanner: 'A universal generic banner for server or network response errors: it takes a raw error/response, runs it through a chain of parsers (HTTP statuses, Laravel/JSON:API/RFC 7807 validation, file/network/abort) and renders a title, main message, an optional list of per-field details and retry/dismiss actions — without knowing anything about a specific feature (file upload, forms, transactions).',
  GrSegmented: 'A compact single-choice control with a pills/button presentation and a moving selection indicator.',
  GrSelect: 'Selection of one or several values from a list of options.',
  GrSidebar: 'Side navigation for sections, filters and supporting actions.',
  GrSkeleton: 'A temporary interface skeleton while the content is still loading.',
  GrSlider: 'Pick a number or a range by dragging a thumb, with steps, marks and keyboard support.',
  GrSortableList: 'Let people reorder a list by dragging — or entirely from the keyboard, announced as they go.',
  GrSplitter: 'Splits a layout into two resizable panels with a draggable divider.',
  GrRating: 'Collect and display a star rating, with half steps and a read-only mode.',
  GrStatistic: 'Highlights a key metric with a caption, formatting and a trend line.',
  GrCodeBlock: 'Shows raw JSON or text with highlighting, line numbers and a copy button.',
  GrJsonViewer: 'Walks an unknown value as a tree: collapsible nodes, search by key or value, copy a node with its path.',
  GrFilePreview: 'Shows a stored file as a tile: the image itself, or an icon for its type.',
  GrDelta: 'Shows a signed value with its sign, tone and arrow inline in a sentence.',
  GrDescriptionList: 'Lists label-value pairs as a real description list, values aligned in a column.',
  GrCommandPalette: 'Opens a ⌘K search over app commands with groups and shortcuts.',
  GrSwitch: 'Quickly turns a binary setting on and off.',
  GrTable: 'A simple table for compact display of structured data.',
  GrTabs: 'Switches between related content sections without leaving the page.',
  GrTextarea: 'A multi-line field for long text and comments.',
  GrToaster: 'Shows brief pop-up notifications about the result of actions.',
  GrTooltip: 'Shows a short hint on hover or focus.',
  GrTree: 'Shows a hierarchy of items with node expansion and selection.',
  GrTreeSelect: 'Selection of a value from a tree structure in a single control.',
  GrValue: 'A quantity with its affixes: prefix, value, suffix — and nothing else.',
} as const satisfies Record<string, string>

export function resolveHandAuthoredComponentGroup(componentName: string): string {
  for (const [group, componentNames] of Object.entries(componentGroups)) {
    if ((componentNames as readonly string[]).includes(componentName))
      return group
  }

  return 'misc'
}

export const showcaseEntityMetadataOverrides: Record<string, ShowcaseEntityMetadataOverride> = {
  'component:GrConfigProvider': {
    group: 'utilities',
    tags: ['featured'],
  },
  'component:GrButton': {
    group: 'actions',
    tags: ['featured', 'starter'],
    examples: [
      {
        id: 'button-loading',
        title: 'Loading and icon-only',
        description: 'A separate scenario for the loading state and icon-only buttons.',
        status: 'planned',
      },
    ],
  },
  'component:GrFileUpload': {
    group: 'forms',
    tags: ['featured', 'integration'],
    examples: [
      {
        id: 'file-upload-validation',
        title: 'Validation bridge',
        description: 'We show how `GrFileUpload` connects to validator utilities and real error states.',
        status: 'planned',
      },
    ],
  },
  'component:GrAutocomplete': {
    group: 'forms',
    tags: ['featured', 'complex'],
  },
  'component:GrForm': {
    group: 'forms',
    tags: ['featured', 'complex'],
  },
  'component:GrSlider': {
    group: 'forms',
    tags: ['featured'],
  },
  'component:GrSortableList': {
    group: 'data',
    tags: ['new'],
  },
  'component:GrColorPicker': {
    group: 'forms',
    tags: ['new'],
  },
  'component:GrRating': {
    group: 'forms',
    tags: ['featured'],
  },
  'component:GrBreadcrumbs': {
    group: 'navigation',
  },
  'component:GrStatistic': {
    group: 'data',
  },
  'component:GrFilePreview': {
    group: 'data',
    tags: ['new'],
  },
  'component:GrCodeBlock': {
    group: 'data',
    tags: ['new'],
  },
  'component:GrJsonViewer': {
    group: 'data',
    tags: ['new'],
  },
  'component:GrDelta': {
    group: 'data',
    tags: ['new'],
  },
  'component:GrValue': {
    group: 'data',
    tags: ['new'],
  },
  'component:GrDescriptionList': {
    group: 'data',
    tags: ['new'],
  },
  'component:GrTimeline': {
    group: 'data',
    tags: ['new'],
  },
  'component:GrCommandPalette': {
    group: 'navigation',
    tags: ['featured', 'complex'],
  },
  'component:GrSelect': {
    group: 'forms',
    tags: ['featured', 'complex'],
    examples: [
      {
        id: 'select-modes',
        title: 'Single, multiple and clearable',
        description: 'We plan to split the main `GrSelect` modes into separate demo cards.',
        status: 'planned',
      },
    ],
  },
  'directive:vLoading': {
    summary: 'A key directive for overlay/loading scenarios and the companion API `createLoading`.',
    group: 'overlays',
    tags: ['featured'],
    examples: [
      {
        id: 'directive-loading-overlay',
        title: 'Element loading overlay',
        description: 'We show a loading overlay on real elements and containers.',
        status: 'planned',
      },
    ],
  },
  'directive:createLoading': {
    summary: 'A helper API alongside `vLoading` that needs a separate demonstration of imperative scenarios.',
    group: 'overlays',
    tags: ['featured'],
  },
  'composable:useAnnouncer': {
    summary: 'One `aria-live` channel for the whole app: announce «copied», «row deleted» or «12 results» to a screen reader from any place in the code, with no markup of your own.',
    group: 'runtime',
    tags: ['featured', 'a11y'],
    examples: [
      {
        id: 'use-announcer-polite',
        title: 'Polite announcement',
        description: 'A transient event with nowhere to render: the clipboard copy is announced and nothing changes on screen.',
        status: 'ready',
      },
      {
        id: 'use-announcer-assertive',
        title: 'Assertive announcement',
        description: 'A failure interrupts speech — reserved for what must not be missed.',
        status: 'ready',
      },
      {
        id: 'use-announcer-results',
        title: 'Filter results with auto-clear',
        description: 'The result count is announced and wiped afterwards so a virtual cursor never meets a stale number.',
        status: 'ready',
      },
    ],
  },
  'composable:useTheme': {
    summary: 'The composables showcase already uses `useTheme()` in the app shell, so it becomes the first runnable recipe.',
    group: 'runtime',
    tags: ['featured', 'shell'],
    examples: [
      {
        id: 'use-theme-runtime',
        title: 'Runtime theme switch',
        description: 'We demonstrate early theme initialization and runtime UI switching.',
        status: 'planned',
      },
    ],
  },
  'composable:useToast': {
    summary: 'A toast orchestration composable for future feedback/demo scenarios.',
    group: 'feedback',
    tags: ['featured'],
    examples: [
      {
        id: 'use-toast-push-dismiss',
        title: 'Push, dismiss and clear',
        description: 'Toast notification lifecycle scenarios are planned.',
        status: 'planned',
      },
    ],
  },
  'composable:useDialogService': {
    summary: 'An imperative dialog service (in the spirit of `ElMessageBox`): `confirm` / `prompt` / `alert` are called straight from `<script>`/`.ts` without inserting a component into the template and return a Promise.',
    group: 'overlays',
    tags: ['featured'],
    examples: [
      {
        id: 'use-dialog-service-confirm',
        title: 'Imperative confirm',
        description: 'Confirming a destructive action from JS without a declarative component.',
        status: 'ready',
      },
      {
        id: 'use-dialog-service-prompt',
        title: 'Imperative prompt',
        description: 'Requesting a string with required validation and a Promise result.',
        status: 'ready',
      },
      {
        id: 'use-dialog-service-alert',
        title: 'Imperative alert',
        description: 'An informational dialog with a single confirm button.',
        status: 'ready',
      },
      {
        id: 'use-dialog-service-nested',
        title: 'Nested confirm on top',
        description: 'A dialog opened from another dialog\'s `onConfirm` stacks on top instead of waiting behind the call that awaits it.',
        status: 'ready',
      },
      {
        id: 'use-dialog-service-network',
        title: 'Async onConfirm with network errors',
        description: 'Loading, server validation (HTTP 422) and a network drop handled through `ctx.setRawError` without closing the dialog.',
        status: 'ready',
      },
    ],
  },
  'utility:runFileValidators': {
    summary: 'The main orchestration utility for the file validation pipeline.',
    group: 'validation',
    tags: ['featured', 'integration'],
    examples: [
      {
        id: 'run-file-validators-pipeline',
        title: 'Validation pipeline',
        description: 'We show chained file checks and error aggregation.',
        status: 'planned',
      },
    ],
  },
  'utility:acceptValidator': {
    summary: 'A basic validator for `accept` restrictions when selecting files.',
    group: 'validation',
    tags: ['featured'],
  },
}

export function applyHandAuthoredEntityMetadata(
  entity: ShowcaseEntityRegistryItem,
): ShowcaseEntityRegistryItem {
  const override = showcaseEntityMetadataOverrides[entity.id]
  const defaultGroup = entity.kind === 'component'
    ? resolveHandAuthoredComponentGroup(entity.name)
    : entity.group
  const defaultSummary = entity.kind === 'component'
    ? (componentSummaryOverrides as Record<string, string>)[entity.name] ?? entity.summary
    : entity.summary

  return {
    ...entity,
    group: override?.group ?? defaultGroup,
    summary: override?.summary ?? defaultSummary,
    tags: [...new Set([...(entity.tags ?? []), ...(override?.tags ?? [])])],
    examples: override?.examples?.length
      ? override.examples
      : entity.examples.length
        ? entity.examples
        : [
            {
              id: `${entity.name}-planned-primary`,
              title: 'Planned demo coverage',
              description: `A dedicated showcase scenario for ${entity.name} will be added in the next stages.`,
              status: 'planned',
            },
          ],
  }
}
