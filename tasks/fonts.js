var voyager = require('../voyager');

voyager.task('write', 'fonts', function (done) {
  this.src('fonts/*')
    .pipe(this.out('fonts'))
    .on('end', done);
});

voyager.task('build', 'fonts', function (done) {
  this.src('fonts/*')
    .pipe(this.out('fonts'))
    .on('end', done);
});

//voyager.task('fonts-watch', 'watch', function () {
  //this.watch('fonts/*', 'fonts-write');
//});
