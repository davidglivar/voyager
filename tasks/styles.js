var voyager = require('../voyager');

voyager.task('styles-prebuild', ['styles', 'prebuild'], function (done) {
  this.in.src('stylesheets/**/*.css')
    .pipe(this.out.dev('stylesheets'))
    .on('end', done);
});

voyager.task('styles-build', ['styles', 'build'], function (done) {
  this.in.dev('stylesheets/**/*.css')
    .pipe(this.out.bld('stylesheets'))
    .on('end', done);
});

voyager.task('styles-watch', 'watch', function () {
  this.watch('stylesheets/**/*.css', 'styles-prebuild');
});
