var voyager = require('../voyager')
  , vfs = require('vinyl-fs');

voyager.task('scripts-prebuild', ['scripts', 'prebuild'], function (done) {
  vfs.src(this.SRC + '/javascripts/**/*.js')
    .pipe(vfs.dest(this.TMP + '/javascripts'))
    .on('end', done);
});

voyager.task('scripts-build', ['scripts', 'build'], function (done) {
  vfs.src(this.TMP + '/javascripts/**/*.js')
    .pipe(vfs.dest(this.BLD + '/javascripts'))
    .on('end', done);
});

voyager.task('scripts-watch', 'watch', function () {
  vfs.watch(
    this.SRC + '/javascripts/**/*.js'
  , this.run.bind(this, 'scripts-prebuild')
  );
});
