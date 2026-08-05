import React from 'react';

export type ProjectBoardTab = 'finance' | 'tasks' | 'documents';

const TABS: Array<{ id: ProjectBoardTab; label: string; shortLabel: string }> = [
  { id: 'finance', label: 'Spending & Devis', shortLabel: 'Finance' },
  { id: 'tasks', label: 'Tasks', shortLabel: 'Tasks' },
  { id: 'documents', label: 'Documents', shortLabel: 'Docs' }
];

interface ProjectBoardTabsProps {
  activeTab: ProjectBoardTab;
  onTabChange: (tab: ProjectBoardTab) => void;
  finance: React.ReactNode;
  tasks: React.ReactNode;
  documents: React.ReactNode;
}

export function ProjectBoardTabs({
  activeTab,
  onTabChange,
  finance,
  tasks,
  documents
}: ProjectBoardTabsProps) {
  return (
    <div className="board-layout">
      <div className="project-folder">
        <nav className="project-folder-tabs" role="tablist" aria-label="Project sections">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              id={`project-tab-${tab.id}`}
              className={`project-folder-tab${activeTab === tab.id ? ' project-folder-tab-active' : ''}`}
              aria-selected={activeTab === tab.id}
              aria-controls={`project-tabpanel-${tab.id}`}
              onClick={() => onTabChange(tab.id)}
            >
              <span className="project-folder-tab-label-full">{tab.label}</span>
              <span className="project-folder-tab-label-short">{tab.shortLabel}</span>
            </button>
          ))}
        </nav>

        <div className="project-folder-panel">
          {activeTab === 'finance' && (
            <div
              id="project-tabpanel-finance"
              role="tabpanel"
              aria-labelledby="project-tab-finance"
              className="project-folder-panel-inner project-folder-panel-finance"
            >
              {finance}
            </div>
          )}
          {activeTab === 'tasks' && (
            <div
              id="project-tabpanel-tasks"
              role="tabpanel"
              aria-labelledby="project-tab-tasks"
              className="project-folder-panel-inner project-folder-panel-tasks"
            >
              {tasks}
            </div>
          )}
          {activeTab === 'documents' && (
            <div
              id="project-tabpanel-documents"
              role="tabpanel"
              aria-labelledby="project-tab-documents"
              className="project-folder-panel-inner project-folder-panel-documents"
            >
              {documents}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function readStoredProjectTab(projectId: number): ProjectBoardTab {
  try {
    const value = localStorage.getItem(`sr:projectTab:${projectId}`);
    if (value === 'finance' || value === 'tasks' || value === 'documents') {
      return value;
    }
  } catch {
    // ignore storage errors
  }
  return 'finance';
}

export function storeProjectTab(projectId: number, tab: ProjectBoardTab): void {
  try {
    localStorage.setItem(`sr:projectTab:${projectId}`, tab);
  } catch {
    // ignore storage errors
  }
}
