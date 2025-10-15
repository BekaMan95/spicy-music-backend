import express, { Request, Response } from 'express';
import Playlist from '../models/Playlist';
import { ApiResponse, IPlaylistInput, IPlaylistUpdate, PlaylistQuery } from '../types';

const router = express.Router();

// GET /api/playlists - Get all playlists
router.get('/', async (req: Request<{}, ApiResponse, {}, PlaylistQuery>, res: Response<ApiResponse>) => {
  try {
    const { isPublic, createdBy, page = '1', limit = '10' } = req.query;
    
    const filter: any = {};
    if (isPublic !== undefined) filter.isPublic = isPublic === 'true';
    if (createdBy) filter.createdBy = createdBy;

    const playlists = await Playlist.find(filter)
      .populate('createdBy', 'username firstName lastName')
      .populate('songs.song', 'title artist duration')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit) * 1)
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Playlist.countDocuments(filter);

    res.json({
      success: true,
      count: playlists.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: playlists
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error fetching playlists',
      error: error.message
    });
  }
});

// GET /api/playlists/:id - Get playlist by ID
router.get('/:id', async (req: Request<{ id: string }>, res: Response<ApiResponse>) => {
  try {
    const playlist = await Playlist.findById(req.params.id)
      .populate('createdBy', 'username firstName lastName')
      .populate('songs.song', 'title artist duration filePath coverArt')
      .populate('followers', 'username firstName lastName');
    
    if (!playlist) {
      return res.status(404).json({
        success: false,
        message: 'Playlist not found'
      });
    }

    // Increment play count
    playlist.playCount += 1;
    await playlist.save();

    res.json({
      success: true,
      data: playlist
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error fetching playlist',
      error: error.message
    });
  }
});

// POST /api/playlists - Create new playlist
router.post('/', async (req: Request<{}, ApiResponse, IPlaylistInput>, res: Response<ApiResponse>) => {
  try {
    const playlist = new Playlist(req.body);
    await playlist.save();
    
    await playlist.populate('createdBy', 'username firstName lastName');
    
    res.status(201).json({
      success: true,
      message: 'Playlist created successfully',
      data: playlist
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: 'Error creating playlist',
      error: error.message
    });
  }
});

// PUT /api/playlists/:id - Update playlist
router.put('/:id', async (req: Request<{ id: string }, ApiResponse, IPlaylistUpdate>, res: Response<ApiResponse>) => {
  try {
    const playlist = await Playlist.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('createdBy', 'username firstName lastName');

    if (!playlist) {
      return res.status(404).json({
        success: false,
        message: 'Playlist not found'
      });
    }

    res.json({
      success: true,
      message: 'Playlist updated successfully',
      data: playlist
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: 'Error updating playlist',
      error: error.message
    });
  }
});

// POST /api/playlists/:id/songs - Add song to playlist
router.post('/:id/songs', async (req: Request<{ id: string }, ApiResponse, { songId: string }>, res: Response<ApiResponse>) => {
  try {
    const { songId } = req.body;
    
    const playlist = await Playlist.findById(req.params.id);
    if (!playlist) {
      return res.status(404).json({
        success: false,
        message: 'Playlist not found'
      });
    }

    // Check if song already exists in playlist
    const existingSong = playlist.songs.find(s => s.song.toString() === songId);
    if (existingSong) {
      return res.status(400).json({
        success: false,
        message: 'Song already exists in playlist'
      });
    }

    // Add song to playlist
    playlist.songs.push({
      song: songId as any,
      order: playlist.songs.length + 1
    });

    await playlist.save();
    await playlist.populate('songs.song', 'title artist duration');

    res.json({
      success: true,
      message: 'Song added to playlist successfully',
      data: playlist
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: 'Error adding song to playlist',
      error: error.message
    });
  }
});

// DELETE /api/playlists/:id/songs/:songId - Remove song from playlist
router.delete('/:id/songs/:songId', async (req: Request<{ id: string; songId: string }>, res: Response<ApiResponse>) => {
  try {
    const playlist = await Playlist.findById(req.params.id);
    if (!playlist) {
      return res.status(404).json({
        success: false,
        message: 'Playlist not found'
      });
    }

    playlist.songs = playlist.songs.filter(s => s.song.toString() !== req.params.songId);
    
    // Reorder remaining songs
    playlist.songs.forEach((song, index) => {
      song.order = index + 1;
    });

    await playlist.save();
    await playlist.populate('songs.song', 'title artist duration');

    res.json({
      success: true,
      message: 'Song removed from playlist successfully',
      data: playlist
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: 'Error removing song from playlist',
      error: error.message
    });
  }
});

// DELETE /api/playlists/:id - Delete playlist
router.delete('/:id', async (req: Request<{ id: string }>, res: Response<ApiResponse>) => {
  try {
    const playlist = await Playlist.findByIdAndDelete(req.params.id);

    if (!playlist) {
      return res.status(404).json({
        success: false,
        message: 'Playlist not found'
      });
    }

    res.json({
      success: true,
      message: 'Playlist deleted successfully'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error deleting playlist',
      error: error.message
    });
  }
});

export default router;
