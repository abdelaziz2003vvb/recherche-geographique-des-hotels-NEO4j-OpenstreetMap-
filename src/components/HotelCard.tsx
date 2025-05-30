import React from 'react';
import { HotelCardProps } from '../types';
import {
  Star,
  Navigation,
  Wifi,
  Coffee,
  Tv,
  CreditCard,
  School as Pool,
  Dumbbell
} from 'lucide-react';

const HotelCard: React.FC<HotelCardProps> = ({ hotel, isSelected, onSelect }) => {
  const amenityIcons: Record<string, JSX.Element> = {
    wifi: <Wifi size={14} />,
    breakfast: <Coffee size={14} />,
    tv: <Tv size={14} />,
    card_payment: <CreditCard size={14} />,
    pool: <Pool size={14} />,
    gym: <Dumbbell size={14} />,
  };

  const formatDistance = (meters: number) => {
    if (meters < 1000) {
      return `${meters.toFixed(0)} m`;
    } else {
      return `${(meters / 1000).toFixed(2)} km`;
    }
  };

  const getPriceDisplay = (category: string) => {
    switch (category) {
      case 'budget':
        return { text: '$', color: 'text-success-500' };
      case 'moderate':
        return { text: '$$', color: 'text-accent-500' };
      case 'luxury':
        return { text: '$$$', color: 'text-primary-600' };
      case 'ultra_luxury':
        return { text: '$$$$', color: 'text-error-500' };
      default:
        return { text: '', color: '' };
    }
  };

  const priceDisplay = getPriceDisplay(hotel.price_category);

  return (
    <div
      className={`bg-white rounded-lg shadow-card hover:shadow-card-hover transition-all duration-300 p-4 cursor-pointer border-l-4 ${
        isSelected ? 'border-accent-500 bg-accent-50' : 'border-transparent'
      }`}
      onClick={() => onSelect(hotel)}
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-medium text-neutral-800">{hotel.name}</h3>
          <p className="text-neutral-600 text-sm mt-1">{hotel.address}</p>
        </div>
        <div className={`${priceDisplay.color} font-medium`}>{priceDisplay.text}</div>
      </div>

      <div className="flex items-center mt-3 space-x-1">
        {[...Array(Math.floor(hotel.rating))].map((_, i) => (
          <Star key={i} size={16} className="text-accent-500 fill-accent-500" />
        ))}
        {hotel.rating % 1 > 0 && <Star size={16} className="text-accent-500" />}
        {[...Array(5 - Math.ceil(hotel.rating))].map((_, i) => (
          <Star key={`empty-${i}`} size={16} className="text-neutral-300" />
        ))}
        <span className="text-sm font-medium text-neutral-600 ml-1">{hotel.rating.toFixed(1)}</span>
      </div>

      <div className="flex items-center justify-between mt-4">
        <div className="flex flex-col text-sm text-neutral-600">
          <div className="flex items-center">
            <Navigation size={14} className="mr-1" />
            <span>{formatDistance(hotel.distance)}</span>
          </div>
          <div className="text-neutral-500">{hotel.walking_time.toFixed(1)} min walk</div>
        </div>

        <div className="flex items-center space-x-2">
          {hotel.amenities.map((amenity, index) =>
            amenityIcons[amenity] ? (
              <div
                key={index}
                className="text-neutral-500 bg-neutral-100 p-1 rounded"
                title={amenity.replace('_', ' ')}
              >
                {amenityIcons[amenity]}
              </div>
            ) : null
          )}
        </div>
      </div>
    </div>
  );
};

export default HotelCard;