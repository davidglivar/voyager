var voyager = require('../voyager')
  , del = require('del')
  , CWD = process.cwd();

voyager.task('clean', function (done) {
  del([CWD + '/.dev', CWD + '/build'], done);
});
