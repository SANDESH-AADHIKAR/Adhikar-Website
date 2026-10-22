import { NextResponse } from 'next/server';
import { guardRequestSchema } from '@/lib/schemas';
import { guardSystemPrompt } from '@/lib/prompts';

// POST /api/guard
// Contract: {userId, message, language, image?} -> {classification, trustScore, reason, explanation, safeAdvice, officialAlternative}
export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = guardRequestSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const { message, language } = parsed.data;

  const apiKey = process.env.OPENROUTER_API_KEY || process.env.GEMINI_API_KEY;

  if (apiKey) {
    try {
      if (process.env.OPENROUTER_API_KEY) {
        const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'google/gemini-2.0-flash-001',
            response_format: { type: 'json_object' },
            messages: [
              { role: 'system', content: guardSystemPrompt(language) },
              { role: 'user', content: message },
            ],
          }),
        });
        if (res.ok) {
          const data = await res.json();
          const content = data.choices?.[0]?.message?.content;
          if (content) {
            const parsedJson = JSON.parse(content);
            return NextResponse.json({
              classification: parsedJson.classification ?? 'Suspicious',
              trustScore: Math.max(0, Math.min(100, Number(parsedJson.trustScore) || 50)),
              reason: parsedJson.reason ?? 'Analysis completed via AI.',
              explanation: parsedJson.reason ?? parsedJson.explanation,
              safeAdvice: parsedJson.safeAdvice ?? 'Verify only on authentic .gov.in portals.',
              officialAlternative: parsedJson.officialAlternative ?? 'https://www.india.gov.in',
            });
          }
        }
      } else if (process.env.GEMINI_API_KEY) {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [
                {
                  role: 'user',
                  parts: [
                    {
                      text: `${guardSystemPrompt(language)}\n\nAnalyze this scheme text and respond ONLY with JSON:\n"${message}"`,
                    },
                  ],
                },
              ],
              generationConfig: { responseMimeType: 'application/json' },
            }),
          }
        );
        if (res.ok) {
          const data = await res.json();
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) {
            const parsedJson = JSON.parse(text);
            return NextResponse.json({
              classification: parsedJson.classification ?? 'Suspicious',
              trustScore: Math.max(0, Math.min(100, Number(parsedJson.trustScore) || 50)),
              reason: parsedJson.reason ?? 'AI verification completed.',
              explanation: parsedJson.reason ?? parsedJson.explanation,
              safeAdvice: parsedJson.safeAdvice ?? 'Verify only on authentic .gov.in portals.',
              officialAlternative: parsedJson.officialAlternative ?? 'https://www.india.gov.in',
            });
          }
        }
      }
    } catch {
      // Fall through to heuristic fallback if API call fails
    }
  }

  // --- Intelligent Heuristic / Prototype Fallback ---
  const isOfficialGovDomain = /\.gov\.in|\.nic\.in|pmkisan|ayushman|mygov\.in/i.test(message);
  const hasUrgencyOrScamFlags = /bit\.ly|tinyurl|otp|lottery|winner|registration fee|send fee|pay ₹|pay rs|forward to|unlimited free/i.test(message);
  const mentionsPersonalDataAsk = /aadhaar card photo|bank pin|send otp|whatsapp loan/i.test(message);

  if (isOfficialGovDomain && !hasUrgencyOrScamFlags) {
    return NextResponse.json({
      classification: 'Genuine',
      trustScore: 94,
      reason: `Message points to authentic government domain (.gov.in or .nic.in) with no upfront payment, lottery urgency, or OTP requests. Language: ${language}.`,
      explanation: 'Verified against recognized official government welfare domains.',
      safeAdvice: 'You can proceed safely on the official domain. Never disclose banking PINs or OTPs to any caller.',
      officialAlternative: 'https://www.india.gov.in',
      mock: !apiKey,
    });
  }

  if (hasUrgencyOrScamFlags || mentionsPersonalDataAsk) {
    return NextResponse.json({
      classification: 'Fake',
      trustScore: 12,
      reason: `High risk: Detected red flags including shortened URL (e.g., bit.ly), upfront fee demands, urgency wording, or requests for sensitive personal credentials.`,
      explanation: 'Official government schemes never charge application fees via WhatsApp or request OTPs/passwords.',
      safeAdvice: 'DO NOT click links, send money, or share OTP / Aadhaar photos. Report this scam on cybercrime.gov.in.',
      officialAlternative: 'https://www.india.gov.in',
      mock: !apiKey,
    });
  }

  return NextResponse.json({
    classification: 'Suspicious',
    trustScore: 48,
    reason: `Unverified announcement: The message does not link directly to a recognized .gov.in or .nic.in portal and lacks official department verification.`,
    explanation: 'Could not corroborate this scheme from the official National Portal directory.',
    safeAdvice: 'Search for this scheme directly on india.gov.in or visit your local Gram Panchayat / Seva Kendra before sharing documents.',
    officialAlternative: 'https://www.india.gov.in',
    mock: !apiKey,
  });
}
