import { getModel, getVisionModel } from './client';
import { ContractRecord, SeverityLevel, CheckIn, ViolationType } from '../../types';
import { MINIMUM_WAGES_NPR } from '../../config';
import crypto from 'crypto';

export interface SentimentAnalysis {
  score: number;
  label: CheckIn['sentimentLabel'];
  detectedIssues: string[];
  possibleViolations: ViolationType[];
  severity: SeverityLevel;
  keyPhrases: string[];
}

export async function analyzeSentiment(text: string, workerContext: string): Promise<SentimentAnalysis> {
  const model = getModel({
    systemInstruction: `You are SAFAR, an AI system that analyzes messages from Nepali migrant workers to detect distress, rights violations, and safety concerns.

    Analyze messages for:
    - Wage theft (तलब नआउनु, तलब रोक्नु)
    - Passport confiscation (राहदानी लिनु)
    - Physical abuse (कुटपिट, हिंसा)
    - Illegal confinement (थुन्नु, जान नदिनु)
    - Contract substitution (काम फेर्नु, अनुबंध फेर्नु)
    - Overwork (धेरै काम, आराम नदिनु)
    - Unsafe conditions (खतरनाक काम, दुर्घटना)

    Return JSON with sentiment analysis.`,
  });

  const prompt = `Analyze this worker message. Worker context: ${workerContext}

Message: "${text}"

Return JSON:
{
  "score": -1 to 1 (negative=distress, positive=okay),
  "label": "positive|neutral|concerned|distressed|emergency",
  "detectedIssues": ["specific issues mentioned"],
  "possibleViolations": ["wage_theft|passport_confiscation|physical_abuse|illegal_confinement|contract_substitution|overwork|unsafe_conditions|other"],
  "severity": "GREEN|YELLOW|RED|BLACK",
  "keyPhrases": ["important phrases from the message"]
}`;

  const result = await model.generateContent(prompt);
  const text2 = result.response.text().trim();
  try {
    const jsonMatch = text2.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON');
    return JSON.parse(jsonMatch[0]);
  } catch {
    return {
      score: 0,
      label: 'neutral',
      detectedIssues: [],
      possibleViolations: [],
      severity: 'GREEN',
      keyPhrases: [],
    };
  }
}

export async function analyzeContract(
  imageBuffer: Buffer,
  mimeType: string,
  country: string,
  sector: string
): Promise<Omit<ContractRecord, 'photoUrl' | 'uploadedAt'>> {
  const model = getVisionModel();
  const minWage = MINIMUM_WAGES_NPR[country]?.[sector] ?? MINIMUM_WAGES_NPR[country]?.['general'] ?? 35000;

  const prompt = `Analyze this employment contract image for a Nepali migrant worker going to ${country} for ${sector} work.

Extract all terms and identify red flags. Minimum legal wage for this role: NPR ${minWage}/month.

Return JSON:
{
  "extractedTerms": {
    "jobTitle": "string",
    "monthlySalaryNPR": number,
    "weeklyHours": number,
    "contractDurationMonths": number,
    "accommodationProvided": boolean,
    "foodProvided": boolean,
    "returnTicketIncluded": boolean,
    "overtimeRate": number or null,
    "leaveDaysPerYear": number or null
  },
  "redFlags": [
    {
      "type": "salary_below_minimum|excessive_hours|no_return_ticket|passport_retention_clause|missing_clause|contract_substitution_risk",
      "severity": "warning|critical",
      "messageNe": "Nepali explanation for worker",
      "messageEn": "English explanation"
    }
  ],
  "geminiSummaryNe": "Plain Nepali summary of contract for uneducated worker (2-3 sentences)"
}`;

  const result = await model.generateContent([
    { inlineData: { mimeType, data: imageBuffer.toString('base64') } },
    prompt,
  ]);

  const text = result.response.text().trim();
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON');
    const parsed = JSON.parse(jsonMatch[0]);
    return {
      ...parsed,
      hash: crypto.createHash('sha256').update(imageBuffer).digest('hex'),
      analyzedAt: new Date(),
    };
  } catch {
    return {
      hash: crypto.createHash('sha256').update(imageBuffer).digest('hex'),
      extractedTerms: {
        jobTitle: 'Unknown',
        monthlySalaryNPR: 0,
        weeklyHours: 0,
        contractDurationMonths: 0,
        accommodationProvided: false,
        foodProvided: false,
        returnTicketIncluded: false,
      },
      redFlags: [],
      geminiSummaryNe: 'अनुबंध विश्लेषण गर्न सकिएन। कृपया फेरि प्रयास गर्नुहोस्।',
      analyzedAt: new Date(),
    };
  }
}

export async function generateComplaintLetter(
  workerName: string,
  destination: string,
  employer: string,
  violationType: ViolationType,
  summary: string,
  evidence: string[]
): Promise<{ ne: string; en: string }> {
  const model = getModel();

  const [neResult, enResult] = await Promise.all([
    model.generateContent(`Write a formal complaint letter in Nepali for:
Worker: ${workerName}
Destination: ${destination}
Employer: ${employer}
Violation: ${violationType}
Summary: ${summary}
Evidence: ${evidence.join(', ')}

Write to the Nepal Embassy labor desk. Be formal, clear, and include all facts. Use correct Nepali.`),

    model.generateContent(`Write a formal complaint letter in English for:
Worker: ${workerName}
Destination: ${destination}
Employer: ${employer}
Violation: ${violationType}
Summary: ${summary}
Evidence: ${evidence.join(', ')}

Write to the relevant labor ministry. Be formal, cite applicable labor law articles.`),
  ]);

  return {
    ne: neResult.response.text().trim(),
    en: enResult.response.text().trim(),
  };
}

export async function generateWorkerResponseNe(
  situation: string,
  severity: SeverityLevel,
  actionsTaken: string[]
): Promise<string> {
  const model = getModel({
    systemInstruction: `You are SAFAR — a trusted, caring Nepali-speaking AI assistant for migrant workers.
    Speak simply and clearly, like a knowledgeable friend. Never use legal jargon.
    Maximum 4 sentences. Always end with a specific actionable step.
    Tone: calm, reassuring, empowering.`,
  });

  const prompt = `Worker situation: ${situation}
Severity: ${severity}
Actions SAFAR has already taken: ${actionsTaken.join(', ')}

Write a response in simple Nepali (Devanagari script) telling the worker:
1. You understand their situation
2. What SAFAR has done
3. What the worker should do next (1-2 simple steps maximum)`;

  const result = await model.generateContent(prompt);
  return result.response.text().trim();
}
