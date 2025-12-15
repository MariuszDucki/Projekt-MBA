
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
    status: 'SUCCESS' | 'BLOCKED' | 'WARNING',
    standard?: AuditLogEntry['complianceStandard']
) => {
    // Auto-tagging logic if not provided
    let complianceTag = standard;
    if (!complianceTag) {
        if (action === 'SECURITY_BLOCK') complianceTag = 'NIST_RMF';
        else if (action === 'DATA_RETRIEVAL' && status === 'WARNING') complianceTag = 'ISO_27001'; // External access
        else if (details.includes('PII') || details.includes('Redacted')) complianceTag = 'ISO_27701';
        else if (action === 'TOOL_EXECUTION') complianceTag = 'ISO_42001'; // Lifecycle / Operation
        else complianceTag = 'EU_AI_ACT'; // General transparency
    }

    const entry: AuditLogEntry = {
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        actor,
        action,
        details,
        status,
        hash: Math.random().toString(36).substring(7), // Mock integrity hash
        complianceStandard: complianceTag
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

// Mock Data Subject Access Request (DSAR) - ISO 27701
export const exportUserData = () => {
    logAudit('SYSTEM', 'DATA_RETRIEVAL', 'DSAR: User requested data export (Right to Portability)', 'SUCCESS', 'ISO_27701');
    alert("ISO 27701: Data Subject Access Request initiated. Package downloading...");
};

export const deleteUserData = () => {
    logAudit('SYSTEM', 'SECURITY_BLOCK', 'DSAR: User requested data deletion (Right to be Forgotten)', 'SUCCESS', 'ISO_27701');
    alert("ISO 27701: Right to be Forgotten processed. Local logs purged.");
    clearAuditLog();
};
