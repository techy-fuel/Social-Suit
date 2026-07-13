import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useApi } from './hooks';

describe('useApi', () => {
  it('resolves data and clears loading', async () => {
    const fetcher = vi.fn().mockResolvedValue({ hello: 'world' });
    const { result } = renderHook(() => useApi(fetcher, []));

    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.data).toEqual({ hello: 'world' });
    expect(result.current.error).toBeNull();
  });

  it('captures a rejected fetch as an error', async () => {
    const fetcher = vi.fn().mockRejectedValue(new Error('boom'));
    const { result } = renderHook(() => useApi(fetcher, []));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe('boom');
    expect(result.current.data).toBeNull();
  });

  it('refetch re-invokes the fetcher', async () => {
    const fetcher = vi.fn().mockResolvedValue('ok');
    const { result } = renderHook(() => useApi(fetcher, []));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(fetcher).toHaveBeenCalledTimes(1);

    act(() => result.current.refetch());
    await waitFor(() => expect(fetcher).toHaveBeenCalledTimes(2));
  });
});
