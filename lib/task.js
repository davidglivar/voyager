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

  this.name = name;

  this.phase = phase;

  this.func = function () {
    var wheel = new Pinwheel('TASK: ' + this.name)
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

Task.prototype.out = function (dest, options) {
  var root = this.phase === 'build' ? BLD : DEV;
  dest = dest || root;
  options = options || {};
  return vfs.dest(dest, { cwd: options.cwd || root });
};

Task.prototype.src = function (globs, options) {
  options = options || {};
  var root = this.phase === 'build' ? DEV : SRC;
  return vfs.src(globs, { cwd: options.cwd || root });
};

Task.collection = [];

Task.add = function (t) {
  Task.collection.push(t);
};

Task.filter = function (arr) {
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

Task.get = function (id, name) {
  var i = 0
    , l = Task.collection.length
    , arr = [];
  for (i; i < l; i++) {
    var t = Task.collection[i];
    if (t[id] === name) {
      arr.push(t);
    }
  }
  return arr;
};

Task.replace = function (idx, t) {
  Task.collection.splice(idx, 1, t);
};

module.exports = Task;
