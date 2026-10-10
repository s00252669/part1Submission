import { checkCompatibility } from "../../src/utils/compatibility";
import { IComponent } from "../../src/models/component.model";

const cpu: IComponent  = { name: "Ryzen 5 9600X", type: "CPU", brand: "AMD", price: 229, wattage: 65, socket: "AM5" };
const mobo: IComponent = { name: "B650", type: "Motherboard", brand: "MSI", price: 189, wattage: 50, socket: "AM5", memoryType: "DDR5" };
const ram: IComponent  = { name: "32GB DDR5", type: "RAM", brand: "Corsair", price: 120, wattage: 10, memoryType: "DDR5" };
const gpu: IComponent  = { name: "RTX 5060 Ti", type: "GPU", brand: "Asus", price: 449, wattage: 180 };
const psu: IComponent  = { name: "RM750e", type: "PSU", brand: "Corsair", price: 99, wattage: 750 };

describe('Compatibility check', () => {
    it('passes a matching build', () => {
        const report = checkCompatibility([cpu, mobo, ram, gpu, psu], 2000);
        expect(report.compatible).toBe(true);
        expect(report.issues).toHaveLength(0);
    });

    it('fails when sockets do not match', () => {
        const report = checkCompatibility([cpu, { ...mobo, socket: "LGA1700" }], 2000);
        expect(report.compatible).toBe(false);
        expect(report.issues.some(i => i.includes("socket"))).toBe(true);
    });

    it('fails when RAM type does not match', () => {
        const report = checkCompatibility([mobo, { ...ram, memoryType: "DDR4" }], 2000);
        expect(report.compatible).toBe(false);
    });

    it('fails when the PSU is too small', () => {
        const report = checkCompatibility([cpu, mobo, gpu, { ...psu, wattage: 300 }], 2000);
        expect(report.compatible).toBe(false);
    });

    it('fails when over budget', () => {
        const report = checkCompatibility([cpu, mobo, gpu], 500);
        expect(report.compatible).toBe(false);
    });

    it('lists missing parts without failing', () => {
        const report = checkCompatibility([cpu, mobo], 2000);
        expect(report.compatible).toBe(true);
        expect(report.missingParts).toContain("PSU");
    });
});