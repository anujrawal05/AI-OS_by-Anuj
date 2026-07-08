const { z } = require('zod');

const chatSchema = z.object({
  userInput: z.string({ required_error: "userInput is required" }).min(1, "userInput cannot be empty"),
  history: z.array(
    z.object({
      role: z.enum(['system', 'user', 'assistant']),
      content: z.string()
    })
  ).optional(),
  stream: z.boolean().optional()
});

const compileSchema = z.object({
  businessName: z.string({ required_error: "businessName is required" }).min(1, "businessName cannot be empty"),
  targetAudience: z.string({ required_error: "targetAudience is required" }).min(1, "targetAudience cannot be empty"),
  bottleneck: z.string({ required_error: "bottleneck is required" }).min(1, "bottleneck cannot be empty")
});

module.exports = {
  chatSchema,
  compileSchema
};
