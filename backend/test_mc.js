import { query, getClient } from './src/config/database.js';
import { SimulationsService } from './src/modules/simulations/simulations.service.js';

async function main() {
  try {
    const bts = await query(`SELECT id, user_id FROM backtests WHERE status = 'COMPLETED' LIMIT 1`);
    if (bts.rows.length === 0) {
      console.log('No completed backtests found.');
      return;
    }
    const backtestId = bts.rows[0].id;
    const userId = bts.rows[0].user_id;

    console.log('Running MC for', backtestId, 'as user', userId);
    const res = await SimulationsService.runMonteCarlo(userId, { backtestId, simulations: 1000 });
    console.log('Success:', res);
  } catch (err) {
    console.error('ERROR OCCURRED:', err);
  }
  process.exit(0);
}
main();
