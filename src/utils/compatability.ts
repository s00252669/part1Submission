import { IComponent } from '../models/component.model';

export interface CompatibilityReport {
  compatible: boolean;
  totalPrice: number;
  totalWattage: number;
  recommendedPsuWattage: number;
  missingParts: string[];
  issues: string[];
}

const PSU_SAFETY_MARGIN = 1.2;
const REQUIRED_PARTS = ['CPU', 'Motherboard', 'RAM', 'PSU', 'Storage'];

export const checkCompatibility = (parts: IComponent[], budget: number): CompatibilityReport => {
  const issues: string[] = [];

  // Only one of each of these
  for (const single of ['CPU', 'Motherboard', 'PSU']) {
    if (parts.filter((p) => p.type === single).length > 1) {
      issues.push(`A build can only have one ${single}`);
    }
  }

  const cpu = parts.find((p) => p.type === 'CPU');
  const motherboard = parts.find((p) => p.type === 'Motherboard');
  const psu = parts.find((p) => p.type === 'PSU');
  const ramSticks = parts.filter((p) => p.type === 'RAM');

  // Socket must match
  if (cpu && motherboard && cpu.socket !== motherboard.socket) {
    issues.push(`CPU socket ${cpu.socket} does not match motherboard socket ${motherboard.socket}`);
  }

  // RAM type must match the motherboard
  for (const ram of ramSticks) {
    if (motherboard && ram.memoryType !== motherboard.memoryType) {
      issues.push(`${ram.name} is ${ram.memoryType} but the motherboard needs ${motherboard.memoryType}`);
    }
  }

  // PSU must cover total power + 20%
  const totalWattage = parts.filter((p) => p.type !== 'PSU').reduce((sum, p) => sum + p.wattage, 0);
  const recommendedPsuWattage = Math.ceil(totalWattage * PSU_SAFETY_MARGIN);

  if (psu && psu.wattage < recommendedPsuWattage) {
    issues.push(`PSU is ${psu.wattage}W but this build needs at least ${recommendedPsuWattage}W`);
  }

  // Budget
  const totalPrice = Math.round(parts.reduce((sum, p) => sum + p.price, 0) * 100) / 100;
  if (totalPrice > budget) {
    issues.push(`Total price €${totalPrice} is over the budget of €${budget}`);
  }

  // Missing parts are listed but don't make the build "incompatible"
  const missingParts = REQUIRED_PARTS.filter((t) => !parts.some((p) => p.type === t));

  return { compatible: issues.length === 0, totalPrice, totalWattage, recommendedPsuWattage, missingParts, issues };
};