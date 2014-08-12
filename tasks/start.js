var voyager = require('../voyager')
  , ecstatic = require('ecstatic')
  , http = require('http')
  , vfs = require('vinyl-fs')
  , CWD = process.cwd()
  , PORT = process.env.PORT || 3000;

require('colors');

voyager.task('start', function (done) {
  this.run('clean')
    .then(this.run.bind(this, 'artifacts'))
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

      vfs.watch([CWD + '/src/**/*.html'], voyager.run.bind(voyager, 'html'));
      vfs.watch([
          CWD + '/src/javascripts/**/*.js'
        , '!'+ CWD +'/src/javascripts/vendor/**'
        ], voyager.run.bind(voyager, 'scripts'));
      vfs.watch([
          CWD + '/src/stylesheets/**/*.styl'
        , '!'+ CWD +'/src/stylesheets/vendor/**'
        ], voyager.run.bind(voyager, 'styles'));
    })
    .then(done);
}, { spin: false });

