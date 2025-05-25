import React, { useState } from 'react';
import { MapContainer } from './components/Map';
import LocationSearch from './components/LocationSearch';
import HotelList from './components/HotelList';
import { Hotel } from './types';
import Header from './components/Header';

function App() {
  const [currentLocation, setCurrentLocation] = useState<[number, number] | null>(null);
  const [searchRadius, setSearchRadius] = useState<number>(5);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);

  const handleSearch = async (location: [number, number], radius: number) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/hotels/nearby`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          latitude: location[0],
          longitude: location[1],
          radius: radius, // in minutes (walking time)
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch hotels');
      }
      
      const data = await response.json();
      setHotels(data);
      setCurrentLocation(location);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-neutral-50">
      <Header />
      
      <main className="flex-grow flex flex-col md:flex-row">
        <div className="md:w-1/3 p-4 overflow-y-auto">
          <LocationSearch onSearch={handleSearch} searchRadius={searchRadius} setSearchRadius={setSearchRadius} />
          
          {error && (
            <div className="mt-4 p-4 bg-error-100 text-error-700 rounded-md">
              {error}
            </div>
          )}
          
          <HotelList 
            hotels={hotels} 
            isLoading={isLoading} 
            onHotelSelect={setSelectedHotel}
            selectedHotel={selectedHotel}
          />
        </div>
        
        <div className="md:w-2/3 h-[50vh] md:h-auto">
          <MapContainer 
            currentLocation={currentLocation} 
            hotels={hotels}
            selectedHotel={selectedHotel}
            onHotelSelect={setSelectedHotel}
            searchRadius={searchRadius} 
          />
        </div>
      </main>
      
      <footer className="bg-primary-700 text-white py-4 text-center">
        <p className="text-sm">© {new Date().getFullYear()} NearbyStays - Built with Neo4j Spatial</p>
      </footer>
    </div>
  );
}

export default App;