export interface Hotel {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  rating: number;
  distance: number; // in meters
  walking_time: number; // in minutes
  amenities: string[];
  price_category: string;
}

export interface LocationSearchProps {
  onSearch: (location: [number, number], radius: number) => void;
  searchRadius: number;
  setSearchRadius: React.Dispatch<React.SetStateAction<number>>;
}

export interface MapContainerProps {
  currentLocation: [number, number] | null;
  hotels: Hotel[];
  selectedHotel: Hotel | null;
  onHotelSelect: (hotel: Hotel | null) => void;
  searchRadius: number;
}

export interface HotelListProps {
  hotels: Hotel[];
  isLoading: boolean;
  selectedHotel: Hotel | null;
  onHotelSelect: (hotel: Hotel | null) => void;
}

export interface HotelCardProps {
  hotel: Hotel;
  isSelected: boolean;
  onSelect: (hotel: Hotel) => void;
}