export const ENV = {
  appId: process.env.VITE_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  // Manus built-in API (used on Manus hosting; optional on Railway)
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
  // OpenAI direct (used on Railway)
  openaiApiKey: process.env.OPENAI_API_KEY ?? "",
  // Resend for email notifications
  resendApiKey: process.env.RESEND_API_KEY ?? "",
};
