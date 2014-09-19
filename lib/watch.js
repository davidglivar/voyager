var path = require('path')
  , Promise = require('es6-promise').Promise
  , Task = require('./task')
  , vfs = require('vinyl-fs');

var CWD = process.env.ENV === 'test' ? process.cwd() + '/test/project' : process.cwd()
  , BLD = path.join(CWD, 'build')
  , DEV = path.join(CWD, '.dev')
  , SRC = path.join(CWD, 'src');

function Watch(patterns, ids) {
  if (typeof patterns === 'undefined') {
    throw new Error('Watch constructor requires a patterns argument');
  }
  if (typeof ids === 'undefined') {
    throw new Error('Watch constructor requires an ids argument');
  }

  patterns = Array.isArray(patterns) ? patterns : [patterns];
  ids = Array.isArray(ids) ? ids : [ids];

  this.patterns = patterns;

  this.tasks = {
    read: []
  , write: null
  };
  
  this.add(ids);
}

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

Watch.prototype.start = function () {
  var self = this;
  vfs.watch(this.patterns, { cwd: SRC }, function () {
    if (self.tasks.read.length) {
      return self.tasks.read.reduce(function (a, b) {
        return a.then(b.func.call(b));
      }, Promise.resolve())
      .then(function () {
        if (self.tasks.write) {
          return self.tasks.func.write();
        }
      });
    } else if (self.tasks.write) {
      return self.tasks.write.func();
    }
  });
};

Watch.collection = [];

Watch.add = function (w) {
  Watch.collection.push(w);
};

Watch.find = function (patterns) {
  var found = [];
  Watch.collection.forEach(function (watch) {
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
  });
  if (found.length > 1) {
    throw new Error('Multiple watch instances with the same patterns');
  } else if (found.length === 1) {
    return found[0];
  }
  return false;
};

module.exports = Watch;
