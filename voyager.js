/**
 * @file voyager.js Exported methods for voyager in a node environment.
 * @module {Object} voyager
 */

/**
 * Module dependencies
 */
var colors = require('colors')
  , Pinwheel = require('pinwheel')({ mark: '⚡' })
  , Promise = require('es6-promise').Promise

  , defaults = {
      spin: false
    };

var voyager = Object.defineProperties({}, {
  /**
   * Namespace for registered tasks
   * @member {Object}
   * @private
   */
  tasks_: {
    value: {}
  }
, CWD: {
    value: process.cwd()
  }
, TMP: {
    value: this.CWD + '/.dev'
  }
, SRC: {
    value: this.CWD + '/src'
  }
  /**
   * Registers a task in the _tasks namespace. Tasks are automatically wrapped
   * in a Promise for chained execution.
   * @method
   * @public
   * @param {string} key - The name under which this task will be registered
   * @param {Function} func - The task definition
   * @param {Object} [opts={}] - Options for this task
   * @returns {Promise}
   */
, task: {
    value: function (id, func, opts) {
      opts = opts || {};
      var options = {}
        , key
        , start = Date.now()
        , wheel = new Pinwheel('TASK: ' + id);
      // extend default options
      for (key in defaults) {
        var v = defaults[key];
        if (opts.hasOwnProperty(key)) {
          v = opts[key];
        }
        options[key] = v;
      }
      // register the task
      this.tasks_[id] = function () {
        if (options.spin) {
          wheel.start();
        } else {
          console.log('starting ' + id.grey + '...');
        }
        var args = Array.prototype.slice.call(arguments);
        return new Promise(function (resolve, reject) {
          func.call(voyager, function (err) {
            if (err) return reject(err);
            return resolve();
          }, args);
        }).then(function () {
          if (options.spin) return wheel.stop();
          return console.log(
            'finished ' + id.green + ' ' + ((Date.now() - start) + 'ms').grey
          );
        })['catch'](function (err) {
          if (options.spin) {
            wheel.stop(err);
          } else {
            console.log(
              'ERROR'.inverse.red + ' ' + id.red + ' ' 
            + ((Date.now() - start) + 'ms').grey
            );
          }
          return console.error(err);
        });
      };
    }
  }

  /**
   * Run a registered task
   * @method
   * @public
   * @param {string} task - The task to run
   */
, run: {
    value: function (id) {
      var args = Array.prototype.slice.call(arguments, 1);
      return this.tasks_[id].call(this, args);
    }  
  }
});

module.exports = voyager;
