var voyager = require('../voyager')
  , vfs = require('vinyl-fs');

voyager.task('artifacts-prebuild', ['artifacts', 'prebuild'], function (done) {
  vfs.src([
      this.SRC + '/favicon.ico'
    , this.SRC + '/humans.txt'
    , this.SRC + '/robots.txt'
    , this.SRC + '/apple-touch-icon-precomposed.png'
    ])
    .pipe(vfs.dest(this.TMP + '/'))
    .on('end', done);
});

voyager.task('artifacts-build', ['artifacts', 'build'], function (done) {
  vfs.src([
      this.TMP + '/favicon.ico'
    , this.TMP + '/humans.txt'
    , this.TMP + '/robots.txt'
    , this.TMP + '/apple-touch-icon-precomposed.png'
    ])
    .pipe(vfs.dest(this.BLD + '/'))
    .on('end', done);
});

voyager.task('artifacts-watch', 'watch', function () {
  vfs.watch([
      this.TMP + '/favicon.ico'
    , this.TMP + '/humans.txt'
    , this.TMP + '/robots.txt'
    , this.TMP + '/apple-touch-icon-precomposed.png'
    ]
  , this.run.bind(this, 'artifacts-prebuild')
  );
});
