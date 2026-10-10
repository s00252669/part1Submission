import express from "express";
import { ComponentController } from "../controllers/component.controller"; 
import { authenticateKey} from "../middleware/auth.middleware";
import {validate} from '../middleware/validate.middleware';
import { createComponentZSchema, updateComponentZSchema } from '../models/component.model';

const router = express.Router();
const componentController = new ComponentController();

router.get('/', componentController.getComponents);
router.get('/:id', componentController.getComponentById);
router.post('/', authenticateKey, validate(createComponentZSchema), componentController.createComponent);
router.put('/:id', authenticateKey, validate(updateComponentZSchema), componentController.updateComponent);
router.delete('/:id', authenticateKey, componentController.deleteComponent);

export default router;