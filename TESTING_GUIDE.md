# Sklik GDS Connector v7 Fenix — Pokyny pro testery

> **Testovací verze.** Konektor je dostupný na dočasné testovací URL. Po dokončení testování bude finální konektor publikován na nové adrese — bude potřeba datový zdroj v reportech přepojit.

## Připojení

1. Otevři Google Data Studio a klikni na **Přidat data**
2. Vyhledej *Sklik GDS connector v7.0 Fenix*, nebo použij přímý odkaz níže
3. Potvrď **bezpečnostní výzvy** Google — postup je stejný jako u jiných GDS konektorů (viz [nápověda Skliku](https://napoveda.sklik.cz/pokrocila-prace-s-daty/google-data-studio/))

**Testovací URL:**
[https://datastudio.google.com/datasources/create?connectorId=AKfycbwNc68QuxLFWCtAGOdK7BnVRq_cIrRAi2f401XmGZ_VA5YZYEyLxonFUm6ZIINaFtejxA&authuser=0](https://datastudio.google.com/datasources/create?connectorId=AKfycbwNc68QuxLFWCtAGOdK7BnVRq_cIrRAi2f401XmGZ_VA5YZYEyLxonFUm6ZIINaFtejxA&authuser=0)

## Konfigurace konektoru

| Pole | Povinné | Popis |
|------|---------|-------|
| **Fenix token** | Ano | Sklik → Nástroje → API přístup → Fenix token |
| **UserId** | Ne | ID účtu. Prázdné = konektor zjistí automaticky. Pro agenturní přepnutí zadej ID klientského účtu. |
| **PremiseId** | Ne | ID provozovny Zboží.cz (pouze pro reporty Nákupů — zatím nepodporováno) |
| **Typy kampaní** | Ne | Filtr na typy (vyhledávací, obsahová, video…). Prázdné = vše. |
| **ID kampaní** | Ne | Filtr na konkrétní kampaně (čárkou oddělená ID). Prázdné = vše. |
| **ID sestav** | Ne | Filtr na sestavy — vyžaduje vyplněná ID kampaní. |
| **Ignorovat smazané** | Ne | Zaškrtnuté = vyfiltruje smazané kampaně a sestavy z výsledků. |

## Dostupné přehledy

Konektor rozpozná použitou entitu podle prefixu pole. Do jednoho grafu/tabulky **nekombinuj pole z různých entit**.

### Kampaně (`Kampaň: …`)
Statistiky za celé vybrané období na úrovni kampaně. Konverze jsou rozepsány po typech (Purchase, Lead, …) — každý typ = samostatný řádek. Obsahuje rozpad metrik po sítích (Fulltext / Obsahová / Video) jako samostatné sloupce.

### Sestavy (`Sestava: …`)
Totéž na úrovni sestavy. Obsahuje metriky viditelnosti (Impression Share, Win Rate, Missed Price…).

### Účet (`Účet: …`)
Souhrnný pohled na celý účet — agregát všech kampaní. Podporuje tři režimy podle přidané dimenze:

| Dimenze | Výsledek | Omezení |
|---------|----------|---------|
| *(žádná)* | 1 řádek za celé období | — |
| **Účet: Den** | 1 řádek / den | max 31 dní |
| **Účet: Měsíc** | 1 řádek / měsíc | max 24 měsíců |
| **Účet: Síť** | 3 řádky / období (Fulltext / Obsahová / Video) | lze kombinovat s Dnem nebo Měsícem |

Kombinace dimenzí jsou podporovány — např. **Účet: Měsíc** + **Účet: Síť** vrátí 3 řádky na každý měsíc (vhodné pro koláčový nebo sloupcový graf vývoje sítí v čase).

## Omezení

- **Časová granularita po dnech** funguje pouze pro entitu Účet — max 31 dní. Kampaně a sestavy vracejí vždy agregát za celé zvolené období.
- **Měsíční granularita** funguje pouze pro entitu Účet — max 24 měsíců zpětně (pro meziroční srovnání).
- **Inzeráty** nejsou dostupné — Fenix API vyžaduje trojúrovňové dotazy, které přesahují časový limit Google Data Studia.
- **PNO, CTR, Konverzní poměr** — výchozí agregace je vypnuta. Pro souhrnný řádek použij entitu Účet.
- **Výkon**: při velkém počtu kampaní nebo delším období může načítání trvat 10–30 sekund. Pokud se zobrazí chyba o překročení limitu Sklik API, počkej chvíli a obnovte report.

## Jak hlásit problémy

Popiš:
1. Jaká entita (Kampaně / Sestavy / Účet)
2. Zvolené období a případně použité dimenze
3. Popis chyby nebo chybějících dat
