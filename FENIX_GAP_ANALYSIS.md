# Analýza mezer Fenix API v1.19.0 vs. Drak konektor pro Google Looker Studio

**Datum:** 2026-07-27  
**Kontext:** Sklik GDS konektor v6.2.x — hybridní verze Drak + Fenix.  
Cíl: Fenix má nahradit Drak jako kompletní zdroj dat. Tento dokument shrnuje, co ve Fenix API v1.19.0 chybí pro plnou paritu s Drak konektorem.

---

## 1. Přehled entit — stav podpory

| Entita | Drak API metoda | Fenix v1.19.0 | Stav |
|--------|----------------|---------------|------|
| **Kampaně** | `campaigns.createReport/readReport` | `GET /sklik/campaigns/` | ✅ Existuje — chybí granularita a metadata |
| **Sestavy** | `groups.createReport/readReport` | `GET /sklik/campaigns/{id}/groups/` | ⚠️ Existuje — nested endpoint (výkonnostní problém) |
| **Inzeráty** | `ads.createReport/readReport` | `GET /sklik/campaigns/{id}/groups/{id}/ads/` | ⚠️ Existuje — doubly-nested (výkonnostní problém) |
| **Klíčová slova** | `keywords.createReport/readReport` | ❌ Chybí | ❌ Kompletně chybí |
| **Účet (přehled)** | `client.stats` | ❌ Chybí | ❌ Kompletně chybí |
| **Bannery** | `banners.createReport/readReport` | ❌ Chybí | ❌ Kompletně chybí |
| **Produktové skupiny** | `productSets.createReport/readReport` | `/nakupy/` (jiný scope) | ⚠️ Nejasné — Nakupy ≠ SEM produktové skupiny |
| **Granularita (všechny entity)** | Parametr `granularity` u všech reportů | `ReportStatisticsGranularity` jen pro Nakupy | ❌ Pro Sklik SEM chybí |

---

## 2. Prioritizované požadavky

### 🔴 KRITICKÉ (blokery pro plnohodnotné nahrazení Drak)

---

#### 2.1 Granularita statistik pro Sklik SEM

**Problém:** Fenix `/sklik/campaigns/` a `/sklik/campaigns/{id}/groups/` vrací pouze agregát za celé zadané období. Nelze získat data po dnech, týdnech, měsících atd.

Drak `createReport` podporuje granularitu: `daily | weekly | monthly | quarterly | yearly` pro všechny entity (kampaně, sestavy, klíčová slova, inzeráty, bannery, produktové skupiny, účet).

V Looker Studio jsou téměř všechny dashboardy postavené na časové řadě (trend po dnech/týdnech). Bez granularity Fenix nedokáže nahradit Drak pro žádný standardní report.

**Poznámka:** `ReportStatisticsGranularity` enum v Fenix API v1.19.0 *existuje*, ale je využíván pouze pro Nakupy async reporty (`POST /nakupy/statistics/*`). Pro Sklik SEM totálně chybí.

**Požadavek:** Přidat query parametr `statisticsGranularity` (`daily | weekly | monthly | quarterly | yearly | none`) do:
- `GET /sklik/campaigns/`
- `GET /sklik/campaigns/{id}/groups/`
- `GET /sklik/campaigns/{id}/groups/{id}/ads/`
- Budoucí endpoints: `/sklik/keywords/`, `/sklik/account/stats/`

Při `statisticsGranularity != none` endpoint vrátí více záznamů — jeden per kampaň/entitu per periodu (pole `date` nebo `period` v každém záznamu).

---

#### 2.2 Klíčová slova

**Problém:** Fenix v1.19.0 neobsahuje žádný endpoint pro klíčová slova.

Drak konektor poskytuje 25 polí přes `keywords.createReport/readReport`:

| Kategorie | Drak pole |
|-----------|-----------|
| Identifikace | id, name (text KW) |
| Metadata | status, deleted, createDate, deleteDate, url, isRegisteredBrand, isUnsuitable, isTooGeneric, isGloballyDisabled, isTrademark, isSuspicious, cpc (bid) |
| Výkonnost | clicks, impressions, ctr, avgCpc, avgPos, clickMoney, impressionMoney, totalMoney, conversions, conversionValue, transactions, pno |
| ISH metriky | missImpressions, underLowerThreshold, exhaustedBudget, stoppedBySchedule, underForestThreshold, exhaustedBudgetShare, ish, ishContext, ishSum |

**Požadavek:** Nový endpoint `GET /sklik/keywords/` (flat, s filtrací `ids[]`, `campaignIds[]`, `groupIds[]`) s podporou:
- výkonnostních statistik za zadané období
- granularity (viz 2.1)
- základních metadat (status, bid, typ shody, url)
- ISH metrik

---

#### 2.3 Statistiky na úrovni účtu

**Problém:** Fenix v1.19.0 nemá ekvivalent `client.stats`.

