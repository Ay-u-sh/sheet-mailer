
import { createCipheriv, randomBytes, randomUUID } from "node:crypto";
import type Database from "better-sqlite3-multiple-ciphers";
import type {
  ApplicationUser,
  ApplicationUserRepository,
  GmailConnection,
  GmailConnectionRepository
} from "../usecases/ConnectGmailAccount.js";

type AccountRow = {
  id: string;
  google_sub: string;
  email: string;
};

export class SqliteRepository implements ApplicationUserRepository, GmailConnectionRepository {
  private readonly tokenEncryptionKey: Buffer;

  constructor(private readonly database: Database.Database, tokenEncryptionKey: string) {
    if (!/^[0-9a-fA-F]{64}$/.test(tokenEncryptionKey))
      throw new Error("Token encryption key must contain 64 hexadecimal characters.");

    this.tokenEncryptionKey = Buffer.from(tokenEncryptionKey, "hex");
  }

  async findByGoogleSub(googleSub: string): Promise<ApplicationUser | undefined> {
    const row: AccountRow | undefined = this.database.prepare(`
      SELECT id, google_sub, email
      FROM accounts
      WHERE google_sub = ?
    `).get(googleSub) as AccountRow | undefined;

    if (!row)
      return undefined;

    return {
      id: row.id,
      googleSub: row.google_sub,
      email: row.email
    };
  }

  async create(googleSub: string, email: string): Promise<ApplicationUser> {
    const user: ApplicationUser = {
      id: randomUUID(),
      googleSub,
      email
    };

    this.database.prepare(`
      INSERT INTO accounts (id, google_sub, email)
      VALUES (?, ?, ?)
    `).run(user.id, user.googleSub, user.email);

    return user;
  }

  async save(userId: string, connection: GmailConnection): Promise<void> {
    const encryptedRefreshToken: string = this.encrypt(connection.refreshToken);

    this.database.prepare(`
      INSERT INTO gmail_connections (
        user_id,
        google_sub,
        email,
        encrypted_refresh_token
      )
      VALUES (?, ?, ?, ?)
      ON CONFLICT(user_id) DO UPDATE SET
        google_sub = excluded.google_sub,
        email = excluded.email,
        encrypted_refresh_token = excluded.encrypted_refresh_token,
        updated_at = CURRENT_TIMESTAMP
    `).run(
      userId,
      connection.googleSub,
      connection.email,
      encryptedRefreshToken
    );
  }

  private encrypt(value: string): string {
    const initializationVector: Buffer = randomBytes(12);
    const cipher = createCipheriv("aes-256-gcm", this.tokenEncryptionKey, initializationVector);
    const encryptedValue: Buffer = Buffer.concat([
      cipher.update(value, "utf8"),
      cipher.final()
    ]);
    const authenticationTag: Buffer = cipher.getAuthTag();

    return [
      initializationVector.toString("hex"),
      authenticationTag.toString("hex"),
      encryptedValue.toString("hex")
    ].join(":");
  }
}
