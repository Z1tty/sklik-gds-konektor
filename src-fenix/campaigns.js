/*
Sklik Fenix connector for Google Data Studio
Copyright (C) 2026 Seznam.cz, a.s.
Author: Josef Matoušek
*/

// Attributes requested from GET /sklik/campaigns/
var CAMPAIGN_ATTRS = [
  'id', 'name', 'status', 'isDeleted', 'type',
  'impressions', 'clicks', 'totalMoney', 'avgCpc', 'ctr', 'avgPosition',
  'impressionMoney', 'avgCpt',
  'networks.fulltext.impressions', 'networks.fulltext.clicks', 'networks.fulltext.totalMoney', 'networks.fulltext.avgPosition',
  'networks.context.impressions',  'networks.context.clicks',  'networks.context.totalMoney',  'networks.context.avgPosition',
  'networks.video.impressions',    'networks.video.clicks',    'networks.video.totalMoney',    'networks.video.avgPosition',
  'conversionIds.conversions', 'conversionIds.conversionValue',
  'conversionIds.conversionPrice', 'conversionIds.conversionRatio',
  'conversionIds.name', 'conversionIds.semEventName'
];

/**
 * GET /sklik/campaigns/
 * Fetches all campaigns with conversionIds breakdown for the given date range.
 * @param {UserApi}  userApi
 * @param {string}   dateFrom       YYYY-MM-DD
 * @param {string}   dateTo         YYYY-MM-DD
 * @param {number[]} campaignIds    optional filter
 * @param {string[]} campaignTypes  optional filter
 * @return {Array}
 */
function fetchCampaigns(userApi, dateFrom, dateTo, campaignIds, campaignTypes, ignoreDeleted) {
  var params = {
    'statisticsDateFrom': dateFrom,
    'statisticsDateTo':   dateTo,
    'a': CAMPAIGN_ATTRS
  };
  if (campaignIds && campaignIds.length > 0) { params['ids[]'] = campaignIds.map(String); }
  if (campaignTypes && campaignTypes.length > 0) { params['type[]'] = campaignTypes; }
  if (ignoreDeleted) { params['isDeleted'] = 'false'; }
  return userApi.http.fetchAll('/sklik/campaigns/', params);
}

/**
 * Expands a raw Fenix campaign item into flat GDS rows (hybrid model):
 *
 *   Row 1 — summary (cgf_convName = ''):
 *     Traffic metrics + per-event-type counts (cgf_conv_purchase, …).
 *     cgf_conversions = 0 to avoid double-counting with per-definition rows.
 *
 *   Rows 2..N — one per conversionId:
 *     cgf_conversions, cgf_conversionValue, cgf_clickMoney per definition.
 *     Traffic and cgf_conv_* = 0.
 *
 * @param {Object} campaign  raw item from fetchCampaigns()
 * @return {Object[]}
 */
