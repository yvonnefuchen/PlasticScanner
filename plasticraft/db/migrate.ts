/**
 * Run pending database migrations.
 *
 * Usage:
 *   npx vercel env pull /tmp/plasticraft.env --yes
 *   POSTGRES_URL=$(grep POSTGRES_URL_NON_POOLING /tmp/plasticraft.env | cut -d'"' -f2) \
 *     node --loader ts-node/esm db/migrate.ts
 *
 * Or just ask Claude to run it — it has the Postgres connection string.
 */

import { Client } from 'pg';
import { readdir, readFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

async function migrate() {
  const client = new Client({
    connectionString: process.env.POSTGRES_URL,
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();

  // Ensure migrations tracking table exists
  await client.query(`
    CREATE TABLE IF NOT EXISTS _migrations (
      name       text PRIMARY KEY,
      applied_at timestamptz DEFAULT now()
    );
  `);

  const { rows: applied } = await client.query<{ name: string }>(
    'SELECT name FROM _migrations ORDER BY name'
  );
  const appliedNames = new Set(applied.map(r => r.name));

  const migrationsDir = join(__dirname, 'migrations');
  const files = (await readdir(migrationsDir)).filter(f => f.endsWith('.sql')).sort();

  let ran = 0;
  for (const file of files) {
    if (appliedNames.has(file)) {
      console.log(`  skip  ${file}`);
      continue;
    }
    const sql = await readFile(join(migrationsDir, file), 'utf8');
    console.log(`  apply ${file}`);
    await client.query(sql);
    await client.query('INSERT INTO _migrations (name) VALUES ($1)', [file]);
    ran++;
  }

  console.log(ran === 0 ? 'Already up to date.' : `Applied ${ran} migration(s).`);
  await client.end();
}

migrate().catch(e => { console.error(e.message); process.exit(1); });
