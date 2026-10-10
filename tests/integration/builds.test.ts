import request from "supertest";
import { app } from "../../src/app";
import { env } from "../../src/config/env";

const KEY = { "x-api-key": env.apiKey };
const unknownId = "6700000000000000000000aa";

describe('Builds API', () => {
    let cpuId: string;
    let moboId: string;
    let buildId: string;

    it('creates a test CPU and a mismatched motherboard', async () => {
        const cpu = await request(app).post('/api/v1/components').set(KEY)
            .send({ name: "TEST AM5 CPU", type: "CPU", brand: "Test", price: 200, wattage: 65, socket: "AM5" });
        const mobo = await request(app).post('/api/v1/components').set(KEY)
            .send({ name: "TEST LGA1700 Board", type: "Motherboard", brand: "Test", price: 150, wattage: 45, socket: "LGA1700", memoryType: "DDR4" });
        expect(cpu.status).toBe(201);
        expect(mobo.status).toBe(201);
        cpuId = cpu.body._id;
        moboId = mobo.body._id;
    });

    it('POST valid build returns 201', async () => {
        const response = await request(app).post('/api/v1/builds').set(KEY)
            .send({ name: "TEST Build", budget: 1000, components: [cpuId, moboId] });
        expect(response.status).toBe(201);
        buildId = response.body._id;
    });

    it('POST build with unknown component returns 400', async () => {
        const response = await request(app).post('/api/v1/builds').set(KEY)
            .send({ name: "TEST Bad Build", budget: 1000, components: [unknownId] });
        expect(response.status).toBe(400);
    });

    it('POST build with missing budget returns 400', async () => {
        const response = await request(app).post('/api/v1/builds').set(KEY)
            .send({ name: "TEST No Budget", components: [] });
        expect(response.status).toBe(400);
    });

    it('GET build by id returns populated components', async () => {
        const response = await request(app).get(`/api/v1/builds/${buildId}`);
        expect(response.status).toBe(200);
        expect(response.body.components[0].name).toBeDefined();
    });

    it('GET builds with maxBudget only returns cheaper builds', async () => {
        const response = await request(app).get('/api/v1/builds?maxBudget=1200');
        expect(response.status).toBe(200);
        expect(response.body.every((b: { budget: number }) => b.budget <= 1200)).toBe(true);
    });

    it('compatibility check finds the socket mismatch', async () => {
        const response = await request(app).get(`/api/v1/builds/${buildId}/compatibility`);
        expect(response.status).toBe(200);
        expect(response.body.compatible).toBe(false);
        expect(response.body.issues.some((i: string) => i.includes("socket"))).toBe(true);
    });

    it('compatibility check on unknown build returns 404', async () => {
        const response = await request(app).get(`/api/v1/builds/${unknownId}/compatibility`);
        expect(response.status).toBe(404);
    });

    it('PUT build budget returns 200', async () => {
        const response = await request(app).put(`/api/v1/builds/${buildId}`).set(KEY).send({ budget: 1100 });
        expect(response.status).toBe(200);
        expect(response.body.budget).toBe(1100);
    });

    it('DELETE a component used in a build returns 409', async () => {
        const response = await request(app).delete(`/api/v1/components/${cpuId}`).set(KEY);
        expect(response.status).toBe(409);
    });

    it('cleans up: delete build, then both components', async () => {
        expect((await request(app).delete(`/api/v1/builds/${buildId}`).set(KEY)).status).toBe(204);
        expect((await request(app).delete(`/api/v1/components/${cpuId}`).set(KEY)).status).toBe(204);
        expect((await request(app).delete(`/api/v1/components/${moboId}`).set(KEY)).status).toBe(204);
    });
});