import mongoose, { Schema } from 'mongoose';
import { IPlaylist, IPlaylistSong } from '../types';

const playlistSongSchema = new Schema<IPlaylistSong>({
  song: {
    type: Schema.Types.ObjectId,
    ref: 'Song',
    required: true
  },
  addedAt: {
    type: Date,
    default: Date.now
  },
  order: {
    type: Number,
    required: true
  }
});

const playlistSchema = new Schema<IPlaylist>({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  coverArt: {
    type: String,
    default: null
  },
  songs: [playlistSongSchema],
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  followers: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  playCount: {
    type: Number,
    default: 0
  },
  tags: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

// Indexes for better query performance
playlistSchema.index({ name: 1, createdBy: 1 });
playlistSchema.index({ isPublic: 1 });
playlistSchema.index({ createdBy: 1 });
playlistSchema.index({ tags: 1 });

// Virtual for song count
playlistSchema.virtual('songCount').get(function(this: IPlaylist): number {
  return this.songs.length;
});

// Virtual for follower count
playlistSchema.virtual('followerCount').get(function(this: IPlaylist): number {
  return this.followers.length;
});

// Transform JSON output
playlistSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc: any, ret: any): any {
    delete ret.__v;
    return ret;
  }
});

export default mongoose.model<IPlaylist>('Playlist', playlistSchema);
