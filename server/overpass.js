import axios from 'axios';

const OVERPASS_API_URL = 'https://overpass-api.de/api/interpreter';

const generateRandomRating = () => {
  return Number((Math.random() * 4 + 1).toFixed(1));
};

const generatePriceCategory = () => {
  const categories = ['budget', 'moderate', 'luxury', 'ultra_luxury'];
  return categories[Math.floor(Math.random() * categories.length)];
};

const generateRandomAmenities = () => {
  const allAmenities = ['wifi', 'breakfast', 'tv', 'card_payment', 'pool', 'spa', 'gym'];
  const numAmenities = Math.floor(Math.random() * 4) + 2;
  const amenities = [];

  while (amenities.length < numAmenities) {
    const amenity = allAmenities[Math.floor(Math.random() * allAmenities.length)];
    if (!amenities.includes(amenity)) {
      amenities.push(amenity);
    }
  }

  return amenities;
};

const formatAddress = (tags) => {
  const parts = [];

  if (tags['addr:housenumber']) {
    parts.push(tags['addr:housenumber']);
  }

  if (tags['addr:street']) {
    parts.push(tags['addr:street']);
  }

  if (tags['addr:city']) {
    parts.push(tags['addr:city']);
  }

  if (tags['addr:state']) {
    parts.push(tags['addr:state']);
  }

  if (tags['addr:postcode']) {
    parts.push(tags['addr:postcode']);
  }

  return parts.length > 0 ? parts.join(', ') : tags.name || 'Address unknown';
};

export const fetchHotelsFromOverpass = async (latitude, longitude, radiusInMeters) => {
  try {
    const query = `
      [out:json][timeout:25];
      (
        node["tourism"="hotel"](around:${radiusInMeters},${latitude},${longitude});
        way["tourism"="hotel"](around:${radiusInMeters},${latitude},${longitude});
        relation["tourism"="hotel"](around:${radiusInMeters},${latitude},${longitude});
      );
      out body;
      >;
      out skel qt;
    `;

    const response = await axios.post(OVERPASS_API_URL, query, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    if (!response.data || !response.data.elements) {
      return [];
    }

    const hotels = response.data.elements
      .filter(element => element.type === 'node' && element.tags && element.tags.name)
      .map(element => ({
        id: `osm_${element.id}`,
        name: element.tags.name,
        address: formatAddress(element.tags),
        latitude: element.lat,
        longitude: element.lon,
        rating: generateRandomRating(),
        amenities: generateRandomAmenities(),
        price_category: generatePriceCategory()
      }));

    return hotels;
  } catch (error) {
    console.error('Error fetching hotels from Overpass API:', error);
    throw error;
  }
};
