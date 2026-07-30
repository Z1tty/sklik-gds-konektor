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
    * ######################################################
    */
    {
      name: 'cgf_campaignId',
      label: 'Kampaň: ID',
      dataType: 'NUMBER',
      group: 'campaigns',
      semantics: { conceptType: 'DIMENSION' }
    },
    {
      name: 'cgf_campaignName',
      label: 'Kampaň: Název',
      dataType: 'STRING',
      group: 'campaigns',
      semantics: { conceptType: 'DIMENSION' }
    },
    {
      name: 'cgf_campaignStatus',
      label: 'Kampaň: Stav',
      dataType: 'STRING',
      group: 'campaigns',
      semantics: { conceptType: 'DIMENSION' }
    },
    {
      name: 'cgf_campaignIsDeleted',
      label: 'Kampaň: Smazána',
      dataType: 'STRING',
      group: 'campaigns',
      semantics: { conceptType: 'DIMENSION' }
    },
    {
      name: 'cgf_campaignType',
      label: 'Kampaň: Typ',
      dataType: 'STRING',
      group: 'campaigns',
      semantics: { conceptType: 'DIMENSION' }
    },
    {
      name: 'cgf_semEventName',
      label: 'Kampaň: Typ konverze (SEM)',
      dataType: 'STRING',
      group: 'campaigns',
      semantics: { conceptType: 'DIMENSION' }
    },
    {
      name: 'cgf_convId',
      label: 'Kampaň: ID konverzní definice',
      dataType: 'NUMBER',
      group: 'campaigns',
      semantics: { conceptType: 'DIMENSION' }
    },
    {
      name: 'cgf_convName',
      label: 'Kampaň: Název konverzní definice',
      dataType: 'STRING',
      group: 'campaigns',
      semantics: { conceptType: 'DIMENSION' }
    },
    {
      name: 'cgf_conversions',
      label: 'Kampaň: Konverze',
      dataType: 'NUMBER',
      group: 'campaigns',
      semantics: { conceptType: 'METRIC' }
    },
    {
      name: 'cgf_conv_purchase',
      label: 'Kampaň: Konverze — Purchase',
      dataType: 'NUMBER',
      group: 'campaigns',
      semantics: { conceptType: 'METRIC' }
    },
    {
      name: 'cgf_conv_lead',
      label: 'Kampaň: Konverze — Lead',
      dataType: 'NUMBER',
      group: 'campaigns',
      semantics: { conceptType: 'METRIC' }
    },
    {
      name: 'cgf_conv_addtocart',
      label: 'Kampaň: Konverze — AddToCart',
      dataType: 'NUMBER',
      group: 'campaigns',
      semantics: { conceptType: 'METRIC' }
    },
    {
      name: 'cgf_conv_addtowishlist',
      label: 'Kampaň: Konverze — AddToWishlist',
      dataType: 'NUMBER',
      group: 'campaigns',
      semantics: { conceptType: 'METRIC' }
    },
    {
      name: 'cgf_conv_viewcontent',
      label: 'Kampaň: Konverze — ViewContent',
      dataType: 'NUMBER',
      group: 'campaigns',
      semantics: { conceptType: 'METRIC' }
    },
    {
      name: 'cgf_conv_initiatecheckout',
      label: 'Kampaň: Konverze — InitiateCheckout',
      dataType: 'NUMBER',
      group: 'campaigns',
      semantics: { conceptType: 'METRIC' }
    },
    {
      name: 'cgf_conv_addpaymentinfo',
      label: 'Kampaň: Konverze — AddPaymentInfo',
      dataType: 'NUMBER',
      group: 'campaigns',
      semantics: { conceptType: 'METRIC' }
    },
    {
      name: 'cgf_conv_completeregistration',
      label: 'Kampaň: Konverze — CompleteRegistration',
      dataType: 'NUMBER',
      group: 'campaigns',
      semantics: { conceptType: 'METRIC' }
    },
    {
      name: 'cgf_conv_subscribe',
      label: 'Kampaň: Konverze — Subscribe',
      dataType: 'NUMBER',
      group: 'campaigns',
      semantics: { conceptType: 'METRIC' }
    },
    {
      name: 'cgf_conv_search',
      label: 'Kampaň: Konverze — Search',
      dataType: 'NUMBER',
      group: 'campaigns',
      semantics: { conceptType: 'METRIC' }
    },
    {
      name: 'cgf_conv_contact',
      label: 'Kampaň: Konverze — Contact',
      dataType: 'NUMBER',
      group: 'campaigns',
      semantics: { conceptType: 'METRIC' }
    },
    {
      name: 'cgf_convval_purchase_kc',
      label: 'Kampaň: Hodnota — Purchase (Kč)',
      dataType: 'NUMBER',
      group: 'campaigns',
      semantics: { conceptType: 'METRIC', semanticType: 'CURRENCY_CZK', semanticGroup: 'CURRENCY' }
    },
    {
      name: 'cgf_convval_lead_kc',
      label: 'Kampaň: Hodnota — Lead (Kč)',
      dataType: 'NUMBER',
      group: 'campaigns',
      semantics: { conceptType: 'METRIC', semanticType: 'CURRENCY_CZK', semanticGroup: 'CURRENCY' }
    },
    {
      name: 'cgf_convval_addtocart_kc',
      label: 'Kampaň: Hodnota — AddToCart (Kč)',
      dataType: 'NUMBER',
      group: 'campaigns',
      semantics: { conceptType: 'METRIC', semanticType: 'CURRENCY_CZK', semanticGroup: 'CURRENCY' }
    },
    {
      name: 'cgf_convval_addtowishlist_kc',
      label: 'Kampaň: Hodnota — AddToWishlist (Kč)',
      dataType: 'NUMBER',
      group: 'campaigns',
      semantics: { conceptType: 'METRIC', semanticType: 'CURRENCY_CZK', semanticGroup: 'CURRENCY' }
    },
    {
      name: 'cgf_convval_viewcontent_kc',
      label: 'Kampaň: Hodnota — ViewContent (Kč)',
      dataType: 'NUMBER',
      group: 'campaigns',
      semantics: { conceptType: 'METRIC', semanticType: 'CURRENCY_CZK', semanticGroup: 'CURRENCY' }
    },
    {
      name: 'cgf_convval_initiatecheckout_kc',
      label: 'Kampaň: Hodnota — InitiateCheckout (Kč)',
      dataType: 'NUMBER',
      group: 'campaigns',
      semantics: { conceptType: 'METRIC', semanticType: 'CURRENCY_CZK', semanticGroup: 'CURRENCY' }
    },
    {
      name: 'cgf_convval_addpaymentinfo_kc',
      label: 'Kampaň: Hodnota — AddPaymentInfo (Kč)',
      dataType: 'NUMBER',
      group: 'campaigns',
      semantics: { conceptType: 'METRIC', semanticType: 'CURRENCY_CZK', semanticGroup: 'CURRENCY' }
    },
    {
      name: 'cgf_convval_completeregistration_kc',
      label: 'Kampaň: Hodnota — CompleteRegistration (Kč)',
      dataType: 'NUMBER',
      group: 'campaigns',
      semantics: { conceptType: 'METRIC', semanticType: 'CURRENCY_CZK', semanticGroup: 'CURRENCY' }
    },
    {
      name: 'cgf_convval_subscribe_kc',
      label: 'Kampaň: Hodnota — Subscribe (Kč)',
      dataType: 'NUMBER',
      group: 'campaigns',
      semantics: { conceptType: 'METRIC', semanticType: 'CURRENCY_CZK', semanticGroup: 'CURRENCY' }
    },
    {
      name: 'cgf_convval_search_kc',
      label: 'Kampaň: Hodnota — Search (Kč)',
      dataType: 'NUMBER',
      group: 'campaigns',
      semantics: { conceptType: 'METRIC', semanticType: 'CURRENCY_CZK', semanticGroup: 'CURRENCY' }
    },
    {
      name: 'cgf_convval_contact_kc',
      label: 'Kampaň: Hodnota — Contact (Kč)',
      dataType: 'NUMBER',
      group: 'campaigns',
      semantics: { conceptType: 'METRIC', semanticType: 'CURRENCY_CZK', semanticGroup: 'CURRENCY' }
    },
    {
      name: 'cgf_conversionValue_kc',
      label: 'Kampaň: Hodnota konverzí (Kč)',
      dataType: 'NUMBER',
      group: 'campaigns',
      semantics: { conceptType: 'METRIC', semanticType: 'CURRENCY_CZK', semanticGroup: 'CURRENCY' }
    },
    {
      name: 'cgf_clickMoney_kc',
      label: 'Kampaň: Cena za prokliky (Kč)',
      dataType: 'NUMBER',
      group: 'campaigns',
      semantics: { conceptType: 'METRIC', semanticType: 'CURRENCY_CZK', semanticGroup: 'CURRENCY' }
    },
    {
      name: 'cgf_convTotalMoney_kc',
      label: 'Kampaň: Přiřazené náklady konverze (Kč)',
      dataType: 'NUMBER',
      group: 'campaigns',
      semantics: { conceptType: 'METRIC', semanticType: 'CURRENCY_CZK', semanticGroup: 'CURRENCY' }
    },
    {
      name: 'cgf_conversionPrice_kc',
      label: 'Kampaň: Cena konverze (Kč)',
      dataType: 'NUMBER',
      group: 'campaigns',
      semantics: { conceptType: 'METRIC', semanticType: 'CURRENCY_CZK', semanticGroup: 'CURRENCY', defaultAggregationType: 'SUM' }
    },
    {
      name: 'cgf_conversionRatio',
      label: 'Kampaň: Konverzní poměr',
      dataType: 'NUMBER',
      group: 'campaigns',
      semantics: { conceptType: 'METRIC', defaultAggregationType: 'SUM' }
    },
    {
      name: 'cgf_pno',
      label: 'Kampaň: PNO (náklady/hodnota)',
      dataType: 'NUMBER',
      group: 'campaigns',
      semantics: { conceptType: 'METRIC', defaultAggregationType: 'SUM' }
    },
    {
      name: 'cgf_impressions',
      label: 'Kampaň: Zobrazení',
      dataType: 'NUMBER',
      group: 'campaigns',
      semantics: { conceptType: 'METRIC' }
    },
    {
      name: 'cgf_clicks',
      label: 'Kampaň: Prokliky',
      dataType: 'NUMBER',
      group: 'campaigns',
      semantics: { conceptType: 'METRIC' }
    },
    {
      name: 'cgf_ctr',
      label: 'Kampaň: CTR',
      dataType: 'NUMBER',
      group: 'campaigns',
      semantics: { conceptType: 'METRIC', semanticType: 'PERCENT', defaultAggregationType: 'AVG' }
    },
    {
      name: 'cgf_totalMoney_kc',
      label: 'Kampaň: Celková cena (Kč)',
      dataType: 'NUMBER',
      group: 'campaigns',
      semantics: { conceptType: 'METRIC', semanticType: 'CURRENCY_CZK', semanticGroup: 'CURRENCY' }
    },
    {
      name: 'cgf_avgCpc_kc',
      label: 'Kampaň: Průměrná CPC (Kč)',
      dataType: 'NUMBER',
      group: 'campaigns',
      semantics: { conceptType: 'METRIC', semanticType: 'CURRENCY_CZK', semanticGroup: 'CURRENCY', defaultAggregationType: 'AVG' }
    },
    {
      name: 'cgf_avgPosition',
      label: 'Kampaň: Průměrná pozice',
      dataType: 'NUMBER',
      group: 'campaigns',
      semantics: { conceptType: 'METRIC', defaultAggregationType: 'AVG' }
    },

    /*
    * ######################################################
    * ########## SCHEMA PRO FENIX — SESTAVY (gof) ##########
    * ######################################################
    */
    {
      name: 'gof_campaignId',
      label: 'Sestava: ID kampaně',
      dataType: 'NUMBER',
      group: 'groups',
      semantics: { conceptType: 'DIMENSION' }
    },
    {
      name: 'gof_groupId',
      label: 'Sestava: ID sestavy',
      dataType: 'NUMBER',
      group: 'groups',
      semantics: { conceptType: 'DIMENSION' }
    },
    {
      name: 'gof_groupName',
      label: 'Sestava: Název',
      dataType: 'STRING',
      group: 'groups',
      semantics: { conceptType: 'DIMENSION' }
    },
    {
      name: 'gof_groupStatus',
      label: 'Sestava: Stav',
      dataType: 'STRING',
      group: 'groups',
      semantics: { conceptType: 'DIMENSION' }
    },
    {
      name: 'gof_groupIsDeleted',
      label: 'Sestava: Smazána',
      dataType: 'STRING',
      group: 'groups',
      semantics: { conceptType: 'DIMENSION' }
    },
    {
      name: 'gof_semEventName',
      label: 'Sestava: Typ konverze (SEM)',
      dataType: 'STRING',
      group: 'groups',
      semantics: { conceptType: 'DIMENSION' }
    },
    {
      name: 'gof_convId',
      label: 'Sestava: ID konverzní definice',
      dataType: 'NUMBER',
      group: 'groups',
      semantics: { conceptType: 'DIMENSION' }
    },
    {
      name: 'gof_convName',
      label: 'Sestava: Název konverzní definice',
      dataType: 'STRING',
      group: 'groups',
      semantics: { conceptType: 'DIMENSION' }
    },
    {
      name: 'gof_conversions',
      label: 'Sestava: Konverze',
      dataType: 'NUMBER',
      group: 'groups',
      semantics: { conceptType: 'METRIC' }
    },
    {
      name: 'gof_conv_purchase',
      label: 'Sestava: Konverze — Purchase',
      dataType: 'NUMBER',
      group: 'groups',
      semantics: { conceptType: 'METRIC' }
    },
    {
      name: 'gof_conv_lead',
      label: 'Sestava: Konverze — Lead',
      dataType: 'NUMBER',
      group: 'groups',
      semantics: { conceptType: 'METRIC' }
    },
    {
      name: 'gof_conv_addtocart',
      label: 'Sestava: Konverze — AddToCart',
      dataType: 'NUMBER',
      group: 'groups',
      semantics: { conceptType: 'METRIC' }
    },
    {
      name: 'gof_conv_addtowishlist',
      label: 'Sestava: Konverze — AddToWishlist',
      dataType: 'NUMBER',
      group: 'groups',
      semantics: { conceptType: 'METRIC' }
    },
    {
      name: 'gof_conv_viewcontent',
      label: 'Sestava: Konverze — ViewContent',
      dataType: 'NUMBER',
      group: 'groups',
      semantics: { conceptType: 'METRIC' }
    },
    {
      name: 'gof_conv_initiatecheckout',
      label: 'Sestava: Konverze — InitiateCheckout',
      dataType: 'NUMBER',
      group: 'groups',
      semantics: { conceptType: 'METRIC' }
    },
    {
      name: 'gof_conv_addpaymentinfo',
      label: 'Sestava: Konverze — AddPaymentInfo',
      dataType: 'NUMBER',
      group: 'groups',
      semantics: { conceptType: 'METRIC' }
    },
    {
      name: 'gof_conv_completeregistration',
      label: 'Sestava: Konverze — CompleteRegistration',
      dataType: 'NUMBER',
      group: 'groups',
      semantics: { conceptType: 'METRIC' }
    },
    {
      name: 'gof_conv_subscribe',
      label: 'Sestava: Konverze — Subscribe',
      dataType: 'NUMBER',
      group: 'groups',
      semantics: { conceptType: 'METRIC' }
    },
    {
      name: 'gof_conv_search',
      label: 'Sestava: Konverze — Search',
      dataType: 'NUMBER',
      group: 'groups',
      semantics: { conceptType: 'METRIC' }
    },
    {
      name: 'gof_conv_contact',
      label: 'Sestava: Konverze — Contact',
      dataType: 'NUMBER',
      group: 'groups',
      semantics: { conceptType: 'METRIC' }
    },
    {
      name: 'gof_convval_purchase_kc',
      label: 'Sestava: Hodnota — Purchase (Kč)',
      dataType: 'NUMBER',
      group: 'groups',
      semantics: { conceptType: 'METRIC', semanticType: 'CURRENCY_CZK', semanticGroup: 'CURRENCY' }
    },
    {
      name: 'gof_convval_lead_kc',
      label: 'Sestava: Hodnota — Lead (Kč)',
      dataType: 'NUMBER',
      group: 'groups',
      semantics: { conceptType: 'METRIC', semanticType: 'CURRENCY_CZK', semanticGroup: 'CURRENCY' }
    },
    {
      name: 'gof_convval_addtocart_kc',
      label: 'Sestava: Hodnota — AddToCart (Kč)',
      dataType: 'NUMBER',
      group: 'groups',
      semantics: { conceptType: 'METRIC', semanticType: 'CURRENCY_CZK', semanticGroup: 'CURRENCY' }
    },
    {
      name: 'gof_convval_addtowishlist_kc',
      label: 'Sestava: Hodnota — AddToWishlist (Kč)',
      dataType: 'NUMBER',
      group: 'groups',
      semantics: { conceptType: 'METRIC', semanticType: 'CURRENCY_CZK', semanticGroup: 'CURRENCY' }
    },
    {
      name: 'gof_convval_viewcontent_kc',
      label: 'Sestava: Hodnota — ViewContent (Kč)',
      dataType: 'NUMBER',
      group: 'groups',
      semantics: { conceptType: 'METRIC', semanticType: 'CURRENCY_CZK', semanticGroup: 'CURRENCY' }
    },
    {
      name: 'gof_convval_initiatecheckout_kc',
      label: 'Sestava: Hodnota — InitiateCheckout (Kč)',
      dataType: 'NUMBER',
      group: 'groups',
      semantics: { conceptType: 'METRIC', semanticType: 'CURRENCY_CZK', semanticGroup: 'CURRENCY' }
    },
    {
      name: 'gof_convval_addpaymentinfo_kc',
      label: 'Sestava: Hodnota — AddPaymentInfo (Kč)',
      dataType: 'NUMBER',
      group: 'groups',
      semantics: { conceptType: 'METRIC', semanticType: 'CURRENCY_CZK', semanticGroup: 'CURRENCY' }
    },
    {
      name: 'gof_convval_completeregistration_kc',
      label: 'Sestava: Hodnota — CompleteRegistration (Kč)',
      dataType: 'NUMBER',
      group: 'groups',
      semantics: { conceptType: 'METRIC', semanticType: 'CURRENCY_CZK', semanticGroup: 'CURRENCY' }
    },
    {
      name: 'gof_convval_subscribe_kc',
      label: 'Sestava: Hodnota — Subscribe (Kč)',
      dataType: 'NUMBER',
      group: 'groups',
      semantics: { conceptType: 'METRIC', semanticType: 'CURRENCY_CZK', semanticGroup: 'CURRENCY' }
    },
    {
      name: 'gof_convval_search_kc',
      label: 'Sestava: Hodnota — Search (Kč)',
      dataType: 'NUMBER',
      group: 'groups',
      semantics: { conceptType: 'METRIC', semanticType: 'CURRENCY_CZK', semanticGroup: 'CURRENCY' }
    },
    {
      name: 'gof_convval_contact_kc',
      label: 'Sestava: Hodnota — Contact (Kč)',
      dataType: 'NUMBER',
      group: 'groups',
      semantics: { conceptType: 'METRIC', semanticType: 'CURRENCY_CZK', semanticGroup: 'CURRENCY' }
    },
    {
      name: 'gof_conversionValue_kc',
      label: 'Sestava: Hodnota konverzí (Kč)',
      dataType: 'NUMBER',
      group: 'groups',
      semantics: { conceptType: 'METRIC', semanticType: 'CURRENCY_CZK', semanticGroup: 'CURRENCY' }
    },
    {
      name: 'gof_clickMoney_kc',
      label: 'Sestava: Cena za prokliky (Kč)',
      dataType: 'NUMBER',
      group: 'groups',
      semantics: { conceptType: 'METRIC', semanticType: 'CURRENCY_CZK', semanticGroup: 'CURRENCY' }
    },
    {
      name: 'gof_convTotalMoney_kc',
      label: 'Sestava: Přiřazené náklady konverze (Kč)',
      dataType: 'NUMBER',
      group: 'groups',
      semantics: { conceptType: 'METRIC', semanticType: 'CURRENCY_CZK', semanticGroup: 'CURRENCY' }
    },
    {
      name: 'gof_conversionPrice_kc',
      label: 'Sestava: Cena konverze (Kč)',
      dataType: 'NUMBER',
      group: 'groups',
      semantics: { conceptType: 'METRIC', semanticType: 'CURRENCY_CZK', semanticGroup: 'CURRENCY', defaultAggregationType: 'SUM' }
    },
    {
      name: 'gof_conversionRatio',
      label: 'Sestava: Konverzní poměr',
      dataType: 'NUMBER',
      group: 'groups',
      semantics: { conceptType: 'METRIC', defaultAggregationType: 'SUM' }
    },
    {
      name: 'gof_pno',
      label: 'Sestava: PNO (náklady/hodnota)',
      dataType: 'NUMBER',
      group: 'groups',
      semantics: { conceptType: 'METRIC', defaultAggregationType: 'SUM' }
    },
    {
      name: 'gof_impressions',
      label: 'Sestava: Zobrazení',
      dataType: 'NUMBER',
      group: 'groups',
      semantics: { conceptType: 'METRIC' }
    },
    {
      name: 'gof_clicks',
      label: 'Sestava: Prokliky',
      dataType: 'NUMBER',
      group: 'groups',
      semantics: { conceptType: 'METRIC' }
    },
    {
      name: 'gof_ctr',
      label: 'Sestava: CTR',
      dataType: 'NUMBER',
      group: 'groups',
      semantics: { conceptType: 'METRIC', semanticType: 'PERCENT', defaultAggregationType: 'AVG' }
    },
    {
      name: 'gof_totalMoney_kc',
      label: 'Sestava: Celková cena (Kč)',
      dataType: 'NUMBER',
      group: 'groups',
      semantics: { conceptType: 'METRIC', semanticType: 'CURRENCY_CZK', semanticGroup: 'CURRENCY' }
    },
    {
      name: 'gof_avgCpc_kc',
      label: 'Sestava: Průměrná CPC (Kč)',
      dataType: 'NUMBER',
      group: 'groups',
      semantics: { conceptType: 'METRIC', semanticType: 'CURRENCY_CZK', semanticGroup: 'CURRENCY', defaultAggregationType: 'AVG' }
    },
    {
      name: 'gof_avgPosition',
      label: 'Sestava: Průměrná pozice',
      dataType: 'NUMBER',
      group: 'groups',
      semantics: { conceptType: 'METRIC', defaultAggregationType: 'AVG' }
    }
  ];

  this.getSchema = function () {
    return this.SklikDataSchema;
  }
}
