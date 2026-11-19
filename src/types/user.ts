export type UserActivity =
  | 'walking'
  | 'running'
  | 'cycling'
  | 'outdoor_sports'
  | 'school_commute'
  | 'daily_commuting';

export type UserSensitivity =
  | 'general'
  | 'children'
  | 'older_adults'
  | 'respiratory_cardiac';

export interface SavedLocation {
  id: string;
  name: string;
  admin1?: string;
  country: string;
  latitude: number;
  longitude: number;
  isDefault?: boolean;
}

export interface UserPreferences {
  preferredLocation: SavedLocation;
  recentLocations: SavedLocation[];
  activity: UserActivity;
  sensitivity: UserSensitivity;
  aqiAlertThreshold: number; // e.g. 150 or 200
  enableBrowserAlerts: boolean;
  enableSuddenSpikeAlerts: boolean;
  lastDismissedAlertId?: string;
  temperatureUnit: 'celsius' | 'fahrenheit';
}

export interface SystemAlert {
  id: string;
  type: 'poor_aqi' | 'very_poor_aqi' | 'severe_aqi' | 'sudden_spike' | 'forecast_deterioration';
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'danger' | 'critical';
  timestamp: string;
  locationName: string;
  aqiValue?: number;
  triggerCondition: string;
}
