import { BuildModel, CreateBuildInput, BuildQuery } from '../models/build.model';
import { ComponentModel, IComponent } from '../models/component.model';
import { checkCompatibility } from '../utils/compatibility';
import { escapeRegex } from '../utils/escapeRegex';

export class BuildService {

  getBuilds(q: BuildQuery) {
    const filter: Record<string, any> = {};
    if (q.search) filter.name = { $regex: escapeRegex(q.search), $options: 'i' };
    if (q.maxBudget !== undefined) filter.budget = { $lte: q.maxBudget };
    return BuildModel.find(filter).sort(q.sort).populate('components');
  }

  getBuildById(id: string) {
    return BuildModel.findById(id).populate('components');
  }

  // true if every id in the list is a real component
  async componentsExist(ids: string[]): Promise<boolean> {
    const unique = [...new Set(ids)];
    const count = await ComponentModel.countDocuments({ _id: { $in: unique } });
    return count === unique.length;
  }

  createBuild(data: CreateBuildInput) {
    return BuildModel.create(data);
  }

  updateBuild(id: string, data: Partial<CreateBuildInput>) {
    return BuildModel.findByIdAndUpdate(id, data, { new: true, runValidators: true }).populate('components');
  }

  deleteBuild(id: string) {
    return BuildModel.findByIdAndDelete(id);
  }

  async getCompatibility(id: string) {
    const build = await BuildModel.findById(id).populate<{ components: IComponent[] }>('components');
    if (!build) return null;
    return { buildId: id, name: build.name, ...checkCompatibility(build.components, build.budget) };
  }
}