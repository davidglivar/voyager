var voyager = require('../voyager')
  , log = require('gulp-filelog');

voyager.task('write', 'html', function (done) {
  this.src('**/*.html')
    .pipe(this.out())
    .on('end', done);
});

voyager.task('build', 'html', function (done) {
  this.src('**/*.html')
    .pipe(this.out())
    .on('end', done);
});

voyager.watch('**/*.html', 'html');
