import { NextResponse } from 'next/server';
import { assistantRequestSchema } from '@/lib/schemas';
import { assistantSystemPrompt } from '@/lib/prompts';

// POST /api/assistant
// Contract: {userId, message, language, history, image?} -> {text, links}
export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = assistantRequestSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const { message, language, history } = parsed.data;

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
            messages: [
              { role: 'system', content: assistantSystemPrompt(language) },
              ...history.map((m) => ({
                role: m.role === 'user' ? 'user' : 'assistant',
                content: m.parts.map((p) => p.text ?? '').join(' '),
              })),
              { role: 'user', content: message },
            ],
          }),
        });

        if (res.ok) {
          const data = await res.json();
          const replyText = data.choices?.[0]?.message?.content;
          if (replyText) {
            return NextResponse.json({ text: replyText, links: [] });
          }
        }
      } else if (process.env.GEMINI_API_KEY) {
        // Direct Google Gemini API
        const contents = [
          ...history.map((m) => ({
            role: m.role === 'user' ? 'user' : 'model',
            parts: [{ text: m.parts.map((p) => p.text ?? '').join(' ') }],
          })),
          {
            role: 'user',
            parts: [{ text: message }],
          },
        ];

        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              systemInstruction: {
                parts: [{ text: assistantSystemPrompt(language) }],
              },
              contents,
            }),
          }
        );

        if (res.ok) {
          const data = await res.json();
          const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (replyText) {
            return NextResponse.json({ text: replyText, links: [] });
          }
        }
      }
    } catch {
      // Fall through to smart mock
    }
  }

  // --- Smart Mock response for instant local & demo use without keys ---
  const lower = message.toLowerCase();
  let advice = '';

  if (lower.includes('farmer') || lower.includes('kisan') || lower.includes('agriculture') || lower.includes('crop')) {
    advice = `🌾 **Top Schemes for Farmers & Rural Households:**\n\n1. **PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)**\n   • **Benefit:** ₹6,000/year deposited directly into bank account in 3 installments of ₹2,000.\n   • **Eligibility:** Small and marginal landholding farmer families.\n   • **Required Documents:** Aadhaar card, Land ownership record (7/12 or RoR), Bank account linked to Aadhaar (NPCI enabled).\n   • **Official Portal:** [pmkisan.gov.in](https://pmkisan.gov.in)\n\n2. **PM Fasal Bima Yojana (Crop Insurance)**\n   • **Benefit:** Comprehensive financial coverage against crop losses from drought, flood, pests.\n   • **Official Portal:** [pmfby.gov.in](https://pmfby.gov.in)\n\n💡 *Tip: Ensure your bank account has e-KYC completed to receive Direct Benefit Transfers (DBT) smoothly.*`;
  } else if (lower.includes('health') || lower.includes('ayushman') || lower.includes('hospital') || lower.includes('medical')) {
    advice = `🏥 **Healthcare Support Schemes:**\n\n1. **Ayushman Bharat Pradhan Mantri Jan Arogya Yojana (AB-PMJAY)**\n   • **Benefit:** Cashless health cover of up to **₹5,00,000 per family per year** for secondary and tertiary hospitalization across empaneled hospitals nationwide.\n   • **Eligibility:** Families listed under SECC criteria or eligible state ration card lists.\n   • **Required Documents:** Ration card, Aadhaar card, Active mobile number.\n   • **Official Portal:** [nha.gov.in](https://nha.gov.in)\n\n2. **Pradhan Mantri Bhartiya Janaushadhi Pariyojana**\n   • Quality generic medicines at 50% to 90% savings at local Kendra stores.`;
  } else if (lower.includes('scholarship') || lower.includes('student') || lower.includes('girl') || lower.includes('school') || lower.includes('college')) {
    advice = `🎓 **Scholarships & Education Initiatives:**\n\n1. **National Scholarship Portal (NSP)**\n   • **Benefit:** Pre-matric, Post-matric, and Merit-cum-Means financial scholarships credited directly to students.\n   • **Eligibility:** SC/ST, OBC, EWS, Minority, and meritorious students enrolled in recognized institutions.\n   • **Required Documents:** Previous marksheet, Income certificate, Caste certificate (if applicable), Bank passbook.\n   • **Official Portal:** [scholarships.gov.in](https://scholarships.gov.in)\n\n2. **Beti Bachao Beti Padhao & Sukanya Samriddhi Yojana**\n   • High interest rate savings scheme with tax benefits for girl child education and future.`;
  } else if (lower.includes('loan') || lower.includes('business') || lower.includes('shop') || lower.includes('mudra')) {
    advice = `💼 **Financial Assistance & Business Loans:**\n\n1. **Pradhan Mantri MUDRA Yojana (PMMY)**\n   • **Shishu:** Loans up to ₹50,000\n   • **Kishore:** Loans from ₹50,001 to ₹5,00,000\n   • **Tarun:** Loans up to ₹10,00,000\n   • **Collateral:** No collateral required for small enterprise loans.\n   • **Official Portal:** [mudra.org.in](https://mudra.org.in)\n\n2. **PM SVANidhi**\n   • Working capital loans starting at ₹10,000 for urban street vendors and micro-businesses.`;
  } else {
    advice = `🏛️ **Sarkari Sahayak Guidance (${language}):**\n\nThank you for reaching out regarding: "${message}"\n\n• For Central government schemes, explore the official single-window repository at **[india.gov.in](https://www.india.gov.in)** or **[mygov.in](https://www.mygov.in)**.\n• For state-specific welfare (e.g. Maharashtra, UP, Karnataka), visit your state's portal or local CSC / Gram Panchayat office.\n• Check the **[Scheme Directory](/schemes)** in Adhikar for direct portal links and criteria.\n\n*(Note: Set \`OPENROUTER_API_KEY\` or \`GEMINI_API_KEY\` in your deployment environment for full live conversational AI responses).*`;
  }

  return NextResponse.json({
    text: advice,
    links: [],
    mock: !apiKey,
  });
}
