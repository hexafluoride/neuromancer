var color = require("irc-colors");
var request = require("request");
var core;

var debug = false;

var wolfram = {
  commands: ["wa"],

  wa: function (from, to, message) {
    var url = 'http://api.wolframalpha.com/v2/query?appid=VTRKXL-A9P5Y769P5&format=plaintext&podindex=1,2,3&input=' + encodeURIComponent(message);

    if(debug) {
      console.log(url);
    }

    request(url, function (e, r, b) {
      if(debug) {
        console.log(b);
      }
      if (b.match(/success=.false./)) {
        core.say(from, to, '[\u000304Wolfram\u000f] \u000304Couldn\'t display answer');
        return;
      }
      var res = b.match(/<plaintext>[\s\S]*?<\/plaintext>/g).reduce(function (x, y) {
        return (y.replace(/<\/?plaintext>/g, '')) ? x.concat(y.replace(/<\/?plaintext>/g, '').replace(/ +/g, ' ').replace(/&apos;/g, '\'').replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/ \| /g, ' ▶ ').replace(/\n/g, ' | ')) : x;
      }, [])
      core.say(from, to, '[\u000304Wolfram\u000f] \u000310' + res[0] + '\u000f = \u000312' + res[1]);
      return;
    });
    return;
  },
};

module.exports = {
  load: function (_core) {
    core = _core;
  },

  unload: function () {
    delete wolfram;
    delete core;
    delete color;
    delete request;
  },

  commands: wolfram.commands,
  run: function (command, from, to, message) {
    if (debug) {
      console.log("command " + message + " from " + from + " in " + to);
    }
    wolfram[command](from, to, message);
  },
};
