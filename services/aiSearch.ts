const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY; 
const BASE_URL = 'https://generativelanguage.googleapis.com/v1beta';
let activeModel: string | null = null;

export interface SearchIntent {
  day?: string | null;
  filterType?: string | null;
  searchKeyword?: string | null;
  timeStart?: number | null;
  timeEnd?: number | null;
  equipment?: string[] | null;
  targetStatus?: string | null;
}

export interface BookingIntent {
  subject?: string | null;
  roomName?: string | null;
  day?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  professor?: string | null;
  capacity?: number | null;
}

export interface MaintenanceAnalysis {
  category: string;
  urgency: string;
  summary: string;
  suggestedAction: string;
}

// --- Helper to safely extract JSON from text ---
const extractJson = (text: string) => {
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]);
  } catch (e) {}
  return null;
};

// --- Get the best available model ---
const getBestWorkingModel = async () => {
  if (activeModel) return activeModel;

  const priorityList = [
    'gemini-2.5-flash', 
    'gemini-2.0-flash', 
    'gemini-pro', 
    'gemini-1.5-flash'
  ];

  try {
    const listUrl = `${BASE_URL}/models?key=${API_KEY}`;
    const response = await fetch(listUrl);
    const data = await response.json();

    if (data.models) {
      const found = data.models.find((m: any) => 
        priorityList.some(p => m.name.includes(p)) &&
        m.supportedGenerationMethods.includes('generateContent')
      );

      if (found) {
        const name = found.name.replace('models/', '');
        activeModel = name;
        return name;
      }
    }
  } catch (e) {}

  activeModel = 'gemini-pro'; // fallback
  return activeModel;
};

// --- Call Gemini API and parse JSON safely ---
const callGemini = async (promptText: string) => {
  if (!API_KEY) return null;

  const modelName = await getBestWorkingModel();
  const url = `${BASE_URL}/models/${modelName}:generateContent?key=${API_KEY}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: promptText }] }]
      }),
    });

    const data = await response.json();

    if (data.error) return null;

    if (data.candidates && data.candidates.length > 0) {
      const text = data.candidates[0].content.parts[0].text;
      const result = extractJson(text);
      return result;
    }

    return null;
  } catch (e) { 
    return null; 
  }
};

// --- Parse search filters from natural query ---
export const parseNaturalQuery = async (query: string): Promise<SearchIntent> => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const today = days[new Date().getDay()];

  const prompt = `
Context: Today is ${today}. User Query: "${query}"
Task: Extract search filters from the query.
Rules:
- Respond ONLY with a JSON object.
- Do NOT write explanations.
- If a field cannot be extracted, set it to null.

JSON FORMAT:
{ 
  "day": "string or null", 
  "filterType": "string or null", 
  "searchKeyword": "string or null", 
  "timeStart": number or null, 
  "timeEnd": number or null, 
  "targetStatus": "Available" or null 
}
`;

  const result = await callGemini(prompt);
  return result ?? { day: null, filterType: null, searchKeyword: null, timeStart: null, timeEnd: null, targetStatus: null };
};

// --- Parse booking intent from natural query ---
export const parseBookingIntent = async (query: string): Promise<BookingIntent> => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const today = days[new Date().getDay()];

  const prompt = `
Context: Today is ${today}. User Query: "${query}"
Task: Extract schedule details for booking.
Rules:
- Respond ONLY with a JSON object.
- Do NOT write explanations.
- If a field cannot be extracted, set it to null.

JSON FORMAT:
{ 
  "subject": "string or null", 
  "roomName": "string or null", 
  "day": "string or null", 
  "startTime": "string or null", 
  "endTime": "string or null", 
  "professor": "string or null" 
}
`;

  const result = await callGemini(prompt);
  return result ?? { subject: null, roomName: null, day: null, startTime: null, endTime: null, professor: null };
};

// --- Analyze maintenance issue ---
export const analyzeMaintenanceIssue = async (description: string): Promise<MaintenanceAnalysis | null> => {
  const prompt = `
User Report: "${description}"
Task: Analyze the issue.
Rules:
- Respond ONLY with a JSON object.
- Do NOT write explanations.
- If a field cannot be determined, set it to "Unknown".

JSON FORMAT:
{ "category": "string", "urgency": "string", "summary": "string", "suggestedAction": "string" }
`;

  const result = await callGemini(prompt);
  return result ?? { category: "Unknown", urgency: "Unknown", summary: "Unknown", suggestedAction: "Unknown" };
};
