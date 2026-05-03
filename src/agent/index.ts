import { getModel } from '../services/gemini/client';
import { analyzeSentiment, generateComplaintLetter, generateWorkerResponseNe } from '../services/gemini/analyze';
import { getLaborLaw, getNGOsForCase, searchEmployerIntelligence, detectEmployerPattern, recordEmployerPattern } from '../services/elastic/search';
import { getWorkerById } from '../services/mongodb/workers';
import { createCase, appendTimeline, updateNGOAssignment } from '../services/mongodb/cases';
import { sendFamilyAlert, sendNGONotification, sendEvidenceChecklist } from '../services/whatsapp/messages';
import { logPrediction, createPredictionId } from '../services/arize/monitor';
import { SAFAR_SYSTEM_PROMPT, EVIDENCE_CHECKLISTS } from './prompts';
import { SAFAR_TOOLS } from './tools';
import { AgentContext, AgentResponse, SeverityLevel, ViolationType, WorkerProfile, CaseFile } from '../types';
import { EMBASSY_CONTACTS, NGO_CONTACTS } from '../config';
import { v4 as uuidv4 } from 'uuid';

export async function runSAFARAgent(ctx: AgentContext): Promise<AgentResponse> {
  const startTime = Date.now();
  const predictionId = createPredictionId(ctx.worker.workerId);

  console.log(`[SAFAR Agent] Processing for worker: ${ctx.worker.workerId}`);

  // Step 1: Analyze sentiment and classify situation
  const workerContext = `Name: ${ctx.worker.name.en}, Destination: ${ctx.worker.destination.country} (${ctx.worker.destination.employer}), Sector: ${ctx.worker.destination.sector}`;
  const sentiment = await analyzeSentiment(ctx.message, workerContext);

  console.log(`[SAFAR Agent] Severity: ${sentiment.severity}, Issues: ${sentiment.detectedIssues.join(', ')}`);

  const latencyMs = Date.now() - startTime;

  // Log to Arize for monitoring
  await logPrediction({
    predictionId,
    workerId: ctx.worker.workerId,
    inputText: ctx.message,
    predictedSeverity: sentiment.severity,
    sentimentScore: sentiment.score,
    latencyMs,
    timestamp: new Date(),
    metadata: {
      destination: ctx.worker.destination.country,
      messageType: ctx.messageType,
      issuesCount: sentiment.detectedIssues.length,
    },
  });

  const actions: AgentResponse['actions'] = [];
  let caseFile: CaseFile | undefined;

  // Step 2: GREEN — just log and respond
  if (sentiment.severity === 'GREEN') {
    const responseNe = await generateWorkerResponseNe(
      ctx.message,
      'GREEN',
      ['check-in logged']
    );
    await sendFamilyAlert(ctx.worker.familyPhone, ctx.worker.name.ne, 'GREEN', '');
    actions.push({
      type: 'log_checkin',
      checkIn: {
        timestamp: new Date(),
        method: ctx.messageType === 'voice' ? 'voice' : 'text',
        rawTranscript: ctx.message,
        sentimentScore: sentiment.score,
        sentimentLabel: sentiment.label,
        detectedIssues: sentiment.detectedIssues,
        severity: 'GREEN',
        agentResponse: responseNe,
      },
    });

    return {
      severity: 'GREEN',
      responseNe,
      responseEn: 'Worker checked in. Everything looks fine.',
      actions,
    };
  }

  // Step 3: YELLOW/RED/BLACK — full agent reasoning chain
  const primaryViolation = (sentiment.possibleViolations[0] ?? 'other') as ViolationType;
  const country = ctx.worker.destination.country;
  const employer = ctx.worker.destination.employer;

  // Parallel intelligence gathering
  const [laborLaw, employerHistory, patternCount, ngos] = await Promise.all([
    getLaborLaw(country, primaryViolation),
    searchEmployerIntelligence(employer, country),
    detectEmployerPattern(employer, primaryViolation),
    getNGOsForCase(country, primaryViolation),
  ]);

  console.log(`[SAFAR Agent] Employer score: ${employerHistory.safetyScore}, Pattern count: ${patternCount}`);

  // Escalate to RED if employer pattern is systemic
  let finalSeverity = sentiment.severity;
  if (patternCount >= 3 && finalSeverity === 'YELLOW') {
    finalSeverity = 'RED';
    console.log(`[SAFAR Agent] Escalated to RED: ${patternCount} workers reported same employer`);
  }

  // Step 4: Build action list
  const actionsTaken: string[] = [];

  if (finalSeverity === 'RED' || finalSeverity === 'BLACK') {
    // Generate complaint letters
    const evidence = sentiment.detectedIssues;
    const complaintLetters = await generateComplaintLetter(
      ctx.worker.name.en,
      `${ctx.worker.destination.countryName} (${employer})`,
      employer,
      primaryViolation,
      ctx.message,
      evidence
    );

    // Create case file
    caseFile = await createCase({
      workerId: ctx.worker.workerId,
      workerName: ctx.worker.name.en,
      workerPhone: ctx.worker.phone,
      destination: country,
      employer,
      severity: finalSeverity,
      violationType: primaryViolation,
      summary: {
        ne: sentiment.detectedIssues.join('; '),
        en: `${primaryViolation.replace(/_/g, ' ')} reported by ${ctx.worker.name.en} at ${employer}, ${country}`,
      },
      complaintLetter: complaintLetters,
      evidence: [],
      embassyAlerted: false,
      familyNotified: false,
      status: 'active',
    });

    actionsTaken.push('Case file created');

    // Record employer pattern in Elastic
    await recordEmployerPattern(employer, employer, country, primaryViolation, ctx.worker.workerId);

    // Assign NGO
    if (ngos.length > 0) {
      await updateNGOAssignment(caseFile.caseId, ngos[0].name);
      actionsTaken.push(`Assigned to ${ngos[0].name}`);

      // Notify NGO via WhatsApp if available
      if (ngos[0].whatsapp) {
        await sendNGONotification(ngos[0].whatsapp, caseFile, ctx.worker);
        actionsTaken.push('NGO notified');
        await appendTimeline(caseFile.caseId, {
          action: `NGO ${ngos[0].name} notified via WhatsApp`,
          actor: 'safar_agent',
        });
      }

      actions.push({ type: 'notify_ngo', ngoName: ngos[0].name, caseFile });
    }

    // Alert embassy
    const embassy = EMBASSY_CONTACTS[country];
    if (embassy) {
      await appendTimeline(caseFile.caseId, {
        action: `Embassy alert sent to ${embassy.name} (${embassy.laborDesk})`,
        actor: 'safar_agent',
      });
      actionsTaken.push('Embassy labor desk alerted');
      actions.push({ type: 'alert_embassy', country, caseFile });
    }

    // Send evidence checklist to worker
    const checklist = EVIDENCE_CHECKLISTS[primaryViolation] ?? EVIDENCE_CHECKLISTS.general;
    await sendEvidenceChecklist(ctx.worker.phone, primaryViolation, checklist);
    actionsTaken.push('Evidence checklist sent to worker');

    actions.push({ type: 'request_evidence', items: checklist });
    actions.push({ type: 'generate_complaint', violationType: primaryViolation });
  }

  // Step 5: Notify family
  await sendFamilyAlert(
    ctx.worker.familyPhone,
    ctx.worker.name.ne,
    finalSeverity,
    sentiment.detectedIssues.join(', '),
    caseFile?.caseId
  );
  actionsTaken.push('Family notified');
  actions.push({
    type: 'notify_family',
    message: sentiment.detectedIssues.join(', '),
  });

  // Step 6: Generate worker response in simple Nepali
  const responseNe = await generateWorkerResponseNe(
    ctx.message,
    finalSeverity,
    actionsTaken
  );

  actions.push({
    type: 'update_risk_level',
    level: finalSeverity,
  });

  actions.push({
    type: 'log_checkin',
    checkIn: {
      timestamp: new Date(),
      method: ctx.messageType === 'voice' ? 'voice' : 'text',
      rawTranscript: ctx.message,
      sentimentScore: sentiment.score,
      sentimentLabel: sentiment.label,
      detectedIssues: sentiment.detectedIssues,
      severity: finalSeverity,
      agentResponse: responseNe,
    },
  });

  return {
    severity: finalSeverity,
    responseNe,
    responseEn: `${primaryViolation} detected. Actions taken: ${actionsTaken.join(', ')}`,
    actions,
    caseCreated: !!caseFile,
    caseId: caseFile?.caseId,
  };
}

