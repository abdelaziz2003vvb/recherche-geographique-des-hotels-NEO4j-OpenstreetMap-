// index.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';
import {
  checkSpatialProcedures,
  createSpatialIndex,
  findNearbyHotels,
  closeDriver
} from './database.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const GOOGLE_CSE_ID = process.env.GOOGLE_CSE_ID;

// Initialize Neo4j spatial setup
const initializeDatabase = async () => {
  try {
    const hasSpatial = await checkSpatialProcedures();
    if (!hasSpatial) {
      console.error('Neo4j spatial procedures not available');
      process.exit(1);
    }

    await createSpatialIndex();
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
};

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Nearby hotels search
app.post('/api/hotels/nearby', async (req, res) => {
  const { latitude, longitude, radius = 5 } = req.body;

  if (!latitude || !longitude) {
    return res.status(400).json({ error: 'Latitude and longitude are required' });
  }

  try {
    const hotels = await findNearbyHotels(
      parseFloat(latitude),
      parseFloat(longitude),
      parseFloat(radius)
    );

    res.json(hotels);
  } catch (error) {
    console.error('Error finding nearby hotels:', error);
    res.status(500).json({ error: 'Failed to find nearby hotels' });
  }
});

// ✅ Hotel image search route using Google CSE
app.get('/api/hotels/images', async (req, res) => {
  const hotelName = req.query.hotelName; // Must match query param ?hotelName=...

  if (!hotelName || hotelName.trim() === '') {
    return res.status(400).json({ error: 'Hotel name is required' });
  }

  console.log(`Searching images for: ${hotelName}`);

  try {
    const response = await axios.get('https://www.googleapis.com/customsearch/v1', {
      params: {
        key: GOOGLE_API_KEY,
        cx: GOOGLE_CSE_ID,
        q: `${hotelName} hotel exterior`,
        searchType: 'image',
        num: 5,
      },
    });

    const imageLinks = response.data.items?.map(item => item.link) || [];
    res.json({ images: imageLinks });
  } catch (err) {
    console.error('Google Search API error:', err.message);
    res.status(500).json({ error: 'Failed to fetch images' });
  }
});

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`);
  await initializeDatabase();
});

// Graceful shutdown
process.on('exit', async () => {
  await closeDriver();
  console.log('Neo4j connection closed');
});

