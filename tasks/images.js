var voyager = require('../voyager');

voyager.task('write', 'images', function (done) {
  this.src('images/**')
    .pipe(this.out('images'))
    .on('end', done);
});

voyager.task('build', 'images', function (done) {
  this.src('images/**')
    .pipe(this.out('images'))
    .on('end', done);
});

voyager.watch('images/**', 'images');
