var voyager = require('../voyager')
  , ecstatic = require('ecstatic')
  , http = require('http')
  , vfs = require('vinyl-fs')
  , CWD = process.cwd()
  , PORT = process.env.PORT || 3000;

require('colors');

voyager.task('start', function (done) {
  this.run('clean')
    .then(this.run.bind(this, 'html'))
    .then(this.run.bind(this, 'scripts'))
    .then(this.run.bind(this, 'styles'))
    .then(function () {
      http.createServer(
        ecstatic({
          root: CWD + '/.dev'
        })
      ).listen(PORT);
      console.log(('\n\tListening on port ' + PORT + '\n').cyan);

      vfs.watch([CWD + '/src/**/*.html'], this.run.bind(this, 'html'));
      vfs.watch([
          CWD + '/src/javascripts/**/*.js'
        , '!'+ CWD +'/src/javascripts/vendor/**'
        ], this.run.bind(this, 'scripts'));
      vfs.watch([
          CWD + '/src/stylesheets/**/*.styl'
        , '!'+ CWD +'/src/stylesheets/vendor/**'
        ], this.run.bind(this, 'styles'));
    })
    .then(done);
}, { spin: false });

