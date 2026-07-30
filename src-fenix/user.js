/*
Sklik Fenix connector for Google Data Studio
Copyright (C) 2026 Seznam.cz, a.s.
Author: Josef Matoušek
*/

/**
 * Fenix /user/ API endpoints.
 * Owns the refresh token and access token lifecycle (caching).
 * Creates and exposes this.http (FenixClient) for use by entity modules.
 *
 * Endpoints:
 *   POST /user/token       — Get Access Token
 *   GET  /user/me          — Get authorized user
 *   GET  /user/me/credit   — Get information about user credit
 *
 * @param {string}     fenixToken  Refresh token (Sklik → Nástroje → API přístup → Fenix token)
 * @param {number}     userId      Sklik userId; omit for own account
 * @param {GetDataLog} Log
 */
var UserApi = function(fenixToken, userId, Log) {
  this.fenixToken = fenixToken;
  this.userId = userId || null;
  this.Log = Log;
  this._cacheKey = 'fenix_token_' + (userId || 'self');

  var self = this;
  this.http = new FenixClient(function(forceRefresh) { return self.getAccessToken(forceRefresh); }, Log);

  /**
   * POST /user/token
   * Returns a short-lived Bearer access token. Cached for 55 min (TTL = 1 hour).
   * @return {string}
   */
  this.getAccessToken = function(forceRefresh) {
    var cache = CacheService.getScriptCache();
    if (!forceRefresh) {
      var cached = cache.get(this._cacheKey);
      if (cached) {
        this.Log.addRecord('Fenix: access token načten z cache', true, 'UserApi.getAccessToken');
        return cached;
      }
    } else {
      cache.remove(this._cacheKey);
      this.Log.addRecord('Fenix: cache tokenu smazána (force refresh)', true, 'UserApi.getAccessToken');
    }

    this.Log.addRecord('Fenix: získávám access token', true, 'UserApi.getAccessToken');
    var payload = { 'grant_type': 'refresh_token', 'refresh_token': this.fenixToken };
    if (this.userId) { payload['user_id'] = String(this.userId); }

    var response = UrlFetchApp.fetch(this.http.BASE_URL + '/user/token', {
      method: 'post',
      payload: payload,
      muteHttpExceptions: true
    });

    var code = response.getResponseCode();
    var body;
    try { body = JSON.parse(response.getContentText()); } catch(e) { body = {}; }

    if (code !== 200 || !body.access_token) {
      this.Log.addRecord('Fenix auth selhal, HTTP ' + code + ': ' + response.getContentText(), true, 'UserApi.getAccessToken');
      DataStudioApp.createCommunityConnector()
        .newUserError()
        .setText('Nepodařilo se přihlásit přes Fenix API. Zkontrolujte prosím Fenix token.')
        .setDebugText('Fenix POST /user/token HTTP ' + code + ': ' + response.getContentText())
        .throwException();
    }

    cache.put(this._cacheKey, body.access_token, 3300);
    this.Log.addRecord('Fenix: access token uložen do cache (3300s)', true, 'UserApi.getAccessToken');
    return body.access_token;
  };

  /**
   * GET /user/me
   * @return {Object}
   */
  this.getMe = function() {
    return this.http.fetchOne('/user/me');
  };

  /**
   * GET /user/me/credit
   * @return {Object}
   */
  this.getUserCredit = function() {
    return this.http.fetchOne('/user/me/credit');
  };
};
