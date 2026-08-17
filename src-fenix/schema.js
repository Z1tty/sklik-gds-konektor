/*
Sklik Fenix connector for Google Data Studio
Copyright (C) 2026 Seznam.cz, a.s.
Author: Josef Matoušek
*/

var Schema = function (config) {
  this.config = config;

  this.SklikDataSchema = [

    /*
    * ######################################################
    * ############### SCHEMA FOR GRANULARITY ###############
    * ######################################################
    */
    {
      name: 'daily',
      label: 'Po dnech',
      description: 'Časová granularita: denní rozpad dat (YYYYMMDD).',
      dataType: 'STRING',
      group: 'granularity',
      semantics: {
        conceptType: 'DIMENSION',
        semanticType: 'YEAR_MONTH_DAY',
        semanticGroup: 'DATETIME'
      }
    },
    {
      name: 'weekly',
      label: 'Po týdnech',
      description: 'Časová granularita: týdenní rozpad dat (YYYYWW).',
      dataType: 'STRING',
      group: 'granularity',
      semantics: {
        conceptType: 'DIMENSION',
        semanticType: 'YEAR_WEEK',
        semanticGroup: 'DATETIME'
      }
    },
    {
      name: 'monthly',
      label: 'Po měsících',
      description: 'Časová granularita: měsíční rozpad dat (YYYYMM).',
      dataType: 'STRING',
      group: 'granularity',
      semantics: {
        conceptType: 'DIMENSION',
        semanticType: 'YEAR_MONTH',
        semanticGroup: 'DATETIME'
      }
    },
    {
      name: 'quarterly',
      label: 'Po čtvrtletích',
      description: 'Časová granularita: čtvrtletní rozpad dat (YYYYQ).',
      dataType: 'STRING',
      group: 'granularity',
      semantics: {
        conceptType: 'DIMENSION',
        semanticType: 'YEAR_QUARTER',
        semanticGroup: 'DATETIME'
      }
    },
    {
      name: 'yearly',
      label: 'Po rocích',
      description: 'Časová granularita: roční rozpad dat (YYYY).',
      dataType: 'STRING',
      group: 'granularity',
      semantics: {
        conceptType: 'DIMENSION',
        semanticType: 'YEAR',
        semanticGroup: 'DATETIME'
      }
    },

    /*
    * ######################################################
    * ########## SCHEMA PRO FENIX — KAMPANĚ (cgf) ##########
    * Hybridní model: každá kampaň generuje N+1 řádků.
    * Řádek 1 (convName=''): provozní metriky + per-event součty.
    * Řádky 2–N: jeden řádek na konverzní definici s detailem konverzí.
    * ######################################################
    */
    {
      name: 'cgf_campaignId',
      label: 'Kampaň: ID',
      description: 'Unikátní ID kampaně ve Skliku.',
      dataType: 'NUMBER',
      group: 'campaigns',
      semantics: { conceptType: 'DIMENSION' }
    },
    {
      name: 'cgf_campaignName',
      label: 'Kampaň: Název',
      description: 'Název kampaně ve Skliku.',
      dataType: 'STRING',
      group: 'campaigns',
      semantics: { conceptType: 'DIMENSION' }
    },
    {
      name: 'cgf_campaignStatus',
      label: 'Kampaň: Stav',
      description: 'Stav kampaně: active = aktivní, suspend = pozastavena.',
      dataType: 'STRING',
      group: 'campaigns',
      semantics: { conceptType: 'DIMENSION' }
    },
    {
      name: 'cgf_campaignIsDeleted',
      label: 'Kampaň: Smazána',
      description: 'Zda je kampaň smazána: true = smazána, false = aktivní záznam.',
      dataType: 'STRING',
      group: 'campaigns',
      semantics: { conceptType: 'DIMENSION' }
    },
    {
      name: 'cgf_campaignType',
      label: 'Kampaň: Typ',
      description: 'Typ kampaně: combined, video, context, fulltext, product, zbozi, social, simple, audio, smart.',
      dataType: 'STRING',
      group: 'campaigns',
      semantics: { conceptType: 'DIMENSION' }
    },
    {
      name: 'cgf_semEventName',
      label: 'Kampaň: Konverze typ',
      description: 'Typ SEM eventu konverzní definice (např. Purchase, Lead, AddToCart). Prázdné na souhrnném řádku.',
      dataType: 'STRING',
      group: 'campaigns',
      semantics: { conceptType: 'DIMENSION' }
    },
    {
      name: 'cgf_convName',
      label: 'Kampaň: Konverze název',
      description: 'Název konverzní definice. Prázdné na souhrnném řádku — filtrujte na neprázdné pro detail konverzí.',
      dataType: 'STRING',
      group: 'campaigns',
      semantics: { conceptType: 'DIMENSION' }
    },
    {
      name: 'cgf_conversions',
      label: 'Kampaň: Konverze',
      description: 'Počet konverzí dané definice. Vyplněno pouze na řádcích s konkrétní konverzní definicí (convName ≠ prázdné). Na souhrnném řádku je 0 — pro celkový počet použijte součet event polí.',
      dataType: 'NUMBER',
      group: 'campaigns',
      semantics: { conceptType: 'METRIC' }
    },
    {
      name: 'cgf_conv_purchase',
      label: 'Kampaň: Event — Purchase',
      description: 'Celkový počet eventů Purchase za kampaň. Vyplněno pouze na souhrnném řádku (convName = prázdné).',
      dataType: 'NUMBER',
      group: 'campaigns',
      semantics: { conceptType: 'METRIC' }
    },
    {
      name: 'cgf_conv_lead',
      label: 'Kampaň: Event — Lead',
      description: 'Celkový počet eventů Lead za kampaň. Vyplněno pouze na souhrnném řádku.',
      dataType: 'NUMBER',
      group: 'campaigns',
      semantics: { conceptType: 'METRIC' }
    },
    {
      name: 'cgf_conv_addtocart',
      label: 'Kampaň: Event — AddToCart',
      description: 'Celkový počet eventů AddToCart za kampaň. Vyplněno pouze na souhrnném řádku.',
      dataType: 'NUMBER',
      group: 'campaigns',
      semantics: { conceptType: 'METRIC' }
    },
    {
      name: 'cgf_conv_addtowishlist',
      label: 'Kampaň: Event — AddToWishlist',
      description: 'Celkový počet eventů AddToWishlist za kampaň. Vyplněno pouze na souhrnném řádku.',
      dataType: 'NUMBER',
      group: 'campaigns',
      semantics: { conceptType: 'METRIC' }
    },
    {
      name: 'cgf_conv_viewcontent',
      label: 'Kampaň: Event — ViewContent',
      description: 'Celkový počet eventů ViewContent za kampaň. Vyplněno pouze na souhrnném řádku.',
      dataType: 'NUMBER',
      group: 'campaigns',
      semantics: { conceptType: 'METRIC' }
    },
    {
      name: 'cgf_conv_initiatecheckout',
      label: 'Kampaň: Event — InitiateCheckout',
      description: 'Celkový počet eventů InitiateCheckout za kampaň. Vyplněno pouze na souhrnném řádku.',
      dataType: 'NUMBER',
      group: 'campaigns',
      semantics: { conceptType: 'METRIC' }
    },
    {
      name: 'cgf_conv_addpaymentinfo',
      label: 'Kampaň: Event — AddPaymentInfo',
      description: 'Celkový počet eventů AddPaymentInfo za kampaň. Vyplněno pouze na souhrnném řádku.',
      dataType: 'NUMBER',
      group: 'campaigns',
      semantics: { conceptType: 'METRIC' }
    },
    {
      name: 'cgf_conv_completeregistration',
      label: 'Kampaň: Event — CompleteRegistration',
      description: 'Celkový počet eventů CompleteRegistration za kampaň. Vyplněno pouze na souhrnném řádku.',
      dataType: 'NUMBER',
      group: 'campaigns',
      semantics: { conceptType: 'METRIC' }
    },
    {
      name: 'cgf_conv_subscribe',
      label: 'Kampaň: Event — Subscribe',
      description: 'Celkový počet eventů Subscribe za kampaň. Vyplněno pouze na souhrnném řádku.',
      dataType: 'NUMBER',
      group: 'campaigns',
      semantics: { conceptType: 'METRIC' }
    },
    {
      name: 'cgf_conv_search',
      label: 'Kampaň: Event — Search',
      description: 'Celkový počet eventů Search za kampaň. Vyplněno pouze na souhrnném řádku.',
      dataType: 'NUMBER',
      group: 'campaigns',
      semantics: { conceptType: 'METRIC' }
    },
    {
      name: 'cgf_conv_contact',
      label: 'Kampaň: Event — Contact',
      description: 'Celkový počet eventů Contact za kampaň. Vyplněno pouze na souhrnném řádku.',
      dataType: 'NUMBER',
      group: 'campaigns',
      semantics: { conceptType: 'METRIC' }
    },
    {
      name: 'cgf_convval_purchase_kc',
      label: 'Kampaň: Event hodnota (Kč) — Purchase',
      description: 'Celková hodnota eventů Purchase v Kč. Vyplněno pouze na souhrnném řádku.',
      dataType: 'NUMBER',
      group: 'campaigns',
      semantics: { conceptType: 'METRIC', semanticType: 'CURRENCY_CZK', semanticGroup: 'CURRENCY' }
    },
    {
      name: 'cgf_convval_lead_kc',
      label: 'Kampaň: Event hodnota (Kč) — Lead',
      description: 'Celková hodnota eventů Lead v Kč. Vyplněno pouze na souhrnném řádku.',
      dataType: 'NUMBER',
      group: 'campaigns',
      semantics: { conceptType: 'METRIC', semanticType: 'CURRENCY_CZK', semanticGroup: 'CURRENCY' }
    },
    {
      name: 'cgf_convval_addtocart_kc',
      label: 'Kampaň: Event hodnota (Kč) — AddToCart',
      description: 'Celková hodnota eventů AddToCart v Kč. Vyplněno pouze na souhrnném řádku.',
      dataType: 'NUMBER',
      group: 'campaigns',
      semantics: { conceptType: 'METRIC', semanticType: 'CURRENCY_CZK', semanticGroup: 'CURRENCY' }
    },
    {
      name: 'cgf_convval_addtowishlist_kc',
      label: 'Kampaň: Event hodnota (Kč) — AddToWishlist',
      description: 'Celková hodnota eventů AddToWishlist v Kč. Vyplněno pouze na souhrnném řádku.',
      dataType: 'NUMBER',
      group: 'campaigns',
      semantics: { conceptType: 'METRIC', semanticType: 'CURRENCY_CZK', semanticGroup: 'CURRENCY' }
    },
    {
      name: 'cgf_convval_viewcontent_kc',
      label: 'Kampaň: Event hodnota (Kč) — ViewContent',
      description: 'Celková hodnota eventů ViewContent v Kč. Vyplněno pouze na souhrnném řádku.',
      dataType: 'NUMBER',
      group: 'campaigns',
      semantics: { conceptType: 'METRIC', semanticType: 'CURRENCY_CZK', semanticGroup: 'CURRENCY' }
    },
    {
      name: 'cgf_convval_initiatecheckout_kc',
      label: 'Kampaň: Event hodnota (Kč) — InitiateCheckout',
      description: 'Celková hodnota eventů InitiateCheckout v Kč. Vyplněno pouze na souhrnném řádku.',
      dataType: 'NUMBER',
      group: 'campaigns',
      semantics: { conceptType: 'METRIC', semanticType: 'CURRENCY_CZK', semanticGroup: 'CURRENCY' }
    },
    {
      name: 'cgf_convval_addpaymentinfo_kc',
      label: 'Kampaň: Event hodnota (Kč) — AddPaymentInfo',
      description: 'Celková hodnota eventů AddPaymentInfo v Kč. Vyplněno pouze na souhrnném řádku.',
      dataType: 'NUMBER',
      group: 'campaigns',
      semantics: { conceptType: 'METRIC', semanticType: 'CURRENCY_CZK', semanticGroup: 'CURRENCY' }
    },
    {
      name: 'cgf_convval_completeregistration_kc',
      label: 'Kampaň: Event hodnota (Kč) — CompleteRegistration',
      description: 'Celková hodnota eventů CompleteRegistration v Kč. Vyplněno pouze na souhrnném řádku.',
      dataType: 'NUMBER',
      group: 'campaigns',
      semantics: { conceptType: 'METRIC', semanticType: 'CURRENCY_CZK', semanticGroup: 'CURRENCY' }
    },
    {
      name: 'cgf_convval_subscribe_kc',
      label: 'Kampaň: Event hodnota (Kč) — Subscribe',
      description: 'Celková hodnota eventů Subscribe v Kč. Vyplněno pouze na souhrnném řádku.',
      dataType: 'NUMBER',
      group: 'campaigns',
      semantics: { conceptType: 'METRIC', semanticType: 'CURRENCY_CZK', semanticGroup: 'CURRENCY' }
    },
    {
      name: 'cgf_convval_search_kc',
      label: 'Kampaň: Event hodnota (Kč) — Search',
      description: 'Celková hodnota eventů Search v Kč. Vyplněno pouze na souhrnném řádku.',
      dataType: 'NUMBER',
      group: 'campaigns',
      semantics: { conceptType: 'METRIC', semanticType: 'CURRENCY_CZK', semanticGroup: 'CURRENCY' }
    },
    {
      name: 'cgf_convval_contact_kc',
      label: 'Kampaň: Event hodnota (Kč) — Contact',
      description: 'Celková hodnota eventů Contact v Kč. Vyplněno pouze na souhrnném řádku.',
      dataType: 'NUMBER',
      group: 'campaigns',
      semantics: { conceptType: 'METRIC', semanticType: 'CURRENCY_CZK', semanticGroup: 'CURRENCY' }
    },
    {
      name: 'cgf_conversionValue_kc',
      label: 'Kampaň: Hodnota konverzí (Kč)',
      description: 'Hodnota konverzí konkrétní definice v Kč. Vyplněno pouze na řádcích s konverzní definicí (convName ≠ prázdné).',
      dataType: 'NUMBER',
      group: 'campaigns',
      semantics: { conceptType: 'METRIC', semanticType: 'CURRENCY_CZK', semanticGroup: 'CURRENCY' }
    },
    {
      name: 'cgf_conversionPrice_kc',
      label: 'Kampaň: Cena konverze (Kč)',
      description: 'Průměrná cena za jednu konverzi = celková cena / počet konverzí (Kč). Vyplněno pouze na souhrnném řádku.',
      dataType: 'NUMBER',
      group: 'campaigns',
      semantics: { conceptType: 'METRIC', semanticType: 'CURRENCY_CZK', semanticGroup: 'CURRENCY', defaultAggregationType: 'NO_AGGREGATION' }
    },
    {
      name: 'cgf_conversionRatio',
      label: 'Kampaň: Konverzní poměr',
      description: 'Podíl konverzí na proklikech = konverze / prokliky (%). Vyplněno pouze na souhrnném řádku.',
      dataType: 'NUMBER',
      group: 'campaigns',
      semantics: { conceptType: 'METRIC', semanticType: 'PERCENT', defaultAggregationType: 'AVG' }
    },
    {
      name: 'cgf_pno',
      label: 'Kampaň: PNO (náklady/hodnota)',
      description: 'Podíl nákladů na obratu = celková cena / hodnota konverzí (%). Vyplněno pouze na souhrnném řádku.',
      dataType: 'NUMBER',
      group: 'campaigns',
      semantics: { conceptType: 'METRIC', semanticType: 'PERCENT', defaultAggregationType: 'AVG' }
    },
    {
      name: 'cgf_impressions',
      label: 'Kampaň: Zobrazení',
      description: 'Počet zobrazení reklam kampaně za zvolené období. Vyplněno pouze na souhrnném řádku (cgf_convName = prázdné).',
      dataType: 'NUMBER',
      group: 'campaigns',
      semantics: { conceptType: 'METRIC' }
    },
    {
      name: 'cgf_clicks',
      label: 'Kampaň: Prokliky',
      description: 'Počet prokliků reklam kampaně za zvolené období. Vyplněno pouze na souhrnném řádku (cgf_convName = prázdné).',
      dataType: 'NUMBER',
      group: 'campaigns',
      semantics: { conceptType: 'METRIC' }
    },
    {
      name: 'cgf_ctr',
      label: 'Kampaň: CTR',
      description: 'Míra prokliku = prokliky / zobrazení (%). Vyplněno pouze na souhrnném řádku.',
      dataType: 'NUMBER',
      group: 'campaigns',
      semantics: { conceptType: 'METRIC', semanticType: 'PERCENT', defaultAggregationType: 'AVG' }
    },
    {
      name: 'cgf_totalMoney_kc',
      label: 'Kampaň: Celková cena (Kč)',
      description: 'Celkové náklady kampaně za zvolené období v Kč. Vyplněno pouze na souhrnném řádku (cgf_convName = prázdné).',
      dataType: 'NUMBER',
      group: 'campaigns',
      semantics: { conceptType: 'METRIC', semanticType: 'CURRENCY_CZK', semanticGroup: 'CURRENCY' }
    },
    {
      name: 'cgf_avgCpc_kc',
      label: 'Kampaň: Průměrná CPC (Kč)',
      description: 'Průměrná cena za proklik v Kč. Vyplněno pouze na souhrnném řádku.',
      dataType: 'NUMBER',
      group: 'campaigns',
      semantics: { conceptType: 'METRIC', semanticType: 'CURRENCY_CZK', semanticGroup: 'CURRENCY', defaultAggregationType: 'AVG' }
    },
    {
      name: 'cgf_avgPosition',
      label: 'Kampaň: Průměrná pozice',
      description: 'Průměrná pozice reklamy ve výsledcích vyhledávání. Vyplněno pouze na souhrnném řádku.',
      dataType: 'NUMBER',
      group: 'campaigns',
      semantics: { conceptType: 'METRIC', defaultAggregationType: 'AVG' }
    },
    {
      name: 'cgf_impressionMoney_kc',
      label: 'Kampaň: Náklady za zobrazení (Kč)',
      description: 'Celkové náklady za zobrazení (CPT/CPM model) v Kč. Vyplněno pouze na souhrnném řádku.',
      dataType: 'NUMBER',
      group: 'campaigns',
      semantics: { conceptType: 'METRIC', semanticType: 'CURRENCY_CZK', semanticGroup: 'CURRENCY' }
    },
    {
      name: 'cgf_avgCpt_kc',
      label: 'Kampaň: Průměrná CPT (Kč)',
      description: 'Průměrná cena za tisíc zobrazení (CPT) v Kč. Vyplněno pouze na souhrnném řádku.',
      dataType: 'NUMBER',
      group: 'campaigns',
      semantics: { conceptType: 'METRIC', semanticType: 'CURRENCY_CZK', semanticGroup: 'CURRENCY', defaultAggregationType: 'AVG' }
    },
    {
      name: 'cgf_clickMoney_kc',
      label: 'Kampaň: Náklady prokliků (Kč)',
      description: 'Celkové náklady za prokliky v Kč. Vyplněno pouze na souhrnném řádku.',
      dataType: 'NUMBER',
      group: 'campaigns',
      semantics: { conceptType: 'METRIC', semanticType: 'CURRENCY_CZK', semanticGroup: 'CURRENCY' }
    },
    {
      name: 'cgf_impressionShare',
      label: 'Kampaň: Podíl zobrazení',
      description: 'Podíl získaných zobrazení z celkově dostupných (0–1). Vyplněno pouze na souhrnném řádku.',
      dataType: 'NUMBER',
      group: 'campaigns',
      semantics: { conceptType: 'METRIC', semanticType: 'PERCENT', defaultAggregationType: 'AVG' }
    },
    {
      name: 'cgf_missedPrice_kc',
      label: 'Kampaň: Promarněné náklady (Kč)',
      description: 'Odhadované náklady, které by kampaň utratila, kdyby neztrácela zobrazení kvůli nízkým nabídkám. Vyplněno pouze na souhrnném řádku.',
      dataType: 'NUMBER',
      group: 'campaigns',
      semantics: { conceptType: 'METRIC', semanticType: 'CURRENCY_CZK', semanticGroup: 'CURRENCY' }
    },
    {
      name: 'cgf_exhaustedBudgetCount',
      label: 'Kampaň: Dnů s vyčerpaným rozpočtem',
      description: 'Počet dnů, kdy byl denní rozpočet zcela vyčerpán. Vyplněno pouze na souhrnném řádku.',
      dataType: 'NUMBER',
      group: 'campaigns',
      semantics: { conceptType: 'METRIC' }
    },
    {
      name: 'cgf_exhaustedBudgetShare',
      label: 'Kampaň: Podíl dnů s vyčerpaným rozpočtem',
      description: 'Podíl dnů, kdy byl denní rozpočet zcela vyčerpán (0–1). Vyplněno pouze na souhrnném řádku.',
      dataType: 'NUMBER',
      group: 'campaigns',
      semantics: { conceptType: 'METRIC', semanticType: 'PERCENT', defaultAggregationType: 'AVG' }
    },
    {
      name: 'cgf_stoppedByScheduleCount',
      label: 'Kampaň: Dnů zastavených plánovačem',
      description: 'Počet dnů, kdy byla kampaň zastavena časovým plánem. Vyplněno pouze na souhrnném řádku.',
      dataType: 'NUMBER',
      group: 'campaigns',
      semantics: { conceptType: 'METRIC' }
    },
    {
      name: 'cgf_stoppedByScheduleShare',
      label: 'Kampaň: Podíl dnů zastavených plánovačem',
      description: 'Podíl dnů, kdy byla kampaň zastavena časovým plánem (0–1). Vyplněno pouze na souhrnném řádku.',
      dataType: 'NUMBER',
      group: 'campaigns',
      semantics: { conceptType: 'METRIC', semanticType: 'PERCENT', defaultAggregationType: 'AVG' }
    },
    {
      name: 'cgf_underForestThresholdCount',
      label: 'Kampaň: Dnů pod prahem viditelnosti',
      description: 'Počet dnů, kdy byla kampaň pod prahem viditelnosti („forest threshold"). Vyplněno pouze na souhrnném řádku.',
      dataType: 'NUMBER',
      group: 'campaigns',
      semantics: { conceptType: 'METRIC' }
    },
    {
      name: 'cgf_underForestThresholdShare',
      label: 'Kampaň: Podíl dnů pod prahem viditelnosti',
      description: 'Podíl dnů, kdy byla kampaň pod prahem viditelnosti (0–1). Vyplněno pouze na souhrnném řádku.',
      dataType: 'NUMBER',
      group: 'campaigns',
      semantics: { conceptType: 'METRIC', semanticType: 'PERCENT', defaultAggregationType: 'AVG' }
    },
    {
      name: 'cgf_totalBudget_kc',
      label: 'Kampaň: Celkový rozpočet (Kč)',
      description: 'Celkový nastavený rozpočet kampaně v Kč (může být neomezený = 0).',
      dataType: 'NUMBER',
      group: 'campaigns',
      semantics: { conceptType: 'METRIC', semanticType: 'CURRENCY_CZK', semanticGroup: 'CURRENCY' }
    },
    {
      name: 'cgf_exhaustedTotalBudget_kc',
      label: 'Kampaň: Vyčerpaný celkový rozpočet (Kč)',
      description: 'Kolik z celkového rozpočtu už kampaň utratila (Kč).',
      dataType: 'NUMBER',
      group: 'campaigns',
      semantics: { conceptType: 'METRIC', semanticType: 'CURRENCY_CZK', semanticGroup: 'CURRENCY' }
    },
    {
      name: 'cgf_totalClicks',
      label: 'Kampaň: Limit celkových prokliků',
      description: 'Nastavený limit celkových prokliků pro kampaň (0 = neomezeno).',
      dataType: 'NUMBER',
      group: 'campaigns',
      semantics: { conceptType: 'METRIC' }
    },
    {
      name: 'cgf_actualClicks',
      label: 'Kampaň: Čerpané prokliky z limitu',
      description: 'Kolik prokliků už kampaň spotřebovala z limitu totalClicks.',
      dataType: 'NUMBER',
      group: 'campaigns',
      semantics: { conceptType: 'METRIC' }
    },
    {
      name: 'cgf_startDate',
      label: 'Kampaň: Datum spuštění',
      description: 'Nastavené datum spuštění kampaně (YYYY-MM-DD).',
      dataType: 'STRING',
      group: 'campaigns',
      semantics: { conceptType: 'DIMENSION', semanticType: 'YEAR_MONTH_DAY', semanticGroup: 'DATETIME' }
    },
    {
      name: 'cgf_endDate',
      label: 'Kampaň: Datum ukončení',
      description: 'Nastavené datum ukončení kampaně (YYYY-MM-DD).',
      dataType: 'STRING',
      group: 'campaigns',
      semantics: { conceptType: 'DIMENSION', semanticType: 'YEAR_MONTH_DAY', semanticGroup: 'DATETIME' }
    },
    {
      name: 'cgf_createDate',
      label: 'Kampaň: Datum vytvoření',
      description: 'Datum vytvoření kampaně (YYYY-MM-DD).',
      dataType: 'STRING',
      group: 'campaigns',
      semantics: { conceptType: 'DIMENSION', semanticType: 'YEAR_MONTH_DAY', semanticGroup: 'DATETIME' }
    },
    {
      name: 'cgf_deleteDate',
      label: 'Kampaň: Datum smazání',
      description: 'Datum smazání kampaně (YYYY-MM-DD). Prázdné pokud není smazána.',
      dataType: 'STRING',
      group: 'campaigns',
      semantics: { conceptType: 'DIMENSION', semanticType: 'YEAR_MONTH_DAY', semanticGroup: 'DATETIME' }
    },
    {
      name: 'cgf_paymentMethod',
      label: 'Kampaň: Způsob zpoplatnění',
      description: 'Model účtování: cpc = za proklik, cpm = za tisíc zobrazení, exclusive = exkluzivní.',
      dataType: 'STRING',
      group: 'campaigns',
      semantics: { conceptType: 'DIMENSION' }
    },
    {
      name: 'cgf_adSelection',
      label: 'Kampaň: Střídání inzerátů',
      description: 'Strategie výběru inzerátu: weighted, random, cpa, cos.',
      dataType: 'STRING',
      group: 'campaigns',
      semantics: { conceptType: 'DIMENSION' }
    },
    {
      name: 'cgf_scheduleEnabled',
      label: 'Kampaň: Časové plánování zapnuté',
      description: 'Zda je zapnutý časový plán zobrazování: true/false.',
      dataType: 'STRING',
      group: 'campaigns',
      semantics: { conceptType: 'DIMENSION' }
    },
    {
      name: 'cgf_videoFormat',
      label: 'Kampaň: Formát videa',
      description: 'Formát videa u videokampaně: instream, outstream, both.',
      dataType: 'STRING',
      group: 'campaigns',
      semantics: { conceptType: 'DIMENSION' }
    },
    {
      name: 'cgf_maxPno',
      label: 'Kampaň: Cíl max PNO (%)',
      description: 'Nastavený cíl maximálního PNO (podíl nákladů na obratu) v procentech.',
      dataType: 'NUMBER',
      group: 'campaigns',
      semantics: { conceptType: 'METRIC', defaultAggregationType: 'AVG' }
    },
    {
      name: 'cgf_defaultBudgetId',
      label: 'Kampaň: ID výchozího rozpočtu',
      description: 'ID výchozího rozpočtu přiřazeného kampani.',
      dataType: 'NUMBER',
      group: 'campaigns',
      semantics: { conceptType: 'DIMENSION' }
    },
    {
      name: 'cgf_skips',
      label: 'Kampaň: Video přeskočení',
      description: 'Celkový počet přeskočení videoinzerátů. Vyplněno pouze na souhrnném řádku.',
      dataType: 'NUMBER',
      group: 'campaigns',
      semantics: { conceptType: 'METRIC' }
    },
    {
      name: 'cgf_views',
      label: 'Kampaň: Video zhlédnutí',
      description: 'Celkový počet zhlédnutí videoinzerátů. Vyplněno pouze na souhrnném řádku.',
      dataType: 'NUMBER',
      group: 'campaigns',
      semantics: { conceptType: 'METRIC' }
    },
    {
      name: 'cgf_engagement',
      label: 'Kampaň: Video interakce',
      description: 'Celkový počet interakcí (engagement) s videoinzeráty. Vyplněno pouze na souhrnném řádku.',
      dataType: 'NUMBER',
      group: 'campaigns',
      semantics: { conceptType: 'METRIC' }
    },
    {
      name: 'cgf_watchTime_sec',
      label: 'Kampaň: Video čas zhlédnutí (s)',
      description: 'Celkový čas zhlédnutí videí v sekundách. Vyplněno pouze na souhrnném řádku.',
      dataType: 'NUMBER',
      group: 'campaigns',
      semantics: { conceptType: 'METRIC', semanticType: 'DURATION' }
    },
    {
      name: 'cgf_viewRate',
      label: 'Kampaň: Video view rate',
      description: 'Podíl zhlédnutí na zobrazení = views / impressions. Vyplněno pouze na souhrnném řádku.',
      dataType: 'NUMBER',
      group: 'campaigns',
      semantics: { conceptType: 'METRIC', semanticType: 'PERCENT', defaultAggregationType: 'AVG' }
    },
    {
      name: 'cgf_skipRate',
      label: 'Kampaň: Video skip rate',
      description: 'Podíl přeskočení na zobrazení = skips / impressions. Vyplněno pouze na souhrnném řádku.',
      dataType: 'NUMBER',
      group: 'campaigns',
      semantics: { conceptType: 'METRIC', semanticType: 'PERCENT', defaultAggregationType: 'AVG' }
    },
    {
      name: 'cgf_avgWatchTime_sec',
      label: 'Kampaň: Video průměrný čas zhlédnutí (s)',
      description: 'Průměrný čas zhlédnutí jednoho videa v sekundách. Vyplněno pouze na souhrnném řádku.',
      dataType: 'NUMBER',
      group: 'campaigns',
      semantics: { conceptType: 'METRIC', semanticType: 'DURATION', defaultAggregationType: 'AVG' }
    },
    {
      name: 'cgf_avgCostPerView_kc',
      label: 'Kampaň: Video průměrná cena za zhlédnutí (Kč)',
      description: 'Průměrná cena za jedno video zhlédnutí (CPV) v Kč. Vyplněno pouze na souhrnném řádku.',
      dataType: 'NUMBER',
      group: 'campaigns',
      semantics: { conceptType: 'METRIC', semanticType: 'CURRENCY_CZK', semanticGroup: 'CURRENCY', defaultAggregationType: 'AVG' }
    },
    {
      name: 'cgf_viewership_q1',
      label: 'Kampaň: Video 25 % zhlédnuto',
      description: 'Kolikrát bylo video zhlédnuto do 25 %. Vyplněno pouze na souhrnném řádku.',
      dataType: 'NUMBER',
      group: 'campaigns',
      semantics: { conceptType: 'METRIC' }
    },
    {
      name: 'cgf_viewership_q2',
      label: 'Kampaň: Video 50 % zhlédnuto',
      description: 'Kolikrát bylo video zhlédnuto do 50 %. Vyplněno pouze na souhrnném řádku.',
      dataType: 'NUMBER',
      group: 'campaigns',
      semantics: { conceptType: 'METRIC' }
    },
    {
      name: 'cgf_viewership_q3',
      label: 'Kampaň: Video 75 % zhlédnuto',
      description: 'Kolikrát bylo video zhlédnuto do 75 %. Vyplněno pouze na souhrnném řádku.',
      dataType: 'NUMBER',
      group: 'campaigns',
      semantics: { conceptType: 'METRIC' }
    },
    {
      name: 'cgf_viewership_complete',
      label: 'Kampaň: Video 100 % zhlédnuto',
      description: 'Kolikrát bylo video zhlédnuto do 100 %. Vyplněno pouze na souhrnném řádku.',
      dataType: 'NUMBER',
      group: 'campaigns',
      semantics: { conceptType: 'METRIC' }
    },
    {
      name: 'cgf_viewershipRate_q1',
      label: 'Kampaň: Video podíl 25 % zhlédnutí',
      description: 'Podíl zhlédnutí, která dosáhla hranice 25 % (0–1). Vyplněno pouze na souhrnném řádku.',
      dataType: 'NUMBER',
      group: 'campaigns',
      semantics: { conceptType: 'METRIC', semanticType: 'PERCENT', defaultAggregationType: 'AVG' }
    },
    {
      name: 'cgf_viewershipRate_q2',
      label: 'Kampaň: Video podíl 50 % zhlédnutí',
      description: 'Podíl zhlédnutí, která dosáhla hranice 50 % (0–1). Vyplněno pouze na souhrnném řádku.',
      dataType: 'NUMBER',
      group: 'campaigns',
      semantics: { conceptType: 'METRIC', semanticType: 'PERCENT', defaultAggregationType: 'AVG' }
    },
    {
      name: 'cgf_viewershipRate_q3',
      label: 'Kampaň: Video podíl 75 % zhlédnutí',
      description: 'Podíl zhlédnutí, která dosáhla hranice 75 % (0–1). Vyplněno pouze na souhrnném řádku.',
      dataType: 'NUMBER',
      group: 'campaigns',
      semantics: { conceptType: 'METRIC', semanticType: 'PERCENT', defaultAggregationType: 'AVG' }
    },
    {
      name: 'cgf_viewershipRate_complete',
      label: 'Kampaň: Video podíl 100 % zhlédnutí',
      description: 'Podíl zhlédnutí, která dosáhla hranice 100 % (0–1). Vyplněno pouze na souhrnném řádku.',
      dataType: 'NUMBER',
      group: 'campaigns',
      semantics: { conceptType: 'METRIC', semanticType: 'PERCENT', defaultAggregationType: 'AVG' }
    },
    { name: 'cgf_ft_impressions',    label: 'Kampaň: Fulltext zobrazení',       description: 'Zobrazení ve fulltextové síti. Vyplněno pouze na souhrnném řádku.', dataType: 'NUMBER', group: 'campaigns', semantics: { conceptType: 'METRIC' } },
    { name: 'cgf_ft_clicks',         label: 'Kampaň: Fulltext prokliky',         description: 'Prokliky ve fulltextové síti. Vyplněno pouze na souhrnném řádku.', dataType: 'NUMBER', group: 'campaigns', semantics: { conceptType: 'METRIC' } },
    { name: 'cgf_ft_totalMoney_kc',  label: 'Kampaň: Fulltext cena (Kč)',        description: 'Celková cena ve fulltextové síti v Kč. Vyplněno pouze na souhrnném řádku.', dataType: 'NUMBER', group: 'campaigns', semantics: { conceptType: 'METRIC', semanticType: 'CURRENCY_CZK', semanticGroup: 'CURRENCY' } },
    { name: 'cgf_ft_avgPosition',    label: 'Kampaň: Fulltext průměrná pozice',  description: 'Průměrná pozice ve fulltextové síti. Vyplněno pouze na souhrnném řádku.', dataType: 'NUMBER', group: 'campaigns', semantics: { conceptType: 'METRIC', defaultAggregationType: 'AVG' } },
    { name: 'cgf_ctx_impressions',   label: 'Kampaň: Obsahová zobrazení',        description: 'Zobrazení v obsahové síti. Vyplněno pouze na souhrnném řádku.', dataType: 'NUMBER', group: 'campaigns', semantics: { conceptType: 'METRIC' } },
    { name: 'cgf_ctx_clicks',        label: 'Kampaň: Obsahová prokliky',         description: 'Prokliky v obsahové síti. Vyplněno pouze na souhrnném řádku.', dataType: 'NUMBER', group: 'campaigns', semantics: { conceptType: 'METRIC' } },
    { name: 'cgf_ctx_totalMoney_kc', label: 'Kampaň: Obsahová cena (Kč)',        description: 'Celková cena v obsahové síti v Kč. Vyplněno pouze na souhrnném řádku.', dataType: 'NUMBER', group: 'campaigns', semantics: { conceptType: 'METRIC', semanticType: 'CURRENCY_CZK', semanticGroup: 'CURRENCY' } },
    { name: 'cgf_ctx_avgPosition',   label: 'Kampaň: Obsahová průměrná pozice',  description: 'Průměrná pozice v obsahové síti. Vyplněno pouze na souhrnném řádku.', dataType: 'NUMBER', group: 'campaigns', semantics: { conceptType: 'METRIC', defaultAggregationType: 'AVG' } },
    { name: 'cgf_vid_impressions',   label: 'Kampaň: Video zobrazení',           description: 'Zobrazení ve video síti. Vyplněno pouze na souhrnném řádku.', dataType: 'NUMBER', group: 'campaigns', semantics: { conceptType: 'METRIC' } },
    { name: 'cgf_vid_clicks',        label: 'Kampaň: Video prokliky',            description: 'Prokliky ve video síti. Vyplněno pouze na souhrnném řádku.', dataType: 'NUMBER', group: 'campaigns', semantics: { conceptType: 'METRIC' } },
    { name: 'cgf_vid_totalMoney_kc', label: 'Kampaň: Video cena (Kč)',           description: 'Celková cena ve video síti v Kč. Vyplněno pouze na souhrnném řádku.', dataType: 'NUMBER', group: 'campaigns', semantics: { conceptType: 'METRIC', semanticType: 'CURRENCY_CZK', semanticGroup: 'CURRENCY' } },
    { name: 'cgf_vid_avgPosition',   label: 'Kampaň: Video průměrná pozice',     description: 'Průměrná pozice ve video síti. Vyplněno pouze na souhrnném řádku.', dataType: 'NUMBER', group: 'campaigns', semantics: { conceptType: 'METRIC', defaultAggregationType: 'AVG' } },

    /*
    * ######################################################
    * ########## SCHEMA PRO FENIX — SESTAVY (gof) ##########
    * Stejný hybridní model jako kampaně.
    * ######################################################
    */
    {
      name: 'gof_campaignId',
      label: 'Sestava: ID kampaně',
      description: 'ID nadřazené kampaně sestavy ve Skliku.',
      dataType: 'NUMBER',
      group: 'groups',
      semantics: { conceptType: 'DIMENSION' }
    },
    {
      name: 'gof_groupId',
      label: 'Sestava: ID sestavy',
      description: 'Unikátní ID sestavy ve Skliku.',
      dataType: 'NUMBER',
      group: 'groups',
      semantics: { conceptType: 'DIMENSION' }
    },
    {
      name: 'gof_groupName',
      label: 'Sestava: Název',
      description: 'Název sestavy ve Skliku.',
      dataType: 'STRING',
      group: 'groups',
      semantics: { conceptType: 'DIMENSION' }
    },
    {
      name: 'gof_groupStatus',
      label: 'Sestava: Stav',
      description: 'Stav sestavy: active = aktivní, suspend = pozastavena.',
      dataType: 'STRING',
      group: 'groups',
      semantics: { conceptType: 'DIMENSION' }
    },
    {
      name: 'gof_groupIsDeleted',
      label: 'Sestava: Smazána',
      description: 'Zda je sestava smazána: true = smazána, false = aktivní záznam.',
      dataType: 'STRING',
      group: 'groups',
      semantics: { conceptType: 'DIMENSION' }
    },
    {
      name: 'gof_impressionShare',
      label: 'Sestava: Podíl zobrazení (IS)',
      description: 'Podíl získaných zobrazení z celkového počtu způsobilých zobrazení (impression share). 0–1.',
      dataType: 'NUMBER',
      group: 'groups',
      semantics: { conceptType: 'METRIC', semanticType: 'PERCENT', defaultAggregationType: 'AVG' }
    },
    {
      name: 'gof_winRate',
      label: 'Sestava: Win rate',
      description: 'Podíl aukcí vyhraných sestavou z celkového počtu aukcí, ve kterých se zúčastnila. 0–1.',
      dataType: 'NUMBER',
      group: 'groups',
      semantics: { conceptType: 'METRIC', semanticType: 'PERCENT', defaultAggregationType: 'AVG' }
    },
    {
      name: 'gof_missedPrice_kc',
      label: 'Sestava: Promarněné náklady (Kč)',
      description: 'Odhadované náklady, které by sestava utratila, kdyby neztrácela zobrazení kvůli nízkým nabídkám.',
      dataType: 'NUMBER',
      group: 'groups',
      semantics: { conceptType: 'METRIC', semanticType: 'CURRENCY_CZK', semanticGroup: 'CURRENCY' }
    },
    {
      name: 'gof_exhaustedBudgetCount',
      label: 'Sestava: Počet vyčerpání rozpočtu',
      description: 'Počet dní/period, kdy byl rozpočet sestavy vyčerpán.',
      dataType: 'NUMBER',
      group: 'groups',
      semantics: { conceptType: 'METRIC' }
    },
    {
      name: 'gof_exhaustedBudgetShare',
      label: 'Sestava: Podíl vyčerpání rozpočtu',
      description: 'Podíl dní/period, kdy byl rozpočet sestavy vyčerpán. 0–1.',
      dataType: 'NUMBER',
      group: 'groups',
      semantics: { conceptType: 'METRIC', semanticType: 'PERCENT', defaultAggregationType: 'AVG' }
    },
    {
      name: 'gof_stoppedByScheduleCount',
      label: 'Sestava: Počet zastavení harmonogramem',
      description: 'Počet dní/period, kdy byla sestava zastavena časovým harmonogramem.',
      dataType: 'NUMBER',
      group: 'groups',
      semantics: { conceptType: 'METRIC' }
    },
    {
      name: 'gof_stoppedByScheduleShare',
      label: 'Sestava: Podíl zastavení harmonogramem',
      description: 'Podíl dní/period, kdy byla sestava zastavena časovým harmonogramem. 0–1.',
      dataType: 'NUMBER',
      group: 'groups',
      semantics: { conceptType: 'METRIC', semanticType: 'PERCENT', defaultAggregationType: 'AVG' }
    },
    {
      name: 'gof_underForestThresholdCount',
      label: 'Sestava: Počet pod prahem aukce',
      description: 'Počet dní/period, kdy sestava nedosáhla minimální nabídky pro vstup do aukce.',
      dataType: 'NUMBER',
      group: 'groups',
      semantics: { conceptType: 'METRIC' }
    },
    {
      name: 'gof_underForestThresholdShare',
      label: 'Sestava: Podíl pod prahem aukce',
      description: 'Podíl dní/period, kdy sestava nedosáhla minimální nabídky pro vstup do aukce. 0–1.',
      dataType: 'NUMBER',
      group: 'groups',
      semantics: { conceptType: 'METRIC', semanticType: 'PERCENT', defaultAggregationType: 'AVG' }
    },
    {
      name: 'gof_semEventName',
      label: 'Sestava: Konverze typ',
      description: 'Typ SEM eventu konverzní definice (např. Purchase, Lead, AddToCart). Prázdné na souhrnném řádku.',
      dataType: 'STRING',
      group: 'groups',
      semantics: { conceptType: 'DIMENSION' }
    },
    {
      name: 'gof_convName',
      label: 'Sestava: Konverze název',
      description: 'Název konverzní definice. Prázdné na souhrnném řádku — filtrujte na neprázdné pro detail konverzí.',
      dataType: 'STRING',
      group: 'groups',
      semantics: { conceptType: 'DIMENSION' }
    },
    {
      name: 'gof_conversions',
      label: 'Sestava: Konverze',
      description: 'Počet konverzí dané definice. Vyplněno pouze na řádcích s konverzní definicí (convName ≠ prázdné).',
      dataType: 'NUMBER',
      group: 'groups',
      semantics: { conceptType: 'METRIC' }
    },
    {
      name: 'gof_conv_purchase',
      label: 'Sestava: Event — Purchase',
      description: 'Celkový počet eventů Purchase za sestavu. Vyplněno pouze na souhrnném řádku.',
      dataType: 'NUMBER',
      group: 'groups',
      semantics: { conceptType: 'METRIC' }
    },
    {
      name: 'gof_conv_lead',
      label: 'Sestava: Event — Lead',
      description: 'Celkový počet eventů Lead za sestavu. Vyplněno pouze na souhrnném řádku.',
      dataType: 'NUMBER',
      group: 'groups',
      semantics: { conceptType: 'METRIC' }
    },
    {
      name: 'gof_conv_addtocart',
      label: 'Sestava: Event — AddToCart',
      description: 'Celkový počet eventů AddToCart za sestavu. Vyplněno pouze na souhrnném řádku.',
      dataType: 'NUMBER',
      group: 'groups',
      semantics: { conceptType: 'METRIC' }
    },
    {
      name: 'gof_conv_addtowishlist',
      label: 'Sestava: Event — AddToWishlist',
      description: 'Celkový počet eventů AddToWishlist za sestavu. Vyplněno pouze na souhrnném řádku.',
      dataType: 'NUMBER',
      group: 'groups',
      semantics: { conceptType: 'METRIC' }
    },
    {
      name: 'gof_conv_viewcontent',
      label: 'Sestava: Event — ViewContent',
      description: 'Celkový počet eventů ViewContent za sestavu. Vyplněno pouze na souhrnném řádku.',
      dataType: 'NUMBER',
      group: 'groups',
      semantics: { conceptType: 'METRIC' }
    },
    {
      name: 'gof_conv_initiatecheckout',
      label: 'Sestava: Event — InitiateCheckout',
      description: 'Celkový počet eventů InitiateCheckout za sestavu. Vyplněno pouze na souhrnném řádku.',
      dataType: 'NUMBER',
      group: 'groups',
      semantics: { conceptType: 'METRIC' }
    },
    {
      name: 'gof_conv_addpaymentinfo',
      label: 'Sestava: Event — AddPaymentInfo',
      description: 'Celkový počet eventů AddPaymentInfo za sestavu. Vyplněno pouze na souhrnném řádku.',
      dataType: 'NUMBER',
      group: 'groups',
      semantics: { conceptType: 'METRIC' }
    },
    {
      name: 'gof_conv_completeregistration',
      label: 'Sestava: Event — CompleteRegistration',
      description: 'Celkový počet eventů CompleteRegistration za sestavu. Vyplněno pouze na souhrnném řádku.',
      dataType: 'NUMBER',
      group: 'groups',
      semantics: { conceptType: 'METRIC' }
    },
    {
      name: 'gof_conv_subscribe',
      label: 'Sestava: Event — Subscribe',
      description: 'Celkový počet eventů Subscribe za sestavu. Vyplněno pouze na souhrnném řádku.',
      dataType: 'NUMBER',
      group: 'groups',
      semantics: { conceptType: 'METRIC' }
    },
    {
      name: 'gof_conv_search',
      label: 'Sestava: Event — Search',
      description: 'Celkový počet eventů Search za sestavu. Vyplněno pouze na souhrnném řádku.',
      dataType: 'NUMBER',
      group: 'groups',
      semantics: { conceptType: 'METRIC' }
    },
    {
      name: 'gof_conv_contact',
      label: 'Sestava: Event — Contact',
      description: 'Celkový počet eventů Contact za sestavu. Vyplněno pouze na souhrnném řádku.',
      dataType: 'NUMBER',
      group: 'groups',
      semantics: { conceptType: 'METRIC' }
    },
    {
      name: 'gof_convval_purchase_kc',
      label: 'Sestava: Event hodnota (Kč) — Purchase',
      description: 'Celková hodnota eventů Purchase v Kč. Vyplněno pouze na souhrnném řádku.',
      dataType: 'NUMBER',
      group: 'groups',
      semantics: { conceptType: 'METRIC', semanticType: 'CURRENCY_CZK', semanticGroup: 'CURRENCY' }
    },
    {
      name: 'gof_convval_lead_kc',
      label: 'Sestava: Event hodnota (Kč) — Lead',
      description: 'Celková hodnota eventů Lead v Kč. Vyplněno pouze na souhrnném řádku.',
      dataType: 'NUMBER',
      group: 'groups',
      semantics: { conceptType: 'METRIC', semanticType: 'CURRENCY_CZK', semanticGroup: 'CURRENCY' }
    },
    {
      name: 'gof_convval_addtocart_kc',
      label: 'Sestava: Event hodnota (Kč) — AddToCart',
      description: 'Celková hodnota eventů AddToCart v Kč. Vyplněno pouze na souhrnném řádku.',
      dataType: 'NUMBER',
      group: 'groups',
      semantics: { conceptType: 'METRIC', semanticType: 'CURRENCY_CZK', semanticGroup: 'CURRENCY' }
    },
    {
      name: 'gof_convval_addtowishlist_kc',
      label: 'Sestava: Event hodnota (Kč) — AddToWishlist',
      description: 'Celková hodnota eventů AddToWishlist v Kč. Vyplněno pouze na souhrnném řádku.',
      dataType: 'NUMBER',
      group: 'groups',
      semantics: { conceptType: 'METRIC', semanticType: 'CURRENCY_CZK', semanticGroup: 'CURRENCY' }
    },
    {
      name: 'gof_convval_viewcontent_kc',
      label: 'Sestava: Event hodnota (Kč) — ViewContent',
      description: 'Celková hodnota eventů ViewContent v Kč. Vyplněno pouze na souhrnném řádku.',
      dataType: 'NUMBER',
      group: 'groups',
      semantics: { conceptType: 'METRIC', semanticType: 'CURRENCY_CZK', semanticGroup: 'CURRENCY' }
    },
    {
      name: 'gof_convval_initiatecheckout_kc',
      label: 'Sestava: Event hodnota (Kč) — InitiateCheckout',
      description: 'Celková hodnota eventů InitiateCheckout v Kč. Vyplněno pouze na souhrnném řádku.',
      dataType: 'NUMBER',
      group: 'groups',
      semantics: { conceptType: 'METRIC', semanticType: 'CURRENCY_CZK', semanticGroup: 'CURRENCY' }
    },
    {
      name: 'gof_convval_addpaymentinfo_kc',
      label: 'Sestava: Event hodnota (Kč) — AddPaymentInfo',
      description: 'Celková hodnota eventů AddPaymentInfo v Kč. Vyplněno pouze na souhrnném řádku.',
      dataType: 'NUMBER',
      group: 'groups',
      semantics: { conceptType: 'METRIC', semanticType: 'CURRENCY_CZK', semanticGroup: 'CURRENCY' }
    },
    {
      name: 'gof_convval_completeregistration_kc',
      label: 'Sestava: Event hodnota (Kč) — CompleteRegistration',
      description: 'Celková hodnota eventů CompleteRegistration v Kč. Vyplněno pouze na souhrnném řádku.',
      dataType: 'NUMBER',
      group: 'groups',
      semantics: { conceptType: 'METRIC', semanticType: 'CURRENCY_CZK', semanticGroup: 'CURRENCY' }
    },
    {
      name: 'gof_convval_subscribe_kc',
      label: 'Sestava: Event hodnota (Kč) — Subscribe',
      description: 'Celková hodnota eventů Subscribe v Kč. Vyplněno pouze na souhrnném řádku.',
      dataType: 'NUMBER',
      group: 'groups',
      semantics: { conceptType: 'METRIC', semanticType: 'CURRENCY_CZK', semanticGroup: 'CURRENCY' }
    },
    {
      name: 'gof_convval_search_kc',
      label: 'Sestava: Event hodnota (Kč) — Search',
      description: 'Celková hodnota eventů Search v Kč. Vyplněno pouze na souhrnném řádku.',
      dataType: 'NUMBER',
      group: 'groups',
      semantics: { conceptType: 'METRIC', semanticType: 'CURRENCY_CZK', semanticGroup: 'CURRENCY' }
    },
    {
      name: 'gof_convval_contact_kc',
      label: 'Sestava: Event hodnota (Kč) — Contact',
      description: 'Celková hodnota eventů Contact v Kč. Vyplněno pouze na souhrnném řádku.',
      dataType: 'NUMBER',
      group: 'groups',
      semantics: { conceptType: 'METRIC', semanticType: 'CURRENCY_CZK', semanticGroup: 'CURRENCY' }
    },
    {
      name: 'gof_conversionValue_kc',
      label: 'Sestava: Hodnota konverzí (Kč)',
      description: 'Hodnota konverzí konkrétní definice v Kč. Vyplněno pouze na řádcích s konverzní definicí.',
      dataType: 'NUMBER',
      group: 'groups',
      semantics: { conceptType: 'METRIC', semanticType: 'CURRENCY_CZK', semanticGroup: 'CURRENCY' }
    },
    {
      name: 'gof_conversionPrice_kc',
      label: 'Sestava: Cena konverze (Kč)',
      description: 'Průměrná cena za jednu konverzi = celková cena / počet konverzí (Kč). Vyplněno pouze na souhrnném řádku.',
      dataType: 'NUMBER',
      group: 'groups',
      semantics: { conceptType: 'METRIC', semanticType: 'CURRENCY_CZK', semanticGroup: 'CURRENCY', defaultAggregationType: 'NO_AGGREGATION' }
    },
    {
      name: 'gof_conversionRatio',
      label: 'Sestava: Konverzní poměr',
      description: 'Podíl konverzí na proklikech = konverze / prokliky (%). Vyplněno pouze na souhrnném řádku.',
      dataType: 'NUMBER',
      group: 'groups',
      semantics: { conceptType: 'METRIC', semanticType: 'PERCENT', defaultAggregationType: 'AVG' }
    },
    {
      name: 'gof_pno',
      label: 'Sestava: PNO (náklady/hodnota)',
      description: 'Podíl nákladů na obratu = celková cena / hodnota konverzí (%). Vyplněno pouze na souhrnném řádku.',
      dataType: 'NUMBER',
      group: 'groups',
      semantics: { conceptType: 'METRIC', semanticType: 'PERCENT', defaultAggregationType: 'AVG' }
    },
    {
      name: 'gof_impressions',
      label: 'Sestava: Zobrazení',
      description: 'Počet zobrazení reklam sestavy za zvolené období. Vyplněno pouze na souhrnném řádku (gof_convName = prázdné).',
      dataType: 'NUMBER',
      group: 'groups',
      semantics: { conceptType: 'METRIC' }
    },
    {
      name: 'gof_clicks',
      label: 'Sestava: Prokliky',
      description: 'Počet prokliků reklam sestavy za zvolené období. Vyplněno pouze na souhrnném řádku (gof_convName = prázdné).',
      dataType: 'NUMBER',
      group: 'groups',
      semantics: { conceptType: 'METRIC' }
    },
    {
      name: 'gof_ctr',
      label: 'Sestava: CTR',
      description: 'Míra prokliku = prokliky / zobrazení (%). Vyplněno pouze na souhrnném řádku.',
      dataType: 'NUMBER',
      group: 'groups',
      semantics: { conceptType: 'METRIC', semanticType: 'PERCENT', defaultAggregationType: 'AVG' }
    },
    {
      name: 'gof_totalMoney_kc',
      label: 'Sestava: Celková cena (Kč)',
      description: 'Celkové náklady sestavy za zvolené období v Kč. Vyplněno pouze na souhrnném řádku (gof_convName = prázdné).',
      dataType: 'NUMBER',
      group: 'groups',
      semantics: { conceptType: 'METRIC', semanticType: 'CURRENCY_CZK', semanticGroup: 'CURRENCY' }
    },
    {
      name: 'gof_avgCpc_kc',
      label: 'Sestava: Průměrná CPC (Kč)',
      description: 'Průměrná cena za proklik v Kč. Vyplněno pouze na souhrnném řádku.',
      dataType: 'NUMBER',
      group: 'groups',
      semantics: { conceptType: 'METRIC', semanticType: 'CURRENCY_CZK', semanticGroup: 'CURRENCY', defaultAggregationType: 'AVG' }
    },
    {
      name: 'gof_avgPosition',
      label: 'Sestava: Průměrná pozice',
      description: 'Průměrná pozice reklamy ve výsledcích vyhledávání. Vyplněno pouze na souhrnném řádku.',
      dataType: 'NUMBER',
      group: 'groups',
      semantics: { conceptType: 'METRIC', defaultAggregationType: 'AVG' }
    },
    {
      name: 'gof_impressionMoney_kc',
      label: 'Sestava: Náklady za zobrazení (Kč)',
      description: 'Celkové náklady za zobrazení (CPT/CPM model) v Kč. Vyplněno pouze na souhrnném řádku.',
      dataType: 'NUMBER',
      group: 'groups',
      semantics: { conceptType: 'METRIC', semanticType: 'CURRENCY_CZK', semanticGroup: 'CURRENCY' }
    },
    {
      name: 'gof_avgCpt_kc',
      label: 'Sestava: Průměrná CPT (Kč)',
      description: 'Průměrná cena za tisíc zobrazení (CPT) v Kč. Vyplněno pouze na souhrnném řádku.',
      dataType: 'NUMBER',
      group: 'groups',
      semantics: { conceptType: 'METRIC', semanticType: 'CURRENCY_CZK', semanticGroup: 'CURRENCY', defaultAggregationType: 'AVG' }
    },
    {
      name: 'gof_clickMoney_kc',
      label: 'Sestava: Náklady prokliků (Kč)',
      description: 'Celkové náklady za prokliky v Kč. Vyplněno pouze na souhrnném řádku.',
      dataType: 'NUMBER',
      group: 'groups',
      semantics: { conceptType: 'METRIC', semanticType: 'CURRENCY_CZK', semanticGroup: 'CURRENCY' }
    },
    {
      name: 'gof_createDate',
      label: 'Sestava: Datum vytvoření',
      description: 'Datum vytvoření sestavy (YYYY-MM-DD).',
      dataType: 'STRING',
      group: 'groups',
      semantics: { conceptType: 'DIMENSION', semanticType: 'YEAR_MONTH_DAY', semanticGroup: 'DATETIME' }
    },
    {
      name: 'gof_deleteDate',
      label: 'Sestava: Datum smazání',
      description: 'Datum smazání sestavy (YYYY-MM-DD). Prázdné pokud není smazána.',
      dataType: 'STRING',
      group: 'groups',
      semantics: { conceptType: 'DIMENSION', semanticType: 'YEAR_MONTH_DAY', semanticGroup: 'DATETIME' }
    },
    {
      name: 'gof_firstDate',
      label: 'Sestava: První datum se statistikou',
      description: 'První den v období, kdy má sestava zaznamenanou statistiku (YYYY-MM-DD).',
      dataType: 'STRING',
      group: 'groups',
      semantics: { conceptType: 'DIMENSION', semanticType: 'YEAR_MONTH_DAY', semanticGroup: 'DATETIME' }
    },
    {
      name: 'gof_lastDate',
      label: 'Sestava: Poslední datum se statistikou',
      description: 'Poslední den v období, kdy má sestava zaznamenanou statistiku (YYYY-MM-DD).',
      dataType: 'STRING',
      group: 'groups',
      semantics: { conceptType: 'DIMENSION', semanticType: 'YEAR_MONTH_DAY', semanticGroup: 'DATETIME' }
    },
    {
      name: 'gof_cpc_kc',
      label: 'Sestava: Max CPC (Kč)',
      description: 'Maximální CPC nastavená na sestavě v Kč.',
      dataType: 'NUMBER',
      group: 'groups',
      semantics: { conceptType: 'METRIC', semanticType: 'CURRENCY_CZK', semanticGroup: 'CURRENCY', defaultAggregationType: 'AVG' }
    },
    {
      name: 'gof_cpm_kc',
      label: 'Sestava: Max CPM (Kč)',
      description: 'Maximální CPM nastavená na sestavě v Kč.',
      dataType: 'NUMBER',
      group: 'groups',
      semantics: { conceptType: 'METRIC', semanticType: 'CURRENCY_CZK', semanticGroup: 'CURRENCY', defaultAggregationType: 'AVG' }
    },
    {
      name: 'gof_skips',
      label: 'Sestava: Video přeskočení',
      description: 'Celkový počet přeskočení videoinzerátů. Vyplněno pouze na souhrnném řádku.',
      dataType: 'NUMBER',
      group: 'groups',
      semantics: { conceptType: 'METRIC' }
    },
    {
      name: 'gof_views',
      label: 'Sestava: Video zhlédnutí',
      description: 'Celkový počet zhlédnutí videoinzerátů. Vyplněno pouze na souhrnném řádku.',
      dataType: 'NUMBER',
      group: 'groups',
      semantics: { conceptType: 'METRIC' }
    },
    {
      name: 'gof_engagement',
      label: 'Sestava: Video interakce',
      description: 'Celkový počet interakcí (engagement) s videoinzeráty. Vyplněno pouze na souhrnném řádku.',
      dataType: 'NUMBER',
      group: 'groups',
      semantics: { conceptType: 'METRIC' }
    },
    {
      name: 'gof_watchTime_sec',
      label: 'Sestava: Video čas zhlédnutí (s)',
      description: 'Celkový čas zhlédnutí videí v sekundách. Vyplněno pouze na souhrnném řádku.',
      dataType: 'NUMBER',
      group: 'groups',
      semantics: { conceptType: 'METRIC', semanticType: 'DURATION' }
    },
    {
      name: 'gof_viewRate',
      label: 'Sestava: Video view rate',
      description: 'Podíl zhlédnutí na zobrazení = views / impressions. Vyplněno pouze na souhrnném řádku.',
      dataType: 'NUMBER',
      group: 'groups',
      semantics: { conceptType: 'METRIC', semanticType: 'PERCENT', defaultAggregationType: 'AVG' }
    },
    {
      name: 'gof_skipRate',
      label: 'Sestava: Video skip rate',
      description: 'Podíl přeskočení na zobrazení = skips / impressions. Vyplněno pouze na souhrnném řádku.',
      dataType: 'NUMBER',
      group: 'groups',
      semantics: { conceptType: 'METRIC', semanticType: 'PERCENT', defaultAggregationType: 'AVG' }
    },
    {
      name: 'gof_avgWatchTime_sec',
      label: 'Sestava: Video průměrný čas zhlédnutí (s)',
      description: 'Průměrný čas zhlédnutí jednoho videa v sekundách. Vyplněno pouze na souhrnném řádku.',
      dataType: 'NUMBER',
      group: 'groups',
      semantics: { conceptType: 'METRIC', semanticType: 'DURATION', defaultAggregationType: 'AVG' }
    },
    {
      name: 'gof_avgCostPerView_kc',
      label: 'Sestava: Video průměrná cena za zhlédnutí (Kč)',
      description: 'Průměrná cena za jedno video zhlédnutí (CPV) v Kč. Vyplněno pouze na souhrnném řádku.',
      dataType: 'NUMBER',
      group: 'groups',
      semantics: { conceptType: 'METRIC', semanticType: 'CURRENCY_CZK', semanticGroup: 'CURRENCY', defaultAggregationType: 'AVG' }
    },
    {
      name: 'gof_viewership_q1',
      label: 'Sestava: Video 25 % zhlédnuto',
      description: 'Kolikrát bylo video zhlédnuto do 25 %. Vyplněno pouze na souhrnném řádku.',
      dataType: 'NUMBER',
      group: 'groups',
      semantics: { conceptType: 'METRIC' }
    },
    {
      name: 'gof_viewership_q2',
      label: 'Sestava: Video 50 % zhlédnuto',
      description: 'Kolikrát bylo video zhlédnuto do 50 %. Vyplněno pouze na souhrnném řádku.',
      dataType: 'NUMBER',
      group: 'groups',
      semantics: { conceptType: 'METRIC' }
    },
    {
      name: 'gof_viewership_q3',
      label: 'Sestava: Video 75 % zhlédnuto',
      description: 'Kolikrát bylo video zhlédnuto do 75 %. Vyplněno pouze na souhrnném řádku.',
      dataType: 'NUMBER',
      group: 'groups',
      semantics: { conceptType: 'METRIC' }
    },
    {
      name: 'gof_viewership_complete',
      label: 'Sestava: Video 100 % zhlédnuto',
      description: 'Kolikrát bylo video zhlédnuto do 100 %. Vyplněno pouze na souhrnném řádku.',
      dataType: 'NUMBER',
      group: 'groups',
      semantics: { conceptType: 'METRIC' }
    },
    {
      name: 'gof_viewershipRate_q1',
      label: 'Sestava: Video podíl 25 % zhlédnutí',
      description: 'Podíl zhlédnutí, která dosáhla hranice 25 % (0–1). Vyplněno pouze na souhrnném řádku.',
      dataType: 'NUMBER',
      group: 'groups',
      semantics: { conceptType: 'METRIC', semanticType: 'PERCENT', defaultAggregationType: 'AVG' }
    },
    {
      name: 'gof_viewershipRate_q2',
      label: 'Sestava: Video podíl 50 % zhlédnutí',
      description: 'Podíl zhlédnutí, která dosáhla hranice 50 % (0–1). Vyplněno pouze na souhrnném řádku.',
      dataType: 'NUMBER',
      group: 'groups',
      semantics: { conceptType: 'METRIC', semanticType: 'PERCENT', defaultAggregationType: 'AVG' }
    },
    {
      name: 'gof_viewershipRate_q3',
      label: 'Sestava: Video podíl 75 % zhlédnutí',
      description: 'Podíl zhlédnutí, která dosáhla hranice 75 % (0–1). Vyplněno pouze na souhrnném řádku.',
      dataType: 'NUMBER',
      group: 'groups',
      semantics: { conceptType: 'METRIC', semanticType: 'PERCENT', defaultAggregationType: 'AVG' }
    },
    {
      name: 'gof_viewershipRate_complete',
      label: 'Sestava: Video podíl 100 % zhlédnutí',
      description: 'Podíl zhlédnutí, která dosáhla hranice 100 % (0–1). Vyplněno pouze na souhrnném řádku.',
      dataType: 'NUMBER',
      group: 'groups',
      semantics: { conceptType: 'METRIC', semanticType: 'PERCENT', defaultAggregationType: 'AVG' }
    },

    /*
    * ######################################################
    * ######## SCHEMA PRO FENIX — KONVERZE (cvf) ###########
    * Lookup tabulka konverzních definic — jeden řádek na definici.
    * Schováno — cvf entita zatím nemá přidanou hodnotu nad rámec dat z cgf/gof.
    * ######################################################
    */
    /* cvf_START
    {
      name: 'cvf_convId',
      label: 'Konverze: ID',
      description: 'Unikátní ID konverzní definice ve Skliku.',
      dataType: 'NUMBER',
      group: 'conversions',
      semantics: { conceptType: 'DIMENSION' }
    },
    {
      name: 'cvf_convName',
      label: 'Konverze: Název',
      description: 'Název konverzní definice.',
      dataType: 'STRING',
      group: 'conversions',
      semantics: { conceptType: 'DIMENSION' }
    },
    {
      name: 'cvf_convDescription',
      label: 'Konverze: Popis',
      description: 'Textový popis konverzní definice.',
      dataType: 'STRING',
      group: 'conversions',
      semantics: { conceptType: 'DIMENSION' }
    },
    {
      name: 'cvf_semEventName',
      label: 'Konverze: SEM Event',
      description: 'Typ SEM eventu: Purchase, Lead, AddToCart, AddToWishlist, ViewContent, InitiateCheckout, AddPaymentInfo, CompleteRegistration, Subscribe, Search, Contact.',
      dataType: 'STRING',
      group: 'conversions',
      semantics: { conceptType: 'DIMENSION' }
    },
    {
      name: 'cvf_isDeleted',
      label: 'Konverze: Smazána',
      description: 'Zda je konverzní definice smazána: true = smazána, false = aktivní.',
      dataType: 'STRING',
      group: 'conversions',
      semantics: { conceptType: 'DIMENSION' }
    },
    {
      name: 'cvf_convValue',
      label: 'Konverze: Výchozí hodnota (Kč)',
      description: 'Výchozí hodnota konverze v Kč nastavená v definici (statická hodnota, ne přenesená z webu).',
      dataType: 'NUMBER',
      group: 'conversions',
      semantics: { conceptType: 'METRIC', semanticType: 'CURRENCY_CZK', semanticGroup: 'CURRENCY' }
    },
    cvf_END */

    /* adf_START — ads entita schována (3 vrstvené API volání příliš pomalé)
    * ######################################################
    * ########### SCHEMA PRO FENIX — INZERÁTY (adf) ########
    * Jeden řádek na inzerát — bez hybridního modelu.
    * ######################################################
    */
    /*{
      name: 'adf_campaignId',
      label: 'Inzerát: ID kampaně',
      description: 'ID nadřazené kampaně.',
      dataType: 'NUMBER',
      group: 'ads',
      semantics: { conceptType: 'DIMENSION' }
    },
    {
      name: 'adf_groupId',
      label: 'Inzerát: ID sestavy',
      description: 'ID nadřazené sestavy.',
      dataType: 'NUMBER',
      group: 'ads',
      semantics: { conceptType: 'DIMENSION' }
    },
    {
      name: 'adf_adId',
      label: 'Inzerát: ID',
      description: 'Unikátní ID inzerátu ve Skliku.',
      dataType: 'NUMBER',
      group: 'ads',
      semantics: { conceptType: 'DIMENSION' }
    },
    {
      name: 'adf_adType',
      label: 'Inzerát: Typ',
      description: 'Typ inzerátu: eta (rozšířený textový), smart (chytrý).',
      dataType: 'STRING',
      group: 'ads',
      semantics: { conceptType: 'DIMENSION' }
    },
    {
      name: 'adf_status',
      label: 'Inzerát: Stav',
      description: 'Stav inzerátu nastavený uživatelem: active = aktivní, suspend = pozastaven.',
      dataType: 'STRING',
      group: 'ads',
      semantics: { conceptType: 'DIMENSION' }
    },
    {
      name: 'adf_adStatus',
      label: 'Inzerát: Schválení',
      description: 'Redakční stav inzerátu: allow = schválen, waiting = čeká na schválení, deny = zamítnut, noactive = neaktivní (pozastaven kampaní/sestavou).',
      dataType: 'STRING',
      group: 'ads',
      semantics: { conceptType: 'DIMENSION' }
    },
    {
      name: 'adf_isDeleted',
      label: 'Inzerát: Smazán',
      description: 'Zda je inzerát smazán: true = smazán, false = aktivní záznam.',
      dataType: 'STRING',
      group: 'ads',
      semantics: { conceptType: 'DIMENSION' }
    },
    {
      name: 'adf_headline1',
      label: 'Inzerát: Nadpis 1',
      description: 'První nadpis textového inzerátu (ETA).',
      dataType: 'STRING',
      group: 'ads',
      semantics: { conceptType: 'DIMENSION' }
    },
    {
      name: 'adf_headline2',
      label: 'Inzerát: Nadpis 2',
      description: 'Druhý nadpis textového inzerátu (ETA).',
      dataType: 'STRING',
      group: 'ads',
      semantics: { conceptType: 'DIMENSION' }
    },
    {
      name: 'adf_headline3',
      label: 'Inzerát: Nadpis 3',
      description: 'Třetí nadpis textového inzerátu (ETA).',
      dataType: 'STRING',
      group: 'ads',
      semantics: { conceptType: 'DIMENSION' }
    },
    {
      name: 'adf_description',
      label: 'Inzerát: Popis',
      description: 'Hlavní text popisku inzerátu (ETA).',
      dataType: 'STRING',
      group: 'ads',
      semantics: { conceptType: 'DIMENSION' }
    },
    {
      name: 'adf_description2',
      label: 'Inzerát: Popis 2',
      description: 'Druhý popisek inzerátu (ETA).',
      dataType: 'STRING',
      group: 'ads',
      semantics: { conceptType: 'DIMENSION' }
    },
    {
      name: 'adf_path1',
      label: 'Inzerát: Cesta 1',
      description: 'První část zobrazované URL cesty inzerátu (ETA).',
      dataType: 'STRING',
      group: 'ads',
      semantics: { conceptType: 'DIMENSION' }
    },
    {
      name: 'adf_path2',
      label: 'Inzerát: Cesta 2',
      description: 'Druhá část zobrazované URL cesty inzerátu (ETA).',
      dataType: 'STRING',
      group: 'ads',
      semantics: { conceptType: 'DIMENSION' }
    },
    {
      name: 'adf_finalUrl',
      label: 'Inzerát: Cílová URL',
      description: 'Cílová URL inzerátu.',
      dataType: 'STRING',
      group: 'ads',
      semantics: { conceptType: 'DIMENSION' }
    },
    {
      name: 'adf_businessName',
      label: 'Inzerát: Název firmy',
      description: 'Název firmy u chytrého inzerátu (Smart Ad).',
      dataType: 'STRING',
      group: 'ads',
      semantics: { conceptType: 'DIMENSION' }
    },
    {
      name: 'adf_impressions',
      label: 'Inzerát: Zobrazení',
      description: 'Počet zobrazení inzerátu za zvolené období.',
      dataType: 'NUMBER',
      group: 'ads',
      semantics: { conceptType: 'METRIC' }
    },
    {
      name: 'adf_clicks',
      label: 'Inzerát: Prokliky',
      description: 'Počet prokliků inzerátu za zvolené období.',
      dataType: 'NUMBER',
      group: 'ads',
      semantics: { conceptType: 'METRIC' }
    },
    {
      name: 'adf_ctr',
      label: 'Inzerát: CTR',
      description: 'Míra prokliku = prokliky / zobrazení (%).',
      dataType: 'NUMBER',
      group: 'ads',
      semantics: { conceptType: 'METRIC', semanticType: 'PERCENT', defaultAggregationType: 'AVG' }
    },
    {
      name: 'adf_totalMoney_kc',
      label: 'Inzerát: Celková cena (Kč)',
      description: 'Celkové náklady inzerátu za zvolené období v Kč.',
      dataType: 'NUMBER',
      group: 'ads',
      semantics: { conceptType: 'METRIC', semanticType: 'CURRENCY_CZK', semanticGroup: 'CURRENCY' }
    },
    {
      name: 'adf_avgCpc_kc',
      label: 'Inzerát: Průměrná CPC (Kč)',
      description: 'Průměrná cena za proklik v Kč.',
      dataType: 'NUMBER',
      group: 'ads',
      semantics: { conceptType: 'METRIC', semanticType: 'CURRENCY_CZK', semanticGroup: 'CURRENCY', defaultAggregationType: 'AVG' }
    },
    {
      name: 'adf_avgPosition',
      label: 'Inzerát: Průměrná pozice',
      description: 'Průměrná pozice inzerátu ve výsledcích vyhledávání.',
      dataType: 'NUMBER',
      group: 'ads',
      semantics: { conceptType: 'METRIC', defaultAggregationType: 'AVG' }
    },
    {
      name: 'adf_conversions',
      label: 'Inzerát: Konverze',
      description: 'Celkový počet konverzí přiřazených inzerátu za zvolené období.',
      dataType: 'NUMBER',
      group: 'ads',
      semantics: { conceptType: 'METRIC' }
    },
    {
      name: 'adf_conversionValue_kc',
      label: 'Inzerát: Hodnota konverzí (Kč)',
      description: 'Celková hodnota konverzí přiřazených inzerátu v Kč.',
      dataType: 'NUMBER',
      group: 'ads',
      semantics: { conceptType: 'METRIC', semanticType: 'CURRENCY_CZK', semanticGroup: 'CURRENCY' }
    },
    {
      name: 'adf_conversionPrice_kc',
      label: 'Inzerát: Cena konverze (Kč)',
      description: 'Průměrná cena za jednu konverzi = náklady / konverze (Kč).',
      dataType: 'NUMBER',
      group: 'ads',
      semantics: { conceptType: 'METRIC', semanticType: 'CURRENCY_CZK', semanticGroup: 'CURRENCY', defaultAggregationType: 'AVG' }
    },
    {
      name: 'adf_conversionRatio',
      label: 'Inzerát: Konverzní poměr',
      description: 'Podíl konverzí na proklikech = konverze / prokliky (%).',
      dataType: 'NUMBER',
      group: 'ads',
      semantics: { conceptType: 'METRIC', semanticType: 'PERCENT', defaultAggregationType: 'AVG' }
    },
    {
      name: 'adf_pno',
      label: 'Inzerát: PNO (náklady/hodnota)',
      description: 'Podíl nákladů na obratu = náklady / hodnota konverzí (%).',
      dataType: 'NUMBER',
      group: 'ads',
      semantics: { conceptType: 'METRIC', semanticType: 'PERCENT', defaultAggregationType: 'AVG' }
    },
    {
      name: 'adf_clickMoney_kc',
      label: 'Inzerát: Náklady prokliků ke konverzi (Kč)',
      description: 'Náklady za prokliky přiřazené ke konverzím inzerátu v Kč.',
      dataType: 'NUMBER',
      group: 'ads',
      semantics: { conceptType: 'METRIC', semanticType: 'CURRENCY_CZK', semanticGroup: 'CURRENCY' }
    },
    {
      name: 'adf_impressionMoney_kc',
      label: 'Inzerát: Náklady za zobrazení (Kč)',
      description: 'Celkové náklady za zobrazení (CPT/CPM model) v Kč.',
      dataType: 'NUMBER',
      group: 'ads',
      semantics: { conceptType: 'METRIC', semanticType: 'CURRENCY_CZK', semanticGroup: 'CURRENCY' }
    },
    {
      name: 'adf_avgCpt_kc',
      label: 'Inzerát: Průměrná CPT (Kč)',
      description: 'Průměrná cena za tisíc zobrazení (CPT) v Kč.',
      dataType: 'NUMBER',
      group: 'ads',
      semantics: { conceptType: 'METRIC', semanticType: 'CURRENCY_CZK', semanticGroup: 'CURRENCY', defaultAggregationType: 'AVG' }
    },
    {
      name: 'adf_startDate',
      label: 'Inzerát: Datum spuštění',
      description: 'Nastavené datum spuštění inzerátu (YYYY-MM-DD).',
      dataType: 'STRING',
      group: 'ads',
      semantics: { conceptType: 'DIMENSION', semanticType: 'YEAR_MONTH_DAY', semanticGroup: 'DATETIME' }
    },
    {
      name: 'adf_endDate',
      label: 'Inzerát: Datum ukončení',
      description: 'Nastavené datum ukončení inzerátu (YYYY-MM-DD).',
      dataType: 'STRING',
      group: 'ads',
      semantics: { conceptType: 'DIMENSION', semanticType: 'YEAR_MONTH_DAY', semanticGroup: 'DATETIME' }
    },
    {
      name: 'adf_createDate',
      label: 'Inzerát: Datum vytvoření',
      description: 'Datum vytvoření inzerátu (YYYY-MM-DD).',
      dataType: 'STRING',
      group: 'ads',
      semantics: { conceptType: 'DIMENSION', semanticType: 'YEAR_MONTH_DAY', semanticGroup: 'DATETIME' }
    },
    {
      name: 'adf_deleteDate',
      label: 'Inzerát: Datum smazání',
      description: 'Datum smazání inzerátu (YYYY-MM-DD). Prázdné pokud není smazán.',
      dataType: 'STRING',
      group: 'ads',
      semantics: { conceptType: 'DIMENSION', semanticType: 'YEAR_MONTH_DAY', semanticGroup: 'DATETIME' }
    },
    {
      name: 'adf_firstDate',
      label: 'Inzerát: První datum se statistikou',
      description: 'První den v období, kdy má inzerát zaznamenanou statistiku (YYYY-MM-DD).',
      dataType: 'STRING',
      group: 'ads',
      semantics: { conceptType: 'DIMENSION', semanticType: 'YEAR_MONTH_DAY', semanticGroup: 'DATETIME' }
    },
    {
      name: 'adf_lastDate',
      label: 'Inzerát: Poslední datum se statistikou',
      description: 'Poslední den v období, kdy má inzerát zaznamenanou statistiku (YYYY-MM-DD).',
      dataType: 'STRING',
      group: 'ads',
      semantics: { conceptType: 'DIMENSION', semanticType: 'YEAR_MONTH_DAY', semanticGroup: 'DATETIME' }
    },
    {
      name: 'adf_skips',
      label: 'Inzerát: Video přeskočení',
      description: 'Celkový počet přeskočení videoinzerátu.',
      dataType: 'NUMBER',
      group: 'ads',
      semantics: { conceptType: 'METRIC' }
    },
    {
      name: 'adf_views',
      label: 'Inzerát: Video zhlédnutí',
      description: 'Celkový počet zhlédnutí videoinzerátu.',
      dataType: 'NUMBER',
      group: 'ads',
      semantics: { conceptType: 'METRIC' }
    },
    {
      name: 'adf_engagement',
      label: 'Inzerát: Video interakce',
      description: 'Celkový počet interakcí (engagement) s videoinzerátem.',
      dataType: 'NUMBER',
      group: 'ads',
      semantics: { conceptType: 'METRIC' }
    },
    {
      name: 'adf_watchTime_sec',
      label: 'Inzerát: Video čas zhlédnutí (s)',
      description: 'Celkový čas zhlédnutí videí v sekundách.',
      dataType: 'NUMBER',
      group: 'ads',
      semantics: { conceptType: 'METRIC', semanticType: 'DURATION' }
    },
    {
      name: 'adf_viewRate',
      label: 'Inzerát: Video view rate',
      description: 'Podíl zhlédnutí na zobrazení = views / impressions.',
      dataType: 'NUMBER',
      group: 'ads',
      semantics: { conceptType: 'METRIC', semanticType: 'PERCENT', defaultAggregationType: 'AVG' }
    },
    {
      name: 'adf_skipRate',
      label: 'Inzerát: Video skip rate',
      description: 'Podíl přeskočení na zobrazení = skips / impressions.',
      dataType: 'NUMBER',
      group: 'ads',
      semantics: { conceptType: 'METRIC', semanticType: 'PERCENT', defaultAggregationType: 'AVG' }
    },
    {
      name: 'adf_avgWatchTime_sec',
      label: 'Inzerát: Video průměrný čas zhlédnutí (s)',
      description: 'Průměrný čas zhlédnutí jednoho videa v sekundách.',
      dataType: 'NUMBER',
      group: 'ads',
      semantics: { conceptType: 'METRIC', semanticType: 'DURATION', defaultAggregationType: 'AVG' }
    },
    {
      name: 'adf_avgCostPerView_kc',
      label: 'Inzerát: Video průměrná cena za zhlédnutí (Kč)',
      description: 'Průměrná cena za jedno video zhlédnutí (CPV) v Kč.',
      dataType: 'NUMBER',
      group: 'ads',
      semantics: { conceptType: 'METRIC', semanticType: 'CURRENCY_CZK', semanticGroup: 'CURRENCY', defaultAggregationType: 'AVG' }
    },
    {
      name: 'adf_viewership_q1',
      label: 'Inzerát: Video 25 % zhlédnuto',
      description: 'Kolikrát bylo video zhlédnuto do 25 %.',
      dataType: 'NUMBER',
      group: 'ads',
      semantics: { conceptType: 'METRIC' }
    },
    {
      name: 'adf_viewership_q2',
      label: 'Inzerát: Video 50 % zhlédnuto',
      description: 'Kolikrát bylo video zhlédnuto do 50 %.',
      dataType: 'NUMBER',
      group: 'ads',
      semantics: { conceptType: 'METRIC' }
    },
    {
      name: 'adf_viewership_q3',
      label: 'Inzerát: Video 75 % zhlédnuto',
      description: 'Kolikrát bylo video zhlédnuto do 75 %.',
      dataType: 'NUMBER',
      group: 'ads',
      semantics: { conceptType: 'METRIC' }
    },
    {
      name: 'adf_viewership_complete',
      label: 'Inzerát: Video 100 % zhlédnuto',
      description: 'Kolikrát bylo video zhlédnuto do 100 %.',
      dataType: 'NUMBER',
      group: 'ads',
      semantics: { conceptType: 'METRIC' }
    },
    {
      name: 'adf_viewershipRate_q1',
      label: 'Inzerát: Video podíl 25 % zhlédnutí',
      description: 'Podíl zhlédnutí, která dosáhla hranice 25 % (0–1).',
      dataType: 'NUMBER',
      group: 'ads',
      semantics: { conceptType: 'METRIC', semanticType: 'PERCENT', defaultAggregationType: 'AVG' }
    },
    {
      name: 'adf_viewershipRate_q2',
      label: 'Inzerát: Video podíl 50 % zhlédnutí',
      description: 'Podíl zhlédnutí, která dosáhla hranice 50 % (0–1).',
      dataType: 'NUMBER',
      group: 'ads',
      semantics: { conceptType: 'METRIC', semanticType: 'PERCENT', defaultAggregationType: 'AVG' }
    },
    {
      name: 'adf_viewershipRate_q3',
      label: 'Inzerát: Video podíl 75 % zhlédnutí',
      description: 'Podíl zhlédnutí, která dosáhla hranice 75 % (0–1).',
      dataType: 'NUMBER',
      group: 'ads',
      semantics: { conceptType: 'METRIC', semanticType: 'PERCENT', defaultAggregationType: 'AVG' }
    },
    {
      name: 'adf_viewershipRate_complete',
      label: 'Inzerát: Video podíl 100 % zhlédnutí',
      description: 'Podíl zhlédnutí, která dosáhla hranice 100 % (0–1).',
      dataType: 'NUMBER',
      group: 'ads',
      semantics: { conceptType: 'METRIC', semanticType: 'PERCENT', defaultAggregationType: 'AVG' }
    },
    adf_END */

    /*
    * ######################################################
    * ############ SCHEMA PRO FENIX — ÚČET (acc) ###########
    * Agregát celého Sklik účtu za dané období — standardně 1 řádek.
    * Zatím počítáno sumarizací všech kampaní přes fetchCampaigns().
    * Až Fenix dodá /sklik/account/stats/, vymění se vnitřní logika
    * v AccFenixClass.getDataFromApi() beze změny schématu.
    *
    * Volitelný denní rozpad: pokud uživatel přidá dimenzi 'daily' a
    * rozsah dat je <= 30 dní, vrací se N řádků (jeden na den) s vyplněným
    * polem acc_date. Jinak acc_date = ''.
    * ######################################################
    */
    {
      name: 'acc_date',
      label: 'Účet: Den',
      description: 'Datum ve formátu YYYYMMDD. Vyplněno pouze při denním rozpadu (max 31 dní). Nevyužívat spolu s funkcí "Období porovnání".',
      dataType: 'STRING',
      group: 'account',
      semantics: {
        conceptType: 'DIMENSION',
        semanticType: 'YEAR_MONTH_DAY',
        semanticGroup: 'DATETIME'
      }
    },
    {
      name: 'acc_month',
      label: 'Účet: Měsíc',
      description: 'Měsíc ve formátu YYYYMM. Vyplněno pouze při měsíčním rozpadu (max 24 měsíců).',
      dataType: 'STRING',
      group: 'account',
      semantics: {
        conceptType: 'DIMENSION',
        semanticType: 'YEAR_MONTH',
        semanticGroup: 'DATETIME'
      }
    },
    {
      name: 'acc_network',
      label: 'Účet: Síť',
      description: 'Síť (Fulltext / Obsahová / Video). Přidejte pro zobrazení koláčového grafu rozpadu sítí.',
      dataType: 'STRING',
      group: 'account',
      semantics: { conceptType: 'DIMENSION' }
    },
    {
      name: 'acc_impressions',
      label: 'Účet: Zobrazení',
      description: 'Celkový počet zobrazení reklam napříč celým účtem za zvolené období.',
      dataType: 'NUMBER',
      group: 'account',
      semantics: { conceptType: 'METRIC' }
    },
    {
      name: 'acc_clicks',
      label: 'Účet: Prokliky',
      description: 'Celkový počet prokliků napříč celým účtem za zvolené období.',
      dataType: 'NUMBER',
      group: 'account',
      semantics: { conceptType: 'METRIC' }
    },
    {
      name: 'acc_ctr',
      label: 'Účet: CTR',
      description: 'Míra prokliku za celý účet = prokliky / zobrazení (%).',
      dataType: 'NUMBER',
      group: 'account',
      semantics: { conceptType: 'METRIC', semanticType: 'PERCENT', defaultAggregationType: 'AVG' }
    },
    {
      name: 'acc_totalMoney_kc',
      label: 'Účet: Celková cena (Kč)',
      description: 'Celkové náklady celého účtu za zvolené období v Kč.',
      dataType: 'NUMBER',
      group: 'account',
      semantics: { conceptType: 'METRIC', semanticType: 'CURRENCY_CZK', semanticGroup: 'CURRENCY' }
    },
    {
      name: 'acc_avgCpc_kc',
      label: 'Účet: Průměrná CPC (Kč)',
      description: 'Průměrná cena za proklik za celý účet v Kč (totalMoney / clicks).',
      dataType: 'NUMBER',
      group: 'account',
      semantics: { conceptType: 'METRIC', semanticType: 'CURRENCY_CZK', semanticGroup: 'CURRENCY', defaultAggregationType: 'AVG' }
    },
    {
      name: 'acc_avgPosition',
      label: 'Účet: Průměrná pozice',
      description: 'Průměrná pozice reklamy za celý účet (vážený průměr podle zobrazení).',
      dataType: 'NUMBER',
      group: 'account',
      semantics: { conceptType: 'METRIC', defaultAggregationType: 'AVG' }
    },
    {
      name: 'acc_conversions',
      label: 'Účet: Konverze',
      description: 'Celkový počet konverzí napříč celým účtem (součet přes všechny kampaně a všechny konverzní definice).',
      dataType: 'NUMBER',
      group: 'account',
      semantics: { conceptType: 'METRIC' }
    },
    {
      name: 'acc_conversionValue_kc',
      label: 'Účet: Hodnota konverzí (Kč)',
      description: 'Celková hodnota konverzí napříč celým účtem v Kč.',
      dataType: 'NUMBER',
      group: 'account',
      semantics: { conceptType: 'METRIC', semanticType: 'CURRENCY_CZK', semanticGroup: 'CURRENCY' }
    },
    {
      name: 'acc_conversionPrice_kc',
      label: 'Účet: Cena konverze (Kč)',
      description: 'Průměrná cena za jednu konverzi za celý účet = totalMoney / conversions (Kč).',
      dataType: 'NUMBER',
      group: 'account',
      semantics: { conceptType: 'METRIC', semanticType: 'CURRENCY_CZK', semanticGroup: 'CURRENCY', defaultAggregationType: 'NO_AGGREGATION' }
    },
    {
      name: 'acc_conversionRatio',
      label: 'Účet: Konverzní poměr',
      description: 'Podíl konverzí na proklikách za celý účet = conversions / clicks (%).',
      dataType: 'NUMBER',
      group: 'account',
      semantics: { conceptType: 'METRIC', semanticType: 'PERCENT', defaultAggregationType: 'NO_AGGREGATION' }
    },
    {
      name: 'acc_pno',
      label: 'Účet: PNO (náklady/hodnota)',
      description: 'Podíl nákladů na obratu za celý účet = totalMoney / conversionValue × 100 (%).',
      dataType: 'NUMBER',
      group: 'account',
      semantics: { conceptType: 'METRIC', semanticType: 'PERCENT', defaultAggregationType: 'NO_AGGREGATION' }
    },

    /* --- Účet: síť FULLTEXT --- */
    {
      name: 'acc_ft_impressions',
      label: 'Účet: Fulltext zobrazení',
      description: 'Počet zobrazení ve fulltextové síti napříč celým účtem.',
      dataType: 'NUMBER',
      group: 'account',
      semantics: { conceptType: 'METRIC' }
    },
    {
      name: 'acc_ft_clicks',
      label: 'Účet: Fulltext prokliky',
      description: 'Počet prokliků ve fulltextové síti napříč celým účtem.',
      dataType: 'NUMBER',
      group: 'account',
      semantics: { conceptType: 'METRIC' }
    },
    {
      name: 'acc_ft_totalMoney_kc',
      label: 'Účet: Fulltext cena (Kč)',
      description: 'Náklady ve fulltextové síti napříč celým účtem v Kč.',
      dataType: 'NUMBER',
      group: 'account',
      semantics: { conceptType: 'METRIC', semanticType: 'CURRENCY_CZK', semanticGroup: 'CURRENCY' }
    },
    {
      name: 'acc_ft_avgPosition',
      label: 'Účet: Fulltext průměrná pozice',
      description: 'Vážený průměr pozice ve fulltextové síti napříč celým účtem (podle zobrazení).',
      dataType: 'NUMBER',
      group: 'account',
      semantics: { conceptType: 'METRIC', defaultAggregationType: 'AVG' }
    },

    /* --- Účet: síť CONTEXT (obsahová) --- */
    {
      name: 'acc_ctx_impressions',
      label: 'Účet: Obsah zobrazení',
      description: 'Počet zobrazení v obsahové síti napříč celým účtem.',
      dataType: 'NUMBER',
      group: 'account',
      semantics: { conceptType: 'METRIC' }
    },
    {
      name: 'acc_ctx_clicks',
      label: 'Účet: Obsah prokliky',
      description: 'Počet prokliků v obsahové síti napříč celým účtem.',
      dataType: 'NUMBER',
      group: 'account',
      semantics: { conceptType: 'METRIC' }
    },
    {
      name: 'acc_ctx_totalMoney_kc',
      label: 'Účet: Obsah cena (Kč)',
      description: 'Náklady v obsahové síti napříč celým účtem v Kč.',
      dataType: 'NUMBER',
      group: 'account',
      semantics: { conceptType: 'METRIC', semanticType: 'CURRENCY_CZK', semanticGroup: 'CURRENCY' }
    },
    {
      name: 'acc_ctx_avgPosition',
      label: 'Účet: Obsah průměrná pozice',
      description: 'Vážený průměr pozice v obsahové síti napříč celým účtem (podle zobrazení).',
      dataType: 'NUMBER',
      group: 'account',
      semantics: { conceptType: 'METRIC', defaultAggregationType: 'AVG' }
    },

    /* --- Účet: síť VIDEO --- */
    {
      name: 'acc_vid_impressions',
      label: 'Účet: Video zobrazení',
      description: 'Počet zobrazení ve video síti napříč celým účtem.',
      dataType: 'NUMBER',
      group: 'account',
      semantics: { conceptType: 'METRIC' }
    },
    {
      name: 'acc_vid_clicks',
      label: 'Účet: Video prokliky',
      description: 'Počet prokliků ve video síti napříč celým účtem.',
      dataType: 'NUMBER',
      group: 'account',
      semantics: { conceptType: 'METRIC' }
    },
    {
      name: 'acc_vid_totalMoney_kc',
      label: 'Účet: Video cena (Kč)',
      description: 'Náklady ve video síti napříč celým účtem v Kč.',
      dataType: 'NUMBER',
      group: 'account',
      semantics: { conceptType: 'METRIC', semanticType: 'CURRENCY_CZK', semanticGroup: 'CURRENCY' }
    },
    {
      name: 'acc_vid_avgPosition',
      label: 'Účet: Video průměrná pozice',
      description: 'Vážený průměr pozice ve video síti napříč celým účtem (podle zobrazení).',
      dataType: 'NUMBER',
      group: 'account',
      semantics: { conceptType: 'METRIC', defaultAggregationType: 'AVG' }
    }
  ];

  this.getSchema = function () {
    return this.SklikDataSchema;
  }
}
