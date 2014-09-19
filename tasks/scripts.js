var voyager = require('../voyager');

voyager.task('write', 'scripts', function (done) {
  console.log('im default');
  this.src('javascripts/**/*.js')
    .pipe(this.out('javascripts'))
    .on('end', done);
});

voyager.task('build', 'scripts', function (done) {
  this.src('javascripts/**/*.js')
    .pipe(this.out('javascripts'))
    .on('end', done);
});

voyager.watch('javascripts/**/*.js', 'scripts');
