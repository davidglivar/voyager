var voyager = require('../voyager')
  , cache = require('gulp-cache')
  , imagemin = require('gulp-imagemin')
  , vfs = require('vinyl-fs')
  , CWD = process.cwd();

voyager.task('images:finish', function (done) {
  vfs.src([CWD + '/.dev/images/**'])
    .pipe(cache(imagemin({
      progressive: true,
      interlaced: true
    })))
    .pipe(vfs.dest(CWD + '/build/images'))
    .on('end', done);
});

voyager.task('images', function (done) {
  vfs.src([CWD + '/src/images/**'])
    .pipe(cache(imagemin({
      progressive: true,
      interlaced: true
    })))
    .pipe(vfs.dest(CWD + '/.dev/images'))
    .on('end', done);
});
