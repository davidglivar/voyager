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

voyager.watch('fonts/*', 'fonts');