export async function runDeadManSwitch(worker: WorkerProfile): Promise<void> {
  console.log(`[Dead-man Switch] Triggering for worker: ${worker.workerId} (${worker.name.en})`);

  const caseFile = await createCase({
    workerId: worker.workerId,
    workerName: worker.name.en,
    workerPhone: worker.phone,
    destination: worker.destination.country,
    employer: worker.destination.employer,
    severity: 'BLACK',
    violationType: 'other',
    summary: {
      ne: `${worker.name.ne}सँग ${worker.missedCheckIns} हप्तादेखि कुनै सम्पर्क छैन।`,
      en: `No contact from ${worker.name.en} for ${worker.missedCheckIns} weeks. Dead-man switch triggered.`,
    },
    complaintLetter: { ne: '', en: '' },
    evidence: [{
      type: 'system_log',
      timestamp: new Date(),
      description: `Automatic escalation after ${worker.missedCheckIns} missed check-ins`,
      hash: uuidv4(),
    }],
    embassyAlerted: false,
    familyNotified: false,
    status: 'active',
  });

  await sendFamilyAlert(
    worker.familyPhone,
    worker.name.ne,
    'BLACK',
    `${worker.missedCheckIns} हप्तादेखि कुनै खबर छैन`,
    caseFile.caseId
  );

  const embassy = EMBASSY_CONTACTS[worker.destination.country];
  if (embassy) {
    await appendTimeline(caseFile.caseId, {
      action: `Emergency welfare check requested from ${embassy.name}`,
      actor: 'safar_agent',
    });
  }

  const ngos = await getNGOsForCase(worker.destination.country, 'other');
  if (ngos.length > 0 && ngos[0].whatsapp) {
    await sendNGONotification(ngos[0].whatsapp, caseFile, worker);
  }
}
