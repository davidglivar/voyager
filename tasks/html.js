var voyager = require('../voyager');

voyager.task('html-write', ['html', 'write'], function (done) {
  this.in.src('**/*.html')
    .pipe(this.out.dev())
    .on('end', done);
});

voyager.task('html-build', ['html', 'build'], function (done) {
  this.in.dev('**/*.html')
    .pipe(this.out.bld())
    .on('end', done);
});

voyager.task('html-watch', 'watch', function () {
  this.watch('**/*.html', 'html-write');
});
