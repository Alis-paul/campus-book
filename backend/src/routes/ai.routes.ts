import { Router } from 'express';
import { protect } from '../middleware/auth';
import { aiLimiter } from '../middleware/rateLimiter';
import { validate } from '../middleware/validate';
import { summarizeSchema, quizSchema, essaySchema, chatSchema } from '../validators/ai.validator';
import * as aiController from '../controllers/ai.controller';

const router = Router();

router.use(protect);
router.use(aiLimiter);

router.post('/summarize', validate(summarizeSchema), aiController.summarize);
router.post('/quiz-generate', validate(quizSchema), aiController.generateQuiz);
router.post('/essay-feedback', validate(essaySchema), aiController.essayFeedback);
router.post('/chat', validate(chatSchema), aiController.chat);

export default router;
