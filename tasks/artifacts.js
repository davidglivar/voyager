var voyager = require('../voyager');

voyager.task('write', 'artifacts', function (done) {
  this.src([
      'favicon.ico'
    , 'humans.txt'
    , 'robots.txt'
    , 'apple-touch-icon-precomposed.png'
    ])
    .pipe(this.out())
    .on('end', done);
});

voyager.task('build', 'artifacts', function (done) {
  this.src([
      'favicon.ico'
    , 'humans.txt'
    , 'robots.txt'
    , 'apple-touch-icon-precomposed.png'
    ])
    .pipe(this.out())
    .on('end', done);
});

voyager.watch([
      'favicon.ico'
    , 'humans.txt'
    , 'robots.txt'
    , 'apple-touch-icon-precomposed.png'
  ], 'artifacts');
