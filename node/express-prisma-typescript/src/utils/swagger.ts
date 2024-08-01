import swaggerJSDoc from 'swagger-jsdoc'
import { Constants, NodeEnv } from './constants'

const servers = Constants.NODE_ENV === NodeEnv.DEV ? [{ url: 'http://localhost:8080/api' }] : [{ url: 'http://localhost:8080/api' }, { url: Constants.DEPLOY_URL }]

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
    servers
  },
  apis: ['./src/domains/**/*.controller.ts']
}

export const swaggerSpec = swaggerJSDoc(swaggerDefinition)
