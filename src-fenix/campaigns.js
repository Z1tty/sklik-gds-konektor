/*
Sklik Fenix connector for Google Data Studio
Copyright (C) 2026 Seznam.cz, a.s.
Author: Josef Matoušek
*/

// Base attributes (always fetched) — kept short to stay within Apps Script URL limit
var CAMPAIGN_ATTRS_BASE = [
  'id', 'name', 'status', 'isDeleted', 'type',
  'totalBudget', 'exhaustedTotalBudget', 'totalClicks', 'actualClicks',
  'startDate', 'endDate', 'createDate', 'deleteDate',
  'paymentMethod', 'adSelection', 'scheduleEnabled', 'videoFormat',
  'maxPno', 'defaultBudgetId',
  'impressions', 'clicks', 'totalMoney', 'avgCpc', 'ctr', 'avgPosition',
  'impressionMoney', 'avgCpt', 'clickMoney',
  'impressionShare', 'missedPrice',
  'exhaustedBudgetCount', 'exhaustedBudgetShare',
  'stoppedByScheduleCount', 'stoppedByScheduleShare',
  'underForestThresholdCount', 'underForestThresholdShare',
  'conversionIds.conversions', 'conversionIds.conversionValue',
  'conversionIds.conversionPrice', 'conversionIds.conversionRatio',
  'conversionIds.name', 'conversionIds.semEventName'
];

// Network breakdown — requested only when cgf_ft_* / cgf_ctx_* / cgf_vid_* fields are used
var CAMPAIGN_ATTRS_NETWORK = [
  'networks.fulltext.impressions', 'networks.fulltext.clicks', 'networks.fulltext.totalMoney', 'networks.fulltext.avgPosition',
  'networks.context.impressions',  'networks.context.clicks',  'networks.context.totalMoney',  'networks.context.avgPosition',
  'networks.video.impressions',    'networks.video.clicks',    'networks.video.totalMoney',    'networks.video.avgPosition'
];

// Video engagement + viewership — requested only when cgf_skips / cgf_viewership_* fields are used
var CAMPAIGN_ATTRS_VIDEO = [
  'skips', 'views', 'engagement', 'watchTime',
  'viewRate', 'skipRate', 'avgWatchTime', 'avgCostPerView',
  'viewershipFirstQuartile', 'viewershipMidpoint', 'viewershipThirdQuartile', 'viewershipComplete',
  'viewershipRateFirstQuartile', 'viewershipRateMidpoint', 'viewershipRateThirdQuartile', 'viewershipRateComplete'
];

/**
 * GET /sklik/campaigns/
 * @param {UserApi}  userApi
 * @param {string}   dateFrom
 * @param {string}   dateTo
 * @param {number[]} campaignIds    optional filter
 * @param {string[]} campaignTypes  optional filter
 * @param {boolean}  ignoreDeleted
 * @param {string[]} extraAttrs     additional attribute groups (e.g. CAMPAIGN_ATTRS_NETWORK)
 * @return {Array}
 */
