var expect = require('expect.js')
  , Task = require('../lib/task')
  , voyager = require('../voyager')
  , Watch = require('../lib/watch');

describe('Watch', function () {
  
  beforeEach(function () {
    Task.collection.splice(0, Task.collection.length);
    Watch.collection.splice(0, Watch.collection.length);
  });

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
    var w;
    beforeEach(function () {
      voyager.task('read', 'test-read', function (d) { d(); });
      voyager.task('write', 'test-write', function (d) { d(); });
      w = new Watch('*.js', 'test-write');
    });
    afterEach(function () {
      w = null;
    });

    it('exists on the instance as a function', function () {
      expect(w).to.have.property('add');
      expect(w.add).to.be.a('function');
      expect(w.add.length).to.be(1);
    });

    it('adds a task to the read task queue', function () {
      expect(w.tasks.write instanceof Task).to.be(true);
      expect(w.tasks.read.length).to.be(0);
      w.add('test-read');
      expect(w.tasks.read.length).to.be(1);
      expect(w.tasks.read[0] instanceof Task).to.be(true);
    });

    it('does not add a task to the read task queue if it already exists', function () {
      w.add('test-read');
      expect(w.tasks.read.length).to.be(1);
      w.add('test-read');
      expect(w.tasks.read.length).to.be(1);
    });

    it('replaces the write task in the task namespace', function () {
      voyager.task('write', 'test-write-b', function (d) { d(); });
      expect(w.tasks.write instanceof Task).to.be(true);
      expect(w.tasks.write.name).to.be('test-write');
      w.add('test-write-b');
      expect(w.tasks.write instanceof Task).to.be(true);
      expect(w.tasks.write.name).to.be('test-write-b');
    });
  });

  describe('#start()', function () {
    var w;
    beforeEach(function () {
      w = new Watch('*.js', 'test-write');
    });
    afterEach(function () {
      w = null;
    });
    
    it('exists on the instance as a function', function () {
      expect(w).to.have.property('start');
      expect(w.start).to.be.a('function');
      expect(w.start.length).to.be(0);
    });
  });

  describe('static members', function () {

    describe('collection', function () {

      it('exists as an Array', function () {
        expect(Watch).to.have.property('collection');              
        expect(Watch.collection).to.be.an('array');
        expect(Watch.collection.length).to.be(0);
      });
    });
    
    describe('#add()', function () {

      it('exists within Watch as a function', function () {
        expect(Watch).to.have.property('add');      
        expect(Watch.add).to.be.a('function');
        expect(Watch.add.length).to.be(1);
      });

      it('throw an error if argument is not an instance of Watch', function () {
        var f = function () {
          Watch.add(true);
        };
        expect(f).to.throwError();
      });

      it('adds a Watch instance to Watch.collection', function () {
        expect(Watch.collection.length).to.be(0);
        Watch.add(new Watch('*.js', 'test'));
        expect(Watch.collection.length).to.be(1);
        expect(Watch.collection[0] instanceof Watch).to.be(true);
      });
    });

    describe('#find()', function () {

      it('exists within Watch as a function', function () {
        expect(Watch).to.have.property('find');
        expect(Watch.find).to.be.a('function');
        expect(Watch.find.length).to.be(1);
      });

      it('throws an error if argument is not an Array', function () {
        var f = function () {
          Watch.find('string');
        };
        expect(f).to.throwError();
      });

      it('throws an error if it finds more than one Watch instance with the same pattern', function () {
        Watch.add(new Watch('*.js', 'test'));
        Watch.add(new Watch('*.js', 'test-again'));
        var f = function () {
          return Watch.find(['*.js']);
        };
        expect(f).to.throwError('Multiple watch instances with the same patterns');
      });

      it('returns false if no Watch instance was found', function () {
        var result = Watch.find(['*.js']);
        expect(result).to.be(false);
      });

      it('returns a Watch instance', function () {
        Watch.add(new Watch(['*.js'], 'test'));
        Watch.add(new Watch(['*.js', '*.html'], 'test-many'));
        var result = Watch.find(['*.js']);
        expect(result).to.be.ok();
        expect(result instanceof Watch).to.be(true);
        result = Watch.find(['*.html']);
        expect(result).to.be(false);
        result = Watch.find(['*.html', '*.js']);
        expect(result).to.be.ok();
        expect(result instanceof Watch).to.be(true);
      });
    });
  });
});
