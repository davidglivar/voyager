var voyager = require('../voyager')
  , ecstatic = require('ecstatic')
  , http = require('http')
  , PORT = process.env.PORT || 3000;

voyager.task('serve', function (done) {
  http.createServer(
    ecstatic({
      root: voyager.TMP
    })
  ).listen(PORT);
  console.log(('\n\tListening on port ' + PORT + '\n').cyan);
  done();
});
