// routes/tourReviewRoutes.ts
import { Router } from 'express';
import { TourReviewController } from '../controllers/tourReviewController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.post('/', authenticateToken, TourReviewController.createTourReview);
router.get('/my-reviews', authenticateToken, TourReviewController.getMyTourReviews);
router.get('/tour/:tourId', TourReviewController.getTourReviews);
router.put('/:id', authenticateToken, TourReviewController.updateTourReview);

export default router;