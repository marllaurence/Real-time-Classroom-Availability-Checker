// services/aiSearch.ts

const API_KEY = 'AIzaSyBZhs5Aw5BogQqcuzqEW35B2tRXICN389k'; 
const BASE_URL = 'https://generativelanguage.googleapis.com/v1beta';

let cachedModel: string | null = null;

// --- INTERFACES ---
export interface SearchIntent {
  day?: string;
  filterType?: string;
  searchKeyword?: string;
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

// --- DYNAMIC MODEL FINDER (Prevents 404 Errors) ---
const getBestModel = async (): Promise<string> => {
  if (cachedModel) return cachedModel;
  try {
    const response = await fetch(`${BASE_URL}/models?key=${API_KEY}`);
    const data = await response.json();
    if (data.models) {
      const preferred = ['gemini-1.5-flash', 'gemini-1.5-flash-001', 'gemini-pro'];
      let found = data.models.find((m: any) => preferred.some(p => m.name.includes(p)) && m.supportedGenerationMethods.includes('generateContent'));
      if (!found) found = data.models.find((m: any) => m.supportedGenerationMethods.includes('generateContent'));
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
  try { return JSON.parse(text); } 
  catch (e) {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) { try { return JSON.parse(jsonMatch[0]); } catch (e2) { return null; } }
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
    if (data.candidates && data.candidates.length > 0) {
      return extractJson(data.candidates[0].content.parts[0].text);
    }
    return null;
  } catch (e) { return null; }
};

// --- 1. DASHBOARD SEARCH (UPDATED FOR GENERAL QUERIES) ---
export const parseNaturalQuery = async (query: string): Promise<SearchIntent | null> => {
  try {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = days[new Date().getDay()];
    
    const prompt = `
      Context: Today is ${today}.
      User Query: "${query}"
      
      Task: Extract search filters.
      Available Filters: ['All', 'Lecture Hall', 'Laboratory', 'Computer Lab', 'Seminar Room', 'Auditorium', 'Conference Room'].
      
      Rules:
      1. 'day': Convert relative terms (tomorrow, next monday) to strict Day string.
      2. 'filterType': 
         - If user asks for specific type (e.g. "Lab"), match strict. 
         - If user asks for generic "room", "space", "anywhere", or "class", return "All".
         - If uncertain, return "All".
      3. 'searchKeyword': Specific room names (e.g. "CL5"). If generic "free room", leave keyword empty.
      
      RETURN JSON ONLY. NO MARKDOWN.
      Format: { "day": "Monday"|null, "filterType": "string"|null, "searchKeyword": "string"|null }
    `;
    
    return await callGemini(prompt);
  } catch (e) { return null; }
};

// --- 2. SMART BOOKING ---
export const parseBookingIntent = async (query: string): Promise<BookingIntent | null> => {
  try {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = days[new Date().getDay()];

    const prompt = `
      Context: Today is ${today}.
      User Query: "${query}"
      Task: Extract scheduling details.
      Rules:
      1. Convert relative days to strict Day strings.
      2. Convert times to "HH:MM AM/PM" (e.g. 09:00 AM).
      
      RETURN JSON ONLY. NO MARKDOWN.
      Format:
      {
        "subject": "string" | null,
        "roomName": "string" | null,
        "day": "Monday" | null,
        "startTime": "09:00 AM" | null,
        "endTime": "11:00 AM" | null,
        "professor": "string" | null
      }
    `;
    return await callGemini(prompt);
  } catch (error) { return null; }
};

// --- 3. MAINTENANCE ANALYSIS ---
export const analyzeMaintenanceIssue = async (description: string): Promise<MaintenanceAnalysis | null> => {
  try {
    const prompt = `
      User Report: "${description}"
      Task: Analyze maintenance issue.
      Rules:
      1. Category: Electrical, Plumbing, HVAC, Equipment, Cleaning, Other.
      2. Urgency: Low, Medium, High, Critical.
      3. Summary: 3-5 words.
      4. SuggestedAction: Short fix.

      RETURN JSON ONLY. NO MARKDOWN.
      Format:
      {
        "category": "Equipment",
        "urgency": "Medium",
        "summary": "string",
        "suggestedAction": "string"
      }
    `;
    return await callGemini(prompt);
  } catch (error) { return null; }
};