Drak konektor poskytuje 15 polí agregovaných za celý účet:

| Pole | Popis |
|------|-------|
| impressions, clicks, ctr, cpc | Základní výkonnost |
| price (totalMoney) | Celkové náklady |
| avgPosition | Průměrná pozice |
| conversions, conversionRatio, conversionAvgPrice | Konverze |
| conversionValue, conversionAvgValue | Hodnota konverzí |
| transactionAvgPrice, transactionAvgValue, transactionAvgCount | Transakce |

**Požadavek:** Nový endpoint `GET /sklik/account/stats/` s podporou:
- filtrování dle období
- granularity (viz 2.1)

---

### 🟠 ZÁVAŽNÉ (výkonnostní problémy)

---

#### 2.4 Flat endpoint pro sestavy

**Problém:** `GET /sklik/campaigns/{id}/groups/` vyžaduje iteraci per kampaň.

Účet s 200 kampaněmi = 200 API volání (místo jednoho u Drak `groups.createReport`). Při batch paralelním načítání (4 concurrent) trvá načtení sestavy pro velký účet desítky sekund nebo i minuty.

**Požadavek:** Nový endpoint `GET /sklik/groups/` (flat) s volitelným `campaignIds[]` filtrem, analogický k `GET /sklik/campaigns/`.

Alternativní přístup: Přidat podporu pro více `campaignIds[]` do `GET /sklik/campaigns/*/groups/` tak, aby bylo možné zadat seznam ID v jednom volání a dostat skupiny z více kampaní najednou.

---

#### 2.5 Flat endpoint pro inzeráty

**Problém:** `GET /sklik/campaigns/{id}/groups/{id}/ads/` vyžaduje iteraci per skupinu per kampaň.

Účet s 200 kampaněmi a průměrně 5 skupinami = 1000 API volání. Drak `ads.createReport` vrátí vše jedním voláním.

**Požadavek:** Nový endpoint `GET /sklik/ads/` (flat) s volitelným `campaignIds[]` a `groupIds[]` filtrem.

---

### 🟡 STŘEDNÍ PRIORITY

---

#### 2.6 Bannery

**Problém:** Fenix neobsahuje endpoint pro bannery v obsahové síti.

Drak `banners.createReport/readReport` poskytuje ~25 polí analogických k inzerátům (clickMoney, impressions, clicks, conversions, ISH metriky atd.) plus metadata specifická pro bannery (imageUrl, imageType, imageHeight/Width, premiseId, premiseMode).

**Požadavek:** Pokud bannery jako formát v Fenix nedozrávají nebo jsou deprecovány — potvrdit. Pokud jsou aktivní, přidat `GET /sklik/banners/` analogicky k ads.

---

#### 2.7 Seznam přístupných účtů

**Problém:** Ani Drak, ani Fenix nemají endpoint pro výpis účtů, ke kterým má přihlášený uživatel přístup. Tato funkce v obou API chybí — jde tedy o nový požadavek, ne jen Fenix gap.

Aktuálně uživatel zadává `userId` ručně při konfiguraci GDS konektoru. Pro agentury spravující desítky klientských účtů je to nepraktické.

**Požadavek:** Nový endpoint `GET /sklik/accounts/` nebo `GET /user/accounts/` vracející seznam přístupných účtů:
- `userId`, `login` (email), `name` (název účtu)
- `accessLevel` (úroveň přístupu: admin / read-only atd.)
- `premiseId` (identifikátor potřebný pro volání kampaní/skupin)

Umožní v GDS konektoru dropdown výběr účtu místo ručního zadávání userId.

---

#### 2.8 Produktové skupiny (SEM Nákupy)

**Problém:** Není jasné, zda `/nakupy/` endpoints pokrývají stejná data jako Drak `productSets.createReport`.

Drak konektor obsahuje `productsets` entitu s 15 poli (avgCpc, avgPos, clicks, impressions, conversions, conversionValue, totalMoney, transactions atd.).

**Požadavek:** Potvrdit, zda `/nakupy/statistics/productSet` je ekvivalent a lze použít pro GDS reporting.

---

## 3. Chybějící atributy u existujících endpoints

### 3.1 Kampaně — metadata

Drak `campaigns.createReport` vrací tato metadata, která v Fenix `/sklik/campaigns/` chybí nebo nejsou potvrzena:

