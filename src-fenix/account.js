/*
Sklik Fenix connector for Google Data Studio
Copyright (C) 2026 Seznam.cz, a.s.
Author: Josef Matoušek
*/

// --- Lokální datum helpery (YYYY-MM-DD / YYYYMMDD) ---

// 'YYYY-MM-DD' + n dní → 'YYYY-MM-DD' (UTC, bez timezone posunů)
function _addDays(dateStr, n) {
  var parts = String(dateStr).split('-');
  var d = new Date(Date.UTC(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10)));
  d.setUTCDate(d.getUTCDate() + n);
  var y = d.getUTCFullYear();
  var m = d.getUTCMonth() + 1;
  var day = d.getUTCDate();
  return y + '-' + (m < 10 ? '0' + m : m) + '-' + (day < 10 ? '0' + day : day);
}

// Počet dní mezi 'YYYY-MM-DD' a 'YYYY-MM-DD' (inclusive: from=to → 1)
function _dateDiff(from, to) {
  var pf = String(from).split('-');
  var pt = String(to).split('-');
  var df = Date.UTC(parseInt(pf[0], 10), parseInt(pf[1], 10) - 1, parseInt(pf[2], 10));
  var dt = Date.UTC(parseInt(pt[0], 10), parseInt(pt[1], 10) - 1, parseInt(pt[2], 10));
  var msPerDay = 86400000;
  return Math.round((dt - df) / msPerDay) + 1;
}

// 'YYYY-MM-DD' → 'YYYYMMDD' (GDS YEAR_MONTH_DAY formát)
function _toGdsDate(dateStr) {
  return String(dateStr).replace(/-/g, '');
}

/**
 * GDS entity class for Fenix account-level aggregate.
 *
 * Fenix API zatím nemá /sklik/account/stats/ endpoint, takže interně voláme
 * fetchCampaigns() (bez filtrů) a agregujeme všechny kampaně do JEDNOHO řádku
 * reprezentujícího celý účet za dané období.
 *
 * Denní rozpad: pokud uživatel přidá dimenzi 'daily' a rozsah dat <= 30 dní,
 * voláme fetchCampaigns() pro každý den a vrátíme N řádků (jeden na den)
 * s vyplněným polem acc_date. Jinak vrátíme 1 řádek s acc_date = ''.
 *
 * Až Fenix endpoint dodá, stačí vyměnit vnitřní logiku getDataFromApi() —
 * schéma i convertDataToGDS() zůstane beze změny.
 *
 * @param {Root} rRoot
 */
