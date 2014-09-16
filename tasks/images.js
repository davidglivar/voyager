var voyager = require('../voyager');

voyager.task('images-write', ['images', 'write'], function (done) {
  this.in.src('images/*')
    .pipe(this.out.dev('images'))
    .on('end', done);
});

voyager.task('images-build', ['images', 'build'], function (done) {
  this.in.dev('images/*')
    .pipe(this.out.bld('images'))
    .on('end', done);
});

voyager.task('images-watch', 'watch', function () {
  this.watch('images/*', 'images-write');
});
