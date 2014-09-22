var expect = require('expect.js')
  , path = require('path')
  , Task = require('../lib/task')
  , voyager = require('../voyager');

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

  describe('static members', function () {

    describe('collection', function () {

      it('exists as an Array', function () {
        expect(Task).to.have.property('collection');
        expect(Task.collection).to.be.an('array');
      });
    });

    describe('#add()', function () {
      afterEach(function () {
        Task.collection.splice(0, Task.collection.length);
      });

      it('exists on Task as a function', function () {
        expect(Task).to.have.property('add');
        expect(Task.add).to.be.a('function');
        expect(Task.add.length).to.be(1);
      });

      it('throws an error if argument is not a Task', function () {
        var f = function () {
          Task.add(true);
        };
        expect(f).to.throwError();
        f = function () {
          Task.add(new Task('read', 'test', function (d) { d(); }));
        };
        expect(f).to.not.throwError();
      });

      it('adds a Task instance to the Task collection', function () {
        expect(Task.collection.length).to.be(0);
        Task.add(new Task('read', 'test', function (d) { d(); }));
        expect(Task.collection.length).to.be(1);
      });
    });

    describe('#filter()', function () {
      afterEach(function () {
        Task.collection.splice(0, Task.collection.length);
      });

      it('exists on Task as a function', function () {
        expect(Task).to.have.property('filter');
        expect(Task.filter).to.be.a('function');
        expect(Task.filter.length).to.be(1);
      });

      it('returns an array of Task instances', function () {
        var result;
        voyager.task('read', 'test', function (d) { d(); });
        result = Task.filter(['test']);
        expect(result).to.be.ok();
        expect(result).to.be.an('array');
        expect(result.length).to.be(1);
        expect(result[0] instanceof Task).to.be(true);
      });

      it('sorts the returned array', function () {
        var result;
        voyager.task('write', 'test', function (d) { d(); });
        voyager.task('read', 'test', function (d) { d(); });
        result = Task.filter(['test']);
        expect(Task.collection.length).to.be(2);
        expect(Task.collection[0].phase).to.be('write');
        expect(Task.collection[1].phase).to.be('read');
        expect(result.length).to.be(2);
        expect(result[0].phase).to.be('read');
        expect(result[1].phase).to.be('write');
      });
    });

    describe('#find()', function () {
      afterEach(function () {
        Task.collection.splice(0, Task.collection.length);
      });

      it('exists on Task as a function', function () {
        expect(Task).to.have.property('find');
        expect(Task.find).to.be.a('function');
        expect(Task.find.length).to.be(2);
      });

      it('returns -1 for an unregistered Task', function () {
        expect(Task.collection.length).to.be(0);
        expect(Task.find('read', 'test')).to.be(-1);
      });

      it('returns the correct index of a registered task', function () {
        voyager.task('write', 'test', function (d) { d(); });
        voyager.task('read', 'test', function (d) { d(); });
        expect(Task.find('read', 'test')).to.be(1);
        expect(Task.find('write', 'test')).to.be(0);
      });
    });

    describe('#get()', function () {
      afterEach(function () {
        Task.collection.splice(0, Task.collection.length);
      });

      it('exists on Task as a function', function () {
        expect(Task).to.have.property('get');      
        expect(Task.get).to.be.a('function');
        expect(Task.get.length).to.be(2);
      });

      it('returns an array of Task instances', function () {
        var result;
        voyager.task('read', 'test', function (d) { d(); });
        result = Task.get('phase', 'read');
        expect(result).to.be.ok();
        expect(result).to.be.an('array');
        expect(result.length).to.be(1);
        expect(result[0] instanceof Task).to.be(true);
      });

      it('returns the proper task given the id to check and task name', function () {
        var result;
        voyager.task('read', 'test', function (d) { d(); });
        result = Task.get('phase', 'read');
        expect(result[0].phase).to.be('read');
      });
    });

    describe('#replace()', function () {
      afterEach(function () {
        Task.collection.splice(0, Task.collection.length);
      });

      it('exists on Task as a function', function () {
        expect(Task).to.have.property('replace');
        expect(Task.replace).to.be.a('function');
        expect(Task.replace.length).to.be(2);
      });

      it('replaces a Task at a given index', function () {
        voyager.task('read', 'test', function (d) { d(); });
        Task.replace(0, new Task('write', 'new-test', function (d) { d(); }));
        expect(Task.collection.length).to.be(1);
        expect(Task.collection[0].phase).to.be('write');
        expect(Task.collection[0].name).to.be('new-test');
      });
    });
  });
});
