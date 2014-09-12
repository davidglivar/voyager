var voyager = require('../voyager')
  , vfs = require('vinyl-fs');

voyager.task('styles-prebuild', ['styles', 'prebuild'], function (done) {
  vfs.src(this.SRC + '/stylesheets/**/*.css')
    .pipe(vfs.dest(this.TMP + '/stylesheets'))
    .on('end', done);
});

voyager.task('styles-build', ['styles', 'build'], function (done) {
  vfs.src(this.TMP + '/stylesheets/**/*.css')
    .pipe(vfs.dest(this.BLD + '/stylesheets'))
    .on('end', done);
});

voyager.task('styles-watch', 'watch', function () {
  vfs.watch(
    this.SRC + '/stylesheets/**/*.css'
  , this.run.bind(this, 'styles-prebuild')
  );
});
