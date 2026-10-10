import swaggerJSDoc from 'swagger-jsdoc';
import { z } from 'zod';
import { componentBaseZSchema } from '../models/component.model';
import { createBuildZSchema } from '../models/build.model';

const options: swaggerJSDoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'PC Build Planner API',
            version: '1.0.0',
            description: 'REST API for managing PC components and builds, with compatibility checking'
        },
        servers: [
            {
                url: "/api/v1",
            },
        ],
        components: {
            securitySchemes: {
                ApiKeyAuth: { type: 'apiKey', in: 'header', name: 'x-api-key' },
            },
            schemas: {
                ComponentInput: z.toJSONSchema(componentBaseZSchema, { target: 'openapi-3.0' }),
                BuildInput: z.toJSONSchema(createBuildZSchema, { target: 'openapi-3.0' }),
            },
        },
    },
    apis: ['./src/controllers/*.ts']
};

export const swaggerSpec = swaggerJSDoc(options);