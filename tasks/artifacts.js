var voyager = require('../voyager')
  , vfs = require('vinyl-fs')
  , CWD = process.cwd();

voyager.task('artifacts', function (done) {
  vfs.src([
      CWD + '/src/*.txt'
    , CWD + '/src/apple-touch-icon-precomposed.png'
    , CWD + '/src/favicon.ico'
    ])
    .pipe(vfs.dest(CWD + '/.dev'))
    .on('end', done);
});

voyager.task('artifacts:finish', function (done) {
  vfs.src([
      CWD + '/.dev/*.txt'
    , CWD + '/.dev/apple-touch-icon-precomposed.png'
    , CWD + '/.dev/favicon.ico'
    ])
    .pipe(vfs.dest(CWD + '/build'))
    .on('end', done);
});
