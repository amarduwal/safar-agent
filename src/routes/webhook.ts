import { Router, type Request, type Response } from 'express';
import { config } from '../config';
import { getWorkerByPhone, appendCheckIn, updateRiskLevel } from '../services/mongodb/workers';
import { downloadMedia, markAsRead, sendTextMessage } from '../services/whatsapp/client';
import { transcribeAudio } from '../services/gemini/transcribe';
import { runSAFARAgent } from '../agent';
import { analyzeWorkerContract } from '../flows/contract-analysis';
import { handleRegistrationFlow, isInRegistrationSession, startRegistration } from '../flows/registration';
import type { WhatsAppWebhookBody } from '../types';

export const webhookRouter = Router();

// Webhook verification
webhookRouter.get('/webhook', (req: Request, res: Response) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === config.whatsapp.verifyToken) {
    console.log('[Webhook] Verified');
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// Incoming messages
webhookRouter.post('/webhook', async (req: Request, res: Response) => {
  const body = req.body as WhatsAppWebhookBody;

  if (body.object !== 'whatsapp_business_account') {
    return res.sendStatus(404);
  }

  // Acknowledge immediately — WhatsApp requires fast response
  res.sendStatus(200);

  for (const entry of body.entry ?? []) {
    for (const change of entry.changes ?? []) {
      const messages = change.value?.messages ?? [];

      for (const msg of messages) {
        try {
          await processMessage(msg.from, msg);
          await markAsRead(msg.messageId).catch(() => {});
        } catch (err) {
          console.error('[Webhook] Error processing message:', err);
        }
      }
    }
  }
});

async function processMessage(phone: string, msg: NonNullable<WhatsAppWebhookBody['entry'][0]['changes'][0]['value']['messages']>[0]): Promise<void> {
  console.log(`[Webhook] Message from ${phone}, type: ${msg.type}`);

  // Handle registration trigger keywords
  if (msg.type === 'text' && msg.text) {
    const text = msg.text.body.toLowerCase().trim();

    if (text === 'start' || text === 'join' || text === 'दर्ता' || text === 'register') {
      startRegistration(phone);
      const response = await handleRegistrationFlow(phone, text);
      await sendTextMessage(phone, response);
      return;
    }

  }

  // Active registration session
  if (isInRegistrationSession(phone)) {
    const response = await handleRegistrationFlow(phone, msg.text?.body ?? '');
    await sendTextMessage(phone, response);
    return;
  }

  // Look up registered worker
  const worker = await getWorkerByPhone(phone);
  if (!worker) {
    await sendTextMessage(
      phone,
      'नमस्ते! SAFAR मा दर्ता गर्न "दर्ता" लेख्नुहोस्।\n(To register, type "दर्ता" or "register")'
    );
    return;
  }

  // Process by message type
  let messageText = '';
  let messageType: 'voice' | 'text' | 'image' | 'button' = 'text';

  if (msg.type === 'audio' && msg.audio) {
    messageType = 'voice';
    const { buffer, mimeType } = await downloadMedia(msg.audio.id);
    const transcription = await transcribeAudio(buffer, mimeType);
    messageText = transcription.text;
    console.log(`[Webhook] Transcribed: "${messageText}"`);
  } else if (msg.type === 'image' && msg.image) {
    // Contract photo
    const { buffer, mimeType } = await downloadMedia(msg.image.id);
    const caption = msg.image.caption ?? '';
    if (caption.toLowerCase().includes('contract') || caption.toLowerCase().includes('अनुबंध') || worker.status === 'pre-departure') {
      await analyzeWorkerContract(worker, buffer, mimeType);
      return;
    }
    messageText = `[Image sent] ${caption}`;
    messageType = 'image';
  } else if (msg.type === 'text' && msg.text) {
    messageText = msg.text.body;
  } else if (msg.type === 'interactive' && msg.interactive?.button_reply) {
    await handleButtonReply(phone, msg.interactive.button_reply.id);
    return;
  }

  if (!messageText) return;

  // Run the SAFAR agent
  const response = await runSAFARAgent({
    worker,
    message: messageText,
    messageType,
  });

  // Update worker state
  for (const action of response.actions) {
    if (action.type === 'log_checkin') {
      await appendCheckIn(worker.workerId, action.checkIn);
    }
    if (action.type === 'update_risk_level') {
      await updateRiskLevel(worker.workerId, action.level);
    }
  }

  // Reply to worker
  await sendTextMessage(phone, response.responseNe);
}

async function handleButtonReply(phone: string, buttonId: string): Promise<void> {
  const worker = await getWorkerByPhone(phone);
  if (!worker) return;

  if (buttonId === 'checkin_ok') {
    await runSAFARAgent({ worker, message: 'म ठिक छु।', messageType: 'button' });
    await sendTextMessage(phone, '✅ राम्रो! तपाईंको परिवारलाई सूचित गरियो।');
  } else if (buttonId === 'checkin_help') {
    await sendTextMessage(phone, '⚠️ के भयो भनेर विस्तारमा Voice Note पठाउनुहोस्।');
  } else if (buttonId === 'checkin_emergency') {
    await runSAFARAgent({ worker, message: 'आपतकाल! मलाई तुरुन्त मद्दत चाहिन्छ।', messageType: 'button' });
    await sendTextMessage(phone, '🚨 आपतकालीन प्रतिक्रिया शुरू भयो। तपाईंको परिवार र दूतावासलाई सूचित गरियो।');
  }
}
