var Pinwheel = require('pinwheel')({ mark: '⚡' })
  , Promise = require('es6-promise').Promise;

require('colors');

function extend(original) {
  var sources = Array.prototype.slice.call(arguments, 1);
  sources.forEach(function (src) {
    for (var key in src) {
      if (src.hasOwnProperty(key)) {
        original[key] = src[key];
      }
    }
  });
  return original;
}

module.exports = {
  _tasks: []
, task: function (key, func, options) {
    options = extend({
      spin: true
    }, options || {});

    var self = this;

    this._tasks[key] = function () {
      var start = Date.now()
        , wheel;

      if (options.spin) {
        wheel = new Pinwheel('TASK: ' + key);
        wheel.start();
      } else {
        console.log('starting ' + key.grey + '...');
      }

      return new Promise(function (resolve, reject) {
        func.call(self, function (err) {
          if (err) return reject(err);
          return resolve();
        });
      }).then(function () {
        if (wheel) return wheel.stop();
        return console.log(
          'finished ' + key.green + ' ' + ((Date.now() - start) + 'ms').grey
        );
      })['catch'](function (err) {
        if (wheel) {
          wheel.stop();
        } else {
          console.log(
            'ERROR'.inverse.red + ' ' + key.red + ' ' 
          + ((Date.now() - start) + 'ms').grey
          );
        }
        return console.error(err);
      });
    };
  }
, run: function (task) {
    return this._tasks[task].call(this);
  }
};
