import { Router } from 'express';
import * as ScoreController from '../controllers/score.controller.js';
import { authenticate, authorizePermission, authorizeRole } from '../middlewares/authenticate.js';
import { permissions } from '../config/permissions.js';
import { validate } from '../validators/middleware.js';
import { createScoreSchema, listScoresSchema, reportCardSchema, scoreIdSchema, updateScoreSchema } from '../validators/score.validator.js';

const router = Router();
const adminOnly = [authenticate, authorizeRole('admin')];
const canRead = [...adminOnly, authorizePermission(permissions.scoresRead)];
const canWrite = [...adminOnly, authorizePermission(permissions.scoresWrite)];

router.get('/', ...canRead, validate(listScoresSchema), ScoreController.list);
router.get('/students/:studentId/report-card', ...canRead, validate(reportCardSchema), ScoreController.reportCard);
router.post('/', ...canWrite, validate(createScoreSchema), ScoreController.create);
router.get('/:id', ...canRead, validate(scoreIdSchema), ScoreController.get);
router.patch('/:id', ...canWrite, validate(updateScoreSchema), ScoreController.update);
router.delete('/:id', ...canWrite, validate(scoreIdSchema), ScoreController.remove);

export default router;
