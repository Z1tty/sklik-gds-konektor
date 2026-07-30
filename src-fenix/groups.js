/*
Sklik Fenix connector for Google Data Studio
Copyright (C) 2026 Seznam.cz, a.s.
Author: Josef Matoušek
*/

// Attributes requested from GET /sklik/campaigns/{campaignId}/groups/
var GROUP_ATTRS = [
  'id', 'name', 'status', 'isDeleted',
  'impressions', 'clicks', 'totalMoney', 'avgCpc', 'ctr', 'avgPosition',
  'impressionMoney', 'avgCpt',
  'impressionShare', 'winRate', 'missedPrice',
  'exhaustedBudgetCount', 'exhaustedBudgetShare',
  'stoppedByScheduleCount', 'stoppedByScheduleShare',
  'underForestThresholdCount', 'underForestThresholdShare',
  'conversionIds.conversions', 'conversionIds.conversionValue',
  'conversionIds.conversionPrice', 'conversionIds.conversionRatio',
  'conversionIds.name', 'conversionIds.semEventName'
];

/**
 * GET /sklik/campaigns/{campaignId}/groups/
 * Fetches groups for all given campaign IDs. Fenix requires campaignId in path,
 * so campaigns are fetched in parallel batches of 4 (rate limit = 5 req/s).
 * @param {UserApi}  userApi
 * @param {string}   dateFrom
 * @param {string}   dateTo
 * @param {number[]} campaignIds  required
 * @param {number[]} groupIds     optional post-fetch filter
 * @return {Array} flat list of group items, each with ._campaignId injected
 */
function fetchGroups(userApi, dateFrom, dateTo, campaignIds, groupIds, ignoreDeleted) {
  if (!campaignIds || campaignIds.length === 0) {
    userApi.Log.addRecord('Fenix skupiny: nejsou zadána ID kampaní.', true, 'fetchGroups');
    return [];
  }

  var http = userApi.http;
  var token = userApi.getAccessToken();
  var Log = userApi.Log;

  // Build shared query string for all group requests
  var qp = { 'statisticsDateFrom': dateFrom, 'statisticsDateTo': dateTo, 'a': GROUP_ATTRS };
  if (ignoreDeleted) { qp['isDeleted'] = 'false'; }
  var qParts = [];
  for (var key in qp) {
    var val = qp[key];
    if (Array.isArray(val)) {
      for (var ai = 0; ai < val.length; ai++) { qParts.push(encodeURIComponent(key) + '=' + encodeURIComponent(val[ai])); }
    } else {
      qParts.push(encodeURIComponent(key) + '=' + encodeURIComponent(val));
    }
  }
  qParts.push('offset=0');
  qParts.push('limit=' + http.PAGE_LIMIT);
  var qs = qParts.join('&');

  var BATCH = 4;
  var allGroups = [];

  for (var b = 0; b < campaignIds.length; b += BATCH) {
    var batchIds = campaignIds.slice(b, b + BATCH);
    var requests = batchIds.map(function(cid) {
      return {
        url: http.BASE_URL + '/sklik/campaigns/' + cid + '/groups/?' + qs,
        method: 'get',
        headers: { 'Authorization': 'Bearer ' + token },
        muteHttpExceptions: true
      };
    });

    var responses;
    try {
      responses = UrlFetchApp.fetchAll(requests);
    } catch (e) {
      Log.addRecord('Fenix skupiny: fetchAll selhal pro batch ' + batchIds.join(',') + ': ' + e.message, true, 'fetchGroups');
      responses = [];
    }

    var retryIds = [];
    for (var r = 0; r < responses.length; r++) {
      var code = responses[r].getResponseCode();
      var cid = batchIds[r];
      if (code === 200) {
        var body = JSON.parse(responses[r].getContentText());
        var groups = body.items || [];
        groups.forEach(function(g) { g._campaignId = cid; });
        allGroups = allGroups.concat(groups);
      } else if (code === 429) {
        retryIds.push(cid);
      } else {
        Log.addRecord('Fenix skupiny HTTP ' + code + ' pro kampaň ' + cid, true, 'fetchGroups');
      }
    }
    // Campaigns from failed fetchAll go to retry too
    for (var fi = responses.length; fi < batchIds.length; fi++) {
      retryIds.push(batchIds[fi]);
    }

    if (retryIds.length > 0) {
      Utilities.sleep(2000);
      for (var ri = 0; ri < retryIds.length; ri++) {
        var rcid = retryIds[ri];
        try {
          var rgroups = http.fetchAll('/sklik/campaigns/' + rcid + '/groups/', qp);
          rgroups.forEach(function(g) { g._campaignId = rcid; });
          allGroups = allGroups.concat(rgroups);
        } catch (e) {
          Log.addRecord('Fenix skupiny: retry selhal pro kampaň ' + rcid + ': ' + e.message, true, 'fetchGroups');
        }
      }
    }

    if (b + BATCH < campaignIds.length) { Utilities.sleep(900); }
  }

  Log.addRecord('Fenix skupiny: načteno celkem ' + allGroups.length + ' skupin z ' + campaignIds.length + ' kampaní', true, 'fetchGroups');

  if (groupIds && groupIds.length > 0) {
    allGroups = allGroups.filter(function(g) { return groupIds.indexOf(g.id) !== -1; });
  }
  return allGroups;
}

