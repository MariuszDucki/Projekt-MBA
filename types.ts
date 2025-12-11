
export enum MessageRole {
  USER = 'user',
  MODEL = 'model',
  SYSTEM = 'system'
}

export type WidgetType = 'checklist' | 'telemetry' | 'quiz';

export interface QuizOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface QuizData {
  question: string;
  options: QuizOption[];
  explanation: string;
}

export interface WidgetData {
  type: WidgetType;
  title: string;
  data: any; // Can be string[], TelemetryItem[], or QuizData
}

export interface Message {
  id: string;
  role: MessageRole;
  text: string;
  timestamp: number;
  isThinking?: boolean;
  visualAttachment?: string; 
  ticketPayload?: Ticket; 
  mediaPayload?: { 
    urls: string[]; 
    type: 'image' | 'video';
  };
  widget?: WidgetData;
  feedback?: 'positive' | 'negative'; // RLHF Feedback Loop
}

export interface KnowledgeDoc {
  id: string;
  title: string;
  category: 'SAFETY' | 'MAINTENANCE' | 'PROCEDURES' | 'HR';
  content: string;
  lastUpdated: string;
  mediaUrl?: string; 
  mediaType?: 'image' | 'video';
  attachedImages?: string[]; 
  embedding?: number[]; // Vector representation
}

export interface Ticket {
  id: string;
  location: string;
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
  timestamp: string;
}

// Audit Log Structure for Governance
export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actor: 'USER' | 'SYSTEM' | 'GUARDRAIL';
  action: 'QUERY' | 'RESPONSE' | 'TOOL_EXECUTION' | 'SECURITY_BLOCK' | 'DATA_RETRIEVAL' | 'USER_FEEDBACK' | 'KNOWLEDGE_GAP';
  details: string;
  status: 'SUCCESS' | 'BLOCKED' | 'WARNING';
  hash?: string; // Integrity check
}

export enum AppView {
  DASHBOARD = 'DASHBOARD',
  NEURAL_LINK = 'NEURAL_LINK', 
  MEMORY_CORE = 'MEMORY_CORE', 
  SETTINGS = 'SETTINGS',
  ABOUT = 'ABOUT' 
}

export interface SystemStat {
  name: string;
  value: number;
  fullMark: number;
}

export type Theme = 'dark' | 'light' | 'system';
