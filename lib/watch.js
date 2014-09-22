/**
 * Module dependencies
 */
var path = require('path')
  , Promise = require('es6-promise').Promise
  , Task = require('./task')
  , vfs = require('vinyl-fs');

var CWD = process.env.ENV === 'test' ? process.cwd() + '/test/project' : process.cwd()
  , BLD = path.join(CWD, 'build')
  , DEV = path.join(CWD, '.dev')
  , SRC = path.join(CWD, 'src');

/**
 * Watch constructor, stores tasks to be run on given patterns
 * @constructor
 * @param {Array} patterns - The patterns/globs of this instance
 * @param {Array} ids - Array of tasks identifiers to be run on these patterns
 */
function Watch(patterns, ids) {
  if (typeof patterns === 'undefined') {
    throw new Error('Watch constructor requires a patterns argument');
  }
  if (typeof ids === 'undefined') {
    throw new Error('Watch constructor requires an ids argument');
  }

  patterns = Array.isArray(patterns) ? patterns : [patterns];
  ids = Array.isArray(ids) ? ids : [ids];

  /**
   * The patterns/globs to be watched
   * @member {Array}
   * @public
   */
  this.patterns = patterns;

  /**
   * Registered tasks namespace
   * @member {Object}
   * @public
   */
  this.tasks = {

    /**
     * All 'read' phase tasks associated with this watch
     * @property {Array}
     * @public
     */
    read: []

    /**
     * A single 'write' task associated with this watch
     * @property {Task}
     */
  , write: null
  };
  
  // add the initial set of tasks
  this.add(ids);
}

/**
 * Adds/replaces tasks to this watch instance. Tasks are stored in the instances
 * tasks property
 * @method
 * @public
 * @param {Array} ids - An array of task phases/names to add to this pattern set
 */
Watch.prototype.add = function (ids) {
  var tasks = Task.filter(ids);
  for (var i = 0, l = tasks.length; i < l; i++) {
    var t = tasks[i];
    if (t.phase === 'read') {
      if (this.tasks.read.indexOf(t) < 0) {
        this.tasks.read.push(t);
      }
    } else if (t.phase === 'write') {
      this.tasks.write = t;
    }
  }
};

/**
 * Runs all tasks associated with this watch instance, which starts the pattern
 * watch via vinyl-fs#watch
 * @method
 * @public
 */
Watch.prototype.start = function () {
  var self = this;
  vfs.watch(this.patterns, { cwd: SRC }, function () {
    if (self.tasks.read.length) {
      return self.tasks.read.reduce(function (a, b) {
        return a.then(b.func.call(b));
      }, Promise.resolve())
      .then(function () {
        if (self.tasks.write) {
          return self.tasks.write.func();
        }
      });
    } else if (self.tasks.write) {
      return self.tasks.write.func();
    }
  });
};

/**
 * Array containing all Watch instances
 * @member {Array}
 * @static
 */
Watch.collection = [];

/**
 * Adds a Watch instance to the collection
 * @method
 * @static
 * @param {Watch} w - The watch to be added to the collection
 */
Watch.add = function (w) {
  if (!(w instanceof Watch)) {
    throw new TypeError('Expected Watch instance, got: ' + typeof w);
  }
  Watch.collection.push(w);
};

/**
 * Returns the watch instance which contains the given patterns. Given patterns
 * must be of the same array length and contain the same patterns as the Watch
 * instance being queried, order of patterns is not important.
 * @method
 * @static
 * @param {Array} patterns - The patterns to be use for the query
 * @returns Watch
 */
Watch.find = function (patterns) {
  if (!Array.isArray(patterns)) {
    throw new TypeError('Expected array, got: ' + typeof patterns);
  }
  var found = [];
  Watch.collection.forEach(function (watch) {
    if (watch.patterns.length === patterns.length) {
      var isEqual = true; 
      watch.patterns.forEach(function (pattern) {
        if (patterns.indexOf(pattern) < 0) {
          isEqual = false;
          return;
        }
      });
      if (isEqual) {
        found.push(watch);
      }
    }
  });
  if (found.length > 1) {
    throw new Error('Multiple watch instances with the same patterns');
  } else if (found.length === 1) {
    return found[0];
  }
  return false;
};

module.exports = Watch;
