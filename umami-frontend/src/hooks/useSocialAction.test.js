import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useSocialAction } from './useSocialAction';

describe('useSocialAction Hook', () => {
  const mockApiCall = vi.fn();

  it('updates state optimistically', async () => {
    mockApiCall.mockResolvedValue({ success: true });
    const { result } = renderHook(() => useSocialAction(false, mockApiCall));

    expect(result.current.isActive).toBe(false);

    let promise;
    act(() => {
      promise = result.current.toggle();
    });

    // Should be true immediately (optimistic)
    expect(result.current.isActive).toBe(true);
    expect(result.current.isLoading).toBe(true);

    await act(async () => {
      await promise;
    });

    expect(result.current.isActive).toBe(true);
    expect(result.current.isLoading).toBe(false);
  });

  it('reverts state on API failure', async () => {
    mockApiCall.mockRejectedValue(new Error('API Error'));
    const { result } = renderHook(() => useSocialAction(false, mockApiCall));

    act(() => {
      result.current.toggle().catch(() => {});
    });

    // Optimistic update
    expect(result.current.isActive).toBe(true);

    await act(async () => {
      // Wait for rejection
    });

    // Reverted
    expect(result.current.isActive).toBe(false);
    expect(result.current.error).toBe('API Error');
  });
});
