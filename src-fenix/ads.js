/*
Sklik Fenix connector for Google Data Studio
Copyright (C) 2026 Seznam.cz, a.s.
Author: Josef Matoušek
*/

var AD_ATTRS = [
  'id', 'status', 'adStatus', 'isDeleted', 'type',
  'headline1', 'headline2', 'headline3', 'description', 'description2',
  'path1', 'path2', 'finalUrl', 'businessName',
  'startDate', 'endDate', 'createDate', 'deleteDate', 'firstDate', 'lastDate',
  'impressions', 'clicks', 'totalMoney', 'avgCpc', 'ctr', 'avgPosition',
  'impressionMoney', 'avgCpt',
  'skips', 'views', 'engagement', 'watchTime',
  'viewRate', 'skipRate', 'avgWatchTime', 'avgCostPerView',
  'viewershipFirstQuartile', 'viewershipMidpoint', 'viewershipThirdQuartile', 'viewershipComplete',
  'viewershipRateFirstQuartile', 'viewershipRateMidpoint', 'viewershipRateThirdQuartile', 'viewershipRateComplete',
  'conversions', 'conversionValue', 'conversionPrice', 'conversionRatio', 'pno', 'clickMoney'
];

/**
 * GET /sklik/campaigns/{campaignId}/groups/{groupId}/ads/
 * Fetches ads for all given groups. Fenix requires both campaignId and groupId in path,
 * so groups are fetched in parallel batches of 4.
 * @param {UserApi} userApi
 * @param {string}  dateFrom
 * @param {string}  dateTo
 * @param {Array}   groups  flat list with ._campaignId and .id (from fetchGroups)
 * @param {boolean} ignoreDeleted
 * @return {Array} flat list of ad items, each with ._campaignId and ._groupId injected
 */
function fetchAds(userApi, dateFrom, dateTo, groups, ignoreDeleted) {
  if (!groups || groups.length === 0) {
    userApi.Log.addRecord('Fenix inzeráty: nejsou zadány sestavy.', true, 'fetchAds');
    return [];
  }

  var http = userApi.http;
  var token = userApi.getAccessToken();
  var Log = userApi.Log;

  var qp = { 'statisticsDateFrom': dateFrom, 'statisticsDateTo': dateTo, 'a': AD_ATTRS };
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
  var allAds = [];

  for (var b = 0; b < groups.length; b += BATCH) {
    var batchGroups = groups.slice(b, b + BATCH);
    var requests = batchGroups.map(function(g) {
      return {
        url: http.BASE_URL + '/sklik/campaigns/' + g._campaignId + '/groups/' + g.id + '/ads/?' + qs,
        method: 'get',
        headers: { 'Authorization': 'Bearer ' + token },
        muteHttpExceptions: true
      };
    });

    var responses;
    try {
      responses = UrlFetchApp.fetchAll(requests);
    } catch (e) {
      Log.addRecord('Fenix inzeráty: fetchAll selhal pro batch: ' + e.message, true, 'fetchAds');
      responses = [];
    }

    var retryGroups = [];
    for (var r = 0; r < responses.length; r++) {
      var code = responses[r].getResponseCode();
      var grp = batchGroups[r];
      if (code === 200) {
        var body = JSON.parse(responses[r].getContentText());
        var ads = body.items || [];
        Log.addRecord('Fenix inzeráty: sestava ' + grp.id + ' → ' + ads.length + ' inzerátů', false, 'fetchAds');
        if (ads.length > 0) {
          Log.addRecord('Fenix inzeráty: první inzerát = ' + JSON.stringify(ads[0]), false, 'fetchAds');
        }
        ads.forEach(function(a) { a._campaignId = grp._campaignId; a._groupId = grp.id; });
        allAds = allAds.concat(ads);
      } else if (code === 429) {
        retryGroups.push(grp);
      } else {
        Log.addRecord('Fenix inzeráty HTTP ' + code + ' pro sestavu ' + grp.id + ': ' + responses[r].getContentText().substr(0, 200), true, 'fetchAds');
      }
    }
    for (var fi = responses.length; fi < batchGroups.length; fi++) {
      retryGroups.push(batchGroups[fi]);
    }

    if (retryGroups.length > 0) {
      Utilities.sleep(2000);
      for (var ri = 0; ri < retryGroups.length; ri++) {
        var rg = retryGroups[ri];
        try {
          var rads = http.fetchAll('/sklik/campaigns/' + rg._campaignId + '/groups/' + rg.id + '/ads/', qp);
          rads.forEach(function(a) { a._campaignId = rg._campaignId; a._groupId = rg.id; });
          allAds = allAds.concat(rads);
        } catch (e) {
          Log.addRecord('Fenix inzeráty: retry selhal pro sestavu ' + rg.id + ': ' + e.message, true, 'fetchAds');
        }
      }
    }

    if (b + BATCH < groups.length) { Utilities.sleep(900); }
  }

  Log.addRecord('Fenix inzeráty: načteno celkem ' + allAds.length + ' inzerátů z ' + groups.length + ' sestav', true, 'fetchAds');
  return allAds;
}

/**
 * Maps a raw Fenix ad item to a flat GDS row.
 * @param {Object} ad  raw item from fetchAds() (._campaignId and ._groupId injected)
 * @return {Object}
 */
