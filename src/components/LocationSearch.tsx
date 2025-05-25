import React, { useState } from 'react';
import { LocationSearchProps } from '../types';
import { Navigation, Search, Locate } from 'lucide-react';

const LocationSearch: React.FC<LocationSearchProps> = ({ 
  onSearch, 
  searchRadius, 
  setSearchRadius 
}) => {
  const [latitude, setLatitude] = useState<string>('');
  const [longitude, setLongitude] = useState<string>('');
  const [isGettingLocation, setIsGettingLocation] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    if (isNaN(lat) || isNaN(lng)) {
      alert('Please enter valid coordinates');
      return;
    }
    onSearch([lat, lng], searchRadius);
  };

  const getUserLocation = () => {
    setIsGettingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude.toString());
          setLongitude(position.coords.longitude.toString());
          setIsGettingLocation(false);
        },
        (error) => {
          console.error(error);
          alert('Error getting your location. Please enter coordinates manually.');
          setIsGettingLocation(false);
        }
      );
    } else {
      alert('Geolocation is not supported by this browser.');
      setIsGettingLocation(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-card p-6 mb-4">
      <h2 className="text-xl font-semibold text-primary-700 mb-4 flex items-center gap-2">
        <Locate className="h-5 w-5" />
        Find Nearby Hotels
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col md:flex-row md:space-x-4 space-y-4 md:space-y-0">
          <div className="flex-1">
            <label htmlFor="latitude" className="block text-sm font-medium text-neutral-700 mb-1">
              Latitude
            </label>
            <input
              id="latitude"
              type="text"
              value={latitude}
              onChange={(e) => setLatitude(e.target.value)}
              placeholder="e.g. 40.7128"
              className="w-full px-4 py-2 rounded-md border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500 transition"
              required
            />
          </div>
          <div className="flex-1">
            <label htmlFor="longitude" className="block text-sm font-medium text-neutral-700 mb-1">
              Longitude
            </label>
            <input
              id="longitude"
              type="text"
              value={longitude}
              onChange={(e) => setLongitude(e.target.value)}
              placeholder="e.g. -74.0060"
              className="w-full px-4 py-2 rounded-md border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500 transition"
              required
            />
          </div>
        </div>
        
        <div>
          <label htmlFor="radius" className="block text-sm font-medium text-neutral-700 mb-1">
            Search Radius (minutes walking)
          </label>
          <div className="flex items-center space-x-2">
            <input
              id="radius"
              type="range"
              min="1"
              max="30"
              value={searchRadius}
              onChange={(e) => setSearchRadius(parseInt(e.target.value))}
              className="w-full accent-secondary-500"
            />
            <span className="text-sm font-medium w-8 text-center">{searchRadius}</span>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
          <button
            type="button"
            onClick={getUserLocation}
            className="px-4 py-2 bg-secondary-600 text-white rounded-md hover:bg-secondary-700 transition-colors flex-1 flex items-center justify-center space-x-1"
            disabled={isGettingLocation}
          >
            <Navigation className="h-4 w-4" />
            <span>{isGettingLocation ? 'Getting Location...' : 'Use My Location'}</span>
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors flex-1 flex items-center justify-center space-x-1"
          >
            <Search className="h-4 w-4" />
            <span>Search Hotels</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default LocationSearch;