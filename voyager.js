/**
 * Module dependencies
 */
var colors = require('colors')
  , del = require('del')
  , ecstatic = require('ecstatic')
  , fs = require('graceful-fs')
  , http = require('http')
  , path = require('path')
  , Promise = require('es6-promise').Promise
  , Task = require('./lib/task')
  , Watch = require('./lib/watch');

var phases = ['read', 'write', 'build']
  , PORT = process.env.PORT || 3000
  , CWD = process.env.ENV === 'test' ? process.cwd() + '/test/project' : process.cwd()
  , BLD = path.join(CWD, 'build')
  , DEV = path.join(CWD, '.dev')
  , SRC = path.join(CWD, 'src');

function loadTasks() {
  var internals = fs.readdirSync(path.join(__dirname, 'tasks'))
    , externals = null
    , pkgexists = fs.existsSync(path.join(CWD, 'package.json'))
    , scopes = ['dependencies', 'devDependencies'];

  if (fs.exists(path.join(CWD, 'tasks'))) {
    externals = fs.readdirSync(path.join(CWD, 'tasks'));
  }

  internals.forEach(function (f) {
    require(path.join(__dirname, 'tasks', f));
  });

  if (!pkgexists) {
    console.log('No package.json found, skipping.');
  } else {
    var pkg = JSON.parse(fs.readFileSync(path.join(CWD, 'package.json'), { encoding: 'utf8' }));
    scopes.forEach(function (scope) {
      if (pkg[scope]) {
        for (var key in pkg[scope]) {
          if (/^voyager\-/.test(key)) {
            try {
              require(path.join(CWD, 'node_modules', key))(voyager);
            } catch (e) {
              console.log(e);
            }
          }
        }
      }
    });
  }

  if (externals && externals.length) {
    externals.forEach(function (f) {
      require(path.join(CWD, 'tasks', f));
    });
  }
}

function watch() {
  Watch.collection.forEach(function (w) {
    w.start();
  });
}

var voyager = {
  
  build: function () {
    return this.clean()
      .then(this.run.bind(this, phases));
  }

, cancelWatch: function (patterns) {
    patterns = Array.isArray(patterns) ? patterns : [patterns];
    var watch = Watch.find(patterns);
    if (watch) {
      var idx = Watch.collection.indexOf(watch);
      Watch.collection.splice(idx, 1);
    }
  }

, clean: function () {
    return new Promise(function (done, fail) {
      del([DEV, BLD], done);
    });
  }

, run: function (ids) {
    loadTasks();
    ids = Array.isArray(ids) ? ids : [ids];
    var queue = Task.filter(ids);
    return queue.reduce(function (a, b) {
      return a.then(function () {
        return b.func.call(b);
      });
    }, Promise.resolve());
  }

, start: function () {
    this.clean()
      .then(this.run.bind(this, ['read', 'write']))
      .then(function () {
        http.createServer(ecstatic({ root: DEV })).listen(PORT);
        console.log(('\n\tListening on port ' + PORT + '\n').cyan);
        return Promise.resolve();
      })
      .then(watch);
  }

, task: function (phase, name, func) {
    var task = new Task(phase, name, func)
      , idx = Task.find(phase, name);
    if (idx < 0) {
      Task.add(task);
    } else {
      Task.replace(idx, task);
    }
    return true;
  }

, watch: function (patterns, ids) {
    patterns = Array.isArray(patterns) ? patterns : [patterns];
    var existing = Watch.find(patterns);
    if (existing) {
      existing.add(ids);
    } else {
      Watch.add(new Watch(patterns, ids));
    }
  }

};

Object.defineProperties(voyager, {
  CWD: { value: CWD }
, BLD: { value: BLD }
, DEV: { value: DEV }
, SRC: { value: SRC }
});

module.exports = voyager;
