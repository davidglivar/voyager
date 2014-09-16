var voyager = require('../voyager');

voyager.task('scripts-write', ['scripts', 'write'], function (done) {
  this.in.src('javascripts/**/*.js')
    .pipe(this.out.dev('javascripts'))
    .on('end', done);
});

voyager.task('scripts-build', ['scripts', 'build'], function (done) {
  this.in.dev('javascripts/**/*.js')
    .pipe(this.out.bld('javascripts'))
    .on('end', done);
});

voyager.task('scripts-watch', 'watch', function () {
  this.watch('javascripts/**/*.js', 'scripts-write');
});
