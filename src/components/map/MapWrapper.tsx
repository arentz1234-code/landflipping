'use client';

import dynamic from 'next/dynamic';

const DealMap = dynamic(
  () => import('@/components/map/DealMap').then((mod) => mod.DealMap),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[600px] bg-gray-100 rounded-lg flex items-center justify-center">
        <p className="text-gray-500">Loading map...</p>
      </div>
    ),
  }
);

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

interface MapWrapperProps {
  deals: Deal[];
}

export function MapWrapper({ deals }: MapWrapperProps) {
  return <DealMap deals={deals} />;
}
