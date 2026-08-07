/*
Sklik Fenix connector for Google Data Studio
Copyright (C) 2026 Seznam.cz, a.s.
Author: Josef Matoušek
*/

// --- Lokální datum helpery (YYYY-MM-DD / YYYYMMDD / YYYYMM) ---

// 'YYYY-MM-DD' + n dní → 'YYYY-MM-DD' (UTC)
function _addDays(dateStr, n) {
  var parts = String(dateStr).split('-');
  var d = new Date(Date.UTC(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10)));
  d.setUTCDate(d.getUTCDate() + n);
  var y = d.getUTCFullYear();
  var m = d.getUTCMonth() + 1;
  var day = d.getUTCDate();
  return y + '-' + (m < 10 ? '0' + m : m) + '-' + (day < 10 ? '0' + day : day);
}

// Počet dní mezi 'YYYY-MM-DD' a 'YYYY-MM-DD' (inclusive)
function _dateDiff(from, to) {
  var pf = String(from).split('-');
  var pt = String(to).split('-');
  var df = Date.UTC(parseInt(pf[0], 10), parseInt(pf[1], 10) - 1, parseInt(pf[2], 10));
  var dt = Date.UTC(parseInt(pt[0], 10), parseInt(pt[1], 10) - 1, parseInt(pt[2], 10));
  return Math.round((dt - df) / 86400000) + 1;
}

// 'YYYY-MM-DD' → 'YYYYMMDD' (GDS YEAR_MONTH_DAY)
function _toGdsDate(dateStr) {
  return String(dateStr).replace(/-/g, '');
}

// Počet měsíců od startDate do endDate (inclusive, po měsících)
function _monthCount(startDate, endDate) {
  var sp = String(startDate).split('-');
  var ep = String(endDate).split('-');
  var sy = parseInt(sp[0], 10), sm = parseInt(sp[1], 10);
  var ey = parseInt(ep[0], 10), em = parseInt(ep[1], 10);
  return (ey - sy) * 12 + (em - sm) + 1;
}

// Poslední den měsíce: curY, curM (1-indexed) → 'YYYY-MM-DD'
function _monthLastDay(curY, curM) {
  var lastDay = new Date(Date.UTC(curY, curM, 0)).getUTCDate();
  var mStr = curM < 10 ? '0' + curM : '' + curM;
  var dStr = lastDay < 10 ? '0' + lastDay : '' + lastDay;
  return curY + '-' + mStr + '-' + dStr;
}

/**
 * GDS entity class for Fenix account-level aggregate.
 *
 * Dimenze ovlivňují počet vrácených řádků:
 *   Bez dimenzí:              1 řádek (celé období)
 *   Účet: Datum (acc_date):   1 řádek / den (max 31 dní)
 *   Účet: Měsíc (acc_month):  1 řádek / měsíc (max 24 měsíců)
 *   Účet: Síť (acc_network):  3 řádky / období (Fulltext / Obsahová / Video)
 *   Kombinace datum+síť nebo měsíc+síť je podporována (3× více řádků).
 *
 * @param {Root} rRoot
 */
