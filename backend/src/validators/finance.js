const { z } = require('zod');

const getQuoteSchema = z.object({
  symbol: z.string({ required_error: "symbol query parameter is required" }).min(1, "symbol cannot be empty")
});

module.exports = {
  getQuoteSchema
};
