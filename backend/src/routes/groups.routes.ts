import { Router } from 'express';
import { protect } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createGroupSchema } from '../validators/group.validator';
import * as groupsController from '../controllers/groups.controller';

const router = Router();

router.use(protect);

router.route('/')
  .get(groupsController.getGroups)
  .post(validate(createGroupSchema), groupsController.createGroup);

router.post('/:id/join', groupsController.joinGroup);
router.get('/:id/members', groupsController.getGroupMembers);

export default router;
