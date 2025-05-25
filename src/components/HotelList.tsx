import React from 'react';
import { HotelListProps } from '../types';
import HotelCard from './HotelCard';
import { Hotel } from 'lucide-react';

const HotelList: React.FC<HotelListProps> = ({ 
  hotels, 
  isLoading, 
  selectedHotel, 
  onHotelSelect 
}) => {
  if (isLoading) {
    return (
      <div className="mt-4 space-y-4">
        <div className="py-6 flex flex-col items-center justify-center space-y-4">
          <div className="animate-pulse-slow w-10 h-10 rounded-full bg-primary-200"></div>
          <p className="text-neutral-600">Searching for hotels...</p>
        </div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-lg shadow-card p-4 animate-pulse">
            <div className="h-4 bg-neutral-200 rounded w-3/4 mb-4"></div>
            <div className="h-3 bg-neutral-200 rounded w-1/2 mb-2"></div>
            <div className="h-3 bg-neutral-200 rounded w-2/3"></div>
          </div>
        ))}
      </div>
    );
  }

  if (hotels.length === 0) {
    return (
      <div className="mt-6 bg-white rounded-lg shadow-card p-6 text-center">
        <Hotel className="mx-auto h-12 w-12 text-neutral-400 mb-2" />
        <h3 className="text-lg font-medium text-neutral-700">No Hotels Found</h3>
        <p className="text-neutral-500 mt-1">
          Try searching in a different location or increasing your search radius.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-neutral-800">
          {hotels.length} Hotels Found
        </h2>
        <div className="text-sm text-neutral-500">
          Sorted by distance
        </div>
      </div>
      
      <div className="space-y-4">
        {hotels.map(hotel => (
          <HotelCard 
            key={hotel.id} 
            hotel={hotel} 
            isSelected={selectedHotel?.id === hotel.id}
            onSelect={onHotelSelect}
          />
        ))}
      </div>
    </div>
  );
};

export default HotelList;