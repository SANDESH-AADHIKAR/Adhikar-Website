import { NextResponse } from 'next/server';
import { assistantRequestSchema } from '@/lib/schemas';
import { assistantSystemPrompt } from '@/lib/prompts';
import { Language } from '@/lib/types';

function cleanStarsAndVibe(text: string): string {
  if (!text) return '';
  return text
    // Remove bold asterisks
    .replace(/\*\*(.*?)\*\*/g, '$1')
    // Remove italic asterisks
    .replace(/\*([^*\n]+)\*/g, '$1')
    // Remove standalone bullet asterisks
    .replace(/^\s*\*\s+/gm, '• ')
    // Remove headers
    .replace(/^#{1,6}\s+/gm, '')
    // Remove AI meta disclaimers
    .replace(/\(?Note: Set (OPENROUTER|GEMINI)_API_KEY.*?\)?/gi, '')
    .replace(/\(?Note:.*?(API key|deployment environment).*?\)?/gi, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

// Multilingual Mock Knowledge Base (100% Star-Free, Clean Civic Tech Standard)
function getMultilingualMockAdvice(message: string, language: string): string {
  const lower = message.toLowerCase();
  const isHi = language === Language.HINDI || language === 'Hindi';
  const isMr = language === Language.MARATHI || language === 'Marathi';
  const isHinglish = language === Language.HINGLISH || language === 'Hinglish';

  // 1. FARMERS / AGRICULTURE
  if (
    lower.includes('farmer') ||
    lower.includes('kisan') ||
    lower.includes('agriculture') ||
    lower.includes('crop') ||
    lower.includes('शेतकरी') ||
    lower.includes('किसान') ||
    lower.includes('krishi')
  ) {
    if (isHi) {
      return `प्रमुख किसान कल्याण योजनाएं:\n\n1. पीएम-किसान (प्रधानमंत्री किसान सम्मान निधि)\n• लाभ: प्रति वर्ष ₹6,000 तीन समान किस्तों में सीधे बैंक खाते में (डीबीटी)।\n• पात्रता: सभी पात्र छोटे एवं सीमांत भूमिधारक किसान परिवार।\n• आवश्यक दस्तावेज: आधार कार्ड, भूमि अभिलेख (खतौनी/भूलेख), आधार से लिंक बैंक खाता।\n• आधिकारिक पोर्टल: https://pmkisan.gov.in\n\n2. प्रधानमंत्री फसल बीमा योजना (पीएमएफबीवाई)\n• लाभ: सूखा, बाढ़ अथवा कीटों से फसल क्षति होने पर व्यापक बीमा सुरक्षा।\n• आवश्यक दस्तावेज: फसल बुवाई प्रमाण पत्र, भूमि स्वामित्व कागजात, आधार कार्ड।\n• आधिकारिक पोर्टल: https://pmfby.gov.in\n\nमहत्वपूर्ण निर्देश: सहायता राशि बिना रुकावट पाने के लिए अपने बैंक खाते में ई-केवाईसी और एनपीसीआई आधार सीडिंग पूर्ण रखें।`;
    }
    if (isMr) {
      return `शेतकऱ्यांसाठी प्रमुख शासकीय योजना:\n\n1. पीएम-किसान आणि नमो शेतकरी महासन्मान निधी योजना (महाराष्ट्र)\n• लाभ: एकत्रित दरवर्षी ₹12,000 थेट बँक खात्यात जमा (केंद्र ₹6,000 + महाराष्ट्र शासन ₹6,000).\n• पात्रता: अल्प व अत्यल्प भूधारक शेतकरी कुटुंबे.\n• आवश्यक कागदपत्रे: आधार कार्ड, 7/12 व 8-अ उतारा, आधार लिंक बँक खाते.\n• अधिकृत पोर्टल: https://pmkisan.gov.in\n\n2. प्रधानमंत्री पीक विमा योजना\n• लाभ: नैसर्गिक आपत्तीमुळे पिकांचे नुकसान झाल्यास आर्थिक भरपाई.\n• अधिकृत पोर्टल: https://pmfby.gov.in\n\nसूचना: योजनेचा लाभ मिळवण्यासाठी आपल्या बँक खात्याची ई-केवायसी प्रक्रिया पूर्ण असणे आवश्यक आहे.`;
    }
    if (isHinglish) {
      return `Farmers ke liye Top Government Schemes:\n\n1. PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)\n• Benefit: Saal ke ₹6,000 directly aapke bank account mein 3 installments mein.\n• Eligibility: Sabhi small aur marginal farmer families.\n• Documents Required: Aadhaar Card, 7/12 ya RoR land records, Aadhaar linked bank account.\n• Official Portal: https://pmkisan.gov.in\n\n2. PM Fasal Bima Yojana\n• Benefit: Barish, baadh ya keede lagne par crop insurance coverage.\n• Official Portal: https://pmfby.gov.in\n\nImportant Tip: DBT payment paane ke liye bank account mein e-KYC aur NPCI Aadhaar seeding check kar lein.`;
    }
    // Default English
    return `Top Schemes for Farmers & Rural Households:\n\n1. PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)\n• Benefit: ₹6,000 per year transferred directly to bank account in 3 equal installments.\n• Eligibility: Small and marginal landholding farmer families across India.\n• Required Documents: Aadhaar card, Land record (7/12 or RoR), Bank account linked to Aadhaar (DBT active).\n• Official Portal: https://pmkisan.gov.in\n\n2. PM Fasal Bima Yojana (Crop Insurance)\n• Benefit: Comprehensive insurance compensation against crop loss due to non-preventable natural risks.\n• Official Portal: https://pmfby.gov.in\n\nCitizen Note: Complete your e-KYC on the PM-Kisan portal to ensure uninterrupted benefit transfers.`;
  }

  // 2. HEALTHCARE
  if (
    lower.includes('health') ||
    lower.includes('ayushman') ||
    lower.includes('hospital') ||
    lower.includes('medical') ||
    lower.includes('आरोग्य') ||
    lower.includes('स्वास्थ्य') ||
    lower.includes('इलाज')
  ) {
    if (isHi) {
      return `स्वास्थ्य एवं उपचार सहायता योजनाएं:\n\n1. आयुष्मान भारत (पीएम-जेएवाई)\n• लाभ: चिन्हित सरकारी और निजी अस्पतालों में प्रति परिवार प्रति वर्ष ₹5,00,000 तक कैशलेस उपचार।\n• पात्रता: एसईसीसी सूची में शामिल परिवार अथवा पात्र राशन कार्ड धारक।\n• आवश्यक दस्तावेज: राशन कार्ड, आधार कार्ड, पंजीकृत मोबाइल नंबर।\n• आधिकारिक पोर्टल: https://nha.gov.in\n\n2. प्रधानमंत्री भारतीय जनऔषधि परियोजना\n• लाभ: जनऔषधि केंद्रों पर 50% से 90% तक सस्ती गुणवत्तापूर्ण जेनेरिक दवाएं।\n• आधिकारिक पोर्टल: https://janaushadhi.gov.in`;
    }
    if (isMr) {
      return `आरोग्य व मोफत उपचार योजना:\n\n1. महात्मा ज्योतिराव फुले जन आरोग्य योजना व आयुष्मान भारत (महाराष्ट्र)\n• लाभ: प्रति कुटुंब प्रति वर्ष ₹5,00,000 पर्यंत मोफत व कॅशलेस उपचार.\n• पात्रता: पिवळे किंवा केशरी शिधापत्रिकाधारक कुटुंबे.\n• आवश्यक कागदपत्रे: रेशन कार्ड, आधार कार्ड, मतदार ओळखपत्र.\n• अधिकृत पोर्टल: https://jeevandayee.gov.in\n\n2. प्रधानमंत्री भारतीय जनऔषधी केंद्र\n• लाभ: सर्वसामान्य नागरिकांना 50% ते 90% सवलतीत दर्जेदार औषधे.\n• अधिकृत पोर्टल: https://janaushadhi.gov.in`;
    }
    if (isHinglish) {
      return `Healthcare Support Schemes:\n\n1. Ayushman Bharat (PM-JAY)\n• Benefit: Har parivar ko saal ka ₹5,00,000 tak cashless treatment authorized hospitals mein.\n• Eligibility: SECC data mein listed families ya eligible ration card holders.\n• Documents Required: Ration Card, Aadhaar Card, Mobile number.\n• Official Portal: https://nha.gov.in\n\n2. Pradhan Mantri Jan Aushadhi Kendra\n• Benefit: Generic medicines par 50% se 90% tak ki bachat.\n• Official Portal: https://janaushadhi.gov.in`;
    }
    return `Healthcare Support Schemes:\n\n1. Ayushman Bharat Pradhan Mantri Jan Arogya Yojana (AB-PMJAY)\n• Benefit: Up to ₹5,00,000 cashless health coverage per family per year for secondary and tertiary care.\n• Eligibility: Families listed under socio-economic deprivation criteria or eligible state ration lists.\n• Required Documents: Ration card, Aadhaar card, Active mobile number.\n• Official Portal: https://nha.gov.in\n\n2. Pradhan Mantri Bhartiya Janaushadhi Pariyojana\n• Benefit: Quality generic medicines available at 50% to 90% savings at local Kendra stores nationwide.\n• Official Portal: https://janaushadhi.gov.in`;
  }

  // 3. SCHOLARSHIP & STUDENTS
  if (
    lower.includes('scholarship') ||
    lower.includes('student') ||
    lower.includes('girl') ||
    lower.includes('school') ||
    lower.includes('college') ||
    lower.includes('शिक्षा') ||
    lower.includes('शिष्यवृत्ती') ||
    lower.includes('विद्यार्थी')
  ) {
    if (isHi) {
      return `विद्यार्थी छात्रवृत्ति एवं शिक्षा योजनाएं:\n\n1. राष्ट्रीय छात्रवृत्ति पोर्टल (एनएसपी)\n• लाभ: प्री-मैट्रिक, पोस्ट-मैट्रिक एवं मेरिट-कम-मीन्स छात्रवृत्तियों की राशि सीधे छात्र के बैंक खाते में।\n• पात्रता: एससी, एसटी, ओबीसी, ईडब्ल्यूएस एवं अल्पसंख्यक समुदाय के पात्र मेधावी विद्यार्थी।\n• आवश्यक दस्तावेज: पिछली कक्षा की अंकतालिका, आय प्रमाण पत्र, जाति प्रमाण पत्र, बैंक पासबुक।\n• आधिकारिक पोर्टल: https://scholarships.gov.in\n\n2. सुकन्या समृद्धि योजना\n• लाभ: बालिकाओं की उच्च शिक्षा व भविष्य हेतु उच्च ब्याज दर युक्त बचत योजना।\n• आधिकारिक पोर्टल: https://www.india.gov.in`;
    }
    if (isMr) {
      return `विद्यार्थ्यांसाठी शिष्यवृत्ती व शिक्षण योजना:\n\n1. महाडीबीटी शिष्यवृत्ती पोर्टल (महाराष्ट्र शासन)\n• लाभ: मॅट्रिकोत्तर शिक्षण, व्यावसायिक अभ्यासक्रमांचे शुल्क प्रतिपूर्ती थेट बँक खात्यात.\n• पात्रता: महाराष्ट्र राज्यातील विविध संवर्गातील विद्यार्थी.\n• आवश्यक कागदपत्रे: गुणपत्रिका, उत्पन्न दाखला, अधिवास प्रमाणपत्र (डोमिसाईल), जात प्रमाणपत्र.\n• अधिकृत पोर्टल: https://mahadbt.maharashtra.gov.in\n\n2. राष्ट्रीय शिष्यवृत्ती पोर्टल (NSP)\n• अधिकृत पोर्टल: https://scholarships.gov.in`;
    }
    if (isHinglish) {
      return `Students aur Scholarships ke liye Top Schemes:\n\n1. National Scholarship Portal (NSP)\n• Benefit: Pre-matric aur Post-matric financial scholarships direct bank transfer ke through.\n• Eligibility: SC, ST, OBC, EWS aur meritorious students.\n• Documents Required: Previous marksheet, Income certificate, Caste certificate, Bank passbook.\n• Official Portal: https://scholarships.gov.in\n\n2. Sukanya Samriddhi Yojana\n• Benefit: Beti ki padhai aur future ke liye government guaranteed savings scheme.`;
    }
    return `Scholarships & Education Initiatives:\n\n1. National Scholarship Portal (NSP)\n• Benefit: Pre-matric, Post-matric, and Merit-cum-Means financial scholarships credited directly to students.\n• Eligibility: SC, ST, OBC, EWS, Minority, and meritorious students in recognized schools and colleges.\n• Required Documents: Marksheet of qualifying exam, Annual income certificate, Caste certificate, Bank passbook.\n• Official Portal: https://scholarships.gov.in\n\n2. Sukanya Samriddhi Yojana & Beti Bachao Beti Padhao\n• Benefit: High-interest sovereign savings instrument with full income tax exemption for girl children.`;
  }

  // 4. BUSINESS LOANS / MUDRA
  if (
    lower.includes('loan') ||
    lower.includes('business') ||
    lower.includes('shop') ||
    lower.includes('mudra') ||
    lower.includes('कर्ज') ||
    lower.includes('व्यवसाय') ||
    lower.includes('ऋण')
  ) {
    if (isHi) {
      return `व्यवसाय एवं मुद्रा ऋण योजनाएं:\n\n1. प्रधानमंत्री मुद्रा योजना (पीएमएमवाई)\n• शिशु श्रेणी: ₹50,000 तक का ऋण छोटे व्यवसाय शुरू करने के लिए।\n• किशोर श्रेणी: ₹50,001 से ₹5,00,000 तक का ऋण।\n• तरुण श्रेणी: ₹5,00,001 से ₹10,00,000 तक का ऋण।\n• गारंटी: छोटे उद्यमों के लिए किसी संपार्श्विक (कोलैटरल) की आवश्यकता नहीं।\n• आधिकारिक पोर्टल: https://mudra.org.in\n\n2. पीएम स्वनिधि योजना\n• लाभ: रेहड़ी-पटरी विक्रेताओं के लिए ₹10,000 से ₹50,000 तक कार्यशील पूंजी ऋण।\n• आधिकारिक पोर्टल: https://pmsvanidhi.mohua.gov.in`;
    }
    if (isMr) {
      return `उद्योग व स्वयंरोजगार कर्ज योजना:\n\n1. प्रधानमंत्री मुद्रा योजना (PMMY)\n• शिशु कर्ज: ₹50,000 पर्यंत.\n• किशोर कर्ज: ₹50,001 ते ₹5,00,000 पर्यंत.\n• तरुण कर्ज: ₹5,00,001 ते ₹10,00,000 पर्यंत.\n• तारण: कोणत्याही स्थावर मालमत्तेचे तारण आवश्यक नाही.\n• अधिकृत पोर्टल: https://mudra.org.in\n\n2. पीएम स्वनिधी योजना\n• लाभ: फेरीवाले आणि लहान व्यावसायिकांसाठी खेळते भांडवल कर्ज.\n• अधिकृत पोर्टल: https://pmsvanidhi.mohua.gov.in`;
    }
    if (isHinglish) {
      return `Business Loan aur Financial Schemes:\n\n1. Pradhan Mantri MUDRA Yojana (PMMY)\n• Shishu: ₹50,000 tak ka micro loan.\n• Kishore: ₹50,001 se ₹5,00,000 tak ka loan.\n• Tarun: ₹10,00,000 tak ka enterprise loan.\n• Collateral: Kisi guarantee ya property mortgage ki zaroorat nahi hoti.\n• Official Portal: https://mudra.org.in\n\n2. PM SVANidhi\n• Benefit: Street vendors aur shopkeepers ke liye low interest working capital loans.`;
    }
    return `Financial Assistance & Business Loans:\n\n1. Pradhan Mantri MUDRA Yojana (PMMY)\n• Shishu: Loans up to ₹50,000 for micro-enterprises and new starters.\n• Kishore: Loans from ₹50,001 to ₹5,00,000 for expanding units.\n• Tarun: Loans from ₹5,00,001 to ₹10,00,000 for established businesses.\n• Collateral: No collateral security required for eligible entrepreneurs.\n• Official Portal: https://mudra.org.in\n\n2. PM SVANidhi\n• Benefit: Working capital collateral-free credit starting from ₹10,000 for urban street vendors and local micro-traders.\n• Official Portal: https://pmsvanidhi.mohua.gov.in`;
  }

  // 5. HOUSING / PMAY
  if (
    lower.includes('house') ||
    lower.includes('housing') ||
    lower.includes('pmay') ||
    lower.includes('awas') ||
    lower.includes('घर') ||
    lower.includes('आवास')
  ) {
    if (isHi) {
      return `प्रधानमंत्री आवास योजना (पीएमएवाई):\n\n• लाभ: पक्का घर निर्माण हेतु ग्रामीण क्षेत्रों में ₹1,20,000 से ₹1,30,000 तक की सीधी आर्थिक सहायता, तथा शहरी क्षेत्रों में बैंक ऋण ब्याज सब्सिडी।\n• पात्रता: बेघर परिवार अथवा कच्चे व जीर्ण-शीर्ण मकानों में रहने वाले पात्र बीपीएल/ईडब्ल्यूएस परिवार।\n• आवश्यक दस्तावेज: आधार कार्ड, बैंक पासबुक, मनरेगा जॉब कार्ड संख्या (ग्रामीण हेतु), आय प्रमाण पत्र।\n• आधिकारिक पोर्टल: https://pmayg.nic.in एवं https://pmay-urban.gov.in`;
    }
    if (isMr) {
      return `प्रधानमंत्री आवास योजना (PMAY):\n\n• लाभ: ग्रामीण भागात पक्के घर बांधण्यासाठी ₹1,20,000 ते ₹1,30,000 थेट अनुदान, तसेच मनरेगा अंतर्गत मजुरी.\n• पात्रता: कच्चे घर असणारे किंवा स्वतःचे पक्के घर नसलेले नागरिक.\n• आवश्यक कागदपत्रे: आधार कार्ड, रेशन कार्ड, बँक पासबुक, 7/12 किंवा घरठाण उतारा.\n• अधिकृत पोर्टल: https://pmayg.nic.in`;
    }
    if (isHinglish) {
      return `Pradhan Mantri Awas Yojana (PMAY):\n\n• Benefit: Pucca ghar banane ke liye direct financial subsidy.\n• Eligibility: Jin parivaron ke paas desh mein kahin bhi pucca ghar nahi hai.\n• Documents Required: Aadhaar Card, Bank account passbook, MNREGA job card number.\n• Official Portal: https://pmayg.nic.in`;
    }
    return `Pradhan Mantri Awas Yojana (PMAY Housing):\n\n• Benefit: Direct capital financial subsidy for construction of pucca houses for homeless and kutcha-dwelling citizens.\n• Eligibility: Rural and urban households without a permanent pucca house.\n• Required Documents: Aadhaar card, Active bank passbook, MGNREGA Job Card (for rural), Income declaration.\n• Official Portal: https://pmayg.nic.in (Gramin) and https://pmaymis.gov.in (Urban)`;
  }

  // 6. DEFAULT GENERAL GUIDANCE
  if (isHi) {
    return `अधिकार नागरिक सहायता:\n\nआपके प्रश्न "${message}" के संबंध में मार्गदर्शन:\n\n• केंद्र सरकार की सभी आधिकारिक कल्याणकारी योजनाओं की सूची भारत के राष्ट्रीय पोर्टल https://www.india.gov.in तथा myGov पर उपलब्ध है।\n• राज्य स्तरीय योजनाओं की जानकारी अथवा आवेदन हेतु अपने नजदीकी सीएससी (जन सेवा केंद्र) अथवा ग्राम पंचायत कार्यालय से संपर्क करें।\n• हमारे डायरेक्टरी अनुभाग में सभी सत्यापित सरकारी योजनाओं के सीधे पोर्टल लिंक उपलब्ध हैं।`;
  }
  if (isMr) {
    return `अधिकार नागरिक मार्गदर्शन:\n\nआपल्या प्रश्नासंदर्भात ("${message}") अधिकृत माहिती:\n\n• केंद्र शासनाच्या योजनांसाठी https://www.india.gov.in हे अधिकृत पोर्टल तपासावे.\n• महाराष्ट्र शासनाच्या विविध योजनांसाठी आपले सरकार व महाडीबीटी पोर्टल https://mahadbt.maharashtra.gov.in वर नोंदणी करता येते.\n• अधिक तपशीलासाठी व थेट अधिकृत लिंकसाठी अधिकार पोर्टलवरील 'Schemes Directory' चा वापर करा.`;
  }
  if (isHinglish) {
    return `Adhikar Citizen Sahayak Guidance:\n\nAapke question "${message}" ke regarding guidance:\n\n• Central govt schemes ki verified information ke liye official national portal https://www.india.gov.in par visit karein.\n• Maharashtra ya anya rajyon ki state schemes ke liye local CSC center ya official state website check karein.\n• Direct application links ke liye Adhikar ki Schemes Directory browse karein.`;
  }
  return `Adhikar Citizen Assistant Guidance:\n\nRegarding your inquiry: "${message}"\n\n• Official Central Initiatives: You can explore validated central welfare programs on the National Portal of India at https://www.india.gov.in.\n• State-Specific Welfare: Visit your state government portal or local Common Service Centre (CSC) / Gram Panchayat.\n• Scheme Directory: Browse the verified Directory in the Adhikar navigation bar for eligibility and direct portal links.`;
}

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
            const cleanText = cleanStarsAndVibe(replyText);
            return NextResponse.json({ text: cleanText, links: [] });
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
            const cleanText = cleanStarsAndVibe(replyText);
            return NextResponse.json({ text: cleanText, links: [] });
          }
        }
      }
    } catch {
      // Fall through to smart mock
    }
  }

  // --- Smart Multilingual Mock (Star-Free, Clean Civic Tech Standard) ---
  const advice = getMultilingualMockAdvice(message, language);

  return NextResponse.json({
    text: cleanStarsAndVibe(advice),
    links: [],
    mock: !apiKey,
  });
}
