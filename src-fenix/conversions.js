/*
Sklik Fenix connector for Google Data Studio
Copyright (C) 2026 Seznam.cz, a.s.
Author: Josef Matoušek
*/

// GET /sklik/event-measurement/conversions/
var CONVERSION_ATTRS = ['id', 'name', 'description', 'value', 'semEventName', 'isDeleted'];

/**
 * GET /sklik/event-measurement/conversions/
 * Fetches conversion definitions (lookup table — no statistics).
 * @param {UserApi} userApi
 * @param {boolean} ignoreDeleted
 * @return {Array}
 */
function fetchConversions(userApi, ignoreDeleted) {
  var params = { 'a': CONVERSION_ATTRS };
  if (ignoreDeleted) { params['isDeleted'] = 'false'; }
  try {
    var items = userApi.http.fetchAll('/sklik/event-measurement/conversions/', params);
    userApi.Log.addRecord('Fenix konverze: načteno ' + items.length + ' definic', false, 'fetchConversions');
    if (items.length > 0) {
      userApi.Log.addRecord('Fenix konverze: first item = ' + JSON.stringify(items[0]), false, 'fetchConversions');
    }
    return items;
  } catch (e) {
    userApi.Log.addRecord('Fenix konverze: chyba API: ' + e.message, true, 'fetchConversions');
    return [];
  }
}

/**
 * GDS entity class for Fenix conversion definitions.
 * Returns a flat lookup table — one row per conversion definition.
 * @param {Root} rRoot
 */
var ConversionsFenixClass = function(rRoot) {
  this.Root = rRoot;

  this.getDataFromApi = function() {
    var user = new UserApi(this.Root.fenixToken, this.Root.userId, this.Root.Log);
    var conversions = fetchConversions(user, this.Root.ignoreDeleted);

    if (!conversions || conversions.length === 0) {
      this.Root.Log.addRecord('Fenix konverze: API vrátilo prázdný výsledek', true, 'ConversionsFenixClass.getDataFromApi');
      return [];
    }

    var rows = conversions.map(function(c) {
      return {
        cvf_convId:          c.id,
        cvf_convName:        c.name        || '',
        cvf_convDescription: c.description || '',
        cvf_convValue:       c.value       || 0,
        cvf_semEventName:    c.semEventName || '',
        cvf_isDeleted:       c.isDeleted ? 'true' : 'false'
      };
    });

    this.Root.Log.addRecord('Fenix konverze: načteno ' + rows.length + ' definic', true, 'ConversionsFenixClass.getDataFromApi');
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