/**
 * Expands a raw Fenix group item into flat GDS rows (same hybrid model as campaigns.js).
 * @param {Object} group  raw item from fetchGroups() (._campaignId injected)
 * @return {Object[]}
 */
function expandGroupConversions(group) {
  var convList = group.conversionIds || [];
  var campaignId = group._campaignId || 0;

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
    gof_campaignId:          campaignId,
    gof_groupId:             group.id,
    gof_groupName:           group.name || '',
    gof_groupStatus:         group.status || '',
    gof_groupIsDeleted:      group.isDeleted ? 'true' : 'false',
    gof_impressions:         group.impressions || 0,
    gof_clicks:              group.clicks      || 0,
    gof_ctr:                 group.ctr         || 0,
    gof_totalMoney_kc:       (group.totalMoney  || 0) * 0.01,
    gof_avgCpc_kc:           (group.avgCpc      || 0) * 0.01,
    gof_avgPosition:         group.avgPosition || 0,
    gof_impressionMoney_kc:  (group.impressionMoney || 0) * 0.01,
    gof_avgCpt_kc:           (group.avgCpt          || 0) * 0.01,
    gof_impressionShare:          group.impressionShare          || 0,
    gof_winRate:                  group.winRate                  || 0,
    gof_missedPrice:              (group.missedPrice              || 0) * 0.01,
    gof_exhaustedBudgetCount:     group.exhaustedBudgetCount     || 0,
    gof_exhaustedBudgetShare:     group.exhaustedBudgetShare     || 0,
    gof_stoppedByScheduleCount:   group.stoppedByScheduleCount   || 0,
    gof_stoppedByScheduleShare:   group.stoppedByScheduleShare   || 0,
    gof_underForestThresholdCount: group.underForestThresholdCount || 0,
    gof_underForestThresholdShare: group.underForestThresholdShare || 0,
    gof_convName:            '',
    gof_semEventName:        '',
    gof_conversions:         0,
    gof_conversionValue_kc:  0,
    gof_conversionPrice_kc:  totalConversions > 0 ? (group.totalMoney || 0) * 0.01 / totalConversions : 0,
    gof_conversionRatio:     group.clicks > 0 ? totalConversions / group.clicks : 0,
    gof_pno:                 totalConversionValue > 0 ? (group.totalMoney || 0) / totalConversionValue * 100 : 0
  };
  for (var evt in SEM_EVENT_MAP) {
    var sfx = SEM_EVENT_MAP[evt];
    summaryRow['gof_conv_'        + sfx]        = byEventCount[sfx] || 0;
    summaryRow['gof_convval_' + sfx + '_kc'] = (byEventValue[sfx] || 0) * 0.01;
  }

  var rows = [summaryRow];

  convList.forEach(function(conv) {
    var convRow = {
      gof_campaignId:          campaignId,
      gof_groupId:             group.id,
      gof_groupName:           group.name || '',
      gof_groupStatus:         group.status || '',
      gof_groupIsDeleted:      group.isDeleted ? 'true' : 'false',
      gof_impressionShare:          0,
      gof_winRate:                  0,
      gof_missedPrice:              0,
      gof_exhaustedBudgetCount:     0,
      gof_exhaustedBudgetShare:     0,
      gof_stoppedByScheduleCount:   0,
      gof_stoppedByScheduleShare:   0,
      gof_underForestThresholdCount: 0,
      gof_underForestThresholdShare: 0,
      gof_impressions:         0,
      gof_clicks:              0,
      gof_ctr:                 0,
      gof_totalMoney_kc:       0,
      gof_avgCpc_kc:           0,
      gof_avgPosition:         0,
      gof_impressionMoney_kc:  0,
      gof_avgCpt_kc:           0,
      gof_convName:            conv.name            || '',
      gof_semEventName:        conv.semEventName    || '',
      gof_conversions:         conv.conversions     || 0,
      gof_conversionValue_kc:  (conv.conversionValue || 0) * 0.01,
      gof_conversionPrice_kc:  0,
      gof_conversionRatio:     0,
      gof_pno:                 0
    };
    for (var evt in SEM_EVENT_MAP) {
      var sfx = SEM_EVENT_MAP[evt];
      convRow['gof_conv_'        + sfx]        = 0;
      convRow['gof_convval_' + sfx + '_kc'] = 0;
    }
    rows.push(convRow);
  });

  return rows;
}


