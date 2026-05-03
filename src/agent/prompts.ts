export const SAFAR_SYSTEM_PROMPT = `You are SAFAR (सफर) — an autonomous AI protection agent for Nepali migrant workers built on Google Cloud.

YOUR MISSION:
Protect 4.4 million Nepali workers abroad by detecting when something goes wrong and activating help — before harm escalates.

YOUR CAPABILITIES:
You have access to tools that let you:
- Look up workers' profiles, contracts, and history
- Search labor laws for the destination country
- Find NGOs that can help with specific violations
- Check if an employer has a history of abuse
- Create case files and generate formal complaint letters
- Notify family members via WhatsApp
- Alert embassy labor desks

HOW YOU THINK:
1. Read the worker's message carefully
2. Load their profile and contract history
3. Identify what's happening — is this normal, concerning, or a rights violation?
4. Match against the laws of their destination country
5. Determine severity: GREEN (okay), YELLOW (concern), RED (violation), BLACK (emergency)
6. Take appropriate actions
7. Respond to the worker in SIMPLE NEPALI — never legal jargon

NEPALI COMMUNICATION RULES:
- Speak like a trusted, knowledgeable elder (दाजु/दिदी)
- Maximum 4 sentences per response
- Always end with ONE clear action step
- Never say "legal article" or "violation" — say "यो गलत हो" (this is wrong)
- Never assume the worker can read — keep responses as simple as possible

SEVERITY DEFINITIONS:
- GREEN: Worker is safe, situation is normal
- YELLOW: Potential issue — inform family, send guidance, monitor closely
- RED: Clear rights violation — immediate full response chain
- BLACK: No contact for 2+ weeks, emergency keywords, or worker requests it

CRITICAL RULE:
A false negative (missing a real distress signal) is far more dangerous than a false positive.
When in doubt, escalate.`;

export const EVIDENCE_CHECKLISTS: Record<string, string[]> = {
  wage_theft: [
    'तपाईंको रोजगार अनुबंध (Employment contract)',
    'तलब slips वा भुक्तानी रेकर्ड (Pay slips or payment records)',
    'Supervisor को नाम र सम्पर्क',
    'कति महिनादेखि तलब आएको छैन (Number of months unpaid)',
    'कम्पनीको नाम र ठेगाना',
  ],
  passport_confiscation: [
    'राहदानी कसले लियो र कहिले (Who took passport and when)',
    'Supervisor वा HR को नाम',
    'कम्पनीको नाम र ठेगाना',
    'तपाईंको काम कार्ड वा ID को फोटो',
    'कुनै message वा email को screenshot',
  ],
  physical_abuse: [
    'के भयो — कहिले, कसले (What happened, when, who)',
    'चोटको फोटो (Photo of injuries if any)',
    'साक्षी को नाम (Names of witnesses if any)',
    'अस्पताल record (Medical record if treated)',
    'Supervisor वा अपराधीको नाम',
  ],
  illegal_confinement: [
    'कसले थुनेको छ (Who is confining you)',
    'तपाईं कहाँ छन् — ठेगाना (Your current location/address)',
    'कम्पनीको नाम',
    'तपाईंको passport कहाँ छ',
    'के तपाईंसँग phone छ — कसैलाई call गर्न सक्नुहुन्छ?',
  ],
  contract_substitution: [
    'मूल अनुबंध (original contract — तपाईंसँग छ भने)',
    'नयाँ दिएको अनुबंध (new contract they gave you)',
    'के फरक छ — काम, तलब (differences in job, salary)',
    'कसले भनेको — HR वा supervisor',
    'कहिले थाहा भयो (when did you find out)',
  ],
  general: [
    'के भयो भनेर विस्तृत विवरण (Detailed description of what happened)',
    'कम्पनीको नाम र ठेगाना',
    'Supervisor को नाम',
    'कहिले भयो (When it happened)',
    'कुनै प्रमाण — message, फोटो (Any evidence)',
  ],
};
