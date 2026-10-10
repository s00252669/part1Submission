import { Schema, model, Types, isValidObjectId } from 'mongoose';
import { z } from 'zod';

export interface IBuild {
  name: string;
  description?: string;
  budget: number;
  components: Types.ObjectId[];
}

const buildSchema = new Schema<IBuild>(
  {
    name:        { type: String, required: true, trim: true },
    description: { type: String },
    budget:      { type: Number, required: true, min: 0 },
    components:  [{ type: Schema.Types.ObjectId, ref: 'Component' }],
  },
  { timestamps: true }
);

export const BuildModel = model<IBuild>('Build', buildSchema);

// ---------- Zod ----------
const objectIdZ = z.string().refine((v) => isValidObjectId(v), { message: 'Invalid component id' });

export const buildBaseZSchema = z.object({
  name:        z.string().min(2).max(100),
  description: z.string().max(500).optional(),
  budget:      z.number().positive().max(20000),
  components:  z.array(objectIdZ).max(10),
});

export const createBuildZSchema = buildBaseZSchema;
export const updateBuildZSchema = buildBaseZSchema.partial();

export const buildQueryZSchema = z.object({
  search:    z.string().max(50).optional(),
  maxBudget: z.coerce.number().min(0).optional(),
  sort:      z.enum(['name', '-name', 'budget', '-budget', 'createdAt', '-createdAt']).default('-createdAt'),
});

export type CreateBuildInput = z.infer<typeof createBuildZSchema>;
export type BuildQuery = z.infer<typeof buildQueryZSchema>;