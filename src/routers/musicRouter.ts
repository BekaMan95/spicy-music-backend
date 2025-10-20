import express, { Router } from 'express';
import { 
  createMusic, 
  getMusic, 
  getMusicById, 
  updateMusic, 
  deleteMusic, 
  searchMusic,
  getMusicStatistics
} from '../controllers/musicController';
import { authenticate } from '../middleware/auth';
import { validateCreateMusic, validateUpdateMusic } from '../middleware/validation';

const musicRouter: Router = express.Router();

// All music routes require authentication
musicRouter.use(authenticate);

// Music CRUD routes
musicRouter.post('/', validateCreateMusic, createMusic);
musicRouter.get('/', getMusic);
musicRouter.get('/search', searchMusic);
musicRouter.get('/statistics', getMusicStatistics);
musicRouter.get('/:id', getMusicById);
musicRouter.put('/:id', validateUpdateMusic, updateMusic);
musicRouter.delete('/:id', deleteMusic);

export default musicRouter;
