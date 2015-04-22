var color = require("irc-colors");
var request = require("request");
var parseArgs = require("minimist");
var debug = false;
var core;

var weather = {
  commands: ["weather", "forecast"],

  locAPI:   'http://query.yahooapis.com/v1/public/yql?format=json&q=select%20*%20from%20geo.placefinder%20where%20text=%22',

  weathAPI: 'http://api.openweathermap.org/data/2.5/',

  //TODO: clean this up and make it more readable
  worker: function(from, to, message, forecast) {
    var args = parseArgs(message.split(' '), opts = {
      boolean: ['c', 'i'],
    });

    // if it's a forecast then strip the -n from the message now so it doesn't mess with other stuff
    if (forecast) {
      var days = message.match(/-[1-7]/) ? message.match(/-[1-7]/)[0].slice(1) : '3';
      message = message.replace(/ ?-[0-9]+ ?/, ' ');
    }
    if (args.f) {
      var days = args.f;
    }

    if (args.c) {
      var locale = ['metric', 'C', 'm/s'];
      core.databases.weather[from.toLowerCase()].locale = ['metric', 'C', 'm/s'];
    } else if (args.i){
      core.databases.weather[from.toLowerCase()].locale = ['imperial', 'F', 'mph'];
    }

    if (args._[0]) { // if they're setting a new location
      // get the lat+long for the location
      request(weather.locAPI2 + args._.join('%20') + "%22", function(e, r, body) {
        var data = JSON.parse(body).query;
        var locate = (data.count > 1) ? data.results.Result[0] : data.results.Result;
        // and save it to the db
        core.databases.weather[from.toLowerCase()].locate = locate;
        core.write_db("weather");
      });
    }

    if (days) { // if it's a forecast
      request(weather.weathAPI + 'forecast/daily?cnt=' + days + '&units=' + locale[0] + '&lat=' + core.databases.weather[from.toLowerCase()].locate.latitude + '&lon=' + core.databases.weather[from.toLowerCase()].locate.longitude, function(e, r, body) {
        var daily = JSON.parse(body);

        core.say(from, to, 'Forecast for \u000310' + (core.databases.weather[from.toLowerCase()].locate.line2 || core.databases.weather[from.toLowerCase()].locate.country || core.databases.weather[from.toLowerCase()].locate.name) + '\u000f (\u000311' + daily.city.country + '\u000f)');

        daily.list.forEach(function(day, index) {
          // this is gross I know
          var to_say = (new Date(day.dt * 1000).toString().slice(0, 3)) + ': \u000304' + day.temp.min.toFixed(1) + '°' + locale[1] + '\u000f - \u000305' + day.temp.max.toFixed(1) + '°' + locale[1] + ' \u000307' + day.humidity + '% humidity \u000311' + day.speed.toFixed(1) + locale[2] + ' wind\u000f (\u000306' + day.weather[0].main + '\u000f)';

          core.say(from, to, to_say);
        });
      });
    } else {
      // this is even worse
      request(weather.weathAPI + 'weather?units=' + core.databases.weather[from.toLowerCase()].locale[0] + '&lat=' + core.databases.weather[from.toLowerCase()].locate.latitude + '&lon=' + core.databases.weather[from.toLowerCase()].locate.longitude, function(e, r, body) {
        var weath = JSON.parse(body);
        var to_say = from + ': [\u000310' + (core.databases.weather[from.toLowerCase()].locate.line2 || core.databases.weather[from.toLowerCase()].locate.country || core.databases.weather[from.toLowerCase()].locate.name) + '\u000f (\u000311' + weath.sys.country + '\u000f)] [\u000304' + weath.main.temp + '°' + core.databases.weather[from.toLowerCase()].locale[1] + '\u000f (\u000307' + weath.main.humidity + '% humidity\u000f)] [\u000311Wind: ' + weath.wind.speed + ' ' + core.databases.weather[from.toLowerCase()].locale[2] + ' at ' + weath.wind.deg + '°\u000f] [\u000306' + weath.weather[0].description.charAt(0).toUpperCase() + weath.weather[0].description.slice(1) + '\u000f]';

        core.say(from, to, to_say);
      });
    }
  }

  weather: function(from, to, message) {
    weather.worker(from, to, message, false);
  },

  forecast: function(from, to, message) {
    weather.worker(from, to, message, true);
  }
};

module.exports = {
  load: function(_core) {
    core = _core;
  },

  unload: function(core) {
    delete weather;
    delete core;
    delete request;
    delete color;
  },

  commands: weather.commands,
  db: true,
  run: function(command, from, to, message) {
    weather[command](from, to, message);
  },
};
