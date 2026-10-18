import "dotenv/config";

export type DatabaseConfig = {
  path: string;
  encryptionKey: string;
};

export function loadDatabaseConfig(): DatabaseConfig {
  const path: string = process.env.DATABASE_PATH || "./data/sheet-mailer.sqlite";
  const encryptionKey: string = process.env.DATABASE_ENCRYPTION_KEY || "";

  if (!/^[0-9a-fA-F]{64}$/.test(encryptionKey))
    throw new Error("DATABASE_ENCRYPTION_KEY must contain 64 hexadecimal characters.");

  return {
    path,
    encryptionKey
  };
}