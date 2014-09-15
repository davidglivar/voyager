var expect = require('expect.js')
  , util = require('util')
  , voyager = require('../voyager');

function cleanObject(obj) {
  for (var key in obj) {
    if (obj.hasOwnProperty(key)) {
      delete obj[key];
    }
  }
  return obj;
}

function clone(obj) {
  var o = {};
  for (var key in obj) {
    if (obj.hasOwnProperty(key)) {
      o[key] = obj[key];
    }
  }
  return o;
}

describe('voyager', function () {

  it('is an object', function () {
    expect(voyager).to.be.an('object');
  });

  describe('tasks_', function () {
    var o;
    beforeEach(function () {
      o = clone(voyager.tasks_);
    });
    afterEach(function () {
      o = cleanObject(o);
    });
    
    it('exists within the voyager namespace an object', function () {
      expect(voyager).to.have.property('tasks_');
      expect(voyager.tasks_).to.be.an('object');
    });

    it('allows properties to be added', function () {
      voyager.tasks_.test = true;
      expect(voyager.tasks_).to.not.eql(o);
      expect(voyager.tasks_.test).to.be(true);
    });

    it('allows properties to be removed', function () {
      voyager.tasks_.toremove = true;
      expect(voyager.tasks_).to.not.eql(o);
      delete voyager.tasks_.toremove;
      expect(voyager.tasks_).to.eql(o);
    });
  });

  describe('#in()', function () {
    
    it('exists within the voyager namespace as a function', function () {
      expect(voyager).to.have.property('in');
      expect(voyager.in).to.be.a('function');
      expect(voyager.in.length).to.be(1);
    });

    it('returns a stream', function () {
      var s = voyager.in('test');
      expect(s).to.be.ok();
      expect(s).to.have.property('on');
      expect(s.on).to.be.a('function');
    });

    describe('#in.src()', function () {

      it('exists within the voyager.in namespace as a function', function () {
        expect(voyager.in).to.have.property('src');
        expect(voyager.in.src).to.be.a('function');
        expect(voyager.in.src.length).to.be(1);
      });

      it('returns a stream', function () {
        var s = voyager.in.src('test');
        expect(s).to.be.ok();
        expect(s).to.have.property('on');
        expect(s.on).to.be.a('function');
      });
    });

    describe('#in.dev()', function () {

      it('exists within the voyager.in namespace as a function', function () {
        expect(voyager.in).to.have.property('dev');
        expect(voyager.in.dev).to.be.a('function');
        expect(voyager.in.dev.length).to.be(1);
      });

      it('returns a stream', function () {
        var s = voyager.in.dev('test');
        expect(s).to.be.ok();
        expect(s).to.have.property('on');
        expect(s.on).to.be.a('function');
      });
    });
  });

  describe('#out()', function () {
    
    it('exists within the voyager namespace as a function', function () {
      expect(voyager).to.have.property('out');
      expect(voyager.out).to.be.a('function');
      expect(voyager.out.length).to.be(1);
    });

    it('returns a stream', function () {
      var s = voyager.out('out_test');
      expect(s).to.be.ok();
      expect(s).to.have.property('on');
      expect(s.on).to.be.a('function');
    });

    describe('#out.bld()', function () {

      it('exists within the voyager.out namespace as a function', function () {
        expect(voyager.out).to.have.property('bld');
        expect(voyager.out.bld).to.be.a('function');
        expect(voyager.out.bld.length).to.be(1);
      });

      it('returns a stream', function () {
        var s = voyager.out.bld('out_test');
        expect(s).to.be.ok();
        expect(s).to.have.property('on');
        expect(s.on).to.be.a('function');
      });
    });

    describe('#out.dev()', function () {

      it('exists within the voyager.out namespace as a function', function () {
        expect(voyager.out).to.have.property('dev');
        expect(voyager.out.dev).to.be.a('function');
        expect(voyager.out.dev.length).to.be(1);
      });

      it('returns a stream', function () {
        var s = voyager.out.dev('out_test');
        expect(s).to.be.ok();
        expect(s).to.have.property('on');
        expect(s.on).to.be.a('function');
      });
    });
  });

  describe('#run()', function () {
    afterEach(function () {
      voyager.tasks_ = cleanObject(voyager.tasks_);
      voyager.namespaces_ = cleanObject(voyager.namespaces_);
    });
    
    it('exists within the voyager namespace as a function', function () {
      expect(voyager).to.have.property('run');
      expect(voyager.run).to.be.a('function');
      expect(voyager.run.length).to.be(1);
    });

    it('runs a registered task', function (done) {
      var flag = false;
      var t = function (cb) {
        flag = true;
        cb();
      };
      voyager.task('flip', t);
      expect(voyager.tasks_).to.have.property('flip');
      voyager.run('flip')
        .then(function () {
          expect(flag).to.be(true);
          done();
        });
    });

    it('runs a registered namespace', function (done) {
      var flag = false;
      var t = function (cb) {
        flag = true;
        cb();
      };
      voyager.task('flip', 'scripts', t);
      voyager.run('scripts')
        .then(function () {
          expect(flag).to.be(true);
          done();
        });
    });
  });

  describe('#task()', function () {
    afterEach(function () {
      voyager.tasks_ = cleanObject(voyager.tasks_);
      voyager.namespaces_ = cleanObject(voyager.namespaces_);
    });

    it('exists within the voyager namespace as a function', function () {
      expect(voyager).to.have.property('task');
      expect(voyager.task).to.be.a('function');
      expect(voyager.task.length).to.be(4);
    });

    it('registers a task given a name and function', function () {
      var func = function () {};
      voyager.task('name', func);
      expect(voyager.tasks_).to.have.property('name');
      expect(voyager.tasks_.name).to.be.a('function');
    });

    it('stores the task id in the given namespace', function () {
      var func = function () {};
      voyager.task('name', ['scripts', 'watch'], func);
      voyager.task('test', 'testing', func);
      expect(voyager.tasks_).to.have.property('name');
      expect(voyager.namespaces_).to.have.property('scripts');
      expect(voyager.namespaces_).to.have.property('watch');
      expect(voyager.namespaces_).to.have.property('testing');
      expect(voyager.namespaces_.scripts.indexOf('name')).to.be(0);
      expect(voyager.namespaces_.watch.indexOf('name')).to.be(0);
      expect(voyager.namespaces_.testing.indexOf('test')).to.be(0);
    });

    it('stores the task id in the default namespace if none provided', function () {
      var func = function () {};
      voyager.task('name', func);
      expect(voyager.tasks_).to.have.property('name');
      expect(voyager.namespaces_).to.have.property('ns');
      expect(voyager.namespaces_.ns.indexOf('name')).to.be(0);
    });
  });
});
