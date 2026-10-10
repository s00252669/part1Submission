import { Request, Response } from 'express';
import { isValidObjectId } from 'mongoose';
import { BuildService } from '../services/build.service';
import { buildQueryZSchema } from '../models/build.model';

const buildService = new BuildService();

export class BuildController {

  /**
   * @openapi
   * /builds:
   *   get:
   *     summary: List builds (components populated)
   *     tags: [Builds]
   *     parameters:
   *       - { in: query, name: search, schema: { type: string } }
   *       - { in: query, name: maxBudget, schema: { type: number } }
   *       - { in: query, name: sort, schema: { type: string, enum: [name, -name, budget, -budget, createdAt, -createdAt] } }
   *     responses:
   *       200: { description: List of builds }
   *       400: { description: Invalid query parameters }
   */
  getBuilds = async (req: Request, res: Response): Promise<void> => {
    try {
      const query = buildQueryZSchema.safeParse(req.query);
      if (!query.success) {
        res.status(400).json({ message: 'Invalid query parameters', errors: query.error.issues });
        return;
      }
      const builds = await buildService.getBuilds(query.data);
      res.status(200).json(builds);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching builds' });
    }
  };

  /**
   * @openapi
   * /builds/{id}:
   *   get:
   *     summary: Get one build with its components
   *     tags: [Builds]
   *     parameters:
   *       - { in: path, name: id, required: true, schema: { type: string } }
   *     responses:
   *       200: { description: The build }
   *       400: { description: Invalid id }
   *       404: { description: Build not found }
   */
  getBuildById = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = req.params.id as string;
      if (!isValidObjectId(id)) {
        res.status(400).json({ message: 'Invalid build id' });
        return;
      }
      const build = await buildService.getBuildById(id);
      if (!build) {
        res.status(404).json({ message: 'Build not found' });
        return;
      }
      res.status(200).json(build);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching build' });
    }
  };

  /**
   * @openapi
   * /builds:
   *   post:
   *     summary: Create a build
   *     tags: [Builds]
   *     security: [{ ApiKeyAuth: [] }]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema: { $ref: '#/components/schemas/BuildInput' }
   *     responses:
   *       201: { description: Build created }
   *       400: { description: Validation failed or a component id does not exist }
   *       401: { description: Missing or invalid API key }
   */
  createBuild = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!(await buildService.componentsExist(req.body.components))) {
        res.status(400).json({ message: 'One or more component ids do not exist' });
        return;
      }
      const build = await buildService.createBuild(req.body);
      res.status(201).json(build);
    } catch (error) {
      res.status(500).json({ message: 'Error creating build' });
    }
  };

  /**
   * @openapi
   * /builds/{id}:
   *   put:
   *     summary: Update a build
   *     tags: [Builds]
   *     security: [{ ApiKeyAuth: [] }]
   *     parameters:
   *       - { in: path, name: id, required: true, schema: { type: string } }
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema: { $ref: '#/components/schemas/BuildInput' }
   *     responses:
   *       200: { description: Updated build }
   *       400: { description: Invalid id, validation failed or component id does not exist }
   *       401: { description: Missing or invalid API key }
   *       404: { description: Build not found }
   */
  updateBuild = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = req.params.id as string;
      if (!isValidObjectId(id)) {
        res.status(400).json({ message: 'Invalid build id' });
        return;
      }
      if (req.body.components && !(await buildService.componentsExist(req.body.components))) {
        res.status(400).json({ message: 'One or more component ids do not exist' });
        return;
      }
      const updated = await buildService.updateBuild(id, req.body);
      if (!updated) {
        res.status(404).json({ message: 'Build not found' });
        return;
      }
      res.status(200).json(updated);
    } catch (error) {
      res.status(500).json({ message: 'Error updating build' });
    }
  };

  /**
   * @openapi
   * /builds/{id}:
   *   delete:
   *     summary: Delete a build
   *     tags: [Builds]
   *     security: [{ ApiKeyAuth: [] }]
   *     parameters:
   *       - { in: path, name: id, required: true, schema: { type: string } }
   *     responses:
   *       204: { description: Deleted }
   *       400: { description: Invalid id }
   *       401: { description: Missing or invalid API key }
   *       404: { description: Build not found }
   */
  deleteBuild = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = req.params.id as string;
      if (!isValidObjectId(id)) {
        res.status(400).json({ message: 'Invalid build id' });
        return;
      }
      const deleted = await buildService.deleteBuild(id);
      if (!deleted) {
        res.status(404).json({ message: 'Build not found' });
        return;
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: 'Error deleting build' });
    }
  };

  /**
   * @openapi
   * /builds/{id}/compatibility:
   *   get:
   *     summary: Check whether a build's parts are compatible
   *     description: Checks CPU/motherboard socket, RAM type, PSU wattage (+20% margin) and budget.
   *     tags: [Builds]
   *     parameters:
   *       - { in: path, name: id, required: true, schema: { type: string } }
   *     responses:
   *       200: { description: Compatibility report with a list of issues }
   *       400: { description: Invalid id }
   *       404: { description: Build not found }
   */
  getCompatibility = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = req.params.id as string;
      if (!isValidObjectId(id)) {
        res.status(400).json({ message: 'Invalid build id' });
        return;
      }
      const report = await buildService.getCompatibility(id);
      if (!report) {
        res.status(404).json({ message: 'Build not found' });
        return;
      }
      res.status(200).json(report);
    } catch (error) {
      res.status(500).json({ message: 'Error checking compatibility' });
    }
  };
}