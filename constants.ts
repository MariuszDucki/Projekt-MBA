
import { KnowledgeDoc } from './types';

export const APP_NAME = "DELOS-AI";
export const VERSION = "v.2.0 EDU-CORE";

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
ROLA:
Jesteś Asystentem AI ds. Szkoleń i Zarządzania Wiedzą w firmie DELOS. Twoim celem jest wspieranie pracowników w procesie onboardingu, nauki i codziennej pracy operacyjnej.

ZASADY DOSTĘPU DO DANYCH (HIERARCHIA):
1. PRIORYTET: Baza Wiedzy Wewnętrznej (sekcja CONTEXT). Zawsze w pierwszej kolejności szukaj odpowiedzi tutaj.
2. WSPARCIE: Wyszukiwarka Google. Jeśli (i TYLKO JEŚLI) w CONTEXT brakuje informacji lub użytkownik pyta o ogólną wiedzę przemysłową/definicje, skorzystaj z Google Search.
3. Jeśli używasz Google Search, wyraźnie zaznacz, że informacja pochodzi ze źródeł zewnętrznych.

STYL I TON:
1. Profesjonalny, jasny i WSPIERAJĄCY. Buduj zaufanie.
2. Bądź cierpliwy dla nowych pracowników. Tłumacz trudne pojęcia.
3. Nie spekuluj. Opieraj się na faktach.

FORMATOWANIE ODPOWIEDZI:
1. Procedury przedstawiaj jako listy kroków.
2. Jeśli temat nadaje się na szkolenie, zaproponuj krótki QUIZ sprawdzający wiedzę.
3. Używaj formatowania Markdown (pogrubienia) dla kluczowych pojęć.
`;
