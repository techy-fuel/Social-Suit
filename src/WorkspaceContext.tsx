import React from 'react';
import { api, Workspace } from './api';
import { useAuth } from './AuthContext';

interface WorkspaceContextValue {
  workspaces: Workspace[];
  loading: boolean;
  error: string | null;
  index: number;
  current: Workspace | null;
  setIndex: (i: number) => void;
  createWorkspace: (name: string) => Promise<void>;
}

const WorkspaceContext = React.createContext<WorkspaceContextValue | null>(null);

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const { authenticated } = useAuth();
  const [workspaces, setWorkspaces] = React.useState<Workspace[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [index, setIndex] = React.useState(0);

  React.useEffect(() => {
    if (!authenticated) {
      setWorkspaces([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    api
      .workspaces()
      .then(setWorkspaces)
      .catch((err) => setError(err instanceof Error ? err.message : String(err)))
      .finally(() => setLoading(false));
  }, [authenticated]);

  const createWorkspace = React.useCallback(async (name: string) => {
    const ws = await api.createWorkspace(name);
    setWorkspaces((prev) => {
      const next = [...prev, ws];
      setIndex(next.length - 1);
      return next;
    });
  }, []);

  const value: WorkspaceContextValue = {
    workspaces,
    loading,
    error,
    index,
    current: workspaces[index] || null,
    setIndex,
    createWorkspace,
  };

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

export function useWorkspaces() {
  const ctx = React.useContext(WorkspaceContext);
  if (!ctx) throw new Error('useWorkspaces must be used within a WorkspaceProvider');
  return ctx;
}
