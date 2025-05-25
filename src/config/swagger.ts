import express from 'express';
import swaggerJsDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

export const setupSwagger = (app: express.Application) => {
  const swaggerOptions = {
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'Urban Ease API',
        version: '1.0.0',
        description: 'API documentation for Urban Ease backend services',
      },
      servers: [
        {
          url: process.env.NODE_ENV === 'production'
            ? 'https://api.urbanease.com'
            : 'http://localhost:3000',
          description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server',
        },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
      security: [
        {
          bearerAuth: [],
        },
      ],
    },
    apis: ['./src/routes/*.ts', './src/entities/*.ts'],
  };

  const swaggerDocs = swaggerJsDoc(swaggerOptions);
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

  console.log('Swagger documentation available at /api-docs');
};