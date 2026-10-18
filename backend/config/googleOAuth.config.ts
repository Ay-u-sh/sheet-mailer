import "dotenv/config";

export type GoogleOAuthConfig = {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
};

export function loadGoogleOAuthConfig(): GoogleOAuthConfig {
  const clientId: string = process.env.GOOGLE_CLIENT_ID || "";
  const clientSecret: string = process.env.GOOGLE_CLIENT_SECRET || "";
  const redirectUri: string = process.env.GOOGLE_REDIRECT_URI || "";

  if (!clientId || !clientSecret || !redirectUri)
    throw new Error("Google OAuth environment variables are required.");

  return {
    clientId,
    clientSecret,
    redirectUri
  };
}