import neo4j from 'neo4j-driver';
import dotenv from 'dotenv';
import { fetchHotelsFromOverpass } from './overpass.js';

dotenv.config();

const driver = neo4j.driver(
   'neo4j://localhost:7687',
  neo4j.auth.basic(
     'neo4j',
    'Intel1970277672#'
  )
);

export const checkSpatialProcedures = async () => {
  // Neo4j 4.x and 5.x no longer expose dbms.procedures() by default
  // and the spatial plugin is not needed when using native `point` type
  console.log('Skipping spatial procedures check (not needed with point data type).');
  return true;
};
export const createSpatialIndex = async () => {
  const session = driver.session();
  try {
    await session.run(
      'CREATE POINT INDEX hotel_location IF NOT EXISTS FOR (h:Hotel) ON (h.location)'
    );
    console.log('Spatial index created or already exists');
    return true;
  } catch (error) {
    console.error('Error creating spatial index:', error);
    return false;
  } finally {
    await session.close();
  }
};

export const storeHotels = async (hotels) => {
  const session = driver.session();
  try {
    for (const hotel of hotels) {
      await session.run(
        `MERGE (h:Hotel {id: $id})
         ON CREATE SET
           h.name = $name,
           h.address = $address,
           h.latitude = $latitude,
           h.longitude = $longitude,
           h.location = point({latitude: $latitude, longitude: $longitude}),
           h.rating = $rating,
           h.amenities = $amenities,
           h.price_category = $price_category`,
        hotel
      );
    }
    return true;
  } catch (error) {
    console.error('Error storing hotels:', error);
    return false;
  } finally {
    await session.close();
  }
};

export const findNearbyHotels = async (latitude, longitude, radiusInMinutes) => {
  const session = driver.session();
  try {
    const distanceInMeters = (radiusInMinutes * 5000) / 60;

    const query = `
      MATCH (h:Hotel)
      WHERE point.distance(h.location, point({latitude: $latitude, longitude: $longitude})) <= $radius
      WITH h, point.distance(h.location, point({latitude: $latitude, longitude: $longitude})) as distance
      RETURN 
        h.id as id, 
        h.name as name, 
        h.address as address, 
        h.latitude as latitude, 
        h.longitude as longitude, 
        h.rating as rating, 
        h.amenities as amenities,
        h.price_category as price_category,
        distance as distance,
        round(distance / 83.33, 1) as walking_time
      ORDER BY distance ASC
    `;

    const result = await session.run(query, {
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      radius: distanceInMeters
    });

    let hotels = result.records.map(record => ({
      id: record.get('id'),
      name: record.get('name'),
      address: record.get('address'),
      latitude: record.get('latitude'),
      longitude: record.get('longitude'),
      rating: record.get('rating'),
      amenities: record.get('amenities'),
      price_category: record.get('price_category'),
      distance: record.get('distance'),
      walking_time: record.get('walking_time')
    }));

    if (hotels.length === 0) {
      console.log('No hotels found in Neo4j, fetching from Overpass API...');
      const overpassHotels = await fetchHotelsFromOverpass(latitude, longitude, distanceInMeters);

      if (overpassHotels.length > 0) {
        await storeHotels(overpassHotels);
        return findNearbyHotels(latitude, longitude, radiusInMinutes);
      }
    }

    return hotels;
  } catch (error) {
    console.error('Error finding nearby hotels:', error);
    throw error;
  } finally {
    await session.close();
  }
};

export const closeDriver = async () => {
  await driver.close();
  console.log('Neo4j driver closed');
};

export default {
  driver,
  checkSpatialProcedures,
  createSpatialIndex,
  findNearbyHotels,
  storeHotels,
  closeDriver
};
