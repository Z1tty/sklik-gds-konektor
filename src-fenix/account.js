/*
Sklik Fenix connector for Google Data Studio
Copyright (C) 2026 Seznam.cz, a.s.
Author: Josef Matoušek
*/

/**
 * GDS entity class for Fenix account-level aggregate.
 *
 * Fenix API zatím nemá /sklik/account/stats/ endpoint, takže interně voláme
 * fetchCampaigns() (bez filtrů) a agregujeme všechny kampaně do JEDNOHO řádku
 * reprezentujícího celý účet za dané období.
 *
 * Až Fenix endpoint dodá, stačí vyměnit vnitřní logiku getDataFromApi() —
 * schéma i convertDataToGDS() zůstane beze změny.
 *
 * @param {Root} rRoot
 */
var AccFenixClass = function(rRoot) {
  this.Root = rRoot;

  this.getDataFromApi = function() {
    var user = new UserApi(this.Root.fenixToken, this.Root.userId, this.Root.Log);

    // Vždy načítáme VŠECHNY kampaně účtu (bez id/type filtrů) — accountový agregát.
    var campaigns = fetchCampaigns(user, this.Root.startDate, this.Root.endDate, [], [], this.Root.ignoreDeleted);

    if (!campaigns || campaigns.length === 0) {
      this.Root.Log.addRecord('Fenix účet: API vrátilo prázdný výsledek', true, 'AccFenixClass.getDataFromApi');
      return [];
    }

    // Agregační akumulátory
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

    campaigns.forEach(function(c) {
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

    var row = {
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

    this.Root.Log.addRecord('Fenix účet: agregováno ' + campaigns.length + ' kampaní do 1 řádku', true, 'AccFenixClass.getDataFromApi');
    return [row];
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
