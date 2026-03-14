// Tenta conexão direta ao postgres via porta 5432
import pg from 'pg'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const env = {}
for (const line of readFileSync(join(__dirname, '../.env.local'), 'utf8').split('\n')) {
  if (!line.trim() || line.startsWith('#') || !line.includes('=')) continue
  const [k, ...v] = line.split('=')
  env[k.trim()] = v.join('=').trim()
}

const REF = env['NEXT_PUBLIC_SUPABASE_URL'].replace('https://','').replace('.supabase.co','')
const SERVICE_KEY = env['SUPABASE_SERVICE_ROLE_KEY']

// Tentativas de conexão (senha = service role key, ou vazia, ou 'postgres')
const attempts = [
  { host: `db.${REF}.supabase.co`,                    port: 5432, user: 'postgres',              password: SERVICE_KEY },
  { host: `db.${REF}.supabase.co`,                    port: 5432, user: 'postgres',              password: '' },
  { host: `aws-0-us-east-1.pooler.supabase.com`,     port: 5432, user: `postgres.${REF}`,        password: SERVICE_KEY },
  { host: `aws-0-us-east-2.pooler.supabase.com`,     port: 5432, user: `postgres.${REF}`,        password: SERVICE_KEY },
  { host: `aws-0-sa-east-1.pooler.supabase.com`,     port: 5432, user: `postgres.${REF}`,        password: SERVICE_KEY },
  { host: `aws-0-eu-west-1.pooler.supabase.com`,     port: 5432, user: `postgres.${REF}`,        password: SERVICE_KEY },
]

for (const cfg of attempts) {
  const client = new pg.Client({ ...cfg, database: 'postgres', ssl: { rejectUnauthorized: false }, connectionTimeoutMillis: 5000 })
  try {
    await client.connect()
    console.log(`✅ Conectado! host=${cfg.host} user=${cfg.user}`)
    await client.end()
    process.exit(0)
  } catch (e) {
    console.log(`✗  ${cfg.host} (${cfg.user}): ${e.message}`)
  } finally {
    try { await client.end() } catch {}
  }
}
console.log('\nNenhuma conexão funcionou sem a senha do banco.')