function mapAdToRow(ad) {
  return {
    adf_campaignId:         ad._campaignId      || 0,
    adf_groupId:            ad._groupId         || 0,
    adf_adId:               ad.id               || 0,
    adf_adType:             ad.type             || '',
    adf_status:             ad.status           || '',
    adf_adStatus:           ad.adStatus         || '',
    adf_isDeleted:          ad.isDeleted ? 'true' : 'false',
    adf_headline1:          ad.headline1        || '',
    adf_headline2:          ad.headline2        || '',
    adf_headline3:          ad.headline3        || '',
    adf_description:        ad.description      || '',
    adf_description2:       ad.description2     || '',
    adf_path1:              ad.path1            || '',
    adf_path2:              ad.path2            || '',
    adf_finalUrl:           ad.finalUrl         || '',
    adf_businessName:       ad.businessName     || '',
    adf_startDate:          _dateOnly(ad.startDate),
    adf_endDate:            _dateOnly(ad.endDate),
    adf_createDate:         _dateOnly(ad.createDate),
    adf_deleteDate:         _dateOnly(ad.deleteDate),
    adf_firstDate:          _dateOnly(ad.firstDate),
    adf_lastDate:           _dateOnly(ad.lastDate),
    adf_impressions:        ad.impressions       || 0,
    adf_clicks:             ad.clicks            || 0,
    adf_ctr:                ad.ctr               || 0,
    adf_totalMoney_kc:      (ad.totalMoney       || 0) * 0.01,
    adf_avgCpc_kc:          (ad.avgCpc           || 0) * 0.01,
    adf_avgPosition:        ad.avgPosition       || 0,
    adf_impressionMoney_kc: (ad.impressionMoney  || 0) * 0.01,
    adf_avgCpt_kc:          (ad.avgCpt           || 0) * 0.01,
    adf_skips:                    ad.skips        || 0,
    adf_views:                    ad.views        || 0,
    adf_engagement:               ad.engagement   || 0,
    adf_watchTime_sec:            ad.watchTime    || 0,
    adf_viewRate:                 ad.viewRate     || 0,
    adf_skipRate:                 ad.skipRate     || 0,
    adf_avgWatchTime_sec:         ad.avgWatchTime || 0,
    adf_avgCostPerView_kc:        (ad.avgCostPerView || 0) * 0.01,
    adf_viewership_q1:            ad.viewershipFirstQuartile || 0,
    adf_viewership_q2:            ad.viewershipMidpoint      || 0,
    adf_viewership_q3:            ad.viewershipThirdQuartile || 0,
    adf_viewership_complete:      ad.viewershipComplete      || 0,
    adf_viewershipRate_q1:        ad.viewershipRateFirstQuartile || 0,
    adf_viewershipRate_q2:        ad.viewershipRateMidpoint      || 0,
    adf_viewershipRate_q3:        ad.viewershipRateThirdQuartile || 0,
    adf_viewershipRate_complete:  ad.viewershipRateComplete      || 0,
    adf_conversions:        ad.conversions       || 0,
    adf_conversionValue_kc: (ad.conversionValue  || 0) * 0.01,
    adf_conversionPrice_kc: (ad.conversionPrice  || 0) * 0.01,
    adf_conversionRatio:    ad.conversionRatio   || 0,
    adf_pno:                ad.pno               || 0,
    adf_clickMoney_kc:      (ad.clickMoney       || 0) * 0.01
  };
}


/**
 * GDS entity class for Fenix ads.
 * Fetches campaigns → groups → ads automatically if no campaignIds configured.
 * @param {Root} rRoot
 */
var AdsFenixClass = function(rRoot) {
  this.Root = rRoot;

  this.getDataFromApi = function() {
    var user = new UserApi(this.Root.fenixToken, this.Root.userId, this.Root.Log);
    var campaignIds = this.Root.campaignsId.length > 0 ? this.Root.campaignsId : [];

    if (campaignIds.length === 0) {
      this.Root.Log.addRecord('Fenix inzeráty: nejsou zadána ID kampaní, načítám seznam kampaní', true, 'AdsFenixClass.getDataFromApi');
      var allCampaigns = fetchCampaigns(user, this.Root.startDate, this.Root.endDate, [], this.Root.campaignsTypes, this.Root.ignoreDeleted);
      campaignIds = allCampaigns.map(function(c) { return c.id; });
      this.Root.Log.addRecord('Fenix inzeráty: automaticky načteno ' + campaignIds.length + ' kampaní', true, 'AdsFenixClass.getDataFromApi');
    }

    var groups = fetchGroups(user, this.Root.startDate, this.Root.endDate, campaignIds, this.Root.groupsId, this.Root.ignoreDeleted);

    if (!groups || groups.length === 0) {
      this.Root.Log.addRecord('Fenix inzeráty: žádné sestavy nenalezeny', true, 'AdsFenixClass.getDataFromApi');
      return [];
    }

    var ads = fetchAds(user, this.Root.startDate, this.Root.endDate, groups, this.Root.ignoreDeleted);

    if (!ads || ads.length === 0) {
      this.Root.Log.addRecord('Fenix inzeráty: API vrátilo prázdný výsledek', true, 'AdsFenixClass.getDataFromApi');
      return [];
    }

    var rows = ads.map(function(ad) { return mapAdToRow(ad); });
    this.Root.Log.addRecord('Fenix inzeráty: načteno ' + rows.length + ' inzerátů', true, 'AdsFenixClass.getDataFromApi');
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
