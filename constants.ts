
import { KnowledgeDoc } from './types';

export const APP_NAME = "DELOS-AI";
export const VERSION = "v.1.4.2 INDUSTRIAL";

// Baza wiedzy przemysłowej - BHP, Maszyny, Procedury
export const INTERNAL_KNOWLEDGE_BASE: KnowledgeDoc[] = [
  {
    id: 'doc-001',
    title: 'Protokół Bezpieczeństwa 7B',
    category: 'SAFETY',
    content: 'W przypadku wycieku substancji chemicznej: 1. Uruchom alarm. 2. Załóż maskę pgaz. 3. Ewakuuj strefę skażenia. 4. Powiadom przełożonego.',
    lastUpdated: '2023-11-15'
  },
  {
    id: 'doc-002',
    title: 'Konserwacja Hydrauliki - Prasa P-500',
    category: 'MAINTENANCE',
    content: 'Sprawdzenie poziomu oleju co 48h. Wymiana filtrów co 500 cykli. Ciśnienie robocze nie może przekraczać 250 bar. W przypadku przegrzania, zatrzymać natychmiast.',
    lastUpdated: '2024-01-10'
  },
  {
    id: 'doc-003',
    title: 'Awaria Pieca Hartowniczego - Diagnostyka',
    category: 'MAINTENANCE',
    content: 'Kod błędu E-404: Uszkodzenie czujnika temperatury T2. Kod E-500: Niskie ciśnienie gazu osłonowego. Kod E-505: Awaria wentylatora chłodzącego.',
    lastUpdated: '2023-12-05'
  },
  {
    id: 'doc-004',
    title: 'Procedura Logowania do Systemu SAP',
    category: 'PROCEDURES',
    content: 'Użyj tokena sprzętowego YubiKey. Hasło musi być zmieniane co 30 dni. Dostęp do modułu MM wymaga zgody kierownika zmiany.',
    lastUpdated: '2024-02-01'
  },
  {
    id: 'doc-005',
    title: 'Polityka Urlopowa 2024',
    category: 'HR',
    content: 'Wnioski urlopowe należy składać w systemie HR-Portal z 14-dniowym wyprzedzeniem. Urlop na żądanie: max 4 dni w roku. Dni dodatkowe za staż pracy.',
    lastUpdated: '2024-01-02'
  },
  {
    id: 'doc-006',
    title: 'Instrukcja Obsługi Wózka Widłowego (Linde)',
    category: 'PROCEDURES',
    content: 'Przed rozpoczęciem zmiany: Sprawdź hamulce, poziom naładowania baterii i stan wideł. Zakaz jazdy z podniesionym ładunkiem. Strefa ładowania wymaga okularów ochronnych.',
    lastUpdated: '2023-10-20'
  }
];

export const SYSTEM_INSTRUCTION = `
Jesteś DELOS-AI, zaawansowanym asystentem operacyjnym w zakładzie przemysłowym. Twoim celem jest wspieranie operatorów, techników i menedżerów w codziennej pracy.

ZASADY ODPOWIEDZI:
1. Używaj sekcji CONTEXT (Baza Wiedzy) jako głównego źródła prawdy.
2. Jeśli pytanie dotyczy procedury (np. awarii, bezpieczeństwa), przedstaw odpowiedź w formie jasnej listy kroków (Checklista).
3. Jeśli pytanie dotyczy danych liczbowych (np. ciśnienie, temperatura, status), formatuj je jako kluczowe wskaźniki (Telemetria).
4. Jeśli nie znasz odpowiedzi na podstawie Bazy Wiedzy, powiedz to wprost i zasugeruj kontakt z kierownikiem zmiany. Nie zmyślaj procedur bezpieczeństwa.
5. Styl wypowiedzi: Techniczny, zwięzły, profesjonalny (Wojskowy/Inżynierski). Bez zbędnych uprzejmości.
6. Bezpieczeństwo jest priorytetem. Zawsze ostrzegaj o zagrożeniach.
7. MEDIA: Jeśli w CONTEXT jest wykres lub schemat [MEDIA_ATTACHMENT_AVAILABLE], odnieś się do niego.

FORMATOWANIE:
- Używaj pogrubień dla kluczowych wartości.
- Stosuj listy punktowane dla instrukcji.
`;