var AccFenixClass = function(rRoot) {
  this.Root = rRoot;

  /**
   * Agregace pole kampaní z jednoho volání fetchCampaigns() do jednoho řádku.
   * @param {Array} campaigns  raw items z fetchCampaigns()
   * @param {string} dateStr   'YYYYMMDD' pro denní řádek, nebo '' pro celé období
   * @return {Object} jeden GDS řádek
   */
  this.aggregateCampaigns = function(campaigns, dateStr) {
    var acc = {
      impressions: 0,
      clicks: 0,
      totalMoney: 0,          // v haléřích
      avgPosWeighted: 0,      // SUM(avgPosition * impressions)
      avgPosImpr: 0,          // SUM(impressions) pro váhu
      conversions: 0,
      conversionValue: 0,     // v haléřích
      ft_impressions: 0,
      ft_clicks: 0,
      ft_totalMoney: 0,
      ft_avgPosWeighted: 0,
      ft_avgPosImpr: 0,
      ctx_impressions: 0,
      ctx_clicks: 0,
      ctx_totalMoney: 0,
      ctx_avgPosWeighted: 0,
      ctx_avgPosImpr: 0,
      vid_impressions: 0,
      vid_clicks: 0,
      vid_totalMoney: 0,
      vid_avgPosWeighted: 0,
      vid_avgPosImpr: 0
    };

    (campaigns || []).forEach(function(c) {
      var impr = c.impressions || 0;
      acc.impressions      += impr;
      acc.clicks           += c.clicks     || 0;
      acc.totalMoney       += c.totalMoney || 0;

      var avgPos = c.avgPosition || 0;
      if (avgPos > 0 && impr > 0) {
        acc.avgPosWeighted += avgPos * impr;
        acc.avgPosImpr     += impr;
      }

      // Součet konverzí přes všechny conversionIds
      var convList = c.conversionIds || [];
      convList.forEach(function(conv) {
        acc.conversions      += conv.conversions     || 0;
        acc.conversionValue  += conv.conversionValue || 0;
      });

      // Networks: struktura je c.networks.{fulltext|context|video}.{impressions|clicks|totalMoney|avgPosition}
      var nets = c.networks || {};

      var ft = nets.fulltext || {};
      var ftImpr = ft.impressions || 0;
      acc.ft_impressions += ftImpr;
      acc.ft_clicks      += ft.clicks     || 0;
      acc.ft_totalMoney  += ft.totalMoney || 0;
      if ((ft.avgPosition || 0) > 0 && ftImpr > 0) {
        acc.ft_avgPosWeighted += ft.avgPosition * ftImpr;
        acc.ft_avgPosImpr     += ftImpr;
      }

      var ctx = nets.context || {};
      var ctxImpr = ctx.impressions || 0;
      acc.ctx_impressions += ctxImpr;
      acc.ctx_clicks      += ctx.clicks     || 0;
      acc.ctx_totalMoney  += ctx.totalMoney || 0;
      if ((ctx.avgPosition || 0) > 0 && ctxImpr > 0) {
        acc.ctx_avgPosWeighted += ctx.avgPosition * ctxImpr;
        acc.ctx_avgPosImpr     += ctxImpr;
      }

      var vid = nets.video || {};
      var vidImpr = vid.impressions || 0;
      acc.vid_impressions += vidImpr;
      acc.vid_clicks      += vid.clicks     || 0;
      acc.vid_totalMoney  += vid.totalMoney || 0;
      if ((vid.avgPosition || 0) > 0 && vidImpr > 0) {
        acc.vid_avgPosWeighted += vid.avgPosition * vidImpr;
        acc.vid_avgPosImpr     += vidImpr;
      }
    });

    // Vypočtené metriky s guard proti dělení nulou
    var totalMoneyKc      = acc.totalMoney * 0.01;
    var conversionValueKc = acc.conversionValue * 0.01;

    return {
      acc_date:               dateStr || '',

      acc_impressions:        acc.impressions,
      acc_clicks:             acc.clicks,
      acc_ctr:                acc.impressions > 0 ? acc.clicks / acc.impressions : 0,
      acc_totalMoney_kc:      totalMoneyKc,
      acc_avgCpc_kc:          acc.clicks > 0 ? totalMoneyKc / acc.clicks : 0,
      acc_avgPosition:        acc.avgPosImpr > 0 ? acc.avgPosWeighted / acc.avgPosImpr : 0,

      acc_conversions:        acc.conversions,
      acc_conversionValue_kc: conversionValueKc,
      acc_conversionPrice_kc: acc.conversions > 0 ? totalMoneyKc / acc.conversions : 0,
      acc_conversionRatio:    acc.clicks > 0 ? acc.conversions / acc.clicks : 0,
      acc_pno:                conversionValueKc > 0 ? (totalMoneyKc / conversionValueKc) * 100 : 0,

      // Fulltext
      acc_ft_impressions:     acc.ft_impressions,
      acc_ft_clicks:          acc.ft_clicks,
      acc_ft_totalMoney_kc:   acc.ft_totalMoney * 0.01,
      acc_ft_avgPosition:     acc.ft_avgPosImpr > 0 ? acc.ft_avgPosWeighted / acc.ft_avgPosImpr : 0,

      // Context
      acc_ctx_impressions:    acc.ctx_impressions,
      acc_ctx_clicks:         acc.ctx_clicks,
      acc_ctx_totalMoney_kc:  acc.ctx_totalMoney * 0.01,
      acc_ctx_avgPosition:    acc.ctx_avgPosImpr > 0 ? acc.ctx_avgPosWeighted / acc.ctx_avgPosImpr : 0,

      // Video
      acc_vid_impressions:    acc.vid_impressions,
      acc_vid_clicks:         acc.vid_clicks,
      acc_vid_totalMoney_kc:  acc.vid_totalMoney * 0.01,
      acc_vid_avgPosition:    acc.vid_avgPosImpr > 0 ? acc.vid_avgPosWeighted / acc.vid_avgPosImpr : 0
    };
  };

  this.getDataFromApi = function() {
    var user = new UserApi(this.Root.fenixToken, this.Root.userId, this.Root.Log);

    var isDaily = this.Root.displayColumns['account'].indexOf('date') !== -1;
    var daysCount = _dateDiff(this.Root.startDate, this.Root.endDate);

    // Denní rozpad — validace rozsahu
    if (isDaily && daysCount > 31) {
      DataStudioApp.createCommunityConnector()
        .newUserError()
        .setText('Denní rozpad účtu je dostupný pouze pro období do 31 dní. Zkraťte rozsah dat nebo odeberte dimenzi "Účet: Datum".')
        .setDebugText('acc_ daily granularity requested with ' + daysCount + ' days (max 31) — startDate=' + this.Root.startDate + ' endDate=' + this.Root.endDate)
        .throwException();
      return [];
    }

    // Denní loop: pro každý den zavolej fetchCampaigns a agreguj
    if (isDaily) {
      var rows = [];
      for (var i = 0; i < daysCount; i++) {
        var dayStr = _addDays(this.Root.startDate, i);
        // Rate limiting mezi dny (stejně jako fetchAll mezi stránkami)
        if (i > 0) { Utilities.sleep(250); }

        var dayCampaigns = fetchCampaigns(user, dayStr, dayStr, [], [], this.Root.ignoreDeleted);
        // Pro dny s 0 kampaněmi (svátek, nová kampaň) přidáme řádek s nulovými metrikami.
        var row = this.aggregateCampaigns(dayCampaigns || [], _toGdsDate(dayStr));
        rows.push(row);
      }
      this.Root.Log.addRecord('Fenix účet: denní rozpad ' + rows.length + ' dní (' + this.Root.startDate + ' → ' + this.Root.endDate + ')', true, 'AccFenixClass.getDataFromApi');
      return rows;
    }

    // Výchozí chování — jeden řádek za celé období
    var campaigns = fetchCampaigns(user, this.Root.startDate, this.Root.endDate, [], [], this.Root.ignoreDeleted);

    if (!campaigns || campaigns.length === 0) {
      this.Root.Log.addRecord('Fenix účet: API vrátilo prázdný výsledek', true, 'AccFenixClass.getDataFromApi');
      return [];
    }

    var singleRow = this.aggregateCampaigns(campaigns, '');
    this.Root.Log.addRecord('Fenix účet: agregováno ' + campaigns.length + ' kampaní do 1 řádku', true, 'AccFenixClass.getDataFromApi');
    return [singleRow];
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
