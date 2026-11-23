import { useState, useCallback } from 'react';
import type { LifestyleProfile } from '../types/profile';
import { DEFAULT_LIFESTYLE_PROFILE, getStoredProfile, setStoredProfile } from '../utils/storage';

export interface UseLifestyleProfileResult {
  readonly profile: LifestyleProfile;
  readonly updateProfile: (partial: Partial<LifestyleProfile>) => void;
  readonly resetProfile: () => void;
}

/**
 * Hook for reading and mutating the user's family and community profile.
 */
export function useLifestyleProfile(): UseLifestyleProfileResult {
  const [profile, setProfileState] = useState<LifestyleProfile>(getStoredProfile);

  const updateProfile = useCallback((partial: Partial<LifestyleProfile>): void => {
    setProfileState((prev) => {
      const updated: LifestyleProfile = { ...prev, ...partial };
      setStoredProfile(updated);
      return updated;
    });
  }, []);

  const resetProfile = useCallback((): void => {
    setProfileState(DEFAULT_LIFESTYLE_PROFILE);
    setStoredProfile(DEFAULT_LIFESTYLE_PROFILE);
  }, []);

  return {
    profile,
    updateProfile,
    resetProfile,
  };
}
