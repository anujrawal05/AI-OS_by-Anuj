const { z } = require('zod');

const getNewsSchema = z.object({
  category: z.enum(['business', 'technology', 'science', 'health', 'sports', 'entertainment', 'general']).default('general')
});

module.exports = {
  getNewsSchema
};
