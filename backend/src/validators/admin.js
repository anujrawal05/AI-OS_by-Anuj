const { z } = require('zod');

const updatePlanSchema = z.object({
  tier: z.enum(['Free', 'Trial', 'Premium'], {
    required_error: "tier is required"
  })
});

const broadcastSchema = z.object({
  title: z.string({ required_error: "title is required" }).min(1, "title cannot be empty"),
  message: z.string({ required_error: "message is required" }).min(1, "message cannot be empty")
});

const ticketStatusSchema = z.object({
  ticketId: z.string({ required_error: "ticketId is required" }),
  status: z.enum(['Open', 'In_Progress', 'Closed'], {
    required_error: "status is required"
  })
});

module.exports = {
  updatePlanSchema,
  broadcastSchema,
  ticketStatusSchema
};
