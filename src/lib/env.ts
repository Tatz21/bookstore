export const serverEnv = {
  databaseUrl: process.env.DATABASE_URL || "file:./dev.db",
  authSecret: process.env.AUTH_SECRET || "dev-secret-change-me-in-production",
  googleClientId: process.env.GOOGLE_CLIENT_ID || "",
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
  appUrl: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  currency: (process.env.NEXT_PUBLIC_CURRENCY || "INR").toUpperCase(),
  storeName: process.env.NEXT_PUBLIC_STORE_NAME || "Folio & Spine",
  cloudinaryCloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "",
  cloudinaryApiKey: process.env.CLOUDINARY_API_KEY || "",
  cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET || "",
  cloudinaryUploadPreset: process.env.CLOUDINARY_UPLOAD_PRESET || "book_covers",
  paymentProvider: (process.env.PAYMENT_PROVIDER || "mock").toLowerCase() as
    | "mock"
    | "razorpay"
    | "stripe",
  razorpayKeyId: process.env.RAZORPAY_KEY_ID || "",
  razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET || "",
  razorpayWebhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET || "",
  stripeSecretKey: process.env.STRIPE_SECRET_KEY || "",
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET || "",
  resendApiKey: process.env.RESEND_API_KEY || "",
  emailFrom:
    process.env.EMAIL_FROM || "Folio & Spine <orders@folioandspine.example>",
};

export function isCloudinaryConfigured(): boolean {
  return Boolean(
    serverEnv.cloudinaryCloudName &&
      serverEnv.cloudinaryApiKey &&
      serverEnv.cloudinaryApiSecret
  );
}
