import 'dotenv/config';
import { runDailyCheck } from '../src/flows/deadman-switch';
import { closeDb } from '../src/services/mongodb/client';

runDailyCheck()
  .then(() => { console.log('Dead-man switch check complete'); closeDb(); })
  .catch(err => { console.error(err); process.exit(1); });
