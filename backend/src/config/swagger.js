const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// ─── Swagger configuration ───
// This tells swagger-jsdoc where to find API documentation comments
// and what metadata to display on the docs page.
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',  // OpenAPI 3.0 spec

    info: {
      title: 'Sales Insight Automator API',
      version: '1.0.0',
      description:
        'Upload a CSV/XLSX sales file and receive an AI-generated summary report via email. ' +
        'Powered by Groq (Llama 3) for analysis and Resend for email delivery.',
      contact: {
        name: 'Rabbitt AI',
      },
    },

    servers: [
      {
        url: `http://localhost:${process.env.PORT || 5001}`,
        description: 'Local development server',
      },
    ],
  },

  // ─── Tell swagger-jsdoc where to scan for JSDoc comments ───
  // It will look at all .js files in the routes folder for @swagger blocks
  apis: ['./src/routes/*.js'],
};

// ─── Generate the Swagger spec from our JSDoc comments ───
const swaggerSpec = swaggerJsdoc(swaggerOptions);

module.exports = { swaggerUi, swaggerSpec };
