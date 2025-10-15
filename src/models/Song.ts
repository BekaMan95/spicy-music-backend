import mongoose, { Schema } from 'mongoose';
import { ISong, SongGenre } from '../types';

const songSchema = new Schema<ISong>({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  artist: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  album: {
    type: String,
    trim: true,
    maxlength: 100
  },
  genre: {
    type: String,
    required: true,
    trim: true,
    enum: Object.values(SongGenre)
  },
  duration: {
    type: Number, // Duration in seconds
    required: true,
    min: 1
  },
  releaseYear: {
    type: Number,
    min: 1900,
    max: new Date().getFullYear()
  },
  filePath: {
    type: String,
    required: true
  },
  coverArt: {
    type: String,
    default: null
  },
  lyrics: {
    type: String,
    default: null
  },
  playCount: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  uploadedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tags: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

// Indexes for better query performance
songSchema.index({ title: 1, artist: 1 });
songSchema.index({ genre: 1 });
songSchema.index({ uploadedBy: 1 });
songSchema.index({ tags: 1 });

// Virtual for formatted duration
songSchema.virtual('formattedDuration').get(function(this: ISong): string {
  const minutes = Math.floor(this.duration / 60);
  const seconds = this.duration % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
});

// Transform JSON output
songSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc: any, ret: any): any {
    delete ret.__v;
    return ret;
  }
});

export default mongoose.model<ISong>('Song', songSchema);
