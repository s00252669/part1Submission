import { Request, Response } from 'express';
import { isValidObjectId } from 'mongoose';
import { ComponentService } from '../services/component.service';
import { componentQueryZSchema } from '../models/component.model';

const componentService = new ComponentService();

export class ComponentController {

  /**
   * @openapi
   * /components:
   *   get:
   *     summary: List components with filtering, sorting, projection and paging
   *     tags: [Components]
   *     parameters:
   *       - { in: query, name: type, schema: { type: string, enum: [CPU, GPU, RAM, PSU, Motherboard, Storage] } }
   *       - { in: query, name: brand, schema: { type: string } }
   *       - { in: query, name: search, schema: { type: string }, description: Case-insensitive search on name }
   *       - { in: query, name: minPrice, schema: { type: number } }
   *       - { in: query, name: maxPrice, schema: { type: number } }
   *       - { in: query, name: sort, schema: { type: string, enum: [name, -name, price, -price, wattage, -wattage] } }
   *       - { in: query, name: fields, schema: { type: string }, example: "name,price" }
   *       - { in: query, name: page, schema: { type: integer, default: 1 } }
   *       - { in: query, name: limit, schema: { type: integer, default: 10, maximum: 50 } }
   *     responses:
   *       200: { description: Paged list of components }
   *       400: { description: Invalid query parameters }
   *       500: { description: Server error }
   */
  getComponents = async (req: Request, res: Response): Promise<void> => {
    try {
      const query = componentQueryZSchema.safeParse(req.query);
      if (!query.success) {
        res.status(400).json({ message: 'Invalid query parameters', errors: query.error.issues });
        return;
      }
      const result = await componentService.getComponents(query.data);
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching components' });
    }
  };

  /**
   * @openapi
   * /components/{id}:
   *   get:
   *     summary: Get one component by id
   *     tags: [Components]
   *     parameters:
   *       - { in: path, name: id, required: true, schema: { type: string } }
   *     responses:
   *       200: { description: The component }
   *       400: { description: Invalid id }
   *       404: { description: Component not found }
   */
  getComponentById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      if (!isValidObjectId(id)) {
        res.status(400).json({ message: 'Invalid component id' });
        return;
      }
      const component = await componentService.getComponentById(id);
      if (!component) {
        res.status(404).json({ message: 'Component not found' });
        return;
      }
      res.status(200).json(component);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching component' });
    }
  };

  /**
   * @openapi
   * /components:
   *   post:
   *     summary: Create a component
   *     tags: [Components]
   *     security: [{ ApiKeyAuth: [] }]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema: { $ref: '#/components/schemas/ComponentInput' }
   *     responses:
   *       201: { description: Component created }
   *       400: { description: Validation failed }
   *       401: { description: Missing or invalid API key }
   */
  createComponent = async (req: Request, res: Response): Promise<void> => {
    try {
      const component = await componentService.createComponent(req.body);
      res.status(201).json(component);
    } catch (error) {
      res.status(500).json({ message: 'Error creating component' });
    }
  };

  /**
   * @openapi
   * /components/{id}:
   *   put:
   *     summary: Update a component (send only the fields that change)
   *     tags: [Components]
   *     security: [{ ApiKeyAuth: [] }]
   *     parameters:
   *       - { in: path, name: id, required: true, schema: { type: string } }
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema: { $ref: '#/components/schemas/ComponentInput' }
   *     responses:
   *       200: { description: Updated component }
   *       400: { description: Invalid id or validation failed }
   *       401: { description: Missing or invalid API key }
   *       404: { description: Component not found }
   */
  updateComponent = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      if (!isValidObjectId(id)) {
        res.status(400).json({ message: 'Invalid component id' });
        return;
      }
      const updated = await componentService.updateComponent(id, req.body);
      if (!updated) {
        res.status(404).json({ message: 'Component not found' });
        return;
      }
      res.status(200).json(updated);
    } catch (error) {
      res.status(500).json({ message: 'Error updating component' });
    }
  };

  /**
   * @openapi
   * /components/{id}:
   *   delete:
   *     summary: Delete a component
   *     tags: [Components]
   *     security: [{ ApiKeyAuth: [] }]
   *     parameters:
   *       - { in: path, name: id, required: true, schema: { type: string } }
   *     responses:
   *       204: { description: Deleted }
   *       400: { description: Invalid id }
   *       401: { description: Missing or invalid API key }
   *       404: { description: Component not found }
   *       409: { description: Component is used in a build }
   */
  deleteComponent = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      if (!isValidObjectId(id)) {
        res.status(400).json({ message: 'Invalid component id' });
        return;
      }
      if (await componentService.isUsedInBuild(id)) {
        res.status(409).json({ message: 'Component is used in a build and cannot be deleted' });
        return;
      }
      const deleted = await componentService.deleteComponent(id);
      if (!deleted) {
        res.status(404).json({ message: 'Component not found' });
        return;
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: 'Error deleting component' });
    }
  };
}