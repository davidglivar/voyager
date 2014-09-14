var voyager = require('../voyager')
  , vfs = require('vinyl-fs');

voyager.task('images-prebuild', ['images', 'prebuild'], function (done) {
  vfs.src(this.SRC + '/images/*')
    .pipe(vfs.dest(this.TMP + '/images'))
    .on('end', done);
});

voyager.task('images-build', ['images', 'build'], function (done) {
  vfs.src(this.TMP + '/images/*')
    .pipe(vfs.dest(this.BLD + '/images'))
    .on('end', done);
});

voyager.task('images-watch', 'watch', function () {
  vfs.watch(
    this.SRC + '/images/*'
  , this.run.bind(this, 'images-prebuild')
  );
});
