const { z } = require('zod');

const signupSchema = z.object({
  email: z.string({ required_error: "Email is required" }).email("Invalid email format"),
  password: z.string({ required_error: "Password is required" }).min(6, "Password must be at least 6 characters")
});

const loginSchema = z.object({
  email: z.string({ required_error: "Email is required" }).email("Invalid email format"),
  password: z.string({ required_error: "Password is required" })
});

const verifyOtpSchema = z.object({
  email: z.string({ required_error: "Email is required" }).email("Invalid email format"),
  otp: z.string({ required_error: "OTP code is required" }).length(6, "OTP must be exactly 6 digits")
});

const resendOtpSchema = z.object({
  email: z.string({ required_error: "Email is required" }).email("Invalid email format")
});

const forgotPasswordSchema = z.object({
  email: z.string({ required_error: "Email is required" }).email("Invalid email format")
});

const resetPasswordSchema = z.object({
  token: z.string({ required_error: "Reset token is required" }),
  password: z.string({ required_error: "Password is required" }).min(6, "Password must be at least 6 characters")
});

// Middleware factory to validate requests against schemas
function validateRequest(schema) {
  return (req, res, next) => {
    try {
      schema.parse(req.body);
      next();
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          error: "Validation failed",
          details: err.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message
          }))
        });
      }
      next(err);
    }
  };
}

module.exports = {
  signupSchema,
  loginSchema,
  verifyOtpSchema,
  resendOtpSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  validateRequest
};
