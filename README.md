VOYAGER (alpha)
===============

[![wercker status](https://app.wercker.com/status/a6a9346cd1fa1d24d19799d710ddab22/m "wercker status")](https://app.wercker.com/project/bykey/a6a9346cd1fa1d24d19799d710ddab22)

Voyager is a static site generator with a built-in task runner. It works seamlessly
with all [gulp plugins](http://gulpjs.com/plugins/) for ease of use. Voyager
is not a [gulp](http://gulpjs.com/) or [grunt](http://gruntjs.com/) replacement.
However, if you are in need of building a frontend website with all the heavy
build boilerplate taken care of for you, then voyager is for you.

Installation
------------

    $ npm install voyager

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

"What, no sudo?" - [see this post by Isaac Z. Schlueter](http://howtonode.org/introduction-to-npm)

This will place the `voyager` command in your system path. To create a new
voyager project, you may run the following:

    $ voyager my-project

You will be prompted with some intial questions to help build out your
package.json file as well as some settings. In the above example, a voyager
project skeleton will be created within the `{pwd}/my-project` directory. To
learn more about the generator, check out the 
[README](https://github.com/davidglivar/voyager-generator/blob/develop/README.md)
_(still a work in progress)_.

With a 'fire and forget' mentality, you can add any community created voyager
tasks via npm, and voyager will load them up automatically (make sure they
exist in your dependencies in your project's package.json, otherwise it won't
be so "automatic" and more like "not at all"). Voyager packages must have the
voyager-* naming architecture to be found properly.

For example, I want to use [browserify](http://browserify.org/) and [JSHint](http://www.jshint.com/)
in my next project – after doing the above setup, do the following:

    $ npm i voyager-browserify voyager-jshint --save-dev

Restart your server and you now have browserify and jshint tasks running.

Commands
--------

The [voyager-generator](https://github.com/davidglivar/voyager-generator) package creates some startup commands for you when you create a 
new project. Within your project directory run `npm start` to run the 'read' and
'write' phases, start your static webserver, and begin watching files for changes.
To build the final output, run `npm run build`. This runs all build phases - 'read',
'write', 'build' – and dumps the output into the build directory at the root of your
project. To clean everything out, `npm run clean`.

API
---

**voyager#task**

Register a task with voyager.

    voyager.task('read', 'my-task-name', function (done) {
      // synchronous, asynchronous, or streamed
      done();
    });

Example:

    var voyager = require('voyager')
      , less = require('gulp-less')
      , plumber = require('gulp-plumber')
      , vfs = require('vinyl-fs');

    voyager.task('write', 'less', function (done) {
      this.src(['stylesheets/**/*.less', '!stylesheets/vendor/**'])
        .pipe(plumber())
        .pipe(less())
        .pipe(this.out('stylesheets'))
        .on('end', done);
    });

    voyager.watch(['stylesheets/**/*.less', '!stylesheets/vendor/**'], 'less');

Voyager works seamlessly with all [gulp plugins](http://gulpjs.com/plugins/).
	
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

Or, you can choose to run specific phases of the build.

    voyager.run(['read', 'write']);

License
-------

ISC, see the LICENSE file for details.
