import React from 'react';
import { api, Workspace } from './api';

interface WorkspaceContextValue {
  workspaces: Workspace[];
  loading: boolean;
  error: string | null;
  index: number;
  current: Workspace | null;
  setIndex: (i: number) => void;
}

const WorkspaceContext = React.createContext<WorkspaceContextValue | null>(null);

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const [workspaces, setWorkspaces] = React.useState<Workspace[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [index, setIndex] = React.useState(0);

  React.useEffect(() => {
    api
      .workspaces()
      .then(setWorkspaces)
      .catch((err) => setError(err instanceof Error ? err.message : String(err)))
      .finally(() => setLoading(false));
  }, []);

  const value: WorkspaceContextValue = {
    workspaces,
    loading,
    error,
    index,
    current: workspaces[index] || null,
    setIndex,
  };

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

export function useWorkspaces() {
  const ctx = React.useContext(WorkspaceContext);
  if (!ctx) throw new Error('useWorkspaces must be used within a WorkspaceProvider');
  return ctx;
}
