// MongoDB initialization script
db = db.getSiblingDB('spicy_music');

// Create collections
db.createCollection('users');
db.createCollection('songs');
db.createCollection('playlists');

// Create indexes for better performance
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "username": 1 }, { unique: true });
db.users.createIndex({ "createdAt": 1 });

db.songs.createIndex({ "title": 1, "artist": 1 });
db.songs.createIndex({ "genre": 1 });
db.songs.createIndex({ "uploadedBy": 1 });
db.songs.createIndex({ "tags": 1 });
db.songs.createIndex({ "createdAt": 1 });

db.playlists.createIndex({ "name": 1, "createdBy": 1 });
db.playlists.createIndex({ "isPublic": 1 });
db.playlists.createIndex({ "createdBy": 1 });
db.playlists.createIndex({ "tags": 1 });
db.playlists.createIndex({ "createdAt": 1 });

print('Database initialized successfully!');
