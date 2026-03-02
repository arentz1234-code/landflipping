'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { formatCurrency } from '@/lib/utils';

// Fix for default marker icons in Next.js
const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Custom colored markers
const createColoredIcon = (color: string) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="background-color: ${color}; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
  });
};

const stageColors: Record<string, string> = {
  lead: '#6B7280',
  contacted: '#3B82F6',
  offer_made: '#8B5CF6',
  negotiating: '#F59E0B',
  under_contract: '#10B981',
  due_diligence: '#06B6D4',
  closed_won: '#22C55E',
  closed_lost: '#EF4444',
  dead: '#9CA3AF',
};

interface Deal {
  id: string;
  title: string;
  stage: string;
  offer_amount?: number;
  agreed_price?: number;
  latitude?: number;
  longitude?: number;
  property?: {
    county: string;
    state: string;
    acreage?: number;
    latitude?: number;
    longitude?: number;
  };
}

interface DealMapProps {
  deals: Deal[];
}

// County coordinates for Texas (approximate centers)
const countyCoordinates: Record<string, [number, number]> = {
  'Travis': [30.3074, -97.7560],
  'Williamson': [30.6477, -97.6011],
  'Hays': [30.0599, -97.9967],
  'Bastrop': [30.1105, -97.3200],
  'Caldwell': [29.8371, -97.6203],
  'Bell': [31.0342, -97.5029],
  'Burnet': [30.7582, -98.2281],
  'Blanco': [30.2632, -98.4210],
  'Comal': [29.7431, -98.2560],
  'Guadalupe': [29.5727, -97.9433],
};

export function DealMap({ deals }: DealMapProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-full h-[600px] bg-gray-100 rounded-lg flex items-center justify-center">
        <p className="text-gray-500">Loading map...</p>
      </div>
    );
  }

  // Get coordinates for each deal
  const dealsWithCoords = deals.map((deal) => {
    let lat = deal.latitude || deal.property?.latitude;
    let lng = deal.longitude || deal.property?.longitude;

    // If no coordinates, try to get from county
    if (!lat || !lng) {
      const county = deal.property?.county;
      if (county && countyCoordinates[county]) {
        // Add small random offset so markers don't overlap
        const offset = () => (Math.random() - 0.5) * 0.1;
        lat = countyCoordinates[county][0] + offset();
        lng = countyCoordinates[county][1] + offset();
      }
    }

    return { ...deal, lat, lng };
  }).filter((d) => d.lat && d.lng);

  // Default center on Austin, TX
  const center: [number, number] = dealsWithCoords.length > 0
    ? [dealsWithCoords[0].lat!, dealsWithCoords[0].lng!]
    : [30.2672, -97.7431];

  return (
    <MapContainer
      center={center}
      zoom={9}
      className="w-full h-[600px] rounded-lg"
      style={{ zIndex: 1 }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {dealsWithCoords.map((deal) => (
        <Marker
          key={deal.id}
          position={[deal.lat!, deal.lng!]}
          icon={createColoredIcon(stageColors[deal.stage] || '#6B7280')}
        >
          <Popup>
            <div className="min-w-[200px]">
              <h3 className="font-semibold text-gray-900 mb-1">{deal.title}</h3>
              {deal.property && (
                <p className="text-sm text-gray-500 mb-2">
                  {deal.property.county}, {deal.property.state}
                  {deal.property.acreage && ` • ${deal.property.acreage} acres`}
                </p>
              )}
              <div className="flex items-center gap-2 mb-2">
                <span
                  className="inline-block w-3 h-3 rounded-full"
                  style={{ backgroundColor: stageColors[deal.stage] }}
                />
                <span className="text-sm capitalize">
                  {deal.stage.replace(/_/g, ' ')}
                </span>
              </div>
              {(deal.agreed_price || deal.offer_amount) && (
                <p className="text-sm font-medium">
                  {formatCurrency(deal.agreed_price ?? deal.offer_amount ?? 0)}
                </p>
              )}
              <a
                href={`/deals/${deal.id}`}
                className="text-sm text-blue-600 hover:underline mt-2 inline-block"
              >
                View Deal →
              </a>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
