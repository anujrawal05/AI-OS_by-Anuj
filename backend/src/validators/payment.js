const { z } = require('zod');

const checkoutSchema = z.object({
  planType: z.enum(['Premium'], {
    required_error: "planType is required",
    invalid_type_error: "Only Premium plan is active for payments"
  })
});

const verifySignatureSchema = z.object({
  razorpay_order_id: z.string({ required_error: "razorpay_order_id is required" }),
  razorpay_payment_id: z.string({ required_error: "razorpay_payment_id is required" }),
  razorpay_signature: z.string({ required_error: "razorpay_signature is required" })
});

const couponSchema = z.object({
  couponCode: z.string({ required_error: "couponCode is required" }).min(1, "couponCode cannot be empty")
});

module.exports = {
  checkoutSchema,
  verifySignatureSchema,
  couponSchema
};
