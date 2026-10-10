import express from "express";
import { BuildController } from "../controllers/build.controller";
import { authenticateKey } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import { createBuildZSchema, updateBuildZSchema } from "../models/build.model";

const router = express.Router();
const buildController = new BuildController();

router.get('/', buildController.getBuilds);
router.get('/id', buildController.getBuildById);
router.get('/:id/compatibility', buildController.getCompatibility);
router.post('/', authenticateKey, validate(createBuildZSchema), buildController.createBuild);
router.put('/:id', authenticateKey, validate(updateBuildZSchema), buildController.updateBuild);
router.delete('/:id', authenticateKey, buildController.deleteBuild);

export default router;