var AccFenixClass = function(rRoot) {
  this.Root = rRoot;

  /**
   * Agreguje pole kampaní. Vrací pole řádků (1 nebo 3 podle isNetwork).
   * @param {Array}   campaigns   raw items z fetchCampaigns()
   * @param {string}  accDate     'YYYYMMDD' nebo ''
   * @param {string}  accMonth    'YYYYMM' nebo ''
   * @param {boolean} isNetwork   true = vrátit 3 řádky per síť (Fulltext / Obsahová / Video)
   * @return {Object[]}
   */
  this.aggregateCampaigns = function(campaigns, accDate, accMonth, isNetwork) {
    var acc = {
      impressions: 0, clicks: 0, totalMoney: 0,
      conversions: 0, conversionValue: 0,
      ft_impressions: 0, ft_clicks: 0, ft_totalMoney: 0,
      ctx_impressions: 0, ctx_clicks: 0, ctx_totalMoney: 0,
      vid_impressions: 0, vid_clicks: 0, vid_totalMoney: 0
    };

    (campaigns || []).forEach(function(c) {
      acc.impressions    += c.impressions || 0;
      acc.clicks         += c.clicks      || 0;
      acc.totalMoney     += c.totalMoney  || 0;

      (c.conversionIds || []).forEach(function(conv) {
        acc.conversions     += conv.conversions     || 0;
        acc.conversionValue += conv.conversionValue || 0;
      });

      var nets = c.networks || {};
      var ft  = nets.fulltext || {};
      var ctx = nets.context  || {};
      var vid = nets.video    || {};
      acc.ft_impressions  += ft.impressions  || 0;
      acc.ft_clicks       += ft.clicks       || 0;
      acc.ft_totalMoney   += ft.totalMoney   || 0;
      acc.ctx_impressions += ctx.impressions || 0;
      acc.ctx_clicks      += ctx.clicks      || 0;
      acc.ctx_totalMoney  += ctx.totalMoney  || 0;
      acc.vid_impressions += vid.impressions || 0;
      acc.vid_clicks      += vid.clicks      || 0;
      acc.vid_totalMoney  += vid.totalMoney  || 0;
    });

    var totalMoneyKc      = acc.totalMoney      * 0.01;
    var convValueKc       = acc.conversionValue * 0.01;

    if (!isNetwork) {
      return [{
        acc_date:               accDate  || '',
        acc_month:              accMonth || '',
        acc_network:            '',
        acc_impressions:        acc.impressions,
        acc_clicks:             acc.clicks,
        acc_ctr:                acc.impressions > 0 ? acc.clicks / acc.impressions : 0,
        acc_totalMoney_kc:      totalMoneyKc,
        acc_avgCpc_kc:          acc.clicks > 0 ? totalMoneyKc / acc.clicks : 0,
        acc_conversions:        acc.conversions,
        acc_conversionValue_kc: convValueKc,
        acc_conversionPrice_kc: acc.conversions > 0 ? totalMoneyKc / acc.conversions : 0,
        acc_conversionRatio:    acc.clicks > 0 ? acc.conversions / acc.clicks : 0,
        acc_pno:                convValueKc > 0 ? (totalMoneyKc / convValueKc) * 100 : 0,
        acc_ft_impressions:     acc.ft_impressions,
        acc_ft_clicks:          acc.ft_clicks,
        acc_ft_totalMoney_kc:   acc.ft_totalMoney  * 0.01,
        acc_ctx_impressions:    acc.ctx_impressions,
        acc_ctx_clicks:         acc.ctx_clicks,
        acc_ctx_totalMoney_kc:  acc.ctx_totalMoney * 0.01,
        acc_vid_impressions:    acc.vid_impressions,
        acc_vid_clicks:         acc.vid_clicks,
        acc_vid_totalMoney_kc:  acc.vid_totalMoney * 0.01
      }];
    }

    // Síťový rozpad: 3 řádky, acc_impressions/clicks/money = per-síť
    var nets = [
      { name: 'Fulltext',  impr: acc.ft_impressions,  clicks: acc.ft_clicks,  money: acc.ft_totalMoney  * 0.01 },
      { name: 'Obsahová',  impr: acc.ctx_impressions, clicks: acc.ctx_clicks, money: acc.ctx_totalMoney * 0.01 },
      { name: 'Video',     impr: acc.vid_impressions, clicks: acc.vid_clicks, money: acc.vid_totalMoney * 0.01 }
    ];
    return nets.map(function(net) {
      return {
        acc_date:               accDate  || '',
        acc_month:              accMonth || '',
        acc_network:            net.name,
        acc_impressions:        net.impr,
        acc_clicks:             net.clicks,
        acc_ctr:                net.impr > 0 ? net.clicks / net.impr : 0,
        acc_totalMoney_kc:      net.money,
        acc_avgCpc_kc:          net.clicks > 0 ? net.money / net.clicks : 0,
        acc_conversions:        0,
        acc_conversionValue_kc: 0,
        acc_conversionPrice_kc: 0,
        acc_conversionRatio:    0,
        acc_pno:                0,
        acc_ft_impressions:     net.name === 'Fulltext' ? net.impr  : 0,
        acc_ft_clicks:          net.name === 'Fulltext' ? net.clicks : 0,
        acc_ft_totalMoney_kc:   net.name === 'Fulltext' ? net.money  : 0,
        acc_ctx_impressions:    net.name === 'Obsahová' ? net.impr  : 0,
        acc_ctx_clicks:         net.name === 'Obsahová' ? net.clicks : 0,
        acc_ctx_totalMoney_kc:  net.name === 'Obsahová' ? net.money  : 0,
        acc_vid_impressions:    net.name === 'Video'    ? net.impr  : 0,
        acc_vid_clicks:         net.name === 'Video'    ? net.clicks : 0,
        acc_vid_totalMoney_kc:  net.name === 'Video'    ? net.money  : 0
      };
    });
  };

  this.getDataFromApi = function() {
    var user = new UserApi(this.Root.fenixToken, this.Root.userId, this.Root.Log);
    var cols  = this.Root.displayColumns['account'];

    var isDaily   = cols.indexOf('date')    !== -1;
    var isMonthly = cols.indexOf('month')   !== -1;
    var isNetwork = cols.indexOf('network') !== -1;

    var allRows = [];

    // ── Denní rozpad ─────────────────────────────────────────
    if (isDaily) {
      var daysCount = _dateDiff(this.Root.startDate, this.Root.endDate);
      if (daysCount > 31) {
        DataStudioApp.createCommunityConnector()
          .newUserError()
          .setText('Denní rozpad účtu je dostupný pouze pro období do 31 dní. Zkraťte rozsah dat nebo odeberte dimenzi "Účet: Datum".')
          .setDebugText('acc_ daily: ' + daysCount + ' dní (max 31)')
          .throwException();
        return [];
      }
      for (var di = 0; di < daysCount; di++) {
        var dayStr = _addDays(this.Root.startDate, di);
        if (di > 0) { Utilities.sleep(250); }
        var dayCampaigns = fetchCampaigns(user, dayStr, dayStr, [], [], this.Root.ignoreDeleted);
        allRows = allRows.concat(this.aggregateCampaigns(dayCampaigns || [], _toGdsDate(dayStr), '', isNetwork));
      }
      this.Root.Log.addRecord('Fenix účet: denní rozpad ' + daysCount + ' dní → ' + allRows.length + ' řádků', true, 'AccFenixClass');
      return allRows;
    }

    // ── Měsíční rozpad ───────────────────────────────────────
    if (isMonthly) {
      var mCount = _monthCount(this.Root.startDate, this.Root.endDate);
      if (mCount > 24) {
        DataStudioApp.createCommunityConnector()
          .newUserError()
          .setText('Měsíční rozpad účtu je dostupný pouze pro období do 24 měsíců. Zkraťte rozsah dat nebo odeberte dimenzi "Účet: Měsíc".')
          .setDebugText('acc_ monthly: ' + mCount + ' měsíců (max 24)')
          .throwException();
        return [];
      }
      var sp = this.Root.startDate.split('-');
      var curY = parseInt(sp[0], 10), curM = parseInt(sp[1], 10);
      for (var mi = 0; mi < mCount; mi++) {
        var mStr   = curM < 10 ? '0' + curM : '' + curM;
        var mFirst = curY + '-' + mStr + '-01';
        var mLast  = _monthLastDay(curY, curM);
        var accMonth = '' + curY + mStr;
        if (mi > 0) { Utilities.sleep(250); }
        var mCampaigns = fetchCampaigns(user, mFirst, mLast, [], [], this.Root.ignoreDeleted);
        allRows = allRows.concat(this.aggregateCampaigns(mCampaigns || [], '', accMonth, isNetwork));
        curM++;
        if (curM > 12) { curM = 1; curY++; }
      }
      this.Root.Log.addRecord('Fenix účet: měsíční rozpad ' + mCount + ' měsíců → ' + allRows.length + ' řádků', true, 'AccFenixClass');
      return allRows;
    }

    // ── Celkový součet ───────────────────────────────────────
    var campaigns = fetchCampaigns(user, this.Root.startDate, this.Root.endDate, [], [], this.Root.ignoreDeleted);
    if (!campaigns || campaigns.length === 0) {
      this.Root.Log.addRecord('Fenix účet: API vrátilo prázdný výsledek', true, 'AccFenixClass');
      return [];
    }
    allRows = this.aggregateCampaigns(campaigns, '', '', isNetwork);
    this.Root.Log.addRecord('Fenix účet: agregováno ' + campaigns.length + ' kampaní → ' + allRows.length + ' řádků', true, 'AccFenixClass');
    return allRows;
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
