import mongoose, { Document, Schema } from 'mongoose';

export interface IMusic extends Document {
  title: string;
  artist: string;
  album: string;
  albumArt: string;
  genres: string[];
  createdAt: Date;
  updatedAt: Date;
}

const musicSchema = new Schema<IMusic>({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  artist: {
    type: String,
    required: [true, 'Artist is required'],
    trim: true,
    maxlength: [100, 'Artist name cannot exceed 100 characters']
  },
  album: {
    type: String,
    required: [true, 'Album is required'],
    trim: true,
    maxlength: [100, 'Album name cannot exceed 100 characters']
  },
  albumArt: {
    type: String,
    required: [true, 'album art image required'],
  },
  genres: {
    type: [String],
    required: [true, 'At least one genre is required'],
    validate: {
      validator: function(genres: string[]) {
        return genres && genres.length > 0;
      },
      message: 'At least one genre is required'
    }
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      delete (ret as Record<string, unknown>).__v;
      return ret;
    }
  }
});

// Indexes for better query performance
musicSchema.index({ title: 'text', artist: 'text', album: 'text' }); // Text search
musicSchema.index({ artist: 1 });
musicSchema.index({ album: 1 });
musicSchema.index({ genres: 1 });
musicSchema.index({ createdAt: -1 });

export default mongoose.model<IMusic>('Music', musicSchema);
