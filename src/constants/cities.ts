import { SavedLocation } from '@/types/user';

export const QUICK_CITIES: SavedLocation[] = [
  {
    id: 'delhi',
    name: 'Delhi',
    admin1: 'National Capital Territory of Delhi',
    country: 'India',
    latitude: 28.65195,
    longitude: 77.23149,
    isDefault: true,
  },
  {
    id: 'noida',
    name: 'Noida',
    admin1: 'Uttar Pradesh',
    country: 'India',
    latitude: 28.5795,
    longitude: 77.3301,
  },
  {
    id: 'greater-noida',
    name: 'Greater Noida',
    admin1: 'Uttar Pradesh',
    country: 'India',
    latitude: 28.4744,
    longitude: 77.504,
  },
  {
    id: 'mumbai',
    name: 'Mumbai',
    admin1: 'Maharashtra',
    country: 'India',
    latitude: 19.076,
    longitude: 72.8777,
  },
  {
    id: 'bengaluru',
    name: 'Bengaluru',
    admin1: 'Karnataka',
    country: 'India',
    latitude: 12.9716,
    longitude: 77.5946,
  },
  {
    id: 'hyderabad',
    name: 'Hyderabad',
    admin1: 'Telangana',
    country: 'India',
    latitude: 17.385,
    longitude: 78.4867,
  },
  {
    id: 'chennai',
    name: 'Chennai',
    admin1: 'Tamil Nadu',
    country: 'India',
    latitude: 13.0827,
    longitude: 80.2707,
  },
  {
    id: 'kolkata',
    name: 'Kolkata',
    admin1: 'West Bengal',
    country: 'India',
    latitude: 22.5726,
    longitude: 88.3639,
  },
  {
    id: 'lucknow',
    name: 'Lucknow',
    admin1: 'Uttar Pradesh',
    country: 'India',
    latitude: 26.8467,
    longitude: 80.9462,
  },
];

export const DEFAULT_LOCATION: SavedLocation = QUICK_CITIES[0];
