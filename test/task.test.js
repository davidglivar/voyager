var expect = require('expect.js')
  , path = require('path')
  , Task = require('../lib/task');

describe('Task', function () {

  describe('name', function () {
    var t;
    beforeEach(function () {
      t = new Task('read', 'test', function (done) { done(); });
    });
    afterEach(function () {
      t = null;
    });
    
    it('exists on the instance', function () {
      expect(t).to.have.property('name');
      expect(t.name).to.be.a('string');
      expect(t.name).to.be('test');
    });
  });

  describe('phase', function () {
    var t;
    beforeEach(function () {
      t = new Task('read', 'test', function (done) { done(); });
    });
    afterEach(function () {
      t = null;
    });

    it('exists on the instance', function () {
      expect(t).to.have.property('phase');
      expect(t.phase).to.be.a('string');
      expect(t.phase).to.be('read');
    });

    it('throws an error if the value is other than read, write, or build', function () {
      var f = function (phase) {
        return new Task(phase, function (done) { done(); });
      };
      expect(f).to.throwError();
      expect(f.bind(f, 'bad')).to.throwError();
      expect(f.bind(f, true)).to.throwError();
    });

    it('can have the value of read, write, or build', function () {
      var f = function (phase) {
        return new Task(phase, function (done) { done(); });
      };
      expect(f.bind(f, 'read')).to.not.throwError();
      expect(f.bind(f, 'write')).to.not.throwError();
      expect(f.bind(f, 'build')).to.not.throwError();
    });
  });

  describe('func', function () {
    var t;
    beforeEach(function () {
      t = new Task('read', 'test', function (done) { done(); });
    });
    afterEach(function () {
      t = null;
    });
    
    it('exists on the instance', function () {
      expect(t).to.have.property('func');
      expect(t.func).to.be.a('function');
    });

    it('throws an error if it is not a function', function () {
      var f = function (func) {
        return new Task('read', 'bad', func);
      };
      expect(f.bind(f, true)).to.throwError();
    });

    it('returns a Promise', function () {
      var result = t.func.call(t);
      expect(result.then).to.be.a('function');
    });

    it('has access to the instance', function () {
      var f = new Task('read', 'test', function (done) {
        this.name += '-ok';
        done();
      });
      f.func();
      expect(f.name).to.be('test-ok');
    });
  });

  describe('#out()', function () {
    var t;
    beforeEach(function () {
      t = new Task('read', 'test', function (done) { done(); });
    });
    afterEach(function () {
      t = null;
    });
    
    it('returns a stream', function () {
      var result = t.out('testing');
      expect(result).to.have.property('on');
      expect(result).to.have.property('pipe');
      expect(result.readable).to.be(true);
      expect(result.writable).to.be(true);
    });
  });

  describe('#src()', function () {
    var t;
    beforeEach(function () {
      t = new Task('read', 'test', function (done) { done(); });
    });
    afterEach(function () {
      t = null;
    });
    
    it('returns a stream', function () {
      var result = t.src('**/*.js');
      expect(result).to.have.property('on');
      expect(result).to.have.property('pipe');
      expect(result.readable).to.be(true);
      expect(result.writable).to.be(true);
    });

    it('allows for the root directory to be changed', function (done) {
      var lib = t.src('*.js', { cwd: path.join(__dirname, '../lib') })
        , tasks = t.src('*.js', { cwd: path.join(__dirname, '../tasks') })
        , count = 0;
      expect(lib).to.be.ok();
      expect(tasks).to.be.ok();
      lib.once('data', function (file) {
        expect(file).to.be.ok();
        expect(file.path).to.be(path.join(__dirname, '../lib/task.js'));
        count++;
        if (count === 2) {
          done();
        }
      });
      tasks.once('data', function (file) {
        expect(file).to.be.ok();
        expect(file.path).to.be(path.join(__dirname, '../tasks/artifacts.js'));
        count++;
        if (count === 2) {
          done();
        }
      });
    });
  });
});
