import React from 'react';

interface AuthContextValue {
  authenticated: boolean;
  loading: boolean;
  email: string | null;
  login: (email: string, password: string, remember: boolean) => Promise<void>;
  signup: (email: string, password: string, accountName: string) => Promise<void>;
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
  const [email, setEmail] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    request<{ email: string }>('auth?action=me')
      .then((r) => setEmail(r.email))
      .catch(() => setEmail(null))
      .finally(() => setLoading(false));
  }, []);

  const login = React.useCallback(async (loginEmail: string, password: string, remember: boolean) => {
    const r = await request<{ email: string }>('auth?action=login', {
      method: 'POST',
      body: JSON.stringify({ email: loginEmail, password, remember }),
    });
    setEmail(r.email);
  }, []);

  const signup = React.useCallback(async (signupEmail: string, password: string, accountName: string) => {
    const r = await request<{ email: string }>('auth?action=signup', {
      method: 'POST',
      body: JSON.stringify({ email: signupEmail, password, accountName }),
    });
    setEmail(r.email);
  }, []);

  const logout = React.useCallback(async () => {
    await request('auth?action=logout', { method: 'POST' });
    setEmail(null);
  }, []);

  const value: AuthContextValue = { authenticated: !!email, loading, email, login, signup, logout };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
