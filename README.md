Voyager (alpha)
===============

A STATIC SITE GENERATOR FROM THE EDGE OF THE SOLAR SYSTEM.

[![wercker status](https://app.wercker.com/status/a6a9346cd1fa1d24d19799d710ddab22/m "wercker status")](https://app.wercker.com/project/bykey/a6a9346cd1fa1d24d19799d710ddab22)

Installation
------------

    $ npm install voyager

What?
-----

Voyager is a static site generator with a built-in task runner.

Why?
----

There are many static site generators out there, many are awesome:
[wintersmith](http://wintersmith.io/), [blacksmith](http://blacksmith.jit.su/),
and Google's [web starter kit](https://developers.google.com/web/starter-kit/)
to name a few. In fact, this project was created and inspired by the above 
projects, along with the [gulp](http://gulpjs.com/) build system.

Getting Started
---------------

Voyager projects have an expected directory structure. To ease this process,
[voyager-generator](https://github.com/davidglivar/voyager-generator) was 
created. The generator is meant to be installed globally.

    $ npm i -g voyager-generator

This will place the `voyager` command in your system path. To create a new
voyager project, you may run the following:

    $ voyager my-project

You will be prompted with some intial questions to help build out your
package.json file as well as some settings. In the above example, a voyager
project skeleton will be created within the `{pwd}/my-project` directory. To
learn more about the generator, check out the 
[README](https://github.com/davidglivar/voyager-generator/blob/develop/README.md)
_(still a work in progress)_.

API
---

**voyager#task**

Register a task with voyager.

    voyager.task('taskname', 'optional-namespace', function (done) {
      // synchronous, async, or streams
      done();
    });
	
Example:

    var voyager = require('voyager')
      , less = require('gulp-less')
      , plumber = require('gulp-plumber')
      , vfs = require('vinyl-fs');

    voyager.task('styles-less', ['styles', 'prebuild'], function (done) {
      vfs.src([
          this.SRC + '/stylesheets/**/*.less'
        , '!' + this.SRC + '/stylesheets/vendor/*'
        ])
        .pipe(plumber())
        .pipe(less())
        .pipe(vfs.dest(this.TMP + '/stylesheets'))
        .on('end', done);
    });
	
It is important to note that you can overwrite voyager's default tasks defined 
in the 'tasks' directory. To add custom tasks, create a 'tasks' directory inside 
your project and include them there. Voyager's tasks are loaded first, then any 
'voyager-*' npm package, and then your custom tasks. You have the final say in 
the end.

**voyager#run**

Run a registered task.

    voyager.run('taskname');
	
Tasks are automatically wrapped in a Promise, so you can chain calls.

    voyager.run('taskname')
      .then(voyager.run.bind(voyager, 'anothertask'))
      .then(function () {
        console.log('done!');
      });

You can also run a series of tasks.

    voyager.run(['one', 'two', 'three']);

License
-------

ISC, see the LICENSE file for details.
