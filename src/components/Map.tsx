import React, { useEffect, useRef } from 'react';
import { MapContainerProps } from '../types';
import L from 'leaflet';
import 'leaflet-routing-machine';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';

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
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
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

    // Add hotel markers
    hotels.forEach(hotel => {
      const isSelected = selectedHotel && selectedHotel.id === hotel.id;
      const hotelMarker = L.marker([hotel.latitude, hotel.longitude], { icon: createHotelIcon(isSelected) })
        .addTo(leafletMapRef.current!)
        .bindPopup(`
          <strong>${hotel.name}</strong><br>
          ${hotel.address}<br>
          <span class="text-sm">${(hotel.distance / 1000).toFixed(2)} km away</span>
        `);
        
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
