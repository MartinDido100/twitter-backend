import swaggerJSDoc from 'swagger-jsdoc'

// Swagger options
const swaggerDefinition = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Twitter Backend API',
      version: '1.0.0',
      description: 'Twitter Backend API with Node.js, Express, and Prisma'
    },
    components: {
      securitySchemes: {
        auth: {
          type: 'http',
          in: 'header',
          name: 'Authorization',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    servers: [
      {
        url: 'http://localhost:8080/api'
      }
    ]
  },
  apis: ['./src/domains/**/*.controller.ts']
}

export const swaggerSpec = swaggerJSDoc(swaggerDefinition)
