// services/aiSearch.ts

// ✅ Read from .env
const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY; 

const BASE_URL = 'https://generativelanguage.googleapis.com/v1beta';

let cachedModel: string | null = null;

// --- INTERFACES ---
export interface SearchIntent {
  day?: string;
  filterType?: string;
  searchKeyword?: string;
  timeStart?: number; 
  timeEnd?: number;   
  minCapacity?: number;    
  equipment?: string[];    
  targetStatus?: string;   
}

export interface BookingIntent {
  subject?: string;
  roomName?: string;
  day?: string;
  startTime?: string;
  endTime?: string;
  professor?: string;
  capacity?: number;
}

export interface MaintenanceAnalysis {
  category: string;
  urgency: string;
  summary: string;
  suggestedAction: string;
}

// --- DYNAMIC MODEL FINDER ---
const getBestModel = async (): Promise<string> => {
  if (cachedModel) return cachedModel;
  try {
    const response = await fetch(`${BASE_URL}/models?key=${API_KEY}`);
    const data = await response.json();
    if (data.models) {
      const preferred = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-pro'];
      let found = data.models.find((m: any) => preferred.some(p => m.name.includes(p)) && m.supportedGenerationMethods.includes('generateContent'));
      
      if (!found) {
        found = data.models.find((m: any) => m.supportedGenerationMethods.includes('generateContent'));
      }
      
      if (found) {
        const modelName = found.name.replace('models/', '');
        cachedModel = modelName;
        return modelName;
      }
    }
  } catch (e) { console.error("Error listing models:", e); }
  return 'gemini-pro'; 
};

// --- HELPER: JSON EXTRACTION ---
const extractJson = (text: string) => {
  try {
    let cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const firstOpen = cleanText.indexOf('{');
    const lastClose = cleanText.lastIndexOf('}');
    if (firstOpen !== -1 && lastClose !== -1) {
      cleanText = cleanText.substring(firstOpen, lastClose + 1);
      return JSON.parse(cleanText);
    }
    return null;
  } catch (e) {
    console.error("JSON Parse Error:", text);
    return null;
  }
};

// --- CORE API CALLER ---
const callGemini = async (promptText: string) => {
  try {
    const model = await getBestModel();
    const response = await fetch(`${BASE_URL}/models/${model}:generateContent?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: promptText }] }] }),
    });
    
    const data = await response.json();
    
    if (data.error) {
      console.error("🔴 API Error:", data.error.message);
      return null;
    }

    if (data.candidates && data.candidates.length > 0) {
      const text = data.candidates[0].content.parts[0].text;
      return extractJson(text);
    }
    return null;
  } catch (e) { return null; }
};

// --- EXPORTED FUNCTIONS ---
export const parseNaturalQuery = async (query: string): Promise<SearchIntent | null> => {
  const prompt = `
    Context: Today is ${new Date().toLocaleDateString('en-US', { weekday: 'long' })}.
    User Query: "${query}"
    Task: Extract search requirements.
    Ref Data: Types: ['Lecture Hall', 'Laboratory', 'Computer Lab', 'Seminar Room', 'Auditorium', 'Conference Room']
    Rules:
    1. 'day': Convert relative (tomorrow) to strict Day string.
    2. 'filterType': Fuzzy match to Types. If "room"/"any"/"empty", return "All".
    3. 'searchKeyword': Specific names (e.g. "CL5").
    4. 'timeStart'/'timeEnd': 24h numbers. "12pm" = start:12, end:13.
    5. 'targetStatus': "Available" (default), "Maintenance".
    
    OUTPUT RAW JSON ONLY:
    { "day": "Monday"|null, "filterType": "string"|null, "searchKeyword": "string"|null, "timeStart": number|null, "timeEnd": number|null, "targetStatus": "Available"|null }
  `;
  return await callGemini(prompt);
};

export const parseBookingIntent = async (query: string): Promise<BookingIntent | null> => {
  const prompt = `
    Context: Today is ${new Date().toLocaleDateString('en-US', { weekday: 'long' })}.
    User Query: "${query}"
    Task: Extract schedule details.
    OUTPUT RAW JSON ONLY:
    { "subject": "string"|null, "roomName": "string"|null, "day": "string"|null, "startTime": "string"|null, "endTime": "string"|null, "professor": "string"|null }
  `;
  return await callGemini(prompt);
};

export const analyzeMaintenanceIssue = async (description: string): Promise<MaintenanceAnalysis | null> => {
  const prompt = `
    User Report: "${description}"
    Task: Analyze issue.
    Rules:
    1. Category: Electrical, Plumbing, HVAC, Equipment, Cleaning, Other.
    2. Urgency: Low, Medium, High, Critical.
    OUTPUT RAW JSON ONLY:
    { "category": "Equipment", "urgency": "Medium", "summary": "string", "suggestedAction": "string" }
  `;
  return await callGemini(prompt);
};