function expandCampaignConversions(campaign) {
  var convList = campaign.conversionIds || [];

  var totalConversions = 0, totalConversionValue = 0;
  var byEventCount = {}, byEventValue = {};
  convList.forEach(function(conv) {
    totalConversions     += conv.conversions     || 0;
    totalConversionValue += conv.conversionValue || 0;
    var key = SEM_EVENT_MAP[conv.semEventName];
    if (key) {
      byEventCount[key] = (byEventCount[key] || 0) + (conv.conversions     || 0);
      byEventValue[key] = (byEventValue[key] || 0) + (conv.conversionValue || 0);
    }
  });

  var summaryRow = {
    cgf_campaignId:          campaign.id,
    cgf_campaignName:        campaign.name || '',
    cgf_campaignStatus:      campaign.status || '',
    cgf_campaignIsDeleted:   campaign.isDeleted ? 'true' : 'false',
    cgf_campaignType:        campaign.type || '',
    cgf_impressions:         campaign.impressions || 0,
    cgf_clicks:              campaign.clicks      || 0,
    cgf_ctr:                 campaign.ctr         || 0,
    cgf_totalMoney_kc:       (campaign.totalMoney  || 0) * 0.01,
    cgf_avgCpc_kc:           (campaign.avgCpc      || 0) * 0.01,
    cgf_avgPosition:         campaign.avgPosition || 0,
    cgf_impressionMoney_kc:  (campaign.impressionMoney || 0) * 0.01,
    cgf_avgCpt_kc:           (campaign.avgCpt          || 0) * 0.01,
    cgf_convName:            '',
    cgf_semEventName:        '',
    cgf_conversions:         0,
    cgf_conversionValue_kc:  0,
    cgf_conversionPrice_kc:  totalConversions > 0 ? (campaign.totalMoney || 0) * 0.01 / totalConversions : 0,
    cgf_conversionRatio:     campaign.clicks > 0 ? totalConversions / campaign.clicks : 0,
    cgf_pno:                 totalConversionValue > 0 ? (campaign.totalMoney || 0) / totalConversionValue * 100 : 0
  };
  for (var evt in SEM_EVENT_MAP) {
    var sfx = SEM_EVENT_MAP[evt];
    summaryRow['cgf_conv_'        + sfx]        = byEventCount[sfx] || 0;
    summaryRow['cgf_convval_' + sfx + '_kc'] = (byEventValue[sfx] || 0) * 0.01;
  }

  var rows = [summaryRow];

  convList.forEach(function(conv) {
    var convRow = {
      cgf_campaignId:          campaign.id,
      cgf_campaignName:        campaign.name || '',
      cgf_campaignStatus:      campaign.status || '',
      cgf_campaignIsDeleted:   campaign.isDeleted ? 'true' : 'false',
      cgf_campaignType:        campaign.type || '',
      cgf_impressions:         0,
      cgf_clicks:              0,
      cgf_ctr:                 0,
      cgf_totalMoney_kc:       0,
      cgf_avgCpc_kc:           0,
      cgf_avgPosition:         0,
      cgf_impressionMoney_kc:  0,
      cgf_avgCpt_kc:           0,
      cgf_convName:            conv.name            || '',
      cgf_semEventName:        conv.semEventName    || '',
      cgf_conversions:         conv.conversions     || 0,
      cgf_conversionValue_kc:  (conv.conversionValue || 0) * 0.01,
      cgf_conversionPrice_kc:  0,
      cgf_conversionRatio:    0,
      cgf_pno:                0
    };
    for (var evt in SEM_EVENT_MAP) {
      var sfx = SEM_EVENT_MAP[evt];
      convRow['cgf_conv_'        + sfx]        = 0;
      convRow['cgf_convval_' + sfx + '_kc'] = 0;
    }
    rows.push(convRow);
  });

  return rows;
}


/**
 * GDS entity class for Fenix campaign conversion breakdown.
 * @param {Root} rRoot
 */
var CampaignsFenixClass = function(rRoot) {
  this.Root = rRoot;

  this.getDataFromApi = function() {
    var user = new UserApi(this.Root.fenixToken, this.Root.userId, this.Root.Log);
    var campaigns = fetchCampaigns(user, this.Root.startDate, this.Root.endDate, this.Root.campaignsId, this.Root.campaignsTypes, this.Root.ignoreDeleted);

    if (!campaigns || campaigns.length === 0) {
      this.Root.Log.addRecord('Fenix kampaně: API vrátilo prázdný výsledek', true, 'CampaignsFenixClass.getDataFromApi');
      return [];
    }

    var rows = [];
    campaigns.forEach(function(campaign) {
      rows = rows.concat(expandCampaignConversions(campaign));
    });
    this.Root.Log.addRecord('Fenix kampaně: rozbaleno ' + rows.length + ' řádků', true, 'CampaignsFenixClass.getDataFromApi');
    return rows;
  };

  this.convertDataToGDS = function(rows) {
    if (!rows || rows.length === 0) return true;
    rows.forEach(function(row) {
      var values = [];
      this.Root.rDataSchema.forEach(function(field) {
        var val = row[field.name];
        values.push(val !== undefined && val !== null ? val : (field.dataType === 'NUMBER' ? 0 : ''));
      }, this);
      this.Root.data.push({ values: values });
    }, this);
    return true;
  };

  // Fenix data is aggregate for the date range — granularity falls back to total
  this.convertDataToGDSInGranularity = function(rows) {
    return this.convertDataToGDS(rows);
  };
};
