/*
Sklik connector for Google Data Studio
Copyright (C) 2018 Seznam.cz, a.s.

This library is free software; you can redistribute it and/or
modify it under the terms of the GNU Lesser General Public
License as published by the Free Software Foundation; either
version 2.1 of the License, or (at your option) any later version.
This library is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public
License along with this library; if not, write to the Free Software
Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA  02111-1307  USA

Seznam.cz, a.s.
Radlická 3294/10, Praha 5, 15000, Czech Republic
http://www.seznam.cz, or contact: https://napoveda.sklik.cz/casto-kladene-dotazy/kontaktni-formular/
*/

/**
 * Logger class that outputs to Cloud Logging (Stackdriver) via console.log.
 * Replaces the previous DocumentApp-based logger to eliminate auth/documents and auth/drive scopes.
 * Logs are visible in Google Cloud Console for the Apps Script project.
 *
 * @param {Boolean} logMode - setup basic logger
 * @param {Boolean} debugMode - extended logger (include api calls dumps, columns detail etc.)
 */
var GetDataLog = function (logMode, debugMode) {

  /**
   * In code is special record messages dedicated only for debug (step by step)
   * If this const is true, will be recorded into log file
   */
  const ERROR_DEBUG = true;

  /**
   * Request ID for correlating log entries from a single request
   * @var {String}
   */
  this.requestId = Utilities.getUuid().substring(0, 8);

  if (logMode == undefined || logMode == 'True' || logMode == 'true' || logMode === true) {
    this.logMode = true;
  } else {
    this.logMode = false;
  }
  if (debugMode == 'True' || debugMode == 'true' || debugMode === true) {
    this.debugMode = true;
  } else {
    this.debugMode = false;
  }

  /**
   * Format log prefix with request ID
   * @return {String}
   */
  this.prefix = function () {
    return '[req:' + this.requestId + ']';
  }

  /**
   * Called at start of loading data
   */
  this.setup = function () {
    if (this.logMode || this.debugMode) {
      var d = new Date();
      this.addHeader('Začátek scriptu', 1);
      this.addInfo('Čas spuštění scriptu: ' + d.toString());
      this.addHeader('Nastavení', 1);

      this.addHeader('Nastavení logování', 2);
      if (this.logMode) {
        this.addInfo('Log mode: zapnutý');
      } else {
        this.addInfo('Log mode: vypnutý');
      }
      if (this.debugMode) {
        this.addInfo('Debug mode: zapnutý');
      } else {
        this.addInfo('Debug mode: vypnutý');
      }
    }
  }

  /**
   * Add new logger message
   * @param {String} text - message to logger
   * @param {Boolean} debug - will save only if is debug mode enabled
   * @param {Object|String} location - source of logger message
   */
  this.addRecord = function (text, debug, location) {
    if (this.canAddMessage(debug)) {
      if (typeof text === 'string' && text.length > 2000) {
        text = text.substr(0, 2000);
        text += ' #### Record was shorted ### ';
      }
      console.log(this.prefix(), text);
      if (location) {
        this.addLocation(location);
      }
    }
  }

  /**
   * Dump one value
   * @param {Mixed} value - message to logger
   * @param {Boolean} debug - will save only if is debug mode enabled
   * @param {String} location - source of logger message
   */
  this.addValue = function (value, debug, location) {
    if (this.canAddMessage(debug)) {
      if (typeof value == "object") {
        value = JSON.stringify(value);
      }

      if (typeof value === 'string' && value.length > 2000) {
        value = value.substr(0, 2000);
        value += ' #### Record was shorted ### ';
      }
      if (location) {
        console.log(this.prefix(), value, '[' + location + ']');
      } else {
        console.log(this.prefix(), value);
      }
    }
  }

  /**
   * Special debug messages (for solving problems)
   * @param {String} text - message to logger
   * @param {Object|String} location - source of logger message
   * @param {Mixed} params -
   */
  this.addDebug = function (text, location, params) {
    if (ERROR_DEBUG && this.canAddMessage(true)) {
      if (typeof text === 'string' && text.length > 2000) {
        text = text.substr(0, 2000);
        text += ' #### Record was shorted ### ';
      }
      var locationStr = '';
      if (location != undefined) {
        if (typeof location == 'object') {
          locationStr = ' @ ' + location.file + '.' + location.func + ':' + location.line;
        } else {
          locationStr = ' @ ' + location;
        }
      }
      console.log(this.prefix(), '[DEBUG]', text + locationStr);

      if (params != undefined) {
        if (typeof params == "object") {
          params = JSON.stringify(params);
        }
        if (typeof params === 'string' && params.length > 2000) {
          params = params.substr(0, 2000);
          params += ' #### Record was shorted ### ';
        }
        console.log(this.prefix(), '[DEBUG]', params);
      }
    }
  }

  /**
   * Check if this message can be added
   * @param {Boolean} debug - debug mode is enabled
   * @return {Boolean} - True (text is add to output)
   */
  this.canAddMessage = function (debug) {
    return (this.logMode && (debug == undefined || this.debugMode === debug));
  }

  this.addJson = function (text, debug) {
    if (!this.canAddMessage(debug)) {
      return;
    }
    var json_parse = JSON.stringify(text, null, 2);
    var maxLength = 1000;
    if (json_parse.length > maxLength) {
      json_parse = json_parse.substring(0, maxLength) + ' #### Record was shortened ####';
    }
    console.log(this.prefix(), json_parse);
  }

  this.addLocation = function (location) {
    if (this.canAddMessage()) {
      if (typeof location == 'object') {
        console.log(this.prefix(), '@ ' + location.file + '.' + location.func + ':' + location.line);
      } else {
        console.log(this.prefix(), '@ ' + location);
      }
    }
  }

  this.addHeader = function (text, level, type, debug) {
    if (this.canAddMessage(debug)) {
      var prefix = '[H' + (level || 1) + ']';
      if (type === 'negative') {
        console.warn(this.prefix(), prefix, text);
      } else {
        console.log(this.prefix(), prefix, text);
      }
    }
  }

  this.addCaption = function (text, debug, location) {
    if (this.canAddMessage(debug)) {
      console.log(this.prefix(), '**', text, '**');
      if (location) {
        this.addLocation(location);
      }
    }
  }

  /**
   * Add new logger message
   * @param {String} text - message to logger
   */
  this.addInfo = function (text) {
    if (this.canAddMessage()) {
      console.log(this.prefix(), text);
    }
  }

  this.addNewLine = function () {
    // No-op for console logging
  }
}
