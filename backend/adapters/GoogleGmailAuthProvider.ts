import { google } from "googleapis";
import type { GoogleOAuthConfig } from "../config/googleOAuth.config.js";
import type {
  GmailConnection,
  GmailOAuthProvider
} from "../usecases/ConnectGmailAccount.js";

export class GoogleGmailOAuthProvider implements GmailOAuthProvider {
  private readonly clientId: string;
  private readonly oauthClient: InstanceType<typeof google.auth.OAuth2>;

  constructor(config: GoogleOAuthConfig) {
    this.clientId = config.clientId;

    this.oauthClient = new google.auth.OAuth2(
      config.clientId,
      config.clientSecret,
      config.redirectUri
    );
  }

  createAuthorizationUrl(state: string): string {
    return this.oauthClient.generateAuthUrl({
      access_type: "offline",
      include_granted_scopes: true,
      prompt: "consent",
      scope: [
        "openid",
        "email",
        "https://www.googleapis.com/auth/gmail.send"
      ],
      state
    });
  }

  async exchangeCode(code: string): Promise<GmailConnection> {
    const { tokens } = await this.oauthClient.getToken(code);

    if (!tokens.id_token)
      throw new Error("Google did not return an identity token.");

    if (!tokens.refresh_token)
      throw new Error("Google did not return a refresh token.");

    const ticket = await this.oauthClient.verifyIdToken({
      idToken: tokens.id_token,
      audience: this.clientId
    });

    const identity = ticket.getPayload();

    if (
      !identity ||
      !identity.sub ||
      !identity.email ||
      identity.email_verified !== true
    )
      throw new Error("Google account identity could not be verified.");

    return {
      googleSub: identity.sub,
      email: identity.email,
      refreshToken: tokens.refresh_token
    };
  }
}