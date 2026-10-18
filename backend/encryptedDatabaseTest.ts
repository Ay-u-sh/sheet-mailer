import Database from "better-sqlite3-multiple-ciphers";

const databasePath: string = "./encrypted-test.sqlite";
const encryptionKey: string = process.env.DATABASE_ENCRYPTION_KEY || "";

if (encryptionKey.length === 0)
  throw new Error("DATABASE_ENCRYPTION_KEY is required.");

function verifyDatabaseKey(key: string): boolean {
  const database = new Database(databasePath);

  try {
    database.pragma(`key = "x'${key}'"`);

    const result: unknown = database.prepare("SELECT message FROM encryption_test LIMIT 1").get();

    database.close();

    return result !== undefined;
  } catch {
    database.close();
    return false;
  }
}

if (!verifyDatabaseKey(encryptionKey))
  throw new Error("Correct encryption key failed verification.");

console.log("Correct key accepted.");

if (verifyDatabaseKey("incorrect-test-key"))
  throw new Error("Incorrect encryption key was accepted.");

console.log("Incorrect key rejected.");