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
    , namespaces: []
    };

function addNS(ns, args) {
  var tasks = []
    , i = 0
    , l = voyager.namespaces_[ns].length;
  for (i; i < l; i++) {
    var t = voyager.namespaces_[ns][i];
    if (typeof voyager.tasks_[t] === 'function') {
      tasks.push(addTask(t, args));
    }
  }
  return tasks;
}

function addTask(id, args) {
  new Promise(function (done, fail) {
    voyager.tasks_[id].call(voyager, args).then(done);
  });
}

var voyager = Object.defineProperties({}, {
  /**
   * Namespace for registered tasks
   * @member {Object}
   * @private
   */
  tasks_: {
    value: {}
  }
, namespaces_: {
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
    value: function (id, ns, func, opts) {
      if (typeof ns === 'function') {
        opts = func || {};
        func = ns;
        ns = 'ns';
      } else {
        opts = opts || {};
      }
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
      // store task id in given namespace
      if (Array.isArray(ns)) {
        for (var i = 0, l = ns.length; i < l; i++) {
          if (!this.namespaces_[ns[i]]) this.namespaces_[ns[i]] = [];
          this.namespaces_[ns[i]].push(id);
        }
      } else {
        if (!this.namespaces_[ns]) this.namespaces_[ns] = [];
        this.namespaces_[ns].push(id);
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
      var args = Array.prototype.slice.call(arguments, 1)
        , tasks = [];
      // array of tasks/namespaces
      if (Array.isArray(id)) {
        var i = 0
          , l = id.length;
        for (i; i < l; i++) {
          // a task
          if (typeof this.tasks_[id[i]] === 'function') {
            tasks.push(addTask(id[i], args));
          // a namespace
          } else if (id[i] in this.namespaces_) {
            tasks = tasks.concat(addNS(id[i], args));
          }
        }
        // run the tasks
        return Promise.all(tasks);
      // a singular task/namespace
      } else {
        // a task
        if (typeof this.tasks_[id] === 'function') {
          return this.tasks_[id].call(this, args);
        // a namespace
        } else if (id in this.namespaces_) {
          tasks = tasks.concat(addNS(id, args));
          // run all tasks
          return Promise.all(tasks);
        }
        // no tasks/namespaces found
        return false;
      }
    }  
  }
});

module.exports = voyager;