function fetchCampaigns(userApi, dateFrom, dateTo, campaignIds, campaignTypes, ignoreDeleted, extraAttrs) {
  var attrs = CAMPAIGN_ATTRS_BASE.concat(extraAttrs || []);
  var params = {
    'statisticsDateFrom': dateFrom,
    'statisticsDateTo':   dateTo,
    'a': attrs
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

  var nets = campaign.networks || {};

  var meta = {
    cgf_campaignId:              campaign.id,
    cgf_campaignName:            campaign.name || '',
    cgf_campaignStatus:          campaign.status || '',
    cgf_campaignIsDeleted:       campaign.isDeleted ? 'true' : 'false',
    cgf_campaignType:            campaign.type || '',
    cgf_totalBudget_kc:          (campaign.totalBudget          || 0) * 0.01,
    cgf_exhaustedTotalBudget_kc: (campaign.exhaustedTotalBudget || 0) * 0.01,
    cgf_totalClicks:             campaign.totalClicks  || 0,
    cgf_actualClicks:            campaign.actualClicks || 0,
    cgf_startDate:               _dateOnly(campaign.startDate),
    cgf_endDate:                 _dateOnly(campaign.endDate),
    cgf_createDate:              _dateOnly(campaign.createDate),
    cgf_deleteDate:              _dateOnly(campaign.deleteDate),
    cgf_paymentMethod:           campaign.paymentMethod || '',
    cgf_adSelection:             campaign.adSelection   || '',
    cgf_scheduleEnabled:         campaign.scheduleEnabled ? 'true' : 'false',
    cgf_videoFormat:             campaign.videoFormat || '',
    cgf_maxPno:                  campaign.maxPno         || 0,
    cgf_defaultBudgetId:         campaign.defaultBudgetId || 0
  };

  var summaryRow = {
    cgf_impressions:         campaign.impressions || 0,
    cgf_clicks:              campaign.clicks      || 0,
    cgf_ctr:                 campaign.ctr         || 0,
    cgf_totalMoney_kc:       (campaign.totalMoney  || 0) * 0.01,
    cgf_avgCpc_kc:           (campaign.avgCpc      || 0) * 0.01,
    cgf_avgPosition:         campaign.avgPosition || 0,
    cgf_impressionMoney_kc:  (campaign.impressionMoney || 0) * 0.01,
    cgf_avgCpt_kc:           (campaign.avgCpt          || 0) * 0.01,
    cgf_clickMoney_kc:       (campaign.clickMoney      || 0) * 0.01,
    cgf_impressionShare:              campaign.impressionShare              || 0,
    cgf_missedPrice_kc:               (campaign.missedPrice                  || 0) * 0.01,
    cgf_exhaustedBudgetCount:         campaign.exhaustedBudgetCount         || 0,
    cgf_exhaustedBudgetShare:         campaign.exhaustedBudgetShare         || 0,
    cgf_stoppedByScheduleCount:       campaign.stoppedByScheduleCount       || 0,
    cgf_stoppedByScheduleShare:       campaign.stoppedByScheduleShare       || 0,
    cgf_underForestThresholdCount:    campaign.underForestThresholdCount    || 0,
    cgf_underForestThresholdShare:    campaign.underForestThresholdShare    || 0,
    cgf_skips:                    campaign.skips        || 0,
    cgf_views:                    campaign.views        || 0,
    cgf_engagement:               campaign.engagement   || 0,
    cgf_watchTime_sec:            campaign.watchTime    || 0,
    cgf_viewRate:                 campaign.viewRate     || 0,
    cgf_skipRate:                 campaign.skipRate     || 0,
    cgf_avgWatchTime_sec:         campaign.avgWatchTime || 0,
    cgf_avgCostPerView_kc:        (campaign.avgCostPerView || 0) * 0.01,
    cgf_viewership_q1:            campaign.viewershipFirstQuartile || 0,
    cgf_viewership_q2:            campaign.viewershipMidpoint      || 0,
    cgf_viewership_q3:            campaign.viewershipThirdQuartile || 0,
    cgf_viewership_complete:      campaign.viewershipComplete      || 0,
    cgf_viewershipRate_q1:        campaign.viewershipRateFirstQuartile || 0,
    cgf_viewershipRate_q2:        campaign.viewershipRateMidpoint      || 0,
    cgf_viewershipRate_q3:        campaign.viewershipRateThirdQuartile || 0,
    cgf_viewershipRate_complete:  campaign.viewershipRateComplete      || 0,
    cgf_ft_impressions:    (nets.fulltext  || {}).impressions || 0,
    cgf_ft_clicks:         (nets.fulltext  || {}).clicks      || 0,
    cgf_ft_totalMoney_kc:  ((nets.fulltext  || {}).totalMoney  || 0) * 0.01,
    cgf_ft_avgPosition:    (nets.fulltext  || {}).avgPosition || 0,
    cgf_ctx_impressions:   (nets.context   || {}).impressions || 0,
    cgf_ctx_clicks:        (nets.context   || {}).clicks      || 0,
    cgf_ctx_totalMoney_kc: ((nets.context   || {}).totalMoney  || 0) * 0.01,
    cgf_ctx_avgPosition:   (nets.context   || {}).avgPosition || 0,
    cgf_vid_impressions:   (nets.video     || {}).impressions || 0,
    cgf_vid_clicks:        (nets.video     || {}).clicks      || 0,
    cgf_vid_totalMoney_kc: ((nets.video     || {}).totalMoney  || 0) * 0.01,
    cgf_vid_avgPosition:   (nets.video     || {}).avgPosition || 0,
    cgf_convName:            '',
    cgf_semEventName:        '',
    cgf_conversions:         0,
    cgf_conversionValue_kc:  0,
    cgf_conversionPrice_kc:  totalConversions > 0 ? (campaign.totalMoney || 0) * 0.01 / totalConversions : 0,
    cgf_conversionRatio:     campaign.clicks > 0 ? totalConversions / campaign.clicks : 0,
    cgf_pno:                 totalConversionValue > 0 ? (campaign.totalMoney || 0) / totalConversionValue : 0
  };
  for (var mk in meta) { summaryRow[mk] = meta[mk]; }
  for (var evt in SEM_EVENT_MAP) {
    var sfx = SEM_EVENT_MAP[evt];
    summaryRow['cgf_conv_'        + sfx]        = byEventCount[sfx] || 0;
    summaryRow['cgf_convval_' + sfx + '_kc'] = (byEventValue[sfx] || 0) * 0.01;
  }

  var rows = [summaryRow];

  convList.forEach(function(conv) {
    var convRow = {
      cgf_impressions:         0,
      cgf_clicks:              0,
      cgf_ctr:                 0,
      cgf_totalMoney_kc:       0,
      cgf_avgCpc_kc:           0,
      cgf_avgPosition:         0,
      cgf_impressionMoney_kc:  0,
      cgf_avgCpt_kc:           0,
      cgf_clickMoney_kc:       0,
      cgf_impressionShare:              0,
      cgf_missedPrice_kc:               0,
      cgf_exhaustedBudgetCount:         0,
      cgf_exhaustedBudgetShare:         0,
      cgf_stoppedByScheduleCount:       0,
      cgf_stoppedByScheduleShare:       0,
      cgf_underForestThresholdCount:    0,
      cgf_underForestThresholdShare:    0,
      cgf_skips:                    0,
      cgf_views:                    0,
      cgf_engagement:               0,
      cgf_watchTime_sec:            0,
      cgf_viewRate:                 0,
      cgf_skipRate:                 0,
      cgf_avgWatchTime_sec:         0,
      cgf_avgCostPerView_kc:        0,
      cgf_viewership_q1:            0,
      cgf_viewership_q2:            0,
      cgf_viewership_q3:            0,
      cgf_viewership_complete:      0,
      cgf_viewershipRate_q1:        0,
      cgf_viewershipRate_q2:        0,
      cgf_viewershipRate_q3:        0,
      cgf_viewershipRate_complete:  0,
      cgf_ft_impressions:    0,
      cgf_ft_clicks:         0,
      cgf_ft_totalMoney_kc:  0,
      cgf_ft_avgPosition:    0,
      cgf_ctx_impressions:   0,
      cgf_ctx_clicks:        0,
      cgf_ctx_totalMoney_kc: 0,
      cgf_ctx_avgPosition:   0,
      cgf_vid_impressions:   0,
      cgf_vid_clicks:        0,
      cgf_vid_totalMoney_kc: 0,
      cgf_vid_avgPosition:   0,
      cgf_convName:            conv.name            || '',
      cgf_semEventName:        conv.semEventName    || '',
      cgf_conversions:         conv.conversions     || 0,
      cgf_conversionValue_kc:  (conv.conversionValue || 0) * 0.01,
      cgf_conversionPrice_kc:  0,
      cgf_conversionRatio:    0,
      cgf_pno:                0
    };
    for (var mk in meta) { convRow[mk] = meta[mk]; }
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
    var cols = this.Root.displayColumns['campaigns'];
    var needsNetwork = cols.indexOf('ft') !== -1 || cols.indexOf('ctx') !== -1 || cols.indexOf('vid') !== -1;
    var needsVideo   = cols.indexOf('skips') !== -1 || cols.indexOf('views') !== -1 ||
                       cols.indexOf('viewership') !== -1 || cols.indexOf('viewershipRate') !== -1 ||
                       cols.indexOf('viewRate') !== -1 || cols.indexOf('skipRate') !== -1 ||
                       cols.indexOf('engagement') !== -1 || cols.indexOf('watchTime') !== -1 ||
                       cols.indexOf('avgWatchTime') !== -1 || cols.indexOf('avgCostPerView') !== -1;
    var extra = (needsNetwork ? CAMPAIGN_ATTRS_NETWORK : []).concat(needsVideo ? CAMPAIGN_ATTRS_VIDEO : []);
    var campaigns = fetchCampaigns(user, this.Root.startDate, this.Root.endDate, this.Root.campaignsId, this.Root.campaignsTypes, this.Root.ignoreDeleted, extra);

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
