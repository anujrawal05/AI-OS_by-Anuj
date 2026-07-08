/**
 * Middleware factory to validate Express request segments against Zod schemas
 * @param {Object} schemas - Schema object containing body, query, or params keys
 */
function validate(schemas) {
  return (req, res, next) => {
    try {
      if (schemas.body) {
        req.body = schemas.body.parse(req.body);
      }
      if (schemas.query) {
        req.query = schemas.query.parse(req.query);
      }
      if (schemas.params) {
        req.params = schemas.params.parse(req.params);
      }
      next();
    } catch (error) {
      next(error); // Pass schema errors straight to global errorHandler middleware
    }
  };
}

module.exports = validate;
