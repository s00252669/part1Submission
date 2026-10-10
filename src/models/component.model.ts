import { Schema, model } from 'mongoose';
import { z } from 'zod';

export const COMPONENT_TYPES = ['CPU', 'GPU', 'RAM', 'PSU', 'Motherboard', 'Storage'] as const;
export const MEMORY_TYPES = ['DDR4', 'DDR5'] as const;

export interface IComponent {
  name: string;
  type: (typeof COMPONENT_TYPES)[number];
  brand: string;
  price: number;
  wattage: number;
  socket?: string;
  memoryType?: (typeof MEMORY_TYPES)[number];
}

const componentSchema = new Schema<IComponent>(
  {
    name:       { type: String, required: true, trim: true },
    type:       { type: String, required: true, enum: [...COMPONENT_TYPES] },
    brand:      { type: String, required: true, trim: true },
    price:      { type: Number, required: true, min: 0 },
    wattage:    { type: Number, required: true, min: 0 },
    socket:     { type: String },
    memoryType: { type: String, enum: [...MEMORY_TYPES] },
  },
  { timestamps: true }
);

export const ComponentModel = model<IComponent>('Component', componentSchema);

// ---------- Zod ----------
export const componentBaseZSchema = z.object({
  name:       z.string().min(2).max(100),
  type:       z.enum(COMPONENT_TYPES),
  brand:      z.string().min(1).max(50),
  price:      z.number().positive().max(10000),
  wattage:    z.number().int().min(0).max(2000),
  socket:     z.string().min(2).max(20).optional(),
  memoryType: z.enum(MEMORY_TYPES).optional(),
});

// Business rules: CPUs/motherboards need a socket, RAM/motherboards need a memory type
export const createComponentZSchema = componentBaseZSchema
  .refine((c) => !['CPU', 'Motherboard'].includes(c.type) || !!c.socket, {
    message: 'CPUs and motherboards must have a socket',
    path: ['socket'],
  })
  .refine((c) => !['RAM', 'Motherboard'].includes(c.type) || !!c.memoryType, {
    message: 'RAM and motherboards must have a memoryType',
    path: ['memoryType'],
  });

export const updateComponentZSchema = componentBaseZSchema.partial();

// Query parameters: z.coerce turns "500" from the URL into the number 500
export const componentQueryZSchema = z.object({
  type:     z.enum(COMPONENT_TYPES).optional(),
  brand:    z.string().optional(),
  search:   z.string().max(50).optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  sort:     z.enum(['name', '-name', 'price', '-price', 'wattage', '-wattage']).default('name'),
  fields:   z.string().regex(/^[a-zA-Z,]+$/).optional(),
  page:     z.coerce.number().int().min(1).default(1),
  limit:    z.coerce.number().int().min(1).max(50).default(10),
});

export type ComponentQuery = z.infer<typeof componentQueryZSchema>;