import { DEFAULT_LOCATION, QUICK_CITIES } from '@/constants/cities';
import { SavedLocation, UserPreferences } from '@/types/user';

const PREFERENCES_STORAGE_KEY = 'airaware_user_preferences_v1';

export const INITIAL_PREFERENCES: UserPreferences = {
  preferredLocation: DEFAULT_LOCATION,
  recentLocations: QUICK_CITIES.slice(0, 5),
  activity: 'walking',
  sensitivity: 'general',
  aqiAlertThreshold: 200,
  enableBrowserAlerts: false,
  enableSuddenSpikeAlerts: true,
  temperatureUnit: 'celsius',
};

export function loadUserPreferences(): UserPreferences {
  if (typeof window === 'undefined') {
    return INITIAL_PREFERENCES;
  }

  try {
    const raw = localStorage.getItem(PREFERENCES_STORAGE_KEY);
    if (!raw) return INITIAL_PREFERENCES;
    const parsed = JSON.parse(raw);
    return {
      ...INITIAL_PREFERENCES,
      ...parsed,
      preferredLocation: parsed.preferredLocation || DEFAULT_LOCATION,
      recentLocations: Array.isArray(parsed.recentLocations) && parsed.recentLocations.length > 0
        ? parsed.recentLocations
        : INITIAL_PREFERENCES.recentLocations,
    };
  } catch {
    return INITIAL_PREFERENCES;
  }
}

export function saveUserPreferences(prefs: Partial<UserPreferences>): UserPreferences {
  if (typeof window === 'undefined') {
    return { ...INITIAL_PREFERENCES, ...prefs };
  }

  try {
    const current = loadUserPreferences();
    const updated: UserPreferences = { ...current, ...prefs };
    localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error('Failed to save preferences to localStorage', err);
    return { ...INITIAL_PREFERENCES, ...prefs };
  }
}

export function addRecentLocation(location: SavedLocation): UserPreferences {
  const current = loadUserPreferences();
  const filtered = current.recentLocations.filter(
    (loc) => loc.name.toLowerCase() !== location.name.toLowerCase()
  );
  const updatedRecent = [location, ...filtered].slice(0, 6);
  return saveUserPreferences({ recentLocations: updatedRecent, preferredLocation: location });
}

export function resetUserPreferences(): UserPreferences {
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(PREFERENCES_STORAGE_KEY);
    } catch (err) {
      console.error('Failed to clear preferences from localStorage', err);
    }
  }
  return INITIAL_PREFERENCES;
}
