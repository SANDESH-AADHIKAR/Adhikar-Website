export enum Language {
  ENGLISH = 'English',
  HINDI = 'Hindi',
  MARATHI = 'Marathi',
  HINGLISH = 'Hinglish',
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface GuardResponse {
  classification: 'Genuine' | 'Suspicious' | 'Fake';
  trustScore: number;
  reason: string;
  // frontend alias — old web app used `explanation`, backend returns `reason`
  explanation?: string;
  safeAdvice: string;
  officialAlternative: string;
}

export interface SchemeInfo {
  id: string;
  name: string;
  category: 'Agriculture' | 'Education' | 'Health' | 'Finance' | 'Women' | 'Social' | 'Housing';
  benefits: string;
  eligibility: string;
  link: string;
}
