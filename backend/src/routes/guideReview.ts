// routes/guideReviewRoutes.ts
import { Router } from 'express';
import { GuideReviewController } from '../controllers/guideReviewController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.post('/', authenticateToken, GuideReviewController.createGuideReview);
router.get('/guide/:guideId', GuideReviewController.getGuideReviews);
router.get('/guide/:guideId/average', GuideReviewController.getGuideAverageRating);

export default router;