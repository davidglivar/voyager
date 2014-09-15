var voyager = require('../voyager');

voyager.task('artifacts-prebuild', ['artifacts', 'prebuild'], function (done) {
  this.in.src([
      'favicon.ico'
    , 'humans.txt'
    , 'robots.txt'
    , 'apple-touch-icon-precomposed.png'
    ])
    .pipe(this.out.dev())
    .on('end', done);
});

voyager.task('artifacts-build', ['artifacts', 'build'], function (done) {
  this.in.dev([
      'favicon.ico'
    , 'humans.txt'
    , 'robots.txt'
    , 'apple-touch-icon-precomposed.png'
    ])
    .pipe(this.out.bld())
    .on('end', done);
});

voyager.task('artifacts-watch', 'watch', function () {
  this.watch([
      'favicon.ico'
    , 'humans.txt'
    , 'robots.txt'
    , 'apple-touch-icon-precomposed.png'
    ]
  , 'artifacts-prebuild'
  );
});
