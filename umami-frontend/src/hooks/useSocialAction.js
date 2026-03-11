import { useState, useCallback } from 'react';

/**
 * Custom hook for social actions (follow, like, bookmark) with optimistic UI updates.
 * @param {boolean} initialActive - Initial state of the action.
 * @param {Function} apiCall - The function that performs the actual API request.
 * @returns {object} - { isActive, isLoading, error, toggle }
 */
export const useSocialAction = (initialActive, apiCall) => {
  const [isActive, setIsActive] = useState(initialActive);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const toggle = useCallback(async (...args) => {
    const previousState = isActive;
    
    // Optimistic Update
    setIsActive(!previousState);
    setIsLoading(true);
    setError(null);

    try {
      await apiCall(!previousState, ...args);
      setIsLoading(false);
    } catch (err) {
      // Revert on failure
      setIsActive(previousState);
      setError(err.message || 'Action failed');
      setIsLoading(false);
      throw err;
    }
  }, [isActive, apiCall]);

  return { isActive, isLoading, error, toggle };
};
