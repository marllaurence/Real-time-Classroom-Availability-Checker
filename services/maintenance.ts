export interface MaintenanceTicket {
  id: number;
  description: string;      // The original text the user typed
  category: string;         // AI determined (e.g., "HVAC", "Electrical")
  urgency: string;          // AI determined (e.g., "High", "Low")
  summary: string;          // Short AI summary
  suggestedAction: string;  // AI suggested fix
  date: string;             // Timestamp
  status: 'Pending' | 'In Progress' | 'Resolved'; // Ticket status
}

// --- MOCK DATABASE ---
// In a real app, this data would come from a backend (Firebase, Supabase, SQL).
let maintenanceTickets: MaintenanceTicket[] = [
  {
    id: 1715623,
    description: "The projector in Lab 1 keeps flickering blue and then turning off.",
    category: "Equipment",
    urgency: "Medium",
    summary: "Projector display failure",
    suggestedAction: "Check HDMI / Replace Bulb",
    date: new Date(Date.now() - 86400000).toISOString(), // Yesterday
    status: 'Pending'
  },
  {
    id: 1715624,
    description: "Water is leaking from the ceiling in the back corner near the window.",
    category: "Plumbing",
    urgency: "High",
    summary: "Ceiling water leak",
    suggestedAction: "Inspect roof/pipes immediately",
    date: new Date().toISOString(),
    status: 'In Progress'
  }
];

// --- ACTIONS ---

// 1. ADD TICKET
export const addMaintenanceTicket = (
  description: string, 
  aiAnalysis: { category: string; urgency: string; summary: string; suggestedAction: string }
) => {
  const newTicket: MaintenanceTicket = {
    id: Date.now(), // Simple unique ID based on timestamp
    description,
    category: aiAnalysis.category,
    urgency: aiAnalysis.urgency,
    summary: aiAnalysis.summary,
    suggestedAction: aiAnalysis.suggestedAction,
    date: new Date().toISOString(),
    status: 'Pending'
  };
  
  // Add to the start of the array (newest first)
  maintenanceTickets.unshift(newTicket);
  return { success: true, ticket: newTicket };
};

// 2. GET ALL TICKETS
export const getMaintenanceTickets = () => {
  return maintenanceTickets;
};

// 3. UPDATE STATUS
export const updateTicketStatus = (id: number, newStatus: 'Pending' | 'In Progress' | 'Resolved') => {
  const ticket = maintenanceTickets.find(t => t.id === id);
  if (ticket) {
    ticket.status = newStatus;
    return { success: true };
  }
  return { success: false, message: "Ticket not found" };
};

// 4. DELETE TICKET
export const deleteMaintenanceTicket = (id: number) => {
  const initialLength = maintenanceTickets.length;
  maintenanceTickets = maintenanceTickets.filter(t => t.id !== id);
  return { success: maintenanceTickets.length < initialLength };
};