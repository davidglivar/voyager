/**
 * @file voyager.js Exported methods for voyager in a node environment.
 * @module {Object} voyager
 */

/**
 * Module dependencies
 */
var colors = require('colors')
  , del = require('del')
  , Pinwheel = require('pinwheel')({ mark: '⚡' })
  , Promise = require('es6-promise').Promise
  , requireDir = require('require-dir')

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
, BLD: {
    value: this.CWD + '/build'
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

, loadTasks_: {
    value: function () {
      // load default tasks
      requireDir('./tasks');
      // load installed voyager tasks
      require('gulp-load-plugins')({ pattern: ['voyager-*'] });
      // try loading any user defined tasks
      try {
        requireDir(this.CWD + '/tasks');
      } catch (e) {
        console.log(e);
      }
    }
  }

, build: {
    value: function (done) {
      done = done || function () {};
      this.loadTasks_();
      this.clean()
        .then(this.run.bind(this, ['prebuild', 'build']))
        .then(done);
    }
  }

, clean: {
    value: function () {
      return new Promise(function (done, fail) {
        del([voyager.TMP, voyager.BLD], done);
      });
    }
  }

, start: {
    value: function (done) {
      done = done || function () {};
      this.loadTasks_();
      this.clean()
        .then(this.run.bind(this, ['prebuild', 'serve', 'watch']))
        .then(done);
    }
  }

  /**
   * Registers a task in the _tasks namespace. Tasks are automatically wrapped
   * in a Promise for chained execution.
   * @method
   * @public
   * @param {string} id - The name under which this task will be registered
   * @param {string|Array} ns - Namespace(s) this task belongs to
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
      if (ns.indexOf('watch') > 0 || ns === 'watch') options.spin = false;
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
      }
      throw new Error(id + ' is neither a registered task or namespace.');
    }  
  }
});

module.exports = voyager;
