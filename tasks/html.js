var voyager = require('../voyager')
  , vfs = require('vinyl-fs')
  , CWD = process.cwd();

voyager.task('html:finish', function (done) {
  vfs.src([CWD + '/.dev/**/*.html'])
    .pipe(vfs.dest(CWD + '/build'))
    .on('end', done);
});

voyager.task('html', function (done) {
  vfs.src([CWD + '/src/**/*.html'])
    .pipe(vfs.dest(CWD + '/.dev'))
    .on('end', done);
});
