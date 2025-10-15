# Spicy Music Backend

A modern Express.js backend application built with TypeScript, MongoDB, and Mongoose, designed to run in Docker containers.

## Features

- **TypeScript**: Full TypeScript support with strict type checking
- **Express.js**: Fast, unopinionated web framework
- **MongoDB**: NoSQL database with Mongoose ODM
- **Docker**: Containerized application with Docker Compose
- **Security**: Helmet, CORS, and rate limiting
- **API**: RESTful API with proper error handling
- **Models**: User, Song, and Playlist models with relationships

## Project Structure

```
src/
├── config/          # Configuration files
│   └── database.ts  # MongoDB connection
├── models/          # Mongoose models
│   ├── User.ts
│   ├── Song.ts
│   └── Playlist.ts
├── routes/          # API routes
│   ├── users.ts
│   ├── songs.ts
│   └── playlists.ts
├── types/           # TypeScript type definitions
│   └── index.ts
└── server.ts        # Main application file
```

## Prerequisites

- Node.js 18+ 
- Docker and Docker Compose
- npm or yarn

## Getting Started

### 1. Clone and Setup

```bash
git clone <repository-url>
cd spicy-music-backend
```

### 2. Environment Configuration

Copy the environment example file and configure your settings:

```bash
cp env.example .env
```

Edit `.env` with your configuration:

```env
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://admin:password123@localhost:27017/spicy_music?authSource=admin
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:3000
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 3. Development with Docker

Start the application with Docker Compose:

```bash
# Start all services
docker-compose up

# Start in background
docker-compose up -d

# View logs
docker-compose logs -f app
```

### 4. Development without Docker

```bash
# Install dependencies
npm install

# Start MongoDB (if not using Docker)
# Make sure MongoDB is running on localhost:27017

# Start development server
npm run dev

# Build TypeScript
npm run build

# Start production server
npm start
```

## API Endpoints

### Health Check
- `GET /health` - Server health status

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user (soft delete)

### Songs
- `GET /api/songs` - Get all songs (with filtering)
- `GET /api/songs/:id` - Get song by ID
- `POST /api/songs` - Create new song
- `PUT /api/songs/:id` - Update song
- `DELETE /api/songs/:id` - Delete song (soft delete)

### Playlists
- `GET /api/playlists` - Get all playlists
- `GET /api/playlists/:id` - Get playlist by ID
- `POST /api/playlists` - Create new playlist
- `PUT /api/playlists/:id` - Update playlist
- `POST /api/playlists/:id/songs` - Add song to playlist
- `DELETE /api/playlists/:id/songs/:songId` - Remove song from playlist
- `DELETE /api/playlists/:id` - Delete playlist

## Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm test` - Run tests

## Docker Services

- **app**: Node.js application (port 3000)
- **mongodb**: MongoDB database (port 27017)

## Database Models

### User
- Basic user information with authentication fields
- Virtual field for full name
- Soft delete support

### Song
- Music metadata (title, artist, album, genre)
- File information and play count
- Tags and relationships

### Playlist
- Collection of songs with ordering
- Public/private visibility
- Followers and play count

## TypeScript Features

- Strict type checking enabled
- Interface definitions for all models
- Proper typing for Express routes
- Path mapping for clean imports

## Security Features

- Helmet for security headers
- CORS configuration
- Rate limiting
- Input validation
- Error handling

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

MIT License
