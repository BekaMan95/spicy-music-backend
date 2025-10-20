import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import Music, { IMusic } from '../models/Music';
import { ApiResponse } from '../types';

// Create music
export const createMusic = async (req: Request, res: Response<ApiResponse>, next: Function): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        error: errors.array()[0].msg
      });
      return;
    }

    const { title, artist, album, genres } = req.body;

    // Store the album art file path here
    if (!req.file) {
      throw new Error("Album art picture required");
    }

    const albumArt = process.env.CORS_ORIGIN + "/" + req.file.path;

    const music = new Music({
      title,
      artist,
      album,
      albumArt,
      genres
    });

    await music.save();

    res.status(201).json({
      success: true,
      message: 'Music created successfully',
      data: {
        music: {
          id: music._id,
          title: music.title,
          artist: music.artist,
          album: music.album,
          albumArt: music.albumArt,
          genres: music.genres,
          createdAt: music.createdAt,
          updatedAt: music.updatedAt
        }
      }
    });
  } catch (error) {
    console.error('Create music error:', error);
    next(error);
  }
};

// Get all music with pagination, search, and filtering
export const getMusic = async (req: Request, res: Response<ApiResponse>, next: Function): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;
    const artist = req.query.artist as string;
    const album = req.query.album as string;
    const genre = req.query.genre as string;
    const sortBy = req.query.sortBy as string || 'createdAt';
    const sortOrder = req.query.sortOrder as string || 'desc';

    const skip = (page - 1) * limit;

    // Build filter object
    const filter: Record<string, unknown> = {};

    if (search) {
      filter.$text = { $search: search };
    }

    if (artist) {
      filter.artist = { $regex: artist, $options: 'i' };
    }

    if (album) {
      filter.album = { $regex: album, $options: 'i' };
    }

    if (genre) {
      filter.genres = { $in: [new RegExp(genre, 'i')] };
    }

    // Build sort object
    const sort: Record<string, 1 | -1> = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const music = await Music.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await Music.countDocuments(filter);
    const pages = Math.ceil(total / limit);
    const message = total > 0 ? 'Music retrieved successfully' : 'No music found';

    res.status(200).json({
      success: true,
      message: message,
      data: music,
      count: music.length,
      total,
      page,
      pages
    });
  } catch (error) {
    console.error('Get music error:', error);
    next(error);
  }
};

// Get single music by ID
export const getMusicById = async (req: Request, res: Response<ApiResponse>, next: Function): Promise<void> => {
  try {
    const { id } = req.params;

    const music = await Music.findById(id);

    if (!music) {
      res.status(404).json({
        success: false,
        message: 'Music not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Music retrieved successfully',
      data: {
        music: {
          id: music._id,
          title: music.title,
          artist: music.artist,
          album: music.album,
          albumArt: music.albumArt,
          genres: music.genres,
          createdAt: music.createdAt,
          updatedAt: music.updatedAt
        }
      }
    });
  } catch (error) {
    console.error('Get music by ID error:', error);
    next(error);
  }
};

// Update music
export const updateMusic = async (req: Request, res: Response<ApiResponse>, next: Function): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        error: errors.array()[0].msg
      });
      return;
    }

    const { id } = req.params;
    const { title, artist, album, genres } = req.body;

    // Build update payload
    const updateData: Partial<MusicDocument> = {
      title,
      artist,
      album,
      genres
    };

    // Conditionally update albumArt if a new file is uploaded
    if (req.file) {
      updateData.albumArt = `${process.env.CORS_ORIGIN}/${req.file.path}`;
    }
    
    const music = await Music.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!music) {
      res.status(404).json({
        success: false,
        message: 'Music not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Music updated successfully',
      data: {
        music: {
          id: music._id,
          title: music.title,
          artist: music.artist,
          album: music.album,
          albumArt: music.albumArt,
          genres: music.genres,
          createdAt: music.createdAt,
          updatedAt: music.updatedAt
        }
      }
    });
  } catch (error) {
    console.error('Update music error:', error);
    next(error);
  }
};

// Delete music
export const deleteMusic = async (req: Request, res: Response<ApiResponse>, next: Function): Promise<void> => {
  try {
    const { id } = req.params;

    const music = await Music.findByIdAndDelete(id);

    if (!music) {
      res.status(404).json({
        success: false,
        message: 'Music not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Music deleted successfully'
    });
  } catch (error) {
    console.error('Delete music error:', error);
    next(error);
  }
};

// Search music
export const searchMusic = async (req: Request, res: Response<ApiResponse>, next: Function): Promise<void> => {
  try {
    const { q } = req.query;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    if (!q) {
      res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
      return;
    }

    const music = await Music.find(
      { $text: { $search: q as string } },
      { score: { $meta: 'textScore' } }
    )
      .sort({ score: { $meta: 'textScore' } })
      .skip(skip)
      .limit(limit);

    const total = await Music.countDocuments({ $text: { $search: q as string } });
    const pages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      message: 'Search completed successfully',
      data: music,
      count: music.length,
      total,
      page,
      pages
    });
  } catch (error) {
    console.error('Search music error:', error);
    next(error);
  }
};

// Get music statistics
export const getMusicStatistics = async (req: Request, res: Response<ApiResponse>, next: Function): Promise<void> => {
  try {
    // Total counts
    const totalSongs = await Music.countDocuments();
    const totalArtists = await Music.distinct('artist').then(artists => artists.length);
    const totalAlbums = await Music.distinct('album').then(albums => albums.length);
    const totalGenres = await Music.aggregate([
      { $unwind: '$genres' },
      { $group: { _id: '$genres' } },
      { $count: 'total' }
    ]).then(result => result[0]?.total || 0);

    // Songs per genre
    const songsPerGenre = await Music.aggregate([
      { $unwind: '$genres' },
      { $group: { _id: '$genres', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Songs and albums per artist
    const artistStats = await Music.aggregate([
      {
        $group: {
          _id: '$artist',
          songCount: { $sum: 1 },
          albums: { $addToSet: '$album' }
        }
      },
      {
        $project: {
          artist: '$_id',
          songCount: 1,
          albumCount: { $size: '$albums' },
          albums: 1,
          artistLower: { $toLower: '$_id' } // arrtibute for sorting
        }
      },
      { $sort: { artistLower: 1 } }
    ]);

    // Songs per album
    const albumStats = await Music.aggregate([
      {
        $group: {
          _id: { artist: '$artist', album: '$album' },
          songCount: { $sum: 1 }
        }
      },
      {
        $project: {
          artist: '$_id.artist',
          album: '$_id.album',
          songCount: 1,
          albumLower: { $toLower: '$_id.album' } // arrtibute for sorting
        }
      },
      { $sort: { albumLower: 1 } }
    ]);

    res.status(200).json({
      success: true,
      message: 'Music statistics retrieved successfully',
      data: {
        totals: {
          songs: totalSongs,
          artists: totalArtists,
          albums: totalAlbums,
          genres: totalGenres
        },
        songsPerGenre: songsPerGenre,
        artistStats: artistStats,
        albumStats: albumStats
      }
    });
  } catch (error) {
    console.error('Get music statistics error:', error);
    next(error);
  }
};
