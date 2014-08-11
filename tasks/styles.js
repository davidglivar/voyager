var voyager = require('../voyager')
  , autoprefixer = require('gulp-autoprefixer')
  , csso = require('gulp-csso')
  , plumber = require('gulp-plumber')
  , stylus = require('gulp-stylus')
  , vfs = require('vinyl-fs')

  , AUTOPREFIXER_BROWSERS = [
      'ie >= 9'
    , 'ie_mob >= 9'
    , 'ff >= 30'
    , 'chrome >= 34'
    , 'safari >= 7'
    , 'opera >= 23'
    , 'ios >= 7'
    , 'android >= 4.4'
    , 'bb >= 10'
    ]
  , CWD = process.cwd();

voyager.task('styles:compress', function (done) {
  vfs.src([
      CWD + '/.dev/stylesheets/**/*.css'
    , '!'+ CWD +'/.dev/stylesheets/vendor/**'
    ])
    .pipe(csso())
    .pipe(vfs.dest(CWD + '/build/stylesheets'))
    .on('end', done);
});

voyager.task('styles:css', function (done) {
  vfs.src([
      CWD + '/src/stylesheets/**/*.css'
    , '!'+ CWD +'./src/stylesheets/vendor/**'
    ])
    .pipe(autoprefixer(AUTOPREFIXER_BROWSERS, { cascade: true }))
    .pipe(vfs.dest(CWD + '/.dev/stylesheets'))
    .on('end', done);
});

voyager.task('styles:finish', function (done) {
  vfs.src(CWD + '/.dev/stylesheets/vendor/**')
    .pipe(vfs.dest(CWD + '/build/stylesheets/vendor'))
    .on('end', done);
});

voyager.task('styles:stylus', function (done) {
  vfs.src([
      CWD + '/src/stylesheets/main.styl'
    ])
    .pipe(plumber())
    .pipe(stylus({ errors: true }))
    .pipe(autoprefixer(AUTOPREFIXER_BROWSERS, { cascade: true }))
    .pipe(vfs.dest(CWD + '/.dev/stylesheets'))
    .on('end', done);
});

voyager.task('styles:vendor', function (done) {
  vfs.src(CWD + '/src/stylesheets/vendor/**')
    .pipe(vfs.dest(CWD + '/.dev/stylesheets/vendor'))
    .on('end', done);
});

voyager.task('styles', function (done) {
  this.run('styles:stylus')
    .then(this.run.bind(this, 'styles:css'))
    .then(this.run.bind(this, 'styles:vendor'))
    .then(done);
}, { spin: false });

