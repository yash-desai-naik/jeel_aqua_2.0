import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0', // OpenAPI version
    info: {
      title: 'Jeel Aqua API',
      version: '1.0.0',
      description: 'API documentation for the Jeel Aqua Water Supply Dashboard backend',
      contact: {
        name: 'Support Team',
        // email: 'support@example.com',
      },
    },
    servers: [
      {
        url: `https://jeelaquabackend20.vercel.app/api`, // Add your Vercel URL
        description: 'Production server',
      },
      {
        url: `http://localhost:${process.env.PORT || 3001}/api`, // Adjust based on your base path
        description: 'Development server',
      },
      // Add production server URL if applicable
    ],
    // Define security schemes (e.g., Bearer Token for JWT)
    components: {
      securitySchemes: {
        bearerAuth: { // Name of the security scheme
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT', // Optional: format description
        },
      },
      // Define reusable schemas based on models (interfaces)
      // We will add these via JSDoc comments in model files later
      schemas: { 
        // Placeholder for schemas defined via JSDoc
      },
    },
    // Define global security requirement (applies Bearer token to all routes)
    // Individual routes can override this if they don't need auth
    security: [
      {
        bearerAuth: [], // References the security scheme defined above
      },
    ],
  },
  // Path to the API docs files (routes definitions)
  apis: ['./src/routes/*.ts', './src/models/*.ts'], // Include models to define schemas
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec; 