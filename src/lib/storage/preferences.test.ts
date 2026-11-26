import { describe, it, expect, beforeEach } from 'vitest';
import {
  loadUserPreferences,
  saveUserPreferences,
  addRecentLocation,
  resetUserPreferences,
  INITIAL_PREFERENCES,
} from './preferences';
import { QUICK_CITIES } from '@/constants/cities';

describe('Preferences Storage Management', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('loads default preferences when localStorage is empty', () => {
    const prefs = loadUserPreferences();
    expect(prefs.preferredLocation.name).toBe(INITIAL_PREFERENCES.preferredLocation.name);
    expect(prefs.activity).toBe('walking');
    expect(prefs.sensitivity).toBe('general');
    expect(prefs.aqiAlertThreshold).toBe(200);
  });

  it('saves and updates preferences correctly', () => {
    saveUserPreferences({
      activity: 'running',
      sensitivity: 'respiratory_cardiac',
      aqiAlertThreshold: 150,
    });

    const loaded = loadUserPreferences();
    expect(loaded.activity).toBe('running');
    expect(loaded.sensitivity).toBe('respiratory_cardiac');
    expect(loaded.aqiAlertThreshold).toBe(150);
  });

  it('adds and deduplicates recent locations', () => {
    const mumbai = QUICK_CITIES[3]; // Mumbai
    addRecentLocation(mumbai);

    const loaded = loadUserPreferences();
    expect(loaded.preferredLocation.name).toBe('Mumbai');
    expect(loaded.recentLocations[0].name).toBe('Mumbai');
  });

  it('resets preferences back to initial defaults', () => {
    saveUserPreferences({ activity: 'cycling', aqiAlertThreshold: 300 });
    const reset = resetUserPreferences();
    expect(reset).toEqual(INITIAL_PREFERENCES);
    expect(loadUserPreferences()).toEqual(INITIAL_PREFERENCES);
  });
});