| Drak pole | Popis | Stav ve Fenix |
|-----------|-------|---------------|
| `status` | Stav kampaně (aktivní/pozastavená/smazaná) | ❓ Chybí v stats response |
| `deleted`, `deleteDate` | Příznak a datum smazání | ❓ Chybí |
| `createDate` | Datum vytvoření | ❓ Chybí |
| `startDate`, `endDate` | Nastavené datum spuštění/ukončení | ❓ Chybí |
| `totalBudget` | Celkový budget kampaně | ❓ Chybí |
| `devicesPriceRatio_desktop/tablet/mobile/other` | Modifikátory nabídky pro zařízení | ❓ Chybí |
| `fulltext`, `context`, `contextNetwork` | Typ/síť kampaně | ❓ Chybí |
| `paymentMethod` | Způsob zpoplatnění | ❓ Chybí |
| `adSelection` | Střídání inzerátů | ❓ Chybí |
| `exhaustedTotalBudget` | Vyčerpaný celkový budget | ❓ Chybí |
| `totalClicks`, `totalClicksFrom` | Kumulativní prokliky od data | ❓ Chybí |
| `impressionMoney` | Cena za zobrazení | ❓ Chybí |
| `transactions` | Počet transakcí | ❓ Chybí |
| `missImpressions`, `underLowerThreshold`, `exhaustedBudget`, `stoppedBySchedule`, `underForestThreshold`, `exhaustedBudgetShare` | ISH metriky | ❓ Chybí (u skupin jsou, u kampaní?) |
| `ish`, `ishContext`, `ishSum` | Podíl ztracených zobrazení | ❓ Chybí |

### 3.2 Sestavy — missing konverzní metriky per conversionId

U skupin (groups) Fenix vrací `conversionIds[]` s: `conversions`, `totalMoney`, `conversionValue`, `clickMoney`, `conversionId`, `name`, `semEventName`.

U kampaní Fenix navíc vrací: `conversionIds.conversionPrice`, `conversionIds.conversionRatio`, `conversionIds.pno`, `conversionIds.avgCpc`.

**Požadavek:** Doplnit `conversionPrice`, `conversionRatio`, `pno` do `conversionIds` odpovědi skupin.

### 3.3 Sestavy — metadata

| Drak pole | Popis | Stav ve Fenix |
|-----------|-------|---------------|
| `status`, `deleted`, `deleteDate`, `createDate` | Stav a daty | ❓ Chybí |
| `maxCpc` | Maximální CPC sestavy | ❓ Chybí |
| `maxCpt` | Maximální CPT | ❓ Chybí |
| `sensitivity` | Citlivost sestavy | ❓ Chybí |
| `impressionMoney`, `transactions` | Výkonnostní metriky | ❓ Chybí |

---

## 4. Dopad na výkon API (rate limiting)

Aktuální stav při použití Fenix pro report sestavy (groups) u velkého účtu:

| Scénář | Drak | Fenix v1.19.0 | Rozdíl |
|--------|------|----------------|--------|
| 200 kampaní, report sestavy | 1–2 API volání | ~50 batchů × 4 = 200 volání | ~200× více |
| 200 kampaní × 5 skupin, report inzerátů | 1–2 volání | ~1000 volání | ~1000× více |
| Klíčová slova | 1–2 volání | ❌ Není možné | — |

Limit 5 req/s znamená, že 200 volání trvá minimálně 40 sekund. Looker Studio má timeout pro connector ~60 sekund → pro velké účty report sestavy timeoutuje.

**Priorita flat endpointů je tedy výkonnostní, nikoli jen uživatelská pohodlnost.**

---

## 5. Co aktuálně funguje ve Fenix (shrnutí implementovaného)

Pro referenci — co GDS konektor v6.2.x z Fenix API aktuálně používá a co funguje:

| Funkcionalita | Endpoint | Stav |
|---------------|----------|------|
| Kampaně — traffic metriky | `GET /sklik/campaigns/` | ✅ Funguje |
| Kampaně — per-sítě breakdown (fulltext/context/video) | `networks.*` atributy | ✅ Funguje |
| Kampaně — konverze per definice | `conversionIds[]` | ✅ Funguje |
| Kampaně — konverze per typ události (Purchase, Lead...) | `conversionIds.semEventName` | ✅ Funguje |
| Sestavy — traffic metriky | `GET /sklik/campaigns/{id}/groups/` | ✅ Funguje (pomalu) |
| Sestavy — konverze per definice | `conversionIds[]` u groups | ✅ Funguje |
| OAuth2 autentizace | `POST /user/token` (refresh token) | ✅ Funguje |
| Rate limit handling | `Retry-After` header | ✅ Implementováno v konektoru |

---

## 6. Doporučené pořadí implementace (ze strany Fenix API týmu)

1. **Granularita** (`statisticsGranularity` parametr pro kampaně + sestavy) — odblokuje základní time-series reporty
2. **Flat endpoint pro sestavy** (`GET /sklik/groups/`) — odblokuje výkon pro velké účty
3. **Klíčová slova** (`GET /sklik/keywords/`) — chybějící entita s největším uživatelským dopadem
4. **Statistiky účtu** (`GET /sklik/account/stats/`) — přehledový report za celý účet
5. **Flat endpoint pro inzeráty** (`GET /sklik/ads/`) — výkon
6. **Bannery** (`GET /sklik/banners/`) — pokud formát aktivní
7. **Doplnění metadat** u kampaní a skupin (status, startDate, endDate, budget atd.)
