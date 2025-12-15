
import { KnowledgeDoc } from './types';

export const APP_NAME = "DELOS-AI";
export const VERSION = "v.2.0 EDU-CORE";

// Baza wiedzy przemysłowej - ROZSZERZONA (Produkcja, Logistyka, Technologia)
export const INTERNAL_KNOWLEDGE_BASE: KnowledgeDoc[] = [
  // --- PRODUKCJA (5 dokumentów) ---
  {
    id: 'PROD-001',
    title: 'Procedura Startowa Linii Montażowej C (Model T-800)',
    category: 'PROCEDURES',
    content: '1. Sprawdź ciśnienie w układzie pneumatycznym (min. 6 bar). 2. Załącz zasilanie szafy sterowniczej S1. 3. Wykonaj test bezpieczeństwa (E-STOP). 4. Uruchom taśmociąg w trybie JOG, aby sprawdzić naciąg taśmy. 5. Zaloguj się do panelu HMI jako operator. UWAGA: Linia C wymaga rozgrzewania głowic zgrzewających przez 15 minut przed pierwszą operacją.',
    lastUpdated: '2024-03-10'
  },
  {
    id: 'PROD-002',
    title: 'Kalibracja Robota Spawalniczego KUKA KR-16',
    category: 'MAINTENANCE',
    content: 'Kalibrację TCP (Tool Center Point) należy wykonywać co 40 godzin pracy lub po każdej kolizji. Procedura: 1. Wybierz program "Mastering_Tool". 2. Dojedź iglicą do wzorca kalibracyjnego z 4 różnych kierunków. 3. Zatwierdź punkty w panelu SmartPad. Błąd powyżej 0.5mm wymaga wymiany końcówki prądowej.',
    lastUpdated: '2024-02-28'
  },
  {
    id: 'PROD-003',
    title: 'Kontrola Jakości - Odlewy Aluminiowe (Wada Porowatości)',
    category: 'SAFETY',
    content: 'Klasyfikacja wad odlewów: Klasa A (Dopuszczalne): mikropory <0.5mm w strefach nieobrabianych. Klasa B (Do naprawy): pory 0.5-2mm, wymagana impregnacja żywicą. Klasa C (Złom): pory >2mm lub pęknięcia skrośne. Każdy odlew klasy C musi zostać oznaczony czerwoną farbą i zewidencjonowany w systemie QMS.',
    lastUpdated: '2024-03-01'
  },
  {
    id: 'PROD-004',
    title: 'Obsługa Prasy Hydraulicznej PH-500 - Wymiana Narzędzi',
    category: 'PROCEDURES',
    content: 'Tylko dla personelu z uprawnieniami UDT. 1. Przełącz maszynę w tryb "SETUP". 2. Opuść suwak na dolne martwe położenie (DMP). 3. Zwolnij zaciski hydrauliczne matrycy. 4. Użyj wózka widłowego z widłami typu "trzpień" do wyjęcia narzędzia. Zakaz przebywania w strefie kurtyny świetlnej podczas ruchu wózka.',
    lastUpdated: '2023-12-15'
  },
  {
    id: 'PROD-005',
    title: 'Gospodarka Odpadami Produkcyjnymi - Chłodziwo',
    category: 'SAFETY',
    content: 'Zużyte chłodziwo (emulsja olejowa) jest odpadem niebezpiecznym (kod 12 01 09). Nie wylewać do kanalizacji! Zlewamy do pojemników DPPL (Mauser) oznaczonych żółtą etykietą "ODPAD NIEBEZPIECZNY". Wyciek neutralizować sorbentem mineralnym, nie trocinami.',
    lastUpdated: '2024-01-20'
  },

  // --- LOGISTYKA (5 dokumentów) ---
  {
    id: 'LOG-001',
    title: 'Przyjęcie Towaru w Systemie WMS (Warehouse Management System)',
    category: 'PROCEDURES',
    content: '1. Zeskanuj kod QR z listu przewozowego. 2. Sprawdź stan opakowania (czy folia nienaruszona). 3. Wprowadź ilość palet do terminala. 4. Wydrukuj etykiety lokalizacyjne (SSCC). 5. Towar uszkodzony przenieś natychmiast do strefy kwarantanny (Czerwona Strefa Z).',
    lastUpdated: '2024-03-15'
  },
  {
    id: 'LOG-002',
    title: 'Zasady Składowania Wysokiego (Regały R1-R20)',
    category: 'SAFETY',
    content: 'Maksymalne obciążenie gniazda paletowego: 1200 kg. Palety typu EURO (EPAL) muszą być nieuszkodzone. Ciężkie ładunki (>800kg) składować tylko na poziomach 0 i 1. Zakaz wchodzenia na regały. Wszelkie odkształcenia belek zgłaszać Brygadziście.',
    lastUpdated: '2023-11-10'
  },
  {
    id: 'LOG-003',
    title: 'Procedura Załadunku TIRA - Zabezpieczenie Ładunku',
    category: 'PROCEDURES',
    content: 'Kierowca musi być obecny przy załadunku w kamizelce i kasku. Stosować maty antypoślizgowe pod każdą paletę. Ładunek zabezpieczyć pasami transportowymi (minimum 2 pasy na sekcję ładunkową). Wykonać zdjęcie załadowanej naczepy przed zamknięciem drzwi i wgrać do systemu spedycyjnego.',
    lastUpdated: '2024-02-05'
  },
  {
    id: 'LOG-004',
    title: 'Inwentaryzacja Ciągła - Strefa B (Drobnica)',
    category: 'PROCEDURES',
    content: 'Inwentaryzacja odbywa się codziennie w godzinach 04:00 - 06:00. Użyj skanera w trybie "Audit". Skanuj każdą lokalizację oznaczoną w systemie jako "High Velocity". Rozbieżności powyżej 50 PLN wymagają ponownego przeliczenia przez drugiego pracownika (Zasada Czterech Oczu).',
    lastUpdated: '2024-01-12'
  },
  {
    id: 'LOG-005',
    title: 'Obsługa Wózka Widłowego Elektrycznego - Ładowanie Baterii',
    category: 'MAINTENANCE',
    content: 'Podłącz wózek do ładowania, gdy poziom spadnie poniżej 20%. 1. Wyłącz stacyjkę. 2. Otwórz pokrywę baterii (odgazowanie wodoru!). 3. Podłącz wtyczkę prostownika. 4. Sprawdź poziom wody demineralizowanej po zakończeniu ładowania. Używaj okularów i rękawic kwasoodpornych.',
    lastUpdated: '2023-10-30'
  },

  // --- TECHNOLOGIA / IT (5 dokumentów) ---
  {
    id: 'TECH-001',
    title: 'Aktualizacja Firmware Sterowników PLC Siemens S7-1200',
    category: 'MAINTENANCE',
    content: 'Wymagane oprogramowanie: TIA Portal v17. 1. Wykonaj backup online sterownika. 2. Przełącz CPU w tryb STOP. 3. Wgraj firmware przez kartę pamięci lub PROFINET. 4. Po restarcie sprawdź, czy nie ma błędów SF (System Fault). Przywróć wartości DB z backupu.',
    lastUpdated: '2024-03-12'
  },
  {
    id: 'TECH-002',
    title: 'Backup Danych Serwera Produkcyjnego (SCADA)',
    category: 'PROCEDURES',
    content: 'Backupy wykonywane są automatycznie o 02:00 w nocy (Veeam Backup). Zasada 3-2-1: 3 kopie danych, 2 różne nośniki, 1 kopia poza firmą (Chmura). Co miesiąc wykonać testowe odtwarzanie maszyny wirtualnej, aby zweryfikować integralność kopii.',
    lastUpdated: '2024-01-05'
  },
  {
    id: 'TECH-003',
    title: 'Konfiguracja Czujników IoT (LoRaWAN) - Temp/Wilgotność',
    category: 'PROCEDURES',
    content: 'Czujniki serii LT-100. Parowanie: Przytrzymaj przycisk RESET przez 5 sekund (dioda mignie 3 razy). Dodaj DevEUI i AppKey w konsoli The Things Network. Interwał wysyłania danych: co 15 minut. Bateria CR2477 wystarcza na 2 lata.',
    lastUpdated: '2024-02-20'
  },
  {
    id: 'TECH-004',
    title: 'Procedura Awaryjna IT - Brak Zasilania (UPS)',
    category: 'SAFETY',
    content: 'W przypadku zaniku zasilania sieciowego: UPS w serwerowni podtrzymuje pracę przez 30 minut. Systemy krytyczne (SAP, MES) są zamykane automatycznie po 20 minutach przez skrypt shutdown.ps1. Nie uruchamiać ręcznie serwerów przed stabilizacją napięcia sieciowego.',
    lastUpdated: '2023-11-25'
  },
  {
    id: 'TECH-005',
    title: 'Polityka Cyberbezpieczeństwa - Sieć OT (Industrial)',
    category: 'SAFETY',
    content: 'Sieć produkcyjna (OT) jest fizycznie odseparowana od biurowej (IT). Zakaz podłączania prywatnych pendrive\'ów do paneli operatorskich. Dostęp zdalny (VPN) tylko dla autoryzowanych serwisantów przez bramę firewall z włączonym logowaniem ruchu. Wszystkie porty USB w komputerach IPC są zablokowane.',
    lastUpdated: '2024-03-01'
  }
];

