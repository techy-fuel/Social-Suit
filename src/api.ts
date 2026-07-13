import type { Platform } from './components/data/PlatformIcon';

export interface Workspace {
  key: string;
  initials: string;
  name: string;
}

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

export const api = {
  workspaces: () => request<Workspace[]>('workspaces'),

  createWorkspace: (name: string) => request<Workspace>('workspaces', { method: 'POST', body: JSON.stringify({ name }) }),

  analytics: (workspace: string) => request<{
    stats: { key: string; label: string; value: string; delta: string; timeframe: string }[];
    growthSeries: { value: number }[];
    followersByCountry: { label: string; value: number }[];
    followersByCity: { city: string; country: string; followers: string }[];
    platformPosts: { platform: Platform; label: string; posts: number; reach: string }[];
  }>(`analytics?workspace=${encodeURIComponent(workspace)}`),

  calendar: (workspace: string) => request<{
    scheduledPosts: { id: number; day: number; hour: number; time: string; platform: Platform; caption: string; status: string }[];
    heatmap: { day: number; hour: number; value: number }[];
  }>(`calendar?workspace=${encodeURIComponent(workspace)}`),

  scheduleCalendarPost: (workspace: string, post: { day: number; hour: number; time: string; platform: Platform; caption: string }) =>
    request(`calendar?workspace=${encodeURIComponent(workspace)}`, { method: 'POST', body: JSON.stringify(post) }),

  connections: (workspace: string) => request<{ id: number; platform: Platform; label: string; status: string; account: string | null }[]>(
    `connections?workspace=${encodeURIComponent(workspace)}`
  ),

  updateConnection: (id: number, status: string) =>
    request(`connections`, { method: 'POST', body: JSON.stringify({ id, status }) }),

  conversations: (workspace: string) => request<{ id: number; platform: Platform; name: string; preview: string; time: string; unread: boolean; resolved: boolean }[]>(
    `conversations?workspace=${encodeURIComponent(workspace)}`
  ),

  replyToConversation: (id: number, reply: string) =>
    request(`conversations`, { method: 'POST', body: JSON.stringify({ id, reply }) }),

  smartlinks: (workspace: string) => request<{ id: number; label: string; clicks: number }[]>(
    `smartlinks?workspace=${encodeURIComponent(workspace)}`
  ),

  addSmartlink: (workspace: string, label: string) =>
    request(`smartlinks`, { method: 'POST', body: JSON.stringify({ workspace, label }) }),

  ads: (workspace: string) => request<{ id: number; channel: string; name: string; status: string; spend: number; budget: number }[]>(
    `ads?workspace=${encodeURIComponent(workspace)}`
  ),

  reports: (workspace: string) => request<{ id: number; name: string; kind: string; date: string; status: string }[]>(
    `reporting?workspace=${encodeURIComponent(workspace)}`
  ),

  createReport: (workspace: string, name: string, kind: string) =>
    request(`reporting`, { method: 'POST', body: JSON.stringify({ workspace, name, kind }) }),

  trackerSessions: (workspace: string) => request<{ id: number; hashtag: string; platform: string; status: string; started: string; mentions: number }[]>(
    `tracker?workspace=${encodeURIComponent(workspace)}`
  ),

  startTracking: (workspace: string, hashtag: string, platform: string, duration: string) =>
    request(`tracker`, { method: 'POST', body: JSON.stringify({ workspace, hashtag, platform, duration }) }),
};
