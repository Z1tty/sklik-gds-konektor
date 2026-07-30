/*
Sklik Fenix connector for Google Data Studio
Copyright (C) 2026 Seznam.cz, a.s.
Author: Josef Matoušek
*/

function getConfig(request) {
  var config = {
    configParams: [
      {
        type: "TEXTINPUT",
        name: "fenixToken",
        displayName: "Fenix token",
        text: "Vyplňte Fenix API token ze Skliku",
        helpText: "Token získáte v Skliku: Nástroje → API přístup → Fenix token.",
        placeholder: ""
      },
      {
        type: "TEXTINPUT",
        name: "userId",
        displayName: "UserId (volitelné)",
        text: "ID účtu, jehož data chcete zobrazit. Nechte prázdné pro vlastní účet.",
        helpText: "ID účtu zjistíte v nastavení Skliku nebo v URL při přepnutí účtu.",
        placeholder: "Prázdné = vlastní účet"
      },
      {
        type: "TEXTINPUT",
        name: "premiseId",
        displayName: "PremiseId (volitelné)",
        text: "ID provozovny Zboží.cz / Seznam Nákupy pro přístup k datům Nákupů.",
        helpText: "PremiseId najdete v administraci Zboží.cz. Potřebné pouze pro reporty Seznam Nákupy.",
        placeholder: "Prázdné = bez Nákupů"
      },
      {
        type: "SELECT_MULTIPLE",
        name: "campaignsTypes",
        displayName: "Výběr typů kampaní",
        helpText: "Statistiky budou pouze z kampaní vybraných typů.",
        options: [
          { label: "Kombinovaná",         value: "combined" },
          { label: "Videokampaň",          value: "video" },
          { label: "Obsahová",             value: "context" },
          { label: "Vyhledávací",          value: "fulltext" },
          { label: "Produktová",           value: "product" },
          { label: "Zboží.cz",             value: "zbozi" },
          { label: "Jednoduchá obsahová",  value: "simple" },
          { label: "Sociální",             value: "social" },
          { label: "Audio",                value: "audio" },
          { label: "Smart",                value: "smart" }
        ]
      },
      {
        type: "INFO",
        name: "info_campaigns",
        text: "Filtrování kampaní a sestav: zadejte ID oddělená čárkou. Prázdné = celý účet."
      },
      {
        type: "TEXTINPUT",
        name: "campaignsId",
        displayName: "ID kampaní (volitelné)",
        text: "ID kampaní, které chcete sledovat",
        helpText: "Oddělujte čárkou. Prázdné = všechny kampaně.",
        placeholder: ","
      },
      {
        type: "TEXTINPUT",
        name: "groupsId",
        displayName: "ID sestav (volitelné)",
        text: "ID sestav, které chcete sledovat",
        helpText: "Oddělujte čárkou. Vyžaduje vyplněná ID kampaní.",
        placeholder: ","
      },
      {
        type: "CHECKBOX",
        name: "ignoreDeleted",
        displayName: "Ignorovat smazané entity",
        text: "Vyfiltruje smazané kampaně a sestavy z výsledků (isDeleted=false)."
      },
      {
        type: "CHECKBOX",
        name: "logmode",
        displayName: "Zapnout logování",
        text: "Loguje akce konektoru do Cloud Logging (Google Cloud Console)"
      },
      {
        type: "CHECKBOX",
        name: "debugmode",
        displayName: "Zapnout rozšířené logování",
        text: "Podrobné stavy konektoru (dotazy a odpovědi z API)"
      }
    ],
    "dateRangeRequired": true
  };
  return config;
}
