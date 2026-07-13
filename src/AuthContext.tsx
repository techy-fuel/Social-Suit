import React from 'react';

interface AuthContextValue {
  authenticated: boolean;
  loading: boolean;
  username: string | null;
  login: (username: string, password: string, remember: boolean) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = React.createContext<AuthContextValue | null>(null);

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`/api/${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options?.headers || {}) },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }
  return res.json();
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [username, setUsername] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    request<{ username: string }>('me')
      .then((r) => setUsername(r.username))
      .catch(() => setUsername(null))
      .finally(() => setLoading(false));
  }, []);

  const login = React.useCallback(async (u: string, password: string, remember: boolean) => {
    const r = await request<{ username: string }>('login', {
      method: 'POST',
      body: JSON.stringify({ username: u, password, remember }),
    });
    setUsername(r.username);
  }, []);

  const logout = React.useCallback(async () => {
    await request('logout', { method: 'POST' });
    setUsername(null);
  }, []);

  const value: AuthContextValue = { authenticated: !!username, loading, username, login, logout };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
