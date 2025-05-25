import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
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

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

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

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  await initializeDatabase();
});

process.on('exit', async () => {
  await closeDriver();
  console.log('Neo4j connection closed');
});
