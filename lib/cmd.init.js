var inquirer = require('inquirer')
  , child_process = require('child_process')
  , fs = require('graceful-fs')
  , path = require('path')
  , Promise = require('es6-promise').Promise
  , vfs = require('vinyl-fs')

  , j = path.join
  , packages = {
      'voyager-browserify': 'davidglivar/voyager-browserify'
    , 'voyager-jshint': 'davidglivar/voyager-jshint'
    , 'voyager-stylus': 'davidglivar/voyager-stylus'
    }
  , questions = [{
      type: 'input'
    , name: 'name'
    , message: 'Project name:'
    , default: path.basename(process.cwd())
    }, {
      type: 'input'
    , name: 'version'
    , message: 'Version:'
    , default: '0.0.0'
    }, {
      type: 'input'
    , name: 'description'
    , message: 'Description:'
    }, {
      type: 'confirm'
    , name: 'private'
    , message: 'Private?'
    , default: true
    }, {
      type: 'input'
    , name: 'license'
    , message: 'License:'
    , default: 'ISC'
    }, {
      type: 'checkbox'
    , name: 'tasks'
    , message: 'Include some popular tasks?'
    , choices: [{
        key: 'voyager-browserify'
      , name: 'voyager-browserify'
      , value: 'voyager-browserify'
      , checked: true
      }, {
        key: 'voyager-stylus'
      , name: 'voyager-stylus'
      , value: 'voyager-stylus'
      , checked: true
      }, {
        key: 'voyager-jshint'
      , name: 'voyager-jshint'
      , value: 'voyager-jshint'
      , checked: true
      }]
    }]
  , settings
  , CWD = process.cwd();

function build() {
  console.log('building');
  writePackage()
    .then(buildSkeleton)
    .then(seed)
    .then(function () {
      console.log('done!');
      console.log('run `npm install && voyager start`');
    });
}

function buildSkeleton() {
  return new Promise(function (resolve, reject) {
    fs.mkdir(CWD + '/src', function (err) {
      if (err) return reject(err);
      fs.mkdirSync(CWD + '/src/fonts');
      fs.mkdirSync(CWD + '/src/images');
      fs.mkdirSync(CWD + '/src/javascripts');
      fs.mkdirSync(CWD + '/src/javascripts/lib');
      fs.mkdirSync(CWD + '/src/javascripts/vendor');
      fs.mkdirSync(CWD + '/src/stylesheets');
      fs.mkdirSync(CWD + '/src/stylesheets/lib');
      fs.mkdirSync(CWD + '/src/stylesheets/vendor');
      resolve();
    });
  });
}

function seed() {
  return Promise.all([
    new Promise(function (resolve, reject) {
      vfs.src(['../support/images/**'])
        .pipe(vfs.dest(CWD + '/src/images'))
        .on('end', resolve);
    })
  , new Promise(function (resolve, reject) {
      vfs.src(['../support/javascripts/**/*.js'])
        .pipe(vfs.dest(CWD + '/src/javascripts'))
        .on('end', resolve);
    })
  , new Promise(function (resolve, reject) {
      vfs.src(['../support/stylesheets/**'])
        .pipe(vfs.dest(CWD + '/src/stylesheets'))
        .on('end', resolve);
    })
  , new Promise(function (resolve, reject) {
      vfs.src([
          '../support/.jshintrc'
        , '../support/*.txt'
        , '../support/favicon.ico'
        , '../support/apple-touch-icon-precomposed.png'
        ])
        .pipe(vfs.dest(CWD + '/src'))
        .on('end', resolve);
    })
  ]);
}

function writePackage() {
  return new Promise(function (resolve, reject) {
    settings.devDependencies = {};
    for (var i = 0, l = settings.tasks.length; i < l; i++) {
      settings.devDependencies[settings.tasks[i]] = packages[settings.tasks[i]];
    }
    fs.writeFile(CWD + '/package.json', JSON.stringify(settings, null, 2), function (err) {
      if (err) return reject(err);
      resolve();
    });
  });
}

inquirer.prompt(questions, function (answers) {
  inquirer.prompt([{
    type: 'confirm'
  , name: 'ok'
  , message: JSON.stringify(answers, null, 2) + '\nDoes this look right?'
  , default: true
  }], function (answer) {
    if (answer.ok) {
      settings = answers;
      build();
    }
  });
});
