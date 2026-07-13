import { describe, it, expect, vi, beforeEach } from 'vitest';
import { api } from './api';

describe('api client', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('resolves with parsed JSON on a successful response', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [{ key: 'hira-institute', initials: 'HI', name: 'HIRA Institute' }],
    }) as unknown as typeof fetch;

    const workspaces = await api.workspaces();
    expect(workspaces).toEqual([{ key: 'hira-institute', initials: 'HI', name: 'HIRA Institute' }]);
    expect(fetch).toHaveBeenCalledWith('/api/workspaces', expect.objectContaining({ headers: expect.any(Object) }));
  });

  it('throws the server-provided error message on a failed response', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ error: 'workspace is required' }),
    }) as unknown as typeof fetch;

    await expect(api.analytics('')).rejects.toThrow('workspace is required');
  });

  it('falls back to a generic message when the error body is not JSON', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => {
        throw new Error('not json');
      },
    }) as unknown as typeof fetch;

    await expect(api.workspaces()).rejects.toThrow('Request failed: 500');
  });
});
