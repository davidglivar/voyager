/**
 * @file voyager.js Exported methods for voyager in a node environment.
 * @module {Object} voyager
 */

/**
 * Module dependencies
 */
var Pinwheel = require('pinwheel')({ mark: '⚡' })
  , Promise = require('es6-promise').Promise;
require('colors');

/**
 * Helper function to extend defaults
 * @private
 * @param {Object} original - The object to be augmented
 * @returns {Object}
 */
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

  /**
   * Namespace for registered tasks
   * @member {Object}
   * @private
   */
  _tasks: {}

  /**
   * Registers a task in the _tasks namespace. Tasks are automatically wrapped
   * in a Promise for chained execution.
   * @method
   * @public
   * @param {string} key - The name under which this task will be registered
   * @param {Function} func - The task definition
   * @param {Object} [options={}] - Options for this task
   * @returns {Promise}
   */
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

  /**
   * Run a registered task
   * @method
   * @public
   * @param {string} task - The task to run
   */
, run: function (task) {
    return this._tasks[task].call(this);
  }
};
