#!/usr/bin/env node

var voyager = require('../voyager')
  , spawn = require('child_process').spawn
  , cmd = require('commander')
  , fs = require('graceful-fs')
  , mkdirp = require('mkdirp')
  , path = require('path')
  , Promise = require('es6-promise').Promise
  , read = require('read')
  , reqd = require('require-dir')

  , join = path.join
  , project = {}

  , CWD = process.cwd()
  , PKG = JSON.parse(fs.readFileSync(join(__dirname, '../package.json'), { encoding: 'utf-8' }));

// Load default tasks
reqd('../tasks');

// Try to load user tasks
try { reqd(join(CWD, 'tasks')); } catch (err) {}

function buildSkeleton(errors) {
  var dir = join(CWD, 'src');
  mkdirp.sync(dir);
  mkdirp.sync(join(dir, 'javascripts/vendor'));
  mkdirp.sync(join(dir, 'stylesheets/vendor'));
  mkdirp.sync(join(dir, 'images'));
  fs.writeFileSync(join(dir, 'javascripts/main.js'), '');
  fs.writeFileSync(join(dir, 'stylesheets/main.styl'), '');
  fs.writeFileSync(join(dir, 'index.html'), '');
}

function readConfim() {
  if (!project.license) delete project.license;
  return new Promise(function (resolve, reject) {
    console.log(project);
    read({
      prompt: 'Does this look right?'
    , default: 'yes'
    }, function (err, v) {
      if (err) return reject(err);
      if (v.match(/^y(es)?$/i)) {
        v = true;
      } else {
        v = false;
      }
      return resolve(v);
    });
  });
}

function readDescription() {
  return new Promise(function (resolve, reject) {
    read({
      prompt: 'Description:'
    , default: 'Static site'
    }, function (err, v) {
      if (err) return reject(err);
      project.description = v.trim();
      return resolve(v);
    });
  });
}

function readLicense() {
  return new Promise(function (resolve, reject) {
    project.license = null;
    if (project.private) return resolve();
    read({
      prompt: 'License:'
    , default: 'ISC'
    }, function (err, v) {
      if (err) return reject(err);
      project.license = v;
      return resolve(v);
    });
  });
}

function readName() {
  return new Promise(function (resolve, reject) {
    var name = path.basename(CWD);
    read({
      prompt: 'Project name:'
    , default: name
    }, function (err, v) {
      if (err) return reject(err);
      project.name = v;
      return resolve(v);
    });
  });
}

function readPrivate() {
  return new Promise(function (resolve, reject) {
    read({
      prompt: 'Private?'
    , default: 'yes'
    }, function (err, v) {
      if (err) return reject(err);
      if (v.match(/^y(es)?$/i)) {
        v = true;
      } else {
        v = false;
      }
      project.private = v;
      return resolve(v);
    });
  });
}

function readVersion() {
  return new Promise(function (resolve, reject) {
    read({
      prompt: 'Version:'
    , default: '0.0.0'
    }, function (err, v) {
      if (err) return reject(err);
      project.version = v;
      return resolve(v);
    });
  });
}

function writeJSON() {
  fs.writeFile(
    join(CWD, 'package.json')
  , JSON.stringify(project, null, 2)
  , function (err) {
      if (err) throw err;
      spawn('npm', ['i'], { stdio: 'inherit' })
        .on('close', function (code) {
          return buildSkeleton(code !== 0);
        });
  });
}

function writePackage(ok) {
  if (!ok) return console.log('Exiting.');
  project.devDependencies = { voyager: '^' + PKG.version };
  var files = fs.readdirSync(CWD);
  if (files.length) {
    read({
      prompt: 'Directory is not empty, do you want to continue?'
    , default: 'no'
    }, function (err, v) {
      if (err) return reject(err);
      if (v.match(/^y(es)?$/i)) {
        return writeJSON();
      }
      return console.log('Exiting.');
    });
  } else {
    return writeJSON();
  }
}

function init() {
  readName()
    .then(readVersion)
    .then(readDescription)
    .then(readPrivate)
    .then(readLicense)
    .then(readConfim)
    .then(writePackage);
}

cmd.version(PKG.version);

cmd.command('build')
  .description('')
  .action(voyager.run.bind(voyager, 'build'));

cmd.command('clean')
  .description('')
  .action(voyager.run.bind(voyager, 'clean'));

cmd.command('init')
  .description('')
  .action(init);

cmd.command('start')
  .alias('s')
  .description('')
  .action(voyager.run.bind(voyager, 'start'));

cmd.command('task <tsk>')
  .alias('t')
  .description('')
  .action(function (tsk) {
    voyager.run(tsk);
  });

cmd.parse(process.argv);
