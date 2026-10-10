import { ComponentModel, IComponent, ComponentQuery } from '../models/component.model';
import { BuildModel } from '../models/build.model';
import { escapeRegex } from '../utils/escapeRegex';

export class ComponentService {

  async getComponents(q: ComponentQuery) {
    const filter: Record<string, any> = {};

    if (q.type) filter.type = q.type;
    if (q.brand) filter.brand = q.brand;
    if (q.search) filter.name = { $regex: escapeRegex(q.search), $options: 'i' };

    const price: Record<string, number> = {};
    if (q.minPrice !== undefined) price.$gte = q.minPrice;
    if (q.maxPrice !== undefined) price.$lte = q.maxPrice;
    if (Object.keys(price).length > 0) filter.price = price;

    const [items, total] = await Promise.all([
      ComponentModel.find(filter)
        .sort(q.sort)
        .select(q.fields ? q.fields.split(',').join(' ') : '')
        .skip((q.page - 1) * q.limit)
        .limit(q.limit),
      ComponentModel.countDocuments(filter),
    ]);

    return { total, page: q.page, limit: q.limit, items };
  }

  getComponentById(id: string) {
    return ComponentModel.findById(id);
  }

  createComponent(data: IComponent) {
    return ComponentModel.create(data);
  }

  updateComponent(id: string, data: Partial<IComponent>) {
    return ComponentModel.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  }

  deleteComponent(id: string) {
    return ComponentModel.findByIdAndDelete(id);
  }

  async isUsedInBuild(id: string): Promise<boolean> {
    return (await BuildModel.exists({ components: id })) !== null;
  }
}