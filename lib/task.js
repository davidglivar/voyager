/**
 * Module dependencies
 */
var path = require('path')
  , Pinwheel = require('pinwheel')({ mark: '⚡' })
  , Promise = require('es6-promise').Promise
  , vfs = require('vinyl-fs');

var phases = ['read', 'write', 'build']
  , CWD = process.env.ENV === 'test' ? process.cwd() + '/test/project' : process.cwd()
  , BLD = path.join(CWD, 'build')
  , DEV = path.join(CWD, '.dev')
  , SRC = path.join(CWD, 'src');

/**
 * Task constructor, wraps task function and stores information about the task
 * @constructor
 * @param {string} phase - The phase under which this task is to be run
 * @param {string} [name='anonymous'] - The unique identifier for this task
 * @param {Function} func - The task function to be called
 */
function Task(phase, name, func) {
  if (typeof name === 'function') {
    func = name;
    name = 'anonymous';
  }

  if (phases.indexOf(phase) < 0) {
    throw new Error('Phase ' + phase + ' is not valid.');
  }

  if (typeof func !== 'function') {
    throw new TypeError('Expected function, got ' + typeof func);
  }

  /**
   * The unique identifier for this task
   * @member {string}
   * @public
   */
  this.name = name;

  /**
   * The phase under which this task is to be run
   * @member {string}
   * @public
   */
  this.phase = phase;

  /**
   * The wrapped task function (func)
   * @member {Function}
   * @public
   * @returns Promise
   */
  this.func = function () {
    var wheel = new Pinwheel('TASK: '+this.name+' ('+this.phase+')')
      , task = this;
    return new Promise(function (done, fail) {
      if (process.env.ENV !== 'test') wheel.start();
      func.call(task, function (err) {
        if (err) return fail(err);
        return done();
      });
    })
    .then(function () {
      if (process.env.ENV !== 'test') wheel.stop();
    })
    .catch(function (err) {
      if (process.env.ENV !== 'test') wheel.stop(err);
      return console.error(err);
    });
  };
}

/**
 * Wrapper around vinyl-fs#dest. Prefixes destination folder with proper
 * directory based on task phase
 * @method
 * @public
 * @param {string} dest - The destination directory
 * @param {Object} options - Same options that are passed to vinyl-fs#dest
 * @returns Stream
 */
Task.prototype.out = function (dest, options) {
  var root = this.phase === 'build' ? BLD : DEV;
  dest = dest || root;
  options = options || {};
  return vfs.dest(dest, { cwd: options.cwd || root });
};

/**
 * Wrapper around vinyl-fs#src. Prefixes patterns with proper base based on
 * task phase
 * @method
 * @public
 * @param {Array|string} globs - The lookup globs/patterns
 * @param {Object} options - Same options that are passed to vinyl-fs#src
 * @returns Stream
 */
Task.prototype.src = function (globs, options) {
  options = options || {};
  var root = this.phase === 'build' ? DEV : SRC;
  return vfs.src(globs, { cwd: options.cwd || root });
};

/**
 * Array containing all Task instances
 * @member {Array}
 * @static
 */
Task.collection = [];

/**
 * Adds a Task to the collection
 * @method
 * @static
 * @param {Task} t - The task to be added to the collection
 */
Task.add = function (t) {
  if (!(t instanceof Task)) {
    throw new Error('Argument is not a Task');
  }
  Task.collection.push(t);
};

/**
 * Filters the collection of tasks given an array of names and phases. Tasks
 * are sorted but phase priority.
 * @method
 * @static
 * @param {Array} arr - An array of task names/phases
 * @returns Array
 */
Task.filter = function (arr) {
  arr = Array.isArray(arr) ? arr : [arr];
  var i = 0
    , l = arr.length
    , queue = [];
  for (i; i < l; i++) {
    var id = 'name';
    if (phases.indexOf(arr[i]) >= 0) {
      id = 'phase';
    }
    queue = queue.concat(this.get(id, arr[i]));
  }
  return queue.sort(function (a, b) {
    if (phases.indexOf(a.phase) < phases.indexOf(b.phase)) {
      return -1;
    }
    return 1;
  });
};

/**
 * Checks the task collection for a task with a given phase and name. Returns
 * the index of the found task or -1 if not found.
 * @method
 * @static
 * @param {string} phase - The phase of the task to find
 * @param {string} name - The name of the task to find
 * @returns number
 */
Task.find = function (phase, name) {
  var i = 0
    , l = Task.collection.length;
  for (i; i < l; i++) {
    var t = Task.collection[i];
    if (t.phase === phase && t.name === name) {
      return i;
    }
  }
  return -1;
};

/**
 * Returns an array of Tasks from the collection given an key and its value
 * @method
 * @static
 * @param {string} key - The identifier to query on: 'phase' or 'name'
 * @param {string} value - The name associated with the key, ex: 'read'
 *  or a task named 'scripts'
 * @returns Array
 */
Task.get = function (key, value) {
  var i = 0
    , l = Task.collection.length
    , arr = [];
  for (i; i < l; i++) {
    var t = Task.collection[i];
    if (t[key] === value) {
      arr.push(t);
    }
  }
  return arr;
};

/**
 * Replaces a Task at a given index with a new Task
 * @method
 * @static
 * @param {number} idx - The index of the task in the collection
 * @param {Task} t - The new task to insert in the collection
 */
Task.replace = function (idx, t) {
  Task.collection.splice(idx, 1, t);
};

module.exports = Task;
