// services/aiSearch.ts

const API_KEY = 'AIzaSyBZhs5Aw5BogQqcuzqEW35B2tRXICN389k'; 
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;

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

// --- 1. DASHBOARD SEARCH (Existing) ---
export const parseNaturalQuery = async (query: string): Promise<SearchIntent | null> => {
  // ... (Keep your existing parseNaturalQuery logic here, or copy it from previous answer) ...
  // I will include the simplified version below for completeness:
  try {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = days[new Date().getDay()];
    const prompt = `
      Context: Today is ${today}.
      User Query: "${query}"
      Task: Extract search filter intent.
      Output JSON: { "day": "Monday"|null, "filterType": "Laboratory"|null, "searchKeyword": "string"|null }
    `;
    return await callGemini(prompt);
  } catch (e) { return null; }
};

// --- 2. SMART BOOKING (New!) ---
export const parseBookingIntent = async (query: string): Promise<BookingIntent | null> => {
  try {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = days[new Date().getDay()];

    const prompt = `
      You are a scheduler assistant.
      Context: Today is ${today}.
      User Query: "${query}"

      Task: Extract class scheduling details into JSON.
      
      Rules:
      1. Convert relative days (tomorrow, next tuesday) to strict days (Monday...Sunday).
      2. Standardize times to "HH:MM AM/PM" format (e.g. 09:00 AM).
      3. If duration is given (e.g. "for 2 hours"), calculate endTime based on startTime.
      4. Extract Professor name if mentioned.
      5. Extract Room Name if mentioned.

      Output JSON Only:
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
  } catch (error) {
    console.error("AI Booking Error:", error);
    return null;
  }
};

// --- HELPER FUNCTION ---
const callGemini = async (promptText: string) => {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: promptText }] }],
        generationConfig: { response_mime_type: "application/json" }
      }),
    });
    const data = await response.json();
    if (data.candidates && data.candidates.length > 0) {
      const text = data.candidates[0].content.parts[0].text;
      return JSON.parse(text.replace(/```json/g, '').replace(/```/g, '').trim());
    }
    return null;
  } catch (e) { return null; }
};

// services/aiSearch.ts (Append this to your existing file)

export interface MaintenanceAnalysis {
  category: 'Electrical' | 'Plumbing' | 'HVAC' | 'Equipment' | 'Cleaning' | 'Other';
  urgency: 'Low' | 'Medium' | 'High' | 'Critical';
  summary: string;
  suggestedAction: string;
}

export const analyzeMaintenanceIssue = async (description: string): Promise<MaintenanceAnalysis | null> => {
  try {
    const prompt = `
      You are a Facility Manager AI.
      User Report: "${description}"

      Task: Analyze this maintenance issue.
      
      Rules:
      1. Categorize into ONE: Electrical, Plumbing, HVAC, Equipment, Cleaning, Other.
      2. Determine Urgency based on safety/impact (Critical = dangerous/blocking class, Low = cosmetic).
      3. Create a concise 3-5 word Summary.
      4. Suggest a 3-5 word Action (e.g. "Call IT Support", "Check Circuit Breaker").

      Output JSON Only:
      {
        "category": "Equipment",
        "urgency": "Medium",
        "summary": "Projector flickering issue",
        "suggestedAction": "Replace HDMI cable"
      }
    `;

    // Reusing the internal callGemini function from your existing file
    // If you didn't export callGemini previously, just copy the fetch logic here:
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { response_mime_type: "application/json" }
      }),
    });

    const data = await response.json();
    if (data.candidates && data.candidates.length > 0) {
      const text = data.candidates[0].content.parts[0].text;
      return JSON.parse(text.replace(/```json/g, '').replace(/```/g, '').trim());
    }
    return null;

  } catch (error) {
    console.error("AI Maintenance Error:", error);
    return null;
  }
};