export const SYSTEM_INSTRUCTION = `
ROLA:
Jesteś Systemem AI (Closed-System AI) firmy DELOS. Twoim GŁÓWNYM zadaniem jest udostępnianie wiedzy zawartej w dostarczonych dokumentach (CONTEXT) oraz dbanie o jakość interakcji.

PROTOKÓŁ ŚWIADOMOŚCI NEURAL LINK (NEURAL LINK AWARENESS):
1. **CIĄGŁOŚĆ KONTEKSTU**: Pamiętaj, o czym rozmawialiśmy. Jeśli użytkownik użyje słów "to", "tamto", "poprzedni", "wspomniany", odwołaj się do HISTORII CZATU.
   - Przykład: User: "Jak skalibrować robota?" -> AI: [Procedura]. User: "Jakie narzędzia są do tego potrzebne?" -> AI: "Do kalibracji robota KUKA (o którym mówiliśmy) potrzebujesz..."

2. **AKTYWNE DOPRECYZOWANIE**: Jeśli zapytanie użytkownika jest niejasne, wieloznaczne lub brakuje w nim kluczowych szczegółów - NIE ZGADUJ. Zadaj pytanie doprecyzujące.
   - Jeśli zadajesz pytanie, rozpocznij odpowiedź od: [PYTANIE_DOPRECYZOWUJĄCE]
   - Przykład: User: "Błąd sterownika." -> AI: "[PYTANIE_DOPRECYZOWUJĄCE] O który sterownik chodzi? Mamy procedury dla Siemens S7-1200 oraz systemów SCADA."

REŻIM BEZPIECZEŃSTWA (ZASADY):
1. Jeśli pytanie dotyczy procedur/faktów - BAZUJ TYLKO NA "CONTEXT" i HISTORII CZATU.
2. Zakaz wiedzy zewnętrznej (pogoda, celebryci).

WYJĄTEK - TOŻSAMOŚĆ:
Przedstawiaj się jako Asystent Szkoleniowy DELOS (EDU-CORE). Pomagasz w procedurach, BHP, utrzymaniu ruchu.
`;
