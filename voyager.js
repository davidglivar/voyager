/**
 * @file voyager.js Exported methods for voyager in a node environment.
 * @module {Object} voyager
 */

/**
 * Module dependencies
 */
var colors = require('colors')
  , del = require('del')
  , fs = require('graceful-fs')
  , path = require('path')
  , Pinwheel = require('pinwheel')({ mark: '⚡' })
  , Promise = require('es6-promise').Promise
  , requireDir = require('require-dir')
  , vfs = require('vinyl-fs')

  , defaults = {
      spin: true
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
  return Promise.resolve(tasks);
}

function addTask(id, args) {
  new Promise(function (done, fail) {
    voyager.tasks_[id].call(voyager, args).then(done);
  });
}

/**
 * Exported voyager namespace
 * @namespace
 */
var voyager = Object.defineProperties({}, {

  /**
   * Immutable string representing the build path
   * @member {string}
   * @public
   */
  BLD: {
    value: process.cwd() + '/build'
  }

  /**
   * Immutable string representing the current working directory
   * @member {string}
   * @public
   */
, CWD: {
    value: process.cwd()
  }

  /**
   * Immutable string represeting the tempory build path
   * @member {string}
   * @public
   */
, TMP: {
    value: process.cwd() + '/.dev'
  }

  /**
   * Immutable string representing the source directory path
   * @member {string}
   * @public
   */
, SRC: {
    value: process.cwd() + '/src'
  }

});

/**
 * Namespace for task namespaces
 * @member {Object}
 * @private
 */
voyager.namespaces_ = {};

/**
 * Namespace for registered tasks
 * @member {Object}
 * @private
 */
voyager.tasks_ = {};

/**
 * Attempts to load all known voyager tasks. Order is as follows:
 * 1) Default internal voyager tasks
 * 2) voyager-* tasks installed via npm
 * 3) User defined tasks within voyager application
 * @method
 * @private
 */
voyager.loadTasks_ = function () {
  // load default tasks
  requireDir('./tasks');

  // load installed voyager tasks
  var pkg = JSON.parse(fs.readFileSync(this.CWD + '/package.json', { encoding: 'utf8' }))
    , scopes = ['dependencies', 'devDependencies'];
  for (var i = 0, l = scopes.length; i < l; i++) {
    if (pkg[scopes[i]]) {
      for (var key in pkg[scopes[i]]) {
        if (/^voyager\-/.test(key)) {
          require(this.CWD + '/node_modules/' + key)(this);
        }
      }
    }
  }

  // try loading any user defined tasks
  try {
    requireDir(this.CWD + '/tasks');
  } catch (e) {
    if (e.errno !== 34) {
      console.log(e);
    }
  }
};

/**
 * Creates a production ready build
 * Runs prebuild, build
 * @method
 * @public
 * @param {Function} [done=function(){}] - Optional callback
 */
voyager.build = function (done) {
  done = done || function () {};
  this.loadTasks_();
  this.clean()
    .then(this.run.bind(this, ['read', 'transform', 'write', 'build']))
    .then(done);
};

/**
 * Cleans both the build and prebuild directories
 * @method
 * @public
 * @returns {Promise}
 */
voyager.clean = function () {
  return new Promise(function (done, fail) {
    del([voyager.TMP, voyager.BLD], done);
  });
};

voyager.dest = function (out, options) {
  return vfs.dest(out, options);
};

voyager.in = function (paths) {
  if (!Array.isArray(paths)) paths = [paths];
  paths = paths.map(function (p) {
    return path.relative(voyager.CWD, path.join(voyager.SRC, p));
  });
  return vfs.src(paths);
};

voyager.in.src = function (paths) {
  return voyager.in.call(this, paths);
};

voyager.in.dev = function (paths) {
  if (!Array.isArray(paths)) paths = [paths];
  paths = paths.map(function (p) {
    return path.relative(voyager.CWD, path.join(voyager.TMP, p));
  });
  return vfs.src(paths);
};

voyager.out = function (p) {
  p = p || '';
  return vfs.dest(path.relative(voyager.CWD, path.join(voyager.BLD, p)));
};

voyager.out.bld = function (p) {
  return voyager.out.call(this, p);
};

voyager.out.dev = function (p) {
  p = p || '';
  return vfs.dest(path.relative(voyager.CWD, path.join(voyager.TMP, p)));
};

/**
 * Run a registered task
 * @method
 * @public
 * @param {string|Array} id - The task(s)/namespace(s) to run
 */
voyager.run = function (id) {
  var ids = Array.isArray(id) ? id : [id]
    , tasks = []
    , watches = [];
  ids.forEach(function (name) {
    if (name in voyager.namespaces_) {
      voyager.namespaces_[name].forEach(function (t) {
        if (name === 'watch') {
          watches.push(t);
        } else {
          tasks.push(t);
        }
      });
    } else if (name in voyager.tasks_) {
      tasks.push(name);
    } else {
      console.log('No registered tasks under name ' + name + ', skipping.');
    }
  });
  return tasks.reduce(function (sequence, task) {
    return sequence.then(voyager.tasks_[task].bind(voyager));
  }, Promise.resolve()).then(function () {
    watches.forEach(function (t) {
      voyager.tasks_[t].call(voyager);
    });
  });
};

voyager.src = function (glob, options) {
  return vfs.src(glob, options);
};

/**
 * Builds project into temporary directory and starts a static server
 * Runs prebuild, serve, watch
 * @method
 * @public
 */
voyager.start = function (done) {
  done = done || function () {};
  this.loadTasks_();
  this.clean()
    .then(this.run.bind(this, ['read', 'transform', 'write', 'serve', 'watch']))
    .then(done);
};

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
voyager.task = function (id, ns, func, opts) {
  if (typeof ns === 'function') {
    opts = func || {};
    func = ns;
    ns = 'ns';
  } else {
    opts = opts || {};
  }
  var options = {}
    , key
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
      if (this.namespaces_[ns[i]].indexOf(id) === -1) {
        this.namespaces_[ns[i]].push(id);
      }
    }
  } else {
    if (!this.namespaces_[ns]) this.namespaces_[ns] = [];
    this.namespaces_[ns].push(id);
  }
  // register the task
  this.tasks_[id] = function () {
    var start = Date.now();
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
};

voyager.watch = function (paths, tasks) {
  if (!Array.isArray(paths)) paths = [paths];
  paths = paths.map(function (p) {
    return path.relative(voyager.CWD, path.join(voyager.SRC, p));
  });
  if (typeof tasks === 'undefined') return false;
  if (typeof tasks === 'function') {
    return vfs.watch(paths, tasks);
  }
  return vfs.watch(paths, this.run.bind(this, tasks));
};

module.exports = voyager;
