var voyager = require('../voyager');

voyager.task('write', 'scripts', function (done) {
  this.src('javascripts/**/*.js')
    .pipe(this.out('javascripts'))
    .on('end', done);
});

voyager.task('build', 'scripts', function (done) {
  this.src('javascripts/**/*.js')
    .pipe(this.out('javascripts'))
    .on('end', done);
});

//voyager.task('scripts-watch', 'watch', function () {
  //this.watch('javascripts/**/*.js', 'scripts-write');
//});
