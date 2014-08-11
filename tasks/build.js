var voyager = require('../voyager');

voyager.task('build', function (done) {
  this.run('clean')
    .then(this.run.bind(this, 'html'))
    .then(this.run.bind(this, 'html:finish'))
    .then(this.run.bind(this, 'scripts'))
    .then(this.run.bind(this, 'scripts:compress'))
    .then(this.run.bind(this, 'scripts:finish'))
    .then(this.run.bind(this, 'styles'))
    .then(this.run.bind(this, 'styles:compress'))
    .then(this.run.bind(this, 'styles:finish'))
    .then(done);
}, { spin: false });
