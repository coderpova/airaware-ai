'use client';

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { SavedLocation } from '@/types/user';
import { getAqiCategory, getCategoryInfo } from '@/lib/aqi/cpcb-calculator';
import { AqiBadge } from '@/components/ui/AqiBadge';
import { AlertTriangle } from 'lucide-react';

interface CityMapData {
  location: SavedLocation;
  aqi: number;
  pm2_5: number;
  pm10: number;
  dominant: string;
}

interface AirQualityMapClientProps {
  center: [number, number];
  zoom?: number;
  citiesData: CityMapData[];
  selectedCity?: SavedLocation | null;
  onSelectCity?: (loc: SavedLocation) => void;
}

// Controller to animate and center the map on location selection
function MapViewController({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom, { animate: true });
  }, [center, zoom, map]);
  return null;
}

export const AirQualityMapClient: React.FC<AirQualityMapClientProps> = ({
  center,
  zoom = 5,
  citiesData,
  onSelectCity,
}) => {
  const createPinIcon = (aqi: number) => {
    const category = getAqiCategory(aqi);
    const info = getCategoryInfo(category);

    return L.divIcon({
      className: 'cpcb-marker-pin',
      html: `
        <div style="
          background-color: ${info.color};
          color: white;
          width: 38px;
          height: 38px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: sans-serif;
          font-weight: 800;
          font-size: 12px;
          border: 2.5px solid white;
          box-shadow: 0 4px 10px rgba(0,0,0,0.35);
          cursor: pointer;
          transform: translate(-50%, -50%);
        ">
          ${aqi}
        </div>
      `,
      iconSize: [38, 38],
      iconAnchor: [0, 0],
    });
  };

  return (
    <div className="relative w-full h-[550px] rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm z-0">
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={true}
        className="w-full h-full z-0"
        attributionControl={true}
      >
        <MapViewController center={center} zoom={zoom} />

        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {citiesData.map((item) => {
          const category = getAqiCategory(item.aqi);
          return (
            <Marker
              key={item.location.id}
              position={[item.location.latitude, item.location.longitude]}
              icon={createPinIcon(item.aqi)}
              eventHandlers={{
                click: () => onSelectCity?.(item.location),
              }}
            >
              <Popup className="cpcb-map-popup">
                <div className="p-1 space-y-2 min-w-[200px]">
                  <div className="flex items-start justify-between gap-2 border-b pb-1.5 border-slate-100">
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">{item.location.name}</h4>
                      <p className="text-[11px] text-slate-500">{item.location.admin1}</p>
                    </div>
                    <AqiBadge category={category} aqi={item.aqi} size="sm" />
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 pt-1">
                    <div>
                      <span className="text-[10px] text-slate-400 block">PM2.5:</span>
                      <strong>{item.pm2_5} µg/m³</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">PM10:</span>
                      <strong>{item.pm10} µg/m³</strong>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                    Dominant: <strong>{item.dominant}</strong>
                  </div>

                  <div className="pt-1 flex items-center gap-1 text-[10px] text-amber-600">
                    <AlertTriangle size={11} />
                    <span>Modelled Estimate (Open-Meteo)</span>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};
export default AirQualityMapClient;
