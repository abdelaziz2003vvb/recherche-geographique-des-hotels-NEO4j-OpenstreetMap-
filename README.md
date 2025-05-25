# NearbyStays - Hotel Finder with Neo4j Spatial

A web application that uses Neo4j's spatial capabilities to find hotels near a specified location. The application demonstrates the power of graph databases with spatial features for geolocation-based searches.

## Features

- Find hotels within a specified walking time radius from your location
- View hotels on an interactive OpenStreetMap
- Sort hotels by distance from your location
- See detailed hotel information including ratings and amenities
- Responsive design that works on mobile and desktop

## Technology Stack

- **Frontend**: React, Tailwind CSS, Leaflet.js
- **Backend**: Express.js
- **Database**: Neo4j with Spatial capabilities
- **Maps**: OpenStreetMap via Leaflet

## Prerequisites

To run this application, you need:

- Node.js and npm
- A Neo4j database with the Spatial plugin enabled
- Basic knowledge of React and Express

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Set up your Neo4j database and update the `.env` file with your credentials:
   ```
   NEO4J_URI=bolt://localhost:7687
   NEO4J_USERNAME=neo4j
   NEO4J_PASSWORD=your_password
   ```
4. Start the backend server:
   ```
   npm run start-server
   ```
5. In a separate terminal, start the frontend:
   ```
   npm run dev
   ```

## Neo4j Setup

This application requires Neo4j with spatial capabilities. Here's how to set it up:

1. Install Neo4j Desktop or use a Neo4j cloud instance
2. Ensure the APOC and Graph Data Science libraries are installed
3. The application will automatically create a spatial index and seed example data

## Application Structure

- `server/`: Backend Express.js server
- `src/`: Frontend React application
  - `components/`: React components
  - `types/`: TypeScript type definitions

## How It Works

1. The application uses Neo4j's point data type to store hotel locations
2. When a user searches for nearby hotels:
   - The frontend sends the user's coordinates and desired radius to the backend
   - The backend uses Neo4j's spatial functions to find hotels within the specified radius
   - Results are sorted by distance and returned to the frontend
   - The frontend displays the hotels on both a list and a map

## License

This project is licensed under the MIT License - see the LICENSE file for details.