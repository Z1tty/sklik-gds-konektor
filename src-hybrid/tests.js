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
 * This file is dedicated to some elementery test of GDS script 
 * It is mixed of Units and Integrations test
 * No special system in 
 * Main test base on real testing of new features 
 */

function testing () {
  //this.testLogger = new testLogger();
  //this.testApi = new testApi();
  //this.testApi.test();
  //this.testGetData = new testGetData();
  //this.testGetData.test();
}


var request = { configParams : {
                  allowEmptyStatistics:'', debugmode:true, userId:263956, logmode:true, token:"0x577ab56fd48c736e1d9457b9af11c74640c662ee84097c57bd173917cda3b4f2ca45f-stejskal.roman@firma.seznam.cz"}, 
               dateRange: {
                 endDate:"2019-06-06", startDate:"2019-02-01"}, 
               scriptParams:{lastRefresh:1559900882042}, 
               fields:
                 [{name:"kwc_impressions"}, {name:"monthly"}]};


var testGetData = function() {
  this.test = function() {
    this.test_getData();
  }
  
  this.test_getData = function() {
    getData(request);
  }
}

var testApi = function () {

  this.test = function () {
    this.Root = new Root(false, false, false, false);
    this.Root.Log = this.Log = new GetDataLog(true, true);
    this.Root.Log.setup();
    //this.test_makeExp();
  }
  this.test_makeExp = function () {
    console.log('start test_makeExp');
    var param = [
      {
  "session": "11XGe2wvFlWUTYIIAW_8CVl_uNT7Pfta0JsIw9S4qqi0Wgj6eDjCjUwP0YJCghcUxQIPM-MLTZ9SwxZA1seRRBWUxdSV1skXlhLDgcWRFMbWVlVTwIcMzgxYmMzZDM0QxQWBjMyMmQ3", "userId": 123
      },
      {
        "dateFrom": "2019-05-31",
        "dateTo": "2019-05-31",
        "statisticsConditions": [
          {
            "columnName": "clickMoney",
            "intValue": 10000,
            "operator": "GTE"
          }
        ]
      },
      {
        "includeCurrentDayStats": true,
        "statGranularity": "total"
      }
    ];

    var resp = this.Root.sklikApiCall('groups.createReport', param, 0)
    console.log(resp);
  }
}



// ########################## Logger test
var testLogger = function () {

  /**
   * Enable logging into file
   * @param {GetDataLog}
   */
  this.Log;

  this.test = function () {
    this.Log = new GetDataLog(true, true);
    this.Log.setup();
    
    try {
      this.test_Record();
    } catch (exp) {
      console.log('Logger - test_Record');
      console.log(exp);
    }

    try {
      this.test_Value();
    } catch (exp) {
      console.log('Logger - test_Value');
      console.log(exp);
    }

    try {
      this.test_Debug();
    } catch (exp) {
      console.log('Logger - test_Debug');
      console.log(exp);
    }
  }
  
  this.test_Record = function () {
      this.Log.addRecord('\n ##### test Record');
      this.Log.addRecord('Test string (visible if debug is off)', false, 'Logger.test_Record()');
      this.Log.addRecord('Test string (visible only when debug is on', true, 'Logger.test_Record()');
      var tooLongString = '';
      for(var i = 0; i < 10055; i++) {
        if(i > 10000) {
          tooLongString += '!'
        } else {
          tooLongString += 'a'
        }
      }
      this.Log.addRecord(tooLongString);
  }

  this.test_Value = function () {
    this.Log.addValue('\n ##### test Value');
    this.Log.addValue('Test string (visible if debug is off)', false, 'Logger.test_Value()');
    this.Log.addValue('Test string (visible only when debug is on', true, 'Logger.test_Value()');
      var tooLongString = '';
      for(var i = 0; i < 10055; i++) {
        if(i > 10000) {
          tooLongString += '!'
        } else {
          tooLongString += 'a'
        }
      }
    this.Log.addValue(tooLongString);
    this.Log.addValue(true, true, 'Logger.test_Value()');
    this.Log.addValue({t:1, b:2, c:"alfa"}, true, 'Logger.test_Value()');
  }

  this.test_Debug = function () {
    this.Log.addDebug('\n ##### test Debug');
    this.Log.addDebug('Test string (visible if debug is off)', 'Logger.test_Debug()');
    this.Log.addDebug(true, 'Logger.test_Debug()');
    this.Log.addDebug({t:1, b:2, c:"alfa"}, 'Logger.test_Debug()');
  }
}





