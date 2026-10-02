import { renderHook } from '@testing-library/react-native';
import { useFocusEffect } from 'expo-router';
import { useRefetchOnFocus } from './use-refetch-on-focus';

jest.mock('expo-router', () => ({ useFocusEffect: jest.fn() }));

/** Render the hook and return a function that simulates the screen gaining focus. */
async function renderFocusable(refetch: () => unknown, enabled?: boolean) {
  let focus: () => void = () => undefined;
  jest.mocked(useFocusEffect).mockImplementation((effect) => {
    focus = () => void effect();
  });
  await renderHook(() => useRefetchOnFocus(refetch, enabled));
  return () => focus();
}

describe('useRefetchOnFocus', () => {
  it('skips the first focus (the query just fetched on mount), then refetches on every return', async () => {
    const refetch = jest.fn();
    const focus = await renderFocusable(refetch);

    focus();
    expect(refetch).not.toHaveBeenCalled();
    focus();
    focus();
    expect(refetch).toHaveBeenCalledTimes(2);
  });

  it('does nothing while the query is disabled', async () => {
    const refetch = jest.fn();
    const focus = await renderFocusable(refetch, false);

    focus();
    focus();
    expect(refetch).not.toHaveBeenCalled();
  });
});
