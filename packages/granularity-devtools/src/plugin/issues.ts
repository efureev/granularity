import type { CustomInspectorNode, CustomInspectorState, PluginSetupFunction } from '@vue/devtools-kit'

import type { GrIssue, GrIssueLog } from '../resolve/issues'

type DevtoolsApi = Parameters<PluginSetupFunction>[0]

const INSPECTOR_ID = 'granularity:issues'

const TAG_ERROR = { label: 'error', textColor: 0xFFFFFF, backgroundColor: 0xDC2626 }

function issueNodes(issues: GrIssue[]): CustomInspectorNode[] {
  return issues.map(issue => ({
    id: issue.key,
    label: `${issue.component ?? 'granularity'}: ${issue.message.slice(0, 60)}`,
    tags: [
      ...(issue.kind === 'error' ? [TAG_ERROR] : []),
      ...(issue.count > 1 ? [{ label: `×${issue.count}`, textColor: 0xFFFFFF, backgroundColor: 0x64748B }] : []),
    ],
  }))
}

function issueState(issues: GrIssue[], nodeId: string): CustomInspectorState {
  const issue = issues.find(item => item.key === nodeId)
  if (!issue)
    return {}

  return {
    Issue: [
      { key: 'source', value: issue.component ?? 'granularity' },
      { key: 'message', value: issue.message },
      { key: 'seen', value: issue.count },
    ],
  }
}

/**
 * Раздел «Issues»: предупреждения пакета списком.
 *
 * Собираются перехватом консоли, а не отдельным каналом: канал потребовал бы
 * правки в каждом из трёх десятков файлов ядра, а перехват — ни одной. Плата —
 * обезьяний патч глобального объекта, поэтому оригинал зовётся всегда: панель
 * добавляет список, а не заменяет консоль.
 */
export function registerIssues(api: DevtoolsApi, log: GrIssueLog): void {
  api.addInspector({
    id: INSPECTOR_ID,
    label: 'Granularity issues',
    icon: 'report_problem',
    noSelectionText: 'Design-system warnings show up here as they happen',
    actions: [{
      icon: 'delete',
      tooltip: 'Clear collected issues',
      action: () => {
        log.clear()
        api.sendInspectorTree(INSPECTOR_ID)
      },
    }],
  })

  api.on.getInspectorTree((payload: { inspectorId: string, rootNodes: unknown[] }) => {
    if (payload.inspectorId === INSPECTOR_ID)
      payload.rootNodes = issueNodes(log.list())
  })

  api.on.getInspectorState((payload: { inspectorId: string, nodeId: string, state: unknown }) => {
    if (payload.inspectorId === INSPECTOR_ID)
      payload.state = issueState(log.list(), payload.nodeId)
  })

  // Журнал наполняется в `install` независимо от панели, поэтому раздел на него
  // подписывается, а не собирает сам.
  log.subscribe(() => {
    api.sendInspectorTree(INSPECTOR_ID)
    api.sendInspectorState(INSPECTOR_ID)
  })
}
