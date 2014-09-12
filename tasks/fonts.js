var voyager = require('../voyager')
  , vfs = require('vinyl-fs');

voyager.task('fonts-prebuild', ['fonts', 'prebuild'], function (done) {
  vfs.src(this.SRC + '/fonts/*')
    .pipe(vfs.dest(this.TMP + '/fonts'))
    .on('end', done);
});

voyager.task('fonts-build', ['fonts', 'build'], function (done) {
  vfs.src(this.TMP + '/fonts/*')
    .pipe(vfs.dest(this.BLD + '/fonts'))
    .on('end', done);
});

voyager.task('fonts-watch', 'watch', function () {
  vfs.watch(
    this.SRC + '/fonts/*'
  , this.run.bind(this, 'fonts-prebuild')
  );
});
