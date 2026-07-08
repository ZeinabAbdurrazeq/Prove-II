import dotenv from "dotenv";

dotenv.config({ quiet: true });

export const OPENAI_MOCK_MODE =
  String(process.env.OPENAI_MOCK_MODE || "").toLowerCase() === "true" ||
  process.env.OPENAI_MOCK_MODE === "1";

export const ENV = {
  PORT: process.env.PORT,
  DB_URL: process.env.DB_URL,
  NODE_ENV: process.env.NODE_ENV,
  INNGEST_EVENT_KEY: process.env.INNGEST_EVENT_KEY,
  INNGEST_SIGNING_KEY: process.env.INNGEST_SIGNING_KEY,
  STREAM_API_KEY: process.env.STREAM_API_KEY,
  STREAM_API_SECRET: process.env.STREAM_API_SECRET,
  CLIENT_URL: process.env.CLIENT_URL,
  JUDGE0_API_URL: process.env.JUDGE0_API_URL,
  JUDGE0_API_KEY: process.env.JUDGE0_API_KEY,
  JUDGE0_API_HOST: process.env.JUDGE0_API_HOST,
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  RESEND_FROM: process.env.RESEND_FROM,
  OPENAI_MOCK_MODE: process.env.OPENAI_MOCK_MODE,
  AI_API_KEYS: process.env.AI_API_KEYS,
  AI_API_KEY: process.env.AI_API_KEY,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  ITI_API_KEY: process.env.ITI_API_KEY,
  ITI_API_BASE_URL: process.env.ITI_API_BASE_URL,
  ITI_MODEL: process.env.ITI_MODEL,
  ITI_FALLBACK_MODEL: process.env.ITI_FALLBACK_MODEL,
  ITI_VISION_MODEL: process.env.ITI_VISION_MODEL,
  ADMIN_EMAIL: process.env.ADMIN_EMAIL,
  CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
  CLERK_PUBLISHABLE_KEY: process.env.CLERK_PUBLISHABLE_KEY,
  PAYPAL_CLIENT_ID: process.env.PAYPAL_CLIENT_ID,
  PAYPAL_CLIENT_SECRET: process.env.PAYPAL_CLIENT_SECRET,
  PAYPAL_ENV: process.env.PAYPAL_ENV || "sandbox",
};
