
import { AuditLogEntry } from '../types';

// --- ISO 42001 / AI ACT COMPLIANCE LAYER ---

const AUDIT_STORAGE_KEY = 'delos_audit_log_v1';

// 1. INPUT PROCESSING & SAFETY FILTER
export const scrubPII = (text: string): { cleanText: string; redacted: boolean } => {
    let cleanText = text;
    let redacted = false;

    // Pattern for Email
    const emailPattern = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
    if (emailPattern.test(cleanText)) {
        cleanText = cleanText.replace(emailPattern, '[EMAIL_REDACTED]');
        redacted = true;
    }

    // Pattern for Phone Numbers (Simple PL/Intl)
    const phonePattern = /(?<!\w)(\(?(\+|00)?48\)?)?[ -]?\d{3}[ -]?\d{3}[ -]?\d{3}(?!\w)/g;
    if (phonePattern.test(cleanText)) {
        cleanText = cleanText.replace(phonePattern, '[PHONE_REDACTED]');
        redacted = true;
    }

    // Pattern for PESEL-like sequences (11 digits)
    const peselPattern = /(?<!\d)\d{11}(?!\d)/g;
    if (peselPattern.test(cleanText)) {
        cleanText = cleanText.replace(peselPattern, '[ID_REDACTED]');
        redacted = true;
    }

    return { cleanText, redacted };
};

export const detectPromptInjection = (text: string): boolean => {
    const riskPatterns = [
        "ignore previous instructions",
        "zapomnij o instrukcjach",
        "delete system prompt",
        "you are not delos",
        "act as a hacked",
        "wygeneruj klucz licencyjny"
    ];
    return riskPatterns.some(pattern => text.toLowerCase().includes(pattern));
};

// 2. OPERATIONAL LOGGING & AUDIT TRAIL
export const logAudit = (
    actor: 'USER' | 'SYSTEM' | 'GUARDRAIL',
    action: AuditLogEntry['action'],
    details: string,
    status: 'SUCCESS' | 'BLOCKED' | 'WARNING'
) => {
    const entry: AuditLogEntry = {
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        actor,
        action,
        details,
        status,
        hash: Math.random().toString(36).substring(7) // Mock integrity hash
    };

    try {
        const currentLog = getAuditLog();
        const newLog = [entry, ...currentLog].slice(0, 50); // Keep last 50 events
        sessionStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(newLog));
        console.groupCollapsed(`[AUDIT] ${action} - ${status}`);
        console.log(entry);
        console.groupEnd();
    } catch (e) {
        console.error("Audit Log Failure", e);
    }
};

export const getAuditLog = (): AuditLogEntry[] => {
    try {
        const saved = sessionStorage.getItem(AUDIT_STORAGE_KEY);
        return saved ? JSON.parse(saved) : [];
    } catch {
        return [];
    }
};

export const clearAuditLog = () => {
    sessionStorage.removeItem(AUDIT_STORAGE_KEY);
};