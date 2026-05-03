import { analyzeContract } from '../services/gemini/analyze';
import { updateContract } from '../services/mongodb/workers';
import { sendContractAnalysisResult } from '../services/whatsapp/messages';
import { sendTextMessage } from '../services/whatsapp/client';
import { WorkerProfile } from '../types';
import { MINIMUM_WAGES_NPR } from '../config';

export async function analyzeWorkerContract(
  worker: WorkerProfile,
  imageBuffer: Buffer,
  mimeType: string
): Promise<void> {
  await sendTextMessage(worker.phone, '📄 तपाईंको अनुबंध विश्लेषण गर्दैछौं... कृपया प्रतीक्षा गर्नुहोस्।');

  const analysis = await analyzeContract(
    imageBuffer,
    mimeType,
    worker.destination.country,
    worker.destination.sector
  );

  // Store in worker record
  await updateContract(worker.workerId, {
    uploadedAt: new Date(),
    hash: analysis.hash,
    extractedTerms: analysis.extractedTerms,
    redFlags: analysis.redFlags,
    geminiSummaryNe: analysis.geminiSummaryNe,
    analyzedAt: analysis.analyzedAt,
  });

  // Send result to worker
  await sendContractAnalysisResult(
    worker.phone,
    analysis.geminiSummaryNe,
    analysis.redFlags.filter(f => f.severity === 'critical').length
  );

  // Send detailed report to family
  if (analysis.redFlags.length > 0) {
    const redFlagText = analysis.redFlags
      .map(f => `⚠️ ${f.messageNe}`)
      .join('\n');

    const minWage = MINIMUM_WAGES_NPR[worker.destination.country]?.[worker.destination.sector] ?? 35000;
    const salaryOk = analysis.extractedTerms.monthlySalaryNPR >= minWage;

    const familyReport = `📋 ${worker.name.ne}को अनुबंध विश्लेषण:\n\n` +
      `💰 तलब: NPR ${analysis.extractedTerms.monthlySalaryNPR.toLocaleString()} ${salaryOk ? '✅' : '⚠️ (न्यूनतम NPR ' + minWage.toLocaleString() + ' हुनुपर्छ)'}\n` +
      `⏰ काम: हप्तामा ${analysis.extractedTerms.weeklyHours} घण्टा\n` +
      `✈️ फिर्ती टिकट: ${analysis.extractedTerms.returnTicketIncluded ? '✅ समावेश' : '❌ समावेश छैन'}\n` +
      `\n${redFlagText}`;

    const { sendTextMessage: sendText } = await import('../services/whatsapp/client');
    await sendText(worker.familyPhone, familyReport);
  }
}
