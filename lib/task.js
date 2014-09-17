var path = require('path')
  , Pinwheel = require('pinwheel')({ mark: '⚡' })
  , Promise = require('es6-promise').Promise
  , vfs = require('vinyl-fs');

var allowed = ['read', 'write', 'build']
  , CWD = process.cwd()
  , BLD = path.join(CWD, 'build')
  , DEV = path.join(CWD, '.dev')
  , SRC = path.join(CWD, 'src');

function Task(phase, name, func) {
  if (typeof name === 'function') {
    func = name;
    name = 'anonymous';
  }

  if (allowed.indexOf(phase) < 0) {
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
  options = options || {};
  var root = this.phase === 'build' ? BLD : DEV;
  return vfs.dest(dest, { cwd: options.cwd || root });
};

Task.prototype.src = function (globs, options) {
  options = options || {};
  var root = this.phase === 'build' ? DEV : SRC;
  return vfs.src(globs, { cwd: options.cwd || root });
};

module.exports = Task;
