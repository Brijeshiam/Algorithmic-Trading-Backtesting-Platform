import { query } from './src/config/database.js';

async function main() {
  const res = await query('SELECT error_message FROM simulation_jobs ORDER BY created_at DESC LIMIT 5');
  console.log(res.rows);
  process.exit(0);
}
main();
