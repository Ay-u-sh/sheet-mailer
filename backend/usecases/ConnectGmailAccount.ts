export type VerifiedGoogleIdentity = {
  googleSub: string;
  email: string;
};

export type ApplicationUser = {
  id: string;
  googleSub: string;
  email: string;
};

export type GmailConnection = {
  googleSub: string;
  email: string;
  refreshToken: string;
};

export type GmailAuthorization = {
  authorizationUrl: string;
};

export type GmailAuthorizationResult = {
  code: string;
  state: string;
};

export interface ApplicationUserRepository {
  findByGoogleSub(googleSub: string): Promise<ApplicationUser | undefined>;
  create(googleSub: string, email: string): Promise<ApplicationUser>;
}

export interface GmailOAuthProvider {
  createAuthorizationUrl(state: string): string;
  exchangeCode(code: string): Promise<GmailConnection>;
}

export interface GmailConnectionRepository {
  save(userId: string, connection: GmailConnection): Promise<void>;
}

export interface OAuthStateRepository {
  saveState(state: string, userId: string, expiresAt: number): Promise<void>;
  consume(state: string): Promise<string | undefined>;
}

export interface SecureStateGenerator {
  generate(): string;
}

export class ConnectGmailAccount {
  constructor(
    private readonly users: ApplicationUserRepository,
    private readonly oauth: GmailOAuthProvider,
    private readonly connections: GmailConnectionRepository,
    private readonly states: OAuthStateRepository,
    private readonly stateGenerator: SecureStateGenerator
  ) {}

  async start(identity: VerifiedGoogleIdentity): Promise<GmailAuthorization> {
    let user: ApplicationUser | undefined = await this.users.findByGoogleSub(identity.googleSub);

    if (!user)
      user = await this.users.create(identity.googleSub, identity.email);

    const state: string = this.stateGenerator.generate();
    const expiresAt: number = Date.now() + 10 * 60 * 1000;

    await this.states.saveState(state, user.id, expiresAt);

    return {
      authorizationUrl: this.oauth.createAuthorizationUrl(state)
    };
  }

  async complete(authorization: GmailAuthorizationResult): Promise<void> {
    const userId: string | undefined = await this.states.consume(authorization.state);

    if (!userId)
      throw new Error("Gmail authorization state is invalid, expired, or already used.");

    const connection: GmailConnection = await this.oauth.exchangeCode(authorization.code);

    if (!connection.refreshToken)
      throw new Error("Google did not return a refresh token. Gmail authorization must be completed again.");

    await this.connections.save(userId, connection);
  }
} 