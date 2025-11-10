import express from 'express';
import businessController from '../controllers/businessController';

const router = express.Router();

// GET /api/businesses - Get all businesses with optional filters
router.get('/', businessController.getAllBusinesses);

// GET /api/businesses/search - Search businesses
router.get('/search', businessController.searchBusinesses);

// GET /api/businesses/verified - Get verified businesses
router.get('/verified', businessController.getVerifiedBusinesses);

// GET /api/businesses/type/:type - Get businesses by type
router.get('/type/:type', businessController.getBusinessesByType);

// GET /api/businesses/:id - Get business by ID
router.get('/:id', businessController.getBusinessById);

// POST /api/businesses - Create new business
router.post('/', businessController.createBusiness);

// PUT /api/businesses/:id - Update business
router.put('/:id', businessController.updateBusiness);

// DELETE /api/businesses/:id - Delete business
router.delete('/:id', businessController.deleteBusiness);

export default router;