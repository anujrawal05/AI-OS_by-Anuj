const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./openapi.json');

function setupSwagger(app) {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  console.log('[Swagger Docs] Interactive endpoint registered at /api-docs');
}

module.exports = {
  setupSwagger
};
