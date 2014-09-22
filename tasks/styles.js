var voyager = require('../voyager');

voyager.task('write', 'styles', function (done) {
  this.src('stylesheets/**/*.css')
    .pipe(this.out('stylesheets'))
    .on('end', done);
});

voyager.task('build', 'styles', function (done) {
  this.src('stylesheets/**/*.css')
    .pipe(this.out('stylesheets'))
    .on('end', done);
});

voyager.watch('stylesheets/**/*.css', 'styles');
