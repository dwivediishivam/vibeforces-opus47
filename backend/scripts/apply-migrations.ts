import fs from "node:fs";
import path from "node:path";
import dotenv from "dotenv";
import { Client } from "pg";

dotenv.config();
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const migrationsDir = path.resolve(process.cwd(), "supabase/migrations");
const migrationFiles = fs
  .readdirSync(migrationsDir)
  .filter((file) => file.endsWith(".sql"))
  .sort();

function getProjectRef() {
  const supabaseUrl = process.env.SUPABASE_URL;
  if (!supabaseUrl) {
    return null;
  }

  return new URL(supabaseUrl).hostname.split(".")[0] ?? null;
}

async function applyWithPostgres(connectionString: string) {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();

  try {
    for (const file of migrationFiles) {
      const sql = fs.readFileSync(path.join(migrationsDir, file), "utf8");
      if (!sql.trim()) continue;

      process.stdout.write(`Applying ${file} via direct Postgres...\n`);
      await client.query(sql);
    }
  } finally {
    await client.end();
  }
}

async function applyWithManagementApi() {
  const accessToken = process.env.SUPABASE_ACCESS_TOKEN;
  const projectRef = getProjectRef();

  if (!accessToken || !projectRef) {
    throw new Error(
      "SUPABASE_ACCESS_TOKEN and SUPABASE_URL are required for Management API migrations.",
    );
  }

  for (const file of migrationFiles) {
    const sql = fs.readFileSync(path.join(migrationsDir, file), "utf8");
    if (!sql.trim()) continue;

    process.stdout.write(`Applying ${file} via Supabase Management API...\n`);
    const response = await fetch(
      `https://api.supabase.com/v1/projects/${projectRef}/database/query`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          "User-Agent": "codex",
        },
        body: JSON.stringify({ query: sql }),
      },
    );

    if (!response.ok) {
      throw new Error(
        `Management API migration failed for ${file}: ${response.status} ${await response.text()}`,
      );
    }
  }
}

async function main() {
  const directConnectionCandidates = [
    process.env.DATABASE_URL,
    process.env.SUPABASE_DIRECT_CONNECTION_STRING,
  ].filter(Boolean) as string[];

  if (directConnectionCandidates.length > 0) {
    for (const connectionString of directConnectionCandidates) {
      try {
        await applyWithPostgres(connectionString);
        process.stdout.write("All migrations applied.\n");
        return;
      } catch (error) {
        console.warn(
          `Direct Postgres migration attempt failed: ${
            error instanceof Error ? error.message : String(error)
          }`,
        );
      }
    }
  }

  await applyWithManagementApi();
  process.stdout.write("All migrations applied.\n");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
