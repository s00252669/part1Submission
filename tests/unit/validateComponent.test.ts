import { createComponentZSchema, updateComponentZSchema } from "../../src/models/component.model";

const validCpu = {
    name: "Ryzen 5 9600X",
    type: "CPU",
    brand: "AMD",
    price: 229,
    wattage: 65,
    socket: "AM5"
};

describe('Test Component Validation', () => {
    it('should pass for valid data', () => {
        expect(() => createComponentZSchema.parse(validCpu)).not.toThrow();
    });

    it('should pass for a GPU with no socket', () => {
        expect(() => createComponentZSchema.parse(
            { ...validCpu, type: "GPU", socket: undefined })).not.toThrow();
    });

    it('should fail for a CPU with no socket', () => {
        expect(() => createComponentZSchema.parse(
            { ...validCpu, socket: undefined })).toThrow();
    });

    it('should fail for RAM with no memoryType', () => {
        expect(() => createComponentZSchema.parse(
            { ...validCpu, type: "RAM", socket: undefined })).toThrow();
    });

    it('should fail for a negative price', () => {
        expect(() => createComponentZSchema.parse(
            { ...validCpu, price: -10 })).toThrow();
    });

    it('should fail for a price that is a string', () => {
        expect(() => createComponentZSchema.parse(
            { ...validCpu, price: "cheap" })).toThrow();
    });

    it('should fail for an unknown type', () => {
        expect(() => createComponentZSchema.parse(
            { ...validCpu, type: "Toaster" })).toThrow();
    });

    it('should fail for a missing name', () => {
        expect(() => createComponentZSchema.parse(
            { ...validCpu, name: undefined })).toThrow();
    });

    it('should pass an update with only one field', () => {
        expect(() => updateComponentZSchema.parse({ price: 199 })).not.toThrow();
    });
});