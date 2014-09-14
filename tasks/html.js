var voyager = require('../voyager')
  , vfs = require('vinyl-fs');

voyager.task('html-prebuild', ['html', 'prebuild'], function (done) {
  vfs.src(this.SRC + '/**/*.html')
    .pipe(vfs.dest(this.TMP))
    .on('end', done);
});

voyager.task('html-build', ['html', 'build'], function (done) {
  vfs.src(this.TMP + '/**/*.html')
    .pipe(vfs.dest(this.BLD))
    .on('end', done);
});

voyager.task('html-watch', 'watch', function () {
  vfs.watch(this.SRC + '/**/*.html', this.run.bind(this, 'html-prebuild'));
});
