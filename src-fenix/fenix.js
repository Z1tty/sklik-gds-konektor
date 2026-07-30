/*
Sklik Fenix connector for Google Data Studio
Copyright (C) 2026 Seznam.cz, a.s.
Author: Josef Matoušek
*/

/**
 * Base HTTP client for Fenix API (https://api.sklik.cz/v1).
 * Handles request serialization, 401 token refresh, 429 rate-limit backoff, pagination.
 * Does NOT own the token — token is provided via getTokenFn callback (owned by UserApi).
 *
 * @param {function} getTokenFn  Callback () => string — returns a valid Bearer token.
 *                               Called before every request; UserApi caches the token internally.
 * @param {GetDataLog} Log
 */
var FenixClient = function(getTokenFn, Log) {
  this.getTokenFn = getTokenFn;
  this.Log = Log;
  this.BASE_URL = 'https://api.sklik.cz/v1';
  this.PAGE_LIMIT = 1000;

  /** Returns a fresh (or cached) Bearer token via the provided callback. */
  this.getToken = function() {
    return this.getTokenFn();
  };

  /**
   * Serializes queryParams into a query string.
   * Array values are expanded as repeated keys: a=x&a=y
   */
  this._buildQs = function(queryParams, extraParts) {
    var parts = extraParts || [];
    for (var key in queryParams) {
      var val = queryParams[key];
      if (Array.isArray(val)) {
        for (var i = 0; i < val.length; i++) {
          parts.push(encodeURIComponent(key) + '=' + encodeURIComponent(val[i]));
        }
      } else {
        parts.push(encodeURIComponent(key) + '=' + encodeURIComponent(val));
      }
    }
    return parts.join('&');
  };

  /**
   * Performs a single GET request. Returns the parsed response body.
   * Handles 401 (token refresh) and 429 (rate-limit backoff).
   * @param {string} path
   * @param {Object} queryParams
   * @param {number} [retryCount]
   * @return {Object}
   */
  this.fetchOne = function(path, queryParams, retryCount) {
    var url = this.BASE_URL + path + (queryParams ? '?' + this._buildQs(queryParams) : '');
    this.Log.addRecord('Fenix GET ' + url, true, 'FenixClient.fetchOne');

    var token = this.getTokenFn();
    var doRequest = function(t) {
      try {
        return UrlFetchApp.fetch(url, {
          method: 'get',
          headers: { 'Authorization': 'Bearer ' + t },
          muteHttpExceptions: true
        });
      } catch (e) {
        throw new Error('Fenix API nedostupné (' + e.message + '): ' + url);
      }
    };

    var response = doRequest(token);
    var code = response.getResponseCode();

    if (code === 401) {
      this.Log.addRecord('Fenix: token expiroval, obnovuji', true, 'FenixClient.fetchOne');
      response = doRequest(this.getTokenFn(true));
      code = response.getResponseCode();
    }

    if (code === 429) {
      retryCount = retryCount || 0;
      if (retryCount < 3) {
        var headers = response.getHeaders();
        var waitMs = (headers['Retry-After'] || headers['retry-after'])
          ? parseInt(headers['Retry-After'] || headers['retry-after']) * 1000
          : Math.pow(2, retryCount + 1) * 1000;
        this.Log.addRecord('Fenix: rate limit, čekám ' + (waitMs / 1000) + 's (pokus ' + (retryCount + 1) + '/3)', true, 'FenixClient.fetchOne');
        Utilities.sleep(waitMs);
        return this.fetchOne(path, queryParams, retryCount + 1);
      }
    }

    if (code !== 200) {
      throw new Error('Fenix API HTTP ' + code + ': ' + response.getContentText());
    }
    return JSON.parse(response.getContentText());
  };

  /**
   * Fetches one page of a paginated endpoint.
   * @param {string} path
   * @param {Object} queryParams
   * @param {number} offset
   * @param {number} [retryCount]
   * @return {Object} parsed response body
   */
  this.fetchPage = function(path, queryParams, offset, retryCount) {
    var qs = this._buildQs(queryParams, ['offset=' + offset, 'limit=' + this.PAGE_LIMIT]);
    var url = this.BASE_URL + path + '?' + qs;
    this.Log.addRecord('Fenix GET ' + url, true, 'FenixClient.fetchPage');

    var token = this.getTokenFn();
    var doRequest = function(t) {
      try {
        return UrlFetchApp.fetch(url, {
          method: 'get',
          headers: { 'Authorization': 'Bearer ' + t },
          muteHttpExceptions: true
        });
      } catch (e) {
        throw new Error('Fenix API nedostupné (' + e.message + '): ' + url);
      }
    };

    var response = doRequest(token);
    var code = response.getResponseCode();

    if (code === 401) {
      this.Log.addRecord('Fenix: token expiroval, obnovuji', true, 'FenixClient.fetchPage');
      response = doRequest(this.getTokenFn(true));
      code = response.getResponseCode();
    }

    if (code === 429) {
      retryCount = retryCount || 0;
      if (retryCount < 3) {
        var headers = response.getHeaders();
        var waitMs = (headers['Retry-After'] || headers['retry-after'])
          ? parseInt(headers['Retry-After'] || headers['retry-after']) * 1000
          : Math.pow(2, retryCount + 1) * 1000;
        this.Log.addRecord('Fenix: rate limit, čekám ' + (waitMs / 1000) + 's (pokus ' + (retryCount + 1) + '/3)', true, 'FenixClient.fetchPage');
        Utilities.sleep(waitMs);
        return this.fetchPage(path, queryParams, offset, retryCount + 1);
      }
    }

    if (code !== 200) {
      this.Log.addRecord('Fenix API chyba HTTP ' + code + ': ' + response.getContentText(), true, 'FenixClient.fetchPage');
      throw new Error('Fenix API HTTP ' + code + ': ' + response.getContentText());
    }

    return JSON.parse(response.getContentText());
  };

  /**
   * Fetches all pages from a paginated endpoint (auto-paginates until items < PAGE_LIMIT).
   * @param {string} path
   * @param {Object} queryParams
   * @return {Array}
   */
  this.fetchAll = function(path, queryParams) {
    var allItems = [];
    var offset = 0;
    var items;
    do {
      if (offset > 0) { Utilities.sleep(250); }
      var body = this.fetchPage(path, queryParams, offset);
      items = body.items || [];
      allItems = allItems.concat(items);
      offset += this.PAGE_LIMIT;
    } while (items.length === this.PAGE_LIMIT);
    this.Log.addRecord('Fenix: načteno celkem ' + allItems.length + ' záznamů z ' + path, true, 'FenixClient.fetchAll');
    return allItems;
  };
};