/**
 * GDS entity class for Fenix group conversion breakdown.
 * If no campaignIds are configured, auto-fetches all campaigns first.
 * @param {Root} rRoot
 */
var GroupsFenixClass = function(rRoot) {
  this.Root = rRoot;

  this.getDataFromApi = function() {
    var user = new UserApi(this.Root.fenixToken, this.Root.userId, this.Root.Log);
    var campaignIds = this.Root.campaignsId.length > 0 ? this.Root.campaignsId : [];

    if (campaignIds.length === 0) {
      this.Root.Log.addRecord('Fenix skupiny: nejsou zadána ID kampaní, načítám seznam kampaní', true, 'GroupsFenixClass.getDataFromApi');
      var allCampaigns = fetchCampaigns(user, this.Root.startDate, this.Root.endDate, [], this.Root.campaignsTypes, this.Root.ignoreDeleted);
      campaignIds = allCampaigns.map(function(c) { return c.id; });
      this.Root.Log.addRecord('Fenix skupiny: automaticky načteno ' + campaignIds.length + ' kampaní', true, 'GroupsFenixClass.getDataFromApi');
    }

    var groups = fetchGroups(user, this.Root.startDate, this.Root.endDate, campaignIds, this.Root.groupsId, this.Root.ignoreDeleted);

    if (!groups || groups.length === 0) {
      this.Root.Log.addRecord('Fenix skupiny: API vrátilo prázdný výsledek', true, 'GroupsFenixClass.getDataFromApi');
      return [];
    }

    var rows = [];
    groups.forEach(function(group) {
      rows = rows.concat(expandGroupConversions(group));
    });
    this.Root.Log.addRecord('Fenix skupiny: rozbaleno ' + rows.length + ' řádků', true, 'GroupsFenixClass.getDataFromApi');
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

  this.convertDataToGDSInGranularity = function(rows) {
    return this.convertDataToGDS(rows);
  };
};
