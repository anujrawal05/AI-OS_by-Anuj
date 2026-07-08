const { z } = require('zod');

const signupSchema = z.object({
  email: z.string({ required_error: "Email is required" }).email("Invalid email format"),
  password: z.string({ required_error: "Password is required" })
    .min(8, "Password must be at least 8 characters")
    .regex(/[a-z]/, "Password must include a lowercase letter")
    .regex(/[A-Z]/, "Password must include an uppercase letter")
    .regex(/[0-9]/, "Password must include a number"),
  name: z.string().optional()
});

const loginSchema = z.object({
  email: z.string({ required_error: "Email is required" }).email("Invalid email format"),
  password: z.string({ required_error: "Password is required" })
});

const verifyOtpSchema = z.object({
  email: z.string({ required_error: "Email is required" }).email("Invalid email format"),
  otp: z.string({ required_error: "OTP code is required" }).length(6, "OTP must be exactly 6 digits"),
  name: z.string().optional()
});

const resendOtpSchema = z.object({
  email: z.string({ required_error: "Email is required" }).email("Invalid email format")
});

const forgotPasswordSchema = z.object({
  email: z.string({ required_error: "Email is required" }).email("Invalid email format")
});

const resetPasswordSchema = z.object({
  token: z.string({ required_error: "Reset token is required" }),
  password: z.string({ required_error: "Password is required" })
    .min(8, "Password must be at least 8 characters")
    .regex(/[a-z]/, "Password must include a lowercase letter")
    .regex(/[A-Z]/, "Password must include an uppercase letter")
    .regex(/[0-9]/, "Password must include a number")
});

const updateProfileSchema = z.object({
  name: z.string().min(1, "Name cannot be empty").optional(),
  dateOfBirth: z.string().optional(), // Handled by standard Date parsing inside controller
  gender: z.enum(['Male', 'Female', 'Other', 'Prefer_Not_To_Say']).optional(),
  profession: z.string().min(1, "Profession cannot be empty").optional()
});

module.exports = {
  signupSchema,
  loginSchema,
  verifyOtpSchema,
  resendOtpSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  updateProfileSchema
};
