import { Document, Types } from 'mongoose';

// User Types
export interface IUser extends Document {
  _id: Types.ObjectId;
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
  fullName: string;
}

export interface IUserInput {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  avatar?: string;
}

export interface IUserUpdate {
  username?: string;
  email?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  isActive?: boolean;
  lastLogin?: Date;
}

// Song Types
export interface ISong extends Document {
  _id: Types.ObjectId;
  title: string;
  artist: string;
  album?: string;
  genre: SongGenre;
  duration: number;
  releaseYear?: number;
  filePath: string;
  coverArt?: string;
  lyrics?: string;
  playCount: number;
  isActive: boolean;
  uploadedBy: Types.ObjectId;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  formattedDuration: string;
}

export interface ISongInput {
  title: string;
  artist: string;
  album?: string;
  genre: SongGenre;
  duration: number;
  releaseYear?: number;
  filePath: string;
  coverArt?: string;
  lyrics?: string;
  uploadedBy: Types.ObjectId;
  tags?: string[];
}

export interface ISongUpdate {
  title?: string;
  artist?: string;
  album?: string;
  genre?: SongGenre;
  duration?: number;
  releaseYear?: number;
  filePath?: string;
  coverArt?: string;
  lyrics?: string;
  playCount?: number;
  isActive?: boolean;
  tags?: string[];
}

export enum SongGenre {
  ROCK = 'Rock',
  POP = 'Pop',
  HIP_HOP = 'Hip-Hop',
  ELECTRONIC = 'Electronic',
  JAZZ = 'Jazz',
  CLASSICAL = 'Classical',
  COUNTRY = 'Country',
  R_B = 'R&B',
  OTHER = 'Other'
}

// Playlist Types
export interface IPlaylistSong {
  song: Types.ObjectId;
  addedAt: Date;
  order: number;
}

export interface IPlaylist extends Document {
  _id: Types.ObjectId;
  name: string;
  description?: string;
  isPublic: boolean;
  coverArt?: string;
  songs: IPlaylistSong[];
  createdBy: Types.ObjectId;
  followers: Types.ObjectId[];
  playCount: number;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  songCount: number;
  followerCount: number;
}

export interface IPlaylistInput {
  name: string;
  description?: string;
  isPublic?: boolean;
  coverArt?: string;
  songs?: IPlaylistSong[];
  createdBy: Types.ObjectId;
  tags?: string[];
}

export interface IPlaylistUpdate {
  name?: string;
  description?: string;
  isPublic?: boolean;
  coverArt?: string;
  songs?: IPlaylistSong[];
  tags?: string[];
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  count?: number;
  total?: number;
  page?: number;
  pages?: number;
  error?: string;
}

export interface PaginationQuery {
  page?: string;
  limit?: string;
}

export interface SongQuery extends PaginationQuery {
  genre?: string;
  artist?: string;
  search?: string;
}

export interface PlaylistQuery extends PaginationQuery {
  isPublic?: string;
  createdBy?: string;
}

// Environment Types
export interface EnvironmentConfig {
  NODE_ENV: string;
  PORT: number;
  MONGODB_URI: string;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  CORS_ORIGIN: string;
  RATE_LIMIT_WINDOW_MS: number;
  RATE_LIMIT_MAX_REQUESTS: number;
}
