import { sendTextMessage, sendInteractiveButtons } from './client';
import type { SeverityLevel, CaseFile, WorkerProfile } from '../../types';
import { config } from '../../config';

const SEVERITY_EMOJI: Record<SeverityLevel, string> = {
  GREEN: '✅',
  YELLOW: '⚠️',
  RED: '🔴',
  BLACK: '🚨',
};

export async function sendWorkerResponse(phone: string, messageNe: string): Promise<void> {
  await sendTextMessage(phone, messageNe);
}

export async function sendWorkerCheckinPrompt(phone: string, workerNameNe: string): Promise<void> {
  await sendInteractiveButtons(
    phone,
    `${workerNameNe}, नमस्ते! साप्ताहिक जानकारी दिनुहोस्।\n(Weekly check-in time!)`,
    [
      { id: 'checkin_ok', title: '✅ म ठिक छु' },
      { id: 'checkin_help', title: '⚠️ मद्दत चाहिन्छ' },
      { id: 'checkin_emergency', title: '🚨 आपतकाल' },
    ]
  );
}

export async function sendFamilyAlert(
  familyPhone: string,
  workerNameNe: string,
  severity: SeverityLevel,
  situation: string,
  caseId?: string
): Promise<void> {
  const emoji = SEVERITY_EMOJI[severity];
  const dashboardLink = `${config.dashboardUrl}/family`;

  let message: string;
  if (severity === 'GREEN') {
    message = `${emoji} ${workerNameNe} ठिक हुनुहुन्छ। साप्ताहिक जाँच सम्पन्न।`;
  } else if (severity === 'YELLOW') {
    message = `${emoji} ध्यान दिनुहोस्: ${workerNameNe}ले समस्या जनाउनुभएको छ।\n\n${situation}\n\nहामीले काम शुरू गरिसक्यौं। अपडेटको लागि: ${dashboardLink}`;
  } else if (severity === 'RED') {
    message = `${emoji} महत्त्वपूर्ण: ${workerNameNe}लाई सहायता चाहिन्छ।\n\nस्थिति: ${situation}\n\nकेस ID: ${caseId ?? 'N/A'}\nसाफरले दूतावास र NGO लाई सूचित गरिसक्यो।\n\nविस्तृत जानकारी: ${dashboardLink}`;
  } else {
    message = `🚨 अत्यावश्यक: ${workerNameNe}को ${config.deadmanSwitch.missedBeforeEscalation} हप्तादेखि कुनै खबर छैन!\n\nसाफरले आपतकालीन प्रतिक्रिया शुरू गरेको छ।\nकेस ID: ${caseId ?? 'N/A'}\n\nअहिले जाँच गर्नुहोस्: ${dashboardLink}`;
  }

  await sendTextMessage(familyPhone, message);
}

export async function sendNGONotification(
  ngoPhone: string,
  caseFile: CaseFile,
  worker: WorkerProfile
): Promise<void> {
  const message = `[SAFAR ALERT] NEW CASE: ${caseFile.caseId}

Worker: ${worker.name.en} | ${worker.destination.country}
Employer: ${worker.destination.employer}
Violation: ${caseFile.violationType.replace(/_/g, ' ').toUpperCase()}
Severity: ${caseFile.severity}

Summary: ${caseFile.summary.en}

Complaint letters (NP + EN) are ready.
Family has been notified.
Embassy alerted: ${caseFile.embassyAlerted ? 'YES' : 'NO'}

Contact worker family: ${worker.familyPhone}

— SAFAR Automated Alert`;

  await sendTextMessage(ngoPhone, message);
}

export async function sendRegistrationConfirmation(phone: string, workerNameNe: string, _destination: string): Promise<void> {
  const message = `सफरमा स्वागत छ, ${workerNameNe}! 🙏

तपाईंको दर्ता सम्पन्न भयो।

📋 तपाईंको Dignity Passport बनेको छ
🔔 हरेक आइतबार check-in गर्नुहोस्
🆘 समस्यामा: यहाँ voice note पठाउनुहोस्

तपाईंको परिवारलाई पनि सूचित गरिएको छ।

आफ्नो यात्रा सुरक्षित होस्। सफर सधैं तपाईंसँग छ। 🇳🇵`;

  await sendTextMessage(phone, message);
}

export async function sendContractAnalysisResult(
  phone: string,
  summaryNe: string,
  redFlagCount: number
): Promise<void> {
  const flagText = redFlagCount === 0
    ? '✅ कुनै समस्या फेलिएन।'
    : `⚠️ ${redFlagCount} समस्या फेलियो। ध्यान दिनुहोस्।`;

  await sendTextMessage(phone, `📄 अनुबंध विश्लेषण:\n\n${summaryNe}\n\n${flagText}\n\nविस्तृत रिपोर्ट तपाईंको परिवारलाई पठाइएको छ।`);
}

export async function sendEvidenceChecklist(phone: string, violationType: string, items: string[]): Promise<void> {
  const listText = items.map((item, i) => `${i + 1}. ${item}`).join('\n');
  await sendTextMessage(
    phone,
    `📋 कृपया यी प्रमाणहरू सङ्कलन गर्नुहोस्:\n\n${listText}\n\nहरेक कुरा यहाँ WhatsApp मा पठाउनुहोस्।`
  );
}
