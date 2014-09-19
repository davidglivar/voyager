var expect = require('expect.js')
  , Task = require('../lib/task')
  , voyager = require('../voyager')
  , Watch = require('../lib/watch');

describe('Watch', function () {

  it('throws an error if no patterns are passed into the constructor', function () {
    var f = function () {
      new Watch();
    };
    expect(f).to.throwError('Watch constructor requires a patterns argument');
  });

  it('throws an error if no tasks are passed into the constructor', function () {
    var f = function () {
      new Watch(['*.js']);
    };
    expect(f).to.throwError('Watch constructor requires a task argument');
  });

  describe('patterns', function () {
    
    it('exists on the instance as an array', function () {
      var w = new Watch('*.js', 'test');
      expect(w).to.have.property('patterns');
      expect(w.patterns).to.be.an('array');
      expect(w.patterns.length).to.be(1);
    });
  });

  describe('tasks', function () {
    var w;
    beforeEach(function () {
      voyager.task('read', 'test', function (d) { d(); });
      voyager.task('write', 'test', function (d) { d(); });
      w = new Watch('*.js', 'test');
    });
    afterEach(function () {
      w = null;
      Task.collection.splice(0, Task.collection.length);
    });
    
    it('exists on the instance as an object', function () {
      expect(w).to.have.property('tasks');
      expect(w.tasks).to.be.an('object');
    });

    it('contains a "read" property as an array', function () {
      expect(w.tasks).to.have.property('read');
      expect(w.tasks.read).to.be.an('array');
    });

    it('contains a "write" property as a Task', function () {
      expect(w.tasks).to.have.property('write');
      expect(w.tasks.write).to.be.a(Task);
    });
  });

  describe('#add()', function () {
    it('exists on the instance as a function');
    it('adds a task to the read task queue');
    it('replaces the write task in the task namespace');
  });

  describe('#start()', function () {
    afterEach(function () {
      Watch.collection.splice(0, Watch.collection.length);
    });
    
    it('exists on the instance as a function');
  });

  describe('static members', function () {

    describe('collection', function () {
      afterEach(function () {
        Watch.collection.splice(0, Watch.collection.length);
      });
      it('exists as an Array');
    });
    
    describe('#add()', function () {
      afterEach(function () {
        Watch.collection.splice(0, Watch.collection.length);
      });
      it('exists within Watch as a function');
      it('throw an error if argument is not an instance of Watch');
      it('adds a Watch instance to Watch.collection');
    });

    describe('#find()', function () {
      afterEach(function () {
        Watch.collection.splice(0, Watch.collection.length);
      });
      it('exists within Watch as a function');
      it('throws an error if argument is not an Array');
      it('throws an error if it finds more than one Watch instance with the same pattern');
      it('returns false if no Watch instance was found');
      it('returns a Watch instance');
    });
  });
});
