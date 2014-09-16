var voyager = require('../voyager');

voyager.task('fonts-write', ['fonts', 'write'], function (done) {
  this.in.src('fonts/*')
    .pipe(this.out.dev('fonts'))
    .on('end', done);
});

voyager.task('fonts-build', ['fonts', 'build'], function (done) {
  this.in.dev('fonts/*')
    .pipe(this.out.bld('fonts'))
    .on('end', done);
});

voyager.task('fonts-watch', 'watch', function () {
  this.watch('fonts/*', 'fonts-write');
});
