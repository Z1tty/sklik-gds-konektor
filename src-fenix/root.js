/*
Sklik Fenix connector for Google Data Studio
Copyright (C) 2026 Seznam.cz, a.s.
Author: Josef Matoušek
*/

var Root = function (rConfigParams, sklikDataSchema, rFields, rDateRange) {
  this.config = rConfigParams;

  this.fenixToken = (this.config.fenixToken && this.config.fenixToken.trim().length > 0)
    ? this.config.fenixToken.trim()
    : undefined;

  this.userId = (this.config.userId && this.config.userId.trim().length > 0)
    ? parseInt(this.config.userId.trim())
    : undefined;

  this.premiseId = (this.config.premiseId && this.config.premiseId.trim().length > 0)
    ? parseInt(this.config.premiseId.trim())
    : null;

  this.sklikDataSchema = sklikDataSchema;
  this.fields = rFields;
  this.rDataSchema = [];
  this.date = rDateRange;
  this.eDate;
  this.sDate;
  this.endDate;
  this.startDate;
  this.timeline = [];
  this.Log;
  this.data = [];
  this.campaignsTypes = [];
  this.campaignsId = [];
  this.groupsId = [];
  this.loadFromGroups = false;
  this.granularity = 'total';
  this.ignoreDeleted = this.config.ignoreDeleted === true || this.config.ignoreDeleted === 'true';

  this.displayColumns = {
    'campaigns': [],
    'groups': [],
    'conversions': [],
    'ads': [],
    'account': []
  };
  this.types = { 'cgf': 'campaigns', 'gof': 'groups', /* 'cvf': 'conversions', */ /* 'adf': 'ads', */ 'acc': 'account' };

  this.periods = ['Daily', 'Weekly', 'Monthly', 'Quarterly', 'Yearly'];

  this.setup = function () {
    try {
      this.Log = new GetDataLog(this.config.logmode, this.config.debugmode);
      this.Log.setup();
    } catch (exp) {
      console.error({ 'location': 'Root.setup', 'err': exp });
      return false;
    }
    this.Log.addHeader('Nastavení vstupních dat / Config', 2, '', true);
    var cnf = JSON.parse(JSON.stringify(this.config));
    if (cnf.fenixToken) { cnf.fenixToken = cnf.fenixToken.substr(0, 15) + '..shorted'; }
    this.Log.addJson(cnf, true, { 'file': 'root', 'func': 'setup', 'line': 49 });
    this.Log.addJson(this.fields, true, { 'file': 'root', 'func': 'setup', 'line': 50 });
    this.Log.addJson(this.date, true);

    try {
      if (this.config.campaignsTypes != undefined && this.config.campaignsTypes != '') {
        this.campaignsTypes = this.config.campaignsTypes.split(',');
      }
      if (this.config.campaignsId != undefined && this.config.campaignsId != '' && this.config.campaignsId != ',') {
        var stringCampaignsId = this.config.campaignsId.split(',');
        for (var i = 0; i < stringCampaignsId.length; i++) {
          var id = parseInt(stringCampaignsId[i]);
          if (!isNaN(id)) { this.campaignsId.push(id); }
        }
      }
      if (this.config.groupsId != undefined && this.config.groupsId != '' && this.config.groupsId != ',') {
        var stringGroupsId = this.config.groupsId.split(',');
        for (var i = 0; i < stringGroupsId.length; i++) {
          var id = parseInt(stringGroupsId[i]);
          if (!isNaN(id)) { this.groupsId.push(id); }
        }
        this.loadFromGroups = true;
      }
    } catch (err) {
      console.error({ 'location': 'Root.setup', 'err': err });
      this.Log.addHeader('Neočekávaná chyba při načítání configu', 2, 'negative');
      this.Log.addRecord(JSON.stringify(err));
      return false;
    }
  }

  this.load = function () {
    this.Log.addHeader('Získávání dat', 1, 'positive');
    if (this.validateToken()) {
      if (this.parseDataRequest()) {
        this.setupDate();
        return this.loadData();
      }
    }
  }

  this.validateToken = function () {
    this.Log.addHeader('Validace Fenix tokenu', 2, 'positive');
    if (!this.fenixToken) {
      DataStudioApp.createCommunityConnector()
        .newUserError()
        .setText('Vyplňte prosím Fenix API token v nastavení konektoru.')
        .setDebugText('fenixToken is empty or missing')
        .throwException();
      return false;
    }
    if (!this.userId) {
      try {
        var tempUser = new UserApi(this.fenixToken, null, this.Log);
        var me = tempUser.getMe();
        if (!me || !me.userId) { throw new Error('/user/me response missing userId: ' + JSON.stringify(me)); }
        this.userId = me.userId;
        this.Log.addRecord('Fenix: userId auto-resolved z /user/me → ' + this.userId, true, 'Root.validateToken');
      } catch (e) {
        DataStudioApp.createCommunityConnector()
          .newUserError()
          .setText('Nepodařilo se automaticky zjistit UserId přes Fenix API. Zkontrolujte platnost Fenix tokenu, nebo zadejte UserId ručně.')
          .setDebugText('Auto-resolve userId failed: ' + e.message)
          .throwException();
        return false;
      }
    }
    this.Log.addCaption('Fenix token OK, userId=' + this.userId);
    return true;
  }

  this.parseDataRequest = function () {
    this.Log.addHeader('Výběr dat pro stahování', 2, 'positive', true);
    this.fields.forEach(function (field) {
      for (var i = 0; i < this.sklikDataSchema.length; i++) {
        if (this.sklikDataSchema[i].name === field.name) {
          this.rDataSchema.push(this.sklikDataSchema[i]);

          if (
            this.sklikDataSchema[i].semantics &&
            this.sklikDataSchema[i].semantics.conceptType == 'DIMENSION' &&
            this.sklikDataSchema[i].group == 'granularity'
          ) {
            this.granularity = this.sklikDataSchema[i].name;
          }

          var s = this.sklikDataSchema[i].name.split('_');
          if (this.types[s[0]] != undefined) {
            this.displayColumns[this.types[s[0]]].push(s[1]);
          }
        }
      }
    }, this);
    this.Log.addJson(this.displayColumns, true);
    return true;
  }

  this.setupDate = function () {
    var monthIncrease = function (original) {
      var inc = parseInt(original) + 1;
      return inc < 10 ? '0' + inc : inc;
    };
    var day2d = function (original) {
      return original < 10 ? '0' + original : original;
    };

    try {
      if (this.date && this.date.endDate) {
        var parts = this.date.endDate.split('-');
        this.eDate = new Date(parts[0], parts[1] - 1, parts[2]);
      } else {
        this.eDate = new Date();
        this.eDate.setUTCDate(this.eDate.getUTCDate() - 1);
      }
      this.endDate = this.eDate.getFullYear() + '-' + monthIncrease(this.eDate.getMonth()) + '-' + day2d(this.eDate.getDate());

      if (this.date && this.date.startDate) {
        var parts = this.date.startDate.split('-');
        this.sDate = new Date(parts[0], parts[1] - 1, parts[2]);
      } else {
        this.sDate = new Date();
        this.sDate.setUTCDate(this.sDate.getUTCDate() - 7);
      }
      this.startDate = this.sDate.getFullYear() + '-' + monthIncrease(this.sDate.getMonth()) + '-' + day2d(this.sDate.getDate());
      this.Log.addRecord('Datum od: ' + this.startDate + ' do: ' + this.endDate);
    } catch (ext) {
      this.Log.addHeader('Neočekávaná chyba', 2, 'negative');
      this.Log.addRecord('Chyba při převodu data: ' + ext);
    }
  }

  this.loadData = function () {
    this.Log.addHeader('Začátek stahování dat z Fenix API', 2, 'positive', true);

    var selectedEntity;
    if (this.displayColumns['campaigns'].length > 0) {
      selectedEntity = 'campaigns';
    } else if (this.displayColumns['groups'].length > 0) {
      selectedEntity = 'groups';
    // cvf (conversions) entity hidden — uncomment to re-enable
    // } else if (this.displayColumns['conversions'].length > 0) {
    //   selectedEntity = 'conversions';
    // adf (ads) entity hidden — 3-level nested API calls too slow for GDS timeout
    // } else if (this.displayColumns['ads'].length > 0) {
    //   selectedEntity = 'ads';
    } else if (this.displayColumns['account'].length > 0) {
      selectedEntity = 'account';
    } else {
      this.Log.addHeader('Žádná Fenix pole nebyla vybrána', 2, 'negative');
      return false;
    }

    this.Log.addRecord('Bude se načítat report: ' + selectedEntity);

    var instance;
    if (selectedEntity === 'campaigns') {
      instance = new CampaignsFenixClass(this);
    } else if (selectedEntity === 'groups') {
      instance = new GroupsFenixClass(this);
    // } else if (selectedEntity === 'conversions') {
    //   instance = new ConversionsFenixClass(this);
    // } else if (selectedEntity === 'ads') {
    //   instance = new AdsFenixClass(this);
    } else {
      instance = new AccFenixClass(this);
    }

    // Account entity řeší denní granularitu sama v getDataFromApi() (loopování přes dny).
    // Ostatní entity nemají podporu granularity — hodíme UserError.
    if (this.granularity !== 'total' && selectedEntity !== 'account') {
      DataStudioApp.createCommunityConnector()
        .newUserError()
        .setText('Časová granularita (Po dnech / Po týdnech / …) není Fenix API podporována. Odeberte dimenzi granularity z reportu a použijte pouze agregovaná data.')
        .setDebugText('granularity field selected: ' + this.granularity + ' — Fenix API does not support statisticsGranularity on /sklik/* endpoints')
        .throwException();
      return false;
    }

    var response = instance.getDataFromApi();
    if (response) {
      instance.convertDataToGDS(response);
    }
    return true;
  }

  this.setupDaysCycle = function (period) {
    var dayCounter = this.sDate;
    var dayInString = '';
    var startLoop = true;
    try {
      while (dayCounter.getTime() <= this.eDate.getTime()) {
        var correctMonth = dayCounter.getMonth() + 1;
        if (correctMonth < 10) { correctMonth = '0' + correctMonth; }
        if (period == 'weekly' && startLoop) {
          startLoop = false;
          dayCounter = new Date(dayCounter.setDate(dayCounter.getDate() - dayCounter.getDay() + 1));
        }
        var correctDay = dayCounter.getDate();
        if (correctDay < 10) { correctDay = '0' + correctDay; }
        if (period == 'daily') {
          dayInString = dayCounter.getFullYear() + '' + correctMonth + '' + correctDay;
          dayCounter = new Date(dayCounter.setUTCDate(dayCounter.getUTCDate() + 1));
        }
        if (period == 'weekly') {
          dayInString = dayCounter.getFullYear() + '' + correctMonth + '' + correctDay;
          dayCounter = new Date(dayCounter.setDate(dayCounter.getDate() + (7 - dayCounter.getDay()) + 1));
        }
        if (period == 'monthly') {
          dayInString = dayCounter.getFullYear() + '' + correctMonth;
          dayCounter = new Date(dayCounter.setUTCMonth(dayCounter.getUTCMonth() + 1));
        }
        if (period == 'quarterly') {
          dayInString = '';
          var increase = 1;
          if (dayCounter.getMonth() >= 9) {
            dayInString = dayCounter.getFullYear() + '10'; increase = 12 - dayCounter.getMonth();
          } else if (dayCounter.getMonth() >= 6) {
            dayInString = dayCounter.getFullYear() + '07'; increase = 9 - dayCounter.getMonth();
          } else if (dayCounter.getMonth() >= 3) {
            dayInString = dayCounter.getFullYear() + '04'; increase = 6 - dayCounter.getMonth();
          } else {
            dayInString = dayCounter.getFullYear() + '01'; increase = 3 - dayCounter.getMonth();
          }
          dayCounter = new Date(dayCounter.setUTCMonth(dayCounter.getUTCMonth() + increase));
        }
        if (period == 'yearly') {
          dayInString = dayCounter.getFullYear().toString();
          dayCounter = new Date(dayCounter.setUTCFullYear(dayCounter.getUTCFullYear() + 1));
        }
        this.timeline.push(dayInString);
      }
    } catch (exp) {
      this.Log.addHeader('Neočekávaná chyba', 2, 'negative');
      this.Log.addRecord('Chyba při přípravě časového rozpadu: ' + exp);
    }
    return this.timeline.length;
  }

  this.getDataSchema = function () {
    return this.rDataSchema;
  }

  this.getData = function () {
    this.Log.addHeader('Vložení dat do tabulky', 1, 'positive', true);
    this.Log.addJson(this.data, true);
    if (this.data.length == 0) {
      this.Log.addHeader('Neočekávaná chyba', 2, 'negative');
      this.Log.addCaption('Nebyly nalezeny žádné data');
    }
    return this.data;
  }

  this.getWeek = function (date) {
    var nDay = (date.getDay() + 6) % 7;
    date.setDate(date.getDate() - nDay + 3);
    var n1stThursday = date.valueOf();
    date.setMonth(0, 1);
    if (date.getDay() !== 4) {
      date.setMonth(0, 1 + ((4 - date.getDay()) + 7) % 7);
    }
    return 1 + Math.ceil((n1stThursday - date) / 604800000);
  }
}
