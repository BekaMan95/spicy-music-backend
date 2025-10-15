import express, { Request, Response } from 'express';
import Song from '../models/Song';
import { ApiResponse, ISongInput, ISongUpdate, SongQuery } from '../types';

const router = express.Router();

// GET /api/songs - Get all songs with optional filtering
router.get('/', async (req: Request<{}, ApiResponse, {}, SongQuery>, res: Response<ApiResponse>) => {
  try {
    const { genre, artist, search, page = '1', limit = '10' } = req.query;
    
    // Build filter object
    const filter: any = { isActive: true };
    
    if (genre) filter.genre = genre;
    if (artist) filter.artist = new RegExp(artist, 'i');
    if (search) {
      filter.$or = [
        { title: new RegExp(search, 'i') },
        { artist: new RegExp(search, 'i') },
        { album: new RegExp(search, 'i') }
      ];
    }

    const songs = await Song.find(filter)
      .populate('uploadedBy', 'username firstName lastName')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit) * 1)
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Song.countDocuments(filter);

    res.json({
      success: true,
      count: songs.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: songs
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error fetching songs',
      error: error.message
    });
  }
});

// GET /api/songs/:id - Get song by ID
router.get('/:id', async (req: Request<{ id: string }>, res: Response<ApiResponse>) => {
  try {
    const song = await Song.findById(req.params.id)
      .populate('uploadedBy', 'username firstName lastName');
    
    if (!song) {
      return res.status(404).json({
        success: false,
        message: 'Song not found'
      });
    }

    // Increment play count
    song.playCount += 1;
    await song.save();

    res.json({
      success: true,
      data: song
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error fetching song',
      error: error.message
    });
  }
});

// POST /api/songs - Create new song
router.post('/', async (req: Request<{}, ApiResponse, ISongInput>, res: Response<ApiResponse>) => {
  try {
    const song = new Song(req.body);
    await song.save();
    
    await song.populate('uploadedBy', 'username firstName lastName');
    
    res.status(201).json({
      success: true,
      message: 'Song created successfully',
      data: song
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: 'Error creating song',
      error: error.message
    });
  }
});

// PUT /api/songs/:id - Update song
router.put('/:id', async (req: Request<{ id: string }, ApiResponse, ISongUpdate>, res: Response<ApiResponse>) => {
  try {
    const song = await Song.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('uploadedBy', 'username firstName lastName');

    if (!song) {
      return res.status(404).json({
        success: false,
        message: 'Song not found'
      });
    }

    res.json({
      success: true,
      message: 'Song updated successfully',
      data: song
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: 'Error updating song',
      error: error.message
    });
  }
});

// DELETE /api/songs/:id - Delete song (soft delete)
router.delete('/:id', async (req: Request<{ id: string }>, res: Response<ApiResponse>) => {
  try {
    const song = await Song.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!song) {
      return res.status(404).json({
        success: false,
        message: 'Song not found'
      });
    }

    res.json({
      success: true,
      message: 'Song deleted successfully'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error deleting song',
      error: error.message
    });
  }
});

export default router;
