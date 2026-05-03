import cron from 'node-cron';
import { getOverdueCheckIns, incrementMissedCheckIns, updateRiskLevel } from '../services/mongodb/workers';
import { runDeadManSwitch } from '../agent';
import { sendWorkerCheckinPrompt } from '../services/whatsapp/messages';
import { config } from '../config';

export function startDeadManSwitchCron(): void {
  // Run every day at 08:00 Nepal time (UTC+5:45 = 02:15 UTC)
  cron.schedule('15 2 * * *', async () => {
    console.log('[Dead-man Switch] Running daily check...');
    await runDailyCheck();
  });

  console.log('[Dead-man Switch] Cron scheduled — daily at 08:00 NPT');
}

export async function runDailyCheck(): Promise<void> {
  const thresholdDate = new Date();
  thresholdDate.setDate(thresholdDate.getDate() - config.deadmanSwitch.intervalDays);

  const overdueWorkers = await getOverdueCheckIns(thresholdDate);
  console.log(`[Dead-man Switch] Found ${overdueWorkers.length} overdue workers`);

  for (const worker of overdueWorkers) {
    const missed = await incrementMissedCheckIns(worker.workerId);

    if (missed === 1) {
      // First miss — send a friendly reminder
      await sendWorkerCheckinPrompt(worker.phone, worker.name.ne);
      console.log(`[Dead-man Switch] Reminder sent to ${worker.workerId}`);
    } else if (missed >= config.deadmanSwitch.missedBeforeEscalation) {
      // Threshold crossed — escalate
      await updateRiskLevel(worker.workerId, 'BLACK');
      await runDeadManSwitch(worker);
      console.log(`[Dead-man Switch] ESCALATED for ${worker.workerId} (${missed} missed)`);
    }
  }
}
