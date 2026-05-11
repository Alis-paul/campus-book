import { Router } from 'express';
import { protect } from '../middleware/auth';
import { upload } from '../config/cloudinary';
import { validate } from '../middleware/validate';
import { createListingSchema } from '../validators/marketplace.validator';
import * as marketplaceController from '../controllers/marketplace.controller';

const router = Router();

router.use(protect);

router.route('/')
  .get(marketplaceController.getListings)
  .post(upload.single('image'), validate(createListingSchema), marketplaceController.createListing);

router.route('/:id')
  .put(marketplaceController.updateListing)
  .delete(marketplaceController.deleteListing);

export default router;
