import React, { useEffect, useRef, useState } from 'react';
import { MapContainerProps } from '../types';
import L from 'leaflet';
import 'leaflet-routing-machine';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import axios from 'axios';

export const MapContainer: React.FC<MapContainerProps> = ({ 
  currentLocation, 
  hotels, 
  selectedHotel, 
  onHotelSelect,
  searchRadius 
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const circleRef = useRef<L.Circle | null>(null);
  const routingControlRef = useRef<L.Routing.Control | null>(null);

  // Initialize the map
  useEffect(() => {
    if (mapRef.current && !leafletMapRef.current) {
      leafletMapRef.current = L.map(mapRef.current).setView([40.7128, -74.0060], 13);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(leafletMapRef.current);
    }

    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, []);

  // Custom icons
  const createUserIcon = () => {
    return L.divIcon({
      html: `<div class="flex items-center justify-center w-8 h-8 bg-primary-600 rounded-full border-2 border-white shadow-lg">
              <div class="text-white">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 22s-8-4.5-8-11.8a8 8 0 0 1 16 0c0 7.3-8 11.8-8 11.8z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
              </div>
            </div>`,
      className: '',
      iconSize: [32, 32],
      iconAnchor: [16, 32]
    });
  };

  const createHotelIcon = (isSelected: boolean) => {
    const color = isSelected ? 'bg-accent-500' : 'bg-secondary-500';
    return L.divIcon({
      html: `<div class="flex items-center justify-center w-8 h-8 ${color} rounded-full border-2 border-white shadow-lg">
              <div class="text-white">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M18 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2Z"/>
                  <path d="m9 16 .348-.24c1.465-1.013 3.84-1.013 5.304 0L15 16"/>
                  <path d="M8 7h.01"/>
                  <path d="M16 7h.01"/>
                  <path d="M12 7h.01"/>
                  <path d="M12 11h.01"/>
                  <path d="M16 11h.01"/>
                  <path d="M8 11h.01"/>
                  <path d="M10 22v-6.5m4 0V22"/>
                </svg>
              </div>
            </div>`,
      className: '',
      iconSize: [32, 32],
      iconAnchor: [16, 32]
    });
  };

  // Hotel popup component with image gallery
  const HotelPopup = ({ hotel }: { hotel: any }) => {
    const [images, setImages] = useState<string[]>([]);
    const [mainImage, setMainImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
      const fetchImages = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const response = await axios.get('http://localhost:5000/api/hotels/images', {
            params: { hotelName: hotel.name }
          });
          if (response.data && response.data.images?.length > 0) {
            setImages(response.data.images);
            setMainImage(response.data.images[0]);
          } else {
            setImages([]);
            setMainImage(null);
          }
        } catch (error) {
          console.error('Error fetching hotel images:', error);
          setError('Failed to load images');
          setImages([]);
          setMainImage(null);
        } finally {
          setIsLoading(false);
        }
      };

      fetchImages();
    }, [hotel.name]);

    const handleThumbnailClick = (image: string) => {
      setMainImage(image);
    };

    return (
      <div className="w-64 p-2">
        <h3 className="text-lg font-medium text-neutral-800">{hotel.name}</h3>
        <p className="text-sm text-neutral-600">{hotel.address}</p>
        <p className="text-sm text-neutral-600">{(hotel.distance / 1000).toFixed(2)} km away</p>
        <div className="flex flex-col sm:flex-row gap-2 mt-2">
          {/* Main Image */}
          <div className="w-full sm:w-3/4">
            {isLoading ? (
              <div className="w-full h-32 flex items-center justify-center bg-neutral-100 rounded-md">
                <span className="text-neutral-600">Loading...</span>
              </div>
            ) : error ? (
              <div className="w-full h-32 flex items-center justify-center bg-neutral-100 rounded-md">
                <span className="text-error-500 text-sm">{error}</span>
              </div>
            ) : (
              <img
                src={mainImage || 'https://via.placeholder.com/240x120?text=No+Image+Available'}
                alt={hotel.name}
                className="w-full h-32 object-cover rounded-md"
              />
            )}
          </div>
          {/* Thumbnail Gallery */}
          {images.length > 1 && (
            <div className="flex sm:flex-col gap-1 overflow-x-auto sm:overflow-y-auto max-h-32">
              {images.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`${hotel.name} thumbnail ${index + 1}`}
                  className={`w-12 h-12 object-cover rounded-md cursor-pointer ${image === mainImage ? 'border-2 border-accent-500' : 'border border-neutral-200'}`}
                  onClick={() => handleThumbnailClick(image)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Update map markers and circle
  useEffect(() => {
    if (!leafletMapRef.current) return;

    // Clear markers and circle
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    if (circleRef.current) {
      circleRef.current.remove();
      circleRef.current = null;
    }

    // Add user location marker and circle
    if (currentLocation) {
      const [lat, lng] = currentLocation;
      leafletMapRef.current.setView([lat, lng], 14);

      const userMarker = L.marker([lat, lng], { icon: createUserIcon() })
        .addTo(leafletMapRef.current)
        .bindPopup('<strong>Your Location</strong>');
      markersRef.current.push(userMarker);

      const radiusInMeters = (searchRadius * 5000) / 60;
      circleRef.current = L.circle([lat, lng], {
        color: 'rgba(59, 130, 246, 0.2)',
        fillColor: 'rgba(59, 130, 246, 0.1)',
        fillOpacity: 0.5,
        radius: radiusInMeters
      }).addTo(leafletMapRef.current);
    }

    // Add hotel markers with gallery popup
    hotels.forEach(hotel => {
      const isSelected = selectedHotel && selectedHotel.id === hotel.id;
      const hotelMarker = L.marker([hotel.latitude, hotel.longitude], { icon: createHotelIcon(isSelected) })
        .addTo(leafletMapRef.current!);

      // Create a DOM element for the popup content
      const popupContent = document.createElement('div');
      // Render the HotelPopup component into the popup content
      import('react-dom').then(ReactDOM => {
        ReactDOM.render(<HotelPopup hotel={hotel} />, popupContent);
      });

      hotelMarker.bindPopup(popupContent, { maxWidth: 300, minWidth: 280 });
      hotelMarker.on('click', () => onHotelSelect(hotel));
      markersRef.current.push(hotelMarker);
    });

    // Fit bounds
    if (hotels.length > 0 && currentLocation) {
      const bounds = L.latLngBounds([currentLocation]);
      hotels.forEach(hotel => bounds.extend([hotel.latitude, hotel.longitude]));
      leafletMapRef.current.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [currentLocation, hotels, selectedHotel, searchRadius, onHotelSelect]);

  // Update routing when hotel is selected
  useEffect(() => {
    if (!leafletMapRef.current || !currentLocation || !selectedHotel) return;

    // Remove old route if it exists
    if (routingControlRef.current) {
      leafletMapRef.current.removeControl(routingControlRef.current);
      routingControlRef.current = null;
    }

    const [userLat, userLng] = currentLocation;

    routingControlRef.current = L.Routing.control({
      waypoints: [
        L.latLng(userLat, userLng),
        L.latLng(selectedHotel.latitude, selectedHotel.longitude)
      ],
      lineOptions: {
        styles: [{ color: '#1d4ed8', weight: 5 }],
        addWaypoints: false
      },
      show: false,
      collapsible: true,
      createMarker: () => null
    }).addTo(leafletMapRef.current);

    return () => {
      if (routingControlRef.current) {
        leafletMapRef.current?.removeControl(routingControlRef.current);
        routingControlRef.current = null;
      }
    };
  }, [selectedHotel, currentLocation]);

  return (
    <div ref={mapRef} className="w-full h-full" />
  );
};