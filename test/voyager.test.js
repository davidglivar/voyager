var expect = require('expect.js')
  , del = require('del')
  , fs = require('graceful-fs')
  , path = require('path')
  , Task = require('../lib/task')
  , voyager = require('../voyager');

describe('voyager', function () {

  it('is exported as an object', function () {
    expect(voyager).to.be.ok();
    expect(voyager).to.be.an('object');
    expect(Object.keys(voyager).length).to.be.above(0);
    expect(voyager).to.only.have.keys(
      'build'
    , 'cancelWatch'
    , 'clean'
    , 'run'
    , 'task'
    , 'start'
    , 'watch'
    );
  });

  describe('#build()', function () {

    it('exists within voyager as a function', function () {
      expect(voyager).to.have.property('build');
      expect(voyager.build).to.be.a('function');
    });

    it('returns a promise', function (done) {
      var result = voyager.build().then(function () {
        del([__dirname + '/project/.dev', __dirname + '/project/build'], done);
      });
      expect(result).to.be.ok();
      expect(result).to.have.property('then');
      expect(result.then).to.be.a('function');
    });
  });

  describe('#clean()', function () {

    it('exists within voyager as a function', function () {
      expect(voyager).to.have.property('clean');
      expect(voyager.clean).to.be.a('function');
      expect(voyager.clean.length).to.be(0);
    });

    it('returns a promise', function () {
      var result = voyager.clean();
      expect(result).to.have.property('then');
      expect(result.then).to.be.a('function');
    });

    xit('removes the DEV and BLD directories in a project', function (done) {
      process.chdir(path.join(__dirname, 'project'));

      fs.mkdirSync('.dev');
      fs.mkdirSync('build');

      expect(fs.existsSync(process.cwd() + '/.dev')).to.be(true);
      expect(fs.existsSync(process.cwd() + '/build')).to.be(true);
      voyager.clean()
        .then(function () {
          expect(fs.existsSync(process.cwd() + '/.dev')).to.be(false);
          expect(fs.existsSync(process.cwd() + '/build')).to.be(false);
          process.chdir(path.join(__dirname, '../'));
          done();
        });
    });
  });

  describe('#run()', function () {
    var flipped = false;
    before(function () {
      voyager.task('read', 'test', function (done) {
        flipped = true;
        done();
      });
    });
    afterEach(function () {
      flipped = false;
    });

    it('exists within voyager as a function', function () {
      expect(voyager).to.have.property('run');
      expect(voyager.run).to.be.a('function');
      expect(voyager.run.length).to.be(1);
    });

    it('returns a promise', function () {
      var result = voyager.run('test');
      expect(result).to.have.property('then');
      expect(result.then).to.be.a('function');
    });

    it('runs a given task', function () {
      expect(flipped).to.be(false);
      voyager.run('test').then(function () {
        expect(flipped).to.be(true);
        done();
      });
    });
  });

  describe('#start()', function () {

    it('write some tests');
  });

  describe('#task()', function () {
    afterEach(function () {
      Task.collection.splice(0, Task.collection.length);
    });

    it('exists within voyager as a function', function () {
      expect(voyager).to.have.property('task');
      expect(voyager.task).to.be.a('function');
      expect(voyager.task.length).to.be(3);
    });

    it('adds a Task instance to the tasks array', function () {
      expect(Task.collection.length).to.be(0);
      voyager.task('read', 'test', function (done) { done(); });
      expect(Task.collection.length).to.be(1);
      expect(Task.collection[0] instanceof Task).to.be(true);
    });

    it('replaces an existing task with the same name and phase', function () {
      expect(Task.collection.length).to.be(0);
      voyager.task('read', 'test', function (done) { done(); });
      expect(Task.collection.length).to.be(1);
      voyager.task('read', 'test', function (done) { done(); });
      expect(Task.collection.length).to.not.be(2);
      expect(Task.collection.length).to.be(1);
    });
  });

  describe('#watch()', function () {

    it('write some tests');
  });
});
