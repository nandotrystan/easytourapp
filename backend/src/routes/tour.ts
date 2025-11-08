import { Router } from 'express';
import { TourController } from '../controllers/tourController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.get('/', TourController.getTours);
router.get('/my-tours', authenticateToken, TourController.getMyTours);
router.get('/:id', TourController.getTourById);
router.post('/', authenticateToken, TourController.createTour);

export default router;