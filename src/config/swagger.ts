import express from 'express';
import swaggerJsDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

export const setupSwagger = (app: express.Application) => {
  const isProduction = process.env.NODE_ENV === 'production';
  
  const swaggerOptions = {
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'Urban Ease API',
        version: '1.0.0',
        description: 'API documentation for Urban Ease backend services - Beauty and Wellness Service Booking Platform',
        contact: {
          name: 'Urban Ease Development Team',
          email: 'urbanease2@gmail.com'
        }
      },
      servers: [
        {
          url: isProduction 
            ? `https://${process.env.RAILWAY_STATIC_URL || 'your-app.railway.app'}`
            : 'http://localhost:3000',
          description: isProduction ? 'Production server (Railway)' : 'Development server',
        },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
            description: 'Enter JWT token obtained from login endpoint'
          },
        },
        schemas: {
          User: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid' },
              email: { type: 'string', format: 'email' },
              role: { type: 'string', enum: ['CUSTOMER', 'BUSINESS', 'ADMIN'] },
              is_email_verified: { type: 'boolean' },
              created_at: { type: 'string', format: 'date-time' },
              updated_at: { type: 'string', format: 'date-time' }
            }
          },
          LoginRequest: {
            type: 'object',
            required: ['email', 'password'],
            properties: {
              email: { type: 'string', format: 'email', example: 'admin@urbanease.com' },
              password: { type: 'string', minLength: 8, example: 'Admin@123' }
            }
          },
          LoginResponse: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              message: { type: 'string' },
              data: {
                type: 'object',
                properties: {
                  user: { $ref: '#/components/schemas/User' },
                  accessToken: { type: 'string' },
                  expiresIn: { type: 'number' }
                }
              }
            }
          },
          ErrorResponse: {
            type: 'object',
            properties: {
              success: { type: 'boolean', example: false },
              message: { type: 'string' }
            }
          }
        }
      },
      security: [
        {
          bearerAuth: [],
        },
      ],
    },
    apis: [
      './src/routes/*.ts', 
      './src/entities/*.ts'
    ],
  };

  try {
    const swaggerDocs = swaggerJsDoc(swaggerOptions);
    
    // Customize Swagger UI
    const swaggerUiOptions = {
      customCss: `
        .swagger-ui .topbar { display: none }
        .swagger-ui .info .title { color: #4CAF50; }
      `,
      customSiteTitle: 'Urban Ease API Documentation',
      swaggerOptions: {
        persistAuthorization: true,
        displayRequestDuration: true,
        tryItOutEnabled: true,
        filter: true,
        showExtensions: true,
        showCommonExtensions: true
      }
    };

    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs, swaggerUiOptions));
    
    // JSON endpoint for swagger spec
    app.get('/api-docs.json', (req, res) => {
      res.setHeader('Content-Type', 'application/json');
      res.send(swaggerDocs);
    });

    console.log('✅ Swagger documentation available at /api-docs');
  } catch (error) {
    console.error('❌ Error setting up Swagger:', error);
  }
};