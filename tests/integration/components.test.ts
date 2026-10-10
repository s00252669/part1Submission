import request from "supertest";
import { app } from "../../src/app";
import { env } from "../../src/config/env";

const KEY = { "x-api-key": env.apiKey };
const testCpu = { name: "TEST CPU", type: "CPU", brand: "Test", price: 100, wattage: 65, socket: "AM5" };
const unknownId = "6700000000000000000000aa";

describe('Components API', () => {
    let id: string;

    it('POST valid component returns 201', async () => {
        const response = await request(app).post('/api/v1/components').set(KEY).send(testCpu);
        expect(response.status).toBe(201);
        expect(response.body.name).toBe(testCpu.name);
        id = response.body._id;
    });

    it('POST without API key returns 401', async () => {
        const response = await request(app).post('/api/v1/components').send(testCpu);
        expect(response.status).toBe(401);
    });

    it('POST invalid data returns 400', async () => {
        const response = await request(app).post('/api/v1/components').set(KEY).send({ ...testCpu, price: -5 });
        expect(response.status).toBe(400);
    });

    it('GET all returns 200 and a list', async () => {
        const response = await request(app).get('/api/v1/components');
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body.items)).toBe(true);
    });

    it('GET with type filter only returns that type', async () => {
        const response = await request(app).get('/api/v1/components?type=CPU');
        expect(response.status).toBe(200);
        expect(response.body.items.every((c: { type: string }) => c.type === 'CPU')).toBe(true);
    });

    it('GET with fields only returns those fields', async () => {
        const response = await request(app).get('/api/v1/components?fields=name');
        expect(response.status).toBe(200);
        expect(response.body.items[0].price).toBeUndefined();
    });

    it('GET with a bad sort value returns 400', async () => {
        const response = await request(app).get('/api/v1/components?sort=banana');
        expect(response.status).toBe(400);
    });

    it('GET by id returns 200', async () => {
        const response = await request(app).get(`/api/v1/components/${id}`);
        expect(response.status).toBe(200);
    });

    it('GET malformed id returns 400', async () => {
        const response = await request(app).get('/api/v1/components/abc');
        expect(response.status).toBe(400);
    });

    it('GET unknown id returns 404', async () => {
        const response = await request(app).get(`/api/v1/components/${unknownId}`);
        expect(response.status).toBe(404);
    });

    it('PUT valid returns 200', async () => {
        const response = await request(app).put(`/api/v1/components/${id}`).set(KEY).send({ price: 99 });
        expect(response.status).toBe(200);
        expect(response.body.price).toBe(99);
    });

    it('PUT invalid data returns 400', async () => {
        const response = await request(app).put(`/api/v1/components/${id}`).set(KEY).send({ price: "cheap" });
        expect(response.status).toBe(400);
    });

    it('PUT unknown id returns 404', async () => {
        const response = await request(app).put(`/api/v1/components/${unknownId}`).set(KEY).send({ price: 99 });
        expect(response.status).toBe(404);
    });

    it('DELETE returns 204', async () => {
        const response = await request(app).delete(`/api/v1/components/${id}`).set(KEY);
        expect(response.status).toBe(204);
    });

    it('GET after delete returns 404', async () => {
        const response = await request(app).get(`/api/v1/components/${id}`);
        expect(response.status).toBe(404);
    });

    it('DELETE again returns 404', async () => {
        const response = await request(app).delete(`/api/v1/components/${id}`).set(KEY);
        expect(response.status).toBe(404);
    });
});