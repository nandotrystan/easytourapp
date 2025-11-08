import { Router } from 'express';
import { TourRequestController } from '../controllers/tourRequestController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.get('/my-requests', authenticateToken, TourRequestController.getMyTourRequests);
router.post('/', authenticateToken, TourRequestController.createTourRequest);
router.patch('/:id/status', authenticateToken, TourRequestController.updateTourRequestStatus);
router.patch('/:id/cancel', authenticateToken, TourRequestController.cancelTourRequest);

export default router;