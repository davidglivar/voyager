var voyager = require('../voyager')
  , browserify = require('browserify')
  , jshint = require('gulp-jshint')
  , uglify = require('gulp-uglify')
  , vfs = require('vinyl-fs')
  , vss = require('vinyl-source-stream')
  , CWD = process.cwd();

voyager.task('scripts:browserify', function (done) {
  browserify({ debug: true })
    .add(CWD + '/src/javascripts/main.js')
    .bundle()
    .pipe(vss('main.js'))
    .pipe(vfs.dest(CWD + '/.dev/javascripts'))
    .on('end', done);
});

voyager.task('scripts:compress', function (done) {
  vfs.src([
      CWD + '/.dev/javascripts/**/*.js'
    , '!'+ CWD +'/.dev/javascripts/vendor/**'
    ])
    .pipe(uglify({ preserveComments: 'some' }))
    .pipe(vfs.dest(CWD + '/build/javascripts'))
    .on('end', done);
});

voyager.task('scripts:finish', function (done) {
  vfs.src([CWD + '/.dev/javascripts/vendor/**/*.js'])
    .pipe(vfs.dest(CWD + '/build/javascripts/vendor'))
    .on('end', done);
});

voyager.task('scripts:jshint', function (done) {
  vfs.src([
      CWD + '/src/javascripts/**/*.js'
    , '!'+ CWD +'./src/javascripts/vendor/**'
    ])
    .pipe(jshint())
    .on('end', done)
    .pipe(jshint.reporter('jshint-stylish'))
});

voyager.task('scripts:vendor', function (done) {
  vfs.src([CWD + '/src/javascripts/vendor/**/*.js'])
    .pipe(vfs.dest(CWD + '/.dev/javascripts/vendor'))
    .on('end', done);
});

voyager.task('scripts', function (done) {
  this.run('scripts:jshint')
    .then(this.run.bind(this, 'scripts:browserify'))
    .then(this.run.bind(this, 'scripts:vendor'))
    .then(done);
}, { spin: false });

